import express from 'express';
import { CheckoutController } from './checkout.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { templateCheckoutSchema, serviceCheckoutSchema } from './checkout.validator.js';

const router = express.Router();
const checkoutController = new CheckoutController();

// Template checkout
router.post('/template', authenticate, validate(templateCheckoutSchema), checkoutController.createTemplateCheckout);

// Service checkout
router.post('/service', authenticate, validate(serviceCheckoutSchema), checkoutController.createServiceCheckout);

export default router;
