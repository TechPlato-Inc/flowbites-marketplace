import { Withdrawal } from './withdrawal.model.js';
import { Order } from '../orders/order.model.js';
import { toWithdrawalDTO, toAdminWithdrawalDTO } from './dto/withdrawal.dto.js';

export class WithdrawalQueryService {
  /**
   * Get available balance for a creator.
   */
  async getBalance(creatorId) {
    // Total earnings from paid orders
    const earningsAgg = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $unwind: '$items' },
      { $match: { 'items.creatorId': creatorId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: { $ifNull: ['$items.creatorPayout', 0] } },
        },
      },
    ]);

    const totalEarnings = earningsAgg[0]?.totalEarnings || 0;

    // Total already withdrawn or pending withdrawal
    const withdrawnAgg = await Withdrawal.aggregate([
      { $match: { creatorId, status: { $in: ['pending', 'approved', 'processing', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalWithdrawn = withdrawnAgg[0]?.total || 0;
    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
      pendingWithdrawals: await Withdrawal.countDocuments({ creatorId, status: 'pending' }),
    };
  }

  /**
   * Get withdrawal history for a creator.
   */
  async getMyWithdrawals(creatorId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find({ creatorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments({ creatorId }),
    ]);

    return {
      withdrawals: withdrawals.map(toWithdrawalDTO),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all withdrawal requests (admin).
   */
  async getAllWithdrawals({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const query = {};
    if (status) query.status = status;

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .populate('creatorId', 'name email avatar')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Withdrawal.countDocuments(query),
    ]);

    return {
      withdrawals: withdrawals.map(toAdminWithdrawalDTO),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
