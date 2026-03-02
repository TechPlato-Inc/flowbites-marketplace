import { Conversation } from './conversation.model.js';
import { Message } from './message.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';
import { toConversationDTO } from './dto/conversation.dto.js';
import { toMessageDTO } from './dto/message.dto.js';

export class MessagingWriteService {
  /**
   * Create a new conversation or reuse an existing one between the same participants.
   * Optionally sends an initial message.
   * Emits MESSAGE_SENT if a message is included.
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
    let messageDoc = null;

    if (conversation) {
      // Add the message to the existing conversation
      messageDoc = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: initialMessage,
        readBy: [userId],
      });

      conversation.lastMessage = messageDoc._id;
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

      messageDoc = await Message.create({
        conversationId: conversation._id,
        senderId: userId,
        content: initialMessage,
        readBy: [userId],
      });

      conversation.lastMessage = messageDoc._id;
      await conversation.save();
    }

    // Emit domain event
    if (messageDoc) {
      eventBus.emit(EVENTS.MESSAGE_SENT, {
        conversationId: conversation._id.toString(),
        senderId: userId.toString(),
        recipientId: recipientId.toString(),
        messageId: messageDoc._id.toString(),
      });
    }

    // Re-fetch with full populations
    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar role')
      .populate('lastMessage', 'content senderId createdAt')
      .populate('relatedTemplate', 'title thumbnail')
      .populate('relatedOrder', 'orderNumber')
      .lean();

    return toConversationDTO(populated, userId);
  }

  /**
   * Send a message in a conversation.
   * Emits MESSAGE_SENT after creating the message.
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

    // Update conversation metadata
    conversation.lastMessage = message._id;
    for (const participantId of conversation.participants) {
      const pIdStr = participantId.toString();
      if (pIdStr !== userId.toString()) {
        conversation.unreadCount.set(pIdStr, (conversation.unreadCount.get(pIdStr) || 0) + 1);
      }
    }
    await conversation.save();

    // Emit domain event for each recipient
    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId.toString()) {
        eventBus.emit(EVENTS.MESSAGE_SENT, {
          conversationId: conversationId.toString(),
          senderId: userId.toString(),
          recipientId: participantId.toString(),
          messageId: message._id.toString(),
        });
      }
    }

    const populated = await Message.findById(message._id)
      .populate('senderId', 'name avatar')
      .lean();

    return toMessageDTO(populated);
  }

  /**
   * Mark all messages in a conversation as read for the requesting user.
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
}
