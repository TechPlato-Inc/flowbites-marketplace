import { UIShotQueryService } from './uiShort.queryService.js';
import { UIShotWriteService } from './uiShort.writeService.js';

const queryService = new UIShotQueryService();
const writeService = new UIShotWriteService();

export class UIShotController {
  async create(req, res, next) {
    try {
      const shot = await writeService.create(req.user._id, req.body, req.file);
      res.status(201).json({ success: true, data: shot });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await queryService.getAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort: req.query.sort || 'recent',
        search: req.query.search,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await writeService.toggleLike(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleSave(req, res, next) {
    try {
      const result = await writeService.toggleSave(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminGetAll(req, res, next) {
    try {
      const result = await queryService.adminGetAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        creatorId: req.query.creatorId,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminDelete(req, res, next) {
    try {
      const result = await writeService.adminDelete(req.params.id, req.user._id, req.body.reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async adminTogglePublished(req, res, next) {
    try {
      const result = await writeService.adminTogglePublished(req.params.id, req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
