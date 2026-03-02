import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
const CLOUDINARY_BASE = 'https://res.cloudinary.com/doh1bapxi/raw/upload';

// Mapping of local filenames to Cloudinary URLs
const imageMap = {
  'dashboard-thumb.svg': `${CLOUDINARY_BASE}/v1771748835/flowbites/images/dashboard-thumb.svg`,
  'dashboard-1.svg': `${CLOUDINARY_BASE}/v1771748834/flowbites/images/dashboard-1.svg`,
  'dashboard-2.svg': `${CLOUDINARY_BASE}/v1771748834/flowbites/images/dashboard-2.svg`,
  'dashboard-3.svg': `${CLOUDINARY_BASE}/v1771748835/flowbites/images/dashboard-3.svg`,
  'docuflow-thumb.svg': `${CLOUDINARY_BASE}/v1771748836/flowbites/images/docuflow-thumb.svg`,
  'docuflow-1.svg': `${CLOUDINARY_BASE}/v1771748835/flowbites/images/docuflow-1.svg`,
  'fitlife-thumb.svg': `${CLOUDINARY_BASE}/v1771748837/flowbites/images/fitlife-thumb.svg`,
  'fitlife-1.svg': `${CLOUDINARY_BASE}/v1771748836/flowbites/images/fitlife-1.svg`,
  'fitlife-2.svg': `${CLOUDINARY_BASE}/v1771748837/flowbites/images/fitlife-2.svg`,
  'glowup-thumb.svg': `${CLOUDINARY_BASE}/v1771748838/flowbites/images/glowup-thumb.svg`,
  'glowup-1.svg': `${CLOUDINARY_BASE}/v1771748837/flowbites/images/glowup-1.svg`,
  'glowup-2.svg': `${CLOUDINARY_BASE}/v1771748838/flowbites/images/glowup-2.svg`,
  'landing-thumb.svg': `${CLOUDINARY_BASE}/v1771748839/flowbites/images/landing-thumb.svg`,
  'landing-1.svg': `${CLOUDINARY_BASE}/v1771748838/flowbites/images/landing-1.svg`,
  'landing-2.svg': `${CLOUDINARY_BASE}/v1771748839/flowbites/images/landing-2.svg`,
  'learnhub-thumb.svg': `${CLOUDINARY_BASE}/v1771748840/flowbites/images/learnhub-thumb.svg`,
  'learnhub-1.svg': `${CLOUDINARY_BASE}/v1771748839/flowbites/images/learnhub-1.svg`,
  'learnhub-2.svg': `${CLOUDINARY_BASE}/v1771748840/flowbites/images/learnhub-2.svg`,
  'learnhub-3.svg': `${CLOUDINARY_BASE}/v1771748840/flowbites/images/learnhub-3.svg`,
  'medcare-thumb.svg': `${CLOUDINARY_BASE}/v1771748842/flowbites/images/medcare-thumb.svg`,
  'medcare-1.svg': `${CLOUDINARY_BASE}/v1771748841/flowbites/images/medcare-1.svg`,
  'medcare-2.svg': `${CLOUDINARY_BASE}/v1771748841/flowbites/images/medcare-2.svg`,
  'portfolio-thumb.svg': `${CLOUDINARY_BASE}/v1771748843/flowbites/images/portfolio-thumb.svg`,
  'portfolio-1.svg': `${CLOUDINARY_BASE}/v1771748842/flowbites/images/portfolio-1.svg`,
  'portfolio-2.svg': `${CLOUDINARY_BASE}/v1771748842/flowbites/images/portfolio-2.svg`,
  'realhome-thumb.svg': `${CLOUDINARY_BASE}/v1771748844/flowbites/images/realhome-thumb.svg`,
  'realhome-1.svg': `${CLOUDINARY_BASE}/v1771748843/flowbites/images/realhome-1.svg`,
  'realhome-2.svg': `${CLOUDINARY_BASE}/v1771748844/flowbites/images/realhome-2.svg`,
  'restaurant-thumb.svg': `${CLOUDINARY_BASE}/v1771748845/flowbites/images/restaurant-thumb.svg`,
  'restaurant-1.svg': `${CLOUDINARY_BASE}/v1771748844/flowbites/images/restaurant-1.svg`,
  'restaurant-2.svg': `${CLOUDINARY_BASE}/v1771748845/flowbites/images/restaurant-2.svg`,
  'shopnest-thumb.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/shopnest-thumb.svg`,
  'shopnest-1.svg': `${CLOUDINARY_BASE}/v1771748845/flowbites/images/shopnest-1.svg`,
  'shopnest-2.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/shopnest-2.svg`,
  'shopnest-3.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/shopnest-3.svg`,
  'wanderlust-thumb.svg': `${CLOUDINARY_BASE}/v1771748847/flowbites/images/wanderlust-thumb.svg`,
  'wanderlust-1.svg': `${CLOUDINARY_BASE}/v1771748846/flowbites/images/wanderlust-1.svg`,
  'wanderlust-2.svg': `${CLOUDINARY_BASE}/v1771748847/flowbites/images/wanderlust-2.svg`,
};

const shotMap = {
  'shot-dashboard.svg': `${CLOUDINARY_BASE}/v1771748847/flowbites/shots/shot-dashboard.svg`,
  'shot-ecommerce.svg': `${CLOUDINARY_BASE}/v1771748848/flowbites/shots/shot-ecommerce.svg`,
  'shot-travel.svg': `${CLOUDINARY_BASE}/v1771748848/flowbites/shots/shot-travel.svg`,
};

async function updateUrls() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Update templates — thumbnail and screenshots
  const templates = db.collection('templates');
  const allTemplates = await templates.find({}).toArray();
  let updated = 0;

  for (const tmpl of allTemplates) {
    const updates = {};

    // Update thumbnail
    if (tmpl.thumbnail && imageMap[tmpl.thumbnail]) {
      updates.thumbnail = imageMap[tmpl.thumbnail];
    }

    // Update screenshots array
    if (tmpl.screenshots && tmpl.screenshots.length > 0) {
      const newScreenshots = tmpl.screenshots.map(s => imageMap[s] || s);
      if (JSON.stringify(newScreenshots) !== JSON.stringify(tmpl.screenshots)) {
        updates.screenshots = newScreenshots;
      }
    }

    if (Object.keys(updates).length > 0) {
      await templates.updateOne({ _id: tmpl._id }, { $set: updates });
      updated++;
      console.log(`  ✅ Template "${tmpl.title}" updated`);
    }
  }
  console.log(`Updated ${updated} templates\n`);

  // Update UI shots
  const shots = db.collection('uishots');
  const allShots = await shots.find({}).toArray();
  let shotUpdated = 0;

  for (const shot of allShots) {
    if (shot.image && shotMap[shot.image]) {
      await shots.updateOne({ _id: shot._id }, { $set: { image: shotMap[shot.image] } });
      shotUpdated++;
      console.log(`  ✅ Shot "${shot.title}" updated`);
    }
  }
  console.log(`Updated ${shotUpdated} shots`);

  await mongoose.connection.close();
  console.log('\nDone!');
}

updateUrls().catch(err => {
  console.error(err);
  process.exit(1);
});
