import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../modules/users/user.model.js';
import { Template } from '../modules/templates/template.model.js';
import { Order } from '../modules/orders/order.model.js';
import { License } from '../modules/downloads/license.model.js';
import { Review } from '../modules/reviews/review.model.js';
import { Refund } from '../modules/refunds/refund.model.js';
import { Notification } from '../modules/notifications/notification.model.js';
import { Wishlist } from '../modules/wishlists/wishlist.model.js';

dotenv.config();

const seedExtras = async () => {
  try {
    console.log('🌱 Seeding reviews, wishlists, notifications, and refunds...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear only the new collections
    await Promise.all([
      Review.deleteMany({}),
      Refund.deleteMany({}),
      Notification.deleteMany({}),
      Wishlist.deleteMany({}),
    ]);
    console.log('🗑️  Cleared reviews, refunds, notifications, wishlists');

    // Get existing data
    const buyers = await User.find({ role: 'buyer' }).sort({ createdAt: 1 });
    const templates = await Template.find({ status: 'approved' }).sort({ createdAt: 1 });
    const orders = await Order.find({ status: 'paid' }).sort({ createdAt: 1 });
    const licenses = await License.find({}).sort({ createdAt: 1 });

    if (buyers.length < 2 || templates.length < 4 || orders.length < 2) {
      console.error('❌ Run the main seed first: node --experimental-vm-modules src/scripts/seed.js');
      process.exit(1);
    }

    const daysAgo = (d) => new Date(Date.now() - d * 86400000);

    // ── Reviews ─────────────────────────────────────────────────────────────
    // Only create reviews for templates the buyers actually own (have licenses for)
    const reviewData = [];

    for (const license of licenses) {
      const buyer = buyers.find(b => b._id.toString() === license.buyerId.toString());
      const template = templates.find(t => t._id.toString() === license.templateId.toString());
      if (!buyer || !template) continue;

      const ratings = [5, 4, 5, 4, 5];
      const titles = [
        'Excellent template, highly recommend!',
        'Great design, minor tweaks needed',
        'Best template I\'ve purchased',
        'Very professional and clean',
        'Solid template with great docs',
      ];
      const comments = [
        'The design quality is top-notch. Everything is well-organized and the components are easy to customize. Saved me weeks of work.',
        'Great overall design and structure. A few sections needed some tweaking for my specific use case, but nothing major. Would buy again.',
        'This is by far the best template I\'ve purchased. The attention to detail is incredible and the responsive design works perfectly on all devices.',
        'Clean, professional design with great typography choices. The CMS integration was smooth and documentation was helpful.',
        'Well-built template with good documentation. The code structure is clean and easy to follow. Very happy with this purchase.',
      ];

      const idx = reviewData.length % 5;
      reviewData.push({
        templateId: template._id,
        buyerId: buyer._id,
        orderId: license.orderId,
        rating: ratings[idx],
        title: titles[idx],
        comment: comments[idx],
        status: 'approved',
        createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
      });
    }

    const reviews = await Review.create(reviewData);
    console.log(`✅ Created ${reviews.length} reviews`);

    // Update template ratings
    for (const review of reviews) {
      const templateReviews = reviews.filter(r =>
        r.templateId.toString() === review.templateId.toString()
      );
      const avg = templateReviews.reduce((sum, r) => sum + r.rating, 0) / templateReviews.length;
      await Template.findByIdAndUpdate(review.templateId, {
        'stats.averageRating': Math.round(avg * 10) / 10,
        'stats.totalReviews': templateReviews.length,
      });
    }
    console.log('✅ Updated template rating stats');

    // ── Wishlists ───────────────────────────────────────────────────────────
    // Each buyer wishlists a few templates they don't own
    const wishlistData = [];
    for (const buyer of buyers) {
      const ownedIds = licenses
        .filter(l => l.buyerId.toString() === buyer._id.toString())
        .map(l => l.templateId.toString());

      const unowned = templates.filter(t => !ownedIds.includes(t._id.toString()));
      const toWishlist = unowned.slice(0, 3); // Wishlist up to 3

      for (const t of toWishlist) {
        wishlistData.push({
          userId: buyer._id,
          templateId: t._id,
          createdAt: daysAgo(Math.floor(Math.random() * 7)),
        });
      }
    }

    const wishlists = await Wishlist.create(wishlistData);
    console.log(`✅ Created ${wishlists.length} wishlist items`);

    // ── Refund ──────────────────────────────────────────────────────────────
    // Create one refund request (requested status) for the most recent order
    if (orders.length >= 2) {
      const refundOrder = orders[orders.length - 1];
      const refund = await Refund.create({
        orderId: refundOrder._id,
        buyerId: refundOrder.buyerId,
        reason: 'The template doesn\'t match what was shown in the demo. Several sections look different from the preview images.',
        amount: refundOrder.total,
        status: 'requested',
        createdAt: daysAgo(1),
      });
      console.log(`✅ Created 1 refund request (order ${refundOrder.orderNumber})`);
    }

    // ── Notifications ───────────────────────────────────────────────────────
    const notificationData = [];

    for (const buyer of buyers) {
      // Purchase confirmation
      notificationData.push({
        userId: buyer._id,
        type: 'order_paid',
        title: 'Purchase confirmed',
        message: 'Your order has been confirmed. Check your dashboard to access your templates.',
        link: '/dashboard/buyer',
        read: true,
        createdAt: daysAgo(8),
      });

      // Unread notifications
      notificationData.push({
        userId: buyer._id,
        type: 'system',
        title: 'Welcome to Flowbites!',
        message: 'Start exploring premium templates from verified creators.',
        link: '/templates',
        read: false,
        createdAt: daysAgo(1),
      });
    }

    // Creator notifications
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
      notificationData.push({
        userId: admin._id,
        type: 'order_paid',
        title: 'New sale!',
        message: 'Someone purchased your template "Modern SaaS Dashboard Pro" for $79.00',
        link: '/dashboard/creator',
        read: false,
        createdAt: daysAgo(2),
      });
      notificationData.push({
        userId: admin._id,
        type: 'review_received',
        title: 'New review',
        message: 'Someone left a 5-star review on "Elegant Portfolio Studio".',
        link: '/dashboard/creator',
        read: false,
        createdAt: daysAgo(1),
      });
    }

    const notifications = await Notification.create(notificationData);
    console.log(`✅ Created ${notifications.length} notifications`);

    console.log('\n🎉 Extra seed data created successfully!');
    console.log('   Reviews, wishlists, refunds, and notifications are ready.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed extras error:', error);
    process.exit(1);
  }
};

seedExtras();
