import { Router } from 'express';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  registerAffiliateSchema,
  payoutRequestSchema,
  adminModerateAffiliateSchema,
  adminProcessPayoutSchema,
} from './affiliate.validator.js';
import {
  register,
  getDashboard,
  getReferrals,
  requestPayout,
  trackClick,
  trackClickPost,
  getProfile,
  getConversions,
  generateLink,
  getMyPayouts,
  getPayoutMethods,
  getStats,
  adminListAffiliates,
  adminModerateAffiliate,
  adminListPayouts,
  adminProcessPayout,
} from './affiliate.controller.js';

const router = Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.get('/track/:code', trackClick);

// ── Authenticated User ─────────────────────────────────────────────────────
router.post('/register', authenticate, validate(registerAffiliateSchema), register);
router.post('/apply', authenticate, validate(registerAffiliateSchema), register); // frontend alias
router.get('/me', authenticate, getProfile);
router.get('/dashboard', authenticate, getDashboard);
router.get('/referrals', authenticate, getReferrals);
router.get('/conversions', authenticate, getConversions);
router.get('/stats', authenticate, getStats);
router.post('/generate-link', authenticate, generateLink);
router.get('/payouts', authenticate, getMyPayouts);
router.get('/payout-methods', authenticate, getPayoutMethods);
router.post('/payout-request', authenticate, validate(payoutRequestSchema), requestPayout);
router.post('/payouts/request', authenticate, validate(payoutRequestSchema), requestPayout); // frontend alias
router.post('/track-click', trackClickPost); // frontend uses POST

// ── Admin ──────────────────────────────────────────────────────────────────
router.get('/admin/all', authenticate, can('affiliates.admin'), adminListAffiliates);
router.patch('/admin/:id/moderate', authenticate, can('affiliates.admin'), validate(adminModerateAffiliateSchema), adminModerateAffiliate);
router.get('/admin/payouts', authenticate, can('affiliates.admin'), adminListPayouts);
router.patch('/admin/payouts/:payoutId', authenticate, can('affiliates.admin'), validate(adminProcessPayoutSchema), adminProcessPayout);

export default router;
