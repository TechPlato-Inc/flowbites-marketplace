import { Role } from '../role.model.js';
import { rbacService } from '../rbac.service.js';
import { seedDefaultRoles } from '../seed.js';
import { DEFAULT_ROLE_PERMISSIONS } from '../permissions.js';

export async function runRbacServiceTests({ test, assert, clearCollections, createTestUser }) {
  console.log('\n📋 RBAC Service Tests');

  await clearCollections();
  rbacService.invalidateCache();
  await seedDefaultRoles();

  await test('RBAC: buyer role resolves to no permissions', async () => {
    const permissions = await rbacService.getPermissionsForRole('buyer');
    assert(Array.isArray(permissions), 'Expected an array');
    assert(permissions.length === 0, 'Buyer should have no permissions');
  });

  await test('RBAC: creator role resolves to default creator permissions', async () => {
    const permissions = await rbacService.getPermissionsForRole('creator');
    assert(permissions.length === DEFAULT_ROLE_PERMISSIONS.creator.length, 'Expected creator permission count');
    assert(permissions.includes('dashboard.creator'), 'Expected creator dashboard permission');
  });

  await test('RBAC: admin role resolves to default admin permissions', async () => {
    const permissions = await rbacService.getPermissionsForRole('admin');
    assert(permissions.length === DEFAULT_ROLE_PERMISSIONS.admin.length, 'Expected admin permission count');
    assert(permissions.includes('dashboard.admin'), 'Expected admin dashboard permission');
    assert(permissions.includes('users.role_change'), 'Expected user role change permission');
  });

  await test('RBAC: super_admin role resolves to wildcard permission', async () => {
    const permissions = await rbacService.getPermissionsForRole('super_admin');
    assert(permissions.length === 1, 'Expected a single wildcard permission');
    assert(permissions[0] === '*', 'Expected wildcard permission');
  });

  await test('RBAC: nonexistent role falls back gracefully', async () => {
    const permissions = await rbacService.getPermissionsForRole(`missing_role_${Date.now()}`);
    assert(Array.isArray(permissions), 'Expected an array');
    assert(permissions.length === 0, 'Missing roles should resolve to no permissions');
  });

  await test('RBAC: resolveUserPermissions merges creator role permissions', async () => {
    const permissions = await rbacService.resolveUserPermissions({
      role: 'creator',
      customPermissions: [],
    });
    assert(permissions.includes('templates.create'), 'Expected creator permission');
    assert(permissions.includes('dashboard.creator'), 'Expected dashboard creator permission');
  });

  await test('RBAC: resolveUserPermissions merges and deduplicates custom permissions', async () => {
    const permissions = await rbacService.resolveUserPermissions({
      role: 'creator',
      customPermissions: ['users.view', 'templates.create', 'users.view'],
    });
    assert(permissions.includes('users.view'), 'Expected merged custom permission');
    assert(permissions.filter(permission => permission === 'users.view').length === 1, 'Expected deduplicated custom permission');
  });

  await test('RBAC: resolveUserPermissions supports buyer custom permissions only', async () => {
    const permissions = await rbacService.resolveUserPermissions({
      role: 'buyer',
      customPermissions: ['templates.create'],
    });
    assert(permissions.length === 1, 'Expected a single custom permission');
    assert(permissions[0] === 'templates.create', 'Expected templates.create');
  });

  await test('RBAC: hasPermission returns true for exact match', async () => {
    assert(rbacService.hasPermission(['templates.create'], 'templates.create') === true, 'Expected exact permission match');
  });

  await test('RBAC: hasPermission returns false for missing permission', async () => {
    assert(rbacService.hasPermission(['templates.create'], 'users.ban') === false, 'Expected missing permission to fail');
  });

  await test('RBAC: hasPermission honors wildcard permissions', async () => {
    assert(rbacService.hasPermission(['*'], 'anything.here') === true, 'Expected wildcard to pass');
  });

  await test('RBAC: hasPermission returns false for empty permissions', async () => {
    assert(rbacService.hasPermission([], 'templates.create') === false, 'Expected empty permission set to fail');
  });

  await test('RBAC: hasPermission returns false for null permissions', async () => {
    assert(rbacService.hasPermission(null, 'templates.create') === false, 'Expected null permission set to fail');
  });

  await test('RBAC: hasAnyPermission returns true when any permission matches', async () => {
    assert(
      rbacService.hasAnyPermission(['templates.create'], ['templates.create', 'users.ban']) === true,
      'Expected OR permission check to pass'
    );
  });

  await test('RBAC: hasAnyPermission returns false when no permissions match', async () => {
    assert(
      rbacService.hasAnyPermission(['templates.create'], ['users.ban', 'users.view']) === false,
      'Expected OR permission check to fail'
    );
  });

  await test('RBAC: getPermissionsForRole uses cache on repeated lookups', async () => {
    rbacService.invalidateCache('admin');

    const originalFindOne = Role.findOne.bind(Role);
    let dbLookups = 0;

    Role.findOne = (...args) => {
      dbLookups += 1;
      return originalFindOne(...args);
    };

    try {
      await rbacService.getPermissionsForRole('admin');
      await rbacService.getPermissionsForRole('admin');
      assert(dbLookups === 1, 'Expected second lookup to hit cache');
    } finally {
      Role.findOne = originalFindOne;
      rbacService.invalidateCache('admin');
    }
  });

  await test('RBAC: invalidateCache forces a fresh role lookup', async () => {
    rbacService.invalidateCache('creator');

    const originalFindOne = Role.findOne.bind(Role);
    let dbLookups = 0;

    Role.findOne = (...args) => {
      dbLookups += 1;
      return originalFindOne(...args);
    };

    try {
      await rbacService.getPermissionsForRole('creator');
      rbacService.invalidateCache('creator');
      await rbacService.getPermissionsForRole('creator');
      assert(dbLookups === 2, 'Expected cache invalidation to force another DB lookup');
    } finally {
      Role.findOne = originalFindOne;
      rbacService.invalidateCache('creator');
    }
  });

  await test('RBAC: createRole rejects invalid permissions', async () => {
    try {
      await rbacService.createRole({
        name: `invalid_perm_role_${Date.now()}`,
        displayName: 'Invalid Permission Role',
        description: 'Should fail',
        permissions: ['not.a.real.permission'],
      });
      assert(false, 'Expected createRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('Invalid permissions'), 'Expected invalid permission message');
    }
  });

  await test('RBAC: createRole rejects built-in role names', async () => {
    try {
      await rbacService.createRole({
        name: 'admin',
        displayName: 'Admin Clone',
        description: 'Should fail',
        permissions: ['users.view'],
      });
      assert(false, 'Expected createRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('built-in role name'), 'Expected built-in role name error');
    }
  });

  await test('RBAC: updateRole blocks renaming built-in roles', async () => {
    const buyerRole = await Role.findOne({ name: 'buyer' });
    try {
      await rbacService.updateRole(buyerRole._id, { name: 'buyer_plus' });
      assert(false, 'Expected updateRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('Cannot rename built-in roles'), 'Expected built-in rename protection');
    }
  });

  await test('RBAC: updateRole blocks super_admin permission changes', async () => {
    const superAdminRole = await Role.findOne({ name: 'super_admin' });
    try {
      await rbacService.updateRole(superAdminRole._id, { permissions: ['dashboard.admin'] });
      assert(false, 'Expected updateRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('Cannot modify super_admin permissions'), 'Expected super admin protection');
    }
  });

  await test('RBAC: deleteRole rejects built-in roles', async () => {
    const adminRole = await Role.findOne({ name: 'admin' });
    try {
      await rbacService.deleteRole(adminRole._id);
      assert(false, 'Expected deleteRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('Cannot delete built-in roles'), 'Expected built-in delete protection');
    }
  });

  await test('RBAC: deleteRole rejects roles assigned to users', async () => {
    const roleName = `assigned_role_${Date.now()}`;
    const customRole = await rbacService.createRole({
      name: roleName,
      displayName: 'Assigned Role',
      description: 'Role assigned to a user',
      permissions: ['users.view'],
    });

    await createTestUser({
      email: `${roleName}@flowbites.com`,
      role: roleName,
    });

    try {
      await rbacService.deleteRole(customRole._id);
      assert(false, 'Expected deleteRole to throw');
    } catch (error) {
      assert(error.statusCode === 400, 'Expected 400 AppError');
      assert(error.message.includes('still assigned'), 'Expected assigned-user protection');
    }
  });
}
