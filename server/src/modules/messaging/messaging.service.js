import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';

const notificationService = new NotificationService();

export class MessagingService {
  /**
   * Get all conversations for a user, paginated.
   */
  async getConversations(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const userIdStr = userId.toString();
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

    // Transform unreadCount Map to a plain number for the requesting user
    const transformed = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCount?.[userIdStr] || 0,
    }));

    return {
      conversations: transformed,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Create a new conversation or reuse an existing one between the same participants.
   * Also creates the initial message.
   */
  async createConversation(userId, { recipientId, initialMessage, relatedTemplateId, relatedOrderId }) {
    if (userId.toString() === recipientId) {
      throw new AppError('Cannot start a conversation with yourself', 400);
    }

    const recipient = await User.findById(recipientId).select('_id name');
    if (!recipient) {
      throw new AppError('Recipient not found', 404);
    }

    // Check for an existing conversation between the same two users with the same context
    const existingQuery = {
      participants: { $all: [userId, recipientId], $size: 2 },
    };
    if (relatedTemplateId) existingQuery.relatedTemplate = relatedTemplateId;
    if (relatedOrderId) existingQuery.relatedOrder = relatedOrderId;

    let conversation = await Conversation.findOne(existingQuery);

    if (conversation) {
      // Add the message to the existing conversation
      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: initialMessage,
        readBy: [userId],
      });

      conversation.lastMessage = message._id;
      conversation.unreadCount.set(recipientId, (conversation.unreadCount.get(recipientId) || 0) + 1);
      await conversation.save();
    } else {
      // Create a new conversation
      conversation = await Conversation.create({
        participants: [userId, recipientId],
        relatedTemplate: relatedTemplateId || null,
        relatedOrder: relatedOrderId || null,
        unreadCount: new Map([[recipientId, 1], [userId.toString(), 0]]),
      });

      const message = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: initialMessage,
        readBy: [userId],
      });

      conversation.lastMessage = message._id;
      await conversation.save();
    }

    // Re-fetch with full populations
    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role')
      .populate('lastMessage', 'content senderId createdAt')
      .populate('relatedTemplate', 'title thumbnail')
      .populate('relatedOrder', 'orderNumber')
      .lean();

    populated.unreadCount = populated.unreadCount?.[userId.toString()] || 0;

    // Notify recipient (non-blocking)
    const sender = await User.findById(userId).select('name');
    notificationService.create({
      userId: recipientId,
      type: 'new_message',
      title: 'New message',
      message: `${sender?.name || 'Someone'} sent you a message`,
      link: `/dashboard/messages/${conversation._id}`,
      metadata: { conversationId: conversation._id.toString() },
    }).catch(() => {});

    return populated;
  }

  /**
   * Get a single conversation with paginated messages.
   */
  async getConversation(conversationId, userId, { page = 1, limit = 50 } = {}) {
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
      p => p._id.toString() === userId.toString()
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

    conversation.unreadCount = conversation.unreadCount?.[userId.toString()] || 0;

    return {
      conversation,
      messages,
      pagination: { page, limit, total: totalMessages, pages: Math.ceil(totalMessages / limit) },
    };
  }

  /**
   * Send a message in a conversation.
   */
  async sendMessage(conversationId, userId, { content }, files = []) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new AppError('Not authorized', 403);
    }

    const attachments = files.map(file => ({
      url: file.path || file.location,
      type: file.mimetype.startsWith('image/') ? 'image' : 'file',
      name: file.originalname,
    }));

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content,
      attachments,
      readBy: [userId],
    });

    // Update conversation
    conversation.lastMessage = message._id;
    for (const participantId of conversation.participants) {
      const pIdStr = participantId.toString();
      if (pIdStr !== userId.toString()) {
        conversation.unreadCount.set(pIdStr, (conversation.unreadCount.get(pIdStr) || 0) + 1);
      }
    }
    await conversation.save();

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .lean();

    // Notify other participants (non-blocking)
    const sender = await User.findById(userId).select('name');
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId.toString()) {
        notificationService.create({
          userId: participantId,
          type: 'new_message',
          title: 'New message',
          message: `${sender?.name || 'Someone'} sent you a message`,
          link: `/dashboard/messages/${conversationId}`,
          metadata: { conversationId: conversationId.toString() },
        }).catch(() => {});
      }
    }

    return populated;
  }

  /**
   * Mark a conversation as read for the requesting user.
   */
  async markAsRead(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new AppError('Not authorized', 403);
    }

    conversation.unreadCount.set(userId.toString(), 0);
    await conversation.save();

    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return { success: true };
  }

  /**
   * Delete/leave a conversation.
   */
  async deleteConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new AppError('Not authorized', 403);
    }

    conversation.participants = conversation.participants.filter(
      p => p.toString() !== userId.toString()
    );

    if (conversation.participants.length === 0) {
      await Promise.all([
        Message.deleteMany({ conversationId }),
        Conversation.findByIdAndDelete(conversationId),
      ]);
    } else {
      await conversation.save();
    }

    return { deleted: true };
  }

  /**
   * Get total unread count across all conversations.
   */
  async getUnreadCount(userId) {
    const conversations = await Conversation.find({ participants: userId })
      .select('unreadCount')
      .lean();

    const userIdStr = userId.toString();
    let count = 0;
    for (const conv of conversations) {
      count += conv.unreadCount?.[userIdStr] || 0;
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
