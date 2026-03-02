import { MessagingQueryService } from './messaging.queryService.js';
import { MessagingWriteService } from './messaging.writeService.js';
import {
  listConversationsQuerySchema,
  listMessagesQuerySchema,
} from './messaging.validator.js';

const queryService = new MessagingQueryService();
const writeService = new MessagingWriteService();

export class MessagingController {
  // GET / — list user's conversations (paginated)
  async getConversations(req, res, next) {
    try {
      const parsed = listConversationsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const data = await queryService.listConversations(req.user._id, parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST / — create a conversation (with initial message)
  async createConversation(req, res, next) {
    try {
      const data = await writeService.createConversation(req.user._id, req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /unread-count — total unread count
  async getUnreadCount(req, res, next) {
    try {
      const data = await queryService.getUnreadCount(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /search-users — search for recipients
  async searchUsers(req, res, next) {
    try {
      const data = await queryService.searchUsers(req.user._id, req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /:id — get a single conversation with paginated messages
  async getConversation(req, res, next) {
    try {
      const parsed = listMessagesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const data = await queryService.getMessages(req.params.id, req.user._id, parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /:id/messages — send a message
  async sendMessage(req, res, next) {
    try {
      const data = await writeService.sendMessage(
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

  // PATCH /:id/read — mark conversation as read
  async markAsRead(req, res, next) {
    try {
      const data = await writeService.markAsRead(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /:id — leave/delete a conversation
  async deleteConversation(req, res, next) {
    try {
      const data = await writeService.deleteConversation(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
