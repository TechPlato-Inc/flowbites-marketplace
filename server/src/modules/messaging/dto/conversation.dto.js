/**
 * Maps a Conversation document (or lean object) to a safe, consistent DTO
 * that is returned to API consumers.
 *
 * @param {Object} doc - A populated, lean Conversation document.
 * @param {string|import('mongoose').Types.ObjectId} currentUserId - The requesting user's ID.
 * @returns {Object} ConversationDTO
 */
export function toConversationDTO(doc, currentUserId) {
  const userIdStr = currentUserId.toString();

  // Normalize participants to { _id, name, avatar }
  const participants = (doc.participants || []).map(p => ({
    _id: p._id || p,
    name: p.name || null,
    avatar: p.avatar || null,
  }));

  // Normalize unreadCount — the model stores a Map keyed by participant ID.
  // The DTO collapses it to a single number for the requesting user.
  let unreadCount = 0;
  if (doc.unreadCount != null) {
    if (typeof doc.unreadCount === 'number') {
      // Already flattened (e.g. from a previous transform)
      unreadCount = doc.unreadCount;
    } else if (doc.unreadCount instanceof Map) {
      unreadCount = doc.unreadCount.get(userIdStr) || 0;
    } else if (typeof doc.unreadCount === 'object') {
      // Lean documents turn Maps into plain objects
      unreadCount = doc.unreadCount[userIdStr] || 0;
    }
  }

  return {
    _id: doc._id,
    participants,
    lastMessage: doc.lastMessage || null,
    unreadCount,
    relatedTemplate: doc.relatedTemplate || null,
    relatedOrder: doc.relatedOrder || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
