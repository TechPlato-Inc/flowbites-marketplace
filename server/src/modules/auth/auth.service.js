import jwt from 'jsonwebtoken';
import { User } from '../users/user.model.js';
import { CreatorProfile } from '../creators/creator.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuthService {
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
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

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    // Store refresh token (limit to 5 devices)
    user.refreshTokens = user.refreshTokens
      .filter(rt => rt.expiresAt > new Date())
      .slice(-4);

    user.refreshTokens.push({
      token: refreshToken,
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Verify refresh token exists and is valid
      const tokenExists = user.refreshTokens.some(
        rt => rt.token === refreshToken && rt.expiresAt > new Date()
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

    // Remove the refresh token
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
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
    if (newPassword.length < 6) {
      throw new AppError('New password must be at least 6 characters', 400);
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
    await user.save();
  }
}
