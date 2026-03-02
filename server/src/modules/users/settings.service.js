import { SettingsQueryService } from './settings.queryService.js';
import { SettingsWriteService } from './settings.writeService.js';

const queryService = new SettingsQueryService();
const writeService = new SettingsWriteService();

/**
 * Backward-compatible facade that delegates to SettingsQueryService
 * and SettingsWriteService. Existing consumers (e.g. SettingsController)
 * continue to work without changes.
 */
export class SettingsService {
  // ── Reads (delegated to SettingsQueryService) ──────────────────────

  getFullUser(userId) {
    return queryService.getFullUser(userId);
  }

  getEmailPreferences(userId) {
    return queryService.getEmailPreferences(userId);
  }

  getNotificationPreferences(userId) {
    return queryService.getNotificationPreferences(userId);
  }

  // ── Writes (delegated to SettingsWriteService) ─────────────────────

  changePassword(userId, currentPassword, newPassword) {
    return writeService.changePassword(userId, currentPassword, newPassword);
  }

  updateProfile(userId, updates) {
    return writeService.updateProfile(userId, updates);
  }

  updateEmailPreferences(userId, preferences) {
    return writeService.updateEmailPreferences(userId, preferences);
  }

  updateNotificationPreferences(userId, preferences) {
    return writeService.updateNotificationPreferences(userId, preferences);
  }

  updateSettings(userId, body) {
    return writeService.updateSettings(userId, body);
  }

  deactivateAccount(userId, password) {
    return writeService.deactivateAccount(userId, password);
  }
}
