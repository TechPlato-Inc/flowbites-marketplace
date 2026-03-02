import { AdminQueryService } from './admin.queryService.js';
import { AdminWriteService } from './admin.writeService.js';

const queryService = new AdminQueryService();
const writeService = new AdminWriteService();

export class AdminController {
  async getPendingTemplates(req, res, next) {
    try {
      const templates = await queryService.getPendingTemplates();
      res.json({ success: true, data: templates });
    } catch (error) {
      next(error);
    }
  }

  async approveTemplate(req, res, next) {
    try {
      const template = await writeService.approveTemplate(req.params.id, req.user._id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async rejectTemplate(req, res, next) {
    try {
      const { reason } = req.body;
      const template = await writeService.rejectTemplate(req.params.id, req.user._id, reason);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async getAllTemplates(req, res, next) {
    try {
      const result = await queryService.getAllTemplates(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getTemplateById(req, res, next) {
    try {
      const template = await queryService.getTemplateById(req.params.id);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req, res, next) {
    try {
      const template = await writeService.updateTemplate(req.params.id, req.user._id, req.body);
      res.json({ success: true, data: template });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req, res, next) {
    try {
      const result = await writeService.deleteTemplate(req.params.id, req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async bulkAction(req, res, next) {
    try {
      const { action, templateIds, reason } = req.body;
      const result = await writeService.bulkAction(action, templateIds, req.user._id, reason);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await queryService.getTemplateStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async exportTemplates(req, res, next) {
    try {
      const csv = await queryService.exportTemplates(req.query);
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
      const creators = await queryService.getPendingCreators();
      res.json({ success: true, data: creators });
    } catch (error) {
      next(error);
    }
  }

  async getAllCreators(req, res, next) {
    try {
      const result = await queryService.getAllCreators(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorById(req, res, next) {
    try {
      const creator = await queryService.getCreatorById(req.params.id);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async approveCreator(req, res, next) {
    try {
      const creator = await writeService.approveCreator(req.params.id, req.user._id);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async rejectCreator(req, res, next) {
    try {
      const { reason } = req.body;
      const creator = await writeService.rejectCreator(req.params.id, req.user._id, reason);
      res.json({ success: true, data: creator });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await writeService.updateCategory(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const result = await writeService.deleteCategory(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const stats = await queryService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async reorderCategories(req, res, next) {
    try {
      const result = await writeService.reorderCategories(req.body.categories);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
