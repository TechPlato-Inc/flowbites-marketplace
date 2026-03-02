/**
 * Shape a ServicePackage document into the standard list-item DTO.
 */
export function toServicePackageDTO(doc) {
  return {
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    price: doc.price,
    deliveryDays: doc.deliveryDays,
    revisions: doc.revisions ?? 0,
    features: doc.features || [],
    category: doc.category || null,
    templateId: doc.templateId
      ? {
          _id: doc.templateId._id || doc.templateId,
          title: doc.templateId.title,
          slug: doc.templateId.slug,
          thumbnail: doc.templateId.thumbnail,
        }
      : null,
    creatorId: doc.creatorId
      ? {
          _id: doc.creatorId._id || doc.creatorId,
          name: doc.creatorId.name,
          avatar: doc.creatorId.avatar,
        }
      : null,
    isActive: doc.isActive ?? true,
    stats: {
      orders: doc.stats?.orders || 0,
      completed: doc.stats?.completed || 0,
      revenue: doc.stats?.revenue || 0,
    },
    createdAt: doc.createdAt,
  };
}

/**
 * Extended detail DTO — includes extra fields not shown in list views.
 */
export function toServiceDetailDTO(doc) {
  return {
    ...toServicePackageDTO(doc),
    requirements: doc.requirements || '',
    thumbnail: doc.thumbnail || null,
    gallery: doc.gallery || [],
    tags: doc.tags || [],
    updatedAt: doc.updatedAt,
  };
}
