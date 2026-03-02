import { Review } from './review.model.js';
import { toReviewDTO, toAdminReviewDTO } from './dto/review.dto.js';

export class ReviewQueryService {
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
      reviews: reviews.map(toReviewDTO),
      summary,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

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
      reviews: reviews.map(toAdminReviewDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async hasReviewed(buyerId, templateId) {
    const review = await Review.findOne({ buyerId, templateId });
    return !!review;
  }

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
}
