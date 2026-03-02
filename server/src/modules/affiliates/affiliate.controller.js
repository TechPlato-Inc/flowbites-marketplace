import { AffiliateQueryService } from './affiliate.queryService.js';
import { AffiliateWriteService } from './affiliate.writeService.js';
import { toAffiliateDTO, toAffiliatePayoutDTO, toReferralConversionDTO } from './dto/affiliate.dto.js';

const affiliateQueryService = new AffiliateQueryService();
const affiliateWriteService = new AffiliateWriteService();

// ── User Endpoints ─────────────────────────────────────────────────────────

export const getProfile = async (req, res, next) => {
  try {
    const affiliate = await affiliateQueryService.getProfile(req.user._id);
    res.json({ success: true, data: toAffiliateDTO(affiliate) });
  } catch (error) {
    next(error);
  }
};

export const getConversions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await affiliateQueryService.getConversions(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    data.conversions = data.conversions.map(toReferralConversionDTO);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const generateLink = async (req, res, next) => {
  try {
    const data = await affiliateQueryService.generateLink(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await affiliateQueryService.getMyPayouts(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    data.payouts = data.payouts.map(toAffiliatePayoutDTO);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getPayoutMethods = async (req, res, next) => {
  try {
    const data = await affiliateQueryService.getPayoutMethods();
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    const data = await affiliateQueryService.getStats(req.user._id, { period });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const trackClickPost = async (req, res, next) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ success: false, error: 'Referral code required' });
    }
    const data = await affiliateWriteService.trackClick(referralCode, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      page: req.headers.referer,
    });

    res.cookie('ref', data.referralCode, {
      maxAge: data.cookieDurationDays * 86400000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, data: { referralCode: data.referralCode } });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const affiliate = await affiliateWriteService.register(req.user._id, req.body);
    res.status(201).json({ success: true, data: affiliate });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const data = await affiliateQueryService.getDashboard(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getReferrals = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await affiliateQueryService.getReferrals(req.user._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req, res, next) => {
  try {
    const payout = await affiliateWriteService.requestPayout(req.user._id, req.body);
    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
};

// ── Public Endpoint ────────────────────────────────────────────────────────

export const trackClick = async (req, res, next) => {
  try {
    const { code } = req.params;
    const data = await affiliateWriteService.trackClick(code, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      page: req.query.page || req.headers.referer,
    });

    // Set referral cookie
    res.cookie('ref', data.referralCode, {
      maxAge: data.cookieDurationDays * 86400000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, data: { referralCode: data.referralCode } });
  } catch (error) {
    next(error);
  }
};

// ── Admin Endpoints ────────────────────────────────────────────────────────

export const adminListAffiliates = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await affiliateQueryService.adminListAffiliates({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const adminModerateAffiliate = async (req, res, next) => {
  try {
    const affiliate = await affiliateWriteService.adminModerateAffiliate(
      req.user._id,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: affiliate });
  } catch (error) {
    next(error);
  }
};

export const adminListPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const data = await affiliateQueryService.adminListPayouts({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const adminProcessPayout = async (req, res, next) => {
  try {
    const payout = await affiliateWriteService.adminProcessPayout(
      req.user._id,
      req.params.payoutId,
      req.body
    );
    res.json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
};
