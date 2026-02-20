import { TemplateService } from './template.service.js';

const templateService = new TemplateService();

export class TemplateController {
  async create(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      const template = await templateService.create(req.user._id, req.body, req.files, isAdmin);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await templateService.getAll(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMyTemplates(req, res, next) {
    try {
      const result = await templateService.getAll({ creatorId: req.user._id, ...req.query });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const template = await templateService.getById(req.params.id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const template = await templateService.update(req.params.id, req.user._id, req.body, req.files || {});
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await templateService.delete(req.params.id, req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submit(req, res, next) {
    try {
      const template = await templateService.submitForReview(req.params.id, req.user._id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }
}
