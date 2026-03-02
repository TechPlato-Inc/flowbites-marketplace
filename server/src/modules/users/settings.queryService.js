import { User } from './user.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class SettingsQueryService {
  /**
   * Return the full user document (without password / refreshTokens).
   * Used by the controller so the DTO can pick the fields it needs.
   */
  async getFullUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
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
   * Get user's in-app notification preferences.
   */
  async getNotificationPreferences(userId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    return user.notificationPreferences || {
      orders: true,
      templates: true,
      reviews: true,
      services: true,
      social: true,
      financial: true,
      support: true,
      account: true,
      system: true,
    };
  }
}
