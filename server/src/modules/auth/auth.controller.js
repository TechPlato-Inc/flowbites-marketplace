import { AuthService } from './auth.service.js';

const authService = new AuthService();

export class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || req.cookies.refreshToken;
      await authService.logout(req.user._id, refreshToken);

      res.clearCookie('refreshToken');

      res.json({
        success: true,
        data: { message: 'Logged out successfully' }
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      res.json({
        success: true,
        data: { user: req.user }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const result = await authService.updateProfile(req.user._id, req.body);
      res.json({
        success: true,
        data: { user: result }
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user._id, req.body);
      res.json({
        success: true,
        data: { message: 'Password changed successfully' }
      });
    } catch (error) {
      next(error);
    }
  }
}
