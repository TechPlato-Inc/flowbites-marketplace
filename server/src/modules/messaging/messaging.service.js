import { MessagingQueryService } from './messaging.queryService.js';
import { MessagingWriteService } from './messaging.writeService.js';

/**
 * Backwards-compatible facade.
 *
 * If any external module imports MessagingService and calls its methods, those
 * calls are transparently delegated to either MessagingQueryService or
 * MessagingWriteService.  This keeps all existing call-sites working without
 * any changes while the real logic lives in the split services.
 */
export class MessagingService {
  constructor() {
    this._query = new MessagingQueryService();
    this._write = new MessagingWriteService();
  }

  // ─── Read operations (delegated to queryService) ──────────────────────────

  getConversations(userId, opts) {
    return this._query.listConversations(userId, opts);
  }

  getConversation(conversationId, userId, opts) {
    return this._query.getMessages(conversationId, userId, opts);
  }

  getUnreadCount(userId) {
    return this._query.getUnreadCount(userId);
  }

  searchUsers(userId, opts) {
    return this._query.searchUsers(userId, opts);
  }

  // ─── Write operations (delegated to writeService) ─────────────────────────

  createConversation(userId, body) {
    return this._write.createConversation(userId, body);
  }

  sendMessage(conversationId, userId, body, files) {
    return this._write.sendMessage(conversationId, userId, body, files);
  }

  markAsRead(conversationId, userId) {
    return this._write.markAsRead(conversationId, userId);
  }

  deleteConversation(conversationId, userId) {
    return this._write.deleteConversation(conversationId, userId);
  }
}
