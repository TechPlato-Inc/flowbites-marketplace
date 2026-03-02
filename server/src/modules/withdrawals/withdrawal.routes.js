import express from 'express';
import { WithdrawalController } from './withdrawal.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  createWithdrawalSchema,
  listWithdrawalsQuerySchema,
  rejectWithdrawalSchema,
  completeWithdrawalSchema,
} from './withdrawal.validator.js';

const router = express.Router();
const withdrawalController = new WithdrawalController();

// Creator routes
router.get('/balance', authenticate, can('earnings.view_own'), withdrawalController.getBalance);
router.get('/my', authenticate, can('earnings.view_own'), validate(listWithdrawalsQuerySchema), withdrawalController.getMyWithdrawals);
router.post('/request', authenticate, can('earnings.view_own'), validate(createWithdrawalSchema), withdrawalController.requestWithdrawal);

// Admin routes
router.get('/admin', authenticate, can('withdrawals.view'), validate(listWithdrawalsQuerySchema), withdrawalController.getAllWithdrawals);
router.post('/admin/:id/approve', authenticate, can('withdrawals.approve'), withdrawalController.approveWithdrawal);
router.post('/admin/:id/reject', authenticate, can('withdrawals.approve'), validate(rejectWithdrawalSchema), withdrawalController.rejectWithdrawal);
router.post('/admin/:id/complete', authenticate, can('withdrawals.approve'), validate(completeWithdrawalSchema), withdrawalController.completeWithdrawal);

export default router;
