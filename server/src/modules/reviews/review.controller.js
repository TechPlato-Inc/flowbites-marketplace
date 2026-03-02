import { ReviewQueryService } from './review.queryService.js';
import { ReviewWriteService } from './review.writeService.js';

const queryService = new ReviewQueryService();
const writeService = new ReviewWriteService();

export class ReviewController {
  // GET /reviews/template/:templateId
  async getTemplateReviews(req, res, next) {
    try {
      const data = await queryService.getTemplateReviews(req.params.templateId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /reviews/template/:templateId
  async createReview(req, res, next) {
    try {
      const review = await writeService.createReview(
        req.user._id,
        req.params.templateId,
        req.body
      );
      res.status(201).json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /reviews/:reviewId
  async updateReview(req, res, next) {
    try {
      const review = await writeService.updateReview(
        req.user._id,
        req.params.reviewId,
        req.body
      );
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /reviews/:reviewId
  async deleteReview(req, res, next) {
    try {
      await writeService.deleteReview(req.user._id, req.params.reviewId);
      res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
      next(error);
    }
  }

  // GET /reviews/check/:templateId — check if current user has reviewed
  async hasReviewed(req, res, next) {
    try {
      const reviewed = await queryService.hasReviewed(req.user._id, req.params.templateId);
      res.json({ success: true, data: { reviewed } });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/reviews
  async adminGetReviews(req, res, next) {
    try {
      const data = await queryService.adminGetReviews({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        status: req.query.status,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/reviews/:reviewId/moderate
  async moderateReview(req, res, next) {
    try {
      const review = await writeService.moderateReview(
        req.user._id,
        req.params.reviewId,
        req.body
      );
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  }
}
