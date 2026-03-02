import { CategoryQueryService } from './category.queryService.js';
import { CategoryWriteService } from './category.writeService.js';
import { toCategoryDTO, toTagDTO } from './dto/category.dto.js';
import { listCategoriesQuerySchema, createCategorySchema } from './category.validator.js';

const categoryQueryService = new CategoryQueryService();
const categoryWriteService = new CategoryWriteService();

export class CategoryController {
  async getCategories(req, res, next) {
    try {
      const parsed = listCategoriesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid query parameters', details: parsed.error.issues });
      }
      const categories = await categoryQueryService.getAllCategories();
      res.json({ success: true, data: categories.map(toCategoryDTO) });
    } catch (error) {
      next(error);
    }
  }

  async getTags(req, res, next) {
    try {
      const tags = await categoryQueryService.getTags(req.query.limit);
      res.json({ success: true, data: tags.map(toTagDTO) });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const parsed = createCategorySchema.safeParse({ body: req.body });
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: 'Invalid request body', details: parsed.error.issues });
      }
      const category = await categoryWriteService.createCategory(parsed.data.body);
      res.status(201).json({ success: true, data: toCategoryDTO(category) });
    } catch (error) {
      next(error);
    }
  }
}
