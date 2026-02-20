import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

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

// Load environment variables
dotenv.config();

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
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Stripe webhook (must be before express.json() for raw body verification)
app.use('/api/webhooks', webhookRoutes);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// ---------------------------------------------------------------------------
// Production: Serve built React client from /public
// ---------------------------------------------------------------------------
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.resolve(__dirname, '..', 'public');
  app.use(express.static(publicPath));

  // SPA fallback: serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Development: 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
