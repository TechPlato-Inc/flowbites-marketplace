import { Wishlist } from './wishlist.model.js';
import { Template } from '../templates/template.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class WishlistWriteService {
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
}
