import { CheckoutQueryService } from './checkout.queryService.js';
import { CheckoutWriteService } from './checkout.writeService.js';

/**
 * CheckoutService — backward-compatible facade.
 *
 * All real logic now lives in CheckoutQueryService (reads) and
 * CheckoutWriteService (writes).  This class delegates every call so
 * that existing consumers (`checkout.controller.js`, `webhook.routes.js`)
 * continue to work with zero changes.
 */
export class CheckoutService {
  constructor() {
    this._queryService = new CheckoutQueryService();
    this._writeService = new CheckoutWriteService();
  }

  // ── Write operations (delegated to CheckoutWriteService) ──────────

  createTemplateCheckoutSession(...args) {
    return this._writeService.createTemplateCheckoutSession(...args);
  }

  createServiceCheckoutSession(...args) {
    return this._writeService.createServiceCheckoutSession(...args);
  }

  handleWebhook(...args) {
    return this._writeService.handleWebhook(...args);
  }

  fulfillTemplateOrder(...args) {
    return this._writeService.fulfillTemplateOrder(...args);
  }

  fulfillServiceOrder(...args) {
    return this._writeService.fulfillServiceOrder(...args);
  }

  _payCreator(...args) {
    return this._writeService._payCreator(...args);
  }

  _handleSessionExpired(...args) {
    return this._writeService._handleSessionExpired(...args);
  }

  _handlePaymentFailed(...args) {
    return this._writeService._handlePaymentFailed(...args);
  }

  _handleDisputeCreated(...args) {
    return this._writeService._handleDisputeCreated(...args);
  }

  _handleStripeRefund(...args) {
    return this._writeService._handleStripeRefund(...args);
  }
}
