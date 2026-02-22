import { NotificationService } from './notification.service.js';

const notificationService = new NotificationService();

export class NotificationController {
  // GET /notifications — list user's notifications
  async getNotifications(req, res, next) {
    try {
      const data = await notificationService.getUserNotifications(req.user._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        unreadOnly: req.query.unreadOnly === 'true',
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /notifications/unread-count — get unread count
  async getUnreadCount(req, res, next) {
    try {
      const data = await notificationService.getUnreadCount(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /notifications/:id/read — mark one as read
  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.user._id, req.params.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /notifications/read-all — mark all as read
  async markAllAsRead(req, res, next) {
    try {
      const data = await notificationService.markAllAsRead(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /notifications/:id — delete a notification
  async deleteNotification(req, res, next) {
    try {
      const data = await notificationService.delete(req.user._id, req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
