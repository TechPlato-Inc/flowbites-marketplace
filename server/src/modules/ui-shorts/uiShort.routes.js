import express from 'express';
import { UIShotController } from './uiShort.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadShot } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';

const router = express.Router();
const uiShotController = new UIShotController();

router.get('/', uiShotController.getAll);
router.post('/', authenticate, authorize('creator', 'admin'), uploadShot, cloudinaryUpload, uiShotController.create);
router.post('/:id/like', authenticate, uiShotController.toggleLike);
router.post('/:id/save', authenticate, uiShotController.toggleSave);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), uiShotController.adminGetAll);
router.delete('/admin/:id', authenticate, authorize('admin'), uiShotController.adminDelete);
router.patch('/admin/:id/toggle-published', authenticate, authorize('admin'), uiShotController.adminTogglePublished);

export default router;
