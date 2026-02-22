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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Set access token cookie (httpOnly — JS reads token from response body, cookie is for middleware)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      // Set userRole cookie (readable by Next.js middleware for routing)
      res.cookie('userRole', result.user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000
      });

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login({ ...req.body, ip: req.ip });

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      // Set access token cookie (httpOnly — JS reads token from response body, cookie is for middleware)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      // Set userRole cookie (readable by Next.js middleware for routing)
      res.cookie('userRole', result.user.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000
      });

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
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

      // Update access token cookie
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000
      });

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
      res.clearCookie('accessToken');
      res.clearCookie('userRole');

      res.json({
        success: true,
        data: { message: 'Logged out successfully' }
      });
    } catch (error) {
      next(error);
    }
  }

  async clearSession(req, res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('userRole');
    res.json({ success: true, data: { message: 'Session cleared' } });
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

  async forgotPassword(req, res, next) {
    try {
      const result = await authService.forgotPassword(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const result = await authService.verifyEmail(req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req, res, next) {
    try {
      const result = await authService.resendVerificationEmail(req.user._id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
