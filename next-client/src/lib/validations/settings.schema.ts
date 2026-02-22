import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name too long")
    .optional(),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(12, "New password must be at least 12 characters"),
});

export const emailPreferencesSchema = z.object({
  orderConfirmation: z.boolean().optional(),
  reviewNotification: z.boolean().optional(),
  followerNotification: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type EmailPreferencesInput = z.infer<typeof emailPreferencesSchema>;
