import { BlogQueryService } from './blog.queryService.js';
import { BlogWriteService } from './blog.writeService.js';
import { rbacService } from '../rbac/rbac.service.js';
import { listPostsQuerySchema } from './blog.validator.js';

const queryService = new BlogQueryService();
const writeService = new BlogWriteService();

export class BlogController {
  // Public endpoints
  async getAll(req, res, next) {
    try {
      const parsed = listPostsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parsed.error.issues,
        });
      }

      const data = await queryService.getAll(parsed.data);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const post = await queryService.getBySlug(req.params.slug);
      const related = await queryService.getRelated(post._id, post.category);
      res.json({ success: true, data: { post, related } });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const data = await queryService.getCategories();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req, res, next) {
    try {
      const data = await queryService.getTags();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getFeatured(req, res, next) {
    try {
      const data = await queryService.getFeatured();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // Authenticated endpoints
  async create(req, res, next) {
    try {
      const post = await writeService.create(
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
      const post = await writeService.update(req.params.id, req.body, req.user._id);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const isAdmin = rbacService.hasPermission(req.user.permissions, 'blog.admin');
      await writeService.delete(req.params.id, req.user._id, isAdmin);
      res.json({ success: true, message: 'Blog post deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async adminGetAll(req, res, next) {
    try {
      const parsed = listPostsQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const data = await queryService.adminGetAll(filters);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async adminGetById(req, res, next) {
    try {
      const post = await queryService.getById(req.params.id);
      res.json({ success: true, data: post });
    } catch (error) {
      next(error);
    }
  }
}
