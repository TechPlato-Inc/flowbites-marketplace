import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../users/user.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { Token } from './token.model.js';
import { LoginAttempt } from './loginAttempt.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '../../services/email.js';

export class AuthService {
  /**
   * Hash a refresh token for secure storage (one-way SHA-256).
   */
  _hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET,
      { algorithm: 'HS256', expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { algorithm: 'HS256', expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  async register({ email, password, name, role = 'buyer' }) {
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role
    });

    // If creator, create profile
    if (role === 'creator') {
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      let uniqueUsername = username;
      let counter = 1;

      // Ensure unique username
      while (await CreatorProfile.findOne({ username: uniqueUsername })) {
        uniqueUsername = `${username}${counter}`;
        counter++;
      }

      await CreatorProfile.create({
        userId: user._id,
        displayName: name,
        username: uniqueUsername
      });
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Store hashed refresh token
    user.refreshTokens.push({
      token: this._hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, name).catch(err =>
      console.error('Failed to send welcome email:', err)
    );

    // Send email verification (non-blocking)
    Token.createToken(user._id, 'email_verification', 24 * 60 * 60 * 1000)
      .then(tokenDoc => sendEmailVerification(email, name, tokenDoc.token))
      .catch(err => console.error('Failed to send verification email:', err));

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  async login({ email, password, ip }) {
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

    // Check for too many failed attempts
    const failedAttempts = await LoginAttempt.countRecentFailures(email, LOCKOUT_WINDOW_MS);
    if (failedAttempts >= MAX_ATTEMPTS) {
      throw new AppError('Account temporarily locked due to too many failed login attempts. Try again in 15 minutes.', 429);
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      await LoginAttempt.record(email, ip, false);
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await LoginAttempt.record(email, ip, false);
      const remaining = MAX_ATTEMPTS - failedAttempts - 1;
      if (remaining <= 2 && remaining > 0) {
        throw new AppError(`Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before lockout.`, 401);
      }
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    // Successful login — clear failed attempts and record success
    await LoginAttempt.record(email, ip, true);
    await LoginAttempt.clearFailures(email);

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Store refresh token (limit to 5 devices)
    user.refreshTokens = user.refreshTokens
      .filter(rt => rt.expiresAt > new Date())
      .slice(-4);

    user.refreshTokens.push({
      token: this._hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Verify refresh token exists and is valid (compare hashes)
      const hashedToken = this._hashToken(refreshToken);
      const tokenExists = user.refreshTokens.some(
        rt => rt.token === hashedToken && rt.expiresAt > new Date()
      );

      if (!tokenExists) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(user._id);

      return {
        accessToken,
        user: user.toJSON()
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (!user) return;

    // Remove the refresh token (compare hashes)
    const hashedToken = this._hashToken(refreshToken);
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== hashedToken);
    await user.save();
  }

  async updateProfile(userId, updates) {
    const allowedFields = ['name', 'bio'];
    const sanitized = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitized[field] = updates[field];
      }
    }

    const user = await User.findByIdAndUpdate(userId, sanitized, { new: true, runValidators: true });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user.toJSON();
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword || !newPassword) {
      throw new AppError('Current and new passwords are required', 400);
    }
    if (newPassword.length < 12) {
      throw new AppError('New password must be at least 12 characters', 400);
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    // Invalidate all other sessions after password change
    user.refreshTokens = [];
    await user.save();
  }

  async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If an account with that email exists, a reset link has been sent.' };
    }

    const tokenDoc = await Token.createToken(user._id, 'password_reset', 60 * 60 * 1000); // 1 hour

    await sendPasswordResetEmail(user.email, user.name, tokenDoc.token);

    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  async resetPassword({ token, newPassword }) {
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }
    if (newPassword.length < 12) {
      throw new AppError('Password must be at least 12 characters', 400);
    }

    const tokenDoc = await Token.findOne({
      token,
      type: 'password_reset',
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new AppError('Invalid or expired reset link', 400);
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.password = newPassword;
    // Invalidate all existing sessions after password reset
    user.refreshTokens = [];
    await user.save();

    // Delete the used token
    await Token.deleteOne({ _id: tokenDoc._id });

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail({ token }) {
    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    const tokenDoc = await Token.findOne({
      token,
      type: 'email_verification',
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      throw new AppError('Invalid or expired verification link', 400);
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.emailVerified = true;
    await user.save();

    await Token.deleteOne({ _id: tokenDoc._id });

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.emailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    const tokenDoc = await Token.createToken(user._id, 'email_verification', 24 * 60 * 60 * 1000);
    await sendEmailVerification(user.email, user.name, tokenDoc.token);

    return { message: 'Verification email sent' };
  }
}
