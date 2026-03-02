import { UIShot } from './uiShort.model.js';
import { toUiShortDTO, toAdminUiShortDTO } from './dto/uiShort.dto.js';

export class UIShotQueryService {
  async getAll(filters = {}) {
    const { page = 1, limit = 20, sort = 'recent', search } = filters;

    let sortOption = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'stats.likes': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const [shots, total] = await Promise.all([
      UIShot.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title price')
        .lean(),
      UIShot.countDocuments(query)
    ]);

    return {
      shots: shots.map(toUiShortDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Admin: get all shots including unpublished.
   */
  async adminGetAll({ page = 1, limit = 20, creatorId } = {}) {
    const skip = (page - 1) * limit;
    const query = {};
    if (creatorId) query.creatorId = creatorId;

    const [shots, total] = await Promise.all([
      UIShot.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name email avatar')
        .lean(),
      UIShot.countDocuments(query),
    ]);

    return {
      shots: shots.map(toAdminUiShortDTO),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
