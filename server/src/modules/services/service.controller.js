import { ServiceService } from './service.service.js';

const serviceService = new ServiceService();

export class ServiceController {
  async createPackage(req, res, next) {
    try {
      const pkg = await serviceService.createPackage(req.user._id, req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (error) {
      next(error);
    }
  }

  async getAllPackages(req, res, next) {
    try {
      const result = await serviceService.getAllPackages(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getPackageBySlug(req, res, next) {
    try {
      const pkg = await serviceService.getPackageBySlug(req.params.slug);
      res.json({ success: true, data: pkg });
    } catch (error) {
      next(error);
    }
  }

  async getPackages(req, res, next) {
    try {
      const { templateId } = req.query;
      const packages = await serviceService.getPackagesByTemplate(templateId);
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  async getCreatorPackages(req, res, next) {
    try {
      const packages = await serviceService.getCreatorPackages(req.user._id);
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const { packageId, requirements, attachments } = req.body;
      const order = await serviceService.createServiceOrder(req.user._id, packageId, requirements, attachments);
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await serviceService.getOrderById(req.params.id, req.user._id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { message } = req.body;
      const order = await serviceService.sendMessage(req.params.id, req.user._id, message);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status, ...data } = req.body;
      const order = await serviceService.updateOrderStatus(req.params.id, req.user._id, status, data);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatusByBuyer(req, res, next) {
    try {
      const { status } = req.body;
      const order = await serviceService.updateOrderStatusByBuyer(req.params.id, req.user._id, status);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      let orders;
      if (req.user.role === 'creator' || req.user.role === 'admin') {
        orders = await serviceService.getCreatorOrders(req.user._id, req.query.status);
      } else {
        orders = await serviceService.getBuyerOrders(req.user._id);
      }
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  // Generic customization request (buyer → Flowbites admin)
  async requestCustomization(req, res, next) {
    try {
      const { templateId, requirements, attachments } = req.body;
      const order = await serviceService.createGenericCustomizationRequest(
        req.user._id, templateId, requirements, attachments
      );
      res.status(201).json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // Admin: get all service orders
  async getAllOrders(req, res, next) {
    try {
      const orders = await serviceService.getAllServiceOrders(req.query);
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  // Cancel order (buyer or creator)
  async cancelOrder(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await serviceService.cancelOrder(req.params.id, req.user._id, reason);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // Buyer: open dispute
  async openDispute(req, res, next) {
    try {
      const { reason } = req.body;
      const order = await serviceService.openDispute(req.params.id, req.user._id, reason);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // Admin: reassign order to a creator
  async reassignOrder(req, res, next) {
    try {
      const { assignedCreatorId, price } = req.body;
      const order = await serviceService.reassignOrder(req.params.id, assignedCreatorId, req.user._id, price);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // Admin: resolve dispute
  async resolveDispute(req, res, next) {
    try {
      const { resolution, outcome } = req.body;
      const order = await serviceService.resolveDispute(req.params.id, req.user._id, resolution, outcome);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  // Admin: get list of available creators
  async getAvailableCreators(req, res, next) {
    try {
      const creators = await serviceService.getAvailableCreators();
      res.json({ success: true, data: creators });
    } catch (error) {
      next(error);
    }
  }
}
