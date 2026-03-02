import { z } from 'zod';

// Buyer: request a refund
export const createRefundSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    reason: z.string().min(1, 'Reason is required').max(1000),
  }),
});

// Admin: approve or reject a refund
export const processRefundSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected'], {
      required_error: 'Status is required',
      invalid_type_error: 'Status must be either approved or rejected',
    }),
    adminNotes: z.string().max(500).optional(),
  }),
});

// Admin: list refund requests with pagination / filter
export const listRefundsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    status: z.enum(['requested', 'approved', 'rejected', 'processed']).optional(),
  }),
});

// Keep legacy aliases so existing imports don't break
export const requestRefundSchema = createRefundSchema;
export const rejectRefundSchema = z.object({
  body: z.object({
    adminNote: z.string().max(500).optional(),
  }),
});
