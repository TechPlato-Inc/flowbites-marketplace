import express from 'express';
import { BlogController } from './blog.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';
import { validate } from '../../middleware/validate.js';
import { createBlogSchema, updateBlogSchema } from './blog.validator.js';

const router = express.Router();
const blogController = new BlogController();

// Public routes
router.get('/', blogController.getAll);
router.get('/categories', blogController.getCategories);
router.get('/tags', blogController.getTags);
router.get('/featured', blogController.getFeatured);
router.get('/:slug', blogController.getBySlug);

// Authenticated routes (admin/creator)
router.post('/', authenticate, authorize('admin', 'creator'), upload.single('coverImage'), cloudinaryUpload, validate(createBlogSchema), blogController.create);
router.patch('/:id', authenticate, authorize('admin', 'creator'), validate(updateBlogSchema), blogController.update);
router.delete('/:id', authenticate, authorize('admin', 'creator'), blogController.delete);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), blogController.adminGetAll);
router.get('/admin/:id', authenticate, authorize('admin'), blogController.adminGetById);

export default router;
