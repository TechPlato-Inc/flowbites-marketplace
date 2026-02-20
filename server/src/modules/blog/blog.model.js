import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 500,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Design', 'Webflow', 'Framer', 'Wix', 'No-Code', 'Business', 'Tutorials', 'Trends', 'SEO', 'Freelancing'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  authorRole: {
    type: String,
    default: 'Contributor',
  },
  coverImage: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: Date,
  readTime: {
    type: String,
    default: '5 min read',
  },
  metaTitle: {
    type: String,
    maxlength: 70,
  },
  metaDescription: {
    type: String,
    maxlength: 160,
  },
  stats: {
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for SEO and querying
// slug index already created by unique: true
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ 'stats.views': -1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });

// Auto-generate slug from title
blogPostSchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate read time from content
blogPostSchema.pre('save', function(next) {
  if (this.content) {
    const text = this.content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    this.readTime = `${minutes} min read`;
  }
  next();
});

export const BlogPost = mongoose.model('BlogPost', blogPostSchema);
