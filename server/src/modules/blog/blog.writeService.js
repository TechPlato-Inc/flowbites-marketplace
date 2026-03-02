import { BlogPost } from './blog.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { toBlogDetailDTO } from './dto/blogPost.dto.js';

export class BlogWriteService {
  async create(data, userId) {
    const existing = await BlogPost.findOne({ slug: data.slug });
    if (existing) {
      // Append random suffix to make slug unique
      data.slug = `${data.slug}-${Date.now().toString(36)}`;
    }

    const post = await BlogPost.create({
      ...data,
      author: userId,
    });

    const populated = await post.populate('author', 'name avatar');
    return toBlogDetailDTO(populated);
  }

  async update(id, data, userId) {
    const post = await BlogPost.findById(id);
    if (!post) throw new AppError('Blog post not found', 404);

    // Only author or admin can update
    if (post.author.toString() !== userId.toString()) {
      throw new AppError('Not authorized to update this post', 403);
    }

    // If publishing for the first time, set publishedAt
    if (data.status === 'published' && !post.publishedAt) {
      data.publishedAt = new Date();
    }

    Object.assign(post, data);
    await post.save();
    const populated = await post.populate('author', 'name avatar');
    return toBlogDetailDTO(populated);
  }

  async delete(id, userId, isAdmin = false) {
    const post = await BlogPost.findById(id);
    if (!post) throw new AppError('Blog post not found', 404);

    if (!isAdmin && post.author.toString() !== userId.toString()) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    await BlogPost.findByIdAndDelete(id);
  }
}
