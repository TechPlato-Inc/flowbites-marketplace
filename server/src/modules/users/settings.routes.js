import express from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateEmailPreferencesSchema,
  updateNotificationPreferencesSchema,
  updateSettingsSchema,
  deactivateAccountSchema,
} from './settings.validator.js';

const router = express.Router();
const settingsController = new SettingsController();

router.use(authenticate);

// Full settings view (returns DTO with all safe account fields)
router.get('/', settingsController.getMySettings);

// Profile
router.patch('/profile', validate(updateProfileSchema), settingsController.updateProfile);

// Password
router.post('/change-password', validate(changePasswordSchema), settingsController.changePassword);

// Email preferences
router.get('/email-preferences', settingsController.getEmailPreferences);
router.patch('/email-preferences', validate(updateEmailPreferencesSchema), settingsController.updateEmailPreferences);

// In-app notification preferences
router.get('/notification-preferences', settingsController.getNotificationPreferences);
router.patch('/notification-preferences', validate(updateNotificationPreferencesSchema), settingsController.updateNotificationPreferences);

// Bulk settings update (notification + email prefs in one call)
router.patch('/', validate(updateSettingsSchema), settingsController.updateSettings);

// Account deactivation
router.post('/deactivate', validate(deactivateAccountSchema), settingsController.deactivateAccount);

export default router;
