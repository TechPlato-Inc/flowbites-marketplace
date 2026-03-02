import { eventBus, EVENTS } from '../../shared/eventBus.js';
import { AnalyticsService } from './analytics.service.js';
import logger from '../../lib/logger.js';

const analyticsService = new AnalyticsService();

function safe(handler) {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      logger.error({ err, handler: handler.name }, 'Analytics listener error');
    }
  };
}

// ── Template Events ──────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.TEMPLATE_VIEWED,
  safe(async ({ templateId, userId, context }) => {
    await analyticsService.trackEvent('view_template', userId || null, { templateId }, context || {});
  })
);

eventBus.on(
  EVENTS.TEMPLATE_CREATED,
  safe(async ({ templateId, creatorId, title }) => {
    await analyticsService.trackEvent('template_created', creatorId, { templateId, title });
  })
);

// ── Order Events ─────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.ORDER_CREATED,
  safe(async ({ orderId, buyerId, total }) => {
    await analyticsService.trackEvent('purchase_start', buyerId, { orderId, total });
  })
);

eventBus.on(
  EVENTS.ORDER_PAID,
  safe(async ({ orderId, buyerId, total, items }) => {
    await analyticsService.trackEvent('purchase_success', buyerId, {
      orderId,
      total,
      itemCount: items?.length || 0,
    });

    // Track individual template purchases
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.templateId) {
          await analyticsService.trackEvent('purchase_success', buyerId, {
            templateId: item.templateId,
            price: item.price,
          });
        }
      }
    }
  })
);

eventBus.on(
  EVENTS.ORDER_REFUNDED,
  safe(async ({ orderId, userId, amount }) => {
    await analyticsService.trackEvent('order_refunded', userId, { orderId, amount });
  })
);

// ── Download Events ──────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.DOWNLOAD_STARTED,
  safe(async ({ userId, templateId, licenseId }) => {
    await analyticsService.trackEvent('download', userId, { templateId, licenseId });
  })
);

// ── Service Events ───────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.SERVICE_CREATED,
  safe(async ({ serviceId, creatorId, name }) => {
    await analyticsService.trackEvent('service_created', creatorId, { serviceId, name });
  })
);

// ── User Events ──────────────────────────────────────────────────────────────

eventBus.on(
  EVENTS.USER_REGISTERED,
  safe(async ({ userId, role }) => {
    await analyticsService.trackEvent('user_registered', userId, { role });
  })
);

logger.info('Analytics event listeners registered');
