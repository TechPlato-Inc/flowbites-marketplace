import { Template } from '../templates/template.model.js';
import { ServicePackage } from '../services/service.model.js';
import { CreatorProfile } from '../creators/creator.model.js';

export class SearchQueryService {
  async search(q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [templates, services, creators] = await Promise.all([
      Template.find({ status: 'approved', $text: { $search: q } })
        .select('title slug thumbnail price platform creatorProfileId')
        .populate('creatorProfileId', 'displayName')
        .sort({ score: { $meta: 'textScore' } })
        .limit(12)
        .lean(),

      ServicePackage.find({ isActive: true, name: { $regex: regex } })
        .select('name slug price creatorId')
        .populate('creatorId', 'name')
        .limit(6)
        .lean(),

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

    return { templates: transformedTemplates, services: transformedServices, creators };
  }

  async autocomplete(q) {
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const templates = await Template.find({
      status: 'approved',
      title: { $regex: regex },
    })
      .select('title slug platform price thumbnail')
      .limit(8)
      .lean();

    return { suggestions: templates };
  }

  async popular() {
    const templates = await Template.find({ status: 'approved' })
      .sort({ 'stats.views': -1 })
      .select('title slug platform price thumbnail stats.views')
      .limit(10)
      .lean();

    return { templates };
  }
}
