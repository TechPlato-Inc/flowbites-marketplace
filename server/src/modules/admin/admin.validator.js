import { z } from 'zod';

export const listTemplatesQuerySchema = z.object({
  status: z.string().optional(),
  platform: z.string().optional(),
  category: z.string().optional(),
  search: z.string().max(200).optional(),
  featured: z.enum(['true', 'false']).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'most_views', 'most_purchases', 'price_high', 'price_low', 'most_revenue']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const listCreatorsQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const rejectTemplateSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required').max(1000),
  }),
});

export const bulkActionSchema = z.object({
  body: z.object({
    action: z.enum(['approve', 'reject', 'delete', 'feature', 'unfeature']),
    templateIds: z.array(z.string().min(1)).min(1).max(100),
    reason: z.string().max(1000).optional(),
  }),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    price: z.number().min(0).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    madeByFlowbites: z.boolean().optional(),
    metaDescription: z.string().max(300).optional(),
    keywords: z.array(z.string()).optional(),
    licenseType: z.string().optional(),
  }),
});

export const rejectCreatorSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required').max(1000),
  }),
});
