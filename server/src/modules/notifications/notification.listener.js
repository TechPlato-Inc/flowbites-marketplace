import { eventBus, EVENTS } from '../../shared/eventBus.js';
import { NotificationWriteService } from './notification.writeService.js';
import logger from '../../lib/logger.js';

const notificationWriter = new NotificationWriteService();

function safe(handler) {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      logger.error({ err, handler: handler.name }, 'Notification listener error');
    }
  };
}

// ── Template Events ──────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.TEMPLATE_APPROVED,
  safe(async ({ creatorId, templateTitle }) => {
    await notificationWriter.notifyTemplateApproved(creatorId, templateTitle);
  })
);

eventBus.on(
  EVENTS.TEMPLATE_REJECTED,
  safe(async ({ creatorId, templateTitle, reason }) => {
    if (creatorId && templateTitle) {
      await notificationWriter.notifyTemplateRejected(creatorId, templateTitle, reason);
    }
  })
);

// ── Order Events ─────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.ORDER_PAID,
  safe(async ({ buyerId, order, items }) => {
    // Notify buyer
    if (buyerId && order) {
      await notificationWriter.notifyOrderPaid(buyerId, order);
    }

    // Notify each creator of their sale
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.creatorId && item.templateTitle && item.price != null) {
          await notificationWriter.notifyCreatorSale(
            item.creatorId,
            item.templateTitle,
            item.price
          );
        }
      }
    }
  })
);

// ── Review Events ────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.REVIEW_CREATED,
  safe(async ({ creatorId, templateTitle, rating }) => {
    if (creatorId && templateTitle && rating) {
      await notificationWriter.notifyReviewReceived(creatorId, templateTitle, rating);
    }
  })
);

eventBus.on(
  EVENTS.REVIEW_MODERATED,
  safe(async ({ reviewerId, templateTitle, status, reason }) => {
    if (reviewerId && templateTitle) {
      await notificationWriter.notifyReviewModerated(reviewerId, templateTitle, status, reason);
    }
  })
);

// ── Creator Events ───────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.CREATOR_APPROVED,
  safe(async ({ userId }) => {
    if (userId) {
      await notificationWriter.create({
        userId,
        type: 'creator_approved',
        title: 'Creator account approved!',
        message: 'Congratulations! You can now upload templates and offer services.',
        link: '/dashboard/creator',
      });
    }
  })
);

eventBus.on(
  EVENTS.CREATOR_REJECTED,
  safe(async ({ userId, reason }) => {
    if (userId) {
      await notificationWriter.create({
        userId,
        type: 'creator_rejected',
        title: 'Creator application update',
        message: reason || 'Your creator application needs updates. Please review and re-apply.',
        link: '/dashboard/creator/onboarding',
      });
    }
  })
);

eventBus.on(
  EVENTS.CREATOR_FOLLOWED,
  safe(async ({ creatorUserId, followerName }) => {
    if (creatorUserId && followerName) {
      await notificationWriter.notifyNewFollower(creatorUserId, followerName);
    }
  })
);

// ── Message Events ───────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.MESSAGE_SENT,
  safe(async ({ recipientId, senderName, conversationId }) => {
    if (recipientId && senderName) {
      await notificationWriter.create({
        userId: recipientId,
        type: 'new_message',
        title: 'New message',
        message: `${senderName} sent you a message.`,
        link: `/dashboard/messages/${conversationId || ''}`,
        metadata: { conversationId, senderName },
      });
    }
  })
);

// ── Ticket Events ────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.TICKET_RESOLVED,
  safe(async ({ ticketId, userId, subject }) => {
    if (userId && ticketId) {
      await notificationWriter.notifyTicketResolved(userId, ticketId, subject || 'Your ticket');
    }
  })
);

// ── Report Events ────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.REPORT_RESOLVED,
  safe(async ({ reporterId, actionTaken }) => {
    if (reporterId) {
      await notificationWriter.notifyReportResolved(reporterId, actionTaken);
    }
  })
);

// ── Withdrawal Events ────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.WITHDRAWAL_PROCESSED,
  safe(async ({ userId, amount, status, reason }) => {
    if (!userId || !amount) return;
    if (status === 'approved' || status === 'completed') {
      await notificationWriter.notifyWithdrawalApproved(userId, amount);
    } else if (status === 'rejected') {
      await notificationWriter.notifyWithdrawalRejected(userId, amount, reason);
    }
  })
);

logger.info('Notification event listeners registered');
