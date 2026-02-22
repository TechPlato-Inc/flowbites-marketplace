/**
 * Test setup helpers.
 * Provides utilities for creating test data and making authenticated requests.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flowbites-test';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';

/**
 * Connect to test database.
 */
export async function connectTestDB() {
  await mongoose.connect(MONGODB_URI);
}

/**
 * Drop all collections and close connection.
 */
export async function cleanupTestDB() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.drop().catch(() => {});
  }
  await mongoose.connection.close();
}

/**
 * Clear all collections (between tests).
 */
export async function clearCollections() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
}

/**
 * Generate a JWT access token for testing.
 */
export function generateTestToken(userId, role = 'buyer') {
  return jwt.sign(
    { userId, role },
    JWT_ACCESS_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Create a test user directly in the database.
 */
export async function createTestUser(overrides = {}) {
  const { User } = await import('../src/modules/users/user.model.js');

  // Don't hash password here - User model's pre-save hook will handle it
  const user = await User.create({
    name: 'Test User',
    email: `test-${Date.now()}@flowbites.com`,
    password: 'TestPassword123!',
    role: 'buyer',
    isEmailVerified: true,
    ...overrides,
  });

  const token = generateTestToken(user._id, user.role);
  return { user, token };
}

/**
 * Create a test admin user.
 */
export async function createTestAdmin() {
  return createTestUser({ role: 'admin', name: 'Test Admin' });
}

/**
 * Create a test creator with profile.
 */
export async function createTestCreator() {
  const { user, token } = await createTestUser({ role: 'creator', name: 'Test Creator' });
  const { CreatorProfile } = await import('../src/modules/creators/creator.model.js');

  const profile = await CreatorProfile.create({
    userId: user._id,
    displayName: 'Test Creator',
    username: `creator-${Date.now()}`,
    bio: 'Test creator bio',
    isVerified: true,
    onboarding: { status: 'approved' },
    stats: { totalSales: 0, totalRevenue: 0, templateCount: 0, averageRating: 0, totalReviews: 0, followers: 0 },
  });

  return { user, token, profile };
}

/**
 * Create a test template.
 */
export async function createTestTemplate(creatorId, creatorProfileId, overrides = {}) {
  const { Template } = await import('../src/modules/templates/template.model.js');
  const { Category } = await import('../src/modules/categories/category.model.js');

  let category = await Category.findOne({ slug: 'test-category' });
  if (!category) {
    category = await Category.create({ name: 'Test Category', slug: 'test-category' });
  }

  const template = await Template.create({
    title: `Test Template ${Date.now()}`,
    description: 'A test template',
    platform: 'webflow',
    price: 49,
    thumbnail: 'test-thumb.jpg',
    category: category._id,
    creatorId,
    creatorProfileId,
    status: 'approved',
    deliveryType: 'clone_link',
    deliveryUrl: 'https://webflow.com/made-in-webflow/test',
    ...overrides,
  });

  return template;
}
