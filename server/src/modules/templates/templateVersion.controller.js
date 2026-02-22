import { TemplateVersionService } from './templateVersion.service.js';

const versionService = new TemplateVersionService();

export class TemplateVersionController {
  // POST /templates/:templateId/versions
  async publishVersion(req, res, next) {
    try {
      const data = await versionService.publishVersion(
        req.params.templateId,
        req.user._id,
        req.body
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /templates/:templateId/versions
  async getVersionHistory(req, res, next) {
    try {
      const data = await versionService.getVersionHistory(req.params.templateId, {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /templates/:templateId/versions/latest
  async getLatestVersion(req, res, next) {
    try {
      const data = await versionService.getLatestVersion(req.params.templateId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // GET /templates/:templateId/versions/:version
  async getVersion(req, res, next) {
    try {
      const data = await versionService.getVersion(req.params.templateId, req.params.version);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /templates/:templateId/versions/:version
  async deleteVersion(req, res, next) {
    try {
      const data = await versionService.deleteVersion(
        req.params.templateId,
        req.params.version,
        req.user._id
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
