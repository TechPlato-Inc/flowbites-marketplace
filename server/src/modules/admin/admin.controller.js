import { AdminService } from './admin.service.js';

const adminService = new AdminService();

export class AdminController {
  async getPendingTemplates(req, res, next) {
    try {
      const templates = await adminService.getPendingTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  async approveTemplate(req, res, next) {
    try {
      const template = await adminService.approveTemplate(req.params.id, req.user._id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async rejectTemplate(req, res, next) {
    try {
      const { reason } = req.body;
      const template = await adminService.rejectTemplate(req.params.id, req.user._id, reason);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async getAllTemplates(req, res, next) {
    try {
      const result = await adminService.getAllTemplates(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      const template = await adminService.getTemplateById(req.params.id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const template = await adminService.updateTemplate(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const result = await adminService.deleteTemplate(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async bulkAction(req, res, next) {
    try {
      const { action, templateIds, reason } = req.body;
      const result = await adminService.bulkAction(action, templateIds, req.user._id, reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await adminService.getTemplateStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async exportTemplates(req, res, next) {
    try {
      const csv = await adminService.exportTemplates(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=templates-export.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  // ── Creator management ──

  async getPendingCreators(req, res, next) {
    try {
      const creators = await adminService.getPendingCreators();
      res.json({ success: true, data: creators });
    } catch (error) {
      next(error);
    }
  }

  async getAllCreators(req, res, next) {
    try {
      const result = await adminService.getAllCreators(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorById(req, res, next) {
    try {
      const creator = await adminService.getCreatorById(req.params.id);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async approveCreator(req, res, next) {
    try {
      const creator = await adminService.approveCreator(req.params.id, req.user._id);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async rejectCreator(req, res, next) {
    try {
      const { reason } = req.body;
      const creator = await adminService.rejectCreator(req.params.id, req.user._id, reason);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await adminService.updateCategory(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await adminService.deleteCategory(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async reorderCategories(req, res, next) {
    try {
      const result = await adminService.reorderCategories(req.body.categories);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
