import { z } from 'zod';

export const createServicePackageSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    price: z.coerce.number().min(0),
    deliveryDays: z.coerce.number().int().min(1),
    revisions: z.coerce.number().int().min(0).optional().default(0),
    features: z.array(z.string()).optional().default([]),
    templateId: z.string().min(1),
    category: z.enum([
      'webflow-development',
      'framer-development',
      'wix-development',
      'custom-design',
      'migration',
      'other'
    ]).optional().default('custom-design'),
    requirements: z.string().max(5000).optional().default(''),
    tags: z.array(z.string()).optional().default([]),
  })
});

export const listServicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
  sort: z.enum(['newest', 'popular', 'price_low', 'price_high']).optional().default('popular'),
  category: z.enum([
    'webflow-development',
    'framer-development',
    'wix-development',
    'custom-design',
    'migration',
    'other'
  ]).optional(),
  search: z.string().max(200).optional(),
  creatorId: z.string().optional(),
  templateId: z.string().optional(),
});

export const updateServicePackageSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    price: z.coerce.number().min(0).optional(),
    deliveryDays: z.coerce.number().int().min(1).optional(),
    revisions: z.coerce.number().int().min(0).optional(),
    features: z.array(z.string()).optional(),
    category: z.enum([
      'webflow-development',
      'framer-development',
      'wix-development',
      'custom-design',
      'migration',
      'other'
    ]).optional(),
    requirements: z.string().max(5000).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  })
});
