import { Router } from 'express';
import { Template } from '../templates/template.model.js';
import { BlogPost } from '../blog/blog.model.js';
import { CreatorProfile } from '../creators/creator.model.js';

const router = Router();

const BASE_URL = process.env.SITE_URL || 'https://flowbites.com';

/**
 * GET /api/sitemap.xml
 * Generates a dynamic XML sitemap for search engine crawlers.
 */
router.get('/sitemap.xml', async (req, res) => {
  try {
    // ------------------------------------------------------------------
    // 1. Static pages
    // ------------------------------------------------------------------
    const staticPages = [
      { loc: '/',                  priority: '1.0' },
      { loc: '/templates',         priority: '0.9' },
      { loc: '/services',          priority: '0.8' },
      { loc: '/blog',              priority: '0.7' },
      { loc: '/about',             priority: '0.5' },
      { loc: '/how-it-works',      priority: '0.5' },
      { loc: '/pricing',           priority: '0.5' },
      { loc: '/become-creator',    priority: '0.5' },
      { loc: '/community',         priority: '0.5' },
      { loc: '/careers',           priority: '0.5' },
      { loc: '/help',              priority: '0.4' },
      { loc: '/terms',             priority: '0.3' },
      { loc: '/privacy',           priority: '0.3' },
      { loc: '/cookies',           priority: '0.3' },
      { loc: '/licenses',          priority: '0.3' },
      { loc: '/trust-safety',      priority: '0.3' },
      { loc: '/creator-guidelines', priority: '0.3' },
    ];

    // ------------------------------------------------------------------
    // 2. Dynamic data (run queries in parallel)
    // ------------------------------------------------------------------
    const [templates, blogPosts, creators] = await Promise.all([
      Template.find({ status: 'approved' }).select('slug updatedAt').lean(),
      BlogPost.find({ status: 'published' }).select('slug updatedAt').lean(),
      CreatorProfile.find({ isVerified: true }).select('username updatedAt').lean(),
    ]);

    // ------------------------------------------------------------------
    // 3. Build XML
    // ------------------------------------------------------------------
    const toW3CDate = (date) => {
      if (!date) return new Date().toISOString().split('T')[0];
      return new Date(date).toISOString().split('T')[0];
    };

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Template pages
    for (const template of templates) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/templates/${template.slug}</loc>\n`;
      xml += `    <lastmod>${toW3CDate(template.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    // Blog post pages
    for (const post of blogPosts) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${post.slug}</loc>\n`;
      xml += `    <lastmod>${toW3CDate(post.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
      xml += `  </url>\n`;
    }

    // Creator profile pages
    for (const creator of creators) {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/creator/${creator.username}</loc>\n`;
      xml += `    <lastmod>${toW3CDate(creator.updatedAt)}</lastmod>\n`;
      xml += `    <changefreq>monthly</changefreq>\n`;
      xml += `    <priority>0.5</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    // ------------------------------------------------------------------
    // 4. Send response
    // ------------------------------------------------------------------
    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.status(200).send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate sitemap' });
  }
});

export default router;
