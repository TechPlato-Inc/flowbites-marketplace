import express from 'express';
import { OrderController } from './order.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const orderController = new OrderController();

router.post('/', authenticate, orderController.create);
router.post('/mock-checkout', authenticate, orderController.mockCheckout);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getById);

export default router;
