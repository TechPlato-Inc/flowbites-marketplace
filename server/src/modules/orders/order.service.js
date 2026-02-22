import { Order } from './order.model.js';
import { Template } from '../templates/template.model.js';
import { ServicePackage } from '../services/service.model.js';
import { License } from '../downloads/license.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class OrderService {
  async createOrder(buyerId, items, buyerEmail) {
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      if (item.type === 'template') {
        const template = await Template.findById(item.templateId);
        if (!template || template.status !== 'approved') {
          throw new AppError('Template not available', 400);
        }

        const platformFee = template.price * (parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT) / 100);
        orderItems.push({
          type: 'template',
          templateId: template._id,
          title: template.title,
          price: template.price,
          creatorId: template.creatorId,
          platformFee,
          creatorPayout: template.price - platformFee
        });
        subtotal += template.price;
      } else if (item.type === 'service') {
        const servicePackage = await ServicePackage.findById(item.servicePackageId);
        if (!servicePackage || !servicePackage.isActive) {
          throw new AppError('Service package not available', 400);
        }

        const platformFee = servicePackage.price * 0.20; // 20% for services
        orderItems.push({
          type: 'service',
          servicePackageId: servicePackage._id,
          templateId: servicePackage.templateId,
          title: servicePackage.name,
          price: servicePackage.price,
          creatorId: servicePackage.creatorId,
          platformFee,
          creatorPayout: servicePackage.price - platformFee
        });
        subtotal += servicePackage.price;
      }
    }

    const order = await Order.create({
      buyerId,
      items: orderItems,
      subtotal,
      total: subtotal,
      buyerEmail,
      status: 'pending'
    });

    return order;
  }

  async mockCheckout(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, buyerId: userId });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Mark as paid
    order.status = 'paid';
    order.paymentMethod = 'mock';
    order.paidAt = new Date();
    await order.save();

    // Create licenses for templates
    for (const item of order.items) {
      if (item.type === 'template') {
        await License.create({
          templateId: item.templateId,
          orderId: order._id,
          buyerId: order.buyerId,
          licenseType: 'personal'
        });

        // Update template stats
        await Template.findByIdAndUpdate(item.templateId, {
          $inc: {
            'stats.purchases': 1,
            'stats.revenue': item.price
          }
        });
      }
    }

    return order;
  }

  async getOrdersByUser(buyerId) {
    const orders = await Order.find({ buyerId })
      .sort({ createdAt: -1 })
      .populate('items.templateId', 'title thumbnail');
    return orders;
  }

  async getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, buyerId: userId })
      .populate('items.templateId', 'title thumbnail');
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return order;
  }
}
