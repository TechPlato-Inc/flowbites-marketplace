import { NotificationQueryService } from './notification.queryService.js';
import { NotificationWriteService } from './notification.writeService.js';
import { listNotificationsQuerySchema } from './notification.validator.js';

const queryService = new NotificationQueryService();
const writeService = new NotificationWriteService();

export class NotificationController {
  // GET /notifications — list user's notifications
  async getNotifications(req, res, next) {
    try {
      const parsed = listNotificationsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const data = await queryService.getUserNotifications(req.user._id, parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /notifications/unread-count — get unread count
  async getUnreadCount(req, res, next) {
    try {
      const data = await queryService.getUnreadCount(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /notifications/:id/read — mark one as read
  async markAsRead(req, res, next) {
    try {
      const notification = await writeService.markAsRead(req.user._id, req.params.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /notifications/read-all — mark all as read
  async markAllAsRead(req, res, next) {
    try {
      const data = await writeService.markAllAsRead(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /notifications/:id — delete a notification
  async deleteNotification(req, res, next) {
    try {
      const data = await writeService.delete(req.user._id, req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
