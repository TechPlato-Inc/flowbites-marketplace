import { z } from 'zod';

export const listOrdersQuerySchema = z.object({
  status: z.enum(['pending', 'paid', 'failed', 'refunded', 'expired']).optional(),
  sort: z.enum(['newest', 'oldest']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const createOrderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      type: z.enum(['template', 'service']),
      templateId: z.string().optional(),
      servicePackageId: z.string().optional(),
    })).min(1).max(10),
  }),
});

export const mockCheckoutSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'Order ID is required'),
  }),
});
