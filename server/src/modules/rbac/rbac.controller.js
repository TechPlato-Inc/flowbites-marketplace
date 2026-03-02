import { rbacService } from './rbac.service.js';
import { PERMISSION_CATEGORIES } from './permissions.js';

export class RBACController {
  async getAllRoles(req, res, next) {
    try {
      const roles = await rbacService.getAllRoles();
      res.json({ success: true, data: roles });
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const role = await rbacService.getRoleById(req.params.id);
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const role = await rbacService.createRole(req.body, req.user._id);
      res.status(201).json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const role = await rbacService.updateRole(req.params.id, req.body, req.user._id);
      res.json({ success: true, data: role });
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const result = await rbacService.deleteRole(req.params.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getPermissionRegistry(req, res, next) {
    try {
      res.json({ success: true, data: PERMISSION_CATEGORIES });
    } catch (error) {
      next(error);
    }
  }
}
