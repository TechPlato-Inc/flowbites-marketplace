import { MessagingService } from './messaging.service.js';

const messagingService = new MessagingService();

export class MessagingController {
  async getConversations(req, res, next) {
    try {
      const data = await messagingService.getConversations(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async createConversation(req, res, next) {
    try {
      const data = await messagingService.createConversation(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req, res, next) {
    try {
      const data = await messagingService.getUnreadCount(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req, res, next) {
    try {
      const data = await messagingService.searchUsers(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req, res, next) {
    try {
      const data = await messagingService.getConversation(
        req.params.id,
        req.user._id,
        req.query
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const data = await messagingService.sendMessage(
        req.params.id,
        req.user._id,
        req.body,
        req.files || []
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const data = await messagingService.markAsRead(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req, res, next) {
    try {
      const data = await messagingService.deleteConversation(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
