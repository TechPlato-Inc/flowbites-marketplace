import express from 'express';
import { UserManagementController } from './userManagement.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { assignRoleSchema } from '../rbac/rbac.validator.js';

const router = express.Router();
const userManagementController = new UserManagementController();

// All routes require authentication
router.use(authenticate);

router.get('/stats', can('users.view'), userManagementController.getUserStats);
router.get('/', can('users.view'), userManagementController.getUsers);
router.get('/:id', can('users.view'), userManagementController.getUserById);
router.post('/:id/ban', can('users.ban'), userManagementController.banUser);
router.post('/:id/unban', can('users.ban'), userManagementController.unbanUser);
router.patch('/:id/role', can('users.role_change'), validate(assignRoleSchema), userManagementController.changeRole);
router.delete('/:id', can('users.delete'), userManagementController.deleteUser);

export default router;
