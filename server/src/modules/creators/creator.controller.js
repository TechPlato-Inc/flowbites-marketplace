import { CreatorQueryService } from './creator.queryService.js';
import { CreatorWriteService } from './creator.writeService.js';
import { listCreatorsQuerySchema, submitOnboardingSchema } from './creator.validator.js';
import {
  createConnectAccount,
  getConnectStatus as getStripeConnectStatus,
  getStripeDashboardLink,
} from '../../services/stripeConnect.js';

const queryService = new CreatorQueryService();
const writeService = new CreatorWriteService();

export class CreatorController {
  async getAll(req, res, next) {
    try {
      const parsed = listCreatorsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const data = await queryService.getAll(parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPublicProfile(req, res, next) {
    try {
      const profile = await queryService.getPublicProfile(req.params.identifier);

      // Also fetch templates, shots, services in parallel
      const userId = profile.userId;
      const [templatesData, shotsData, services] = await Promise.all([
        queryService.getCreatorTemplates(userId, {
          page: parseInt(req.query.templatesPage) || 1,
          limit: parseInt(req.query.templatesLimit) || 12,
        }),
        queryService.getCreatorShots(userId, {
          page: parseInt(req.query.shotsPage) || 1,
          limit: parseInt(req.query.shotsLimit) || 12,
        }),
        queryService.getCreatorServices(userId),
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
      const profile = await queryService.getPublicProfile(req.params.identifier);
      const data = await queryService.getCreatorTemplates(profile.userId, {
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
      const profile = await queryService.getPublicProfile(req.params.identifier);
      const data = await queryService.getCreatorShots(profile.userId, {
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
      const data = await queryService.getOnboardingStatus(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async savePersonalInfo(req, res, next) {
    try {
      const parsed = submitOnboardingSchema.safeParse({ body: req.body });
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid onboarding data', details: parsed.error.issues });
      }
      const data = await writeService.savePersonalInfo(req.user._id, parsed.data.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveGovernmentId(req, res, next) {
    try {
      const data = await writeService.saveGovernmentId(req.user._id, req.body, req.files || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveSelfieVerification(req, res, next) {
    try {
      const data = await writeService.saveSelfieVerification(req.user._id, req.files || {});
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveBankDetails(req, res, next) {
    try {
      const data = await writeService.saveBankDetails(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async saveCreatorReference(req, res, next) {
    try {
      const data = await writeService.saveCreatorReference(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async submitOnboarding(req, res, next) {
    try {
      const data = await writeService.submitOnboarding(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async searchCreators(req, res, next) {
    try {
      const data = await queryService.searchCreators(req.query.q || '', req.user._id);
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
