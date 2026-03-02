import { CouponQueryService } from './coupon.queryService.js';
import { CouponWriteService } from './coupon.writeService.js';
import { toCouponDTO, toCouponValidationDTO } from './dto/coupon.dto.js';

const queryService = new CouponQueryService();
const writeService = new CouponWriteService();

export class CouponController {
  // POST /coupons/admin — create coupon
  async createCoupon(req, res, next) {
    try {
      const coupon = await writeService.createCoupon(req.user._id, req.body);
      res.status(201).json({ success: true, data: toCouponDTO(coupon) });
    } catch (error) {
      next(error);
    }
  }

  // GET /coupons/admin — list coupons
  async getCoupons(req, res, next) {
    try {
      const { page, limit, active, search } = req.query;
      const data = await queryService.getCoupons({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        active,
        search,
      });
      data.coupons = data.coupons.map(toCouponDTO);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /coupons/admin/:couponId — update coupon
  async updateCoupon(req, res, next) {
    try {
      const coupon = await writeService.updateCoupon(req.params.couponId, req.body);
      res.json({ success: true, data: toCouponDTO(coupon) });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /coupons/admin/:couponId — delete coupon
  async deleteCoupon(req, res, next) {
    try {
      const data = await writeService.deleteCoupon(req.params.couponId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /coupons/validate — buyer validates a coupon
  async validateCoupon(req, res, next) {
    try {
      const result = await queryService.validateCoupon(
        req.user._id,
        req.body.code,
        req.body.orderAmount,
        req.body.itemType
      );
      res.json({ success: true, data: toCouponValidationDTO(result) });
    } catch (error) {
      next(error);
    }
  }
}
