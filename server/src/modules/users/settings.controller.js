import { SettingsService } from './settings.service.js';

const settingsService = new SettingsService();

export class SettingsController {
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const data = await settingsService.changePassword(req.user._id, currentPassword, newPassword);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const data = await settingsService.updateProfile(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getEmailPreferences(req, res, next) {
    try {
      const data = await settingsService.getEmailPreferences(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateEmailPreferences(req, res, next) {
    try {
      const data = await settingsService.updateEmailPreferences(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req, res, next) {
    try {
      const { password } = req.body;
      const data = await settingsService.deactivateAccount(req.user._id, password);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
