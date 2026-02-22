import express from 'express';
import { TemplateController } from './template.controller.js';
import { validate } from '../../middleware/validate.js';
import { createTemplateSchema, updateTemplateSchema } from './template.validator.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadTemplate } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';
import { cacheResponse } from '../../middleware/cache.js';

const router = express.Router();
const templateController = new TemplateController();

// Creator's own templates (must be before /:id)
router.get(
  '/my-templates',
  authenticate,
  authorize('creator', 'admin'),
  templateController.getMyTemplates
);

// Public routes (cached for 60s for listing, 30s for detail)
router.get('/', cacheResponse(60), templateController.getAll);
router.get('/:id', cacheResponse(30), templateController.getById);

// Creator routes
router.post(
  '/',
  authenticate,
  authorize('creator', 'admin'),
  uploadTemplate,
  cloudinaryUpload,
  validate(createTemplateSchema),
  templateController.create
);

router.patch(
  '/:id',
  authenticate,
  authorize('creator', 'admin'),
  uploadTemplate,
  cloudinaryUpload,
  validate(updateTemplateSchema),
  templateController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('creator', 'admin'),
  templateController.delete
);

router.post(
  '/:id/submit',
  authenticate,
  authorize('creator', 'admin'),
  templateController.submit
);

export default router;
