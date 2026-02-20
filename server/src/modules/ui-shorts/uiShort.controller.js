import { UIShotService } from './uiShort.service.js';

const uiShotService = new UIShotService();

export class UIShotController {
  async create(req, res, next) {
    try {
      const shot = await uiShotService.create(req.user._id, req.body, req.file);
      res.status(201).json({ success: true, data: shot });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await uiShotService.getAll(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleLike(req, res, next) {
    try {
      const result = await uiShotService.toggleLike(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async toggleSave(req, res, next) {
    try {
      const result = await uiShotService.toggleSave(req.user._id, req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
