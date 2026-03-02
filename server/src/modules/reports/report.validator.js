import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['template', 'review', 'creator', 'user']),
    targetId: z.string().min(1, 'Target ID is required'),
    reason: z.enum([
      'spam',
      'inappropriate_content',
      'copyright_violation',
      'fake_review',
      'misleading',
      'offensive',
      'scam',
      'other',
    ]),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  }),
});

export const resolveReportSchema = z.object({
  body: z.object({
    status: z.enum(['resolved', 'dismissed']).optional().default('resolved'),
    resolution: z.string().max(1000, 'Resolution cannot exceed 1000 characters').optional(),
    adminNote: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
    actionTaken: z.enum(['none', 'content_removed', 'user_warned', 'user_banned', 'other']).optional(),
  }),
});

export const dismissReportSchema = z.object({
  body: z.object({
    adminNote: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
  }),
});

/**
 * Flat query schema — used via safeParse in the controller (not the route middleware).
 */
export const listReportsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['pending', 'reviewing', 'resolved', 'dismissed']).optional(),
  targetType: z.enum(['template', 'review', 'creator', 'user']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});
