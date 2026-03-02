import express from 'express';
import { DownloadController } from './download.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { downloadRequestSchema, downloadTokenParamSchema } from './download.validator.js';

const router = express.Router();
const downloadController = new DownloadController();

router.post('/token', authenticate, validate(downloadRequestSchema), downloadController.generateToken);
router.get('/licenses/my-licenses', authenticate, downloadController.getMyLicenses);
router.get('/:token', validate(downloadTokenParamSchema), downloadController.download);

export default router;
