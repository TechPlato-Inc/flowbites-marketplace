import { CheckoutService } from './checkout.service.js';

const checkoutService = new CheckoutService();

export class CheckoutController {
  async createTemplateCheckout(req, res, next) {
    try {
      const { items } = req.body;
      const result = await checkoutService.createTemplateCheckoutSession(
        req.user._id,
        req.user.email,
        items
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async createServiceCheckout(req, res, next) {
    try {
      const { packageId, requirements } = req.body;
      const result = await checkoutService.createServiceCheckoutSession(
        req.user._id,
        req.user.email,
        packageId,
        requirements
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
