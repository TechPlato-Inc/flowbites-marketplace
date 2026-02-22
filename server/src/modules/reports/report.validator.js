import { z } from 'zod';

export const createReportSchema = z.object({
  body: z.object({
    targetType: z.enum(['template', 'review', 'creator', 'user']),
    targetId: z.string().min(1, 'Target ID is required'),
    reason: z.enum([
      'spam',
      'inappropriate_content',
      'copyright_violation',
      'misleading',
      'scam',
      'harassment',
      'other',
    ]),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  }),
});

export const resolveReportSchema = z.object({
  body: z.object({
    adminNote: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
    actionTaken: z.enum(['none', 'content_removed', 'user_warned', 'user_banned']).optional(),
  }),
});

export const dismissReportSchema = z.object({
  body: z.object({
    adminNote: z.string().max(1000, 'Note cannot exceed 1000 characters').optional(),
  }),
});
