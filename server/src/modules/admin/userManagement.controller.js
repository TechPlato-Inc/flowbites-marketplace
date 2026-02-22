import { UserManagementService } from './userManagement.service.js';

const userManagementService = new UserManagementService();

export class UserManagementController {
  async getUsers(req, res, next) {
    try {
      const data = await userManagementService.getUsers(req.query);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const data = await userManagementService.getUserById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async banUser(req, res, next) {
    try {
      const data = await userManagementService.banUser(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async unbanUser(req, res, next) {
    try {
      const data = await userManagementService.unbanUser(req.params.id, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async changeRole(req, res, next) {
    try {
      const { role } = req.body;
      const data = await userManagementService.changeRole(req.params.id, role, req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req, res, next) {
    try {
      const data = await userManagementService.getUserStats();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
