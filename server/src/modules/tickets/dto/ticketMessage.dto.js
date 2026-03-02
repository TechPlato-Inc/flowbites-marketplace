/**
 * Maps a ticket message sub-document (populated or plain) to a safe,
 * consistent DTO returned to API consumers.
 */
export function toTicketMessageDTO(doc) {
  const sender = doc.senderId;

  return {
    _id: doc._id,
    senderId: sender && typeof sender === 'object'
      ? {
          _id: sender._id,
          name: sender.name || null,
          avatar: sender.avatar || null,
          role: sender.role || null,
        }
      : sender,
    message: doc.message,
    attachments: doc.attachments || [],
    isStaffReply: doc.isStaffReply ?? false,
    createdAt: doc.createdAt,
  };
}
