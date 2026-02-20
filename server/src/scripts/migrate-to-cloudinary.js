import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { Template } from '../modules/templates/template.model.js';
import { UIShot } from '../modules/ui-shorts/uiShort.model.js';
import { CreatorProfile } from '../modules/creators/creator.model.js';

dotenv.config();

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

const stats = { uploaded: 0, skipped: 0, failed: 0, updated: 0 };

function isCloudinaryUrl(val) {
  return val && val.startsWith('http');
}

function localPath(folder, filename) {
  return path.join(UPLOAD_DIR, folder, filename);
}

async function uploadIfLocal(filename, folder, cloudinaryFolder) {
  if (!filename || isCloudinaryUrl(filename)) {
    stats.skipped++;
    return filename;
  }

  const filePath = localPath(folder, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠ File not found: ${filePath}`);
    stats.skipped++;
    return filename; // Keep original filename
  }

  try {
    const result = await uploadToCloudinary(filePath, cloudinaryFolder);
    if (result) {
      stats.uploaded++;
      return result.secure_url;
    }
    stats.failed++;
    return filename;
  } catch (err) {
    console.log(`  ✗ Upload failed for ${filename}: ${err.message}`);
    stats.failed++;
    return filename;
  }
}

async function migrateTemplates() {
  const templates = await Template.find({});
  console.log(`\n📦 Migrating ${templates.length} templates...`);

  for (const template of templates) {
    let changed = false;

    // Thumbnail
    const newThumb = await uploadIfLocal(template.thumbnail, 'images', 'flowbites/images');
    if (newThumb !== template.thumbnail) {
      template.thumbnail = newThumb;
      changed = true;
    }

    // Gallery
    const newGallery = [];
    for (const img of template.gallery || []) {
      const newImg = await uploadIfLocal(img, 'images', 'flowbites/gallery');
      newGallery.push(newImg);
      if (newImg !== img) changed = true;
    }
    if (changed) template.gallery = newGallery;

    if (changed) {
      await template.save();
      stats.updated++;
      console.log(`  ✓ ${template.title}`);
    } else {
      console.log(`  – ${template.title} (already migrated or no images)`);
    }
  }
}

async function migrateUIShots() {
  const shots = await UIShot.find({});
  console.log(`\n🖼️  Migrating ${shots.length} UI shots...`);

  for (const shot of shots) {
    // Shot images are stored with or without 'shots/' prefix
    const filename = shot.image;
    const folder = filename.startsWith('shots/') ? '' : 'shots';
    const cleanName = filename.replace(/^shots\//, '');
    const newImage = await uploadIfLocal(cleanName, folder || 'shots', 'flowbites/shots');

    if (newImage !== cleanName && newImage !== filename) {
      shot.image = newImage;
      await shot.save();
      stats.updated++;
      console.log(`  ✓ Shot: ${shot._id}`);
    } else {
      console.log(`  – Shot: ${shot._id} (already migrated or not found)`);
    }
  }
}

async function migrateCreatorCovers() {
  const creators = await CreatorProfile.find({ coverImage: { $exists: true, $ne: null, $ne: '' } });
  console.log(`\n👤 Migrating ${creators.length} creator cover images...`);

  for (const creator of creators) {
    if (!creator.coverImage || isCloudinaryUrl(creator.coverImage)) {
      console.log(`  – ${creator.displayName} (skipped)`);
      stats.skipped++;
      continue;
    }

    const newImage = await uploadIfLocal(creator.coverImage, 'images', 'flowbites/covers');
    if (newImage !== creator.coverImage) {
      creator.coverImage = newImage;
      await creator.save();
      stats.updated++;
      console.log(`  ✓ ${creator.displayName}`);
    }
  }
}

async function main() {
  console.log('☁️  Cloudinary Migration Script');
  console.log('================================');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('✗ CLOUDINARY_CLOUD_NAME not set. Configure Cloudinary env vars first.');
    process.exit(1);
  }

  console.log(`Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log(`Upload dir: ${UPLOAD_DIR}`);

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  await migrateTemplates();
  await migrateUIShots();
  await migrateCreatorCovers();

  console.log('\n================================');
  console.log('📊 Migration Summary:');
  console.log(`  Uploaded to Cloudinary: ${stats.uploaded}`);
  console.log(`  Skipped (already done): ${stats.skipped}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  DB records updated: ${stats.updated}`);
  console.log('================================');

  await mongoose.disconnect();
  console.log('✅ Done!');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
