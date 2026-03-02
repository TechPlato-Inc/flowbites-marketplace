import { CreatorProfile } from './creator.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class CreatorWriteService {
  /**
   * Save personal info during onboarding (step 1).
   */
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

  /**
   * Save government ID during onboarding (step 2).
   */
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

  /**
   * Save selfie verification during onboarding (step 3).
   */
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

  /**
   * Save bank details during onboarding (step 4).
   */
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

  /**
   * Save creator reference during onboarding (step 5).
   */
  async saveCreatorReference(userId, data) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    const refCreator = await CreatorProfile.findOne({
      username: data.referenceCreatorUsername.toLowerCase(),
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

  /**
   * Submit completed onboarding for review.
   */
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

  /**
   * Update creator profile fields (post-onboarding edits).
   */
  async updateProfile(userId, data) {
    const profile = await CreatorProfile.findOne({ userId });
    if (!profile) throw new AppError('Creator profile not found', 404);

    const allowedFields = ['displayName', 'bio', 'website', 'twitter', 'dribbble', 'github', 'portfolio', 'payoutEmail'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        profile[field] = data[field];
      }
    }

    await profile.save();
    return profile;
  }

  /**
   * Approve a creator (admin action).
   */
  async approve(creatorProfileId, adminUserId) {
    const profile = await CreatorProfile.findById(creatorProfileId);
    if (!profile) throw new AppError('Creator profile not found', 404);

    profile.onboarding.status = 'approved';
    profile.onboarding.reviewedAt = new Date();
    profile.isVerified = true;
    await profile.save();

    eventBus.emit(EVENTS.CREATOR_APPROVED, {
      creatorProfileId: profile._id.toString(),
      userId: profile.userId.toString(),
      approvedBy: adminUserId,
    });

    return profile;
  }
}
