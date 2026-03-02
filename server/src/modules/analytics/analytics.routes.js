import express from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { validate } from '../../middleware/validate.js';
import { trackEventSchema } from './analytics.validator.js';
import { authenticate, can, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

// Public / optional auth
router.post('/event', optionalAuth, validate(trackEventSchema), analyticsController.trackEvent);

// Creator analytics (requires analytics.view_own)
router.get('/creator', authenticate, can('analytics.view_own'), analyticsController.getCreatorAnalytics);
router.get('/realtime', authenticate, can('analytics.view_own'), analyticsController.getRealtimeAnalytics);
router.get('/export', authenticate, can('analytics.view_own'), analyticsController.exportAnalytics);
router.post('/compare', authenticate, can('analytics.view_own'), analyticsController.compareAnalytics);
router.get('/templates/:templateId', authenticate, can('analytics.view_own'), analyticsController.getTemplateAnalytics);

// Admin-only (platform-wide analytics)
router.get('/metrics', authenticate, can('analytics.view_all'), analyticsController.getMetrics);

export default router;
