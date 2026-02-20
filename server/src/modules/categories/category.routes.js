import express from 'express';
import { CategoryController } from './category.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const categoryController = new CategoryController();

router.get('/categories', categoryController.getCategories);
router.get('/tags', categoryController.getTags);
router.post('/categories', authenticate, authorize('admin'), categoryController.createCategory);

export default router;
