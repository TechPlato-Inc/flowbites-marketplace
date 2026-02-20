import { CategoryService } from './category.service.js';

const categoryService = new CategoryService();

export class CategoryController {
  async getCategories(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req, res, next) {
    try {
      const tags = await categoryService.getTags(req.query.limit);
      res.json({ success: true, data: tags });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) {
      next(error);
    }
  }
}
