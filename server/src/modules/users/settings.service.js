import { User } from './user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

export class SettingsService {
  /**
   * Change user's password.
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
    }

    user.password = newPassword;
    // Clear all refresh tokens (force re-login on other devices)
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password changed successfully' };
  }

  /**
   * Update user profile settings.
   */
  async updateProfile(userId, updates) {
    const allowed = ['name', 'bio', 'avatar'];
    const sanitized = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) sanitized[key] = updates[key];
    }

    const user = await User.findByIdAndUpdate(userId, sanitized, { new: true });
    if (!user) throw new AppError('User not found', 404);

    return user;
  }

  /**
   * Update email notification preferences.
   */
  async updateEmailPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.emailPreferences = {
      orderConfirmations: preferences.orderConfirmations ?? user.emailPreferences?.orderConfirmations ?? true,
      reviewNotifications: preferences.reviewNotifications ?? user.emailPreferences?.reviewNotifications ?? true,
      promotionalEmails: preferences.promotionalEmails ?? user.emailPreferences?.promotionalEmails ?? false,
      weeklyDigest: preferences.weeklyDigest ?? user.emailPreferences?.weeklyDigest ?? false,
      newFollowerAlert: preferences.newFollowerAlert ?? user.emailPreferences?.newFollowerAlert ?? true,
    };
    await user.save();

    return user.emailPreferences;
  }

  /**
   * Get user's email preferences.
   */
  async getEmailPreferences(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return user.emailPreferences || {
      orderConfirmations: true,
      reviewNotifications: true,
      promotionalEmails: false,
      weeklyDigest: false,
      newFollowerAlert: true,
    };
  }

  /**
   * Delete user account (soft delete — deactivate).
   */
  async deactivateAccount(userId, password) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Password is incorrect', 400);
    }

    user.isActive = false;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Account deactivated' };
  }
}
