import { Order } from '../orders/order.model.js';
import { CreatorProfile } from './creator.model.js';
import { Template } from '../templates/template.model.js';
import { Withdrawal } from '../withdrawals/withdrawal.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class EarningsService {
  /**
   * Get creator's earnings summary.
   */
  async getEarningsSummary(userId) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    // Get all paid orders that include this creator's templates
    const orders = await Order.find({
      status: 'paid',
      'items.creatorId': userId,
    }).lean();

    let totalEarnings = 0;
    let totalPlatformFees = 0;
    let totalSales = 0;

    for (const order of orders) {
      for (const item of order.items) {
        if (item.creatorId?.toString() === userId.toString()) {
          totalEarnings += item.creatorPayout || 0;
          totalPlatformFees += item.platformFee || 0;
          totalSales++;
        }
      }
    }

    // Monthly earnings breakdown (last 12 months)
    const monthlyEarnings = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      let monthTotal = 0;
      let monthSales = 0;
      for (const order of orders) {
        const orderDate = new Date(order.paidAt || order.createdAt);
        if (orderDate >= monthStart && orderDate <= monthEnd) {
          for (const item of order.items) {
            if (item.creatorId?.toString() === userId.toString()) {
              monthTotal += item.creatorPayout || 0;
              monthSales++;
            }
          }
        }
      }

      monthlyEarnings.push({
        month: monthStart.toISOString().slice(0, 7), // "2026-02"
        earnings: Math.round(monthTotal * 100) / 100,
        sales: monthSales,
      });
    }

    // Top earning templates
    const templateEarnings = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (item.creatorId?.toString() === userId.toString() && item.templateId) {
          const tid = item.templateId.toString();
          if (!templateEarnings[tid]) {
            templateEarnings[tid] = { templateId: tid, title: item.title, earnings: 0, sales: 0 };
          }
          templateEarnings[tid].earnings += item.creatorPayout || 0;
          templateEarnings[tid].sales++;
        }
      }
    }

    const topTemplates = Object.values(templateEarnings)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10)
      .map(t => ({ ...t, earnings: Math.round(t.earnings * 100) / 100 }));

    const withdrawnAgg = await Withdrawal.aggregate([
      { $match: { creatorId: userId, status: { $in: ['pending', 'approved', 'processing', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalWithdrawn = withdrawnAgg[0]?.total || 0;
    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalPlatformFees: Math.round(totalPlatformFees * 100) / 100,
      totalSales,
      totalWithdrawn: Math.round(totalWithdrawn * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
      monthlyEarnings,
      topTemplates,
    };
  }

  /**
   * Get recent transactions for a creator.
   */
  async getTransactions(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const orders = await Order.find({
      status: 'paid',
      'items.creatorId': userId,
    })
      .sort({ paidAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('buyerId', 'name')
      .lean();

    const total = await Order.countDocuments({
      status: 'paid',
      'items.creatorId': userId,
    });

    const transactions = orders.map(order => {
      const creatorItems = order.items.filter(
        i => i.creatorId?.toString() === userId.toString()
      );
      const earnings = creatorItems.reduce((sum, i) => sum + (i.creatorPayout || 0), 0);

      return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyer: order.buyerId?.name || 'Unknown',
        items: creatorItems.map(i => ({ title: i.title, price: i.price, payout: i.creatorPayout })),
        totalEarnings: Math.round(earnings * 100) / 100,
        date: order.paidAt || order.createdAt,
      };
    });

    return {
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
