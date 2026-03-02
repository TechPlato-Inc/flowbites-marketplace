import { Role } from './role.model.js';
import { DEFAULT_ROLE_PERMISSIONS } from './permissions.js';

/**
 * Seed default built-in roles. Safe to run multiple times (idempotent).
 * Called on server startup after DB connect.
 */
export async function seedDefaultRoles() {
  const builtInRoles = [
    {
      name: 'buyer',
      displayName: 'Buyer',
      description: 'Default user role. Can browse, purchase, and review templates.',
      permissions: DEFAULT_ROLE_PERMISSIONS.buyer,
      isBuiltIn: true,
    },
    {
      name: 'creator',
      displayName: 'Creator',
      description: 'Template creators who sell on the marketplace.',
      permissions: DEFAULT_ROLE_PERMISSIONS.creator,
      isBuiltIn: true,
    },
    {
      name: 'admin',
      displayName: 'Admin',
      description: 'Platform administrators with full management access.',
      permissions: DEFAULT_ROLE_PERMISSIONS.admin,
      isBuiltIn: true,
    },
    {
      name: 'super_admin',
      displayName: 'Super Admin',
      description: 'Unrestricted access. Bypasses all permission checks.',
      permissions: DEFAULT_ROLE_PERMISSIONS.super_admin,
      isBuiltIn: true,
    },
  ];

  let created = 0;
  for (const role of builtInRoles) {
    const result = await Role.findOneAndUpdate(
      { name: role.name },
      { $setOnInsert: role },
      { upsert: true, new: true }
    );
    if (result.isNew !== false) created++;
  }

  if (created > 0) {
    console.log(`[RBAC] Seeded ${created} built-in role(s)`);
  }
}
