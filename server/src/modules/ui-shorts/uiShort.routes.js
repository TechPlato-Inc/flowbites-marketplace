import express from 'express';
import { UIShotController } from './uiShort.controller.js';
import { validate } from '../../middleware/validate.js';
import {
  createUiShortSchema,
  listUiShortsQuerySchema,
  adminListUiShortsQuerySchema,
  adminDeleteUiShortSchema,
} from './uiShort.validator.js';
import { authenticate, can } from '../../middleware/auth.js';
import { uploadShot } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';

const router = express.Router();
const uiShotController = new UIShotController();

// Public: list published shots
router.get('/', validate(listUiShortsQuerySchema), uiShotController.getAll);

// Authenticated: create a shot
router.post(
  '/',
  authenticate,
  can('content.manage_shots'),
  uploadShot,
  cloudinaryUpload,
  validate(createUiShortSchema),
  uiShotController.create
);

// Authenticated: toggle like / save
router.post('/:id/like', authenticate, uiShotController.toggleLike);
router.post('/:id/save', authenticate, uiShotController.toggleSave);

// Admin routes
router.get(
  '/admin/all',
  authenticate,
  can('content.manage_shots'),
  validate(adminListUiShortsQuerySchema),
  uiShotController.adminGetAll
);

router.delete(
  '/admin/:id',
  authenticate,
  can('content.manage_shots'),
  validate(adminDeleteUiShortSchema),
  uiShotController.adminDelete
);

router.patch(
  '/admin/:id/toggle-published',
  authenticate,
  can('content.manage_shots'),
  uiShotController.adminTogglePublished
);

export default router;
