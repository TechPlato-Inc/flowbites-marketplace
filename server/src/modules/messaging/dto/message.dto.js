/**
 * Maps a Message document (or lean object) to a safe, consistent DTO
 * that is returned to API consumers.
 *
 * @param {Object} doc - A populated, lean Message document.
 * @returns {Object} MessageDTO
 */
export function toMessageDTO(doc) {
  // Normalize sender — the field on the model is `senderId`, populated to a user sub-doc.
  const sender = doc.senderId
    ? {
        _id: doc.senderId._id || doc.senderId,
        name: doc.senderId.name || null,
        avatar: doc.senderId.avatar || null,
      }
    : null;

  return {
    _id: doc._id,
    conversationId: doc.conversationId,
    sender,
    content: doc.content,
    attachments: doc.attachments || [],
    readBy: doc.readBy || [],
    createdAt: doc.createdAt,
  };
}
