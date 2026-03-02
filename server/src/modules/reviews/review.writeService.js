import { Review } from './review.model.js';
import { License } from '../downloads/license.model.js';
import { Template } from '../templates/template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendReviewReceived } from '../../services/email.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class ReviewWriteService {
  async createReview(buyerId, templateId, { rating, title, comment }) {
    const template = await Template.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);

    const license = await License.findOne({ buyerId, templateId, isActive: true });
    if (!license) {
      throw new AppError('You must purchase this template before leaving a review', 403);
    }

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

    await this._updateTemplateRating(templateId);

    // Emit domain event — listener handles in-app notification
    eventBus.emit(EVENTS.REVIEW_CREATED, {
      reviewId: review._id.toString(),
      templateId: templateId.toString(),
      buyerId: buyerId.toString(),
      creatorId: template.creatorId.toString(),
      templateTitle: template.title,
      rating,
    });

    // Send review received email to creator (non-blocking)
    CreatorProfile.findOne({ userId: template.creatorId }).then(async (profile) => {
      if (!profile) return;
      const user = await User.findById(profile.userId);
      if (user) sendReviewReceived(user.email, profile.displayName, template.title, rating);
    }).catch(err => console.error('Failed to send review email:', err));

    return review.populate('buyerId', 'name avatar');
  }

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

  async moderateReview(adminId, reviewId, { status, rejectionReason }) {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError('Review not found', 404);

    review.status = status;
    review.moderatedBy = adminId;
    review.moderatedAt = new Date();
    if (rejectionReason) review.rejectionReason = rejectionReason;

    await review.save();
    await this._updateTemplateRating(review.templateId);

    // Fetch template title before emitting so the listener payload is complete
    const template = await Template.findById(review.templateId).select('title').lean();

    // Emit domain event — listener handles in-app notification
    eventBus.emit(EVENTS.REVIEW_MODERATED, {
      reviewId: review._id.toString(),
      templateId: review.templateId.toString(),
      reviewerId: review.buyerId.toString(),
      templateTitle: template?.title || 'a template',
      status,
      reason: rejectionReason,
      moderatedBy: adminId.toString(),
    });

    return review;
  }

  async _updateTemplateRating(templateId) {
    const pipeline = await Review.aggregate([
      { $match: { templateId: templateId, status: 'approved' } },
      {
        $group: {
          _id: null,
          average: { $avg: '$rating' },
          total: { $sum: 1 },
        },
      },
    ]);

    const stats = pipeline[0] || { average: 0, total: 0 };
    await Template.findByIdAndUpdate(templateId, {
      'stats.averageRating': Math.round(stats.average * 10) / 10,
      'stats.totalReviews': stats.total,
    });
  }
}
