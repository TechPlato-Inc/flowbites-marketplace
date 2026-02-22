import express from 'express';
import { EarningsController } from './earnings.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const earningsController = new EarningsController();

// All routes require authenticated creator
router.use(authenticate, authorize('creator', 'admin'));

router.get('/summary', earningsController.getEarningsSummary);
router.get('/transactions', earningsController.getTransactions);

export default router;
