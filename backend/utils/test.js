// Batch 1 - API Test Script
// Tests all endpoints for Module 1 & Module 2

const http = require('http');

const BASE = 'http://localhost:5000';
let adminToken = '';
let salesToken = '';

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const test = async (name, fn) => {
  try {
    const result = await fn();
    console.log(`  PASS: ${name}`);
    return result;
  } catch (err) {
    console.log(`  FAIL: ${name} - ${err.message}`);
    return null;
  }
};

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg);
};

const run = async () => {
  console.log('\n========================================');
  console.log('  BATCH 1 - API TESTS');
  console.log('========================================\n');

  // ---- MODULE 1: Health ----
  console.log('--- Module 1: Health & DB ---');
  await test('GET /api/health returns 200', async () => {
    const r = await request('GET', '/api/health');
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.success === true, 'Expected success: true');
    assert(r.body.message === 'API is running', `Got: ${r.body.message}`);
  });

  // ---- MODULE 2: Auth ----
  console.log('\n--- Module 2: Authentication ---');

  // Valid logins
  for (const role of ['admin', 'sales', 'warehouse', 'accounts']) {
    await test(`Login ${role}@example.com`, async () => {
      const r = await request('POST', '/api/auth/login', {
        email: `${role}@example.com`,
        password: 'Password123'
      });
      assert(r.status === 200, `Expected 200, got ${r.status}`);
      assert(r.body.success === true, 'Expected success');
      assert(r.body.token, 'Expected token');
      assert(r.body.user.email === `${role}@example.com`, 'Email mismatch');
      assert(!r.body.user.password, 'Password should NOT be in response');
      if (role === 'admin') adminToken = r.body.token;
      if (role === 'sales') salesToken = r.body.token;
    });
  }

  // Invalid logins
  await test('Login with wrong password returns 401', async () => {
    const r = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'WrongPassword'
    });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
    assert(r.body.success === false, 'Expected success: false');
  });

  await test('Login with unknown email returns 401', async () => {
    const r = await request('POST', '/api/auth/login', {
      email: 'unknown@example.com',
      password: 'Password123'
    });
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test('Login with missing email returns 400', async () => {
    const r = await request('POST', '/api/auth/login', {
      password: 'Password123'
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  await test('Login with missing password returns 400', async () => {
    const r = await request('POST', '/api/auth/login', {
      email: 'admin@example.com'
    });
    assert(r.status === 400, `Expected 400, got ${r.status}`);
  });

  // Auth middleware
  console.log('\n--- Auth Middleware ---');
  await test('GET /api/auth/me with valid token returns user', async () => {
    const r = await request('GET', '/api/auth/me', null, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.success === true, 'Expected success');
    assert(r.body.user.email === 'admin@example.com', 'Email mismatch');
    assert(!r.body.user.password, 'Password should NOT be in response');
  });

  await test('GET /api/auth/me without token returns 401', async () => {
    const r = await request('GET', '/api/auth/me');
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  await test('GET /api/auth/me with invalid token returns 401', async () => {
    const r = await request('GET', '/api/auth/me', null, 'invalid.token.here');
    assert(r.status === 401, `Expected 401, got ${r.status}`);
  });

  // Role middleware
  console.log('\n--- Role Authorization ---');
  await test('GET /api/auth/admin-test with Admin token returns 200', async () => {
    const r = await request('GET', '/api/auth/admin-test', null, adminToken);
    assert(r.status === 200, `Expected 200, got ${r.status}`);
    assert(r.body.success === true, 'Expected success');
  });

  await test('GET /api/auth/admin-test with Sales token returns 403', async () => {
    const r = await request('GET', '/api/auth/admin-test', null, salesToken);
    assert(r.status === 403, `Expected 403, got ${r.status}`);
    assert(r.body.message === 'Access denied', `Got: ${r.body.message}`);
  });

  // Test Warehouse and Accounts
  for (const role of ['warehouse', 'accounts']) {
    await test(`GET /api/auth/admin-test with ${role} token returns 403`, async () => {
      const loginR = await request('POST', '/api/auth/login', {
        email: `${role}@example.com`,
        password: 'Password123'
      });
      const r = await request('GET', '/api/auth/admin-test', null, loginR.body.token);
      assert(r.status === 403, `Expected 403, got ${r.status}`);
    });
  }

  console.log('\n========================================');
  console.log('  ALL TESTS COMPLETED');
  console.log('========================================\n');
  process.exit(0);
};

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
