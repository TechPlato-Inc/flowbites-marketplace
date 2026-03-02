import express from 'express';
import { ReportController } from './report.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { userRateLimit } from '../../middleware/userRateLimit.js';
import { validate } from '../../middleware/validate.js';
import { createReportSchema, resolveReportSchema, dismissReportSchema } from './report.validator.js';

const router = express.Router();
const reportController = new ReportController();

// User routes — submit a report (limited to 5 per hour)
const reportLimit = userRateLimit({ maxRequests: 5, windowMs: 3600000, message: 'Too many reports, please slow down' });
router.post('/', authenticate, reportLimit, validate(createReportSchema), reportController.createReport);

// Admin routes
router.get('/admin', authenticate, can('reports.manage'), reportController.getReports);
router.get('/admin/stats', authenticate, can('reports.manage'), reportController.getReportStats);
router.get('/admin/:id', authenticate, can('reports.manage'), reportController.getReportById);
router.post('/admin/:id/resolve', authenticate, can('reports.manage'), validate(resolveReportSchema), reportController.resolveReport);
router.post('/admin/:id/dismiss', authenticate, can('reports.manage'), validate(dismissReportSchema), reportController.dismissReport);

export default router;
