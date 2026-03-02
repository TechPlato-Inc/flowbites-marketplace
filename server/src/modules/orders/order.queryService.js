import { Order } from './order.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { toOrderSummaryDTO, toOrderDetailDTO } from './dto/orderSummary.dto.js';

export class OrderQueryService {
  async getOrdersByUser(buyerId, filters = {}) {
    const { status, sort = 'newest', page = 1, limit = 20 } = filters;

    const query = { buyerId };
    if (status) query.status = status;

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
    };

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(limit)
        .populate('items.templateId', 'title thumbnail slug'),
      Order.countDocuments(query),
    ]);

    return {
      orders: orders.map(toOrderSummaryDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, buyerId: userId })
      .populate('items.templateId', 'title thumbnail slug');
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    return toOrderDetailDTO(order);
  }
}
