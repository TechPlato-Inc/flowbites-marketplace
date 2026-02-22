import { Refund } from './refund.model.js';
import { Order } from '../orders/order.model.js';
import { License } from '../downloads/license.model.js';
import { User } from '../users/user.model.js';
import { stripe, isDemoMode } from '../../config/stripe.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendRefundApproved, sendRefundRejected } from '../../services/email.js';
import { AuditLog } from '../audit/auditLog.model.js';

const notificationService = new NotificationService();

export class RefundService {
  /**
   * Buyer requests a refund for an order.
   */
  async requestRefund(buyerId, orderId, reason) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.buyerId.toString() !== buyerId.toString()) {
      throw new AppError('You can only request refunds for your own orders', 403);
    }
    if (order.status !== 'paid') {
      throw new AppError('Only paid orders can be refunded', 400);
    }

    // Check if refund already exists
    const existing = await Refund.findOne({ orderId });
    if (existing) {
      throw new AppError('A refund request already exists for this order', 400);
    }

    // Check refund window (14 days)
    const daysSincePurchase = (Date.now() - new Date(order.paidAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSincePurchase > 14) {
      throw new AppError('Refund window has expired (14 days after purchase)', 400);
    }

    const refund = await Refund.create({
      orderId,
      buyerId,
      reason,
      amount: order.total,
    });

    return refund;
  }

  /**
   * Admin approves and processes a refund via Stripe.
   */
  async approveRefund(adminId, refundId) {
    const refund = await Refund.findById(refundId);
    if (!refund) throw new AppError('Refund request not found', 404);
    if (refund.status !== 'requested') {
      throw new AppError('This refund has already been processed', 400);
    }

    const order = await Order.findById(refund.orderId);
    if (!order) throw new AppError('Order not found', 404);

    // Process Stripe refund
    if (!isDemoMode && stripe && order.stripeChargeId) {
      try {
        const stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripeChargeId,
          amount: Math.round(refund.amount * 100),
        });
        refund.stripeRefundId = stripeRefund.id;
      } catch (err) {
        throw new AppError(`Stripe refund failed: ${err.message}`, 500);
      }
    } else {
      console.log(`[DEMO MODE] Refund of $${refund.amount} processed for order ${order.orderNumber}`);
    }

    // Update refund status
    refund.status = 'processed';
    refund.processedBy = adminId;
    refund.processedAt = new Date();
    await refund.save();

    // Update order status
    order.status = 'refunded';
    await order.save();

    // Deactivate licenses for this order
    await License.updateMany(
      { orderId: order._id },
      { isActive: false }
    );

    // Notify buyer (non-blocking)
    notificationService.notifyRefundApproved(refund.buyerId, order.orderNumber, refund.amount).catch(err =>
      console.error('Failed to send refund approved notification:', err)
    );

    // Send refund approved email (non-blocking)
    User.findById(refund.buyerId).then(user => {
      if (user) sendRefundApproved(user.email, user.name, order.orderNumber, refund.amount);
    }).catch(err => console.error('Failed to send refund approved email:', err));

    // Audit log (non-blocking)
    AuditLog.create({
      adminId, action: 'refund_approved', targetType: 'refund', targetId: refundId,
      details: { amount: refund.amount, orderNumber: order.orderNumber },
    }).catch(() => {});

    return refund;
  }

  /**
   * Admin rejects a refund request.
   */
  async rejectRefund(adminId, refundId, adminNote) {
    const refund = await Refund.findById(refundId);
    if (!refund) throw new AppError('Refund request not found', 404);
    if (refund.status !== 'requested') {
      throw new AppError('This refund has already been processed', 400);
    }

    refund.status = 'rejected';
    refund.adminNote = adminNote || 'Refund request denied';
    refund.processedBy = adminId;
    refund.processedAt = new Date();
    await refund.save();

    // Notify buyer (non-blocking)
    const order = await Order.findById(refund.orderId);
    notificationService.notifyRefundRejected(
      refund.buyerId,
      order?.orderNumber || 'Unknown',
      refund.adminNote
    ).catch(err => console.error('Failed to send refund rejected notification:', err));

    // Send refund rejected email (non-blocking)
    User.findById(refund.buyerId).then(user => {
      if (user) sendRefundRejected(user.email, user.name, order?.orderNumber || 'Unknown', refund.adminNote);
    }).catch(err => console.error('Failed to send refund rejected email:', err));

    // Audit log (non-blocking)
    AuditLog.create({
      adminId, action: 'refund_rejected', targetType: 'refund', targetId: refundId,
      details: { amount: refund.amount, reason: adminNote },
    }).catch(() => {});

    return refund;
  }

  /**
   * Get refund requests (admin view).
   */
  async getRefunds({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;

    const [refunds, total] = await Promise.all([
      Refund.find(filter)
        .populate('buyerId', 'name email')
        .populate('orderId', 'orderNumber total items')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Refund.countDocuments(filter),
    ]);

    return {
      refunds,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get refund status for a specific order (buyer view).
   */
  async getRefundByOrder(buyerId, orderId) {
    const refund = await Refund.findOne({ orderId, buyerId }).lean();
    return refund;
  }
}
