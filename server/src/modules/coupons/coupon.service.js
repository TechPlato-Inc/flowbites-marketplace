import { CouponQueryService } from './coupon.queryService.js';
import { CouponWriteService } from './coupon.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import CouponQueryService or CouponWriteService directly.
export class CouponService {
  constructor() {
    this._query = new CouponQueryService();
    this._write = new CouponWriteService();
  }

  getCoupons(filters) { return this._query.getCoupons(filters); }
  validateCoupon(userId, code, orderAmount, itemType) { return this._query.validateCoupon(userId, code, orderAmount, itemType); }
  createCoupon(adminId, data) { return this._write.createCoupon(adminId, data); }
  updateCoupon(couponId, updates) { return this._write.updateCoupon(couponId, updates); }
  deleteCoupon(couponId) { return this._write.deleteCoupon(couponId); }
  recordUsage(couponId, userId, orderId, discountApplied) { return this._write.recordUsage(couponId, userId, orderId, discountApplied); }
}
