import express from 'express';
import { UserManagementController } from './userManagement.controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();
const userManagementController = new UserManagementController();

// All routes require admin authentication
router.use(authenticate, authorize('admin'));

router.get('/stats', userManagementController.getUserStats);
router.get('/', userManagementController.getUsers);
router.get('/:id', userManagementController.getUserById);
router.post('/:id/ban', userManagementController.banUser);
router.post('/:id/unban', userManagementController.unbanUser);
router.patch('/:id/role', userManagementController.changeRole);

export default router;
