import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../modules/users/user.model.js';
import { CreatorProfile } from '../modules/creators/creator.model.js';
import { Template } from '../modules/templates/template.model.js';
import { Category } from '../modules/categories/category.model.js';
import { UIShot } from '../modules/ui-shorts/uiShort.model.js';
import { ServicePackage } from '../modules/services/service.model.js';

dotenv.config();

const seedMore = async () => {
  try {
    console.log('🌱 Adding more dummy content...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing categories
    const categories = await Category.find({});
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c._id; });

    // Get existing admin
    const admin = await User.findOne({ role: 'admin' });

    // ===== CREATE 4 MORE CREATORS =====
    const newCreators = await User.create([
      { email: 'creator3@example.com', password: 'password123', name: 'Daniel Park', role: 'creator', emailVerified: true },
      { email: 'creator4@example.com', password: 'password123', name: 'Sophie Williams', role: 'creator', emailVerified: true },
      { email: 'creator5@example.com', password: 'password123', name: 'James Okonkwo', role: 'creator', emailVerified: true },
      { email: 'creator6@example.com', password: 'password123', name: 'Lina Nakamura', role: 'creator', emailVerified: true },
    ]);
    console.log(`✅ Created ${newCreators.length} new creators`);

    const newProfiles = await CreatorProfile.create([
      {
        userId: newCreators[0]._id, displayName: 'Daniel Park', username: 'danielpark',
        bio: 'Award-winning UI designer specializing in SaaS and fintech products. 8+ years of experience.',
        isVerified: true,
        stats: { totalSales: 112, totalRevenue: 8960, templateCount: 0, averageRating: 4.9, totalReviews: 56 }
      },
      {
        userId: newCreators[1]._id, displayName: 'Sophie Williams', username: 'sophiewilliams',
        bio: 'Framer expert and brand designer. I create templates that convert visitors into customers.',
        isVerified: true,
        stats: { totalSales: 87, totalRevenue: 6090, templateCount: 0, averageRating: 4.7, totalReviews: 41 }
      },
      {
        userId: newCreators[2]._id, displayName: 'James Okonkwo', username: 'jamesokonkwo',
        bio: 'Full-stack designer building pixel-perfect Webflow sites. Former lead designer at Stripe.',
        isVerified: true,
        stats: { totalSales: 156, totalRevenue: 12480, templateCount: 0, averageRating: 4.8, totalReviews: 78 }
      },
      {
        userId: newCreators[3]._id, displayName: 'Lina Nakamura', username: 'linanakamura',
        bio: 'Japanese-inspired minimal design. Wix & Framer specialist creating serene digital experiences.',
        isVerified: true,
        stats: { totalSales: 63, totalRevenue: 4410, templateCount: 0, averageRating: 4.9, totalReviews: 32 }
      },
    ]);
    console.log(`✅ Created ${newProfiles.length} new creator profiles`);

    // Get all creators (old + new)
    const allCreators = await User.find({ role: 'creator' });
    const allProfiles = await CreatorProfile.find({});
    const profileMap = {};
    allProfiles.forEach(p => { profileMap[p.userId.toString()] = p._id; });

    // ===== CREATE 16 MORE TEMPLATES =====
    const thumbnails = [
      'flowperty-hero.webp', 'figma-1.webp', 'ethanfolio-full.webp', 'flowperty-full.webp',
      'lucasflow-full.webp', 'image-extra.webp', 'figma-2.webp', 'wealth-full.webp',
      'flowfinc-full.webp', 'landing-ui.webp', 'platform.webp', 'flowperty-thumb.webp',
      'homepage6-full.webp', 'jamesbond-thumb.webp', 'ui-templates.webp', 'monexa-thumb.webp',
    ];

    const newTemplates = await Template.create([
      {
        title: 'Nova — AI Startup Landing Page', slug: 'nova-ai-startup-landing',
        description: 'Sleek landing page for AI startups with animated hero, feature showcase, and waitlist signup.',
        creatorId: newCreators[0]._id, creatorProfileId: newProfiles[0]._id,
        platform: 'framer', category: catMap['technology'], price: 59,
        thumbnail: thumbnails[0], gallery: ['gallery-1.webp', 'gallery-2.webp'],
        templateFile: 'nova-ai.zip', fileSize: 9437184, licenseType: 'commercial',
        status: 'approved', isFeatured: true, demoUrl: 'https://demo.flowbites.com/nova',
        version: '1.0.0', stats: { views: 4230, purchases: 134, revenue: 7906, likes: 567, downloads: 134 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-12')
      },
      {
        title: 'Zenith Creative Agency', slug: 'zenith-creative-agency',
        description: 'Bold agency template with case study layouts, team grid, and motion design sections.',
        creatorId: newCreators[2]._id, creatorProfileId: newProfiles[2]._id,
        platform: 'webflow', category: catMap['portfolio-agency'], price: 79,
        thumbnail: thumbnails[1], gallery: ['gallery-4.webp', 'gallery-5.webp'],
        templateFile: 'zenith-agency.zip', fileSize: 15728640, licenseType: 'commercial',
        status: 'approved', isFeatured: true, demoUrl: 'https://demo.flowbites.com/zenith',
        version: '2.0.0', stats: { views: 5670, purchases: 189, revenue: 14931, likes: 892, downloads: 189 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-01-20')
      },
      {
        title: 'Kira — Personal Portfolio', slug: 'kira-personal-portfolio',
        description: 'Minimal personal portfolio with smooth page transitions and project detail pages.',
        creatorId: newCreators[3]._id, creatorProfileId: newProfiles[3]._id,
        platform: 'framer', category: catMap['portfolio-agency'], price: 39,
        thumbnail: thumbnails[2], gallery: ['gallery-6.webp'],
        templateFile: 'kira-portfolio.zip', fileSize: 6291456, licenseType: 'personal',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/kira',
        version: '1.2.0', stats: { views: 2340, purchases: 78, revenue: 3042, likes: 345, downloads: 78 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-01')
      },
      {
        title: 'Finova — Fintech Dashboard', slug: 'finova-fintech-dashboard',
        description: 'Professional fintech dashboard with real-time charts, transaction tables, and wallet views.',
        creatorId: newCreators[0]._id, creatorProfileId: newProfiles[0]._id,
        platform: 'webflow', category: catMap['technology'], price: 99,
        thumbnail: thumbnails[3], gallery: ['gallery-7.webp', 'gallery-8.webp'],
        templateFile: 'finova-dashboard.zip', fileSize: 18874368, licenseType: 'commercial',
        status: 'approved', isFeatured: true, demoUrl: 'https://demo.flowbites.com/finova',
        version: '1.5.0', stats: { views: 3890, purchases: 98, revenue: 9702, likes: 678, downloads: 98 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-01-15')
      },
      {
        title: 'Bloom — Wedding Planner', slug: 'bloom-wedding-planner',
        description: 'Romantic wedding template with RSVP forms, photo galleries, and countdown timer.',
        creatorId: newCreators[1]._id, creatorProfileId: newProfiles[1]._id,
        platform: 'wix', category: catMap['weddings-events'], price: 45,
        thumbnail: thumbnails[4], gallery: ['gallery-9.webp'],
        templateFile: 'bloom-wedding.zip', fileSize: 10485760, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/bloom',
        version: '1.0.0', stats: { views: 1560, purchases: 42, revenue: 1890, likes: 234, downloads: 42 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-05')
      },
      {
        title: 'Artisan — Craft Store', slug: 'artisan-craft-store',
        description: 'Handmade goods e-commerce template with product filtering, wishlist, and artisan profiles.',
        creatorId: newCreators[2]._id, creatorProfileId: newProfiles[2]._id,
        platform: 'webflow', category: catMap['retail-ecommerce'], price: 89,
        thumbnail: thumbnails[5], gallery: ['gallery-10.webp', 'gallery-11.webp'],
        templateFile: 'artisan-store.zip', fileSize: 14680064, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/artisan',
        version: '1.3.0', stats: { views: 2780, purchases: 67, revenue: 5963, likes: 389, downloads: 67 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-01-28')
      },
      {
        title: 'Velocity — SaaS Pricing Page', slug: 'velocity-saas-pricing',
        description: 'Conversion-optimized pricing page with toggle billing, feature comparison, and FAQ accordion.',
        creatorId: newCreators[0]._id, creatorProfileId: newProfiles[0]._id,
        platform: 'framer', category: catMap['technology'], price: 29,
        thumbnail: thumbnails[6], gallery: ['gallery-12.webp'],
        templateFile: 'velocity-pricing.zip', fileSize: 4194304, licenseType: 'personal',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/velocity',
        version: '1.0.0', stats: { views: 6120, purchases: 234, revenue: 6786, likes: 1023, downloads: 234 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-10')
      },
      {
        title: 'Verde — Eco Nonprofit', slug: 'verde-eco-nonprofit',
        description: 'Green-focused nonprofit template with donation forms, impact metrics, and volunteer signup.',
        creatorId: newCreators[3]._id, creatorProfileId: newProfiles[3]._id,
        platform: 'wix', category: catMap['community-nonprofit'], price: 35,
        thumbnail: thumbnails[7], gallery: ['gallery-13.webp'],
        templateFile: 'verde-nonprofit.zip', fileSize: 8388608, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/verde',
        isFeatured: true,
        version: '1.0.0', stats: { views: 980, purchases: 23, revenue: 805, likes: 156, downloads: 23 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-08')
      },
      {
        title: 'Lyric — Music Artist', slug: 'lyric-music-artist',
        description: 'Vibrant music artist template with audio player, tour dates, merch store, and music video embeds.',
        creatorId: newCreators[1]._id, creatorProfileId: newProfiles[1]._id,
        platform: 'framer', category: catMap['music-audio'], price: 49,
        thumbnail: thumbnails[8], gallery: ['gallery-14.webp'],
        templateFile: 'lyric-music.zip', fileSize: 11534336, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/lyric',
        version: '1.1.0', stats: { views: 1890, purchases: 45, revenue: 2205, likes: 278, downloads: 45 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-03')
      },
      {
        title: 'Atlas — Consulting Firm', slug: 'atlas-consulting-firm',
        description: 'Corporate consulting template with case studies, team bios, service packages, and contact forms.',
        creatorId: newCreators[2]._id, creatorProfileId: newProfiles[2]._id,
        platform: 'webflow', category: catMap['professional-services'], price: 69,
        thumbnail: thumbnails[9], gallery: ['gallery-15.webp', 'landing-ui.webp'],
        templateFile: 'atlas-consulting.zip', fileSize: 12582912, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/atlas',
        version: '2.1.0', stats: { views: 3450, purchases: 112, revenue: 7728, likes: 534, downloads: 112 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-01-18')
      },
      {
        title: 'Pulse — Fitness Tracker App', slug: 'pulse-fitness-tracker',
        description: 'App landing page for fitness and health tracker apps with app store badges and feature tours.',
        creatorId: newCreators[0]._id, creatorProfileId: newProfiles[0]._id,
        platform: 'framer', category: catMap['wellness'], price: 39,
        thumbnail: thumbnails[10], gallery: ['platform.webp'],
        templateFile: 'pulse-fitness.zip', fileSize: 7340032, licenseType: 'personal',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/pulse',
        version: '1.0.0', stats: { views: 2100, purchases: 56, revenue: 2184, likes: 312, downloads: 56 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-06')
      },
      {
        title: 'Savory — Recipe Blog', slug: 'savory-recipe-blog',
        description: 'Food blog template with recipe cards, ingredient lists, cooking time badges, and newsletter signup.',
        creatorId: newCreators[3]._id, creatorProfileId: newProfiles[3]._id,
        platform: 'wix', category: catMap['blog-editorial'], price: 35,
        thumbnail: thumbnails[11], gallery: ['ui-templates.webp'],
        templateFile: 'savory-blog.zip', fileSize: 9437184, licenseType: 'personal',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/savory',
        version: '1.0.0', stats: { views: 1340, purchases: 34, revenue: 1190, likes: 198, downloads: 34 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-04')
      },
      {
        title: 'Horizon — Architecture Studio', slug: 'horizon-architecture',
        description: 'Minimalist architecture template with project galleries, process timeline, and contact sections.',
        creatorId: newCreators[2]._id, creatorProfileId: newProfiles[2]._id,
        platform: 'webflow', category: catMap['architecture-design'], price: 75,
        thumbnail: thumbnails[12], gallery: ['gallery-3.webp'],
        templateFile: 'horizon-arch.zip', fileSize: 13631488, licenseType: 'commercial',
        status: 'approved', isFeatured: true, demoUrl: 'https://demo.flowbites.com/horizon',
        version: '1.4.0', stats: { views: 2890, purchases: 78, revenue: 5850, likes: 456, downloads: 78 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-01-22')
      },
      {
        title: 'Nimbus — Cloud Hosting', slug: 'nimbus-cloud-hosting',
        description: 'Tech-forward hosting company template with pricing calculator, uptime stats, and knowledge base.',
        creatorId: newCreators[1]._id, creatorProfileId: newProfiles[1]._id,
        platform: 'framer', category: catMap['technology'], price: 55,
        thumbnail: thumbnails[13], gallery: ['gallery-1.webp'],
        templateFile: 'nimbus-hosting.zip', fileSize: 10485760, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/nimbus',
        version: '1.0.0', stats: { views: 1670, purchases: 43, revenue: 2365, likes: 234, downloads: 43 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-07')
      },
      {
        title: 'Oasis — Spa & Wellness Retreat', slug: 'oasis-spa-wellness',
        description: 'Tranquil spa template with booking system, treatment menu, therapist profiles, and gift cards.',
        creatorId: newCreators[3]._id, creatorProfileId: newProfiles[3]._id,
        platform: 'wix', category: catMap['hair-beauty'], price: 49,
        thumbnail: thumbnails[14], gallery: ['gallery-5.webp'],
        templateFile: 'oasis-spa.zip', fileSize: 8912896, licenseType: 'commercial',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/oasis',
        version: '1.0.0', stats: { views: 1120, purchases: 29, revenue: 1421, likes: 178, downloads: 29 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-09')
      },
      {
        title: 'CodeBase — Developer Portfolio', slug: 'codebase-dev-portfolio',
        description: 'Developer portfolio with GitHub integration, project showcases, blog with code highlighting.',
        creatorId: newCreators[0]._id, creatorProfileId: newProfiles[0]._id,
        platform: 'framer', category: catMap['personal'], price: 29,
        thumbnail: thumbnails[15], gallery: ['gallery-2.webp'],
        templateFile: 'codebase-portfolio.zip', fileSize: 5242880, licenseType: 'personal',
        status: 'approved', demoUrl: 'https://demo.flowbites.com/codebase',
        version: '1.0.0', stats: { views: 3560, purchases: 167, revenue: 4843, likes: 789, downloads: 167 },
        moderatedBy: admin._id, moderatedAt: new Date('2026-02-11')
      },
    ]);
    console.log(`✅ Created ${newTemplates.length} new templates`);

    // ===== CREATE 15 MORE UI SHOTS =====
    const allTemplates = await Template.find({ status: 'approved' });

    const shotImages = [
      'g1.webp', 'g2.webp', 'g3.webp',
      'g4.webp', 'g5.webp', 'g6.webp',
      'g7.webp', 'g8.webp', 'g9.webp',
      'g10.webp', 'g11.webp', 'g12.webp',
      'g13.webp', 'g14.webp', 'g15.webp',
    ];

    const newShots = await UIShot.create([
      {
        creatorId: newCreators[0]._id, title: 'Fintech Dashboard — Dark Mode',
        description: 'Dark theme dashboard with real-time crypto charts, portfolio overview, and transaction history.',
        image: shotImages[0], templateId: allTemplates[3]?._id,
        tags: ['fintech', 'dashboard', 'dark-mode', 'charts'],
        stats: { views: 3420, likes: 456, saves: 189 },
      },
      {
        creatorId: newCreators[1]._id, title: 'E-Commerce Checkout Flow',
        description: 'Multi-step checkout with progress indicator, address form, payment selection, and order summary.',
        image: shotImages[1], templateId: allTemplates[8]?._id,
        tags: ['ecommerce', 'checkout', 'ux', 'forms'],
        stats: { views: 2890, likes: 378, saves: 156 },
      },
      {
        creatorId: newCreators[2]._id, title: 'Travel App — Destination Explorer',
        description: 'Immersive destination discovery with full-bleed imagery, trip planning, and saved itineraries.',
        image: shotImages[2], templateId: allTemplates[7]?._id,
        tags: ['travel', 'app', 'exploration', 'mobile'],
        stats: { views: 1890, likes: 267, saves: 112 },
      },
      {
        creatorId: newCreators[3]._id, title: 'Glassmorphism Login Screen',
        description: 'Modern login form with frosted glass effect, social sign-in buttons, and biometric icon.',
        image: shotImages[3],
        tags: ['login', 'glassmorphism', 'auth', 'ui'],
        stats: { views: 5670, likes: 823, saves: 345 },
      },
      {
        creatorId: newCreators[0]._id, title: 'SaaS Pricing Table Comparison',
        description: 'Clean pricing component with monthly/yearly toggle, highlighted plan, and feature comparison grid.',
        image: shotImages[4], templateId: allTemplates[6]?._id,
        tags: ['pricing', 'saas', 'comparison', 'components'],
        stats: { views: 4120, likes: 567, saves: 234 },
      },
      {
        creatorId: newCreators[1]._id, title: 'User Profile Dashboard',
        description: 'Profile settings page with avatar upload, account details, notification preferences, and activity log.',
        image: shotImages[5],
        tags: ['profile', 'settings', 'dashboard', 'account'],
        stats: { views: 2340, likes: 312, saves: 145 },
      },
      {
        creatorId: newCreators[2]._id, title: 'Hero Section — Product Launch',
        description: 'Animated hero section with 3D product mockup, gradient text, and email capture CTA.',
        image: shotImages[6], templateId: allTemplates[0]?._id,
        tags: ['hero', 'landing', 'product', 'launch'],
        stats: { views: 7890, likes: 1234, saves: 567 },
      },
      {
        creatorId: newCreators[3]._id, title: 'Card Component Library',
        description: 'Comprehensive card design system with 12 variants: product, profile, stat, testimonial, and more.',
        image: shotImages[7],
        tags: ['cards', 'components', 'design-system', 'ui-kit'],
        stats: { views: 6540, likes: 987, saves: 456 },
      },
      {
        creatorId: newCreators[0]._id, title: 'Navigation Bar Variants',
        description: 'Eight navbar designs: transparent, solid, sidebar, mega menu, mobile drawer, and command palette.',
        image: shotImages[8],
        tags: ['navbar', 'navigation', 'header', 'menu'],
        stats: { views: 4560, likes: 678, saves: 289 },
      },
      {
        creatorId: newCreators[1]._id, title: 'Modal Dialog System',
        description: 'Accessible modal designs: confirmation, form, gallery lightbox, video player, and cookie consent.',
        image: shotImages[9],
        tags: ['modal', 'dialog', 'popup', 'accessibility'],
        stats: { views: 3210, likes: 423, saves: 198 },
      },
      {
        creatorId: newCreators[2]._id, title: 'Checkout — Payment Methods',
        description: 'Payment selection screen with Apple Pay, Google Pay, credit card form, and crypto wallet options.',
        image: shotImages[10],
        tags: ['checkout', 'payment', 'fintech', 'stripe'],
        stats: { views: 2890, likes: 389, saves: 167 },
      },
      {
        creatorId: newCreators[3]._id, title: 'App Onboarding Flow',
        description: 'Four-step onboarding with illustrations, progress dots, skip option, and personalization quiz.',
        image: shotImages[11],
        tags: ['onboarding', 'mobile', 'walkthrough', 'ux'],
        stats: { views: 3780, likes: 534, saves: 223 },
      },
      {
        creatorId: newCreators[0]._id, title: 'Settings Panel — Account Security',
        description: 'Security settings with 2FA setup, session management, login history, and connected apps.',
        image: shotImages[12],
        tags: ['settings', 'security', 'account', 'dashboard'],
        stats: { views: 1980, likes: 267, saves: 134 },
      },
      {
        creatorId: newCreators[2]._id, title: 'Analytics Dashboard — KPI Cards',
        description: 'Data visualization dashboard with sparkline KPI cards, donut charts, and revenue trend graphs.',
        image: shotImages[13], templateId: allTemplates[0]?._id,
        tags: ['analytics', 'charts', 'data-viz', 'kpi'],
        stats: { views: 5430, likes: 789, saves: 345 },
      },
      {
        creatorId: newCreators[3]._id, title: 'Mobile App — Social Feed',
        description: 'Social media feed design with stories bar, post cards, reactions, and floating compose button.',
        image: shotImages[14],
        tags: ['mobile', 'social', 'feed', 'app'],
        stats: { views: 4670, likes: 678, saves: 289 },
      },
    ]);
    console.log(`✅ Created ${newShots.length} new UI shots`);

    // ===== CREATE 4 MORE SERVICE PACKAGES =====
    const sp1 = new ServicePackage({
      creatorId: newCreators[0]._id, templateId: newTemplates[3]?._id,
      name: 'Fintech Dashboard Customization', description: 'Full customization of the Finova dashboard including branding, custom widgets, and API integration setup.',
      category: 'webflow-development', price: 450, deliveryDays: 7, revisions: 3,
      features: ['Custom branding', 'Widget configuration', 'API integration', 'Data visualization setup', 'Performance optimization'],
      requirements: 'Brand guidelines, data source documentation, desired widget configurations.',
      tags: ['fintech', 'dashboard', 'webflow'], isActive: true,
      stats: { orders: 18, completed: 15, revenue: 8100 }
    });
    await sp1.save();

    const sp2 = new ServicePackage({
      creatorId: newCreators[2]._id, templateId: newTemplates[1]?._id,
      name: 'Full Agency Website Build', description: 'Complete agency website setup with case studies, team pages, blog, and CMS for all dynamic content.',
      category: 'webflow-development', price: 600, deliveryDays: 10, revisions: 4,
      features: ['Full CMS setup', 'Case study pages', 'Team directory', 'Blog with categories', 'Contact forms', 'SEO optimization'],
      requirements: 'Case study content, team bios, brand assets, and content strategy.',
      tags: ['agency', 'webflow', 'full-build'], isActive: true,
      stats: { orders: 24, completed: 21, revenue: 14400 }
    });
    await sp2.save();

    const sp3 = new ServicePackage({
      creatorId: newCreators[1]._id, templateId: newTemplates[4]?._id,
      name: 'Wedding Website Setup', description: 'Beautiful wedding website with RSVP tracking, photo gallery, registry links, and event timeline.',
      category: 'wix-development', price: 180, deliveryDays: 3, revisions: 2,
      features: ['RSVP form setup', 'Photo gallery', 'Event timeline', 'Gift registry links', 'Guest management', 'Custom domain'],
      requirements: 'Wedding details, photos, event schedule, and registry URLs.',
      tags: ['wedding', 'wix', 'events'], isActive: true,
      stats: { orders: 9, completed: 8, revenue: 1620 }
    });
    await sp3.save();

    const sp4 = new ServicePackage({
      creatorId: newCreators[3]._id, templateId: newTemplates[11]?._id,
      name: 'Recipe Blog Full Setup', description: 'Complete food blog with recipe CMS, ingredient lists, cooking times, and newsletter integration.',
      category: 'wix-development', price: 220, deliveryDays: 5, revisions: 2,
      features: ['Recipe CMS setup', 'Category pages', 'Newsletter integration', 'SEO optimization', 'Social sharing', 'Print-friendly recipes'],
      requirements: '10+ recipes with photos, category structure, and newsletter provider details.',
      tags: ['blog', 'food', 'wix'], isActive: true,
      stats: { orders: 7, completed: 6, revenue: 1540 }
    });
    await sp4.save();

    console.log('✅ Created 4 new service packages');

    // ===== CREATE 2 MORE BUYERS =====
    await User.create([
      { email: 'buyer3@example.com', password: 'password123', name: 'Emily Davis', role: 'buyer', emailVerified: true },
      { email: 'buyer4@example.com', password: 'password123', name: 'Marcus Lee', role: 'buyer', emailVerified: true },
    ]);
    console.log('✅ Created 2 new buyers');

    // Recompute all creator stats from actual template data
    const allProfilesFinal = await CreatorProfile.find({});
    for (const profile of allProfilesFinal) {
      const creatorTemplates = await Template.find({
        creatorProfileId: profile._id,
        status: 'approved'
      });
      const templateCount = creatorTemplates.length;
      const totalSales = creatorTemplates.reduce((sum, t) => sum + (t.stats?.purchases || 0), 0);
      const totalRevenue = creatorTemplates.reduce((sum, t) => sum + (t.stats?.revenue || 0), 0);

      await CreatorProfile.findByIdAndUpdate(profile._id, {
        $set: {
          'stats.templateCount': templateCount,
          'stats.totalSales': totalSales,
          'stats.totalRevenue': totalRevenue
        }
      });
    }
    console.log('✅ Updated all creator stats from template data');

    console.log('\n🎉 Additional dummy content added!');
    console.log('\n📝 New Test Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Creator 3: creator3@example.com / password123');
    console.log('Creator 4: creator4@example.com / password123');
    console.log('Creator 5: creator5@example.com / password123');
    console.log('Creator 6: creator6@example.com / password123');
    console.log('Buyer 3:   buyer3@example.com / password123');
    console.log('Buyer 4:   buyer4@example.com / password123');
    console.log('─────────────────────────────────────────');
    console.log('\nTotal added: 4 creators, 16 templates, 15 UI shots, 4 services, 2 buyers\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedMore();
