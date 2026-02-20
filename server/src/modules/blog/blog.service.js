import { BlogPost } from './blog.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';

export class BlogService {
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
    return post;
  }

  async getAll({ page = 1, limit = 12, category, tag, status, search, sort = 'newest' } = {}) {
    const query = {};

    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (status) query.status = status;
    else query.status = 'published'; // Default to published only

    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { excerpt: { $regex: safeSearch, $options: 'i' } },
        { tags: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const sortOptions = {
      newest: { publishedAt: -1 },
      oldest: { publishedAt: 1 },
      popular: { 'stats.views': -1 },
      title: { title: 1 },
    };

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort(sortOptions[sort] || sortOptions.newest)
        .skip(skip)
        .limit(limit)
        .select('-content')
        .populate('author', 'name avatar'),
      BlogPost.countDocuments(query),
    ]);

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getBySlug(slug) {
    const post = await BlogPost.findOne({ slug, status: 'published' })
      .populate('author', 'name avatar');

    if (!post) {
      throw new AppError('Blog post not found', 404);
    }

    // Increment views
    await BlogPost.findByIdAndUpdate(post._id, { $inc: { 'stats.views': 1 } });

    return post;
  }

  async getById(id) {
    const post = await BlogPost.findById(id).populate('author', 'name avatar');
    if (!post) throw new AppError('Blog post not found', 404);
    return post;
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
    return post;
  }

  async delete(id, userId, isAdmin = false) {
    const post = await BlogPost.findById(id);
    if (!post) throw new AppError('Blog post not found', 404);

    if (!isAdmin && post.author.toString() !== userId.toString()) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    await BlogPost.findByIdAndDelete(id);
  }

  async getCategories() {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    return categories.map(c => ({ name: c._id, count: c.count }));
  }

  async getTags() {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 },
    ]);
    return tags.map(t => ({ name: t._id, count: t.count }));
  }

  async getFeatured() {
    return BlogPost.find({ status: 'published', isFeatured: true })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select('-content')
      .populate('author', 'name avatar');
  }

  async getRelated(postId, category, limit = 3) {
    return BlogPost.find({
      _id: { $ne: postId },
      status: 'published',
      category,
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-content')
      .populate('author', 'name avatar');
  }

  // Admin: get all posts including drafts
  async adminGetAll({ page = 1, limit = 20, status, search } = {}) {
    const query = {};
    if (status) query.status = status;
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { authorName: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar'),
      BlogPost.countDocuments(query),
    ]);

    return {
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }
}
