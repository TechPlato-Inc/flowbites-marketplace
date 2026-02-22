import { z } from 'zod';

export const requestWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(10, 'Minimum withdrawal is $10').max(100000, 'Maximum withdrawal is $100,000'),
    payoutMethod: z.enum(['stripe_connect', 'bank_transfer']).optional(),
    note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  }),
});

export const rejectWithdrawalSchema = z.object({
  body: z.object({
    adminNote: z.string().min(1, 'Rejection reason is required').max(500, 'Note cannot exceed 500 characters'),
  }),
});

export const completeWithdrawalSchema = z.object({
  body: z.object({
    stripeTransferId: z.string().optional(),
  }),
});
