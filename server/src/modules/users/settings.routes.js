import express from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema, updateEmailPreferencesSchema } from './settings.validator.js';

const router = express.Router();
const settingsController = new SettingsController();

router.use(authenticate);

router.patch('/profile', validate(updateProfileSchema), settingsController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), settingsController.changePassword);
router.get('/email-preferences', settingsController.getEmailPreferences);
router.patch('/email-preferences', validate(updateEmailPreferencesSchema), settingsController.updateEmailPreferences);
router.post('/deactivate', settingsController.deactivateAccount);

export default router;
