import { SettingsQueryService } from './settings.queryService.js';
import { SettingsWriteService } from './settings.writeService.js';
import { toUserProfileDTO, toUserSettingsDTO } from './dto/userProfile.dto.js';

const queryService = new SettingsQueryService();
const writeService = new SettingsWriteService();

export class SettingsController {
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const data = await writeService.changePassword(req.user._id, currentPassword, newPassword);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await writeService.updateProfile(req.user._id, req.body);
      res.json({ success: true, data: toUserProfileDTO(user) });
    } catch (error) {
      next(error);
    }
  }

  async getMySettings(req, res, next) {
    try {
      const user = await queryService.getFullUser(req.user._id);
      res.json({ success: true, data: toUserSettingsDTO(user) });
    } catch (error) {
      next(error);
    }
  }

  async getEmailPreferences(req, res, next) {
    try {
      const data = await queryService.getEmailPreferences(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateEmailPreferences(req, res, next) {
    try {
      const data = await writeService.updateEmailPreferences(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getNotificationPreferences(req, res, next) {
    try {
      const data = await queryService.getNotificationPreferences(req.user._id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateNotificationPreferences(req, res, next) {
    try {
      const data = await writeService.updateNotificationPreferences(req.user._id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const user = await writeService.updateSettings(req.user._id, req.body);
      res.json({ success: true, data: toUserSettingsDTO(user) });
    } catch (error) {
      next(error);
    }
  }

  async deactivateAccount(req, res, next) {
    try {
      const { password } = req.body;
      const data = await writeService.deactivateAccount(req.user._id, password);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
