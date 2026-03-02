import { Role } from './role.model.js';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from './permissions.js';
import { AppError } from '../../middleware/errorHandler.js';

class RBACService {
  constructor() {
    /** @type {Map<string, { permissions: string[], cachedAt: number }>} */
    this._cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  // ── Permission Resolution ──────────────────────────────────────────────

  /**
   * Get permissions for a role name. Uses in-memory cache.
   * @param {string} roleName
   * @returns {Promise<string[]>}
   */
  async getPermissionsForRole(roleName) {
    // Check cache first
    const cached = this._cache.get(roleName);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.permissions;
    }

    // Lookup from DB
    const role = await Role.findOne({ name: roleName, isActive: true }).lean();
    const permissions = role ? role.permissions : (DEFAULT_ROLE_PERMISSIONS[roleName] || []);

    // Cache it
    this._cache.set(roleName, { permissions, cachedAt: Date.now() });
    return permissions;
  }

  /**
   * Resolve full permissions for a user: role permissions + customPermissions.
   * @param {{ role: string, customPermissions?: string[] }} user
   * @returns {Promise<string[]>}
   */
  async resolveUserPermissions(user) {
    const rolePerms = await this.getPermissionsForRole(user.role);
    const custom = user.customPermissions || [];

    // Merge and deduplicate
    if (custom.length === 0) return rolePerms;
    return [...new Set([...rolePerms, ...custom])];
  }

  /**
   * Check if a permission set includes a specific permission.
   * Handles wildcard '*' for super_admin.
   * @param {string[]} permissions
   * @param {string} required
   * @returns {boolean}
   */
  hasPermission(permissions, required) {
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(required);
  }

  /**
   * Check if permissions include ANY of the required permissions.
   * @param {string[]} permissions
   * @param {string[]} requiredList
   * @returns {boolean}
   */
  hasAnyPermission(permissions, requiredList) {
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return requiredList.some(p => permissions.includes(p));
  }

  /**
   * Invalidate cache for a role (called when roles are updated).
   * @param {string} [roleName] - If omitted, clears entire cache.
   */
  invalidateCache(roleName) {
    if (roleName) {
      this._cache.delete(roleName);
    } else {
      this._cache.clear();
    }
  }

  // ── Role CRUD ──────────────────────────────────────────────────────────

  /**
   * Get all roles.
   */
  async getAllRoles() {
    return Role.find({ isActive: true }).sort({ isBuiltIn: -1, name: 1 }).lean();
  }

  /**
   * Get a role by ID.
   */
  async getRoleById(roleId) {
    const role = await Role.findById(roleId).lean();
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  /**
   * Create a new custom role.
   */
  async createRole({ name, displayName, description, permissions }, adminId) {
    // Validate name doesn't conflict with built-in roles
    const builtInNames = Object.keys(DEFAULT_ROLE_PERMISSIONS);
    if (builtInNames.includes(name.toLowerCase())) {
      throw new AppError(`Cannot use built-in role name: ${name}`, 400);
    }

    // Check if name already exists
    const existing = await Role.findOne({ name: name.toLowerCase() });
    if (existing) throw new AppError('A role with this name already exists', 400);

    // Validate permissions are valid
    const invalidPerms = permissions.filter(p => !ALL_PERMISSIONS.has(p));
    if (invalidPerms.length > 0) {
      throw new AppError(`Invalid permissions: ${invalidPerms.join(', ')}`, 400);
    }

    const role = await Role.create({
      name: name.toLowerCase(),
      displayName,
      description,
      permissions,
      isBuiltIn: false,
      createdBy: adminId,
    });

    return role;
  }

  /**
   * Update a role's permissions and metadata.
   */
  async updateRole(roleId, updates, adminId) {
    const role = await Role.findById(roleId);
    if (!role) throw new AppError('Role not found', 404);

    // Prevent renaming built-in roles
    if (role.isBuiltIn && updates.name && updates.name !== role.name) {
      throw new AppError('Cannot rename built-in roles', 400);
    }

    // Prevent deleting super_admin's wildcard
    if (role.name === 'super_admin' && updates.permissions) {
      throw new AppError('Cannot modify super_admin permissions', 400);
    }

    // Validate permissions if provided
    if (updates.permissions) {
      const invalidPerms = updates.permissions.filter(p => p !== '*' && !ALL_PERMISSIONS.has(p));
      if (invalidPerms.length > 0) {
        throw new AppError(`Invalid permissions: ${invalidPerms.join(', ')}`, 400);
      }
    }

    // Apply updates
    if (updates.displayName) role.displayName = updates.displayName;
    if (updates.description !== undefined) role.description = updates.description;
    if (updates.permissions) role.permissions = updates.permissions;

    await role.save();

    // Invalidate cache so changes take effect
    this.invalidateCache(role.name);

    return role;
  }

  /**
   * Delete a custom role (cannot delete built-in).
   */
  async deleteRole(roleId) {
    const role = await Role.findById(roleId);
    if (!role) throw new AppError('Role not found', 404);

    if (role.isBuiltIn) {
      throw new AppError('Cannot delete built-in roles', 400);
    }

    // Check if any users are assigned this role
    const { User } = await import('../users/user.model.js');
    const usersWithRole = await User.countDocuments({ role: role.name });
    if (usersWithRole > 0) {
      throw new AppError(
        `Cannot delete role "${role.displayName}" — ${usersWithRole} user(s) are still assigned to it. Reassign them first.`,
        400
      );
    }

    await Role.findByIdAndDelete(roleId);
    this.invalidateCache(role.name);

    return { message: `Role "${role.displayName}" deleted` };
  }

  /**
   * Check if a role name is a protected built-in role.
   */
  isProtectedRole(roleName) {
    return ['admin', 'super_admin'].includes(roleName);
  }
}

// Singleton export
export const rbacService = new RBACService();
