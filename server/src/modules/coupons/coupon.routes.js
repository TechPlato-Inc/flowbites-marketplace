import express from 'express';
import { CouponController } from './coupon.controller.js';
import { validate } from '../../middleware/validate.js';
import { createCouponSchema, validateCouponSchema } from './coupon.validator.js';
import { authenticate, requireAdmin } from '../../middleware/auth.js';
import { userRateLimit } from '../../middleware/userRateLimit.js';

const router = express.Router();
const couponController = new CouponController();

// Buyer: validate a coupon (rate limited: 10 tries per minute)
router.post(
  '/validate',
  authenticate,
  userRateLimit({ maxRequests: 10, windowMs: 60000, message: 'Too many coupon attempts, please wait' }),
  validate(validateCouponSchema),
  couponController.validateCoupon
);

// Admin: CRUD
router.get('/admin', authenticate, requireAdmin, couponController.getCoupons);
router.post('/admin', authenticate, requireAdmin, validate(createCouponSchema), couponController.createCoupon);
router.patch('/admin/:couponId', authenticate, requireAdmin, couponController.updateCoupon);
router.delete('/admin/:couponId', authenticate, requireAdmin, couponController.deleteCoupon);

export default router;
