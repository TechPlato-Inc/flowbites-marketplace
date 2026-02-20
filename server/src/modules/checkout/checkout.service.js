import { stripe, isDemoMode } from '../../config/stripe.js';
import { Order } from '../orders/order.model.js';
import { Template } from '../templates/template.model.js';
import { License } from '../downloads/license.model.js';
import { ServicePackage, ServiceOrder } from '../services/service.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

export class CheckoutService {
  async createTemplateCheckoutSession(buyerId, buyerEmail, items) {
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

    // Create order in DB
    const orderNumber = `FLW-${Date.now()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const order = await Order.create({
      orderNumber,
      buyerId,
      items: orderItems,
      subtotal,
      total: subtotal,
      buyerEmail,
      paymentMethod: isDemoMode ? 'mock' : 'stripe',
      status: 'pending'
    });

    // Demo mode: skip Stripe, auto-fulfill the order immediately
    if (isDemoMode) {
      console.log(`[DEMO MODE] Auto-fulfilling template order ${order.orderNumber}`);
      await this.fulfillTemplateOrder(order._id.toString());
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { type } = session.metadata;

      if (type === 'template_purchase') {
        await this.fulfillTemplateOrder(session.metadata.orderId);
      } else if (type === 'service_purchase') {
        await this.fulfillServiceOrder(session.metadata.serviceOrderId);
      }
    }
  }

  async fulfillTemplateOrder(orderId) {
    const order = await Order.findById(orderId);
    if (!order || order.status === 'paid') return;

    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    // Create licenses and update stats
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
      }
    }
  }

  async fulfillServiceOrder(serviceOrderId) {
    const serviceOrder = await ServiceOrder.findById(serviceOrderId);
    if (!serviceOrder || serviceOrder.isPaid) return;

    serviceOrder.isPaid = true;
    serviceOrder.paidAt = new Date();
    await serviceOrder.save();

    // Increment package stats
    await ServicePackage.findByIdAndUpdate(serviceOrder.packageId, {
      $inc: { 'stats.orders': 1 }
    });
  }
}
