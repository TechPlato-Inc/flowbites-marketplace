import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Check if we have real Stripe keys (not placeholder)
export const isDemoMode = !STRIPE_SECRET_KEY ||
  STRIPE_SECRET_KEY.includes('your_stripe') ||
  STRIPE_SECRET_KEY === 'sk_test_your_stripe_secret_key' ||
  STRIPE_SECRET_KEY.length < 20;

export const stripe = isDemoMode ? null : new Stripe(STRIPE_SECRET_KEY);

if (isDemoMode) {
  console.log('💳 Stripe running in DEMO MODE — payments will be auto-fulfilled without charging.');
  console.log('   To enable real payments, set STRIPE_SECRET_KEY in your .env file.');
} else {
  const keyType = STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`💳 Stripe configured in ${keyType} mode.`);
}
