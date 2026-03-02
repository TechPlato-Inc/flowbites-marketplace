import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAll() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  // Replace /raw/upload/ with /image/upload/ in all template thumbnails and galleries
  const templates = db.collection('templates');
  const allTemplates = await templates.find({}).toArray();
  let count = 0;

  for (const t of allTemplates) {
    const updates = {};
    if (t.thumbnail && t.thumbnail.includes('/raw/upload/')) {
      updates.thumbnail = t.thumbnail.replace('/raw/upload/', '/image/upload/');
    }
    if (t.gallery && t.gallery.length > 0) {
      const newGallery = t.gallery.map(g =>
        g.includes('/raw/upload/') ? g.replace('/raw/upload/', '/image/upload/') : g
      );
      if (JSON.stringify(newGallery) !== JSON.stringify(t.gallery)) {
        updates.gallery = newGallery;
      }
    }
    if (Object.keys(updates).length > 0) {
      await templates.updateOne({ _id: t._id }, { $set: updates });
      count++;
      console.log(`  ✅ "${t.title}" updated`);
    }
  }
  console.log(`Updated ${count} templates`);

  // Update UI shots
  const shots = db.collection('uishots');
  const allShots = await shots.find({}).toArray();
  let shotCount = 0;
  for (const s of allShots) {
    if (s.image && s.image.includes('/raw/upload/')) {
      await shots.updateOne({ _id: s._id }, { $set: { image: s.image.replace('/raw/upload/', '/image/upload/') } });
      shotCount++;
      console.log(`  ✅ Shot "${s.title}" updated`);
    }
  }
  console.log(`Updated ${shotCount} shots`);

  await mongoose.connection.close();
  console.log('Done!');
}

updateAll().catch(console.error);
