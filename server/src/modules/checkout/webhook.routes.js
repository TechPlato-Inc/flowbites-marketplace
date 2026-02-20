import express from 'express';
import { stripe, isDemoMode } from '../../config/stripe.js';
import { CheckoutService } from './checkout.service.js';

const router = express.Router();
const checkoutService = new CheckoutService();

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  if (isDemoMode || !stripe) {
    console.log('[DEMO MODE] Webhook endpoint called but Stripe is not configured — ignoring.');
    return res.json({ received: true, demoMode: true });
  }

  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await checkoutService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

export default router;
