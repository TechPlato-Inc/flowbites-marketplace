import express from 'express';
import { RefundController } from './refund.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createRefundSchema,
  processRefundSchema,
  listRefundsQuerySchema,
  rejectRefundSchema,
} from './refund.validator.js';
import { authenticate, can } from '../../middleware/auth.js';

const router = express.Router();
const refundController = new RefundController();

// Buyer: request a refund
router.post(
  '/request',
  authenticate,
  validate(createRefundSchema),
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
  can('orders.refund'),
  validate(listRefundsQuerySchema),
  refundController.getRefunds
);

// Admin: process refund (approve or reject via body)
router.post(
  '/admin/:refundId/process',
  authenticate,
  can('orders.refund'),
  validate(processRefundSchema),
  refundController.processRefund
);

// Admin: approve refund (legacy endpoint)
router.post(
  '/admin/:refundId/approve',
  authenticate,
  can('orders.refund'),
  refundController.approveRefund
);

// Admin: reject refund (legacy endpoint)
router.post(
  '/admin/:refundId/reject',
  authenticate,
  can('orders.refund'),
  validate(rejectRefundSchema),
  refundController.rejectRefund
);

export default router;
