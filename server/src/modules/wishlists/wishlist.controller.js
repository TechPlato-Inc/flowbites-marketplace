import { WishlistQueryService } from './wishlist.queryService.js';
import { WishlistWriteService } from './wishlist.writeService.js';
import { toWishlistItemDTO } from './dto/wishlistItem.dto.js';
import { listWishlistQuerySchema } from './wishlist.validator.js';

const queryService = new WishlistQueryService();
const writeService = new WishlistWriteService();

export class WishlistController {
  // POST /wishlists/:templateId — add to wishlist
  async addToWishlist(req, res, next) {
    try {
      const item = await writeService.addToWishlist(req.user._id, req.params.templateId);
      res.status(201).json({ success: true, data: toWishlistItemDTO(item) });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /wishlists/:templateId — remove from wishlist
  async removeFromWishlist(req, res, next) {
    try {
      const data = await writeService.removeFromWishlist(req.user._id, req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists — get user's wishlist
  async getWishlist(req, res, next) {
    try {
      const parsed = listWishlistQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parsed.error.issues,
        });
      }

      const data = await queryService.getUserWishlist(req.user._id, parsed.data);
      res.json({
        success: true,
        data: {
          items: data.items.map(toWishlistItemDTO),
          pagination: data.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists/check/:templateId — check if wishlisted
  async isInWishlist(req, res, next) {
    try {
      const data = await queryService.isInWishlist(req.user._id, req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /wishlists/check-bulk — check multiple templates
  async checkBulkWishlist(req, res, next) {
    try {
      const data = await queryService.checkBulkWishlist(req.user._id, req.body.templateIds);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists/count/:templateId — public wishlist count
  async getWishlistCount(req, res, next) {
    try {
      const data = await queryService.getWishlistCount(req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
