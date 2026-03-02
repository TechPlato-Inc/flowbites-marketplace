import { z } from 'zod';

// --- Profile ---

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters').optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  }),
});

// --- Password ---

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

// --- Email preferences ---

export const updateEmailPreferencesSchema = z.object({
  body: z.object({
    orderConfirmations: z.boolean().optional(),
    reviewNotifications: z.boolean().optional(),
    promotionalEmails: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    newFollowerAlert: z.boolean().optional(),
  }),
});

// --- In-app notification preferences ---

export const updateNotificationPreferencesSchema = z.object({
  body: z.object({
    orders: z.boolean().optional(),
    templates: z.boolean().optional(),
    reviews: z.boolean().optional(),
    services: z.boolean().optional(),
    social: z.boolean().optional(),
    financial: z.boolean().optional(),
    support: z.boolean().optional(),
    account: z.boolean().optional(),
    system: z.boolean().optional(),
  }),
});

// --- Combined settings (notification + privacy in one call) ---

export const updateSettingsSchema = z.object({
  body: z.object({
    notificationPreferences: z.object({
      orders: z.boolean().optional(),
      templates: z.boolean().optional(),
      reviews: z.boolean().optional(),
      services: z.boolean().optional(),
      social: z.boolean().optional(),
      financial: z.boolean().optional(),
      support: z.boolean().optional(),
      account: z.boolean().optional(),
      system: z.boolean().optional(),
    }).optional(),
    emailPreferences: z.object({
      orderConfirmations: z.boolean().optional(),
      reviewNotifications: z.boolean().optional(),
      promotionalEmails: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      newFollowerAlert: z.boolean().optional(),
    }).optional(),
  }).refine(
    (data) => data.notificationPreferences || data.emailPreferences,
    { message: 'At least one preference group is required' },
  ),
});

// --- Admin user listing query ---

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
    role: z.enum(['buyer', 'creator', 'admin', 'super_admin']).optional(),
    status: z.enum(['active', 'inactive', 'banned']).optional(),
    search: z.string().max(200).optional(),
  }),
});

// --- Account deactivation ---

export const deactivateAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required'),
  }),
});
