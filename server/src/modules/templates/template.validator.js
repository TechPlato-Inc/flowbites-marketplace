import { z } from 'zod';

export const createTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(5000),
    platform: z.enum(['webflow', 'framer', 'wix']),
    category: z.string().min(1),
    tags: z.array(z.string()).optional(),
    price: z.coerce.number().min(0),
    licenseType: z.enum(['personal', 'commercial', 'extended']).optional(),
    deliveryType: z.enum(['clone_link', 'remix_link', 'file_download']).optional(),
    deliveryUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),
    metaDescription: z.string().max(160).optional()
  })
});

export const listTemplatesQuerySchema = z.object({
  q: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  platform: z.enum(['webflow', 'framer', 'wix']).optional(),
  madeBy: z.enum(['flowbites', 'community']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  free: z.enum(['true']).optional(),
  sale: z.enum(['true']).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'popular', 'price_low', 'price_high', 'rating', 'sales']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(24),
});

export const updateTemplateSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    platform: z.enum(['webflow', 'framer', 'wix']).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    price: z.coerce.number().min(0).optional(),
    licenseType: z.enum(['personal', 'commercial', 'extended']).optional(),
    deliveryType: z.enum(['clone_link', 'remix_link', 'file_download']).optional(),
    deliveryUrl: z.string().url().optional().or(z.literal('')),
    demoUrl: z.string().url().optional().or(z.literal('')),
    status: z.enum(['draft', 'pending']).optional()
  })
});
