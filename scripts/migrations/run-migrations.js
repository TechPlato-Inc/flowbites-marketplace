import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

dotenv.config({ path: path.join(rootDir, 'server', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Set it in environment or server/.env.');
  process.exit(1);
}

const migrationFiles = [
  '001-add-user-ban-fields.js',
  '002-hash-refresh-tokens.js',
  '003-add-email-preferences.js',
];

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const migrationsCollection = mongoose.connection.collection('schema_migrations');
  await migrationsCollection.createIndex({ id: 1 }, { unique: true });

  for (const fileName of migrationFiles) {
    const migrationPath = path.join(__dirname, fileName);
    const mod = await import(pathToFileURL(migrationPath).href);
    const migrationId = mod.id || fileName.replace('.js', '');
    const description = mod.description || migrationId;

    const alreadyApplied = await migrationsCollection.findOne({ id: migrationId });
    if (alreadyApplied) {
      console.log(`SKIP ${migrationId} (already applied)`);
      continue;
    }

    if (typeof mod.up !== 'function') {
      throw new Error(`Migration ${fileName} must export an up() function`);
    }

    console.log(`RUN  ${migrationId} - ${description}`);
    const startedAt = Date.now();
    const result = await mod.up({ mongoose });

    await migrationsCollection.insertOne({
      id: migrationId,
      description,
      appliedAt: new Date(),
      durationMs: Date.now() - startedAt,
      result: result || {},
    });

    console.log(`DONE ${migrationId}`);
  }
}

run()
  .then(async () => {
    await mongoose.connection.close();
    console.log('All migrations completed.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Migration failed:', error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  });
