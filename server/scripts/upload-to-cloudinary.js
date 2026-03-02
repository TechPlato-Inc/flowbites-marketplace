import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadAll() {
  const results = {};

  // Upload images
  const imagesDir = path.join(__dirname, '..', 'uploads', 'images');
  const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.svg'));

  console.log(`Uploading ${images.length} images...`);
  for (const file of images) {
    const filePath = path.join(imagesDir, file);
    const name = file.replace('.svg', '');
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'flowbites/images',
        public_id: name,
        resource_type: 'image',
        overwrite: true,
      });
      results[file] = result.secure_url;
      console.log(`  ✅ ${file} → ${result.secure_url}`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  // Upload shots
  const shotsDir = path.join(__dirname, '..', 'uploads', 'shots');
  const shots = fs.readdirSync(shotsDir).filter(f => f.endsWith('.svg'));

  console.log(`\nUploading ${shots.length} shots...`);
  for (const file of shots) {
    const filePath = path.join(shotsDir, file);
    const name = file.replace('.svg', '');
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'flowbites/shots',
        public_id: name,
        resource_type: 'image',
        overwrite: true,
      });
      results[file] = result.secure_url;
      console.log(`  ✅ ${file} → ${result.secure_url}`);
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }

  // Output the mapping
  console.log('\n📋 URL Mapping (copy this):');
  console.log(JSON.stringify(results, null, 2));
}

uploadAll().catch(console.error);
