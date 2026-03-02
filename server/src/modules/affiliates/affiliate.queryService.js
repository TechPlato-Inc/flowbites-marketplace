import { Affiliate, ReferralClick, ReferralConversion, AffiliatePayout } from './affiliate.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AffiliateQueryService {
  // ── Get own affiliate profile ──────────────────────────────────────────────

  async getProfile(userId) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }
    return affiliate;
  }

  // ── Get own conversions ────────────────────────────────────────────────────

  async getConversions(userId, { page = 1, limit = 20, status }) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }

    const filter = { affiliateId: affiliate._id };
    if (status) filter.status = status;

    const [conversions, total] = await Promise.all([
      ReferralConversion.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('buyerId', 'name avatar')
        .lean(),
      ReferralConversion.countDocuments(filter),
    ]);

    return {
      conversions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ── Generate referral link ─────────────────────────────────────────────────

  async generateLink(userId) {
    const affiliate = await Affiliate.findOne({ userId, status: 'approved' });
    if (!affiliate) {
      throw new AppError('Affiliate account not found or not approved', 404);
    }

    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3001';
    return {
      referralCode: affiliate.referralCode,
      referralLink: `${baseUrl}?ref=${affiliate.referralCode}`,
    };
  }

  // ── Get own payouts ────────────────────────────────────────────────────────

  async getMyPayouts(userId, { page = 1, limit = 20, status }) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }

    const filter = { affiliateId: affiliate._id };
    if (status) filter.status = status;

    const [payouts, total] = await Promise.all([
      AffiliatePayout.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AffiliatePayout.countDocuments(filter),
    ]);

    return {
      payouts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  // ── Get payout methods ─────────────────────────────────────────────────────

  async getPayoutMethods() {
    return {
      methods: [
        { id: 'stripe', name: 'Stripe', description: 'Direct deposit via Stripe' },
        { id: 'paypal', name: 'PayPal', description: 'PayPal transfer' },
      ],
    };
  }

  // ── Get stats (alias for dashboard summary) ────────────────────────────────

  async getStats(userId, { period }) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }

    const periodDays = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - periodDays * 86400000);

    const [clicks, conversions, earningsAgg] = await Promise.all([
      ReferralClick.countDocuments({ affiliateId: affiliate._id, createdAt: { $gte: since } }),
      ReferralConversion.countDocuments({ affiliateId: affiliate._id, createdAt: { $gte: since } }),
      ReferralConversion.aggregate([
        { $match: { affiliateId: affiliate._id, createdAt: { $gte: since }, status: { $in: ['pending', 'approved', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ]),
    ]);

    return {
      period: periodDays,
      clicks,
      conversions,
      earnings: earningsAgg[0]?.total || 0,
      conversionRate: clicks > 0 ? Math.round((conversions / clicks) * 10000) / 100 : 0,
      lifetime: affiliate.stats,
    };
  }

  // ── Dashboard ────────────────────────────────────────────────────────────

  async getDashboard(userId) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }

    // Get recent conversions
    const recentConversions = await ReferralConversion.find({ affiliateId: affiliate._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get monthly stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

    const monthlyClicks = await ReferralClick.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const monthlyConversions = await ReferralConversion.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const monthlyEarnings = await ReferralConversion.aggregate([
      {
        $match: {
          affiliateId: affiliate._id,
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['pending', 'approved', 'paid'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
    ]);

    return {
      affiliate: {
        _id: affiliate._id,
        referralCode: affiliate.referralCode,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        cookieDurationDays: affiliate.cookieDurationDays,
        stats: affiliate.stats,
        createdAt: affiliate.createdAt,
      },
      monthly: {
        clicks: monthlyClicks,
        conversions: monthlyConversions,
        earnings: monthlyEarnings[0]?.total || 0,
        conversionRate: monthlyClicks > 0
          ? Math.round((monthlyConversions / monthlyClicks) * 10000) / 100
          : 0,
      },
      recentConversions,
    };
  }

  // ── Referrals List ───────────────────────────────────────────────────────

  async getReferrals(userId, { page = 1, limit = 20, status }) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new AppError('Affiliate account not found', 404);
    }

    const filter = { affiliateId: affiliate._id };
    if (status) filter.status = status;

    const [conversions, total] = await Promise.all([
      ReferralConversion.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('buyerId', 'name avatar')
        .lean(),
      ReferralConversion.countDocuments(filter),
    ]);

    return {
      referrals: conversions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ── Admin Methods ────────────────────────────────────────────────────────

  async adminListAffiliates({ page = 1, limit = 20, status }) {
    const filter = {};
    if (status) filter.status = status;

    const [affiliates, total] = await Promise.all([
      Affiliate.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email avatar')
        .lean(),
      Affiliate.countDocuments(filter),
    ]);

    return {
      affiliates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async adminListPayouts({ page = 1, limit = 20, status }) {
    const filter = {};
    if (status) filter.status = status;

    const [payouts, total] = await Promise.all([
      AffiliatePayout.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: 'affiliateId',
          populate: { path: 'userId', select: 'name email' },
        })
        .lean(),
      AffiliatePayout.countDocuments(filter),
    ]);

    return {
      payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
