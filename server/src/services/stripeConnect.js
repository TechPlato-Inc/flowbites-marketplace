import { stripe, isDemoMode } from '../config/stripe.js';
import { CreatorProfile } from '../modules/creators/creator.model.js';
import { User } from '../modules/users/user.model.js';
import { AppError } from '../middleware/errorHandler.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

/**
 * Create a Stripe Connect Express account for a creator and return the
 * onboarding URL that the creator must visit to complete Stripe's KYC.
 */
export async function createConnectAccount(userId) {
  if (isDemoMode || !stripe) {
    return {
      url: `${CLIENT_URL}/dashboard/creator?stripe_demo=true`,
      demoMode: true,
    };
  }

  const creator = await CreatorProfile.findOne({ userId });
  if (!creator) throw new AppError('Creator profile not found', 404);

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  // If creator already has a Stripe account, create a new onboarding link
  if (creator.stripeAccountId) {
    const link = await stripe.accountLinks.create({
      account: creator.stripeAccountId,
      refresh_url: `${CLIENT_URL}/dashboard/creator?stripe_refresh=true`,
      return_url: `${CLIENT_URL}/dashboard/creator?stripe_connected=true`,
      type: 'account_onboarding',
    });
    return { url: link.url };
  }

  // Create a new Express connected account
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    metadata: {
      userId: userId.toString(),
      creatorProfileId: creator._id.toString(),
    },
    capabilities: {
      transfers: { requested: true },
    },
  });

  // Save the account ID
  creator.stripeAccountId = account.id;
  await creator.save();

  // Create the onboarding link
  const link = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${CLIENT_URL}/dashboard/creator?stripe_refresh=true`,
    return_url: `${CLIENT_URL}/dashboard/creator?stripe_connected=true`,
    type: 'account_onboarding',
  });

  return { url: link.url };
}

/**
 * Get a Stripe Express Dashboard login link so the creator can view
 * their payouts, balance, etc. on Stripe's hosted dashboard.
 */
export async function getStripeDashboardLink(userId) {
  if (isDemoMode || !stripe) {
    return { url: '#', demoMode: true };
  }

  const creator = await CreatorProfile.findOne({ userId });
  if (!creator || !creator.stripeAccountId) {
    throw new AppError('Stripe account not connected', 400);
  }

  const link = await stripe.accounts.createLoginLink(creator.stripeAccountId);
  return { url: link.url };
}

/**
 * Check the status of a creator's Stripe Connect account.
 */
export async function getConnectStatus(userId) {
  const creator = await CreatorProfile.findOne({ userId });
  if (!creator) throw new AppError('Creator profile not found', 404);

  if (!creator.stripeAccountId) {
    return { connected: false, status: 'not_connected' };
  }

  if (isDemoMode || !stripe) {
    return { connected: true, status: 'demo_mode', stripeAccountId: creator.stripeAccountId };
  }

  const account = await stripe.accounts.retrieve(creator.stripeAccountId);

  return {
    connected: true,
    status: account.charges_enabled ? 'active' : 'pending',
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    stripeAccountId: creator.stripeAccountId,
  };
}

/**
 * After a successful checkout, create a Transfer to pay the creator.
 * This should be called after the payment has been captured.
 */
export async function transferToCreator(paymentIntentId, creatorStripeAccountId, amount, metadata = {}) {
  if (isDemoMode || !stripe) {
    console.log(`[DEMO MODE] Would transfer $${(amount / 100).toFixed(2)} to ${creatorStripeAccountId}`);
    return { demoMode: true };
  }

  if (!creatorStripeAccountId) {
    console.warn('[STRIPE CONNECT] Creator has no Stripe account, skipping transfer');
    return { skipped: true, reason: 'no_stripe_account' };
  }

  const transfer = await stripe.transfers.create({
    amount, // in cents
    currency: 'usd',
    destination: creatorStripeAccountId,
    source_transaction: paymentIntentId,
    metadata,
  });

  return { transferId: transfer.id, amount: transfer.amount };
}
