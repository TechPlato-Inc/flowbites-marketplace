import { Wishlist } from './wishlist.model.js';

export class WishlistQueryService {
  /**
   * Get user's wishlist (paginated, with template details).
   */
  async getUserWishlist(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Wishlist.find({ userId })
        .populate('templateId', 'title slug price thumbnail creator stats category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Wishlist.countDocuments({ userId }),
    ]);

    // Filter out items where template was deleted
    const validItems = items.filter(item => item.templateId != null);

    return {
      items: validItems,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Check if a specific template is in the user's wishlist.
   */
  async isInWishlist(userId, templateId) {
    const item = await Wishlist.findOne({ userId, templateId });
    return { wishlisted: !!item };
  }

  /**
   * Check multiple templates at once (for listing pages).
   */
  async checkBulkWishlist(userId, templateIds) {
    const items = await Wishlist.find({
      userId,
      templateId: { $in: templateIds },
    }).lean();
    const wishlistedIds = items.map(item => item.templateId.toString());
    return { wishlistedIds };
  }

  /**
   * Get wishlist count for a template (social proof).
   */
  async getWishlistCount(templateId) {
    const count = await Wishlist.countDocuments({ templateId });
    return { count };
  }
}
