import { BlogService } from './blog.service.js';

const blogService = new BlogService();

export class BlogController {
  // Public endpoints
  async getAll(req, res, next) {
    try {
      const data = await blogService.getAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12,
        category: req.query.category,
        tag: req.query.tag,
        search: req.query.search || req.query.q,
        sort: req.query.sort,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const post = await blogService.getBySlug(req.params.slug);
      const related = await blogService.getRelated(post._id, post.category);
      res.json({ success: true, data: { post, related } });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const data = await blogService.getCategories();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req, res, next) {
    try {
      const data = await blogService.getTags();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req, res, next) {
    try {
      const data = await blogService.getFeatured();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Authenticated endpoints
  async create(req, res, next) {
    try {
      const post = await blogService.create(
        {
          ...req.body,
          authorName: req.user.name,
          coverImage: req.file?.filename,
        },
        req.user._id
      );
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const post = await blogService.update(req.params.id, req.body, req.user._id);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const isAdmin = req.user.role === 'admin';
      await blogService.delete(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, message: 'Blog post deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async adminGetAll(req, res, next) {
    try {
      const data = await blogService.adminGetAll({
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        status: req.query.status,
        search: req.query.search,
      });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async adminGetById(req, res, next) {
    try {
      const post = await blogService.getById(req.params.id);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
}
