import express from 'express';
import { ServiceController } from './service.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const serviceController = new ServiceController();

// Public: browse all service packages
router.get('/packages/browse', serviceController.getAllPackages);

// Creator: get my own packages (must come before :slug)
router.get('/packages/mine', authenticate, authorize('creator', 'admin'), serviceController.getCreatorPackages);

// Public: get single package by slug
router.get('/packages/:slug', serviceController.getPackageBySlug);

// Get packages by template ID (query param)
router.get('/packages', serviceController.getPackages);

// Creator: create a package
router.post('/packages', authenticate, authorize('creator', 'admin'), serviceController.createPackage);

// Generic customization request (buyer asks Flowbites to customize a template)
router.post('/request-customization', authenticate, serviceController.requestCustomization);

// Orders
router.post('/orders', authenticate, serviceController.createOrder);
router.get('/orders/my-orders', authenticate, serviceController.getMyOrders);
router.get('/orders/:id', authenticate, serviceController.getOrderById);
router.post('/orders/:id/messages', authenticate, serviceController.sendMessage);
router.patch('/orders/:id/status', authenticate, authorize('creator', 'admin'), serviceController.updateOrderStatus);
router.patch('/orders/:id/buyer-status', authenticate, serviceController.updateOrderStatusByBuyer);
router.post('/orders/:id/cancel', authenticate, serviceController.cancelOrder);
router.post('/orders/:id/dispute', authenticate, serviceController.openDispute);

// Admin: service order management
router.get('/admin/orders', authenticate, authorize('admin'), serviceController.getAllOrders);
router.get('/admin/creators', authenticate, authorize('admin'), serviceController.getAvailableCreators);
router.patch('/admin/orders/:id/reassign', authenticate, authorize('admin'), serviceController.reassignOrder);
router.patch('/admin/orders/:id/resolve-dispute', authenticate, authorize('admin'), serviceController.resolveDispute);

export default router;
