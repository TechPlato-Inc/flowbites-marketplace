import { ServicePackage, ServiceOrder } from './service.model.js';
import { Template } from '../templates/template.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';
import { NotificationService } from '../notifications/notification.service.js';

const notificationService = new NotificationService();

// Helper: push an activity log entry onto an order
function logActivity(order, action, performedBy, details = '') {
  order.activityLog.push({ action, performedBy, details, createdAt: new Date() });
}

export class ServiceService {
  async createPackage(creatorId, data) {
    const template = await Template.findOne({ _id: data.templateId, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    const servicePackage = await ServicePackage.create({
      ...data,
      creatorId
    });

    return servicePackage;
  }

  async getAllPackages(filters = {}) {
    const { category, creatorId, q, page = 1, limit = 24 } = filters;
    const query = { isActive: true };

    if (category) query.category = category;
    if (creatorId) query.creatorId = creatorId;
    if (q) {
      const safeQuery = escapeRegex(q);
      query.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [packages, total] = await Promise.all([
      ServicePackage.find(query)
        .sort({ 'stats.completed': -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title slug thumbnail'),
      ServicePackage.countDocuments(query)
    ]);

    return {
      packages,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) }
    };
  }

  async getPackageBySlug(slug) {
    const pkg = await ServicePackage.findOne({ slug, isActive: true })
      .populate('creatorId', 'name avatar email')
      .populate('templateId', 'title slug thumbnail price platform');
    if (!pkg) throw new AppError('Service not found', 404);
    return pkg;
  }

  async getPackagesByTemplate(templateId) {
    const packages = await ServicePackage.find({ templateId, isActive: true });
    return packages;
  }

  async getCreatorPackages(creatorId) {
    const packages = await ServicePackage.find({ creatorId })
      .sort({ createdAt: -1 })
      .populate('templateId', 'title slug');
    return packages;
  }

  async createServiceOrder(buyerId, packageId, requirements, attachments = []) {
    const servicePackage = await ServicePackage.findById(packageId);
    if (!servicePackage || !servicePackage.isActive) {
      throw new AppError('Service package not available', 400);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + servicePackage.deliveryDays);

    const platformFee = servicePackage.price * 0.20;

    const order = await ServiceOrder.create({
      packageId,
      buyerId,
      creatorId: servicePackage.creatorId,
      templateId: servicePackage.templateId,
      packageName: servicePackage.name,
      price: servicePackage.price,
      deliveryDays: servicePackage.deliveryDays,
      revisions: servicePackage.revisions,
      requirements,
      attachments,
      dueDate,
      platformFee,
      creatorPayout: servicePackage.price - platformFee,
      activityLog: [{ action: 'order_created', performedBy: buyerId, details: 'Order placed', createdAt: new Date() }]
    });

    // Increment package order count
    await ServicePackage.findByIdAndUpdate(packageId, {
      $inc: { 'stats.orders': 1 }
    });

    // Notify creator of new order
    const buyer = await User.findById(buyerId).select('name').lean();
    notificationService.notifyServiceOrderCreated(
      servicePackage.creatorId, order._id, servicePackage.name, buyer?.name || 'A buyer'
    ).catch(err => console.error('Failed to send service order notification:', err));

    return order;
  }

  async getOrderById(orderId, userId) {
    const order = await ServiceOrder.findOne({
      _id: orderId,
      $or: [{ buyerId: userId }, { creatorId: userId }, { assignedCreatorId: userId }]
    })
      .populate('buyerId', 'name avatar')
      .populate('creatorId', 'name avatar')
      .populate('assignedCreatorId', 'name avatar')
      .populate('packageId', 'name description')
      .populate('activityLog.performedBy', 'name')
      .populate('dispute.openedBy', 'name')
      .populate('dispute.resolvedBy', 'name');
    if (!order) throw new AppError('Order not found or unauthorized', 404);
    return order;
  }

  async sendMessage(orderId, userId, message) {
    const order = await ServiceOrder.findOne({
      _id: orderId,
      $or: [{ buyerId: userId }, { creatorId: userId }, { assignedCreatorId: userId }]
    });
    if (!order) throw new AppError('Order not found or unauthorized', 404);

    order.messages.push({ senderId: userId, message });
    await order.save();

    return order;
  }

  async updateOrderStatus(orderId, creatorId, status, data = {}) {
    const order = await ServiceOrder.findOne({
      _id: orderId,
      $or: [{ creatorId }, { assignedCreatorId: creatorId }]
    });
    if (!order) {
      throw new AppError('Service order not found or unauthorized', 404);
    }

    const prevStatus = order.status;
    order.status = status;

    if (status === 'accepted') {
      order.acceptedAt = new Date();
      logActivity(order, 'status_accepted', creatorId, 'Order accepted by creator');
      notificationService.notifyServiceOrderAccepted(order.buyerId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    } else if (status === 'in_progress') {
      logActivity(order, 'status_in_progress', creatorId, 'Creator started working');
      notificationService.notifyServiceOrderInProgress(order.buyerId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    } else if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.deliveryFiles = data.deliveryFiles || [];
      order.deliveryNote = data.deliveryNote;
      logActivity(order, 'status_delivered', creatorId, 'Work delivered');
      notificationService.notifyServiceOrderDelivered(order.buyerId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    } else if (status === 'completed') {
      order.completedAt = new Date();
      order.paymentReleased = true;
      logActivity(order, 'status_completed', creatorId, 'Order marked complete');

      // Update package stats
      await ServicePackage.findByIdAndUpdate(order.packageId, {
        $inc: {
          'stats.completed': 1,
          'stats.revenue': order.price
        }
      });
      notificationService.notifyServiceOrderCompleted(order.buyerId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    } else if (status === 'rejected') {
      logActivity(order, 'status_rejected', creatorId, 'Order rejected by creator');
      notificationService.notifyServiceOrderRejected(order.buyerId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    } else {
      logActivity(order, `status_${status}`, creatorId, `Status changed from ${prevStatus} to ${status}`);
    }

    await order.save();
    return order;
  }

  async updateOrderStatusByBuyer(orderId, buyerId, status) {
    const order = await ServiceOrder.findOne({ _id: orderId, buyerId });
    if (!order) {
      throw new AppError('Service order not found or unauthorized', 404);
    }

    if (status === 'revision_requested' && order.status !== 'delivered') {
      throw new AppError('Can only request revision on delivered orders', 400);
    }
    if (status === 'revision_requested' && order.revisions > 0 && order.revisionsUsed >= order.revisions) {
      throw new AppError(`All ${order.revisions} revisions have been used`, 400);
    }
    if (status === 'completed' && order.status !== 'delivered') {
      throw new AppError('Can only complete delivered orders', 400);
    }

    order.status = status;
    if (status === 'revision_requested') {
      order.revisionsUsed = (order.revisionsUsed || 0) + 1;
      logActivity(order, 'revision_requested', buyerId, `Revision ${order.revisionsUsed}${order.revisions > 0 ? `/${order.revisions}` : ''} requested`);
      notificationService.notifyServiceOrderRevision(order.creatorId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    }
    if (status === 'completed') {
      order.completedAt = new Date();
      order.paymentReleased = true;
      logActivity(order, 'status_completed', buyerId, 'Buyer accepted delivery');

      await ServicePackage.findByIdAndUpdate(order.packageId, {
        $inc: {
          'stats.completed': 1,
          'stats.revenue': order.price
        }
      });
      notificationService.notifyServiceOrderCompleted(order.creatorId, order._id, order.packageName)
        .catch(err => console.error('Notification error:', err));
    }

    await order.save();
    return order;
  }

  // -------------------------------------------------------------------------
  // Cancel Order (buyer or creator)
  // -------------------------------------------------------------------------
  async cancelOrder(orderId, userId, reason) {
    const order = await ServiceOrder.findOne({
      _id: orderId,
      $or: [{ buyerId: userId }, { creatorId: userId }, { assignedCreatorId: userId }]
    });
    if (!order) throw new AppError('Order not found or unauthorized', 404);

    const terminalStatuses = ['completed', 'cancelled', 'rejected'];
    if (terminalStatuses.includes(order.status)) {
      throw new AppError(`Cannot cancel an order that is already ${order.status}`, 400);
    }
    if (order.status === 'disputed') {
      throw new AppError('Cannot cancel a disputed order. Wait for admin resolution.', 400);
    }

    order.status = 'cancelled';
    logActivity(order, 'order_cancelled', userId, reason || 'Order cancelled');
    await order.save();

    // Notify the other party
    const otherUserId = userId.toString() === order.buyerId.toString()
      ? order.creatorId
      : order.buyerId;
    notificationService.notifyServiceOrderCancelled(otherUserId, order._id, order.packageName, reason)
      .catch(err => console.error('Notification error:', err));

    return order;
  }

  // -------------------------------------------------------------------------
  // Open Dispute (buyer only, on active/delivered orders)
  // -------------------------------------------------------------------------
  async openDispute(orderId, buyerId, reason) {
    const order = await ServiceOrder.findOne({ _id: orderId, buyerId });
    if (!order) throw new AppError('Order not found or unauthorized', 404);

    const allowedStatuses = ['delivered', 'revision_requested', 'in_progress'];
    if (!allowedStatuses.includes(order.status)) {
      throw new AppError('Can only open a dispute on active or delivered orders', 400);
    }
    if (order.dispute && order.dispute.openedAt) {
      throw new AppError('A dispute is already open on this order', 400);
    }

    order.status = 'disputed';
    order.dispute = {
      reason,
      openedBy: buyerId,
      openedAt: new Date()
    };
    logActivity(order, 'dispute_opened', buyerId, reason);
    await order.save();

    // Notify creator about the dispute
    notificationService.notifyServiceOrderDisputed(order.creatorId, order._id, order.packageName)
      .catch(err => console.error('Notification error:', err));

    return order;
  }

  // -------------------------------------------------------------------------
  // Admin: Resolve Dispute
  // -------------------------------------------------------------------------
  async resolveDispute(orderId, adminId, resolution, outcome) {
    const order = await ServiceOrder.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'disputed') {
      throw new AppError('Order is not in disputed state', 400);
    }

    const validOutcomes = ['refund', 'release_payment', 'partial_refund', 'redo'];
    if (!validOutcomes.includes(outcome)) {
      throw new AppError('Invalid dispute outcome', 400);
    }

    order.dispute.resolution = resolution;
    order.dispute.resolvedBy = adminId;
    order.dispute.resolvedAt = new Date();
    order.dispute.outcome = outcome;

    if (outcome === 'refund') {
      order.status = 'cancelled';
      order.paymentReleased = false;
      logActivity(order, 'dispute_resolved', adminId, `Full refund — ${resolution}`);
    } else if (outcome === 'release_payment') {
      order.status = 'completed';
      order.completedAt = new Date();
      order.paymentReleased = true;
      logActivity(order, 'dispute_resolved', adminId, `Payment released to creator — ${resolution}`);
    } else if (outcome === 'partial_refund') {
      order.status = 'completed';
      order.completedAt = new Date();
      order.paymentReleased = true;
      logActivity(order, 'dispute_resolved', adminId, `Partial refund — ${resolution}`);
    } else if (outcome === 'redo') {
      order.status = 'in_progress';
      logActivity(order, 'dispute_resolved', adminId, `Creator must redo — ${resolution}`);
    }

    await order.save();

    // Notify both parties about dispute resolution
    const outcomeLabels = { refund: 'full refund', release_payment: 'payment released to creator', partial_refund: 'partial refund', redo: 'creator must redo the work' };
    const outcomeLabel = outcomeLabels[outcome] || outcome;
    notificationService.notifyServiceDisputeResolved(order.buyerId, order._id, order.packageName, outcomeLabel)
      .catch(err => console.error('Notification error:', err));
    notificationService.notifyServiceDisputeResolved(order.creatorId, order._id, order.packageName, outcomeLabel)
      .catch(err => console.error('Notification error:', err));

    return ServiceOrder.findById(orderId)
      .populate('buyerId', 'name email avatar')
      .populate('creatorId', 'name email')
      .populate('assignedCreatorId', 'name email')
      .populate('dispute.openedBy', 'name')
      .populate('dispute.resolvedBy', 'name');
  }

  async getCreatorOrders(creatorId, status = null) {
    const query = {
      $or: [{ creatorId }, { assignedCreatorId: creatorId }]
    };
    if (status) query.status = status;

    const orders = await ServiceOrder.find(query)
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email avatar')
      .populate('assignedCreatorId', 'name avatar')
      .populate('templateId', 'title');

    return orders;
  }

  async getBuyerOrders(buyerId) {
    const orders = await ServiceOrder.find({ buyerId })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'name avatar')
      .populate('assignedCreatorId', 'name avatar')
      .populate('templateId', 'title thumbnail');

    return orders;
  }

  // -------------------------------------------------------------------------
  // Generic Customization Request (no pre-existing service package)
  // Buyer requests customization → goes to Flowbites admin for assignment
  // -------------------------------------------------------------------------
  async createGenericCustomizationRequest(buyerId, templateId, requirements, attachments = []) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Find the admin user to act as initial "creator" (Flowbites team)
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      throw new AppError('No admin available to handle requests', 500);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Default 7-day estimate

    const order = await ServiceOrder.create({
      packageId: null,
      buyerId,
      creatorId: admin._id,
      templateId,
      packageName: `Custom: ${template.title}`,
      price: 0, // To be quoted by admin/assigned creator
      deliveryDays: 7,
      revisions: 2,
      requirements,
      attachments,
      dueDate,
      platformFee: 0,
      creatorPayout: 0,
      isGenericRequest: true,
      status: 'requested',
      activityLog: [{ action: 'order_created', performedBy: buyerId, details: 'Custom request submitted', createdAt: new Date() }]
    });

    return order;
  }

  // -------------------------------------------------------------------------
  // Admin: get all service orders (for assignment panel)
  // -------------------------------------------------------------------------
  async getAllServiceOrders(filters = {}) {
    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.isGenericRequest !== undefined) query.isGenericRequest = filters.isGenericRequest;
    if (filters.unassigned) {
      query.isGenericRequest = true;
      query.assignedCreatorId = null;
    }

    const orders = await ServiceOrder.find(query)
      .sort({ createdAt: -1 })
      .populate('buyerId', 'name email avatar')
      .populate('creatorId', 'name email')
      .populate('assignedCreatorId', 'name email')
      .populate('templateId', 'title slug thumbnail')
      .populate('dispute.openedBy', 'name');

    return orders;
  }

  // -------------------------------------------------------------------------
  // Admin: reassign a service order to a different creator
  // -------------------------------------------------------------------------
  async reassignOrder(orderId, assignedCreatorId, adminId, price = null) {
    const order = await ServiceOrder.findById(orderId);
    if (!order) {
      throw new AppError('Service order not found', 404);
    }

    // Verify the assigned creator exists and is a creator/admin
    const creator = await User.findById(assignedCreatorId);
    if (!creator || (creator.role !== 'creator' && creator.role !== 'admin')) {
      throw new AppError('Invalid creator', 400);
    }

    order.assignedCreatorId = assignedCreatorId;
    logActivity(order, 'creator_assigned', adminId, `Assigned to ${creator.name}`);

    // If admin sets a price (for generic requests)
    if (price !== null && price > 0) {
      order.price = price;
      const platformFee = price * 0.30;
      order.platformFee = platformFee;
      order.creatorPayout = price - platformFee;
      logActivity(order, 'price_set', adminId, `Price set to $${price}`);
    }

    // Move to accepted if it was just requested
    if (order.status === 'requested') {
      order.status = 'accepted';
      order.acceptedAt = new Date();
      logActivity(order, 'status_accepted', adminId, 'Order accepted by admin');
    }

    await order.save();

    return ServiceOrder.findById(orderId)
      .populate('buyerId', 'name email avatar')
      .populate('creatorId', 'name email')
      .populate('assignedCreatorId', 'name email')
      .populate('templateId', 'title slug thumbnail');
  }

  // -------------------------------------------------------------------------
  // Get available creators for admin assignment dropdown
  // -------------------------------------------------------------------------
  async getAvailableCreators() {
    const creators = await User.find({ role: { $in: ['creator', 'admin'] } })
      .select('name email role')
      .sort({ name: 1 });
    return creators;
  }
}
