import express from 'express';
import { EarningsController } from './earnings.controller.js';
import { authenticate, can } from '../../middleware/auth.js';

const router = express.Router();
const earningsController = new EarningsController();

// All routes require earnings.view_own permission
router.use(authenticate, can('earnings.view_own'));

router.get('/summary', earningsController.getEarningsSummary);
router.get('/transactions', earningsController.getTransactions);

export default router;
