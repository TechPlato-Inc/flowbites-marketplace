import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_BASE = 'https://res.cloudinary.com/doh1bapxi/raw/upload';

const imageMap = {
  'dashboard-1.svg': `${CLOUDINARY_BASE}/v1771748834/flowbites/images/dashboard-1.svg`,
  'dashboard-2.svg': `${CLOUDINARY_BASE}/v1771748834/flowbites/images/dashboard-2.svg`,
  'dashboard-3.svg': `${CLOUDINARY_BASE}/v1771748835/flowbites/images/dashboard-3.svg`,
  'docuflow-1.svg': `${CLOUDINARY_BASE}/v1771748835/flowbites/images/docuflow-1.svg`,
  'fitlife-1.svg': `${CLOUDINARY_BASE}/v1771748836/flowbites/images/fitlife-1.svg`,
  'fitlife-2.svg': `${CLOUDINARY_BASE}/v1771748837/flowbites/images/fitlife-2.svg`,
  'glowup-1.svg': `${CLOUDINARY_BASE}/v1771748837/flowbites/images/glowup-1.svg`,
  'glowup-2.svg': `${CLOUDINARY_BASE}/v1771748838/flowbites/images/glowup-2.svg`,
  'landing-1.svg': `${CLOUDINARY_BASE}/v1771748838/flowbites/images/landing-1.svg`,
  'landing-2.svg': `${CLOUDINARY_BASE}/v1771748839/flowbites/images/landing-2.svg`,
  'learnhub-1.svg': `${CLOUDINARY_BASE}/v1771748839/flowbites/images/learnhub-1.svg`,
  'learnhub-2.svg': `${CLOUDINARY_BASE}/v1771748840/flowbites/images/learnhub-2.svg`,
  'learnhub-3.svg': `${CLOUDINARY_BASE}/v1771748840/flowbites/images/learnhub-3.svg`,
  'medcare-1.svg': `${CLOUDINARY_BASE}/v1771748841/flowbites/images/medcare-1.svg`,
  'medcare-2.svg': `${CLOUDINARY_BASE}/v1771748841/flowbites/images/medcare-2.svg`,
  'portfolio-1.svg': `${CLOUDINARY_BASE}/v1771748842/flowbites/images/portfolio-1.svg`,
  'portfolio-2.svg': `${CLOUDINARY_BASE}/v1771748842/flowbites/images/portfolio-2.svg`,
  'realhome-1.svg': `${CLOUDINARY_BASE}/v1771748843/flowbites/images/realhome-1.svg`,
  'realhome-2.svg': `${CLOUDINARY_BASE}/v1771748844/flowbites/images/realhome-2.svg`,
  'restaurant-1.svg': `${CLOUDINARY_BASE}/v1771748844/flowbites/images/restaurant-1.svg`,
  'restaurant-2.svg': `${CLOUDINARY_BASE}/v1771748845/flowbites/images/restaurant-2.svg`,
  'shopnest-1.svg': `${CLOUDINARY_BASE}/v1771748845/flowbites/images/shopnest-1.svg`,
  'shopnest-2.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/shopnest-2.svg`,
  'shopnest-3.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/shopnest-3.svg`,
  'wanderlust-1.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/wanderlust-1.svg`,
  'wanderlust-2.svg': `${CLOUDINARY_BASE}/v1771748847/flowbites/images/wanderlust-2.svg`,
};

async function updateGallery() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const templates = db.collection('templates');
  const all = await templates.find({ gallery: { $exists: true, $ne: [] } }).toArray();

  let updated = 0;
  for (const tmpl of all) {
    const newGallery = tmpl.gallery.map(img => imageMap[img] || img);
    if (JSON.stringify(newGallery) !== JSON.stringify(tmpl.gallery)) {
      await templates.updateOne({ _id: tmpl._id }, { $set: { gallery: newGallery } });
      updated++;
      console.log(`  ✅ "${tmpl.title}" gallery updated (${tmpl.gallery.length} images)`);
    }
  }
  console.log(`\nUpdated ${updated} template galleries`);
  await mongoose.connection.close();
}

updateGallery().catch(console.error);
