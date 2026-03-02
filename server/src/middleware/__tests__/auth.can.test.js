import { can } from '../auth.js';

function createResponseRecorder() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.payload = body;
      return this;
    },
  };
}

async function invokeMiddleware(middleware, req) {
  const res = createResponseRecorder();
  let nextCalled = false;

  await middleware(req, res, () => {
    nextCalled = true;
  });

  return { res, nextCalled };
}

export async function runCanMiddlewareTests({ test, assert }) {
  console.log('\n📋 Permission Middleware Tests');

  await test('can(): user with required permission passes', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('templates.approve'),
      { user: { role: 'admin', permissions: ['templates.approve'] } }
    );

    assert(nextCalled === true, 'Expected next() to be called');
    assert(res.payload === null, 'Expected no error response');
  });

  await test('can(): user without required permission gets 403', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('templates.approve'),
      { user: { role: 'creator', permissions: ['templates.create'] } }
    );

    assert(nextCalled === false, 'Expected next() not to be called');
    assert(res.statusCode === 403, 'Expected 403 response');
    assert(res.payload?.error?.includes('Missing required permission'), 'Expected missing permission message');
  });

  await test('can(): super_admin bypasses permission checks', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('anything.at.all'),
      { user: { role: 'super_admin', permissions: [] } }
    );

    assert(nextCalled === true, 'Expected super admin to bypass checks');
    assert(res.payload === null, 'Expected no error response');
  });

  await test('can(): OR logic passes when user has one of multiple permissions', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('perm1', 'perm2'),
      { user: { role: 'admin', permissions: ['perm2'] } }
    );

    assert(nextCalled === true, 'Expected OR permission check to pass');
    assert(res.payload === null, 'Expected no error response');
  });

  await test('can(): OR logic fails when user has none of the required permissions', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('perm1', 'perm2'),
      { user: { role: 'admin', permissions: ['perm3'] } }
    );

    assert(nextCalled === false, 'Expected OR permission check to fail');
    assert(res.statusCode === 403, 'Expected 403 response');
  });

  await test('can(): empty permissions array returns 403', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('templates.approve'),
      { user: { role: 'buyer', permissions: [] } }
    );

    assert(nextCalled === false, 'Expected next() not to be called');
    assert(res.statusCode === 403, 'Expected 403 response');
    assert(res.payload?.error === 'Insufficient permissions', 'Expected insufficient permissions message');
  });

  await test('can(): missing permissions property returns 403', async () => {
    const { res, nextCalled } = await invokeMiddleware(
      can('templates.approve'),
      { user: { role: 'buyer' } }
    );

    assert(nextCalled === false, 'Expected next() not to be called');
    assert(res.statusCode === 403, 'Expected 403 response');
    assert(res.payload?.error === 'Insufficient permissions', 'Expected insufficient permissions message');
  });
}
