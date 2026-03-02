import express from 'express';
import { AuditController } from './audit.controller.js';
import { authenticate, can } from '../../middleware/auth.js';

const router = express.Router();
const auditController = new AuditController();

// All audit routes require audit.view permission
router.use(authenticate, can('audit.view'));

router.get('/', auditController.getLogs);
router.get('/stats', auditController.getStats);
router.get('/:targetType/:targetId', auditController.getLogsForTarget);

export default router;
