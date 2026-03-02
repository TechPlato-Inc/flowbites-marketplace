import { OrderQueryService } from './order.queryService.js';
import { OrderWriteService } from './order.writeService.js';
import { toOrderDetailDTO } from './dto/orderSummary.dto.js';
import { listOrdersQuerySchema } from './order.validator.js';

const queryService = new OrderQueryService();
const writeService = new OrderWriteService();

export class OrderController {
  async create(req, res, next) {
    try {
      const { items } = req.body;
      const order = await writeService.createOrder(req.user._id, items, req.user.email);
      res.status(201).json({ success: true, data: toOrderDetailDTO(order) });
    } catch (error) {
      next(error);
    }
  }

  async mockCheckout(req, res, next) {
    try {
      const { orderId } = req.body;
      const order = await writeService.mockCheckout(orderId, req.user._id);
      res.json({ success: true, data: toOrderDetailDTO(order) });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const parsed = listOrdersQuerySchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};
      const result = await queryService.getOrdersByUser(req.user._id, filters);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await queryService.getOrderById(req.params.id, req.user._id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }
}
