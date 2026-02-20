import { Template } from './template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { Category, Tag } from '../categories/category.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import fs from 'fs/promises';

export class TemplateService {
  async create(creatorId, data, files, isAdmin = false) {
    // Get creator profile
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    if (!creatorProfile) {
      throw new AppError('Creator profile not found', 404);
    }

    // Require verified creator (admins bypass this check)
    if (!isAdmin && creatorProfile.onboarding.status !== 'approved') {
      throw new AppError('Your creator account must be verified before submitting templates. Please complete the onboarding process first.', 403);
    }

    // Validate category
    const category = await Category.findById(data.category);
    if (!category) {
      throw new AppError('Invalid category', 400);
    }

    // Handle file uploads
    const thumbnail = files.thumbnail?.[0]?.filename;
    const gallery = files.gallery?.map(f => f.filename) || [];
    const templateFile = files.templateFile?.[0]?.filename;

    if (!thumbnail) {
      throw new AppError('Thumbnail is required', 400);
    }

    // Determine delivery type based on platform
    const deliveryType = data.deliveryType || (
      data.platform === 'webflow' ? 'clone_link' :
      data.platform === 'framer' ? 'remix_link' :
      'file_download'
    );

    // For clone_link and remix_link, a deliveryUrl is required instead of a file
    if (['clone_link', 'remix_link'].includes(deliveryType)) {
      if (!data.deliveryUrl) {
        throw new AppError(
          deliveryType === 'clone_link'
            ? 'Clone link URL is required for Webflow templates'
            : 'Remix link URL is required for Framer templates',
          400
        );
      }
    } else if (!templateFile) {
      throw new AppError('Template file is required for file-based delivery', 400);
    }

    const fileSize = files.templateFile?.[0]?.size || 0;

    // Create template — admin uploads are auto-approved
    const template = await Template.create({
      ...data,
      deliveryType,
      creatorId,
      creatorProfileId: creatorProfile._id,
      thumbnail,
      gallery,
      ...(templateFile && { templateFile, fileSize }),
      status: isAdmin ? 'approved' : 'draft',
      madeByFlowbites: isAdmin,
      ...(isAdmin && { moderatedBy: creatorId, moderatedAt: new Date() })
    });

    return template;
  }

  async getAll(filters = {}) {
    const {
      q,
      category,
      platform,
      madeBy,
      creatorId,
      featured,
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

    // Search
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

    // Filter by platform
    if (platform) {
      query.platform = platform;
    }

    // Filter by featured
    if (featured === 'true' || featured === true) {
      query.isFeatured = true;
    }

    // Filter by made by Flowbites
    if (madeBy === 'flowbites') {
      query.madeByFlowbites = true;
    } else if (madeBy === 'community') {
      query.madeByFlowbites = false;
    }

    // Sort
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
        .populate('creatorProfileId', 'displayName username bio stats'),
      Template.countDocuments(query)
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getById(idOrSlug) {
    // Support both MongoDB ObjectId and slug lookup
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

    const template = await Template.findOne(query)
      .populate('category', 'name slug')
      .populate('creatorProfileId', 'displayName username avatar bio')
      .populate('creatorId', 'name email');

    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Increment views atomically to prevent race conditions
    await Template.findByIdAndUpdate(template._id, { $inc: { 'stats.views': 1 } });

    return template;
  }

  async update(id, creatorId, data, files) {
    const template = await Template.findOne({ _id: id, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    // Only allow updates if draft or pending
    if (!['draft', 'pending'].includes(template.status)) {
      throw new AppError('Cannot edit approved or rejected templates', 400);
    }

    // Update files if provided
    if (files.thumbnail?.[0]) {
      data.thumbnail = files.thumbnail[0].filename;
    }
    if (files.gallery) {
      data.gallery = files.gallery.map(f => f.filename);
    }
    if (files.templateFile?.[0]) {
      data.templateFile = files.templateFile[0].filename;
      data.fileSize = files.templateFile[0].size;
    }

    Object.assign(template, data);
    await template.save();

    return template;
  }

  async delete(id, creatorId) {
    const template = await Template.findOne({ _id: id, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    // Delete files (optional - could keep for audit)
    // await this.deleteFiles(template);

    await template.deleteOne();
    return { message: 'Template deleted successfully' };
  }

  async submitForReview(id, creatorId) {
    const template = await Template.findOne({ _id: id, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    if (template.status !== 'draft') {
      throw new AppError('Only draft templates can be submitted', 400);
    }

    // Require verified creator
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    if (!creatorProfile || creatorProfile.onboarding.status !== 'approved') {
      throw new AppError('Your creator account must be verified before submitting templates for review.', 403);
    }

    template.status = 'pending';
    await template.save();

    return template;
  }
}
