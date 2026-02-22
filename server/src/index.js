import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateEnv } from './config/validateEnv.js';
import { mongoSanitize } from './middleware/sanitize.js';
import { csrfProtection } from './middleware/csrf.js';
import { startCleanupScheduler } from './jobs/cleanup.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import templateRoutes from './modules/templates/template.routes.js';
import orderRoutes from './modules/orders/order.routes.js';
import downloadRoutes from './modules/downloads/download.routes.js';
import serviceRoutes from './modules/services/service.routes.js';
import uiShortRoutes from './modules/ui-shorts/uiShort.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import checkoutRoutes from './modules/checkout/checkout.routes.js';
import webhookRoutes from './modules/checkout/webhook.routes.js';
import creatorRoutes from './modules/creators/creator.routes.js';
import blogRoutes from './modules/blog/blog.routes.js';
import sitemapRoutes from './modules/sitemap/sitemap.routes.js';
import reviewRoutes from './modules/reviews/review.routes.js';
import refundRoutes from './modules/refunds/refund.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import wishlistRoutes from './modules/wishlists/wishlist.routes.js';
import couponRoutes from './modules/coupons/coupon.routes.js';
import followerRoutes from './modules/followers/follower.routes.js';
import templateVersionRoutes from './modules/templates/templateVersion.routes.js';
import earningsRoutes from './modules/creators/earnings.routes.js';
import searchRoutes from './modules/templates/search.routes.js';
import settingsRoutes from './modules/users/settings.routes.js';
import userManagementRoutes from './modules/admin/userManagement.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import auditRoutes from './modules/audit/audit.routes.js';
import withdrawalRoutes from './modules/withdrawals/withdrawal.routes.js';
import ticketRoutes from './modules/tickets/ticket.routes.js';
import conversationRoutes from './modules/messaging/messaging.routes.js';

// Load .env only for local development — on Railway/production, env vars are injected by the platform
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Validate required env vars before anything else
validateEnv();

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL, process.env.SITE_URL].filter(Boolean)
    : [
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174'
      ].filter(Boolean),
  credentials: true
}));

// Rate limiting — general API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Stricter rate limiting for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  message: { success: false, error: 'Too many login attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/refresh', authLimiter);

// Stripe webhook (must be before express.json() for raw body verification)
app.use('/api/webhooks', webhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs (prevent NoSQL injection)
app.use(mongoSanitize);

// CSRF protection — validates Origin/Referer on state-changing requests
app.use(csrfProtection);

// Gzip compression for responses
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Flowbites Marketplace API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/ui-shorts', uiShortRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', categoryRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api', sitemapRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/templates', templateVersionRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/audit', auditRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/conversations', conversationRoutes);

// ---------------------------------------------------------------------------
// SPA fallback (only when a built client exists in /public)
// When deployed API-only (e.g. Railway), this is skipped gracefully.
// ---------------------------------------------------------------------------
import fs from 'fs';

const publicPath = path.resolve(__dirname, '..', 'public');
const hasPublicIndex = fs.existsSync(path.join(publicPath, 'index.html'));

if (hasPublicIndex) {
  app.use(express.static(publicPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // API-only mode: 404 for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found',
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

// Start background cleanup cron jobs
const cleanupTimer = startCleanupScheduler();

// Graceful shutdown
import mongoose from 'mongoose';

function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  clearInterval(cleanupTimer);
  server.close(async () => {
    console.log('✅ HTTP server closed');
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (err) {
      console.error('Error closing MongoDB:', err);
    }
    process.exit(0);
  });

  // Force exit after 10s if graceful shutdown fails
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
