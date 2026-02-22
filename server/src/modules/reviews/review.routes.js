import express from 'express';
import { ReviewController } from './review.controller.js';
import { validate } from '../../middleware/validate.js';
import { createReviewSchema, updateReviewSchema, moderateReviewSchema } from './review.validator.js';
import { authenticate, authorize, requireAdmin } from '../../middleware/auth.js';

const router = express.Router();
const reviewController = new ReviewController();

// Public: get reviews for a template
router.get('/template/:templateId', reviewController.getTemplateReviews);

// Buyer: check if already reviewed
router.get(
  '/check/:templateId',
  authenticate,
  reviewController.hasReviewed
);

// Buyer: submit a review
router.post(
  '/template/:templateId',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview
);

// Buyer: update own review
router.patch(
  '/:reviewId',
  authenticate,
  validate(updateReviewSchema),
  reviewController.updateReview
);

// Buyer: delete own review
router.delete(
  '/:reviewId',
  authenticate,
  reviewController.deleteReview
);

// Admin: list all reviews
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  reviewController.adminGetReviews
);

// Admin: moderate a review
router.patch(
  '/admin/:reviewId/moderate',
  authenticate,
  requireAdmin,
  validate(moderateReviewSchema),
  reviewController.moderateReview
);

export default router;
