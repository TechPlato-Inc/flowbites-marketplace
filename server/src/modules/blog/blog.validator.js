import { z } from 'zod';

export const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    excerpt: z.string().max(300, 'Excerpt cannot exceed 300 characters').optional(),
    category: z.string().min(1, 'Category is required').optional(),
    tags: z.array(z.string().max(50)).max(10, 'Maximum 10 tags').optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

export const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters').optional(),
    content: z.string().min(50, 'Content must be at least 50 characters').optional(),
    excerpt: z.string().max(300, 'Excerpt cannot exceed 300 characters').optional(),
    category: z.string().optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});
