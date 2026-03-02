import { User } from './user.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class SettingsWriteService {
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
   * Update in-app notification preferences.
   */
  async updateNotificationPreferences(userId, preferences) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const current = user.notificationPreferences || {};
    user.notificationPreferences = {
      orders: preferences.orders ?? current.orders ?? true,
      templates: preferences.templates ?? current.templates ?? true,
      reviews: preferences.reviews ?? current.reviews ?? true,
      services: preferences.services ?? current.services ?? true,
      social: preferences.social ?? current.social ?? true,
      financial: preferences.financial ?? current.financial ?? true,
      support: preferences.support ?? current.support ?? true,
      account: preferences.account ?? current.account ?? true,
      system: preferences.system ?? current.system ?? true,
    };
    await user.save();

    return user.notificationPreferences;
  }

  /**
   * Bulk-update notification + email preferences in a single call.
   * Returns the full user document so the controller can apply the DTO.
   */
  async updateSettings(userId, { notificationPreferences, emailPreferences }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (notificationPreferences) {
      const current = user.notificationPreferences || {};
      user.notificationPreferences = {
        orders: notificationPreferences.orders ?? current.orders ?? true,
        templates: notificationPreferences.templates ?? current.templates ?? true,
        reviews: notificationPreferences.reviews ?? current.reviews ?? true,
        services: notificationPreferences.services ?? current.services ?? true,
        social: notificationPreferences.social ?? current.social ?? true,
        financial: notificationPreferences.financial ?? current.financial ?? true,
        support: notificationPreferences.support ?? current.support ?? true,
        account: notificationPreferences.account ?? current.account ?? true,
        system: notificationPreferences.system ?? current.system ?? true,
      };
    }

    if (emailPreferences) {
      const current = user.emailPreferences || {};
      user.emailPreferences = {
        orderConfirmations: emailPreferences.orderConfirmations ?? current.orderConfirmations ?? true,
        reviewNotifications: emailPreferences.reviewNotifications ?? current.reviewNotifications ?? true,
        promotionalEmails: emailPreferences.promotionalEmails ?? current.promotionalEmails ?? false,
        weeklyDigest: emailPreferences.weeklyDigest ?? current.weeklyDigest ?? false,
        newFollowerAlert: emailPreferences.newFollowerAlert ?? current.newFollowerAlert ?? true,
      };
    }

    await user.save();
    return user;
  }

  /**
   * Delete user account (soft delete -- deactivate).
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
