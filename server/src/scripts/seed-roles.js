import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { validateEnv } from '../config/validateEnv.js';
import { seedDefaultRoles } from '../modules/rbac/seed.js';

dotenv.config();
validateEnv();

async function run() {
  try {
    console.log('🌱 Seeding RBAC roles...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await seedDefaultRoles();

    console.log('✅ RBAC role seeding complete');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ RBAC role seeding failed:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

run();
