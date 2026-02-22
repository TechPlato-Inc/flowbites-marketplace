import express from 'express';
import { WishlistController } from './wishlist.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { userRateLimit } from '../../middleware/userRateLimit.js';

const router = express.Router();
const wishlistController = new WishlistController();

// Public: wishlist count for social proof
router.get('/count/:templateId', wishlistController.getWishlistCount);

// Authenticated routes (toggle limited to 30 per minute to prevent spam)
const wishlistToggleLimit = userRateLimit({ maxRequests: 30, windowMs: 60000, message: 'Too many wishlist actions, please slow down' });
router.get('/', authenticate, wishlistController.getWishlist);
router.get('/check/:templateId', authenticate, wishlistController.isInWishlist);
router.post('/check-bulk', authenticate, wishlistController.checkBulkWishlist);
router.post('/:templateId', authenticate, wishlistToggleLimit, wishlistController.addToWishlist);
router.delete('/:templateId', authenticate, wishlistToggleLimit, wishlistController.removeFromWishlist);

export default router;
