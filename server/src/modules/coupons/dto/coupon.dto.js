/**
 * Full coupon shape for admin views.
 * Includes usage stats, creator info, and all configuration fields.
 */
export function toCouponDTO(doc) {
  return {
    _id: doc._id,
    code: doc.code,
    description: doc.description || null,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    minOrderAmount: doc.minOrderAmount ?? 0,
    maxDiscountAmount: doc.maxDiscountAmount ?? null,
    usageLimit: doc.usageLimit ?? null,
    usedCount: doc.usedCount ?? 0,
    perUserLimit: doc.perUserLimit ?? 1,
    applicableTo: doc.applicableTo ?? 'all',
    specificTemplates: doc.specificTemplates ?? [],
    startsAt: doc.startsAt,
    expiresAt: doc.expiresAt,
    isActive: doc.isActive,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt,
  };
}

/**
 * Public validation response for buyers at checkout.
 * Strips admin-only fields like usedCount, createdBy, usageLimit.
 */
export function toCouponValidationDTO(result) {
  return {
    valid: result.valid,
    code: result.code,
    discountType: result.discountType,
    discountValue: result.discountValue,
    minOrderAmount: result.minOrderAmount ?? 0,
    maxDiscountAmount: result.maxDiscountAmount ?? null,
    discount: result.discount,
    finalAmount: result.finalAmount,
  };
}
