/**
 * Public user profile DTO — safe for unauthenticated or cross-user views.
 * Strips sensitive fields like password, refreshTokens, ban details, etc.
 */
export function toUserProfileDTO(doc) {
  const d = doc?.toObject ? doc.toObject() : doc;
  return {
    _id: d._id,
    name: d.name,
    avatar: d.avatar ?? null,
    bio: d.bio ?? null,
    role: d.role,
    createdAt: d.createdAt,
  };
}

/**
 * Authenticated user's own settings DTO — includes private account data
 * the user needs to manage their profile but still strips secrets
 * (password, refreshTokens, ban internals, etc.).
 */
export function toUserSettingsDTO(doc) {
  const d = doc?.toObject ? doc.toObject() : doc;
  return {
    _id: d._id,
    name: d.name,
    email: d.email,
    avatar: d.avatar ?? null,
    bio: d.bio ?? null,
    role: d.role,
    emailVerified: d.emailVerified || false,
    isActive: d.isActive ?? true,
    notificationPreferences: d.notificationPreferences ?? {
      orders: true,
      templates: true,
      reviews: true,
      services: true,
      social: true,
      financial: true,
      support: true,
      account: true,
      system: true,
    },
    emailPreferences: d.emailPreferences ?? {
      orderConfirmations: true,
      reviewNotifications: true,
      promotionalEmails: false,
      weeklyDigest: false,
      newFollowerAlert: true,
    },
    createdAt: d.createdAt,
  };
}
