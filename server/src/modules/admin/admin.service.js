import { AdminQueryService } from './admin.queryService.js';
import { AdminWriteService } from './admin.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import AdminQueryService or AdminWriteService directly.
export class AdminService {
  constructor() {
    this._query = new AdminQueryService();
    this._write = new AdminWriteService();
  }

  // -- Query (read) operations --
  getPendingTemplates() { return this._query.getPendingTemplates(); }
  getAllTemplates(filters) { return this._query.getAllTemplates(filters); }
  getTemplateById(templateId) { return this._query.getTemplateById(templateId); }
  getTemplateStats() { return this._query.getTemplateStats(); }
  exportTemplates(filters) { return this._query.exportTemplates(filters); }
  getPendingCreators() { return this._query.getPendingCreators(); }
  getAllCreators(filters) { return this._query.getAllCreators(filters); }
  getCreatorById(creatorId) { return this._query.getCreatorById(creatorId); }
  getDashboardStats() { return this._query.getDashboardStats(); }

  // -- Write (mutation) operations --
  approveTemplate(templateId, adminId) { return this._write.approveTemplate(templateId, adminId); }
  rejectTemplate(templateId, adminId, reason) { return this._write.rejectTemplate(templateId, adminId, reason); }
  updateTemplate(templateId, adminId, updates) { return this._write.updateTemplate(templateId, adminId, updates); }
  deleteTemplate(templateId) { return this._write.deleteTemplate(templateId); }
  bulkAction(action, templateIds, adminId, reason) { return this._write.bulkAction(action, templateIds, adminId, reason); }
  approveCreator(creatorId, adminId) { return this._write.approveCreator(creatorId, adminId); }
  rejectCreator(creatorId, adminId, reason) { return this._write.rejectCreator(creatorId, adminId, reason); }
  updateCategory(categoryId, data) { return this._write.updateCategory(categoryId, data); }
  deleteCategory(categoryId) { return this._write.deleteCategory(categoryId); }
  reorderCategories(orderedIds) { return this._write.reorderCategories(orderedIds); }

  // Private helper (exposed for backward compat, delegates to write service)
  _notifyCreatorAboutTemplate(template, status, reason) {
    return this._write._notifyCreatorAboutTemplate(template, status, reason);
  }
}
