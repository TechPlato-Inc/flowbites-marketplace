import { CouponService } from './coupon.service.js';

const couponService = new CouponService();

export class CouponController {
  // POST /coupons/admin — create coupon
  async createCoupon(req, res, next) {
    try {
      const coupon = await couponService.createCoupon(req.user._id, req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  }

  // GET /coupons/admin — list coupons
  async getCoupons(req, res, next) {
    try {
      const data = await couponService.getCoupons({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        active: req.query.active,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /coupons/admin/:couponId — update coupon
  async updateCoupon(req, res, next) {
    try {
      const coupon = await couponService.updateCoupon(req.params.couponId, req.body);
      res.json({ success: true, data: coupon });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /coupons/admin/:couponId — delete coupon
  async deleteCoupon(req, res, next) {
    try {
      const data = await couponService.deleteCoupon(req.params.couponId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /coupons/validate — buyer validates a coupon
  async validateCoupon(req, res, next) {
    try {
      const data = await couponService.validateCoupon(
        req.user._id,
        req.body.code,
        req.body.orderAmount,
        req.body.itemType
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
