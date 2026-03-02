import { Template } from '../templates/template.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { User } from '../users/user.model.js';
import { Category } from '../categories/category.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  sendTemplateApproved,
  sendTemplateRejected,
  sendCreatorApproved,
  sendCreatorRejected,
} from '../../services/email.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

export class AdminWriteService {
  async approveTemplate(templateId, adminId) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (template.status !== 'pending') {
      throw new AppError('Only pending templates can be approved', 400);
    }

    template.status = 'approved';
    template.moderatedBy = adminId;
    template.moderatedAt = new Date();
    await template.save();

    // Update creator stats
    await CreatorProfile.findByIdAndUpdate(template.creatorProfileId, {
      $inc: { 'stats.templateCount': 1 }
    });

    // Notify creator via email (non-blocking)
    this._notifyCreatorAboutTemplate(template, 'approved').catch(err =>
      console.error('Failed to send template approved email:', err)
    );

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.TEMPLATE_APPROVED, {
      templateId: templateId.toString(),
      creatorId: template.creatorId.toString(),
      templateTitle: template.title,
      adminId: adminId.toString(),
    });

    return template;
  }

  async rejectTemplate(templateId, adminId, reason) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (template.status !== 'pending') {
      throw new AppError('Only pending templates can be rejected', 400);
    }

    template.status = 'rejected';
    template.rejectionReason = reason;
    template.moderatedBy = adminId;
    template.moderatedAt = new Date();
    await template.save();

    // Notify creator via email (non-blocking)
    this._notifyCreatorAboutTemplate(template, 'rejected', reason).catch(err =>
      console.error('Failed to send template rejected email:', err)
    );

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.TEMPLATE_REJECTED, {
      templateId: templateId.toString(),
      creatorId: template.creatorId.toString(),
      templateTitle: template.title,
      adminId: adminId.toString(),
      reason,
    });

    return template;
  }

  async updateTemplate(templateId, adminId, updates) {
    const template = await Template.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);

    const allowed = [
      'price', 'category', 'tags', 'description', 'isFeatured',
      'madeByFlowbites', 'metaDescription', 'keywords', 'licenseType'
    ];
    for (const key of allowed) {
      if (updates[key] !== undefined) template[key] = updates[key];
    }

    template.moderatedBy = adminId;
    template.moderatedAt = new Date();
    await template.save();

    return template;
  }

  async deleteTemplate(templateId, adminId = null) {
    const template = await Template.findById(templateId);
    if (!template) throw new AppError('Template not found', 404);

    if (template.status === 'approved') {
      await CreatorProfile.findByIdAndUpdate(template.creatorProfileId, {
        $inc: { 'stats.templateCount': -1 }
      });
    }

    const templateTitle = template.title;
    await template.deleteOne();

    // Emit domain event — audit listener handles logging
    eventBus.emit(EVENTS.TEMPLATE_DELETED, {
      templateId: templateId.toString(),
      adminId: adminId ? adminId.toString() : null,
      templateTitle,
    });

    return { message: 'Template deleted' };
  }

  async bulkAction(action, templateIds, adminId, reason = '') {
    if (!templateIds || !Array.isArray(templateIds) || templateIds.length === 0) {
      throw new AppError('No template IDs provided', 400);
    }
    if (!action) throw new AppError('No action specified', 400);

    const results = { success: 0, failed: 0, errors: [] };

    for (const id of templateIds) {
      try {
        switch (action) {
          case 'approve':
            await this.approveTemplate(id, adminId);
            break;
          case 'reject':
            await this.rejectTemplate(id, adminId, reason);
            break;
          case 'delete':
            await this.deleteTemplate(id, adminId);
            break;
          case 'feature':
            await Template.findByIdAndUpdate(id, {
              isFeatured: true, moderatedBy: adminId, moderatedAt: new Date()
            });
            break;
          case 'unfeature':
            await Template.findByIdAndUpdate(id, {
              isFeatured: false, moderatedBy: adminId, moderatedAt: new Date()
            });
            break;
          default:
            throw new AppError(`Unknown action: ${action}`, 400);
        }
        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push({ id, error: err.message });
      }
    }

    return results;
  }

  // -- Creator management --

  async approveCreator(creatorId, adminId) {
    const creator = await CreatorProfile.findById(creatorId);
    if (!creator) throw new AppError('Creator not found', 404);

    if (creator.onboarding.status !== 'submitted') {
      throw new AppError('Only submitted applications can be approved', 400);
    }

    creator.onboarding.status = 'approved';
    creator.onboarding.reviewedAt = new Date();
    creator.isVerified = true;
    await creator.save();

    // Notify creator via email (non-blocking)
    User.findById(creator.userId).then(user => {
      if (user) sendCreatorApproved(user.email, creator.displayName);
    }).catch(err => console.error('Failed to send creator approved email:', err));

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.CREATOR_APPROVED, {
      creatorProfileId: creatorId.toString(),
      userId: creator.userId.toString(),
      creatorName: creator.displayName,
      adminId: adminId.toString(),
    });

    return creator;
  }

  async rejectCreator(creatorId, adminId, reason) {
    const creator = await CreatorProfile.findById(creatorId);
    if (!creator) throw new AppError('Creator not found', 404);

    if (creator.onboarding.status !== 'submitted') {
      throw new AppError('Only submitted applications can be rejected', 400);
    }

    creator.onboarding.status = 'rejected';
    creator.onboarding.rejectionReason = reason || '';
    creator.onboarding.reviewedAt = new Date();
    creator.isVerified = false;
    await creator.save();

    // Notify creator via email (non-blocking)
    User.findById(creator.userId).then(user => {
      if (user) sendCreatorRejected(user.email, creator.displayName, reason);
    }).catch(err => console.error('Failed to send creator rejected email:', err));

    // Emit domain event — listeners handle in-app notification + audit log
    eventBus.emit(EVENTS.CREATOR_REJECTED, {
      creatorProfileId: creatorId.toString(),
      userId: creator.userId.toString(),
      creatorName: creator.displayName,
      adminId: adminId.toString(),
      reason,
    });

    return creator;
  }

  // -- Category management --

  async updateCategory(categoryId, data) {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError('Category not found', 404);

    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const allowed = ['name', 'slug', 'description', 'icon', 'color', 'isActive', 'order'];
    for (const key of allowed) {
      if (data[key] !== undefined) category[key] = data[key];
    }

    await category.save();
    return category;
  }

  async deleteCategory(categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError('Category not found', 404);

    const templatesUsingCategory = await Template.countDocuments({ category: categoryId });
    if (templatesUsingCategory > 0) {
      throw new AppError(`Cannot delete: ${templatesUsingCategory} templates use this category`, 400);
    }

    await category.deleteOne();
    return { message: 'Category deleted' };
  }

  async reorderCategories(orderedIds) {
    if (!Array.isArray(orderedIds)) throw new AppError('Expected array of categories', 400);

    const ops = orderedIds.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } }
      }
    }));
    await Category.bulkWrite(ops);
    return { message: 'Categories reordered' };
  }

  async _notifyCreatorAboutTemplate(template, status, reason) {
    const creator = await CreatorProfile.findById(template.creatorProfileId);
    if (!creator) return;

    const user = await User.findById(creator.userId);
    if (!user) return;

    if (status === 'approved') {
      await sendTemplateApproved(user.email, creator.displayName, template.title);
    } else if (status === 'rejected') {
      await sendTemplateRejected(user.email, creator.displayName, template.title, reason);
    }
  }
}
