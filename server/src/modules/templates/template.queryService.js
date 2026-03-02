import { Template } from './template.model.js';
import { Category } from '../categories/category.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { toTemplateListItemDTO } from './dto/templateListItem.dto.js';
import { toTemplateDetailDTO } from './dto/templateDetail.dto.js';

export class TemplateQueryService {
  async getAll(filters = {}) {
    const {
      q,
      category,
      platform,
      madeBy,
      creatorId,
      featured,
      free,
      sale,
      priceMin,
      priceMax,
      sort = 'newest',
      page = 1,
      limit = 24,
      status = 'approved'
    } = filters;

    const query = {};

    // When fetching creator's own templates, show all statuses; otherwise filter by status
    if (creatorId) {
      query.creatorId = creatorId;
    } else {
      query.status = status;
    }

    if (q) {
      query.$text = { $search: q };
    }

    // Filter by category (accepts both ObjectId and slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    if (platform) {
      query.platform = platform;
    }

    if (featured === 'true' || featured === true) {
      query.isFeatured = true;
    }

    if (madeBy === 'flowbites') {
      query.madeByFlowbites = true;
    } else if (madeBy === 'community') {
      query.madeByFlowbites = false;
    }

    if (free === 'true') {
      query.price = 0;
    }

    if (sale === 'true') {
      query.salePrice = { $ne: null, $gt: 0 };
    }

    if (priceMin !== undefined || priceMax !== undefined) {
      if (!query.price) query.price = {};
      if (priceMin !== undefined) query.price.$gte = priceMin;
      if (priceMax !== undefined) query.price.$lte = priceMax;
    }

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popular':
        sortOption = { 'stats.purchases': -1 };
        break;
      case 'price_low':
        sortOption = { price: 1 };
        break;
      case 'price_high':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'stats.averageRating': -1 };
        break;
      case 'sales':
        sortOption = { 'stats.purchases': -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      Template.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('creatorProfileId', 'displayName username avatar isVerified bio stats'),
      Template.countDocuments(query)
    ]);

    return {
      templates: templates.map(toTemplateListItemDTO),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getById(idOrSlug) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const template = await Template.findOne(query)
      .populate('category', 'name slug')
      .populate('creatorProfileId', 'displayName username avatar isVerified bio stats')
      .populate('creatorId', 'name email');

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    return toTemplateDetailDTO(template);
  }
}
