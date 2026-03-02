import { Withdrawal } from './withdrawal.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendWithdrawalApproved, sendWithdrawalRejected, sendPayoutProcessed } from '../../services/email.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';
import { toWithdrawalDTO } from './dto/withdrawal.dto.js';
import { WithdrawalQueryService } from './withdrawal.queryService.js';

const notificationService = new NotificationService();
const queryService = new WithdrawalQueryService();

const MIN_WITHDRAWAL = 10;

export class WithdrawalWriteService {
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
    const balance = await queryService.getBalance(creatorId);
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

      eventBus.emit(EVENTS.WITHDRAWAL_REQUESTED, {
        userId: creatorId.toString(),
        withdrawalId: withdrawal._id.toString(),
        amount: requestedAmount,
      });

      return toWithdrawalDTO(withdrawal);
    } catch (error) {
      if (error?.code === 11000) {
        throw new AppError('You already have a pending withdrawal request', 400);
      }
      throw error;
    }
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

    // Send email (non-blocking) — keep here since no email listener
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendWithdrawalApproved(user.email, user.name, withdrawal.amount).catch(() => {});
    }).catch(() => {});

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.WITHDRAWAL_PROCESSED, {
      userId: withdrawal.creatorId.toString(),
      withdrawalId: withdrawal._id.toString(),
      amount: withdrawal.amount,
      status: 'approved',
      adminId: adminId.toString(),
    });

    return toWithdrawalDTO(withdrawal);
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

    // Send email (non-blocking) — keep here since no email listener
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendWithdrawalRejected(user.email, user.name, withdrawal.amount, adminNote).catch(() => {});
    }).catch(() => {});

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.WITHDRAWAL_PROCESSED, {
      userId: withdrawal.creatorId.toString(),
      withdrawalId: withdrawal._id.toString(),
      amount: withdrawal.amount,
      status: 'rejected',
      reason: adminNote,
      adminId: adminId.toString(),
    });

    return toWithdrawalDTO(withdrawal);
  }

  /**
   * Mark a withdrawal as completed (admin -- after actual payout).
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

    // Notify creator directly — listener uses notifyWithdrawalApproved for 'completed'
    // which has different messaging, so keep direct call here
    notificationService.notifyWithdrawalCompleted(withdrawal.creatorId, withdrawal.amount).catch(() => {});
    User.findById(withdrawal.creatorId).then(user => {
      if (user) sendPayoutProcessed(user.email, user.name, withdrawal.amount).catch(() => {});
    }).catch(() => {});

    // Emit domain event — audit listener handles logging
    eventBus.emit(EVENTS.WITHDRAWAL_PROCESSED, {
      userId: withdrawal.creatorId.toString(),
      withdrawalId: withdrawal._id.toString(),
      amount: withdrawal.amount,
      status: 'completed',
      adminId: adminId.toString(),
    });

    return toWithdrawalDTO(withdrawal);
  }
}
