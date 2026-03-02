import { ServicePackage } from './service.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';
import { toServicePackageDTO, toServiceDetailDTO } from './dto/servicePackage.dto.js';

export class ServiceQueryService {
  /**
   * Browse / list all active service packages with filtering and pagination.
   */
  async browse(filters = {}) {
    const {
      category,
      creatorId,
      templateId,
      search,
      sort = 'popular',
      page = 1,
      limit = 24,
    } = filters;

    const query = { isActive: true };

    if (category) query.category = category;
    if (creatorId) query.creatorId = creatorId;
    if (templateId) query.templateId = templateId;
    if (search) {
      const safeQuery = escapeRegex(search);
      query.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { description: { $regex: safeQuery, $options: 'i' } },
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'stats.completed': -1, createdAt: -1 };
        break;
      case 'price_low':
        sortOption = { price: 1 };
        break;
      case 'price_high':
        sortOption = { price: -1 };
        break;
      default:
        sortOption = { 'stats.completed': -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [packages, total] = await Promise.all([
      ServicePackage.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'name avatar')
        .populate('templateId', 'title slug thumbnail'),
      ServicePackage.countDocuments(query),
    ]);

    return {
      packages: packages.map(toServicePackageDTO),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieve a single service package by its slug.
   */
  async getBySlug(slug) {
    const pkg = await ServicePackage.findOne({ slug, isActive: true })
      .populate('creatorId', 'name avatar email')
      .populate('templateId', 'title slug thumbnail price platform');

    if (!pkg) {
      throw new AppError('Service not found', 404);
    }

    return toServiceDetailDTO(pkg);
  }

  /**
   * List all packages belonging to a creator (includes inactive).
   */
  async getByCreator(creatorId) {
    const packages = await ServicePackage.find({ creatorId })
      .sort({ createdAt: -1 })
      .populate('templateId', 'title slug');

    return packages.map(toServicePackageDTO);
  }

  /**
   * List active packages for a given template.
   */
  async getByTemplate(templateId) {
    const packages = await ServicePackage.find({ templateId, isActive: true });
    return packages.map(toServicePackageDTO);
  }
}
