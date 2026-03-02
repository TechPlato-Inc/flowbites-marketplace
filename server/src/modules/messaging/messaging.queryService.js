import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { toConversationDTO } from './dto/conversation.dto.js';
import { toMessageDTO } from './dto/message.dto.js';

export class MessagingQueryService {
  /**
   * Get all conversations for a user, paginated.
   * Returns DTO-mapped conversations.
   */
  async listConversations(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const filter = { participants: userId };

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .populate('participants', 'name avatar role')
        .populate('lastMessage', 'content senderId createdAt')
        .populate('relatedTemplate', 'title thumbnail')
        .populate('relatedOrder', 'orderNumber')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Conversation.countDocuments(filter),
    ]);

    return {
      conversations: conversations.map(c => toConversationDTO(c, userId)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a single conversation with paginated messages.
   * Returns DTO-mapped conversation and messages.
   */
  async getMessages(conversationId, userId, { page = 1, limit = 50 } = {}) {
    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name avatar role')
      .populate('lastMessage', 'content senderId createdAt')
      .populate('relatedTemplate', 'title thumbnail')
      .populate('relatedOrder', 'orderNumber')
      .lean();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const isParticipant = conversation.participants.some(
      p => (p._id || p).toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new AppError('Not authorized', 403);
    }

    const skip = (page - 1) * limit;
    const [messages, totalMessages] = await Promise.all([
      Message.find({ conversationId })
        .populate('senderId', 'name avatar')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ conversationId }),
    ]);

    return {
      conversation: toConversationDTO(conversation, userId),
      messages: messages.map(toMessageDTO),
      pagination: { page, limit, total: totalMessages, pages: Math.ceil(totalMessages / limit) },
    };
  }

  /**
   * Get total unread count across all conversations for a user.
   * Returns a single number.
   */
  async getUnreadCount(userId) {
    const conversations = await Conversation.find({ participants: userId })
      .select('unreadCount')
      .lean();

    const userIdStr = userId.toString();
    let count = 0;
    for (const conv of conversations) {
      if (conv.unreadCount) {
        count += conv.unreadCount[userIdStr] || 0;
      }
    }

    return { count };
  }

  /**
   * Search users for new message recipient.
   */
  async searchUsers(userId, { q, limit = 10 }) {
    if (!q || q.length < 2) {
      return { users: [] };
    }

    const users = await User.find({
      _id: { $ne: userId },
      isActive: true,
      isBanned: false,
      name: { $regex: q, $options: 'i' },
    })
      .select('name avatar role')
      .limit(limit)
      .lean();

    return { users };
  }
}
