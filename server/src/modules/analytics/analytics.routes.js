import express from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { authenticate, authorize, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();
const analyticsController = new AnalyticsController();

router.post('/event', optionalAuth, analyticsController.trackEvent);
router.get('/metrics', authenticate, authorize('admin'), analyticsController.getMetrics);

export default router;
