import { Refund } from './refund.model.js';

export class RefundQueryService {
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
