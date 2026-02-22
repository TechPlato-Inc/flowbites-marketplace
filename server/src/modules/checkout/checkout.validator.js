import { z } from 'zod';

export const templateCheckoutSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      templateId: z.string().min(1, 'Template ID is required'),
    })).min(1, 'At least one item is required').max(10, 'Maximum 10 items per checkout'),
    couponCode: z.string().max(50).optional(),
  }),
});

export const serviceCheckoutSchema = z.object({
  body: z.object({
    packageId: z.string().min(1, 'Package ID is required'),
    requirements: z.string().min(10, 'Requirements must be at least 10 characters').max(5000, 'Requirements cannot exceed 5000 characters').optional(),
  }),
});
