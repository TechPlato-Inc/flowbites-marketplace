import { z } from 'zod';

export const listCreatorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(24),
  sort: z.enum(['popular', 'newest', 'templates']).optional().default('popular'),
  search: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
});

export const submitOnboardingSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(200),
    phone: z.string().min(1).max(50),
    country: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    address: z.string().min(1).max(500),
    displayName: z.string().min(1).max(100).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    website: z.string().url().optional().or(z.literal('')),
    twitter: z.string().max(200).optional(),
    dribbble: z.string().max(200).optional(),
    github: z.string().max(200).optional(),
    portfolio: z.string().url().optional().or(z.literal('')),
    payoutEmail: z.string().email().optional(),
  }),
});
