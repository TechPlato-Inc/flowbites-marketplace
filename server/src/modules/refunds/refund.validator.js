import { z } from 'zod';

export const requestRefundSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    reason: z.string().min(1).max(1000),
  }),
});

export const rejectRefundSchema = z.object({
  body: z.object({
    adminNote: z.string().max(500).optional(),
  }),
});
