import { License, DownloadToken } from './license.model.js';
import { Template } from '../templates/template.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sanitizeFilename } from '../../lib/utils.js';
import path from 'path';
import fs from 'fs/promises';

export class DownloadService {
  async generateDownloadToken(userId, templateId) {
    // Check if user has license
    const license = await License.findOne({
      buyerId: userId,
      templateId,
      isActive: true
    });

    if (!license) {
      throw new AppError('No license found for this template', 403);
    }

    if (license.downloadCount >= license.maxDownloads) {
      throw new AppError('Maximum accesses reached for this license', 403);
    }

    // Update license access count
    license.downloadCount += 1;
    license.lastDownloadedAt = new Date();
    await license.save();

    // Look up the template to determine delivery type
    const template = await Template.findById(templateId);
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    // For clone_link and remix_link, return the delivery URL directly (no token needed)
    if (['clone_link', 'remix_link'].includes(template.deliveryType)) {
      // Update template stats
      await Template.findByIdAndUpdate(templateId, {
        $inc: { 'stats.downloads': 1 }
      });

      return {
        deliveryType: template.deliveryType,
        deliveryUrl: template.deliveryUrl,
        platform: template.platform
      };
    }

    // For file_download, create a download token
    const expiresAt = new Date(Date.now() + parseInt(process.env.DOWNLOAD_TOKEN_EXPIRES_MINUTES || 60) * 60 * 1000);

    const downloadToken = await DownloadToken.create({
      licenseId: license._id,
      templateId,
      userId,
      expiresAt
    });

    return {
      token: downloadToken.token,
      expiresAt,
      deliveryType: 'file_download',
      downloadUrl: `/api/downloads/${downloadToken.token}`
    };
  }

  async downloadFile(token) {
    const downloadToken = await DownloadToken.findOne({ token })
      .populate('templateId')
      .populate('licenseId');

    if (!downloadToken) {
      throw new AppError('Invalid download token', 404);
    }

    if (downloadToken.used) {
      throw new AppError('Download token already used', 400);
    }

    if (downloadToken.expiresAt < new Date()) {
      throw new AppError('Download token expired', 400);
    }

    const template = downloadToken.templateId;

    if (!template.templateFile) {
      throw new AppError('No file available for this template', 400);
    }

    // Sanitize filename to prevent path traversal
    const safeFileName = sanitizeFilename(path.basename(template.templateFile));
    if (!safeFileName) {
      throw new AppError('Invalid file name', 400);
    }
    
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'templates');
    const filePath = path.join(uploadDir, safeFileName);
    const resolvedPath = path.resolve(filePath);

    // Verify the resolved path is strictly within the upload directory
    if (!resolvedPath.startsWith(path.resolve(uploadDir))) {
      throw new AppError('Invalid file path', 400);
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      throw new AppError('File not found', 404);
    }

    // Mark token as used
    downloadToken.used = true;
    downloadToken.usedAt = new Date();
    await downloadToken.save();

    // Update template stats
    await Template.findByIdAndUpdate(template._id, {
      $inc: { 'stats.downloads': 1 }
    });

    return {
      filePath,
      fileName: template.templateFile,
      originalName: template.title
    };
  }

  async getUserLicenses(userId) {
    const licenses = await License.find({ buyerId: userId, isActive: true })
      .populate('templateId', 'title thumbnail price platform deliveryType deliveryUrl templateFile')
      .populate('orderId', 'orderNumber paidAt')
      .sort({ createdAt: -1 });

    return licenses;
  }
}
