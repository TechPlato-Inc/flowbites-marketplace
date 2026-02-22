import { OrderService } from './order.service.js';

const orderService = new OrderService();

export class OrderController {
  async create(req, res, next) {
    try {
      const { items } = req.body;
      const order = await orderService.createOrder(req.user._id, items, req.user.email);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async mockCheckout(req, res, next) {
    try {
      const { orderId } = req.body;
      const order = await orderService.mockCheckout(orderId, req.user._id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getOrdersByUser(req.user._id);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user._id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
