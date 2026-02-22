import { CreatorService } from './creator.service.js';
import {
  createConnectAccount,
  getConnectStatus as getStripeConnectStatus,
  getStripeDashboardLink,
} from '../../services/stripeConnect.js';

const creatorService = new CreatorService();

export class CreatorController {
  async getAll(req, res, next) {
    try {
      const data = await creatorService.getAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 24,
        q: req.query.q,
        sort: req.query.sort,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

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

  // ── Stripe Connect ──

  async connectStripe(req, res, next) {
    try {
      const result = await createConnectAccount(req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getConnectStatus(req, res, next) {
    try {
      const result = await getStripeConnectStatus(req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStripeDashboard(req, res, next) {
    try {
      const result = await getStripeDashboardLink(req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
