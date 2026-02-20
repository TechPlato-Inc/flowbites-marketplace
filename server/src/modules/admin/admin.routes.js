import express from 'express';
import { AdminController } from './admin.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const adminController = new AdminController();

router.use(authenticate, authorize('admin'));

// Static routes first (before :id param routes)
router.get('/templates/pending', adminController.getPendingTemplates);
router.get('/templates/stats', adminController.getStats);
router.get('/templates/export', adminController.exportTemplates);
router.post('/templates/bulk', adminController.bulkAction);
router.get('/templates', adminController.getAllTemplates);

// Parameterized template routes
router.get('/templates/:id', adminController.getTemplateById);
router.patch('/templates/:id', adminController.updateTemplate);
router.delete('/templates/:id', adminController.deleteTemplate);
router.post('/templates/:id/approve', adminController.approveTemplate);
router.post('/templates/:id/reject', adminController.rejectTemplate);

// Creator management (static routes first)
router.get('/creators/pending', adminController.getPendingCreators);
router.get('/creators', adminController.getAllCreators);
router.get('/creators/:id', adminController.getCreatorById);
router.post('/creators/:id/approve', adminController.approveCreator);
router.post('/creators/:id/reject', adminController.rejectCreator);

// Category management
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/reorder', adminController.reorderCategories);

export default router;
