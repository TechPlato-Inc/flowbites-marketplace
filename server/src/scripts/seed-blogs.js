import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../modules/users/user.model.js';
import { BlogPost } from '../modules/blog/blog.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedBlogs = async () => {
  try {
    console.log('📝 Starting blog posts seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user to use as author
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('❌ No admin user found. Run the main seed script first: node src/scripts/seed.js');
      process.exit(1);
    }
    console.log(`👤 Using admin user: ${admin.name} (${admin.email})`);

    // Read the blog posts data from the TypeScript file
    const dataFilePath = path.resolve(__dirname, '../../../client/src/data/blogPosts.ts');
    const fileContent = fs.readFileSync(dataFilePath, 'utf8');

    // Extract the array portion from the TS file
    const arrayStart = fileContent.indexOf('export const blogPosts: BlogPost[] = [');
    if (arrayStart === -1) {
      console.error('❌ Could not find blogPosts array in data file');
      process.exit(1);
    }

    // Get just the array content
    const arrayContent = fileContent.substring(
      fileContent.indexOf('[', arrayStart),
    );

    // Parse the TypeScript array into JavaScript objects
    // Remove trailing semicolons and clean up for eval
    const cleanedContent = arrayContent
      .replace(/;[\s]*$/, '') // Remove trailing semicolon
      .replace(/export\s+/g, ''); // Remove any export keywords

    // Use Function constructor to evaluate the array safely
    const blogPosts = new Function(`return ${cleanedContent}`)();

    console.log(`📊 Found ${blogPosts.length} blog posts to insert`);

    // Clear existing blog posts
    const deleted = await BlogPost.deleteMany({});
    console.log(`🗑️  Cleared ${deleted.deletedCount} existing blog posts`);

    // Map and insert blog posts
    const postsToInsert = blogPosts.map((post, index) => {
      // Mark first 5 as featured
      const isFeatured = index < 5;

      return {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        author: admin._id,
        authorName: post.author,
        authorRole: post.authorRole,
        status: 'published',
        publishedAt: new Date(post.publishedAt),
        readTime: post.readTime,
        metaTitle: post.title.substring(0, 70),
        metaDescription: post.excerpt.substring(0, 160),
        isFeatured,
        stats: {
          views: Math.floor(Math.random() * 5000) + 100,
          likes: Math.floor(Math.random() * 200) + 10,
          shares: Math.floor(Math.random() * 50) + 5,
        },
      };
    });

    // Insert in batches to avoid overwhelming MongoDB
    const batchSize = 25;
    let inserted = 0;

    for (let i = 0; i < postsToInsert.length; i += batchSize) {
      const batch = postsToInsert.slice(i, i + batchSize);
      await BlogPost.insertMany(batch);
      inserted += batch.length;
      console.log(`  ✅ Inserted ${inserted}/${postsToInsert.length} posts`);
    }

    console.log('\n🎉 Blog seed complete!');
    console.log(`   📝 ${inserted} blog posts inserted`);
    console.log(`   ⭐ ${postsToInsert.filter(p => p.isFeatured).length} featured posts`);
    console.log(`   👤 All posts assigned to: ${admin.name}`);
    console.log('\n   View them at: http://localhost:5173/dashboard/admin/blog');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedBlogs();
