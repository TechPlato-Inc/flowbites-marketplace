import express from 'express';
import { DownloadController } from './download.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const downloadController = new DownloadController();

router.post('/token', authenticate, downloadController.generateToken);
router.get('/licenses/my-licenses', authenticate, downloadController.getMyLicenses);
router.get('/:token', downloadController.download);

export default router;
