import express from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const auditController = new AuditController();

// All audit routes require admin
router.use(authenticate, authorize('admin'));

router.get('/', auditController.getLogs);
router.get('/stats', auditController.getStats);
router.get('/:targetType/:targetId', auditController.getLogsForTarget);

export default router;
