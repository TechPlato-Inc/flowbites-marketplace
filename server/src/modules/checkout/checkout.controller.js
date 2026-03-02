import { CheckoutWriteService } from './checkout.writeService.js';
import { toCheckoutSessionDTO } from './dto/checkoutSession.dto.js';

const writeService = new CheckoutWriteService();

export class CheckoutController {
  async createTemplateCheckout(req, res, next) {
    try {
      const { items, couponCode } = req.body;
      const referralCode = req.cookies?.ref || null;
      const result = await writeService.createTemplateCheckoutSession(
        req.user._id,
        req.user.email,
        items,
        couponCode,
        referralCode
      );
      res.json({ success: true, data: toCheckoutSessionDTO(result) });
    } catch (error) {
      next(error);
    }
  }

  async createServiceCheckout(req, res, next) {
    try {
      const { packageId, requirements } = req.body;
      const result = await writeService.createServiceCheckoutSession(
        req.user._id,
        req.user.email,
        packageId,
        requirements
      );
      res.json({ success: true, data: toCheckoutSessionDTO(result) });
    } catch (error) {
      next(error);
    }
  }
}
