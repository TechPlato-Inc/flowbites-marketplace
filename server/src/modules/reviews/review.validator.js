import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(1).max(150),
    comment: z.string().min(1).max(2000),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(1).max(150).optional(),
    comment: z.string().min(1).max(2000).optional(),
  }),
});

export const moderateReviewSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().max(500).optional(),
  }),
});
