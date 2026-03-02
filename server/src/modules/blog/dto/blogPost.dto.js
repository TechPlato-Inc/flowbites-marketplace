/**
 * List-view DTO — used for post listings, featured, and related posts.
 * Excludes heavy fields like full content.
 */
export function toBlogPostDTO(doc) {
  return {
    _id: doc._id,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt || null,
    coverImage: doc.coverImage || null,
    author: doc.author
      ? {
          _id: doc.author._id || doc.author,
          name: doc.author.name || null,
          avatar: doc.author.avatar || null,
        }
      : null,
    category: doc.category,
    tags: doc.tags || [],
    status: doc.status,
    viewCount: doc.stats?.views || 0,
    readTime: doc.readTime || null,
    isFeatured: doc.isFeatured || false,
    publishedAt: doc.publishedAt || null,
    createdAt: doc.createdAt,
  };
}

/**
 * Detail DTO — extends list-view with content and meta fields.
 * Used when returning a single post for reading.
 */
export function toBlogDetailDTO(doc) {
  return {
    ...toBlogPostDTO(doc),
    content: doc.content,
    metaTitle: doc.metaTitle || null,
    metaDescription: doc.metaDescription || null,
    authorName: doc.authorName || null,
    authorRole: doc.authorRole || null,
    stats: {
      views: doc.stats?.views || 0,
      likes: doc.stats?.likes || 0,
      shares: doc.stats?.shares || 0,
    },
    updatedAt: doc.updatedAt,
  };
}
