import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional(),
  dateFrom: z.string().datetime({ offset: true }).optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  dateTo: z.string().datetime({ offset: true }).optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  templateId: z.string().min(1).optional(),
  creatorId: z.string().min(1).optional(),
});

export const trackEventSchema = z.object({
  body: z.object({
    event: z.string().min(1).max(100),
    templateId: z.string().min(1).optional(),
    metadata: z.record(z.unknown()).optional().default({}),
  }),
});
