import { Notification } from './notification.model.js';
import { toNotificationDTO } from './dto/notification.dto.js';

export class NotificationQueryService {
  /**
   * Get notifications for a user (paginated), with optional type and unread filters.
   * Returns DTO-mapped results.
   */
  async getUserNotifications(userId, { page = 1, limit = 20, type, unread } = {}) {
    const skip = (page - 1) * limit;
    const filter = { userId };

    if (type) {
      filter.type = type;
    }

    if (unread === 'true') {
      filter.read = false;
    } else if (unread === 'false') {
      filter.read = true;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return {
      notifications: notifications.map(toNotificationDTO),
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get unread count for a user.
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ userId, read: false });
    return { unreadCount: count };
  }
}
