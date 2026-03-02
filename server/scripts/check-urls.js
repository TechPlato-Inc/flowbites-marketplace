import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

async function check() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const templates = await db.collection('templates').find({}).project({ title: 1, thumbnail: 1, screenshots: { $slice: 1 } }).limit(3).toArray();
  console.log('Sample templates:');
  templates.forEach(t => {
    console.log(`  ${t.title}`);
    console.log(`    thumbnail: ${t.thumbnail}`);
    console.log(`    screenshot[0]: ${t.screenshots?.[0] || 'none'}`);
  });

  const shots = await db.collection('uishots').find({}).project({ title: 1, image: 1 }).limit(2).toArray();
  console.log('\nSample shots:');
  shots.forEach(s => {
    console.log(`  ${s.title}: ${s.image}`);
  });

  await mongoose.connection.close();
}

check().catch(console.error);
