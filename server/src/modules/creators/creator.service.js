import { CreatorProfile } from './creator.model.js';
import { Template } from '../templates/template.model.js';
import { UIShot } from '../ui-shorts/uiShort.model.js';
import { ServicePackage } from '../services/service.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';

export class CreatorService {
  /**
   * List verified creators (public directory).
   */
  async getAll({ page = 1, limit = 24, q, sort = 'popular' } = {}) {
    const skip = (page - 1) * limit;
    const filter = { isVerified: true };

    if (q) {
      const safeQ = escapeRegex(q);
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
        .select('displayName username bio stats isFeatured isOfficial createdAt')
        .populate('userId', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      CreatorProfile.countDocuments(filter),
    ]);

    return {
      creators,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get public creator profile by username or userId
   */
  async getPublicProfile(identifier) {
    const publicSelect = [
      'userId',
      'displayName',
      'username',
      'bio',
      'website',
      'twitter',
      'dribbble',
      'github',
      'portfolio',
      'coverImage',
      'stats',
      'isFeatured',
      'isVerified',
      'isOfficial',
      'createdAt',
      'updatedAt',
    ].join(' ');

    // Try by username first, then by userId
    let profile = await CreatorProfile.findOne({ username: identifier })
      .select(publicSelect)
      .populate('userId', 'name avatar createdAt')
      .lean();

    if (!profile) {
      profile = await CreatorProfile.findOne({ userId: identifier })
        .select(publicSelect)
        .populate('userId', 'name avatar createdAt')
        .lean();
    }

    if (!profile) {
      throw new AppError('Creator not found', 404);
    }

    return {
      ...profile,
      userId: profile.userId ? {
        _id: profile.userId._id,
        name: profile.userId.name,
        avatar: profile.userId.avatar,
        createdAt: profile.userId.createdAt,
      } : null,
    };
  }

  /**
   * Get creator's published templates
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
      Template.countDocuments({ creatorId: userId, status: 'approved' })
    ]);

    return {
      templates,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get creator's published UI shots
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
      UIShot.countDocuments({ creatorId: userId, isPublished: true })
    ]);

    return {
      shots,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  /**
   * Get creator's active service packages
   */
  async getCreatorServices(userId) {
    const packages = await ServicePackage.find({ creatorId: userId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('templateId', 'title thumbnail slug');

    return packages;
  }

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

  async savePersonalInfo(userId, data) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    if (!profile.onboarding) profile.onboarding = {};
    Object.assign(profile.onboarding, {
      fullName: data.fullName,
      phone: data.phone,
      country: data.country,
      city: data.city,
      address: data.address,
      status: 'in_progress',
    });

    if (!profile.onboarding.completedSteps) profile.onboarding.completedSteps = [];
    if (!profile.onboarding.completedSteps.includes('personal_info')) {
      profile.onboarding.completedSteps.push('personal_info');
    }
    if (data.displayName) profile.displayName = data.displayName;
    await profile.save();
    return profile.onboarding;
  }

  async saveGovernmentId(userId, data, files) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    if (!profile.onboarding) profile.onboarding = {};
    profile.onboarding.govIdType = data.govIdType;
    profile.onboarding.govIdNumber = data.govIdNumber;
    if (files.govIdFront?.[0]) profile.onboarding.govIdFront = files.govIdFront[0].filename;
    if (files.govIdBack?.[0]) profile.onboarding.govIdBack = files.govIdBack[0].filename;

    if (!profile.onboarding.completedSteps) profile.onboarding.completedSteps = [];
    if (!profile.onboarding.completedSteps.includes('government_id')) {
      profile.onboarding.completedSteps.push('government_id');
    }
    await profile.save();
    return profile.onboarding;
  }

  async saveSelfieVerification(userId, files) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    if (!profile.onboarding) profile.onboarding = {};
    if (files.selfieWithId?.[0]) profile.onboarding.selfieWithId = files.selfieWithId[0].filename;

    if (!profile.onboarding.completedSteps) profile.onboarding.completedSteps = [];
    if (!profile.onboarding.completedSteps.includes('selfie_verification')) {
      profile.onboarding.completedSteps.push('selfie_verification');
    }
    await profile.save();
    return profile.onboarding;
  }

  async saveBankDetails(userId, data) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    if (!profile.onboarding) profile.onboarding = {};
    Object.assign(profile.onboarding, {
      bankName: data.bankName,
      bankAccountName: data.bankAccountName,
      bankAccountNumber: data.bankAccountNumber,
      bankRoutingNumber: data.bankRoutingNumber,
      bankSwiftCode: data.bankSwiftCode,
      bankCountry: data.bankCountry,
    });

    if (!profile.onboarding.completedSteps) profile.onboarding.completedSteps = [];
    if (!profile.onboarding.completedSteps.includes('bank_details')) {
      profile.onboarding.completedSteps.push('bank_details');
    }
    await profile.save();
    return profile.onboarding;
  }

  async saveCreatorReference(userId, data) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    const refCreator = await CreatorProfile.findOne({
      username: data.referenceCreatorUsername.toLowerCase()
    });
    if (!refCreator) throw new AppError('Referenced creator not found. Please check the username.', 404);
    if (refCreator.userId.toString() === userId.toString()) {
      throw new AppError('You cannot reference yourself', 400);
    }

    if (!profile.onboarding) profile.onboarding = {};
    Object.assign(profile.onboarding, {
      referenceCreatorUsername: data.referenceCreatorUsername.toLowerCase(),
      referenceCreatorId: refCreator._id,
      referenceNote: data.referenceNote,
    });

    if (!profile.onboarding.completedSteps) profile.onboarding.completedSteps = [];
    if (!profile.onboarding.completedSteps.includes('creator_reference')) {
      profile.onboarding.completedSteps.push('creator_reference');
    }
    await profile.save();
    return profile.onboarding;
  }

  async submitOnboarding(userId) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    const requiredSteps = ['personal_info', 'government_id', 'selfie_verification', 'bank_details', 'creator_reference'];
    const completed = profile.onboarding?.completedSteps || [];
    const missing = requiredSteps.filter(s => !completed.includes(s));
    if (missing.length > 0) {
      throw new AppError(`Please complete all steps before submitting. Missing: ${missing.join(', ')}`, 400);
    }

    profile.onboarding.status = 'submitted';
    profile.onboarding.submittedAt = new Date();
    await profile.save();
    return profile.onboarding;
  }

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
