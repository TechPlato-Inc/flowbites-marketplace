import { z } from 'zod';

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  search: z.string().max(200).optional(),
  parent: z.string().max(100).optional(),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(200).optional(),
    parent: z.string().optional(),
    description: z.string().max(2000).optional(),
    icon: z.string().max(500).optional(),
    color: z.string().max(50).optional(),
    image: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    order: z.coerce.number().int().min(0).optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    slug: z.string().min(1).max(200).optional(),
    parent: z.string().optional(),
    description: z.string().max(2000).optional(),
    icon: z.string().max(500).optional(),
    color: z.string().max(50).optional(),
    image: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
    order: z.coerce.number().int().min(0).optional(),
  }),
});
