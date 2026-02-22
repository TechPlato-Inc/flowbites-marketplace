import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

export const updateEmailPreferencesSchema = z.object({
  body: z.object({
    orderConfirmations: z.boolean().optional(),
    reviewNotifications: z.boolean().optional(),
    promotionalEmails: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    newFollowerAlert: z.boolean().optional(),
  }),
});
