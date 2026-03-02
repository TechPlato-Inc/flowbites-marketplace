/**
 * Maps a Notification document (or lean object) to a safe, consistent DTO
 * that is returned to API consumers.
 */
export function toNotificationDTO(doc) {
  return {
    _id: doc._id,
    type: doc.type,
    title: doc.title,
    message: doc.message,
    data: doc.metadata ?? {},
    isRead: doc.read ?? false,
    createdAt: doc.createdAt,
  };
}
