import express from 'express';
import { TemplateController } from './template.controller.js';
import { validate } from '../../middleware/validate.js';
import { createTemplateSchema, updateTemplateSchema } from './template.validator.js';
import { authenticate, can } from '../../middleware/auth.js';
import { uploadTemplate } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';
import { cacheResponse } from '../../middleware/cache.js';

const router = express.Router();
const templateController = new TemplateController();

// Creator's own templates (must be before /:id)
router.get(
  '/my-templates',
  authenticate,
  can('templates.create'),
  templateController.getMyTemplates
);

// Public routes (cached for 60s for listing, 30s for detail)
router.get('/', cacheResponse(60), templateController.getAll);
router.get('/:id', cacheResponse(30), templateController.getById);

// View tracking (not cached, deduplicated by IP)
router.post('/:id/view', templateController.trackView);

// Creator routes
router.post(
  '/',
  authenticate,
  can('templates.create'),
  uploadTemplate,
  cloudinaryUpload,
  validate(createTemplateSchema),
  templateController.create
);

router.patch(
  '/:id',
  authenticate,
  can('templates.create'),
  uploadTemplate,
  cloudinaryUpload,
  validate(updateTemplateSchema),
  templateController.update
);

router.delete(
  '/:id',
  authenticate,
  can('templates.create'),
  templateController.delete
);

router.post(
  '/:id/submit',
  authenticate,
  can('templates.create'),
  templateController.submit
);

export default router;
