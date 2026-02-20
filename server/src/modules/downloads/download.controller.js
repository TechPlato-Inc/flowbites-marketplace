import { DownloadService } from './download.service.js';

const downloadService = new DownloadService();

export class DownloadController {
  async generateToken(req, res, next) {
    try {
      const { templateId } = req.body;
      const result = await downloadService.generateDownloadToken(req.user._id, templateId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async download(req, res, next) {
    try {
      const { token } = req.params;
      const { filePath, fileName, originalName } = await downloadService.downloadFile(token);

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
      const licenses = await downloadService.getUserLicenses(req.user._id);
      res.json({ success: true, data: licenses });
    } catch (error) {
      next(error);
    }
  }
}
