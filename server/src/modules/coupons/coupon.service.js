import { Coupon, CouponUsage } from './coupon.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CouponService {
  /**
   * Admin: create a coupon.
   */
  async createCoupon(adminId, data) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new AppError('Coupon code already exists', 400);

    const coupon = await Coupon.create({
      ...data,
      code: data.code.toUpperCase(),
      createdBy: adminId,
    });
    return coupon;
  }

  /**
   * Admin: list all coupons.
   */
  async getCoupons({ page = 1, limit = 20, active } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (active === 'true') filter.isActive = true;
    if (active === 'false') filter.isActive = false;

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
   * Admin: update a coupon.
   */
  async updateCoupon(couponId, updates) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new AppError('Coupon not found', 404);

    const allowed = [
      'description', 'discountType', 'discountValue', 'minOrderAmount',
      'maxDiscountAmount', 'usageLimit', 'perUserLimit', 'applicableTo',
      'specificTemplates', 'startsAt', 'expiresAt', 'isActive',
    ];
    for (const key of allowed) {
      if (updates[key] !== undefined) coupon[key] = updates[key];
    }

    await coupon.save();
    return coupon;
  }

  /**
   * Admin: delete a coupon.
   */
  async deleteCoupon(couponId) {
    const coupon = await Coupon.findById(couponId);
    if (!coupon) throw new AppError('Coupon not found', 404);
    await coupon.deleteOne();
    await CouponUsage.deleteMany({ couponId });
    return { deleted: true };
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
      discount,
      finalAmount: Math.round((orderAmount - discount) * 100) / 100,
    };
  }

  /**
   * Record coupon usage after successful payment.
   * Uses atomic conditional update to prevent race conditions on usage limit.
   */
  async recordUsage(couponId, userId, orderId, discountApplied) {
    // Atomic increment — only succeeds if usedCount is still below usageLimit
    const result = await Coupon.findOneAndUpdate(
      {
        _id: couponId,
        $or: [
          { usageLimit: null },
          { usageLimit: 0 },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
        ],
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );

    if (!result) {
      throw new AppError('Coupon usage limit has been reached', 400);
    }

    await CouponUsage.create({ couponId, userId, orderId, discountApplied });
  }
}
