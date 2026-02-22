import express from 'express';
import { WithdrawalController } from './withdrawal.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { requestWithdrawalSchema, rejectWithdrawalSchema, completeWithdrawalSchema } from './withdrawal.validator.js';

const router = express.Router();
const withdrawalController = new WithdrawalController();

// Creator routes
router.get('/balance', authenticate, authorize('creator', 'admin'), withdrawalController.getBalance);
router.get('/my', authenticate, authorize('creator', 'admin'), withdrawalController.getMyWithdrawals);
router.post('/request', authenticate, authorize('creator', 'admin'), validate(requestWithdrawalSchema), withdrawalController.requestWithdrawal);

// Admin routes
router.get('/admin', authenticate, authorize('admin'), withdrawalController.getAllWithdrawals);
router.post('/admin/:id/approve', authenticate, authorize('admin'), withdrawalController.approveWithdrawal);
router.post('/admin/:id/reject', authenticate, authorize('admin'), validate(rejectWithdrawalSchema), withdrawalController.rejectWithdrawal);
router.post('/admin/:id/complete', authenticate, authorize('admin'), validate(completeWithdrawalSchema), withdrawalController.completeWithdrawal);

export default router;
