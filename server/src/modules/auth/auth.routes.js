import express from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validator.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();
const authController = new AuthController();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.patch('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
