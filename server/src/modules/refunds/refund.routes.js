import express from 'express';
import { RefundController } from './refund.controller.js';
import { validate } from '../../middleware/validate.js';
import { requestRefundSchema, rejectRefundSchema } from './refund.validator.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();
const refundController = new RefundController();

// Buyer: request a refund
router.post(
  '/request',
  authenticate,
  validate(requestRefundSchema),
  refundController.requestRefund
);

// Buyer: check refund status for an order
router.get(
  '/order/:orderId',
  authenticate,
  refundController.getRefundByOrder
);

// Admin: list all refund requests
router.get(
  '/admin',
  authenticate,
  requireAdmin,
  refundController.getRefunds
);

// Admin: approve refund
router.post(
  '/admin/:refundId/approve',
  authenticate,
  requireAdmin,
  refundController.approveRefund
);

// Admin: reject refund
router.post(
  '/admin/:refundId/reject',
  authenticate,
  requireAdmin,
  validate(rejectRefundSchema),
  refundController.rejectRefund
);

export default router;
