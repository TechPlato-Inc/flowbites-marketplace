import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../modules/users/user.model.js';
import { CreatorProfile } from '../modules/creators/creator.model.js';
import { Template } from '../modules/templates/template.model.js';
import { Category, Tag } from '../modules/categories/category.model.js';
import { UIShot } from '../modules/ui-shorts/uiShort.model.js';
import { Order } from '../modules/orders/order.model.js';
import { License } from '../modules/downloads/license.model.js';
import { ServicePackage, ServiceOrder } from '../modules/services/service.model.js';

dotenv.config();

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      CreatorProfile.deleteMany({}),
      Template.deleteMany({}),
      Category.deleteMany({}),
      Tag.deleteMany({}),
      UIShot.deleteMany({}),
      Order.deleteMany({}),
      License.deleteMany({}),
      ServicePackage.deleteMany({}),
      ServiceOrder.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create 26 categories
    const categories = await Category.create([
      { name: 'Portfolio & Agency', slug: 'portfolio-agency', description: 'Creative, design, marketing, projects.', icon: '🎨', color: '#8B5CF6', order: 1, templateCount: 6154 },
      { name: 'Technology', slug: 'technology', description: 'Tech, software, electronics, programming.', icon: '💻', color: '#3B82F6', order: 2, templateCount: 5126 },
      { name: 'Professional Services', slug: 'professional-services', description: 'Legal, financial, consulting, accounting.', icon: '💼', color: '#6366F1', order: 3, templateCount: 2198 },
      { name: 'Retail & E-Commerce', slug: 'retail-ecommerce', description: 'Online stores, retail businesses.', icon: '🛍️', color: '#F59E0B', order: 4, templateCount: 1013 },
      { name: 'Blog & Editorial', slug: 'blog-editorial', description: 'Journalism, articles, publishing, storytelling.', icon: '📝', color: '#EC4899', order: 5, templateCount: 881 },
      { name: 'Architecture & Design', slug: 'architecture-design', description: 'Interior design, buildings, homes.', icon: '🏛️', color: '#78716C', order: 6, templateCount: 710 },
      { name: 'Food & Drink', slug: 'food-drink', description: 'Restaurants, cuisine, beverages, catering.', icon: '🍽️', color: '#EF4444', order: 7, templateCount: 565 },
      { name: 'Wellness', slug: 'wellness', description: 'Fitness, nutrition, yoga, meditation.', icon: '🧘', color: '#10B981', order: 8, templateCount: 561 },
      { name: 'Home Services', slug: 'home-services', description: 'Building, renovation, repair, maintenance.', icon: '🏠', color: '#F97316', order: 9, templateCount: 489 },
      { name: 'Real Estate', slug: 'real-estate', description: 'Housing, rentals, realtors, property listings.', icon: '🏢', color: '#0EA5E9', order: 10, templateCount: 443 },
      { name: 'Medical', slug: 'medical', description: 'Healthcare, clinics, hospitals, medical services.', icon: '🏥', color: '#14B8A6', order: 11, templateCount: 407 },
      { name: 'Personal', slug: 'personal', description: 'CVs, biographies, personal branding.', icon: '👤', color: '#A855F7', order: 12, templateCount: 339 },
      { name: 'Education', slug: 'education', description: 'Schools, universities, e-learning, courses.', icon: '🎓', color: '#2563EB', order: 13, templateCount: 334 },
      { name: 'Travel', slug: 'travel', description: 'Hotels, tourism, vacation, travel agency.', icon: '✈️', color: '#0891B2', order: 14, templateCount: 280 },
      { name: 'Hair & Beauty', slug: 'hair-beauty', description: 'Salons, barbershops, cosmetics, spa.', icon: '💇', color: '#DB2777', order: 15, templateCount: 264 },
      { name: 'Community & Nonprofit', slug: 'community-nonprofit', description: 'Charity, volunteering, NGOs.', icon: '🤝', color: '#059669', order: 16, templateCount: 212 },
      { name: 'UI Kit', slug: 'ui-kit', description: 'UI templates, design components, landing pages.', icon: '🧩', color: '#7C3AED', order: 17, templateCount: 188 },
      { name: 'Environment', slug: 'environment', description: 'Environmental or eco-focused themes.', icon: '🌿', color: '#16A34A', order: 18, templateCount: 176 },
      { name: 'Arts & Entertainment', slug: 'arts-entertainment', description: 'Arts, music, theatre, cinema, museums.', icon: '🎭', color: '#E11D48', order: 19, templateCount: 162 },
      { name: 'Weddings & Events', slug: 'weddings-events', description: 'Marriage, ceremonies, parties, event planning.', icon: '💒', color: '#F472B6', order: 20, templateCount: 159 },
      { name: 'Transportation', slug: 'transportation', description: 'Cars, logistics, public transport, automotive.', icon: '🚛', color: '#475569', order: 21, templateCount: 137 },
      { name: 'Music & Audio', slug: 'music-audio', description: 'Bands, audio production, sound design.', icon: '🎵', color: '#9333EA', order: 22, templateCount: 127 },
      { name: 'HR & Hiring', slug: 'hr-hiring', description: 'Job search, recruitment, listings.', icon: '👥', color: '#0284C7', order: 23, templateCount: 109 },
      { name: 'Documentation', slug: 'documentation', description: 'Guides, manuals, tutorials, instructions.', icon: '📚', color: '#4F46E5', order: 24, templateCount: 78 },
      { name: 'Government', slug: 'government', description: 'Public sector, policy, governance.', icon: '🏛️', color: '#1E40AF', order: 25, templateCount: 52 },
      { name: 'Launch & Coming Soon', slug: 'launch-coming-soon', description: 'Debut, product intro, startup pre-launch.', icon: '🚀', color: '#DC2626', order: 26, templateCount: 50 }
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    // Tags per category
    const categoryTagsMap = {
      'portfolio-agency': ['portfolio', 'agency', 'creative', 'freelancer', 'studio'],
      'technology': ['technology', 'software', 'saas', 'startup', 'app'],
      'professional-services': ['consulting', 'lawyer', 'finance', 'accountant', 'services'],
      'retail-ecommerce': ['ecommerce', 'retail', 'shop', 'store', 'products'],
      'blog-editorial': ['blog', 'magazine', 'editorial', 'content', 'news'],
      'architecture-design': ['architecture', 'interior-design', 'building', 'construction', 'design-studio'],
      'food-drink': ['restaurant', 'cafe', 'food', 'drink', 'catering'],
      'wellness': ['wellness', 'fitness', 'yoga', 'health', 'meditation'],
      'home-services': ['plumbing', 'electrician', 'home-service', 'repair', 'handyman'],
      'real-estate': ['real-estate', 'realtor', 'housing', 'rental', 'listings'],
      'medical': ['medical', 'clinic', 'doctor', 'healthcare', 'hospital'],
      'personal': ['cv', 'resume', 'personal', 'bio', 'profile'],
      'education': ['education', 'school', 'course', 'learning', 'lms'],
      'travel': ['travel', 'tourism', 'hotel', 'vacation', 'trip'],
      'hair-beauty': ['beauty', 'hair', 'salon', 'barber', 'spa'],
      'community-nonprofit': ['nonprofit', 'charity', 'donation', 'community', 'ngo'],
      'ui-kit': ['ui-kit', 'components', 'design-system', 'landing', 'wireframe'],
      'environment': ['eco', 'environment', 'green', 'sustainability', 'nature'],
      'arts-entertainment': ['art', 'music', 'entertainment', 'theatre', 'gallery'],
      'weddings-events': ['wedding', 'event', 'ceremony', 'planner', 'celebration'],
      'transportation': ['transport', 'automotive', 'car', 'logistics', 'delivery'],
      'music-audio': ['band', 'audio', 'sound', 'podcast', 'producer'],
      'hr-hiring': ['jobs', 'hiring', 'hr', 'recruitment', 'careers'],
      'documentation': ['docs', 'documentation', 'manual', 'guide', 'knowledgebase'],
      'government': ['government', 'public-sector', 'policy', 'civic', 'municipal'],
      'launch-coming-soon': ['launch', 'coming-soon', 'countdown', 'teaser', 'waitlist']
    };

    // Collect all unique tag names
    const allTagNames = [...new Set(Object.values(categoryTagsMap).flat())];
    const tags = await Tag.create(
      allTagNames.map(name => ({
        name,
        slug: name, // already lowercase/slugified
        usageCount: 0
      }))
    );
    console.log(`✅ Created ${tags.length} tags`);

    // Create admin user
    const admin = await User.create({
      email: 'admin@flowbites.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      emailVerified: true
    });
    console.log('✅ Created admin user');

    // Create buyers
    const buyers = await User.create([
      {
        email: 'buyer1@example.com',
        password: 'password123',
        name: 'John Smith',
        role: 'buyer',
        emailVerified: true
      },
      {
        email: 'buyer2@example.com',
        password: 'password123',
        name: 'Sarah Johnson',
        role: 'buyer',
        emailVerified: true
      }
    ]);
    console.log(`✅ Created ${buyers.length} buyers`);

    // Create creators
    const creators = await User.create([
      {
        email: 'creator1@example.com',
        password: 'password123',
        name: 'Alex Rivera',
        role: 'creator',
        emailVerified: true
      },
      {
        email: 'creator2@example.com',
        password: 'password123',
        name: 'Maria Chen',
        role: 'creator',
        emailVerified: true
      }
    ]);
    console.log(`✅ Created ${creators.length} creators`);

    // Create creator profiles
    const creatorProfiles = await CreatorProfile.create([
      {
        userId: creators[0]._id,
        displayName: 'Alex Rivera',
        username: 'alexrivera',
        bio: 'Full-stack developer specializing in Webflow and Framer. Creating premium templates for modern web applications.',
        website: 'https://alexrivera.dev',
        twitter: 'alexrivera',
        github: 'alexrivera',
        isVerified: true,
        stats: {
          totalSales: 45,
          totalRevenue: 3450,
          templateCount: 0,
          averageRating: 4.8,
          totalReviews: 23
        }
      },
      {
        userId: creators[1]._id,
        displayName: 'Maria Chen',
        username: 'mariachen',
        bio: 'UI/UX Designer & Webflow Expert. Crafting beautiful and functional design systems.',
        website: 'https://mariachen.design',
        dribbble: 'mariachen',
        github: 'mariachen',
        isVerified: true,
        stats: {
          totalSales: 67,
          totalRevenue: 5230,
          templateCount: 0,
          averageRating: 4.9,
          totalReviews: 34
        }
      }
    ]);
    console.log(`✅ Created ${creatorProfiles.length} creator profiles`);

    // Helper to find tag IDs by names
    const getTagIds = (names) => names.map(name => tags.find(t => t.name === name)?._id).filter(Boolean);

    // Create templates (12 total across all 3 platforms, various categories)
    const templateData = [
      {
        title: 'Modern SaaS Dashboard Pro',
        slug: 'modern-saas-dashboard-pro',
        description: 'A comprehensive Webflow dashboard template with beautiful charts, tables, and analytics.\n\nFeatures:\n• 50+ UI components\n• Dark/Light mode\n• Responsive design\n• CMS integration',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'webflow',
        category: categories.find(c => c.slug === 'technology')._id,
        tags: getTagIds(['saas', 'software', 'startup']),
        price: 79,
        thumbnail: 'flowdark-full.webp',
        gallery: ['gallery-1.webp', 'gallery-2.webp', 'gallery-3.webp'],
        templateFile: 'saas-dashboard-pro.zip',
        fileSize: 15728640,
        licenseType: 'commercial',
        status: 'approved',
        isFeatured: true,
        demoUrl: 'https://demo.flowbites.com/saas-dashboard',
        version: '2.1.0',
        stats: { views: 1247, purchases: 45, revenue: 3555, likes: 189, downloads: 45 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-10')
      },
      {
        title: 'Startup Landing Page Kit',
        slug: 'startup-landing-page-kit',
        description: 'Beautiful Framer landing page template for startups and SaaS. Includes hero, features, pricing, testimonials.\n\n• 5 complete layouts\n• 30+ sections\n• SEO optimized\n• Mobile-first design',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'framer',
        category: categories.find(c => c.slug === 'launch-coming-soon')._id,
        tags: getTagIds(['launch', 'startup']),
        price: 49,
        thumbnail: 'agentra-full.webp',
        gallery: ['gallery-4.webp', 'gallery-5.webp'],
        templateFile: 'startup-landing-kit.zip',
        fileSize: 8388608,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/startup-landing',
        version: '1.0.0',
        stats: { views: 832, purchases: 22, revenue: 1078, likes: 67, downloads: 22 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-08')
      },
      {
        title: 'Elegant Portfolio Studio',
        slug: 'elegant-portfolio-studio',
        description: 'Showcase your creative work with this minimal Webflow portfolio. Perfect for designers, photographers, and agencies.\n\n• Filterable project grid\n• Smooth animations\n• Contact form\n• Blog integration',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'webflow',
        category: categories.find(c => c.slug === 'portfolio-agency')._id,
        tags: getTagIds(['portfolio', 'agency', 'creative']),
        price: 59,
        thumbnail: 'ethanfolio-full.webp',
        gallery: ['ethanfolio-detail.webp', 'gallery-6.webp'],
        templateFile: 'elegant-portfolio.zip',
        fileSize: 12582912,
        licenseType: 'commercial',
        status: 'approved',
        isFeatured: true,
        demoUrl: 'https://demo.flowbites.com/elegant-portfolio',
        version: '1.3.0',
        stats: { views: 2103, purchases: 67, revenue: 3953, likes: 312, downloads: 67 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-01-20')
      },
      {
        title: 'Flavor Kitchen — Restaurant Template',
        slug: 'flavor-kitchen-restaurant',
        description: 'A mouth-watering Wix restaurant template with online menu, reservations, and delivery integration.\n\n• Interactive menu with categories\n• Table reservation system\n• Image gallery\n• Google Maps integration',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'wix',
        category: categories.find(c => c.slug === 'food-drink')._id,
        tags: getTagIds(['restaurant', 'cafe', 'food']),
        price: 39,
        thumbnail: 'flowence-full.webp',
        gallery: ['flowence-thumb.webp', 'gallery-7.webp'],
        templateFile: 'flavor-kitchen.zip',
        fileSize: 9437184,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/flavor-kitchen',
        version: '1.1.0',
        stats: { views: 654, purchases: 18, revenue: 702, likes: 89, downloads: 18 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-01')
      },
      {
        title: 'MedCare Health Clinic',
        slug: 'medcare-health-clinic',
        description: 'Professional Framer template for healthcare clinics, doctors, and medical practices.\n\n• Appointment booking\n• Doctor profiles\n• Service listing\n• Patient testimonials',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'framer',
        category: categories.find(c => c.slug === 'medical')._id,
        tags: getTagIds(['medical', 'clinic', 'doctor']),
        price: 69,
        thumbnail: 'wealth-full.webp',
        gallery: ['gallery-8.webp', 'gallery-9.webp'],
        templateFile: 'medcare-clinic.zip',
        fileSize: 11534336,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/medcare',
        version: '1.0.0',
        stats: { views: 489, purchases: 12, revenue: 828, likes: 56, downloads: 12 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-05')
      },
      {
        title: 'LearnHub — Online Course Platform',
        slug: 'learnhub-course-platform',
        description: 'A feature-rich Webflow template for online education platforms and course creators.\n\n• Course catalog with filters\n• Student dashboard\n• Lesson player layout\n• Instructor profiles',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'webflow',
        category: categories.find(c => c.slug === 'education')._id,
        tags: getTagIds(['education', 'course', 'learning']),
        price: 89,
        thumbnail: 'lucasflow-full.webp',
        gallery: ['gallery-10.webp', 'gallery-11.webp', 'gallery-12.webp'],
        templateFile: 'learnhub-platform.zip',
        fileSize: 18874368,
        licenseType: 'commercial',
        status: 'approved',
        isFeatured: true,
        demoUrl: 'https://demo.flowbites.com/learnhub',
        version: '2.0.0',
        stats: { views: 1876, purchases: 34, revenue: 3026, likes: 245, downloads: 34 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-01-15')
      },
      {
        title: 'RealHome Property Listings',
        slug: 'realhome-property-listings',
        description: 'Wix real estate template with property search, listings, and agent profiles.\n\n• Advanced property search\n• Map view integration\n• Agent directory\n• Virtual tour support',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'wix',
        category: categories.find(c => c.slug === 'real-estate')._id,
        tags: getTagIds(['real-estate', 'realtor', 'housing']),
        price: 69,
        thumbnail: 'flowperty-thumb.webp',
        gallery: ['flowperty-small.webp', 'gallery-13.webp'],
        templateFile: 'realhome-listings.zip',
        fileSize: 14680064,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/realhome',
        version: '1.2.0',
        stats: { views: 723, purchases: 15, revenue: 1035, likes: 98, downloads: 15 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-01-28')
      },
      {
        title: 'Wanderlust Travel Agency',
        slug: 'wanderlust-travel-agency',
        description: 'Stunning Framer template for travel agencies and tour operators.\n\n• Destination showcase\n• Tour packages\n• Booking inquiry form\n• Photo galleries',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'framer',
        category: categories.find(c => c.slug === 'travel')._id,
        tags: getTagIds(['travel', 'tourism', 'hotel']),
        price: 55,
        thumbnail: 'monexa-full.webp',
        gallery: ['monexa-thumb.webp', 'gallery-14.webp'],
        templateFile: 'wanderlust-travel.zip',
        fileSize: 10485760,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/wanderlust',
        version: '1.0.0',
        stats: { views: 567, purchases: 9, revenue: 495, likes: 73, downloads: 9 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-03')
      },
      {
        title: 'ShopNest E-Commerce Starter',
        slug: 'shopnest-ecommerce-starter',
        description: 'Complete Webflow e-commerce template for online stores.\n\n• Product catalog with filters\n• Shopping cart\n• Checkout flow\n• Order tracking',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'webflow',
        category: categories.find(c => c.slug === 'retail-ecommerce')._id,
        tags: getTagIds(['ecommerce', 'retail', 'shop']),
        price: 99,
        thumbnail: 'aitech-full.webp',
        gallery: ['gallery-15.webp', 'landing-ui.webp', 'platform.webp'],
        templateFile: 'shopnest-ecommerce.zip',
        fileSize: 20971520,
        licenseType: 'commercial',
        status: 'approved',
        isFeatured: true,
        demoUrl: 'https://demo.flowbites.com/shopnest',
        version: '3.0.0',
        stats: { views: 3412, purchases: 89, revenue: 8811, likes: 456, downloads: 89 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-01-10')
      },
      {
        title: 'GlowUp Beauty Salon',
        slug: 'glowup-beauty-salon',
        description: 'Elegant Wix template for beauty salons, spas, and hair studios.\n\n• Service catalog\n• Online booking\n• Team profiles\n• Before/after gallery',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'wix',
        category: categories.find(c => c.slug === 'hair-beauty')._id,
        tags: getTagIds(['beauty', 'hair', 'salon']),
        price: 45,
        thumbnail: 'jamespark-thumb.webp',
        gallery: ['jamesbond-thumb.webp', 'ui-templates.webp'],
        templateFile: 'glowup-salon.zip',
        fileSize: 8912896,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/glowup',
        version: '1.0.0',
        stats: { views: 412, purchases: 8, revenue: 360, likes: 54, downloads: 8 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-02-06')
      },
      {
        title: 'DocuFlow Documentation Kit',
        slug: 'docuflow-documentation-kit',
        description: 'Clean Framer documentation template for developer tools and APIs.\n\n• Sidebar navigation\n• Code syntax highlighting\n• Search functionality\n• Version selector',
        creatorId: creators[0]._id,
        creatorProfileId: creatorProfiles[0]._id,
        platform: 'framer',
        category: categories.find(c => c.slug === 'documentation')._id,
        tags: getTagIds(['docs', 'documentation', 'guide']),
        price: 35,
        thumbnail: 'flowfinc-full.webp',
        gallery: ['homepage6-full.webp'],
        templateFile: 'docuflow-docs.zip',
        fileSize: 6291456,
        licenseType: 'commercial',
        status: 'pending',
        demoUrl: 'https://demo.flowbites.com/docuflow',
        version: '1.0.0',
        stats: { views: 198, purchases: 0, revenue: 0, likes: 24, downloads: 0 }
      },
      {
        title: 'FitLife Wellness Hub',
        slug: 'fitlife-wellness-hub',
        description: 'Dynamic Webflow template for gyms, fitness centers, and wellness brands.\n\n• Class schedule\n• Membership plans\n• Trainer profiles\n• Blog section',
        creatorId: creators[1]._id,
        creatorProfileId: creatorProfiles[1]._id,
        platform: 'webflow',
        category: categories.find(c => c.slug === 'wellness')._id,
        tags: getTagIds(['wellness', 'fitness', 'yoga']),
        price: 59,
        thumbnail: 'johnflow-full.png',
        gallery: ['ethan-thumb.webp', 'gallery-3.webp'],
        templateFile: 'fitlife-wellness.zip',
        fileSize: 13631488,
        licenseType: 'commercial',
        status: 'approved',
        demoUrl: 'https://demo.flowbites.com/fitlife',
        version: '1.5.0',
        stats: { views: 934, purchases: 28, revenue: 1652, likes: 142, downloads: 28 },
        moderatedBy: admin._id,
        moderatedAt: new Date('2026-01-25')
      }
    ];

    const templates = await Template.create(templateData);
    console.log(`✅ Created ${templates.length} templates`);

    // Create Orders for buyers
    const orders = await Order.create([
      {
        orderNumber: 'FLW-20260210-00001',
        buyerId: buyers[0]._id,
        items: [{
          type: 'template', templateId: templates[0]._id, title: templates[0].title,
          price: templates[0].price, creatorId: templates[0].creatorId,
          platformFee: templates[0].price * 0.1, creatorPayout: templates[0].price * 0.9
        }],
        subtotal: 79, total: 79, status: 'paid', paymentMethod: 'mock',
        buyerEmail: 'buyer1@example.com', paidAt: new Date('2026-02-10')
      },
      {
        orderNumber: 'FLW-20260211-00002',
        buyerId: buyers[0]._id,
        items: [
          { type: 'template', templateId: templates[2]._id, title: templates[2].title,
            price: templates[2].price, creatorId: templates[2].creatorId,
            platformFee: templates[2].price * 0.1, creatorPayout: templates[2].price * 0.9 },
          { type: 'template', templateId: templates[3]._id, title: templates[3].title,
            price: templates[3].price, creatorId: templates[3].creatorId,
            platformFee: templates[3].price * 0.1, creatorPayout: templates[3].price * 0.9 }
        ],
        subtotal: 98, total: 98, status: 'paid', paymentMethod: 'mock',
        buyerEmail: 'buyer1@example.com', paidAt: new Date('2026-02-11')
      },
      {
        orderNumber: 'FLW-20260209-00003',
        buyerId: buyers[1]._id,
        items: [{
          type: 'template', templateId: templates[5]._id, title: templates[5].title,
          price: templates[5].price, creatorId: templates[5].creatorId,
          platformFee: templates[5].price * 0.1, creatorPayout: templates[5].price * 0.9
        }],
        subtotal: 89, total: 89, status: 'paid', paymentMethod: 'mock',
        buyerEmail: 'buyer2@example.com', paidAt: new Date('2026-02-09')
      },
      {
        orderNumber: 'FLW-20260212-00004',
        buyerId: buyers[1]._id,
        items: [{
          type: 'template', templateId: templates[8]._id, title: templates[8].title,
          price: templates[8].price, creatorId: templates[8].creatorId,
          platformFee: templates[8].price * 0.1, creatorPayout: templates[8].price * 0.9
        }],
        subtotal: 99, total: 99, status: 'paid', paymentMethod: 'mock',
        buyerEmail: 'buyer2@example.com', paidAt: new Date('2026-02-12')
      },
      {
        orderNumber: 'FLW-20260213-00005',
        buyerId: buyers[0]._id,
        items: [{
          type: 'template', templateId: templates[1]._id, title: templates[1].title,
          price: templates[1].price, creatorId: templates[1].creatorId,
          platformFee: templates[1].price * 0.1, creatorPayout: templates[1].price * 0.9
        }],
        subtotal: 49, total: 49, status: 'pending', paymentMethod: 'mock',
        buyerEmail: 'buyer1@example.com'
      }
    ]);
    console.log(`✅ Created ${orders.length} orders`);

    // Create Licenses for paid orders (explicit licenseKey since required before pre-save)
    const licenses = await License.create([
      {
        licenseKey: 'FLW-A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
        templateId: templates[0]._id,
        orderId: orders[0]._id,
        buyerId: buyers[0]._id,
        licenseType: 'commercial',
        downloadCount: 2,
        maxDownloads: 10,
        lastDownloadedAt: new Date('2026-02-11')
      },
      {
        licenseKey: 'FLW-B2C3D4E5-F6A7-8901-BCDE-F12345678901',
        templateId: templates[2]._id,
        orderId: orders[1]._id,
        buyerId: buyers[0]._id,
        licenseType: 'commercial',
        downloadCount: 1,
        maxDownloads: 10,
        lastDownloadedAt: new Date('2026-02-11')
      },
      {
        licenseKey: 'FLW-C3D4E5F6-A7B8-9012-CDEF-123456789012',
        templateId: templates[3]._id,
        orderId: orders[1]._id,
        buyerId: buyers[0]._id,
        licenseType: 'commercial',
        downloadCount: 1,
        maxDownloads: 10,
        lastDownloadedAt: new Date('2026-02-12')
      },
      {
        licenseKey: 'FLW-D4E5F6A7-B8C9-0123-DEFA-234567890123',
        templateId: templates[5]._id,
        orderId: orders[2]._id,
        buyerId: buyers[1]._id,
        licenseType: 'commercial',
        downloadCount: 3,
        maxDownloads: 10,
        lastDownloadedAt: new Date('2026-02-10')
      },
      {
        licenseKey: 'FLW-E5F6A7B8-C9D0-1234-EFAB-345678901234',
        templateId: templates[8]._id,
        orderId: orders[3]._id,
        buyerId: buyers[1]._id,
        licenseType: 'commercial',
        downloadCount: 0,
        maxDownloads: 10
      }
    ]);
    console.log(`✅ Created ${licenses.length} licenses`);

    // Create Service Packages (linked to templates)
    const servicePackages = [];

    // Alex Rivera's services
    const sp1 = new ServicePackage({
      creatorId: creators[0]._id,
      templateId: templates[0]._id,
      name: 'SaaS Dashboard Customization',
      description: 'I will customize the Modern SaaS Dashboard Pro template to match your brand and requirements. Includes color scheme updates, logo integration, custom pages, and CMS setup.',
      category: 'webflow-development',
      price: 250,
      deliveryDays: 5,
      revisions: 3,
      features: ['Brand color customization', 'Logo & favicon integration', 'Up to 3 custom pages', 'CMS collection setup', 'Responsive testing', 'Webflow hosting setup'],
      requirements: 'Please provide your brand guidelines (logo, colors, fonts), content for custom pages, and any specific functionality requirements.',
      tags: ['webflow', 'dashboard', 'customization'],
      isActive: true,
      stats: { orders: 12, completed: 10, revenue: 3000 }
    });
    await sp1.save();
    servicePackages.push(sp1);

    const sp2 = new ServicePackage({
      creatorId: creators[0]._id,
      templateId: templates[2]._id,
      name: 'Portfolio Website Setup',
      description: 'Full setup and customization of the Elegant Portfolio template. I will configure your portfolio with your projects, bio, and contact information.',
      category: 'webflow-development',
      price: 150,
      deliveryDays: 3,
      revisions: 2,
      features: ['Project content upload', 'Bio & about page setup', 'Contact form configuration', 'Domain connection', 'SEO basics'],
      requirements: 'Send me your project images, descriptions, bio text, and social media links.',
      tags: ['webflow', 'portfolio', 'setup'],
      isActive: true,
      stats: { orders: 8, completed: 7, revenue: 1200 }
    });
    await sp2.save();
    servicePackages.push(sp2);

    const sp3 = new ServicePackage({
      creatorId: creators[0]._id,
      templateId: templates[6]._id,
      name: 'Real Estate Website Migration',
      description: 'Migrate your existing real estate website to Wix using the RealHome template. Includes content transfer and listing setup.',
      category: 'migration',
      price: 400,
      deliveryDays: 7,
      revisions: 0,
      features: ['Full content migration', 'Property listing import', 'Agent profile setup', 'Map integration', 'Contact form setup', 'SEO redirect mapping'],
      requirements: 'Access to your current website, property listing data (CSV/spreadsheet), and agent photos/bios.',
      tags: ['migration', 'real-estate', 'wix'],
      isActive: true,
      stats: { orders: 3, completed: 2, revenue: 1200 }
    });
    await sp3.save();
    servicePackages.push(sp3);

    // Maria Chen's services
    const sp4 = new ServicePackage({
      creatorId: creators[1]._id,
      templateId: templates[1]._id,
      name: 'Startup Landing Page Design',
      description: 'Custom landing page design using the Startup Landing Page Kit. Perfect for product launches and SaaS products.',
      category: 'framer-development',
      price: 200,
      deliveryDays: 4,
      revisions: 3,
      features: ['Custom hero section', 'Feature sections', 'Pricing table setup', 'CTA optimization', 'Mobile responsive', 'Animation refinement'],
      requirements: 'Your product description, key features, pricing plans, brand assets, and any competitor references.',
      tags: ['framer', 'landing-page', 'startup'],
      isActive: true,
      stats: { orders: 15, completed: 13, revenue: 3000 }
    });
    await sp4.save();
    servicePackages.push(sp4);

    const sp5 = new ServicePackage({
      creatorId: creators[1]._id,
      templateId: templates[5]._id,
      name: 'E-Learning Platform Customization',
      description: 'Customize LearnHub to build your online course platform. Includes course structure setup, branding, and CMS configuration.',
      category: 'webflow-development',
      price: 350,
      deliveryDays: 7,
      revisions: 2,
      features: ['Course catalog structure', 'Instructor profiles', 'CMS setup for lessons', 'Payment integration', 'Student dashboard', 'Email notification setup'],
      requirements: 'Course outlines, instructor bios, branding materials, and preferred payment gateway.',
      tags: ['webflow', 'education', 'e-learning'],
      isActive: true,
      stats: { orders: 6, completed: 5, revenue: 2100 }
    });
    await sp5.save();
    servicePackages.push(sp5);

    const sp6 = new ServicePackage({
      creatorId: creators[1]._id,
      templateId: templates[9]._id,
      name: 'Beauty Salon Brand Package',
      description: 'Complete brand identity and website setup for your beauty salon using the GlowUp template.',
      category: 'custom-design',
      price: 300,
      deliveryDays: 5,
      revisions: 3,
      features: ['Brand identity design', 'Service menu setup', 'Online booking integration', 'Gallery curation', 'Social media links', 'Google Business setup'],
      requirements: 'Salon name, services offered with pricing, team member photos, and any existing branding.',
      tags: ['design', 'beauty', 'branding'],
      isActive: true,
      stats: { orders: 4, completed: 3, revenue: 1200 }
    });
    await sp6.save();
    servicePackages.push(sp6);

    console.log(`✅ Created ${servicePackages.length} service packages`);

    // Create Service Orders in various statuses
    const now = new Date();
    const daysAgo = (d) => new Date(now.getTime() - d * 86400000);

    const so1 = new ServiceOrder({
      orderNumber: 'SRV-20260210-00001',
      packageId: servicePackages[0]._id,
      buyerId: buyers[0]._id,
      creatorId: creators[0]._id,
      templateId: templates[0]._id,
      packageName: servicePackages[0].name,
      price: servicePackages[0].price,
      deliveryDays: servicePackages[0].deliveryDays,
      revisions: servicePackages[0].revisions,
      requirements: 'I need the dashboard customized for my project management SaaS. Brand colors: #2563EB (primary), #1E293B (dark). Please integrate our logo and add a Kanban board page.',
      status: 'in_progress',
      acceptedAt: daysAgo(3),
      dueDate: new Date(now.getTime() + 2 * 86400000),
      platformFee: 25,
      creatorPayout: 225,
      messages: [
        { senderId: buyers[0]._id, message: 'Hi Alex! I just placed the order. Here are my brand guidelines.', createdAt: daysAgo(4) },
        { senderId: creators[0]._id, message: 'Thanks John! I received your requirements. Ill start working on it today. Quick question — do you want the Kanban board to have drag-and-drop functionality?', createdAt: daysAgo(3) },
        { senderId: buyers[0]._id, message: 'Yes, drag and drop would be great! Also can you make the sidebar collapsible?', createdAt: daysAgo(3) },
        { senderId: creators[0]._id, message: 'Absolutely! Ill include both. Here is a mockup of the color scheme applied to the main dashboard. Let me know what you think.', createdAt: daysAgo(2) },
        { senderId: buyers[0]._id, message: 'Looks fantastic! Please proceed with the full implementation.', createdAt: daysAgo(2) },
        { senderId: creators[0]._id, message: 'Great! Working on it now. Ill have the first draft ready in 2 days.', createdAt: daysAgo(1) }
      ]
    });
    await so1.save();

    const so2 = new ServiceOrder({
      orderNumber: 'SRV-20260207-00002',
      packageId: servicePackages[3]._id,
      buyerId: buyers[1]._id,
      creatorId: creators[1]._id,
      templateId: templates[1]._id,
      packageName: servicePackages[3].name,
      price: servicePackages[3].price,
      deliveryDays: servicePackages[3].deliveryDays,
      revisions: servicePackages[3].revisions,
      requirements: 'We are launching a new AI writing tool and need a stunning landing page. Target audience: content creators and marketers.',
      status: 'delivered',
      acceptedAt: daysAgo(7),
      deliveredAt: daysAgo(1),
      dueDate: daysAgo(0),
      deliveryNote: 'Landing page is live! I have set up all 5 sections including the hero with your product demo video, features grid, pricing cards, testimonial carousel, and email capture form.',
      platformFee: 20,
      creatorPayout: 180,
      messages: [
        { senderId: buyers[1]._id, message: 'Hi Maria! Excited to work with you on our landing page.', createdAt: daysAgo(7) },
        { senderId: creators[1]._id, message: 'Hi Sarah! Your AI writing tool sounds amazing. Ill start with the hero section design. What headline are you thinking?', createdAt: daysAgo(7) },
        { senderId: buyers[1]._id, message: 'Something like "Write 10x faster with AI" — catchy and direct.', createdAt: daysAgo(6) },
        { senderId: creators[1]._id, message: 'Love it! Here is the first draft of the hero section.', createdAt: daysAgo(5) },
        { senderId: buyers[1]._id, message: 'Wow, this is beautiful! Can we make the CTA button a bit larger?', createdAt: daysAgo(4) },
        { senderId: creators[1]._id, message: 'Done! Also finished the features and pricing sections. Delivering the full page now.', createdAt: daysAgo(1) }
      ]
    });
    await so2.save();

    const so3 = new ServiceOrder({
      orderNumber: 'SRV-20260204-00003',
      packageId: servicePackages[1]._id,
      buyerId: buyers[1]._id,
      creatorId: creators[0]._id,
      templateId: templates[2]._id,
      packageName: servicePackages[1].name,
      price: servicePackages[1].price,
      deliveryDays: servicePackages[1].deliveryDays,
      revisions: servicePackages[1].revisions,
      requirements: 'I need a photography portfolio setup. I have 30 photos across 4 categories: portraits, landscapes, street, and abstract.',
      status: 'completed',
      acceptedAt: daysAgo(10),
      deliveredAt: daysAgo(6),
      completedAt: daysAgo(5),
      dueDate: daysAgo(7),
      deliveryNote: 'Portfolio is all set up with your 30 photos organized into 4 categories. Added smooth hover effects and lightbox gallery.',
      platformFee: 15,
      creatorPayout: 135,
      paymentReleased: true,
      messages: [
        { senderId: buyers[1]._id, message: 'Here are all my photos organized in a Google Drive folder.', createdAt: daysAgo(10) },
        { senderId: creators[0]._id, message: 'Got them! Beautiful work. Ill have this set up in 3 days.', createdAt: daysAgo(10) },
        { senderId: creators[0]._id, message: 'Portfolio is ready for review!', createdAt: daysAgo(6) },
        { senderId: buyers[1]._id, message: 'This is exactly what I wanted. Marking as complete. Thank you!', createdAt: daysAgo(5) }
      ]
    });
    await so3.save();

    const so4 = new ServiceOrder({
      orderNumber: 'SRV-20260213-00004',
      packageId: servicePackages[4]._id,
      buyerId: buyers[0]._id,
      creatorId: creators[1]._id,
      templateId: templates[5]._id,
      packageName: servicePackages[4].name,
      price: servicePackages[4].price,
      deliveryDays: servicePackages[4].deliveryDays,
      revisions: servicePackages[4].revisions,
      requirements: 'We are building an online coding bootcamp. Need 5 course categories, instructor pages, and Stripe payment integration.',
      status: 'requested',
      platformFee: 35,
      creatorPayout: 315,
      messages: [
        { senderId: buyers[0]._id, message: 'Hi Maria, I would love to get LearnHub customized for our coding bootcamp. Let me know if you have any questions!', createdAt: daysAgo(0) }
      ]
    });
    await so4.save();

    const so5 = new ServiceOrder({
      orderNumber: 'SRV-20260206-00005',
      packageId: servicePackages[5]._id,
      buyerId: buyers[0]._id,
      creatorId: creators[1]._id,
      templateId: templates[9]._id,
      packageName: servicePackages[5].name,
      price: servicePackages[5].price,
      deliveryDays: servicePackages[5].deliveryDays,
      revisions: servicePackages[5].revisions,
      requirements: 'Opening a new hair salon called "Luxe Locks". Need full brand identity and website setup with online booking.',
      status: 'revision_requested',
      acceptedAt: daysAgo(8),
      dueDate: daysAgo(1),
      platformFee: 30,
      creatorPayout: 270,
      messages: [
        { senderId: buyers[0]._id, message: 'Here are some mood boards and competitor references for Luxe Locks.', createdAt: daysAgo(8) },
        { senderId: creators[1]._id, message: 'Love the vision! Going for a luxurious gold and black theme. Starting the design now.', createdAt: daysAgo(7) },
        { senderId: creators[1]._id, message: 'First draft is ready! Check out the homepage and services page.', createdAt: daysAgo(3) },
        { senderId: buyers[0]._id, message: 'Looking good but can we change the font to something more elegant? Also the booking button color does not match.', createdAt: daysAgo(2) },
        { senderId: creators[1]._id, message: 'Sure thing! Working on the revision now with a serif font option.', createdAt: daysAgo(1) }
      ]
    });
    await so5.save();

    console.log('✅ Created 5 service orders (in_progress, delivered, completed, requested, revision_requested)');

    // Create UI Shots
    const shots = await UIShot.create([
      {
        creatorId: creators[1]._id,
        title: 'Modern Dashboard Analytics View',
        description: 'Clean and minimal dashboard design with beautiful charts and KPI cards',
        image: 'shot-dashboard.webp',
        templateId: templates[0]._id,
        tags: ['dashboard', 'analytics', 'dark-mode'],
        stats: { views: 892, likes: 134, saves: 67 },
        colors: ['#0ea5e9', '#8b5cf6', '#10b981']
      },
      {
        creatorId: creators[0]._id,
        title: 'E-Commerce Product Card Variants',
        description: 'Four product card designs with hover effects and quick-add buttons',
        image: 'shot-ecommerce.webp',
        templateId: templates[8]._id,
        tags: ['ecommerce', 'product-card', 'ui'],
        stats: { views: 654, likes: 98, saves: 45 },
        colors: ['#f59e0b', '#ef4444', '#10b981']
      },
      {
        creatorId: creators[1]._id,
        title: 'Travel Destination Hero Section',
        description: 'Full-width hero with parallax scrolling and destination search',
        image: 'shot-travel.webp',
        templateId: templates[7]._id,
        tags: ['travel', 'hero', 'parallax'],
        stats: { views: 423, likes: 76, saves: 31 },
        colors: ['#0891b2', '#f97316', '#fbbf24']
      }
    ]);
    console.log(`✅ Created ${shots.length} UI shots`);

    // Compute and update creator stats from actual template data
    for (const profile of creatorProfiles) {
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
    console.log('✅ Updated creator stats from template data');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('─────────────────────────────────────────');
    console.log('Admin:');
    console.log('  Email: admin@flowbites.com');
    console.log('  Password: password123');
    console.log('\nCreator 1:');
    console.log('  Email: creator1@example.com');
    console.log('  Password: password123');
    console.log('\nCreator 2:');
    console.log('  Email: creator2@example.com');
    console.log('  Password: password123');
    console.log('\nBuyer 1:');
    console.log('  Email: buyer1@example.com');
    console.log('  Password: password123');
    console.log('\nBuyer 2:');
    console.log('  Email: buyer2@example.com');
    console.log('  Password: password123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
