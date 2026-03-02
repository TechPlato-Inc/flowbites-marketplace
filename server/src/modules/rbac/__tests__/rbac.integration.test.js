export async function runRbacIntegrationTests({
  test,
  assert,
  apiRequest,
  loginToken,
  createTestUser,
  createTestAdmin,
  createTestCreator,
}) {
  console.log('\n📋 RBAC Integration Tests');

  const { user: superAdmin } = await createTestUser({
    email: `superadmin-${Date.now()}@flowbites.com`,
    role: 'super_admin',
    name: 'RBAC Super Admin',
  });
  const superAdminToken = await loginToken(superAdmin.email);

  const { user: buyer } = await createTestUser({
    email: `rbac-buyer-${Date.now()}@flowbites.com`,
  });
  const buyerToken = await loginToken(buyer.email);

  const { user: creator } = await createTestCreator();
  const creatorToken = await loginToken(creator.email);

  const { user: admin } = await createTestAdmin();
  const adminToken = await loginToken(admin.email);

  let createdRoleId;
  let financeRoleName;

  await test('RBAC API: super_admin can list built-in roles', async () => {
    const res = await apiRequest('GET', '/api/rbac/roles', { token: superAdminToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data), 'Expected roles array');
    assert(res.body.data.length === 4, 'Expected 4 built-in roles');
  });

  await test('RBAC API: buyer cannot list roles', async () => {
    const res = await apiRequest('GET', '/api/rbac/roles', { token: buyerToken });
    assert(res.status === 403, 'Expected 403');
  });

  await test('RBAC API: creator cannot list roles', async () => {
    const res = await apiRequest('GET', '/api/rbac/roles', { token: creatorToken });
    assert(res.status === 403, 'Expected 403');
  });

  await test('RBAC API: super_admin can fetch permission registry', async () => {
    const res = await apiRequest('GET', '/api/rbac/permissions', { token: superAdminToken });
    assert(res.status === 200, 'Expected 200');
    assert(Object.keys(res.body.data || {}).length === 17, 'Expected 17 permission categories');
  });

  await test('RBAC API: can create a custom role', async () => {
    const roleName = `content_moderator_${Date.now()}`;
    const res = await apiRequest('POST', '/api/rbac/roles', {
      token: superAdminToken,
      body: {
        name: roleName,
        displayName: 'Content Moderator',
        description: 'Moderates templates and reviews',
        permissions: ['templates.view_all', 'templates.approve', 'reviews.moderate'],
      },
    });

    assert(res.status === 201, 'Expected 201');
    assert(res.body.data?._id, 'Expected created role id');
    assert(res.body.data?.name === roleName, 'Expected role name');
    createdRoleId = res.body.data._id;
  });

  await test('RBAC API: can fetch a created role by id', async () => {
    const res = await apiRequest('GET', `/api/rbac/roles/${createdRoleId}`, { token: superAdminToken });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?._id === createdRoleId, 'Expected matching role id');
  });

  await test('RBAC API: can update a custom role', async () => {
    const res = await apiRequest('PATCH', `/api/rbac/roles/${createdRoleId}`, {
      token: superAdminToken,
      body: {
        description: 'Updated moderator permissions',
        permissions: ['templates.view_all', 'templates.approve', 'reviews.moderate', 'reports.manage'],
      },
    });

    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.permissions?.includes('reports.manage'), 'Expected updated permissions');
  });

  await test('RBAC API: rejects built-in role names on create', async () => {
    const res = await apiRequest('POST', '/api/rbac/roles', {
      token: superAdminToken,
      body: {
        name: 'admin',
        displayName: 'Admin Duplicate',
        description: 'Should fail',
        permissions: ['users.view'],
      },
    });

    assert(res.status === 400, 'Expected 400');
  });

  await test('RBAC API: rejects built-in role deletion', async () => {
    const rolesRes = await apiRequest('GET', '/api/rbac/roles', { token: superAdminToken });
    const buyerRole = rolesRes.body.data.find(role => role.name === 'buyer');
    const res = await apiRequest('DELETE', `/api/rbac/roles/${buyerRole._id}`, { token: superAdminToken });
    assert(res.status === 400, 'Expected 400');
  });

  await test('RBAC permissions: admin can access admin dashboard stats', async () => {
    const res = await apiRequest('GET', '/api/admin/dashboard-stats', { token: adminToken });
    assert(res.status === 200, 'Expected 200');
  });

  await test('RBAC permissions: creator cannot access admin dashboard stats', async () => {
    const res = await apiRequest('GET', '/api/admin/dashboard-stats', { token: creatorToken });
    assert(res.status === 403, 'Expected 403');
  });

  await test('RBAC permissions: buyer cannot access admin dashboard stats', async () => {
    const res = await apiRequest('GET', '/api/admin/dashboard-stats', { token: buyerToken });
    assert(res.status === 403, 'Expected 403');
  });

  await test('RBAC permissions: creator can access earnings summary', async () => {
    const res = await apiRequest('GET', '/api/earnings/summary', { token: creatorToken });
    assert(res.status === 200, 'Expected 200');
    assert(typeof res.body.data?.availableBalance === 'number', 'Expected summary payload');
  });

  await test('RBAC permissions: buyer cannot access earnings summary', async () => {
    const res = await apiRequest('GET', '/api/earnings/summary', { token: buyerToken });
    assert(res.status === 403, 'Expected 403');
  });

  await test('RBAC permissions: super_admin can access protected endpoints', async () => {
    const dashboardRes = await apiRequest('GET', '/api/admin/dashboard-stats', { token: superAdminToken });
    const permissionsRes = await apiRequest('GET', '/api/rbac/permissions', { token: superAdminToken });
    assert(dashboardRes.status === 200, 'Expected super admin dashboard access');
    assert(permissionsRes.status === 200, 'Expected super admin RBAC access');
  });

  await test('RBAC auth: /auth/me returns wildcard permissions for super_admin', async () => {
    const res = await apiRequest('GET', '/api/auth/me', { token: superAdminToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.user?.permissions), 'Expected permissions array');
    assert(res.body.data.user.permissions[0] === '*', 'Expected wildcard permission');
  });

  await test('RBAC auth: /auth/me returns creator permissions', async () => {
    const res = await apiRequest('GET', '/api/auth/me', { token: creatorToken });
    assert(res.status === 200, 'Expected 200');
    assert(res.body.data?.user?.permissions?.includes('templates.create'), 'Expected creator permissions');
  });

  await test('RBAC auth: /auth/me returns empty permissions for buyer', async () => {
    const res = await apiRequest('GET', '/api/auth/me', { token: buyerToken });
    assert(res.status === 200, 'Expected 200');
    assert(Array.isArray(res.body.data?.user?.permissions), 'Expected permissions array');
    assert(res.body.data.user.permissions.length === 0, 'Expected buyer permissions to be empty');
  });

  await test('RBAC custom roles: current role assignment endpoint rejects non-built-in roles', async () => {
    financeRoleName = `finance_manager_${Date.now()}`;
    const roleRes = await apiRequest('POST', '/api/rbac/roles', {
      token: superAdminToken,
      body: {
        name: financeRoleName,
        displayName: 'Finance Manager',
        description: 'Handles withdrawal approvals',
        permissions: ['withdrawals.view', 'withdrawals.approve', 'dashboard.admin'],
      },
    });

    assert(roleRes.status === 201, 'Expected 201');

    const assignee = await createTestUser({
      email: `finance-assignee-${Date.now()}@flowbites.com`,
      role: 'buyer',
      name: 'Finance Assignee',
    });

    const assignRes = await apiRequest('PATCH', `/api/admin/users/${assignee.user._id}/role`, {
      token: adminToken,
      body: { role: financeRoleName },
    });

    assert(assignRes.status === 400, 'Expected 400 from current built-in-only role assignment');
  });

  await test('RBAC custom roles: user with a custom role gets the custom permissions via /auth/me', async () => {
    const financeUser = await createTestUser({
      email: `finance-user-${Date.now()}@flowbites.com`,
      role: financeRoleName,
      name: 'Finance Manager User',
    });

    const financeToken = await loginToken(financeUser.user.email);
    const meRes = await apiRequest('GET', '/api/auth/me', { token: financeToken });

    assert(meRes.status === 200, 'Expected 200');
    assert(meRes.body.data?.user?.permissions?.includes('withdrawals.view'), 'Expected custom role permissions');
    assert(meRes.body.data.user.permissions.includes('withdrawals.approve'), 'Expected approval permission');
  });

  await test('RBAC custom roles: user with finance role can access withdrawals admin endpoint', async () => {
    const financeUser = await createTestUser({
      email: `finance-access-${Date.now()}@flowbites.com`,
      role: financeRoleName,
      name: 'Finance Access User',
    });

    const financeToken = await loginToken(financeUser.user.email);
    const res = await apiRequest('GET', '/api/withdrawals/admin', { token: financeToken });
    assert(res.status === 200, 'Expected 200');
  });

  await test('RBAC custom roles: user with finance role cannot access unrelated admin endpoints', async () => {
    const financeUser = await createTestUser({
      email: `finance-restricted-${Date.now()}@flowbites.com`,
      role: financeRoleName,
      name: 'Finance Restricted User',
    });

    const financeToken = await loginToken(financeUser.user.email);
    const usersRes = await apiRequest('GET', '/api/admin/users', { token: financeToken });
    const ticketsRes = await apiRequest('GET', '/api/tickets/admin/all', { token: financeToken });

    assert(usersRes.status === 403, 'Expected 403 for user list');
    assert(ticketsRes.status === 403, 'Expected 403 for ticket admin list');
  });

  await test('RBAC API: custom role cannot be deleted while users are assigned', async () => {
    const assignedUser = await createTestUser({
      email: `finance-delete-block-${Date.now()}@flowbites.com`,
      role: financeRoleName,
      name: 'Finance Delete Block User',
    });
    const rolesRes = await apiRequest('GET', '/api/rbac/roles', { token: superAdminToken });
    const financeRole = rolesRes.body.data.find(role => role.name === financeRoleName);

    assert(assignedUser.user.role === financeRoleName, 'Expected assigned finance role');

    const deleteRes = await apiRequest('DELETE', `/api/rbac/roles/${financeRole._id}`, { token: superAdminToken });
    assert(deleteRes.status === 400, 'Expected 400 while users are assigned');
  });

  await test('RBAC API: custom role can be deleted after all assigned users are removed', async () => {
    const { User } = await import('../../users/user.model.js');

    await User.updateMany({ role: financeRoleName }, { role: 'buyer' });

    const rolesRes = await apiRequest('GET', '/api/rbac/roles', { token: superAdminToken });
    const financeRole = rolesRes.body.data.find(role => role.name === financeRoleName);
    const deleteRes = await apiRequest('DELETE', `/api/rbac/roles/${financeRole._id}`, { token: superAdminToken });

    assert(deleteRes.status === 200, 'Expected 200');
  });

  await test('RBAC API: custom role can be deleted after regression CRUD flow', async () => {
    const deleteRes = await apiRequest('DELETE', `/api/rbac/roles/${createdRoleId}`, { token: superAdminToken });
    assert(deleteRes.status === 200, 'Expected 200');
  });
}
