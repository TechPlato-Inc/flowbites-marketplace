import express from 'express';
import { NotificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticate);

// GET /notifications — list notifications (supports ?page, ?limit, ?unreadOnly)
router.get('/', notificationController.getNotifications);

// GET /notifications/unread-count — quick badge count
router.get('/unread-count', notificationController.getUnreadCount);

// PATCH /notifications/read-all — mark all as read
router.patch('/read-all', notificationController.markAllAsRead);

// PATCH /notifications/:id/read — mark single as read
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /notifications/:id — delete notification
router.delete('/:id', notificationController.deleteNotification);

export default router;
