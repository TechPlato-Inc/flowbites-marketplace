/**
 * Maps a Wishlist document (or lean object with populated templateId)
 * to a safe, consistent DTO returned to API consumers.
 */
export function toWishlistItemDTO(doc) {
  const template = doc.templateId;

  return {
    _id: doc._id,
    templateId: template && typeof template === 'object'
      ? {
          _id: template._id,
          title: template.title || null,
          slug: template.slug || null,
          thumbnail: template.thumbnail || null,
          price: template.price ?? null,
        }
      : template,
    createdAt: doc.createdAt,
  };
}
