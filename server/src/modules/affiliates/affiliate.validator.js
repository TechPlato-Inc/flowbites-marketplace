import { z } from 'zod';

export const registerAffiliateSchema = z.object({
  body: z.object({
    website: z.string().url().max(500).optional(),
    promotionMethod: z.string().min(10).max(1000),
  }),
});

export const payoutRequestSchema = z.object({
  body: z.object({
    amount: z.number().positive().min(50, 'Minimum payout is $50'),
    paymentMethod: z.enum(['stripe', 'paypal', 'bank_transfer']).optional(),
    notes: z.string().max(500).optional(),
  }),
});

export const adminModerateAffiliateSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected', 'suspended']),
    rejectionReason: z.string().max(500).optional(),
    commissionRate: z.number().min(0).max(100).optional(),
  }),
});

export const adminProcessPayoutSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'paid', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
  }),
});
