import { Coupon, CouponUsage } from './coupon.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CouponQueryService {
  /**
   * Admin: list all coupons.
   */
  async getCoupons({ page = 1, limit = 20, active, search } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;
    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const [coupons, total] = await Promise.all([
      Coupon.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Coupon.countDocuments(filter),
    ]);

    return {
      coupons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Buyer: validate and apply a coupon code at checkout.
   */
  async validateCoupon(userId, code, orderAmount, itemType = 'templates') {
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) throw new AppError('Invalid coupon code', 400);

    // Check active
    if (!coupon.isActive) throw new AppError('This coupon is no longer active', 400);

    // Check dates
    const now = new Date();
    if (now < coupon.startsAt) throw new AppError('This coupon is not yet active', 400);
    if (now > coupon.expiresAt) throw new AppError('This coupon has expired', 400);

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('This coupon has reached its usage limit', 400);
    }

    // Check per-user limit
    const userUsage = await CouponUsage.countDocuments({ couponId: coupon._id, userId });
    if (userUsage >= coupon.perUserLimit) {
      throw new AppError('You have already used this coupon', 400);
    }

    // Check applicable type
    if (coupon.applicableTo !== 'all' && coupon.applicableTo !== itemType) {
      throw new AppError(`This coupon is only valid for ${coupon.applicableTo}`, 400);
    }

    // Check min order amount
    if (orderAmount < coupon.minOrderAmount) {
      throw new AppError(`Minimum order amount is $${coupon.minOrderAmount}`, 400);
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = orderAmount * (coupon.discountValue / 100);
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    discount = Math.round(discount * 100) / 100;

    return {
      valid: true,
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      discount,
      finalAmount: Math.round((orderAmount - discount) * 100) / 100,
    };
  }
}
