import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(30),
    description: z.string().max(200).optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().optional(),
    applicableTo: z.enum(['all', 'templates', 'services']).optional(),
    specificTemplates: z.array(z.string()).optional(),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime(),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    couponId: z.string().min(1),
  }),
  body: z.object({
    description: z.string().max(200).optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    discountValue: z.number().positive().optional(),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    perUserLimit: z.number().int().positive().optional(),
    applicableTo: z.enum(['all', 'templates', 'services']).optional(),
    specificTemplates: z.array(z.string()).optional(),
    startsAt: z.string().datetime().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Coupon code is required'),
    orderAmount: z.number().positive(),
    itemType: z.enum(['templates', 'services']).optional(),
  }),
});

export const listCouponsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    active: z.enum(['true', 'false']).optional(),
    search: z.string().max(100).optional(),
  }),
});
