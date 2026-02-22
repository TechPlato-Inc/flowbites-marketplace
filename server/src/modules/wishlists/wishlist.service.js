import { Wishlist } from './wishlist.model.js';
import { Template } from '../templates/template.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class WishlistService {
  /**
   * Add a template to the user's wishlist.
   */
  async addToWishlist(userId, templateId) {
    const template = await Template.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);

    const existing = await Wishlist.findOne({ userId, templateId });
    if (existing) throw new AppError('Template is already in your wishlist', 400);

    const item = await Wishlist.create({ userId, templateId });
    return item;
  }

  /**
   * Remove a template from the user's wishlist.
   */
  async removeFromWishlist(userId, templateId) {
    const item = await Wishlist.findOneAndDelete({ userId, templateId });
    if (!item) throw new AppError('Template is not in your wishlist', 404);
    return { removed: true };
  }

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
