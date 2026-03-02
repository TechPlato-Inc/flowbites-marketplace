import { BlogQueryService } from './blog.queryService.js';
import { BlogWriteService } from './blog.writeService.js';

// Backward-compatible facade — delegates to QueryService and WriteService.
// New code should import BlogQueryService or BlogWriteService directly.
export class BlogService {
  constructor() {
    this._query = new BlogQueryService();
    this._write = new BlogWriteService();
  }

  getAll(filters) { return this._query.getAll(filters); }
  getBySlug(slug) { return this._query.getBySlug(slug); }
  getById(id) { return this._query.getById(id); }
  getCategories() { return this._query.getCategories(); }
  getTags() { return this._query.getTags(); }
  getFeatured() { return this._query.getFeatured(); }
  getRelated(postId, category, limit) { return this._query.getRelated(postId, category, limit); }
  adminGetAll(filters) { return this._query.adminGetAll(filters); }
  create(data, userId) { return this._write.create(data, userId); }
  update(id, data, userId) { return this._write.update(id, data, userId); }
  delete(id, userId, isAdmin) { return this._write.delete(id, userId, isAdmin); }
}
