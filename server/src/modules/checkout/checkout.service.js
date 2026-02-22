import { stripe, isDemoMode } from '../../config/stripe.js';
import { Order } from '../orders/order.model.js';
import { Template } from '../templates/template.model.js';
import { License } from '../downloads/license.model.js';
import { User } from '../users/user.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { ServicePackage, ServiceOrder } from '../services/service.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';
import { sendPurchaseConfirmation } from '../../services/email.js';
import { transferToCreator } from '../../services/stripeConnect.js';
import { NotificationService } from '../notifications/notification.service.js';
import { CouponService } from '../coupons/coupon.service.js';

const notificationService = new NotificationService();
const couponService = new CouponService();

export class CheckoutService {
  async createTemplateCheckoutSession(buyerId, buyerEmail, items, couponCode) {
    // Build order items & Stripe line items
    const orderItems = [];
    const lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const template = await Template.findById(item.templateId);
      if (!template || template.status !== 'approved') {
        throw new AppError('Template not available', 400);
      }

      // Check if buyer already owns this template
      const existingLicense = await License.findOne({
        buyerId,
        templateId: template._id,
        isActive: true
      });
      if (existingLicense) {
        throw new AppError(`You already own "${template.title}"`, 400);
      }

      const feePercent = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 30;
      const platformFee = template.price * (feePercent / 100);

      orderItems.push({
        type: 'template',
        templateId: template._id,
        title: template.title,
        price: template.price,
        creatorId: template.creatorId,
        platformFee,
        creatorPayout: template.price - platformFee
      });

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: template.title,
            description: `${template.platform} template`
          },
          unit_amount: Math.round(template.price * 100) // Stripe uses cents
        },
        quantity: 1
      });

      subtotal += template.price;
    }

    // Apply coupon discount if provided
    let discount = 0;
    let couponId = null;
    if (couponCode) {
      try {
        const validation = await couponService.validateCoupon(buyerId, couponCode, subtotal, 'templates');
        if (validation.valid) {
          discount = validation.discount;
          couponId = validation.couponId;
        }
      } catch (err) {
        throw new AppError(`Coupon error: ${err.message}`, 400);
      }
    }

    const total = Math.max(subtotal - discount, 0);

    // Create order in DB
    const orderNumber = `FLW-${Date.now()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const order = await Order.create({
      orderNumber,
      buyerId,
      items: orderItems,
      subtotal,
      discount,
      couponCode: couponCode || undefined,
      total,
      buyerEmail,
      paymentMethod: isDemoMode ? 'mock' : 'stripe',
      status: 'pending'
    });

    // Demo mode: skip Stripe, auto-fulfill the order immediately
    if (isDemoMode) {
      console.log(`[DEMO MODE] Auto-fulfilling template order ${order.orderNumber}`);
      await this.fulfillTemplateOrder(order._id.toString());
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      return {
        sessionUrl: `${clientUrl}/checkout/success?type=template&demo=true`,
        orderId: order._id,
        demoMode: true
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: buyerEmail,
      line_items: lineItems,
      metadata: {
        orderId: order._id.toString(),
        type: 'template_purchase'
      },
      success_url: `${process.env.CLIENT_URL}/checkout/success?type=template`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`
    });

    // Save session ID
    order.stripePaymentIntentId = session.id;
    await order.save();

    return { sessionUrl: session.url, orderId: order._id };
  }

  async createServiceCheckoutSession(buyerId, buyerEmail, packageId, requirements) {
    const pkg = await ServicePackage.findById(packageId);
    if (!pkg || !pkg.isActive) {
      throw new AppError('Service package not available', 400);
    }

    const feePercent = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT) || 20;
    const platformFee = pkg.price * (feePercent / 100);

    // Create service order
    const orderNumber = `SRV-${Date.now()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const serviceOrder = await ServiceOrder.create({
      orderNumber,
      packageId: pkg._id,
      buyerId,
      creatorId: pkg.creatorId,
      templateId: pkg.templateId,
      packageName: pkg.name,
      price: pkg.price,
      deliveryDays: pkg.deliveryDays,
      revisions: pkg.revisions,
      requirements,
      status: 'requested',
      platformFee,
      creatorPayout: pkg.price - platformFee,
      isPaid: false
    });

    // Demo mode: skip Stripe, auto-mark as paid
    if (isDemoMode) {
      console.log(`[DEMO MODE] Auto-fulfilling service order ${serviceOrder.orderNumber}`);
      await this.fulfillServiceOrder(serviceOrder._id.toString());
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
      return {
        sessionUrl: `${clientUrl}/checkout/success?type=service&demo=true`,
        serviceOrderId: serviceOrder._id,
        demoMode: true
      };
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: buyerEmail,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.name,
            description: `Service: ${pkg.name} — ${pkg.deliveryDays} day delivery`
          },
          unit_amount: Math.round(pkg.price * 100)
        },
        quantity: 1
      }],
      metadata: {
        serviceOrderId: serviceOrder._id.toString(),
        type: 'service_purchase'
      },
      success_url: `${process.env.CLIENT_URL}/checkout/success?type=service`,
      cancel_url: `${process.env.CLIENT_URL}/checkout/cancel`
    });

    serviceOrder.stripeSessionId = session.id;
    await serviceOrder.save();

    return { sessionUrl: session.url, serviceOrderId: serviceOrder._id };
  }

  async handleWebhook(event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { type } = session.metadata;
        const chargeId = session.payment_intent;

        if (type === 'template_purchase') {
          await this.fulfillTemplateOrder(session.metadata.orderId, chargeId);
        } else if (type === 'service_purchase') {
          await this.fulfillServiceOrder(session.metadata.serviceOrderId, chargeId);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        await this._handleSessionExpired(session);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        await this._handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        await this._handleStripeRefund(charge);
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object;
        await this._handleDisputeCreated(dispute);
        break;
      }

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle expired checkout sessions — mark orders as expired, notify buyer.
   */
  async _handleSessionExpired(session) {
    const { type, orderId, serviceOrderId } = session.metadata || {};

    if (type === 'template_purchase' && orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status === 'pending') {
        order.status = 'expired';
        await order.save();

        notificationService.notifyOrderExpired(order.buyerId, order.orderNumber).catch(err =>
          console.error('Failed to send order expired notification:', err)
        );
        console.log(`[WEBHOOK] Order ${order.orderNumber} expired (checkout session timed out)`);
      }
    } else if (type === 'service_purchase' && serviceOrderId) {
      const serviceOrder = await ServiceOrder.findById(serviceOrderId);
      if (serviceOrder && !serviceOrder.isPaid) {
        serviceOrder.status = 'cancelled';
        await serviceOrder.save();
        console.log(`[WEBHOOK] Service order ${serviceOrder.orderNumber} cancelled (checkout session expired)`);
      }
    }
  }

  /**
   * Handle payment failures — mark order as failed, notify buyer.
   */
  async _handlePaymentFailed(paymentIntent) {
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (!order || order.status !== 'pending') return;

    order.status = 'failed';
    await order.save();

    notificationService.notifyPaymentFailed(order.buyerId, order.orderNumber).catch(err =>
      console.error('Failed to send payment failed notification:', err)
    );

    console.log(`[WEBHOOK] Payment failed for order ${order.orderNumber}: ${paymentIntent.last_payment_error?.message || 'unknown'}`);
  }

  /**
   * Handle dispute/chargeback created — flag order, notify admins.
   */
  async _handleDisputeCreated(dispute) {
    const chargeId = dispute.charge;
    const order = await Order.findOne({ stripeChargeId: chargeId });
    if (!order) {
      console.warn(`[WEBHOOK] Dispute for unknown charge: ${chargeId}`);
      return;
    }

    // Log the dispute via AuditLog for admin visibility
    const { AuditLog } = await import('../audit/auditLog.model.js');
    AuditLog.create({
      adminId: null,
      action: 'dispute_created',
      targetType: 'order',
      targetId: order._id,
      details: {
        disputeId: dispute.id,
        reason: dispute.reason,
        amount: dispute.amount / 100,
        orderNumber: order.orderNumber,
      },
    }).catch(() => {});

    console.log(`[WEBHOOK] Dispute created for order ${order.orderNumber} — reason: ${dispute.reason}, amount: $${dispute.amount / 100}`);
  }

  /**
   * Handle refund events from Stripe (e.g., refund initiated from Stripe dashboard).
   * Syncs the refund status back to our database.
   */
  async _handleStripeRefund(charge) {
    const order = await Order.findOne({ stripeChargeId: charge.payment_intent });
    if (!order) {
      console.warn(`[WEBHOOK] Refund event for unknown charge: ${charge.payment_intent}`);
      return;
    }

    // If already refunded, skip
    if (order.status === 'refunded') return;

    order.status = 'refunded';
    await order.save();

    // Deactivate licenses
    const { License } = await import('../downloads/license.model.js');
    await License.updateMany({ orderId: order._id }, { isActive: false });

    // Notify buyer
    notificationService.notifyRefundApproved(order.buyerId, order.orderNumber, order.total).catch(err =>
      console.error('Failed to send Stripe refund notification:', err)
    );

    console.log(`[WEBHOOK] Processed Stripe refund for order ${order.orderNumber}`);
  }

  async fulfillTemplateOrder(orderId, chargeId) {
    const order = await Order.findById(orderId);
    if (!order || order.status === 'paid') return;

    order.status = 'paid';
    order.paidAt = new Date();
    if (chargeId) order.stripeChargeId = chargeId;
    await order.save();

    // Create licenses, update stats, and pay creators
    for (const item of order.items) {
      if (item.type === 'template') {
        const licenseKey = `FLW-${uuidv4().toUpperCase()}`;
        await License.create({
          licenseKey,
          templateId: item.templateId,
          orderId: order._id,
          buyerId: order.buyerId,
          licenseType: 'personal'
        });

        await Template.findByIdAndUpdate(item.templateId, {
          $inc: {
            'stats.purchases': 1,
            'stats.revenue': item.price
          }
        });

        // Transfer payout to creator via Stripe Connect (non-blocking)
        this._payCreator(item.creatorId, item.creatorPayout, chargeId, {
          orderId: order._id.toString(),
          templateId: item.templateId.toString(),
          orderNumber: order.orderNumber,
        }).catch(err => console.error('Creator payout failed:', err));

        // Update creator revenue stats
        const creatorProfile = await CreatorProfile.findOne({ userId: item.creatorId });
        if (creatorProfile) {
          await CreatorProfile.findByIdAndUpdate(creatorProfile._id, {
            $inc: {
              'stats.totalSales': 1,
              'stats.totalRevenue': item.creatorPayout,
            }
          });
        }
      }
    }

    // Record coupon usage if a coupon was applied (non-blocking)
    if (order.couponCode && order.discount > 0) {
      // Look up coupon by code to get its ID for usage recording
      const { Coupon } = await import('../coupons/coupon.model.js');
      const coupon = await Coupon.findOne({ code: order.couponCode.toUpperCase() });
      if (coupon) {
        couponService.recordUsage(coupon._id, order.buyerId, order._id, order.discount).catch(err =>
          console.error('Failed to record coupon usage:', err)
        );
      }
    }

    // Send purchase confirmation email (non-blocking)
    const buyer = await User.findById(order.buyerId);
    if (buyer) {
      sendPurchaseConfirmation(buyer.email, buyer.name, order).catch(err =>
        console.error('Failed to send purchase confirmation:', err)
      );
    }

    // Send in-app notifications (non-blocking)
    notificationService.notifyOrderPaid(order.buyerId, order).catch(err =>
      console.error('Failed to send purchase notification:', err)
    );
    for (const item of order.items) {
      if (item.type === 'template') {
        notificationService.notifyCreatorSale(item.creatorId, item.title, item.price).catch(err =>
          console.error('Failed to send creator sale notification:', err)
        );
      }
    }
  }

  async fulfillServiceOrder(serviceOrderId, chargeId) {
    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    if (!serviceOrder || serviceOrder.isPaid) return;

    serviceOrder.isPaid = true;
    serviceOrder.paidAt = new Date();
    if (chargeId) serviceOrder.stripeChargeId = chargeId;
    await serviceOrder.save();

    // Increment package stats
    await ServicePackage.findByIdAndUpdate(serviceOrder.packageId, {
      $inc: { 'stats.orders': 1 }
    });

    // Note: Service order payouts happen when work is completed (not at purchase).
    // The admin/creator will trigger payout release after delivery is confirmed.
  }

  /**
   * Internal helper to transfer funds to a creator via Stripe Connect.
   */
  async _payCreator(creatorUserId, payoutAmount, chargeId, metadata) {
    if (!chargeId) return; // demo mode or no charge

    const creator = await CreatorProfile.findOne({ userId: creatorUserId });
    if (!creator || !creator.stripeAccountId) {
      console.warn(`[PAYOUT] Creator ${creatorUserId} has no Stripe account — payout of $${payoutAmount} held`);
      return;
    }

    const amountInCents = Math.round(payoutAmount * 100);
    await transferToCreator(chargeId, creator.stripeAccountId, amountInCents, metadata);
  }
}
