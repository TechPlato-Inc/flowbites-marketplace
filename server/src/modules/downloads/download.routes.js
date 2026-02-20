import express from 'express';
import { DownloadController } from './download.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const downloadController = new DownloadController();

router.post('/token', authenticate, downloadController.generateToken);
router.get('/:token', downloadController.download);
router.get('/licenses/my-licenses', authenticate, downloadController.getMyLicenses);

export default router;
