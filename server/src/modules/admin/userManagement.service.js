import { User } from '../users/user.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { escapeRegex } from '../../lib/utils.js';
import { AuditLog } from '../audit/auditLog.model.js';

export class UserManagementService {
  /**
   * List all users with filters.
   */
  async getUsers({ page = 1, limit = 20, role, search, active } = {}) {
    const skip = (page - 1) * limit;
    const query = {};

    if (role) query.role = role;
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    if (search) {
      const safe = escapeRegex(search);
      query.$or = [
        { name: { $regex: safe, $options: 'i' } },
        { email: { $regex: safe, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get single user detail.
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-refreshTokens').lean();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  /**
   * Ban/deactivate a user.
   */
  async banUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'admin' || user.role === 'super_admin') {
      throw new AppError('Cannot ban admin users', 400);
    }

    if (userId.toString() === adminId.toString()) {
      throw new AppError('Cannot ban yourself', 400);
    }

    user.isActive = false;
    user.isBanned = true;
    user.bannedAt = new Date();
    user.bannedBy = adminId;
    user.refreshTokens = [];
    await user.save();

    // Audit log (non-blocking)
    AuditLog.create({
      adminId, action: 'user_banned', targetType: 'user', targetId: userId,
      details: { userName: user.name, email: user.email },
    }).catch(() => {});

    return { message: `User ${user.name} has been banned` };
  }

  /**
   * Unban/reactivate a user.
   */
  async unbanUser(userId, adminId) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.isActive = true;
    user.isBanned = false;
    user.bannedAt = undefined;
    user.bannedBy = undefined;
    user.banReason = undefined;
    await user.save();

    // Audit log (non-blocking)
    AuditLog.create({
      adminId, action: 'user_unbanned', targetType: 'user', targetId: userId,
      details: { userName: user.name },
    }).catch(() => {});

    return { message: `User ${user.name} has been unbanned` };
  }

  /**
   * Change a user's role.
   */
  async changeRole(userId, newRole, adminId) {
    if (!['buyer', 'creator', 'admin'].includes(newRole)) {
      throw new AppError('Invalid role', 400);
    }

    if (userId.toString() === adminId.toString()) {
      throw new AppError('Cannot change your own role', 400);
    }

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'super_admin') {
      throw new AppError('Cannot modify super admin role', 400);
    }

    const oldRole = user.role;
    user.role = newRole;
    await user.save();

    // Audit log (non-blocking)
    AuditLog.create({
      adminId, action: 'user_role_changed', targetType: 'user', targetId: userId,
      details: { userName: user.name, oldRole, newRole },
    }).catch(() => {});

    return { message: `User role changed to ${newRole}`, user };
  }

  /**
   * Get user stats overview.
   */
  async getUserStats() {
    const [total, byRole, activeCount, bannedCount, recentSignups] = await Promise.all([
      User.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const roles = {};
    byRole.forEach(r => { roles[r._id] = r.count; });

    return {
      total,
      active: activeCount,
      banned: bannedCount,
      byRole: roles,
      recentSignups,
    };
  }
}
