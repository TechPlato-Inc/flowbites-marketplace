import { Withdrawal } from './withdrawal.model.js';
import { Order } from '../orders/order.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuditLog } from '../audit/auditLog.model.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendWithdrawalApproved, sendWithdrawalRejected, sendPayoutProcessed } from '../../services/email.js';

const notificationService = new NotificationService();

const MIN_WITHDRAWAL = 10;

export class WithdrawalService {
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
   * Request a withdrawal.
   */
  async requestWithdrawal(creatorId, { amount, payoutMethod, note }) {
    const requestedAmount = Number(amount);
    if (!Number.isFinite(requestedAmount)) {
      throw new AppError('Invalid withdrawal amount', 400);
    }

    if (requestedAmount < MIN_WITHDRAWAL) {
      throw new AppError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`, 400);
    }

    // Check available balance
    const balance = await this.getBalance(creatorId);
    if (requestedAmount > balance.availableBalance) {
      throw new AppError('Insufficient balance', 400);
    }

    // Check for pending withdrawals
    const pendingCount = await Withdrawal.countDocuments({ creatorId, status: 'pending' });
    if (pendingCount > 0) {
      throw new AppError('You already have a pending withdrawal request', 400);
    }

    try {
      const withdrawal = await Withdrawal.create({
        creatorId,
        amount: requestedAmount,
        payoutMethod: payoutMethod || 'stripe_connect',
        note,
      });

      return withdrawal;
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError('You already have a pending withdrawal request', 400);
      }
      throw error;
    }
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
      withdrawals,
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
      withdrawals,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Approve a withdrawal request (admin).
   */
  async approveWithdrawal(withdrawalId, adminId) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);

    if (withdrawal.status !== 'pending') {
      throw new AppError(`Cannot approve a ${withdrawal.status} withdrawal`, 400);
    }

    withdrawal.status = 'approved';
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    AuditLog.create({
      adminId,
      action: 'withdrawal_approved',
      targetType: 'withdrawal',
      targetId: withdrawalId,
      details: { amount: withdrawal.amount, creatorId: withdrawal.creatorId },
    }).catch(() => {});

    // Notify creator (non-blocking)
    notificationService.notifyWithdrawalApproved(withdrawal.creatorId, withdrawal.amount).catch(() => {});
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendWithdrawalApproved(user.email, user.name, withdrawal.amount).catch(() => {});
    }).catch(() => {});

    return withdrawal;
  }

  /**
   * Reject a withdrawal request (admin).
   */
  async rejectWithdrawal(withdrawalId, adminId, { adminNote }) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);

    if (withdrawal.status !== 'pending') {
      throw new AppError(`Cannot reject a ${withdrawal.status} withdrawal`, 400);
    }

    withdrawal.status = 'rejected';
    withdrawal.adminNote = adminNote;
    withdrawal.processedBy = adminId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    AuditLog.create({
      adminId,
      action: 'withdrawal_rejected',
      targetType: 'withdrawal',
      targetId: withdrawalId,
      details: { amount: withdrawal.amount, reason: adminNote },
    }).catch(() => {});

    // Notify creator (non-blocking)
    notificationService.notifyWithdrawalRejected(withdrawal.creatorId, withdrawal.amount, adminNote).catch(() => {});
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendWithdrawalRejected(user.email, user.name, withdrawal.amount, adminNote).catch(() => {});
    }).catch(() => {});

    return withdrawal;
  }

  /**
   * Mark a withdrawal as completed (admin — after actual payout).
   */
  async completeWithdrawal(withdrawalId, adminId, { stripeTransferId } = {}) {
    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);

    if (withdrawal.status !== 'approved' && withdrawal.status !== 'processing') {
      throw new AppError(`Cannot complete a ${withdrawal.status} withdrawal`, 400);
    }

    withdrawal.status = 'completed';
    withdrawal.completedAt = new Date();
    if (stripeTransferId) withdrawal.stripeTransferId = stripeTransferId;
    await withdrawal.save();

    // Notify creator (non-blocking)
    notificationService.notifyWithdrawalCompleted(withdrawal.creatorId, withdrawal.amount).catch(() => {});
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendPayoutProcessed(user.email, user.name, withdrawal.amount).catch(() => {});
    }).catch(() => {});

    return withdrawal;
  }
}
