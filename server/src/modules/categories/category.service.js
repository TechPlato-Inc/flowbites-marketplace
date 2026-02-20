import { Category, Tag } from './category.model.js';
import slugify from 'slugify';

export class CategoryService {
  async createCategory(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const category = await Category.create({ ...data, slug });
    return category;
  }

  async getAllCategories() {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    return categories;
  }

  async createTag(name) {
    const slug = slugify(name, { lower: true, strict: true });

    let tag = await Tag.findOne({ slug });
    if (!tag) {
      tag = await Tag.create({ name: name.toLowerCase(), slug });
    }

    return tag;
  }

  async getTags(limit = 50) {
    const tags = await Tag.find().sort({ usageCount: -1 }).limit(limit);
    return tags;
  }
}
