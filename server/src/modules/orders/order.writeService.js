import { Order } from './order.model.js';
import { Template } from '../templates/template.model.js';
import { ServicePackage } from '../services/service.model.js';
import { License } from '../downloads/license.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class OrderWriteService {
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

        const platformFee = servicePackage.price * 0.20;
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

    eventBus.emit(EVENTS.ORDER_CREATED, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      buyerId: buyerId.toString(),
      total: order.total,
      itemCount: orderItems.length,
    });

    return order;
  }

  async mockCheckout(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, buyerId: userId });
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    order.status = 'paid';
    order.paymentMethod = 'mock';
    order.paidAt = new Date();
    await order.save();

    for (const item of order.items) {
      if (item.type === 'template') {
        await License.create({
          templateId: item.templateId,
          orderId: order._id,
          buyerId: order.buyerId,
          licenseType: 'personal'
        });

        await Template.findByIdAndUpdate(item.templateId, {
          $inc: {
            'stats.purchases': 1,
            'stats.revenue': item.price
          }
        });
      }
    }

    eventBus.emit(EVENTS.ORDER_PAID, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      buyerId: order.buyerId.toString(),
      total: order.total,
      itemCount: order.items.length,
      items: order.items.map(i => ({
        type: i.type,
        templateId: i.templateId?.toString(),
        creatorId: i.creatorId?.toString(),
        price: i.price,
      })),
    });

    return order;
  }
}
