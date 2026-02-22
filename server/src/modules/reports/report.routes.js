import express from 'express';
import { ReportController } from './report.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { userRateLimit } from '../../middleware/userRateLimit.js';
import { validate } from '../../middleware/validate.js';
import { createReportSchema, resolveReportSchema, dismissReportSchema } from './report.validator.js';

const router = express.Router();
const reportController = new ReportController();

// User routes — submit a report (limited to 5 per hour)
const reportLimit = userRateLimit({ maxRequests: 5, windowMs: 3600000, message: 'Too many reports, please slow down' });
router.post('/', authenticate, reportLimit, validate(createReportSchema), reportController.createReport);

// Admin routes
router.get('/admin', authenticate, authorize('admin'), reportController.getReports);
router.get('/admin/stats', authenticate, authorize('admin'), reportController.getReportStats);
router.get('/admin/:id', authenticate, authorize('admin'), reportController.getReportById);
router.post('/admin/:id/resolve', authenticate, authorize('admin'), validate(resolveReportSchema), reportController.resolveReport);
router.post('/admin/:id/dismiss', authenticate, authorize('admin'), validate(dismissReportSchema), reportController.dismissReport);

export default router;
