import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { AuthWriteService } from './auth.writeService.js';

// Shared helpers live in AuthWriteService; reuse a single instance for hashing
// and token generation so we don't duplicate the logic.
const _write = new AuthWriteService();

export class AuthQueryService {
  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Verify refresh token exists and is valid (compare hashes)
      const hashedToken = _write._hashToken(refreshToken);
      const tokenExists = user.refreshTokens.some(
        rt => rt.token === hashedToken && rt.expiresAt > new Date()
      );

      if (!tokenExists) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new access token
      const accessToken = _write.generateAccessToken(user._id);

      return {
        accessToken,
        user: user.toJSON()
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }
}
