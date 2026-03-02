import { Category, Tag } from './category.model.js';
import slugify from 'slugify';

export class CategoryWriteService {
  async createCategory(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const category = await Category.create({ ...data, slug });
    return category;
  }

  async createTag(name) {
    const slug = slugify(name, { lower: true, strict: true });

    let tag = await Tag.findOne({ slug });
    if (!tag) {
      tag = await Tag.create({ name: name.toLowerCase(), slug });
    }

    return tag;
  }
}
