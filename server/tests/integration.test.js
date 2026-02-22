/**
 * Integration tests for critical paths.
 *
 * Run with: node --experimental-vm-modules tests/integration.test.js
 *
 * This is a lightweight test runner (no test framework needed).
 * Covers service-level and API-level integration paths.
 */
import { spawn } from 'child_process';
import {
  connectTestDB,
  cleanupTestDB,
  clearCollections,
  createTestUser,
  createTestAdmin,
  createTestCreator,
  createTestTemplate,
  generateTestToken,
} from './setup.js';

import dotenv from 'dotenv';
dotenv.config();

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbites-test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

let passed = 0;
let failed = 0;
let apiServerProcess = null;
const API_PORT = process.env.TEST_API_PORT || '5055';
const API_BASE_URL = `http://127.0.0.1:${API_PORT}`;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startApiServer() {
  apiServerProcess = spawn('node', ['src/index.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: API_PORT,
      NODE_ENV: 'test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  apiServerProcess.stdout.on('data', () => {});
  apiServerProcess.stderr.on('data', () => {});

  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      if (res.ok) return;
    } catch {}
    await sleep(500);
  }

  throw new Error('API server did not start in time');
}

async function stopApiServer() {
  if (!apiServerProcess) return;
  apiServerProcess.kill('SIGTERM');
  await new Promise(resolve => {
    apiServerProcess.once('exit', () => resolve());
    setTimeout(() => resolve(), 5000);
  });
  apiServerProcess = null;
}

async function apiRequest(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  return { status: response.status, body: data };
}

async function loginToken(email, password = 'TestPassword123!') {
  const result = await apiRequest('POST', '/api/auth/login', {
    body: { email, password },
  });
  if (result.status !== 200 || !result.body?.data?.accessToken) {
    throw new Error(`Login failed for ${email}`);
  }
  return result.body.data.accessToken;
}

// ─── Auth Tests ──────────────────────────────────────────────────────────────
async function authTests() {
  console.log('\n📋 Auth Tests');
  const { User } = await import('../src/modules/users/user.model.js');

  await test('Create user with valid data', async () => {
    const { user, token } = await createTestUser({ email: 'auth-test@flowbites.com' });
    assert(user._id, 'User should have an _id');
    assert(user.role === 'buyer', 'Default role should be buyer');
    assert(token, 'Should generate a valid token');
  });

  await test('Duplicate email should fail', async () => {
    try {
      await createTestUser({ email: 'auth-test@flowbites.com' });
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.code === 11000 || err.message.includes('duplicate'), 'Should be a duplicate key error');
    }
  });

  await test('Admin user has correct role', async () => {
    const { user } = await createTestAdmin();
    assert(user.role === 'admin', 'Role should be admin');
  });

  await test('Creator profile creation works', async () => {
    const { user, profile } = await createTestCreator();
    assert(profile.userId.toString() === user._id.toString(), 'Profile should link to user');
    assert(profile.isVerified, 'Profile should be verified');
  });
}

// ─── Review Tests ────────────────────────────────────────────────────────────
async function reviewTests() {
  console.log('\n📋 Review Tests');
  const { ReviewService } = await import('../src/modules/reviews/review.service.js');
  const { License } = await import('../src/modules/downloads/license.model.js');
  const reviewService = new ReviewService();

  const { user: buyer } = await createTestUser();
  const { user: creator, profile } = await createTestCreator();
  const template = await createTestTemplate(creator._id, profile._id);

  // Create a license so buyer can review
  await License.create({
    buyerId: buyer._id,
    templateId: template._id,
    orderId: new (await import('mongoose')).default.Types.ObjectId(),
    licenseKey: `LIC-${Date.now()}`,
    licenseType: 'commercial',
    isActive: true,
  });

  await test('Buyer can submit a review', async () => {
    const review = await reviewService.createReview(buyer._id, template._id, {
      rating: 5,
      title: 'Great template',
      comment: 'Loved it!',
    });
    assert(review.rating === 5, 'Rating should be 5');
    assert(review.status === 'approved', 'Status should be approved (auto-approved for MVP)');
  });

  await test('Buyer cannot review same template twice', async () => {
    try {
      await reviewService.createReview(buyer._id, template._id, {
        rating: 4,
        title: 'Another review',
        comment: 'Test',
      });
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('already reviewed'), 'Should indicate already reviewed');
    }
  });

  await test('Non-owner cannot leave a review', async () => {
    const { user: stranger } = await createTestUser();
    try {
      await reviewService.createReview(stranger._id, template._id, {
        rating: 3,
        title: 'No license',
        comment: 'Should fail',
      });
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('purchase'), 'Should require purchase');
    }
  });

  await test('Get template reviews returns correct data', async () => {
    // First approve the review so it shows up
    const { Review } = await import('../src/modules/reviews/review.model.js');
    await Review.updateMany({ templateId: template._id }, { status: 'approved' });

    const result = await reviewService.getTemplateReviews(template._id);
    assert(result.reviews.length > 0, 'Should have at least one review');
    assert(result.summary.average > 0, 'Summary should have average');
    assert(result.summary.total > 0, 'Summary should have total');
  });
}

// ─── Refund Tests ────────────────────────────────────────────────────────────
async function refundTests() {
  console.log('\n📋 Refund Tests');
  const { RefundService } = await import('../src/modules/refunds/refund.service.js');
  const { Order } = await import('../src/modules/orders/order.model.js');
  const refundService = new RefundService();

  const { user: buyer } = await createTestUser();
  const { user: admin } = await createTestAdmin();

  const order = await Order.create({
    orderNumber: `ORD-TEST-${Date.now()}`,
    buyerId: buyer._id,
    items: [{ type: 'template', title: 'Test Template', price: 49, creatorId: buyer._id }],
    subtotal: 49,
    total: 49,
    status: 'paid',
    paidAt: new Date(),
  });

  await test('Buyer can request a refund', async () => {
    const refund = await refundService.requestRefund(buyer._id, order._id, 'Not satisfied');
    assert(refund.status === 'requested', 'Status should be requested');
    assert(refund.amount === 49, 'Amount should match order total');
  });

  await test('Cannot request duplicate refund', async () => {
    try {
      await refundService.requestRefund(buyer._id, order._id, 'Duplicate');
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('already exists'), 'Should indicate duplicate');
    }
  });

  await test('Admin can reject a refund', async () => {
    const { Refund } = await import('../src/modules/refunds/refund.model.js');
    const refund = await Refund.findOne({ orderId: order._id });

    const rejected = await refundService.rejectRefund(admin._id, refund._id, 'Policy violation');
    assert(rejected.status === 'rejected', 'Status should be rejected');
    assert(rejected.adminNote === 'Policy violation', 'Should have admin note');
  });
}

// ─── Coupon Tests ────────────────────────────────────────────────────────────
async function couponTests() {
  console.log('\n📋 Coupon Tests');
  const { CouponService } = await import('../src/modules/coupons/coupon.service.js');
  const couponService = new CouponService();

  const { user: admin } = await createTestAdmin();
  const { user: buyer } = await createTestUser();

  await test('Admin can create a coupon', async () => {
    const coupon = await couponService.createCoupon(admin._id, {
      code: 'SAVE20',
      discountType: 'percentage',
      discountValue: 20,
      usageLimit: 100,
      perUserLimit: 1,
      applicableTo: 'all',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });
    assert(coupon.code === 'SAVE20', 'Code should match');
    assert(coupon.discountValue === 20, 'Discount should be 20');
  });

  await test('Buyer can validate a coupon', async () => {
    const result = await couponService.validateCoupon(buyer._id, 'SAVE20', 100, 'templates');
    assert(result.valid === true, 'Should be valid');
    assert(result.discount === 20, 'Discount should be $20 (20% of $100)');
    assert(result.finalAmount === 80, 'Final amount should be $80');
  });

  await test('Invalid coupon code fails', async () => {
    try {
      await couponService.validateCoupon(buyer._id, 'FAKECODE', 100, 'templates');
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('Invalid coupon code'), 'Should indicate invalid coupon');
    }
  });

  await test('Admin can list coupons', async () => {
    const result = await couponService.getCoupons({ page: 1, limit: 10 });
    assert(result.coupons.length > 0, 'Should have at least one coupon');
  });
}

// ─── Follower Tests ──────────────────────────────────────────────────────────
async function followerTests() {
  console.log('\n📋 Follower Tests');
  const { FollowerService } = await import('../src/modules/followers/follower.service.js');
  const followerService = new FollowerService();

  const { user: buyer } = await createTestUser();
  const { user: creator, profile } = await createTestCreator();

  await test('User can follow a creator', async () => {
    const result = await followerService.follow(buyer._id, creator._id);
    assert(result, 'Should return follower record');
  });

  await test('Cannot follow same creator twice', async () => {
    try {
      await followerService.follow(buyer._id, creator._id);
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('Already following'), 'Should indicate already following');
    }
  });

  await test('Check isFollowing returns true', async () => {
    const result = await followerService.isFollowing(buyer._id, creator._id);
    assert(result.following === true, 'Should be following');
  });

  await test('Get follower count returns correct count', async () => {
    const result = await followerService.getFollowerCount(creator._id);
    assert(result.count >= 1, 'Should have at least 1 follower');
  });

  await test('User can unfollow a creator', async () => {
    await followerService.unfollow(buyer._id, creator._id);
    const result = await followerService.isFollowing(buyer._id, creator._id);
    assert(result.following === false, 'Should not be following');
  });
}

// ─── Wishlist Tests ──────────────────────────────────────────────────────────
async function wishlistTests() {
  console.log('\n📋 Wishlist Tests');
  const { WishlistService } = await import('../src/modules/wishlists/wishlist.service.js');
  const wishlistService = new WishlistService();

  const { user: buyer } = await createTestUser();
  const { user: creator, profile } = await createTestCreator();
  const template = await createTestTemplate(creator._id, profile._id);

  await test('User can add template to wishlist', async () => {
    const result = await wishlistService.addToWishlist(buyer._id, template._id);
    assert(result, 'Should return wishlist item');
  });

  await test('Check isInWishlist returns true', async () => {
    const result = await wishlistService.isInWishlist(buyer._id, template._id);
    assert(result.wishlisted === true, 'Should be wishlisted');
  });

  await test('Get wishlist returns items', async () => {
    const result = await wishlistService.getUserWishlist(buyer._id);
    assert(result.items.length >= 1, 'Should have at least 1 item');
  });

  await test('User can remove from wishlist', async () => {
    await wishlistService.removeFromWishlist(buyer._id, template._id);
    const result = await wishlistService.isInWishlist(buyer._id, template._id);
    assert(result.wishlisted === false, 'Should not be wishlisted');
  });
}

// ─── Notification Tests ──────────────────────────────────────────────────────
async function notificationTests() {
  console.log('\n📋 Notification Tests');
  const { NotificationService } = await import('../src/modules/notifications/notification.service.js');
  const notificationService = new NotificationService();

  const { user } = await createTestUser();

  await test('Can create a notification', async () => {
    const notif = await notificationService.create({
      userId: user._id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification',
    });
    assert(notif._id, 'Should have an _id');
    assert(notif.read === false, 'Should be unread by default');
  });

  await test('Can get unread count', async () => {
    const result = await notificationService.getUnreadCount(user._id);
    assert(result.unreadCount >= 1, 'Should have at least 1 unread');
  });

  await test('Can mark as read', async () => {
    const { notifications } = await notificationService.getUserNotifications(user._id);
    const notif = notifications[0];
    const marked = await notificationService.markAsRead(user._id, notif._id);
    assert(marked.read === true, 'Should be marked as read');
  });

  await test('Convenience methods work', async () => {
    await notificationService.notifyOrderPaid(user._id, { orderNumber: 'ORD-123', total: 99.99 });
    const { notifications } = await notificationService.getUserNotifications(user._id);
    const orderNotif = notifications.find(n => n.type === 'order_paid');
    assert(orderNotif, 'Should have order_paid notification');
  });
}

// ─── Template Version Tests ──────────────────────────────────────────────────
async function templateVersionTests() {
  console.log('\n📋 Template Version Tests');
  const { TemplateVersionService } = await import('../src/modules/templates/templateVersion.service.js');
  const versionService = new TemplateVersionService();

  const { user: creator, profile } = await createTestCreator();
  const template = await createTestTemplate(creator._id, profile._id);

  await test('Creator can publish a version', async () => {
    const version = await versionService.publishVersion(template._id, creator._id, {
      version: '1.1.0',
      releaseNotes: 'Added dark mode',
      changes: ['Dark mode support', 'Fixed mobile layout'],
    });
    assert(version.version === '1.1.0', 'Version should be 1.1.0');
    assert(version.changes.length === 2, 'Should have 2 changes');
  });

  await test('Cannot publish duplicate version', async () => {
    try {
      await versionService.publishVersion(template._id, creator._id, {
        version: '1.1.0',
        releaseNotes: 'Duplicate',
      });
      assert(false, 'Should have thrown');
    } catch (err) {
      assert(err.message.includes('already exists'), 'Should indicate duplicate version');
    }
  });

  await test('Can get version history', async () => {
    const result = await versionService.getVersionHistory(template._id);
    assert(result.versions.length >= 1, 'Should have at least 1 version');
    assert(result.pagination.total >= 1, 'Pagination total should be >= 1');
  });

  await test('Can get latest version', async () => {
    const version = await versionService.getLatestVersion(template._id);
    assert(version.version === '1.1.0', 'Latest should be 1.1.0');
  });
}

// ─── API Module Tests (Task 17 expansion) ───────────────────────────────────
async function apiModuleTests() {
  console.log('\n📋 API Module Tests');

  const { UIShot } = await import('../src/modules/ui-shorts/uiShort.model.js');
  const { BlogPost } = await import('../src/modules/blog/blog.model.js');
  const { Notification } = await import('../src/modules/notifications/notification.model.js');

  // Tickets
  const { user: ticketUser } = await createTestUser({ email: `tickets-${Date.now()}@example.com` });
  const ticketToken = await loginToken(ticketUser.email);
  let ticketId;

  await test('Support Tickets: create ticket', async () => {
    const res = await apiRequest('POST', '/api/tickets', {
      token: ticketToken,
      body: {
        subject: 'Need checkout help',
        category: 'billing',
        message: 'I was charged but did not receive confirmation.',
        priority: 'high',
      },
    });
    assert(res.status === 201, 'Expected 201');
    assert(res.body.success === true, 'Expected success=true');
    assert(res.body.data?._id, 'Expected ticket id');
    ticketId = res.body.data._id;
  });

  await test('Support Tickets: get my tickets', async () => {
    const res = await apiRequest('GET', '/api/tickets/my', { token: ticketToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.tickets), 'Expected tickets array');
  });

  await test('Support Tickets: add reply', async () => {
    const res = await apiRequest('POST', `/api/tickets/${ticketId}/reply`, {
      token: ticketToken,
      body: { message: 'Additional details: this happened after coupon apply.' },
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?._id, 'Expected ticket object');
  });

  await test('Support Tickets: close ticket', async () => {
    const res = await apiRequest('POST', `/api/tickets/${ticketId}/close`, { token: ticketToken });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.status === 'closed', 'Expected closed status');
  });

  // Reports
  const { user: reportUser } = await createTestUser({ email: `reports-${Date.now()}@example.com` });
  const reportToken = await loginToken(reportUser.email);
  const { user: reportAdmin } = await createTestAdmin();
  const reportAdminToken = await loginToken(reportAdmin.email);
  const { user: reportCreator, profile: reportProfile } = await createTestCreator();
  const reportTemplate = await createTestTemplate(reportCreator._id, reportProfile._id);
  let reportId;

  await test('Content Reports: create report', async () => {
    const res = await apiRequest('POST', '/api/reports', {
      token: reportToken,
      body: {
        targetType: 'template',
        targetId: reportTemplate._id.toString(),
        reason: 'misleading',
        description: 'The preview appears different from the downloadable asset.',
      },
    });
    assert(res.status === 201, 'Expected 201');
    assert(res.body.success === true, 'Expected success=true');
    reportId = res.body.data?._id;
    assert(reportId, 'Expected report id');
  });

  await test('Content Reports: admin get reports', async () => {
    const res = await apiRequest('GET', '/api/reports/admin', { token: reportAdminToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.reports), 'Expected reports array');
  });

  await test('Content Reports: admin resolve report', async () => {
    const res = await apiRequest('POST', `/api/reports/admin/${reportId}/resolve`, {
      token: reportAdminToken,
      body: { adminNote: 'Reviewed and actioned', actionTaken: 'content_removed' },
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.status === 'resolved', 'Expected resolved status');
  });

  // Withdrawals
  const { user: withdrawCreator } = await createTestCreator();
  const withdrawToken = await loginToken(withdrawCreator.email);

  await test('Withdrawals: get balance', async () => {
    const res = await apiRequest('GET', '/api/withdrawals/balance', { token: withdrawToken });
    assert(res.status === 200, 'Expected 200');
    assert(typeof res.body.data?.availableBalance === 'number', 'Expected numeric availableBalance');
  });

  await test('Withdrawals: request fails when balance is 0', async () => {
    const res = await apiRequest('POST', '/api/withdrawals/request', {
      token: withdrawToken,
      body: { amount: 10, payoutMethod: 'stripe_connect', note: 'Test payout request' },
    });
    assert(res.status === 400, 'Expected 400');
    assert(typeof res.body.error === 'string', 'Expected error message');
  });

  // Blog
  const { user: blogAdmin } = await createTestAdmin();
  const blogSlug = `integration-blog-${Date.now()}`;
  await BlogPost.create({
    title: 'Integration Test Blog Post',
    slug: blogSlug,
    excerpt: 'Integration excerpt',
    content: 'This is a published blog post used for integration API tests.',
    category: 'Webflow',
    tags: ['integration', 'testing'],
    author: blogAdmin._id,
    authorName: blogAdmin.name,
    status: 'published',
    publishedAt: new Date(),
    isFeatured: true,
  });

  await test('Blog: get all posts', async () => {
    const res = await apiRequest('GET', '/api/blog');
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.posts), 'Expected posts array');
  });

  await test('Blog: get by slug', async () => {
    const res = await apiRequest('GET', `/api/blog/${blogSlug}`);
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.post?.slug === blogSlug, 'Expected matching slug');
  });

  await test('Blog: get categories', async () => {
    const res = await apiRequest('GET', '/api/blog/categories');
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data), 'Expected categories array');
  });

  await test('Blog: get tags', async () => {
    const res = await apiRequest('GET', '/api/blog/tags');
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data), 'Expected tags array');
  });

  // UI Shorts
  const { user: shotAdmin } = await createTestAdmin();
  const shotAdminToken = await loginToken(shotAdmin.email);
  const { user: shotCreator } = await createTestCreator();
  const shot = await UIShot.create({
    creatorId: shotCreator._id,
    title: 'Integration Shot',
    description: 'Shot for API tests',
    image: 'integration-shot.png',
    isPublished: true,
  });

  await test('UI Shots: get all shots', async () => {
    const res = await apiRequest('GET', '/api/ui-shorts');
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.shots), 'Expected shots array');
  });

  await test('UI Shots: admin toggle published', async () => {
    const res = await apiRequest('PATCH', `/api/ui-shorts/admin/${shot._id}/toggle-published`, {
      token: shotAdminToken,
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.isPublished === false, 'Expected unpublished after toggle');
  });

  // Settings
  const { user: settingsUser } = await createTestUser({ email: `settings-${Date.now()}@example.com` });
  const settingsToken = await loginToken(settingsUser.email);

  await test('Settings: update profile', async () => {
    const res = await apiRequest('PATCH', '/api/settings/profile', {
      token: settingsToken,
      body: { name: 'Updated Settings User', bio: 'Updated from integration test' },
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.name === 'Updated Settings User', 'Expected updated name');
  });

  await test('Settings: change password', async () => {
    const res = await apiRequest('POST', '/api/settings/change-password', {
      token: settingsToken,
      body: { currentPassword: 'TestPassword123!', newPassword: 'NewPassword123!' },
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.message === 'Password changed successfully', 'Expected success message');
  });

  await test('Settings: get email preferences', async () => {
    const res = await apiRequest('GET', '/api/settings/email-preferences', { token: settingsToken });
    assert(res.status === 200, 'Expected 200');
    assert(typeof res.body.data?.orderConfirmations === 'boolean', 'Expected preference booleans');
  });

  await test('Settings: update email preferences', async () => {
    const res = await apiRequest('PATCH', '/api/settings/email-preferences', {
      token: settingsToken,
      body: {
        orderConfirmations: true,
        reviewNotifications: false,
        promotionalEmails: false,
        weeklyDigest: true,
        newFollowerAlert: true,
      },
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.weeklyDigest === true, 'Expected weeklyDigest true');
  });

  // Notifications
  const { user: notifUser } = await createTestUser({ email: `notif-${Date.now()}@example.com` });
  const notifToken = await loginToken(notifUser.email);
  const createdNotif = await Notification.create({
    userId: notifUser._id,
    type: 'system',
    title: 'Integration Notification',
    message: 'Notification for API test',
    read: false,
  });

  await Notification.create({
    userId: notifUser._id,
    type: 'system',
    title: 'Second Notification',
    message: 'Unread notification for mark-all test',
    read: false,
  });

  await test('Notifications: get notifications', async () => {
    const res = await apiRequest('GET', '/api/notifications', { token: notifToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.notifications), 'Expected notifications array');
  });

  await test('Notifications: mark single as read', async () => {
    const res = await apiRequest('PATCH', `/api/notifications/${createdNotif._id}/read`, {
      token: notifToken,
    });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.read === true, 'Expected read=true');
  });

  await test('Notifications: mark all as read', async () => {
    const res = await apiRequest('PATCH', '/api/notifications/read-all', { token: notifToken });
    assert(res.status === 200, 'Expected 200');
    assert(typeof res.body.data?.marked === 'number', 'Expected numeric marked count');
    assert(res.body.data.marked >= 1, 'Expected at least one notification marked');
  });
}

// ─── Run all tests ───────────────────────────────────────────────────────────
async function run() {
  console.log('🧪 Flowbites Marketplace — Integration Tests\n');
  console.log('Connecting to test database...');

  try {
    await connectTestDB();
    console.log('Connected.\n');

    await clearCollections();

    await authTests();
    await reviewTests();
    await refundTests();
    await couponTests();
    await followerTests();
    await wishlistTests();
    await notificationTests();
    await templateVersionTests();
    await startApiServer();
    await apiModuleTests();
    await stopApiServer();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Results: ${passed} passed, ${failed} failed`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    await cleanupTestDB();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    await stopApiServer().catch(() => {});
    await cleanupTestDB().catch(() => {});
    process.exit(1);
  }
}

run();
