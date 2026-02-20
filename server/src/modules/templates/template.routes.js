import express from 'express';
import { TemplateController } from './template.controller.js';
import { validate } from '../../middleware/validate.js';
import { createTemplateSchema, updateTemplateSchema } from './template.validator.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadTemplate } from '../../middleware/upload.js';
import { cloudinaryUpload } from '../../middleware/cloudinaryUpload.js';

const router = express.Router();
const templateController = new TemplateController();

// Creator's own templates (must be before /:id)
router.get(
  '/my-templates',
  authenticate,
  authorize('creator', 'admin'),
  templateController.getMyTemplates
);

// Public routes
router.get('/', templateController.getAll);
router.get('/:id', templateController.getById);

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
