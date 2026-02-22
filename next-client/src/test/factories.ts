import {
  User,
  Template,
  Review,
  Category,
  Order,
  License,
  CreatorProfile,
} from "@/types";

// Factory functions for creating test data

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    _id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: "test@example.com",
    name: "Test User",
    role: "buyer",
    avatar: "https://example.com/avatar.jpg",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockCategory(
  overrides: Partial<Category> = {},
): Category {
  return {
    _id: `cat-${Math.random().toString(36).substr(2, 9)}`,
    name: "Test Category",
    slug: "test-category",
    description: "A test category",
    ...overrides,
  };
}

export function createMockCreatorProfile(
  overrides: Partial<CreatorProfile> = {},
): CreatorProfile {
  return {
    _id: `profile-${Math.random().toString(36).substr(2, 9)}`,
    userId: createMockUser({ role: "creator" }),
    displayName: "Test Creator",
    username: "testcreator",
    bio: "A test creator",
    avatar: "https://example.com/creator.jpg",
    isVerified: true,
    isFeatured: false,
    stats: {
      totalSales: 100,
      totalRevenue: 5000,
      templateCount: 10,
      averageRating: 4.5,
      totalReviews: 20,
      followers: 150,
    },
    ...overrides,
  };
}

export function createMockTemplate(
  overrides: Partial<Template> = {},
): Template {
  const category = createMockCategory();
  const creator = createMockCreatorProfile();

  return {
    _id: `template-${Math.random().toString(36).substr(2, 9)}`,
    title: "Test Template",
    slug: "test-template",
    description: "A test template description",
    platform: "webflow",
    price: 49,
    salePrice: null,
    thumbnail: "test-thumb.jpg",
    gallery: ["img1.jpg", "img2.jpg"],
    category,
    tags: [{ _id: "tag-1", name: "SaaS", slug: "saas" }],
    creatorId:
      typeof creator.userId === "object" ? creator.userId._id : creator.userId,
    creatorProfileId: creator,
    status: "approved",
    madeByFlowbites: false,
    isFeatured: false,
    licenseType: "commercial",
    version: "1.0.0",
    stats: {
      views: 1000,
      purchases: 50,
      revenue: 2450,
      likes: 25,
      downloads: 45,
      averageRating: 4.5,
      totalReviews: 10,
    },
    demoUrl: "https://demo.example.com",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockReview(overrides: Partial<Review> = {}): Review {
  return {
    _id: `review-${Math.random().toString(36).substr(2, 9)}`,
    templateId: "template-123",
    buyerId: createMockUser(),
    orderId: "order-123",
    rating: 5,
    title: "Great template!",
    comment: "This template is amazing and saved me so much time.",
    status: "approved",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockOrder(overrides: Partial<Order> = {}): Order {
  return {
    _id: `order-${Math.random().toString(36).substr(2, 9)}`,
    orderNumber: "ORD-123456",
    buyerId: "buyer-123",
    items: [
      {
        type: "template",
        templateId: createMockTemplate(),
        title: "Test Template",
        price: 49,
      },
    ],
    total: 49,
    status: "paid",
    createdAt: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockLicense(overrides: Partial<License> = {}): License {
  return {
    _id: `license-${Math.random().toString(36).substr(2, 9)}`,
    licenseKey: "LIC-ABC123XYZ",
    templateId: createMockTemplate(),
    orderId: "order-123",
    accessCount: 0,
    maxAccesses: 10,
    downloadCount: 0,
    maxDownloads: 5,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// Mock API responses
export function mockApiResponse<T>(data: T, success = true) {
  return Promise.resolve({
    data: {
      success,
      data,
    },
  });
}

export function mockApiError(message: string, status = 400) {
  const error = new Error(message) as any;
  error.response = { data: { error: message }, status };
  return Promise.reject(error);
}
