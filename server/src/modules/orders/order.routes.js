import express from 'express';
import { OrderController } from './order.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createOrderSchema, mockCheckoutSchema } from './order.validator.js';

const router = express.Router();
const orderController = new OrderController();

router.post('/', authenticate, validate(createOrderSchema), orderController.create);
router.post('/mock-checkout', authenticate, validate(mockCheckoutSchema), orderController.mockCheckout);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getById);

export default router;
