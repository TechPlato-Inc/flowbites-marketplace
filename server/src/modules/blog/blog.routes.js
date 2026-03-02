import express from 'express';
import { BlogController } from './blog.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';
import { validate } from '../../middleware/validate.js';
import { createPostSchema, updatePostSchema } from './blog.validator.js';

const router = express.Router();
const blogController = new BlogController();

// Public routes (query validation handled inline in controller via listPostsQuerySchema)
router.get('/', blogController.getAll);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/featured', blogController.getFeatured);
router.get('/:slug', blogController.getBySlug);

// Authenticated routes (creators + admins with blog.create)
router.post('/', authenticate, can('blog.create'), upload.single('coverImage'), cloudinaryUpload, validate(createPostSchema), blogController.create);
router.patch('/:id', authenticate, can('blog.create'), validate(updatePostSchema), blogController.update);
router.delete('/:id', authenticate, can('blog.create'), blogController.delete);

// Admin routes
router.get('/admin/all', authenticate, can('blog.admin'), blogController.adminGetAll);
router.get('/admin/:id', authenticate, can('blog.admin'), blogController.adminGetById);

export default router;
