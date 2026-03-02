import express from 'express';
import { TemplateVersionController } from './templateVersion.controller.js';
import { authenticate, can } from '../../middleware/auth.js';

const router = express.Router();
const versionController = new TemplateVersionController();

// Public: view version history for any template
router.get('/:templateId/versions', versionController.getVersionHistory);
router.get('/:templateId/versions/latest', versionController.getLatestVersion);
router.get('/:templateId/versions/:version', versionController.getVersion);

// Creator: publish & delete versions
router.post(
  '/:templateId/versions',
  authenticate,
  can('templates.create'),
  versionController.publishVersion
);

router.delete(
  '/:templateId/versions/:version',
  authenticate,
  can('templates.create'),
  versionController.deleteVersion
);

export default router;
