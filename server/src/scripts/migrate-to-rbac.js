import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { validateEnv } from '../config/validateEnv.js';
import { seedDefaultRoles } from '../modules/rbac/seed.js';
import { User } from '../modules/users/user.model.js';
import { Role } from '../modules/rbac/role.model.js';

dotenv.config();
validateEnv();

const shouldFix = process.argv.includes('--fix');

async function run() {
  try {
    console.log('🔎 Validating user roles against RBAC role documents...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await seedDefaultRoles();

    const roles = await Role.find({ isActive: true }).select('name').lean();
    const validRoleNames = new Set(roles.map(role => role.name));
    const users = await User.find({}).select('email role name').lean();
    const mismatches = users.filter(user => !validRoleNames.has(user.role));

    console.log(`Users scanned: ${users.length}`);
    console.log(`Active roles: ${validRoleNames.size}`);

    if (mismatches.length === 0) {
      console.log('✅ No mismatched user roles found');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`⚠️ Found ${mismatches.length} user(s) with roles missing from Role documents:`);
    for (const user of mismatches) {
      console.log(`- ${user.email} (${user.name}) -> ${user.role}`);
    }

    if (!shouldFix) {
      console.log('\nRun again with --fix to reassign mismatched users to buyer.');
      await mongoose.connection.close();
      process.exit(1);
    }

    const result = await User.updateMany(
      { _id: { $in: mismatches.map(user => user._id) } },
      { role: 'buyer' }
    );

    console.log(`\n✅ Reassigned ${result.modifiedCount} user(s) to buyer`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ RBAC migration validation failed:', error);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

run();
