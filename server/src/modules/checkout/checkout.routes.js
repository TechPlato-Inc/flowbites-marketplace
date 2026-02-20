import express from 'express';
import { CheckoutController } from './checkout.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const checkoutController = new CheckoutController();

// Template checkout
router.post('/template', authenticate, checkoutController.createTemplateCheckout);

// Service checkout
router.post('/service', authenticate, checkoutController.createServiceCheckout);

export default router;
