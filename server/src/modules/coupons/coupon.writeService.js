import { Coupon, CouponUsage } from './coupon.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CouponWriteService {
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
