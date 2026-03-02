import { z } from 'zod';

// ── Creator: request a withdrawal ────────────────────────────────────────────
export const createWithdrawalSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: 'Amount is required' })
      .min(10, 'Minimum withdrawal is $10')
      .max(100000, 'Maximum withdrawal is $100,000'),
    payoutMethod: z
      .enum(['stripe_connect', 'bank_transfer', 'paypal'])
      .optional(),
    note: z
      .string()
      .max(500, 'Note cannot exceed 500 characters')
      .optional(),
  }),
});

// Keep the old name as an alias so existing imports do not break
export const requestWithdrawalSchema = createWithdrawalSchema;

// ── Shared: paginated listing with optional status filter ────────────────────
export const listWithdrawalsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z
      .enum(['pending', 'approved', 'processing', 'completed', 'rejected'])
      .optional(),
  }),
});

// ── Admin: reject a withdrawal ───────────────────────────────────────────────
export const rejectWithdrawalSchema = z.object({
  body: z.object({
    adminNote: z
      .string()
      .min(1, 'Rejection reason is required')
      .max(500, 'Note cannot exceed 500 characters'),
  }),
});

// ── Admin: mark a withdrawal as completed ────────────────────────────────────
export const completeWithdrawalSchema = z.object({
  body: z.object({
    stripeTransferId: z.string().optional(),
  }),
});
