import { toTicketMessageDTO } from './ticketMessage.dto.js';

/**
 * Maps a Ticket document (lean object) to a list-level DTO.
 * Does NOT include the messages array.
 */
export function toTicketDTO(doc) {
  return {
    _id: doc._id,
    userId: doc.userId?._id || doc.userId,
    subject: doc.subject,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    assignedTo: doc.assignedTo
      ? {
          _id: doc.assignedTo._id || doc.assignedTo,
          name: doc.assignedTo.name || null,
        }
      : null,
    lastReplyAt: doc.updatedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Maps a Ticket document (lean, populated) to a detail-level DTO.
 * Extends the list DTO with the full messages array.
 */
export function toTicketDetailDTO(doc) {
  return {
    ...toTicketDTO(doc),
    userId: doc.userId && typeof doc.userId === 'object'
      ? {
          _id: doc.userId._id,
          name: doc.userId.name || null,
          email: doc.userId.email || null,
          avatar: doc.userId.avatar || null,
        }
      : doc.userId,
    messages: (doc.messages || []).map(toTicketMessageDTO),
  };
}
