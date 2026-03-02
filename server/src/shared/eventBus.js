import { EventEmitter } from 'events';

export const eventBus = new EventEmitter();

// Prevent memory leak warnings for many listeners
eventBus.setMaxListeners(50);

// Domain event names
export const EVENTS = {
  // Templates
  TEMPLATE_CREATED: 'template.created',
  TEMPLATE_UPDATED: 'template.updated',
  TEMPLATE_SUBMITTED: 'template.submitted',
  TEMPLATE_APPROVED: 'template.approved',
  TEMPLATE_REJECTED: 'template.rejected',
  TEMPLATE_DELETED: 'template.deleted',
  TEMPLATE_VIEWED: 'template.viewed',

  // Orders & Checkout
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_REFUNDED: 'order.refunded',

  // Reviews
  REVIEW_CREATED: 'review.created',
  REVIEW_MODERATED: 'review.moderated',

  // Creators
  CREATOR_APPROVED: 'creator.approved',
  CREATOR_REJECTED: 'creator.rejected',
  CREATOR_FOLLOWED: 'creator.followed',

  // Auth & Users
  USER_REGISTERED: 'user.registered',
  USER_LOGGED_IN: 'user.logged_in',
  ROLE_CHANGED: 'role.changed',

  // Services
  SERVICE_CREATED: 'service.created',
  SERVICE_UPDATED: 'service.updated',

  // Messaging
  MESSAGE_SENT: 'message.sent',

  // Downloads
  DOWNLOAD_STARTED: 'download.started',

  // Withdrawals
  WITHDRAWAL_REQUESTED: 'withdrawal.requested',
  WITHDRAWAL_PROCESSED: 'withdrawal.processed',

  // Reports
  REPORT_CREATED: 'report.created',
  REPORT_RESOLVED: 'report.resolved',

  // Tickets
  TICKET_CREATED: 'ticket.created',
  TICKET_RESOLVED: 'ticket.resolved',

  // Affiliates
  AFFILIATE_REGISTERED: 'affiliate.registered',
  AFFILIATE_PAYOUT_REQUESTED: 'affiliate.payout_requested',
};
