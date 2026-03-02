export function toTemplateListItemDTO(doc) {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    thumbnail: doc.thumbnail,
    gallery: doc.gallery || [],
    platform: doc.platform,
    price: doc.price,
    salePrice: doc.salePrice ?? null,
    isFeatured: doc.isFeatured || false,
    madeByFlowbites: doc.madeByFlowbites || false,
    category: doc.category
      ? { _id: doc.category._id || doc.category, name: doc.category.name, slug: doc.category.slug }
      : null,
    creatorProfileId: doc.creatorProfileId
      ? {
          _id: doc.creatorProfileId._id,
          displayName: doc.creatorProfileId.displayName,
          username: doc.creatorProfileId.username,
          avatar: doc.creatorProfileId.avatar,
          isVerified: doc.creatorProfileId.isVerified,
          stats: doc.creatorProfileId.stats,
        }
      : null,
    creatorId: doc.creatorId,
    stats: {
      views: doc.stats?.views || 0,
      purchases: doc.stats?.purchases || 0,
      likes: doc.stats?.likes || 0,
      downloads: doc.stats?.downloads || 0,
      revenue: doc.stats?.revenue || 0,
      averageRating: doc.stats?.averageRating || 0,
      totalReviews: doc.stats?.totalReviews || 0,
    },
    demoUrl: doc.demoUrl || null,
    createdAt: doc.createdAt,
  };
}
