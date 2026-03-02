/**
 * Public creator profile DTO — safe for unauthenticated consumers.
 */
export function toCreatorProfileDTO(doc) {
  const d = doc?.toObject ? doc.toObject() : doc;
  return {
    _id: d._id,
    userId: d.userId?._id ?? d.userId,
    displayName: d.displayName,
    username: d.username,
    avatar: d.userId?.avatar ?? null,
    bio: d.bio ?? null,
    website: d.website ?? null,
    twitter: d.twitter ?? null,
    dribbble: d.dribbble ?? null,
    github: d.github ?? null,
    portfolio: d.portfolio ?? null,
    coverImage: d.coverImage ?? null,
    isVerified: d.isVerified || false,
    isFeatured: d.isFeatured || false,
    isOfficial: d.isOfficial || false,
    stats: {
      totalSales: d.stats?.totalSales || 0,
      totalRevenue: d.stats?.totalRevenue || 0,
      templateCount: d.stats?.templateCount || 0,
      averageRating: d.stats?.averageRating || 0,
      totalReviews: d.stats?.totalReviews || 0,
      followers: d.stats?.followers || 0,
    },
    socialLinks: {
      website: d.website ?? null,
      twitter: d.twitter ?? null,
      dribbble: d.dribbble ?? null,
      github: d.github ?? null,
      portfolio: d.portfolio ?? null,
    },
    createdAt: d.createdAt,
  };
}

/**
 * Creator dashboard DTO — includes private fields the creator needs
 * to manage their own account (onboarding status, payout info, etc.).
 */
export function toCreatorDashboardDTO(doc) {
  const d = doc?.toObject ? doc.toObject() : doc;
  return {
    ...toCreatorProfileDTO(doc),
    updatedAt: d.updatedAt,
    payoutEmail: d.payoutEmail ?? null,
    hasStripeAccount: !!d.stripeAccountId,
    subscription: d.subscription ?? { plan: 'free' },
    onboarding: {
      status: d.onboarding?.status || 'pending',
      completedSteps: d.onboarding?.completedSteps || [],
      submittedAt: d.onboarding?.submittedAt ?? null,
      reviewedAt: d.onboarding?.reviewedAt ?? null,
      rejectionReason: d.onboarding?.rejectionReason ?? null,
    },
  };
}
