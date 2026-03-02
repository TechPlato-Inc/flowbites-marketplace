export function toUiShortDTO(doc) {
  return {
    _id: doc._id,
    title: doc.title,
    description: doc.description || null,
    image: doc.image,
    creator: doc.creatorId
      ? {
          _id: doc.creatorId._id || doc.creatorId,
          name: doc.creatorId.name || null,
          avatar: doc.creatorId.avatar || null,
        }
      : null,
    template: doc.templateId
      ? {
          _id: doc.templateId._id || doc.templateId,
          title: doc.templateId.title || null,
          price: doc.templateId.price ?? null,
        }
      : null,
    tags: doc.tags || [],
    colors: doc.colors || [],
    stats: {
      views: doc.stats?.views || 0,
      likes: doc.stats?.likes || 0,
      saves: doc.stats?.saves || 0,
    },
    createdAt: doc.createdAt,
  };
}

export function toAdminUiShortDTO(doc) {
  return {
    ...toUiShortDTO(doc),
    creator: doc.creatorId
      ? {
          _id: doc.creatorId._id || doc.creatorId,
          name: doc.creatorId.name || null,
          email: doc.creatorId.email || null,
          avatar: doc.creatorId.avatar || null,
        }
      : null,
    isPublished: doc.isPublished,
    updatedAt: doc.updatedAt,
  };
}
