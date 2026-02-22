import { Template } from './template.model.js';
import { ServicePackage } from '../services/service.model.js';
import { CreatorProfile } from '../creators/creator.model.js';

export class SearchController {
  /**
   * GET /search?q=keyword
   * Searches across templates, services, and creators.
   */
  async search(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.json({ success: true, data: { templates: [], services: [], creators: [] } });
      }

      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const [templates, services, creators] = await Promise.all([
        // Templates — use text index for relevance scoring
        Template.find({ status: 'approved', $text: { $search: q } })
          .select('title slug thumbnail price platform creatorProfileId')
          .populate('creatorProfileId', 'displayName')
          .sort({ score: { $meta: 'textScore' } })
          .limit(12)
          .lean(),

        // Services — regex on name
        ServicePackage.find({ isActive: true, name: { $regex: regex } })
          .select('name slug price creatorId')
          .populate('creatorId', 'name')
          .limit(6)
          .lean(),

        // Creators — regex on displayName or username
        CreatorProfile.find({
          isVerified: true,
          $or: [
            { displayName: { $regex: regex } },
            { username: { $regex: regex } },
          ],
        })
          .select('displayName username avatar stats.templateCount')
          .limit(6)
          .lean(),
      ]);

      // Transform field names to match frontend expectations
      const transformedTemplates = templates.map((t) => ({
        _id: t._id,
        title: t.title,
        slug: t.slug,
        thumbnail: t.thumbnail,
        price: t.price,
        platform: t.platform,
        creatorId: t.creatorProfileId
          ? { _id: t.creatorProfileId._id, displayName: t.creatorProfileId.displayName }
          : null,
      }));

      const transformedServices = services.map((s) => ({
        _id: s._id,
        name: s.name,
        slug: s.slug,
        price: s.price,
        creatorId: s.creatorId
          ? { _id: s.creatorId._id, displayName: s.creatorId.name }
          : null,
      }));

      res.json({
        success: true,
        data: {
          templates: transformedTemplates,
          services: transformedServices,
          creators,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /search/autocomplete?q=keyword
   * Returns up to 8 template title suggestions for autocomplete.
   */
  async autocomplete(req, res, next) {
    try {
      const { q } = req.query;
      if (!q || q.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

      const templates = await Template.find({
        status: 'approved',
        title: { $regex: regex },
      })
        .select('title slug platform price thumbnail')
        .limit(8)
        .lean();

      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /search/popular
   * Returns the top 10 most searched/popular templates.
   */
  async popular(req, res, next) {
    try {
      const templates = await Template.find({ status: 'approved' })
        .sort({ 'stats.views': -1 })
        .select('title slug platform price thumbnail stats.views')
        .limit(10)
        .lean();

      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }
}
