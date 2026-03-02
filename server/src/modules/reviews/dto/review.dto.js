export function toReviewDTO(doc) {
  return {
    _id: doc._id,
    templateId: doc.templateId?._id || doc.templateId,
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    status: doc.status,
    buyer: doc.buyerId ? {
      _id: doc.buyerId._id || doc.buyerId,
      name: doc.buyerId.name || null,
      avatar: doc.buyerId.avatar || null,
    } : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function toAdminReviewDTO(doc) {
  return {
    ...toReviewDTO(doc),
    buyer: doc.buyerId ? {
      _id: doc.buyerId._id || doc.buyerId,
      name: doc.buyerId.name || null,
      email: doc.buyerId.email || null,
      avatar: doc.buyerId.avatar || null,
    } : null,
    template: doc.templateId ? {
      _id: doc.templateId._id || doc.templateId,
      title: doc.templateId.title || null,
      slug: doc.templateId.slug || null,
      thumbnail: doc.templateId.thumbnail || null,
    } : null,
    orderId: doc.orderId,
    rejectionReason: doc.rejectionReason || null,
    moderatedBy: doc.moderatedBy || null,
    moderatedAt: doc.moderatedAt || null,
  };
}
