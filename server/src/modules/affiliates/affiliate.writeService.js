import { Affiliate, ReferralClick, ReferralConversion, AffiliatePayout } from './affiliate.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

const notificationService = new NotificationService();

export class AffiliateWriteService {
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
