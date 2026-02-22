import { WishlistService } from './wishlist.service.js';

const wishlistService = new WishlistService();

export class WishlistController {
  // POST /wishlists/:templateId — add to wishlist
  async addToWishlist(req, res, next) {
    try {
      const item = await wishlistService.addToWishlist(req.user._id, req.params.templateId);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /wishlists/:templateId — remove from wishlist
  async removeFromWishlist(req, res, next) {
    try {
      const data = await wishlistService.removeFromWishlist(req.user._id, req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists — get user's wishlist
  async getWishlist(req, res, next) {
    try {
      const data = await wishlistService.getUserWishlist(req.user._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists/check/:templateId — check if wishlisted
  async isInWishlist(req, res, next) {
    try {
      const data = await wishlistService.isInWishlist(req.user._id, req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /wishlists/check-bulk — check multiple templates
  async checkBulkWishlist(req, res, next) {
    try {
      const data = await wishlistService.checkBulkWishlist(req.user._id, req.body.templateIds);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /wishlists/count/:templateId — public wishlist count
  async getWishlistCount(req, res, next) {
    try {
      const data = await wishlistService.getWishlistCount(req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
