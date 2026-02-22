import { TemplateVersion } from './templateVersion.model.js';
import { Template } from './template.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { NotificationService } from '../notifications/notification.service.js';

const notificationService = new NotificationService();

export class TemplateVersionService {
  async publishVersion(templateId, publishedBy, data) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // Only the template creator or an admin can publish versions
    if (template.creatorId.toString() !== publishedBy.toString()) {
      throw new AppError('Not authorized to publish versions for this template', 403);
    }

    // Check for duplicate version
    const existing = await TemplateVersion.findOne({ templateId, version: data.version });
    if (existing) {
      throw new AppError(`Version ${data.version} already exists for this template`, 409);
    }

    const version = await TemplateVersion.create({
      templateId,
      version: data.version,
      releaseNotes: data.releaseNotes,
      changes: data.changes || [],
      templateFile: data.templateFile,
      fileSize: data.fileSize,
      publishedBy,
    });

    // Update the template's current version
    template.version = data.version;
    await template.save();

    return version;
  }

  async getVersionHistory(templateId, { page = 1, limit = 10 } = {}) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    const skip = (page - 1) * limit;

    const [versions, total] = await Promise.all([
      TemplateVersion.find({ templateId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('publishedBy', 'name'),
      TemplateVersion.countDocuments({ templateId }),
    ]);

    return {
      versions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getVersion(templateId, version) {
    const versionDoc = await TemplateVersion.findOne({ templateId, version })
      .populate('publishedBy', 'name');

    if (!versionDoc) {
      throw new AppError('Version not found', 404);
    }

    return versionDoc;
  }

  async getLatestVersion(templateId) {
    const version = await TemplateVersion.findOne({ templateId })
      .sort({ createdAt: -1 })
      .populate('publishedBy', 'name');

    return version;
  }

  async deleteVersion(templateId, version, userId) {
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (template.creatorId.toString() !== userId.toString()) {
      throw new AppError('Not authorized', 403);
    }

    const versionDoc = await TemplateVersion.findOneAndDelete({ templateId, version });
    if (!versionDoc) {
      throw new AppError('Version not found', 404);
    }

    // If we deleted the current version, set template version to the previous one
    if (template.version === version) {
      const latest = await TemplateVersion.findOne({ templateId }).sort({ createdAt: -1 });
      template.version = latest ? latest.version : '1.0.0';
      await template.save();
    }

    return { message: 'Version deleted' };
  }
}
