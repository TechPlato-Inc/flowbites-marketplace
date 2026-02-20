import { CreatorService } from './creator.service.js';

const creatorService = new CreatorService();

export class CreatorController {
  async getPublicProfile(req, res, next) {
    try {
      const profile = await creatorService.getPublicProfile(req.params.identifier);

      // Also fetch templates, shots, services in parallel
      const [templatesData, shotsData, services] = await Promise.all([
        creatorService.getCreatorTemplates(profile.userId._id, {
          page: parseInt(req.query.templatesPage) || 1,
          limit: parseInt(req.query.templatesLimit) || 12,
        }),
        creatorService.getCreatorShots(profile.userId._id, {
          page: parseInt(req.query.shotsPage) || 1,
          limit: parseInt(req.query.shotsLimit) || 12,
        }),
        creatorService.getCreatorServices(profile.userId._id),
      ]);

      res.json({
        success: true,
        data: {
          profile,
          templates: templatesData.templates,
          templatesPagination: templatesData.pagination,
          shots: shotsData.shots,
          shotsPagination: shotsData.pagination,
          services,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorTemplates(req, res, next) {
    try {
      const profile = await creatorService.getPublicProfile(req.params.identifier);
      const data = await creatorService.getCreatorTemplates(profile.userId._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12,
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorShots(req, res, next) {
    try {
      const profile = await creatorService.getPublicProfile(req.params.identifier);
      const data = await creatorService.getCreatorShots(profile.userId._id, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12,
      });

      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Onboarding endpoints
  async getOnboardingStatus(req, res, next) {
    try {
      const data = await creatorService.getOnboardingStatus(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async savePersonalInfo(req, res, next) {
    try {
      const data = await creatorService.savePersonalInfo(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveGovernmentId(req, res, next) {
    try {
      const data = await creatorService.saveGovernmentId(req.user._id, req.body, req.files || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveSelfieVerification(req, res, next) {
    try {
      const data = await creatorService.saveSelfieVerification(req.user._id, req.files || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveBankDetails(req, res, next) {
    try {
      const data = await creatorService.saveBankDetails(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveCreatorReference(req, res, next) {
    try {
      const data = await creatorService.saveCreatorReference(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async submitOnboarding(req, res, next) {
    try {
      const data = await creatorService.submitOnboarding(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async searchCreators(req, res, next) {
    try {
      const data = await creatorService.searchCreators(req.query.q || '', req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
