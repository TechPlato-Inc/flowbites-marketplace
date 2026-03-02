import { eventBus, EVENTS } from '../../shared/eventBus.js';
import { AuditService } from './audit.service.js';
import logger from '../../lib/logger.js';

function safe(handler) {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      logger.error({ err, handler: handler.name }, 'Audit listener error');
    }
  };
}

// ── Template Admin Events ────────────────────────────────────────────────────

eventBus.on(
  EVENTS.TEMPLATE_APPROVED,
  safe(async ({ templateId, adminId, templateTitle }) => {
    await AuditService.log({
      adminId,
      action: 'template.approved',
      targetType: 'template',
      targetId: templateId,
      details: { templateTitle },
    });
  })
);

eventBus.on(
  EVENTS.TEMPLATE_REJECTED,
  safe(async ({ templateId, adminId, templateTitle, reason }) => {
    await AuditService.log({
      adminId,
      action: 'template.rejected',
      targetType: 'template',
      targetId: templateId,
      details: { templateTitle, reason },
    });
  })
);

eventBus.on(
  EVENTS.TEMPLATE_DELETED,
  safe(async ({ templateId, adminId, templateTitle }) => {
    await AuditService.log({
      adminId,
      action: 'template.deleted',
      targetType: 'template',
      targetId: templateId,
      details: { templateTitle },
    });
  })
);

// ── Creator Admin Events ─────────────────────────────────────────────────────

eventBus.on(
  EVENTS.CREATOR_APPROVED,
  safe(async ({ creatorProfileId, adminId, creatorName }) => {
    await AuditService.log({
      adminId,
      action: 'creator.approved',
      targetType: 'creator',
      targetId: creatorProfileId,
      details: { creatorName },
    });
  })
);

eventBus.on(
  EVENTS.CREATOR_REJECTED,
  safe(async ({ creatorProfileId, adminId, creatorName, reason }) => {
    await AuditService.log({
      adminId,
      action: 'creator.rejected',
      targetType: 'creator',
      targetId: creatorProfileId,
      details: { creatorName, reason },
    });
  })
);

// ── RBAC Events ──────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.ROLE_CHANGED,
  safe(async ({ userId, oldRole, newRole, changedBy }) => {
    await AuditService.log({
      adminId: changedBy,
      action: 'role.changed',
      targetType: 'user',
      targetId: userId,
      details: { oldRole, newRole },
    });
  })
);

// ── Order Events ─────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.ORDER_REFUNDED,
  safe(async ({ orderId, userId, refundId, amount, adminId }) => {
    if (adminId) {
      await AuditService.log({
        adminId,
        action: 'order.refunded',
        targetType: 'order',
        targetId: orderId,
        details: { refundId, amount, userId },
      });
    }
  })
);

// ── Withdrawal Events ────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.WITHDRAWAL_PROCESSED,
  safe(async ({ withdrawalId, userId, amount, status, adminId }) => {
    if (adminId) {
      await AuditService.log({
        adminId,
        action: `withdrawal.${status}`,
        targetType: 'withdrawal',
        targetId: withdrawalId,
        details: { userId, amount, status },
      });
    }
  })
);

// ── Report Events ────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.REPORT_RESOLVED,
  safe(async ({ reportId, resolvedBy, status }) => {
    if (resolvedBy) {
      await AuditService.log({
        adminId: resolvedBy,
        action: 'report.resolved',
        targetType: 'report',
        targetId: reportId,
        details: { status },
      });
    }
  })
);

// ── Ticket Events ────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.TICKET_RESOLVED,
  safe(async ({ ticketId, resolvedBy }) => {
    if (resolvedBy) {
      await AuditService.log({
        adminId: resolvedBy,
        action: 'ticket.resolved',
        targetType: 'ticket',
        targetId: ticketId,
      });
    }
  })
);

logger.info('Audit event listeners registered');
