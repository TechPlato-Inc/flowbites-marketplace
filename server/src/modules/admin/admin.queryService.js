import { Template } from '../templates/template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { Category } from '../categories/category.model.js';
import { Refund } from '../refunds/refund.model.js';
import { Review } from '../reviews/review.model.js';
import { Order } from '../orders/order.model.js';
import { Notification } from '../notifications/notification.model.js';
import { Follower } from '../followers/follower.model.js';
import { Coupon } from '../coupons/coupon.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';

export class AdminQueryService {
  async getPendingTemplates() {
    const templates = await Template.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .populate('creatorProfileId', 'displayName username isVerified stats onboarding.status')
      .populate('category', 'name');

    return templates;
  }

  async getAllTemplates(filters = {}) {
    const {
      status, platform, category, search, featured,
      priceMin, priceMax, dateFrom, dateTo,
      sort = 'newest', page = 1, limit = 20
    } = filters;

    const query = {};

    if (status) {
      const statuses = status.split(',');
      query.status = statuses.length > 1 ? { $in: statuses } : statuses[0];
    }

    if (platform) {
      const platforms = platform.split(',');
      query.platform = platforms.length > 1 ? { $in: platforms } : platforms[0];
    }

    if (category) query.category = category;

    if (featured === 'true') query.isFeatured = true;
    if (featured === 'false') query.isFeatured = false;

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'newest': sortOption = { createdAt: -1 }; break;
      case 'oldest': sortOption = { createdAt: 1 }; break;
      case 'most_views': sortOption = { 'stats.views': -1 }; break;
      case 'most_purchases': sortOption = { 'stats.purchases': -1 }; break;
      case 'price_high': sortOption = { price: -1 }; break;
      case 'price_low': sortOption = { price: 1 }; break;
      case 'most_revenue': sortOption = { 'stats.revenue': -1 }; break;
      default: sortOption = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate('creatorProfileId', 'displayName username isVerified isFeatured stats onboarding.status')
        .populate('category', 'name slug')
        .populate('tags', 'name slug'),
      Template.countDocuments(query)
    ]);

    return {
      templates,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getTemplateById(templateId) {
    const template = await Template.findById(templateId)
      .populate('creatorProfileId', 'displayName username bio stats isVerified isFeatured onboarding.status')
      .populate('creatorId', 'name email')
      .populate('category', 'name slug')
      .populate('tags', 'name slug')
      .populate('moderatedBy', 'name');

    if (!template) throw new AppError('Template not found', 404);
    return template;
  }

  async getTemplateStats() {
    const [
      statusCounts,
      platformCounts,
      totals,
      topTemplates,
      recentActivity,
      featuredCount
    ] = await Promise.all([
      Template.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Template.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$platform', count: { $sum: 1 }, revenue: { $sum: '$stats.revenue' } } }
      ]),
      Template.aggregate([
        { $match: { status: 'approved' } },
        { $group: {
          _id: null,
          totalRevenue: { $sum: '$stats.revenue' },
          totalPurchases: { $sum: '$stats.purchases' },
          totalViews: { $sum: '$stats.views' }
        }}
      ]),
      Template.find({ status: 'approved' })
        .sort({ 'stats.purchases': -1 })
        .limit(10)
        .select('title slug stats price platform thumbnail')
        .populate('creatorProfileId', 'displayName'),
      Template.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title status createdAt moderatedAt')
        .populate('creatorProfileId', 'displayName'),
      Template.countDocuments({ isFeatured: true })
    ]);

    const byStatus = {};
    statusCounts.forEach(s => { byStatus[s._id] = s.count; });

    const totalModerated = (byStatus.approved || 0) + (byStatus.rejected || 0);
    const approvalRate = totalModerated > 0
      ? Number(((byStatus.approved || 0) / totalModerated * 100).toFixed(1))
      : 0;

    return {
      byStatus,
      byPlatform: platformCounts,
      totals: totals[0] || { totalRevenue: 0, totalPurchases: 0, totalViews: 0 },
      topTemplates,
      recentActivity,
      featuredCount,
      approvalRate
    };
  }

  async exportTemplates(filters = {}) {
    const result = await this.getAllTemplates({ ...filters, limit: 10000, page: 1 });

    const headers = [
      'ID', 'Title', 'Slug', 'Platform', 'Category', 'Price', 'Status',
      'Creator', 'Views', 'Purchases', 'Revenue', 'Featured', 'License', 'Created At'
    ];

    const rows = result.templates.map(t => [
      t._id,
      t.title,
      t.slug,
      t.platform,
      t.category?.name || '',
      t.price,
      t.status,
      t.creatorProfileId?.displayName || '',
      t.stats?.views || 0,
      t.stats?.purchases || 0,
      t.stats?.revenue || 0,
      t.isFeatured ? 'Yes' : 'No',
      t.licenseType || '',
      t.createdAt
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // -- Creator management --

  async getPendingCreators() {
    return CreatorProfile.find({ 'onboarding.status': 'submitted' })
      .sort({ 'onboarding.submittedAt': 1 })
      .populate('userId', 'name email createdAt');
  }

  async getAllCreators(filters = {}) {
    const { status, search, page = 1, limit = 20 } = filters;
    const query = {};

    if (status) {
      query['onboarding.status'] = status;
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { displayName: { $regex: safeSearch, $options: 'i' } },
        { username: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [creators, total] = await Promise.all([
      CreatorProfile.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'name email createdAt'),
      CreatorProfile.countDocuments(query)
    ]);

    return {
      creators,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    };
  }

  async getCreatorById(creatorId) {
    const creator = await CreatorProfile.findById(creatorId)
      .populate('userId', 'name email createdAt');
    if (!creator) throw new AppError('Creator not found', 404);
    return creator;
  }

  async getDashboardStats() {
    const [
      userCount,
      creatorCount,
      pendingCreators,
      templateStats,
      orderCount,
      orderRevenue,
      refundStats,
      reviewModQueue,
      reviewTotal,
      notificationCount,
      followerCount,
      activeCoupons,
    ] = await Promise.all([
      User.countDocuments(),
      CreatorProfile.countDocuments({ 'onboarding.status': 'approved' }),
      CreatorProfile.countDocuments({ 'onboarding.status': 'submitted' }),
      Template.aggregate([
        { $group: {
          _id: '$status',
          count: { $sum: 1 },
        }},
      ]),
      Order.countDocuments({ status: 'paid' }),
      Order.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Refund.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } },
      ]),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments(),
      Notification.countDocuments(),
      Follower.countDocuments(),
      Coupon.countDocuments({ isActive: true }),
    ]);

    const templatesByStatus = {};
    templateStats.forEach(s => { templatesByStatus[s._id] = s.count; });

    const refundsByStatus = {};
    refundStats.forEach(s => { refundsByStatus[s._id] = { count: s.count, total: s.total }; });

    return {
      users: {
        total: userCount,
        creators: creatorCount,
        pendingCreatorApplications: pendingCreators,
      },
      templates: {
        byStatus: templatesByStatus,
        total: Object.values(templatesByStatus).reduce((a, b) => a + b, 0),
      },
      orders: {
        total: orderCount,
        revenue: orderRevenue[0]?.total || 0,
      },
      refunds: {
        byStatus: refundsByStatus,
        pendingCount: refundsByStatus.requested?.count || 0,
        totalRefunded: refundsByStatus.processed?.total || 0,
      },
      reviews: {
        total: reviewTotal,
        pendingModeration: reviewModQueue,
      },
      notifications: {
        totalSent: notificationCount,
      },
      followers: {
        totalFollows: followerCount,
      },
      coupons: {
        active: activeCoupons,
      },
    };
  }
}
