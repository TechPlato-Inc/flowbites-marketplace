export function toCategoryDTO(doc) {
  const parent = doc.parent
    ? { _id: doc.parent._id || doc.parent, name: doc.parent.name || null, slug: doc.parent.slug || null }
    : null;

  return {
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    description: doc.description || null,
    icon: doc.icon || null,
    image: doc.image || null,
    parent,
    templateCount: doc.templateCount || 0,
    isActive: doc.isActive ?? true,
    order: doc.order || 0,
    createdAt: doc.createdAt,
  };
}

export function toTagDTO(doc) {
  return {
    _id: doc._id,
    name: doc.name,
    slug: doc.slug,
    usageCount: doc.usageCount || 0,
    createdAt: doc.createdAt,
  };
}
