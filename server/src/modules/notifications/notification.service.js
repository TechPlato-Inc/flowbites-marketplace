import { NotificationQueryService } from './notification.queryService.js';
import { NotificationWriteService } from './notification.writeService.js';

/**
 * Backwards-compatible facade.
 *
 * External modules (checkout, admin, reviews, etc.) import NotificationService
 * and call convenience methods such as notifyOrderPaid().  This class delegates
 * every call to either NotificationQueryService or NotificationWriteService so
 * the existing call-sites keep working without any changes.
 */
export class NotificationService {
  constructor() {
    this._query = new NotificationQueryService();
    this._write = new NotificationWriteService();
  }

  // ─── Read operations (delegated to queryService) ──────────────────────────

  getUserNotifications(userId, opts) {
    return this._query.getUserNotifications(userId, opts);
  }

  getUnreadCount(userId) {
    return this._query.getUnreadCount(userId);
  }

  // ─── Write operations (delegated to writeService) ─────────────────────────

  create(params) {
    return this._write.create(params);
  }

  markAsRead(userId, notificationId) {
    return this._write.markAsRead(userId, notificationId);
  }

  markAllAsRead(userId) {
    return this._write.markAllAsRead(userId);
  }

  delete(userId, notificationId) {
    return this._write.delete(userId, notificationId);
  }

  // ─── Convenience notification methods (delegated to writeService) ─────────

  notifyOrderPaid(buyerId, order) {
    return this._write.notifyOrderPaid(buyerId, order);
  }

  notifyCreatorSale(creatorId, templateTitle, amount) {
    return this._write.notifyCreatorSale(creatorId, templateTitle, amount);
  }

  notifyTemplateApproved(creatorId, templateTitle) {
    return this._write.notifyTemplateApproved(creatorId, templateTitle);
  }

  notifyTemplateRejected(creatorId, templateTitle, reason) {
    return this._write.notifyTemplateRejected(creatorId, templateTitle, reason);
  }

  notifyReviewReceived(creatorId, templateTitle, rating) {
    return this._write.notifyReviewReceived(creatorId, templateTitle, rating);
  }

  notifyRefundApproved(buyerId, orderNumber, amount) {
    return this._write.notifyRefundApproved(buyerId, orderNumber, amount);
  }

  notifyRefundRejected(buyerId, orderNumber, reason) {
    return this._write.notifyRefundRejected(buyerId, orderNumber, reason);
  }

  notifyWithdrawalApproved(creatorId, amount) {
    return this._write.notifyWithdrawalApproved(creatorId, amount);
  }

  notifyWithdrawalRejected(creatorId, amount, reason) {
    return this._write.notifyWithdrawalRejected(creatorId, amount, reason);
  }

  notifyWithdrawalCompleted(creatorId, amount) {
    return this._write.notifyWithdrawalCompleted(creatorId, amount);
  }

  notifyTicketReply(userId, ticketId, subject, senderName) {
    return this._write.notifyTicketReply(userId, ticketId, subject, senderName);
  }

  notifyTicketResolved(userId, ticketId, subject) {
    return this._write.notifyTicketResolved(userId, ticketId, subject);
  }

  notifyReportResolved(reporterId, actionTaken) {
    return this._write.notifyReportResolved(reporterId, actionTaken);
  }

  notifyNewFollower(creatorId, followerName) {
    return this._write.notifyNewFollower(creatorId, followerName);
  }

  notifyOrderExpired(buyerId, orderNumber) {
    return this._write.notifyOrderExpired(buyerId, orderNumber);
  }

  notifyPaymentFailed(buyerId, orderNumber) {
    return this._write.notifyPaymentFailed(buyerId, orderNumber);
  }

  notifyServiceOrderCreated(creatorId, orderId, packageName, buyerName) {
    return this._write.notifyServiceOrderCreated(creatorId, orderId, packageName, buyerName);
  }

  notifyServiceOrderAccepted(buyerId, orderId, packageName) {
    return this._write.notifyServiceOrderAccepted(buyerId, orderId, packageName);
  }

  notifyServiceOrderInProgress(buyerId, orderId, packageName) {
    return this._write.notifyServiceOrderInProgress(buyerId, orderId, packageName);
  }

  notifyServiceOrderDelivered(buyerId, orderId, packageName) {
    return this._write.notifyServiceOrderDelivered(buyerId, orderId, packageName);
  }

  notifyServiceOrderCompleted(userId, orderId, packageName) {
    return this._write.notifyServiceOrderCompleted(userId, orderId, packageName);
  }

  notifyServiceOrderRejected(buyerId, orderId, packageName) {
    return this._write.notifyServiceOrderRejected(buyerId, orderId, packageName);
  }

  notifyServiceOrderRevision(creatorId, orderId, packageName) {
    return this._write.notifyServiceOrderRevision(creatorId, orderId, packageName);
  }

  notifyServiceOrderCancelled(userId, orderId, packageName, reason) {
    return this._write.notifyServiceOrderCancelled(userId, orderId, packageName, reason);
  }

  notifyServiceOrderDisputed(creatorId, orderId, packageName) {
    return this._write.notifyServiceOrderDisputed(creatorId, orderId, packageName);
  }

  notifyServiceDisputeResolved(userId, orderId, packageName, outcome) {
    return this._write.notifyServiceDisputeResolved(userId, orderId, packageName, outcome);
  }

  notifyReviewModerated(reviewerId, templateTitle, status, reason) {
    return this._write.notifyReviewModerated(reviewerId, templateTitle, status, reason);
  }
}
