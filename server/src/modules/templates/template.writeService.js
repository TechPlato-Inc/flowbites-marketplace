import { Template } from './template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { Category } from '../categories/category.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { emitToAdmins } from '../../websocket/socket.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class TemplateWriteService {
  async create(creatorId, data, files, isAdmin = false) {
    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    if (!creatorProfile) {
      throw new AppError('Creator profile not found', 404);
    }

    if (!isAdmin && creatorProfile.onboarding.status !== 'approved') {
      throw new AppError('Your creator account must be verified before submitting templates. Please complete the onboarding process first.', 403);
    }

    const category = await Category.findById(data.category);
    if (!category) {
      throw new AppError('Invalid category', 400);
    }

    const thumbnail = files.thumbnail?.[0]?.filename;
    const gallery = files.gallery?.map(f => f.filename) || [];
    const templateFile = files.templateFile?.[0]?.filename;

    if (!thumbnail) {
      throw new AppError('Thumbnail is required', 400);
    }

    const deliveryType = data.deliveryType || (
      data.platform === 'webflow' ? 'clone_link' :
      data.platform === 'framer' ? 'remix_link' :
      'file_download'
    );

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

    const template = new Template({
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
    await template.saveWithSlugRetry();

    eventBus.emit(EVENTS.TEMPLATE_CREATED, {
      templateId: template._id.toString(),
      sellerId: creatorId,
      platform: template.platform,
      status: template.status,
    });

    return template;
  }

  async update(id, creatorId, data, files) {
    const template = await Template.findOne({ _id: id, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    if (template.status === 'rejected') {
      throw new AppError('Cannot edit rejected templates. Please create a new template.', 400);
    }

    const changes = [];
    const editableFields = ['title', 'description', 'price', 'salePrice', 'category', 'tags', 'metaDescription', 'keywords', 'version'];

    for (const field of editableFields) {
      if (data[field] !== undefined && data[field] !== template[field]) {
        if (template.status === 'approved' && field === 'demoUrl') {
          continue;
        }
        changes.push({
          field,
          oldValue: template[field],
          newValue: data[field]
        });
      }
    }

    if (files?.thumbnail?.[0]) {
      data.thumbnail = files.thumbnail[0].filename;
    }
    if (files?.gallery) {
      data.gallery = files.gallery.map(f => f.filename);
    }
    if (files?.templateFile?.[0]) {
      data.templateFile = files.templateFile[0].filename;
      data.fileSize = files.templateFile[0].size;
    }

    if (changes.length > 0) {
      template.changeLog.push({
        editedAt: new Date(),
        editedBy: creatorId,
        changes,
        reason: data.editReason || 'Template updated by creator'
      });
    }

    Object.assign(template, data);
    await template.saveWithSlugRetry();

    eventBus.emit(EVENTS.TEMPLATE_UPDATED, {
      templateId: template._id.toString(),
      sellerId: creatorId,
      changedFields: changes.map(c => c.field),
    });

    return template;
  }

  async delete(id, creatorId) {
    const template = await Template.findOne({ _id: id, creatorId });
    if (!template) {
      throw new AppError('Template not found or unauthorized', 404);
    }

    await template.deleteOne();

    eventBus.emit(EVENTS.TEMPLATE_DELETED, {
      templateId: id,
      sellerId: creatorId,
    });

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

    const creatorProfile = await CreatorProfile.findOne({ userId: creatorId });
    if (!creatorProfile || creatorProfile.onboarding.status !== 'approved') {
      throw new AppError('Your creator account must be verified before submitting templates for review.', 403);
    }

    template.status = 'pending';
    await template.save();

    emitToAdmins('admin:template_submitted', {
      templateId: template._id.toString(),
      title: template.title,
      platform: template.platform,
      creatorId,
    });

    eventBus.emit(EVENTS.TEMPLATE_SUBMITTED, {
      templateId: template._id.toString(),
      sellerId: creatorId,
      title: template.title,
    });

    return template;
  }
}
