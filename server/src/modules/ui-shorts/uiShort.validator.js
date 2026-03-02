import { z } from 'zod';

export const createUiShortSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
    description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
    templateId: z.string().optional(),
    tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags').optional(),
    colors: z.array(z.string()).optional(),
  }),
});

export const listUiShortsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    sort: z.enum(['recent', 'popular']).optional().default('recent'),
    search: z.string().max(200).optional(),
  }),
});

export const adminListUiShortsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    creatorId: z.string().optional(),
  }),
});

export const adminDeleteUiShortSchema = z.object({
  body: z.object({
    reason: z.string().max(500).optional(),
  }),
});
