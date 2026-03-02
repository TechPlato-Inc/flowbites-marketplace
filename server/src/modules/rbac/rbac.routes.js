import express from 'express';
import { RBACController } from './rbac.controller.js';
import { authenticate, can } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createRoleSchema, updateRoleSchema } from './rbac.validator.js';

const router = express.Router();
const rbacController = new RBACController();

// All RBAC routes require authentication
router.use(authenticate);

// Permission registry — any admin can view
router.get('/permissions', can('users.role_change'), rbacController.getPermissionRegistry);

// Role CRUD — requires users.role_change permission
router.get('/roles', can('users.role_change'), rbacController.getAllRoles);
router.get('/roles/:id', can('users.role_change'), rbacController.getRoleById);
router.post('/roles', can('users.role_change'), validate(createRoleSchema), rbacController.createRole);
router.patch('/roles/:id', can('users.role_change'), validate(updateRoleSchema), rbacController.updateRole);
router.delete('/roles/:id', can('users.role_change'), rbacController.deleteRole);

export default router;
