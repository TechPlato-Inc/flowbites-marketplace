import express from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { z } from 'zod';
import {
  listTemplatesQuerySchema,
  listCreatorsQuerySchema,
  rejectTemplateSchema,
  bulkActionSchema,
  updateTemplateSchema,
  rejectCreatorSchema,
} from './admin.validator.js';

const router = express.Router();
const adminController = new AdminController();

// All admin routes require authentication
router.use(authenticate);

// Dashboard overview stats
router.get('/dashboard-stats', can('dashboard.admin'), adminController.getDashboardStats);

// Template management
router.get('/templates/pending', can('templates.view_all'), adminController.getPendingTemplates);
router.get('/templates/stats', can('templates.view_all'), adminController.getStats);
router.get('/templates/export', can('templates.view_all'), adminController.exportTemplates);
router.post('/templates/bulk', can('templates.approve'), validate(bulkActionSchema), adminController.bulkAction);
router.get('/templates', can('templates.view_all'), validate(z.object({ query: listTemplatesQuerySchema })), adminController.getAllTemplates);

// Parameterized template routes
router.get('/templates/:id', can('templates.view_all'), adminController.getTemplateById);
router.patch('/templates/:id', can('templates.approve'), validate(updateTemplateSchema), adminController.updateTemplate);
router.delete('/templates/:id', can('templates.delete'), adminController.deleteTemplate);
router.post('/templates/:id/approve', can('templates.approve'), adminController.approveTemplate);
router.post('/templates/:id/reject', can('templates.approve'), validate(rejectTemplateSchema), adminController.rejectTemplate);

// Creator management
router.get('/creators/pending', can('creators.admin'), adminController.getPendingCreators);
router.get('/creators', can('creators.admin'), validate(z.object({ query: listCreatorsQuerySchema })), adminController.getAllCreators);
router.get('/creators/:id', can('creators.admin'), adminController.getCreatorById);
router.post('/creators/:id/approve', can('creators.admin'), adminController.approveCreator);
router.post('/creators/:id/reject', can('creators.admin'), validate(rejectCreatorSchema), adminController.rejectCreator);

// Category management
router.patch('/categories/:id', can('dashboard.admin'), adminController.updateCategory);
router.delete('/categories/:id', can('dashboard.admin'), adminController.deleteCategory);
router.post('/categories/reorder', can('dashboard.admin'), adminController.reorderCategories);

export default router;
