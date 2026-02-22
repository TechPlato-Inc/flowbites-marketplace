import { Review } from './review.model.js';
import { License } from '../downloads/license.model.js';
import { Template } from '../templates/template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';
import { sendReviewReceived } from '../../services/email.js';

const notificationService = new NotificationService();

export class ReviewService {
  /**
   * Get reviews for a template with summary stats.
   */
  async getTemplateReviews(templateId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [reviews, total, summary] = await Promise.all([
      Review.find({ templateId, status: 'approved' })
        .populate('buyerId', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ templateId, status: 'approved' }),
      this._getReviewSummary(templateId),
    ]);

    return {
      reviews,
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Submit a review for a template. Buyer must own the template (have a license).
   */
  async createReview(buyerId, templateId, { rating, title, comment }) {
    // Verify template exists
    const template = await Template.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);

    // Verify buyer owns this template
    const license = await License.findOne({ buyerId, templateId, isActive: true });
    if (!license) {
      throw new AppError('You must purchase this template before leaving a review', 403);
    }

    // Check for existing review
    const existing = await Review.findOne({ buyerId, templateId });
    if (existing) {
      throw new AppError('You have already reviewed this template', 400);
    }

    const review = await Review.create({
      templateId,
      buyerId,
      orderId: license.orderId,
      rating,
      title,
      comment,
    });

    // Update template average rating stats
    await this._updateTemplateRating(templateId);

    // Notify template creator about new review (non-blocking)
    notificationService.notifyReviewReceived(template.creatorId, template.title, rating).catch(err =>
      console.error('Failed to send review notification:', err)
    );

    // Send review received email to creator (non-blocking)
    CreatorProfile.findOne({ userId: template.creatorId }).then(async (profile) => {
      if (!profile) return;
      const user = await User.findById(profile.userId);
      if (user) sendReviewReceived(user.email, profile.displayName, template.title, rating);
    }).catch(err => console.error('Failed to send review email:', err));

    return review.populate('buyerId', 'name avatar');
  }

  /**
   * Update own review.
   */
  async updateReview(buyerId, reviewId, updates) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.buyerId.toString() !== buyerId.toString()) {
      throw new AppError('You can only edit your own reviews', 403);
    }

    if (updates.rating !== undefined) review.rating = updates.rating;
    if (updates.title !== undefined) review.title = updates.title;
    if (updates.comment !== undefined) review.comment = updates.comment;

    await review.save();
    await this._updateTemplateRating(review.templateId);

    return review.populate('buyerId', 'name avatar');
  }

  /**
   * Delete own review.
   */
  async deleteReview(buyerId, reviewId) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);
    if (review.buyerId.toString() !== buyerId.toString()) {
      throw new AppError('You can only delete your own reviews', 403);
    }

    const templateId = review.templateId;
    await review.deleteOne();
    await this._updateTemplateRating(templateId);
  }

  /**
   * Admin: list all reviews with filters.
   */
  async adminGetReviews({ page = 1, limit = 20, status } = {}) {
    const skip = (page - 1) * limit;
    const filter = {};
    if (status) filter.status = status;

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('buyerId', 'name email avatar')
        .populate('templateId', 'title slug thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments(filter),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: moderate a review (approve/reject).
   */
  async moderateReview(adminId, reviewId, { status, rejectionReason }) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    review.status = status;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    if (rejectionReason) review.rejectionReason = rejectionReason;

    await review.save();
    await this._updateTemplateRating(review.templateId);

    // Notify the reviewer about moderation result
    const template = await Template.findById(review.templateId).select('title').lean();
    notificationService.notifyReviewModerated(
      review.buyerId, template?.title || 'a template', status, rejectionReason
    ).catch(err => console.error('Failed to send review moderation notification:', err));

    return review;
  }

  /**
   * Get the review summary (average, total, distribution) for a template.
   */
  async _getReviewSummary(templateId) {
    const pipeline = await Review.aggregate([
      { $match: { templateId: templateId, status: 'approved' } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (!pipeline.length) {
      return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const r = pipeline[0];
    return {
      average: Math.round(r.average * 10) / 10,
      total: r.total,
      distribution: { 1: r.r1, 2: r.r2, 3: r.r3, 4: r.r4, 5: r.r5 },
    };
  }

  /**
   * Recalculate and store average rating on the Template model.
   */
  async _updateTemplateRating(templateId) {
    const summary = await this._getReviewSummary(templateId);
    // Store on template for quick access in listings
    await Template.findByIdAndUpdate(templateId, {
      'stats.averageRating': summary.average,
      'stats.totalReviews': summary.total,
    });
  }

  /**
   * Check if a buyer has already reviewed a template.
   */
  async hasReviewed(buyerId, templateId) {
    const review = await Review.findOne({ buyerId, templateId });
    return !!review;
  }
}
