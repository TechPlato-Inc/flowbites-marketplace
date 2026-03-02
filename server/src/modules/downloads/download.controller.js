import { DownloadQueryService } from './download.queryService.js';
import { DownloadWriteService } from './download.writeService.js';
import { AnalyticsService } from '../analytics/analytics.service.js';
import { toLicenseDTO } from './dto/license.dto.js';
import { eventBus, EVENTS } from '../../shared/eventBus.js';

const queryService = new DownloadQueryService();
const writeService = new DownloadWriteService();
const analyticsService = new AnalyticsService();

export class DownloadController {
  async generateToken(req, res, next) {
    try {
      const { templateId } = req.body;
      const userId = req.user._id;
      const result = await writeService.generateDownloadToken(userId, templateId);

      // Emit download started event
      eventBus.emit(EVENTS.DOWNLOAD_STARTED, {
        userId,
        templateId,
        licenseId: result.licenseId || null,
      });

      // Track download event (non-blocking)
      analyticsService.trackEvent('download', userId, {
        templateId,
      }, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      }).catch(() => {});

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { token } = req.params;
      const { filePath, fileName, originalName } = await writeService.downloadFile(token);

      res.download(filePath, `${originalName}.zip`, (err) => {
        if (err) {
          next(err);
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLicenses(req, res, next) {
    try {
      const licenses = await queryService.getUserLicenses(req.user._id);
      res.json({ success: true, data: licenses.map(toLicenseDTO) });
    } catch (error) {
      next(error);
    }
  }
}
