import { z } from 'zod';

const BLOG_CATEGORIES = [
  'Web Design', 'Webflow', 'Framer', 'Wix',
  'No-Code', 'Business', 'Tutorials', 'Trends',
  'SEO', 'Freelancing',
];

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
    content: z.string().min(50, 'Content must be at least 50 characters'),
    excerpt: z.string().max(500, 'Excerpt cannot exceed 500 characters').optional(),
    category: z.enum(BLOG_CATEGORIES, { errorMap: () => ({ message: 'Invalid blog category' }) }),
    tags: z.array(z.string().trim().max(50)).max(10, 'Maximum 10 tags').optional(),
    coverImage: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters').optional(),
    content: z.string().min(50, 'Content must be at least 50 characters').optional(),
    excerpt: z.string().max(500, 'Excerpt cannot exceed 500 characters').optional(),
    category: z.enum(BLOG_CATEGORIES, { errorMap: () => ({ message: 'Invalid blog category' }) }).optional(),
    tags: z.array(z.string().trim().max(50)).max(10, 'Maximum 10 tags').optional(),
    coverImage: z.string().optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
  }),
});

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  category: z.string().optional(),
  tag: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().max(200).optional(),
  sort: z.enum(['newest', 'oldest', 'popular', 'title']).default('newest'),
});

// Keep legacy aliases so existing route imports still work
export const createBlogSchema = createPostSchema;
export const updateBlogSchema = updatePostSchema;
