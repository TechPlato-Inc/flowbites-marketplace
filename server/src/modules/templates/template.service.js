import { TemplateQueryService } from './template.queryService.js';
import { TemplateWriteService } from './template.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import TemplateQueryService or TemplateWriteService directly.
export class TemplateService {
  constructor() {
    this._query = new TemplateQueryService();
    this._write = new TemplateWriteService();
  }

  getAll(filters) { return this._query.getAll(filters); }
  getById(idOrSlug) { return this._query.getById(idOrSlug); }
  create(creatorId, data, files, isAdmin) { return this._write.create(creatorId, data, files, isAdmin); }
  update(id, creatorId, data, files) { return this._write.update(id, creatorId, data, files); }
  delete(id, creatorId) { return this._write.delete(id, creatorId); }
  submitForReview(id, creatorId) { return this._write.submitForReview(id, creatorId); }
}
