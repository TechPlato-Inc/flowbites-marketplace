import { Category, Tag } from './category.model.js';

export class CategoryQueryService {
  async getAllCategories() {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    return categories;
  }

  async getTags(limit = 50) {
    const tags = await Tag.find().sort({ usageCount: -1 }).limit(limit);
    return tags;
  }
}
