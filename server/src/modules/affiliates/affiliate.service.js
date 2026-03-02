import { Affiliate, ReferralClick, ReferralConversion, AffiliatePayout } from './affiliate.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

const notificationService = new NotificationService();

export class AffiliateService {
  // ── Registration ─────────────────────────────────────────────────────────

  async register(userId, { website, promotionMethod }) {
    const existing = await Affiliate.findOne({ userId });
    if (existing) {
      throw new AppError('You already have an affiliate application', 400);
    }

    const affiliate = await Affiliate.create({
      userId,
      website,
      promotionMethod,
    });

    eventBus.emit(EVENTS.AFFILIATE_REGISTERED, {
      affiliateId: affiliate._id.toString(),
      userId: userId.toString(),
      referralCode: affiliate.referralCode,
    });

    return affiliate;
  }

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

  // ── Tracking ─────────────────────────────────────────────────────────────

  async trackClick(referralCode, { ipAddress, userAgent, page }) {
    const affiliate = await Affiliate.findOne({
      referralCode: referralCode.toUpperCase(),
      status: 'approved',
    });

    if (!affiliate) {
      throw new AppError('Invalid referral code', 404);
    }

    // Record the click
    await ReferralClick.create({
      affiliateId: affiliate._id,
      referralCode: affiliate.referralCode,
      ipAddress,
      userAgent,
      page,
    });

    // Increment click counter
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: { 'stats.totalClicks': 1 },
    });

    return {
      referralCode: affiliate.referralCode,
      cookieDurationDays: affiliate.cookieDurationDays,
    };
  }

  /**
   * Called after a successful purchase to credit the affiliate.
   * @param {string} orderId - The order ID
   * @param {string} buyerId - The buyer's user ID
   * @param {number} orderTotal - The order total in dollars
   * @param {string} referralCode - The referral code from the cookie
   */
  async recordConversion(orderId, buyerId, orderTotal, referralCode) {
    if (!referralCode) return null;

    const affiliate = await Affiliate.findOne({
      referralCode: referralCode.toUpperCase(),
      status: 'approved',
    });

    if (!affiliate) return null;

    // Don't allow self-referrals
    if (affiliate.userId.toString() === buyerId.toString()) return null;

    // Check for duplicate conversion
    const existing = await ReferralConversion.findOne({ orderId });
    if (existing) return null;

    const commissionAmount = Math.round(orderTotal * (affiliate.commissionRate / 100) * 100) / 100;

    const conversion = await ReferralConversion.create({
      affiliateId: affiliate._id,
      orderId,
      buyerId,
      orderTotal,
      commissionRate: affiliate.commissionRate,
      commissionAmount,
      status: 'pending',
    });

    // Update affiliate stats
    await Affiliate.findByIdAndUpdate(affiliate._id, {
      $inc: {
        'stats.totalReferrals': 1,
        'stats.totalEarnings': commissionAmount,
        'stats.pendingEarnings': commissionAmount,
      },
    });

    // Notify the affiliate
    notificationService.create(
      affiliate.userId,
      'affiliate_conversion',
      'New referral conversion!',
      `You earned $${commissionAmount.toFixed(2)} from a referral purchase of $${orderTotal.toFixed(2)}.`,
      '/dashboard/affiliate'
    ).catch(() => {});

    return conversion;
  }

  // ── Payout Requests ──────────────────────────────────────────────────────

  async requestPayout(userId, { amount, paymentMethod, notes }) {
    const affiliate = await Affiliate.findOne({ userId, status: 'approved' });
    if (!affiliate) {
      throw new AppError('Affiliate account not found or not approved', 404);
    }

    if (amount > affiliate.stats.pendingEarnings) {
      throw new AppError(
        `Insufficient balance. Available: $${affiliate.stats.pendingEarnings.toFixed(2)}`,
        400
      );
    }

    // Check for existing pending payout
    const pendingPayout = await AffiliatePayout.findOne({
      affiliateId: affiliate._id,
      status: { $in: ['requested', 'approved'] },
    });
    if (pendingPayout) {
      throw new AppError('You already have a pending payout request', 400);
    }

    const payout = await AffiliatePayout.create({
      affiliateId: affiliate._id,
      amount,
      paymentMethod: paymentMethod || 'stripe',
      notes,
    });

    eventBus.emit(EVENTS.AFFILIATE_PAYOUT_REQUESTED, {
      affiliateId: affiliate._id.toString(),
      userId: userId.toString(),
      payoutId: payout._id.toString(),
      amount,
    });

    return payout;
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

  async adminModerateAffiliate(adminId, affiliateId, { status, rejectionReason, commissionRate }) {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    affiliate.status = status;
    affiliate.reviewedBy = adminId;
    affiliate.reviewedAt = new Date();

    if (rejectionReason) affiliate.rejectionReason = rejectionReason;
    if (commissionRate !== undefined) affiliate.commissionRate = commissionRate;

    await affiliate.save();

    // Notify the affiliate
    const title = status === 'approved'
      ? 'Affiliate application approved!'
      : status === 'rejected'
        ? 'Affiliate application update'
        : 'Affiliate account status update';

    const message = status === 'approved'
      ? `Congratulations! Your affiliate application has been approved. Your referral code is ${affiliate.referralCode}.`
      : status === 'rejected'
        ? `Your affiliate application was not approved. ${rejectionReason || ''}`
        : `Your affiliate account status has been updated to: ${status}`;

    notificationService.create(
      affiliate.userId,
      'affiliate_status',
      title,
      message,
      '/dashboard/affiliate'
    ).catch(() => {});

    return affiliate;
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

  async adminProcessPayout(adminId, payoutId, { status, rejectionReason, notes }) {
    const payout = await AffiliatePayout.findById(payoutId);
    if (!payout) {
      throw new AppError('Payout not found', 404);
    }

    const affiliate = await Affiliate.findById(payout.affiliateId);
    if (!affiliate) {
      throw new AppError('Affiliate not found', 404);
    }

    payout.status = status;
    payout.processedBy = adminId;
    payout.processedAt = new Date();
    if (rejectionReason) payout.rejectionReason = rejectionReason;
    if (notes) payout.notes = notes;

    await payout.save();

    if (status === 'paid') {
      // Move earnings from pending to paid
      await Affiliate.findByIdAndUpdate(affiliate._id, {
        $inc: {
          'stats.pendingEarnings': -payout.amount,
          'stats.paidEarnings': payout.amount,
        },
      });

      // Approve all pending conversions up to this amount
      await ReferralConversion.updateMany(
        { affiliateId: affiliate._id, status: 'pending' },
        { status: 'paid', paidAt: new Date() }
      );
    } else if (status === 'rejected') {
      // Notify affiliate of rejection
      notificationService.create(
        affiliate.userId,
        'affiliate_payout',
        'Payout request update',
        `Your payout request for $${payout.amount.toFixed(2)} was not approved. ${rejectionReason || ''}`,
        '/dashboard/affiliate'
      ).catch(() => {});
    }

    return payout;
  }
}
