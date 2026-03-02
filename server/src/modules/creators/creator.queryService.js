import { CreatorProfile } from './creator.model.js';
import { Template } from '../templates/template.model.js';
import { UIShot } from '../ui-shorts/uiShort.model.js';
import { ServicePackage } from '../services/service.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';
import { toCreatorProfileDTO, toCreatorDashboardDTO } from './dto/creatorProfile.dto.js';

export class CreatorQueryService {
  /**
   * List verified creators (public directory).
   */
  async getAll({ page = 1, limit = 24, q, search, sort = 'popular' } = {}) {
    const skip = (page - 1) * limit;
    const filter = { isVerified: true };

    // Support both `q` and `search` query params
    const searchTerm = q || search;
    if (searchTerm) {
      const safeQ = escapeRegex(searchTerm);
      filter.$or = [
        { displayName: { $regex: safeQ, $options: 'i' } },
        { username: { $regex: safeQ, $options: 'i' } },
      ];
    }

    let sortOption = { 'stats.totalSales': -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'templates') sortOption = { 'stats.templateCount': -1 };

    const [creators, total] = await Promise.all([
      CreatorProfile.find(filter)
        .populate('userId', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      CreatorProfile.countDocuments(filter),
    ]);

    return {
      creators: creators.map(toCreatorProfileDTO),
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get public creator profile by username or userId.
   */
  async getPublicProfile(identifier) {
    // Try by username first, then by userId
    let profile = await CreatorProfile.findOne({ username: identifier })
      .populate('userId', 'name avatar createdAt')
      .lean();

    if (!profile) {
      profile = await CreatorProfile.findOne({ userId: identifier })
        .populate('userId', 'name avatar createdAt')
        .lean();
    }

    if (!profile) {
      throw new AppError('Creator not found', 404);
    }

    return toCreatorProfileDTO(profile);
  }

  /**
   * Get creator's published templates.
   */
  async getCreatorTemplates(userId, { page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      Template.find({ creatorId: userId, status: 'approved' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('creatorProfileId', 'displayName username'),
      Template.countDocuments({ creatorId: userId, status: 'approved' }),
    ]);

    return {
      templates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get creator's published UI shots.
   */
  async getCreatorShots(userId, { page = 1, limit = 12 } = {}) {
    const skip = (page - 1) * limit;

    const [shots, total] = await Promise.all([
      UIShot.find({ creatorId: userId, isPublished: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title price slug'),
      UIShot.countDocuments({ creatorId: userId, isPublished: true }),
    ]);

    return {
      shots,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get creator's active service packages.
   */
  async getCreatorServices(userId) {
    const packages = await ServicePackage.find({ creatorId: userId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('templateId', 'title thumbnail slug');

    return packages;
  }

  /**
   * Get onboarding status for the authenticated creator.
   */
  async getOnboardingStatus(userId) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    return {
      status: profile.onboarding?.status || 'pending',
      completedSteps: profile.onboarding?.completedSteps || [],
      rejectionReason: profile.onboarding?.rejectionReason,
      onboarding: profile.onboarding || {},
    };
  }

  /**
   * Search creators by username (for onboarding reference lookup).
   */
  async searchCreators(query, excludeUserId) {
    const safeQuery = escapeRegex(query);
    return CreatorProfile.find({
      username: { $regex: safeQuery, $options: 'i' },
      userId: { $ne: excludeUserId },
    })
      .select('displayName username')
      .limit(5);
  }
}
