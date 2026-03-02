import { Notification } from './notification.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { emitToUser } from '../../websocket/socket.js';
import { User } from '../users/user.model.js';

// Maps notification types to preference categories
const TYPE_TO_CATEGORY = {
  order_paid: 'orders',
  order_refunded: 'orders',
  order_expired: 'orders',
  payment_failed: 'orders',
  template_approved: 'templates',
  template_rejected: 'templates',
  review_received: 'reviews',
  review_moderated: 'reviews',
  service_order_update: 'services',
  new_follower: 'social',
  new_message: 'social',
  withdrawal_approved: 'financial',
  withdrawal_rejected: 'financial',
  withdrawal_completed: 'financial',
  refund_approved: 'financial',
  refund_rejected: 'financial',
  ticket_reply: 'support',
  ticket_resolved: 'support',
  report_resolved: 'support',
  creator_approved: 'account',
  creator_rejected: 'account',
  system: 'system',
};

export class NotificationWriteService {
  /**
   * Create a notification for a user and push it in real-time via WebSocket.
   * Respects user notification preferences — skips creation if the user has
   * disabled the corresponding category.
   */
  async create({ userId, type, title, message, link, metadata }) {
    // Check user's notification preferences
    const category = TYPE_TO_CATEGORY[type];
    if (category) {
      const user = await User.findById(userId).select('notificationPreferences').lean();
      if (user?.notificationPreferences && user.notificationPreferences[category] === false) {
        return null; // User has opted out of this category
      }
    }

    const notification = await Notification.create({ userId, type, title, message, link, metadata });

    // Push the notification to the user's open tabs instantly
    emitToUser(userId, 'notification:new', notification.toObject());

    return notification;
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
    if (!notification) throw new AppError('Notification not found', 404);

    // Sync across tabs
    emitToUser(userId, 'notification:marked_read', notificationId);

    return notification;
  }

  /**
   * Mark all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    // Sync across tabs
    emitToUser(userId, 'notification:all_marked_read');

    return { marked: result.modifiedCount };
  }

  /**
   * Delete a notification.
   */
  async delete(userId, notificationId) {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    if (!notification) throw new AppError('Notification not found', 404);

    // Sync across tabs
    emitToUser(userId, 'notification:deleted', notificationId);

    return { deleted: true };
  }

  // ─── Convenience methods for specific notification types ──────────────────

  async notifyOrderPaid(buyerId, order) {
    return this.create({
      userId: buyerId,
      type: 'order_paid',
      title: 'Purchase confirmed',
      message: `Your order ${order.orderNumber} has been confirmed. Total: $${order.total.toFixed(2)}`,
      link: '/dashboard/buyer',
      metadata: { orderId: order._id, orderNumber: order.orderNumber },
    });
  }

  async notifyCreatorSale(creatorId, templateTitle, amount) {
    return this.create({
      userId: creatorId,
      type: 'order_paid',
      title: 'New sale!',
      message: `Someone purchased your template "${templateTitle}" for $${amount.toFixed(2)}`,
      link: '/dashboard/creator',
      metadata: { templateTitle, amount },
    });
  }

  async notifyTemplateApproved(creatorId, templateTitle) {
    return this.create({
      userId: creatorId,
      type: 'template_approved',
      title: 'Template approved',
      message: `Your template "${templateTitle}" is now live on the marketplace.`,
      link: '/dashboard/creator',
      metadata: { templateTitle },
    });
  }

  async notifyTemplateRejected(creatorId, templateTitle, reason) {
    return this.create({
      userId: creatorId,
      type: 'template_rejected',
      title: 'Template needs changes',
      message: reason || `Your template "${templateTitle}" needs updates before going live.`,
      link: '/dashboard/creator',
      metadata: { templateTitle, reason },
    });
  }

  async notifyReviewReceived(creatorId, templateTitle, rating) {
    return this.create({
      userId: creatorId,
      type: 'review_received',
      title: 'New review',
      message: `Someone left a ${rating}-star review on "${templateTitle}".`,
      link: '/dashboard/creator',
      metadata: { templateTitle, rating },
    });
  }

  async notifyRefundApproved(buyerId, orderNumber, amount) {
    return this.create({
      userId: buyerId,
      type: 'refund_approved',
      title: 'Refund approved',
      message: `Your refund of $${amount.toFixed(2)} for order ${orderNumber} has been processed.`,
      link: '/dashboard/buyer',
      metadata: { orderNumber, amount },
    });
  }

  async notifyRefundRejected(buyerId, orderNumber, reason) {
    return this.create({
      userId: buyerId,
      type: 'refund_rejected',
      title: 'Refund request denied',
      message: reason || `Your refund request for order ${orderNumber} was not approved.`,
      link: '/dashboard/buyer',
      metadata: { orderNumber, reason },
    });
  }

  // ─── Withdrawal notifications ───────────────────────────────────────────────

  async notifyWithdrawalApproved(creatorId, amount) {
    return this.create({
      userId: creatorId,
      type: 'withdrawal_approved',
      title: 'Withdrawal approved',
      message: `Your withdrawal of $${amount.toFixed(2)} has been approved and is being processed.`,
      link: '/dashboard/creator/earnings',
      metadata: { amount },
    });
  }

  async notifyWithdrawalRejected(creatorId, amount, reason) {
    return this.create({
      userId: creatorId,
      type: 'withdrawal_rejected',
      title: 'Withdrawal rejected',
      message: reason || `Your withdrawal of $${amount.toFixed(2)} was not approved.`,
      link: '/dashboard/creator/earnings',
      metadata: { amount, reason },
    });
  }

  async notifyWithdrawalCompleted(creatorId, amount) {
    return this.create({
      userId: creatorId,
      type: 'withdrawal_completed',
      title: 'Payout sent',
      message: `Your payout of $${amount.toFixed(2)} has been sent to your account.`,
      link: '/dashboard/creator/earnings',
      metadata: { amount },
    });
  }

  // ─── Ticket notifications ──────────────────────────────────────────────────

  async notifyTicketReply(userId, ticketId, subject, senderName) {
    return this.create({
      userId,
      type: 'ticket_reply',
      title: 'New reply on your ticket',
      message: `${senderName} replied to your ticket: "${subject}"`,
      link: `/dashboard/tickets/${ticketId}`,
      metadata: { ticketId, subject },
    });
  }

  async notifyTicketResolved(userId, ticketId, subject) {
    return this.create({
      userId,
      type: 'ticket_resolved',
      title: 'Ticket resolved',
      message: `Your support ticket "${subject}" has been resolved.`,
      link: `/dashboard/tickets/${ticketId}`,
      metadata: { ticketId, subject },
    });
  }

  // ─── Report notifications ──────────────────────────────────────────────────

  async notifyReportResolved(reporterId, actionTaken) {
    return this.create({
      userId: reporterId,
      type: 'report_resolved',
      title: 'Report reviewed',
      message: `Your report has been reviewed. Action taken: ${actionTaken || 'none'}`,
      link: '/dashboard',
      metadata: { actionTaken },
    });
  }

  // ─── Follower notification ─────────────────────────────────────────────────

  async notifyNewFollower(creatorId, followerName) {
    return this.create({
      userId: creatorId,
      type: 'new_follower',
      title: 'New follower',
      message: `${followerName} started following you!`,
      link: '/dashboard/creator',
      metadata: { followerName },
    });
  }

  // ─── Order lifecycle notifications ─────────────────────────────────────────

  async notifyOrderExpired(buyerId, orderNumber) {
    return this.create({
      userId: buyerId,
      type: 'order_expired',
      title: 'Order expired',
      message: `Your order ${orderNumber} has expired because payment was not completed.`,
      link: '/templates',
      metadata: { orderNumber },
    });
  }

  async notifyPaymentFailed(buyerId, orderNumber) {
    return this.create({
      userId: buyerId,
      type: 'payment_failed',
      title: 'Payment failed',
      message: `Payment for order ${orderNumber} could not be processed. Please try again.`,
      link: '/templates',
      metadata: { orderNumber },
    });
  }

  // ─── Service order notifications ──────────────────────────────────────────

  async notifyServiceOrderCreated(creatorId, orderId, packageName, buyerName) {
    return this.create({
      userId: creatorId,
      type: 'service_order_update',
      title: 'New service order',
      message: `${buyerName} ordered "${packageName}". Review and accept the order.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderAccepted(buyerId, orderId, packageName) {
    return this.create({
      userId: buyerId,
      type: 'service_order_update',
      title: 'Order accepted',
      message: `Your order for "${packageName}" has been accepted by the creator.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderInProgress(buyerId, orderId, packageName) {
    return this.create({
      userId: buyerId,
      type: 'service_order_update',
      title: 'Work started',
      message: `The creator has started working on "${packageName}".`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderDelivered(buyerId, orderId, packageName) {
    return this.create({
      userId: buyerId,
      type: 'service_order_update',
      title: 'Order delivered',
      message: `Your order for "${packageName}" has been delivered. Please review the work.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderCompleted(userId, orderId, packageName) {
    return this.create({
      userId,
      type: 'service_order_update',
      title: 'Order completed',
      message: `The service order for "${packageName}" has been completed.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderRejected(buyerId, orderId, packageName) {
    return this.create({
      userId: buyerId,
      type: 'service_order_update',
      title: 'Order rejected',
      message: `Your order for "${packageName}" was rejected by the creator.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderRevision(creatorId, orderId, packageName) {
    return this.create({
      userId: creatorId,
      type: 'service_order_update',
      title: 'Revision requested',
      message: `The buyer requested a revision on "${packageName}".`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderCancelled(userId, orderId, packageName, reason) {
    return this.create({
      userId,
      type: 'service_order_update',
      title: 'Order cancelled',
      message: reason
        ? `Service order for "${packageName}" was cancelled: ${reason}`
        : `Service order for "${packageName}" was cancelled.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceOrderDisputed(creatorId, orderId, packageName) {
    return this.create({
      userId: creatorId,
      type: 'service_order_update',
      title: 'Dispute opened',
      message: `A dispute has been opened on your service order for "${packageName}". An admin will review it.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName },
    });
  }

  async notifyServiceDisputeResolved(userId, orderId, packageName, outcome) {
    return this.create({
      userId,
      type: 'service_order_update',
      title: 'Dispute resolved',
      message: `The dispute on "${packageName}" has been resolved. Outcome: ${outcome}.`,
      link: `/service-orders/${orderId}`,
      metadata: { orderId, packageName, outcome },
    });
  }

  // ─── Review moderation notification ───────────────────────────────────────

  async notifyReviewModerated(reviewerId, templateTitle, status, reason) {
    const statusLabel = status === 'approved' ? 'approved' : 'removed';
    const msg = status === 'approved'
      ? `Your review on "${templateTitle}" has been approved.`
      : `Your review on "${templateTitle}" was removed${reason ? `: ${reason}` : '.'}`;
    return this.create({
      userId: reviewerId,
      type: 'review_moderated',
      title: `Review ${statusLabel}`,
      message: msg,
      link: '/dashboard',
      metadata: { templateTitle, status, reason },
    });
  }
}
