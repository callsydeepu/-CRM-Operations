// Batch 4 - Full End-to-End System Test
const http = require('http');

const BASE = 'http://localhost:5000';
let adminToken = '';
let salesToken = '';
let warehouseToken = '';
let accountsToken = '';

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
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
    throw err;
  }
};

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg);
};

const run = async () => {
  console.log('\n========================================');
  console.log('  BATCH 4 - FULL SYSTEM END-TO-END TESTS');
  console.log('========================================\n');

  const uniqueId = Date.now();

  // Step 1: Login as Admin
  console.log('--- Step 1: Login as Admin ---');
  await test('Admin Login', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'Password123'
    });
    assert(res.status === 200, 'Login failed');
    assert(res.body.token, 'Token not received');
    adminToken = res.body.token;
  });

  // Step 2: Open Dashboard
  console.log('\n--- Step 2: Open Dashboard ---');
  await test('GET /api/dashboard - Summary statistics', async () => {
    const res = await request('GET', '/api/dashboard', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success: true');
    assert(typeof res.body.data.totalCustomers === 'number', 'Missing totalCustomers');
    assert(typeof res.body.data.totalProducts === 'number', 'Missing totalProducts');
    assert(typeof res.body.data.lowStockItems === 'number', 'Missing lowStockItems');
    assert(Array.isArray(res.body.data.recentChallans), 'Missing recentChallans');
    assert(Array.isArray(res.body.data.lowStockProducts), 'Missing lowStockProducts');
  });

  // Step 3: Create Customer
  console.log('\n--- Step 3: Create Customer ---');
  let customerId = null;
  await test('POST /api/customers - Create Customer', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: `E2E Enterprise Corp ${uniqueId}`,
      mobile_number: '9876543210',
      email: `e2e_${uniqueId}@enterprise.com`,
      business_name: 'Enterprise Solutions Ltd',
      gst_number: '27AABCU9999R1ZZ',
      customer_type: 'Wholesale',
      address: '100 Innovation Way, Tech City',
      status: 'Lead',
      follow_up_date: '2026-09-10',
      notes: 'Initial evaluation inquiry'
    }, adminToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    customerId = res.body.data.id;
  });

  // Step 4: Edit Customer
  console.log('\n--- Step 4: Edit Customer ---');
  await test('PUT /api/customers/:id - Edit Customer', async () => {
    const res = await request('PUT', `/api/customers/${customerId}`, {
      customer_name: `E2E Enterprise Corp Updated ${uniqueId}`,
      status: 'Active',
      customer_type: 'Distributor'
    }, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.status === 'Active', 'Status not updated');
  });

  // Step 5: View Customer & Follow-up
  console.log('\n--- Step 5: View Customer & Follow-up ---');
  await test('GET /api/customers/:id & POST /api/customers/:id/followup', async () => {
    const viewRes = await request('GET', `/api/customers/${customerId}`, null, adminToken);
    assert(viewRes.status === 200, `Expected 200, got ${viewRes.status}`);

    const followRes = await request('POST', `/api/customers/${customerId}/followup`, {
      follow_up_date: '2026-09-18',
      notes: 'Follow-up discussion concluded. Ready for ordering.'
    }, adminToken);
    assert(followRes.status === 200, `Expected 200, got ${followRes.status}`);
    assert(followRes.body.data.notes.includes('Ready for ordering'), 'Notes not saved');
  });

  // Step 6: Add Product
  console.log('\n--- Step 6: Add Product ---');
  let productId = null;
  const sku = `SKU-E2E-${uniqueId}`;
  await test('POST /api/products - Create Product', async () => {
    const res = await request('POST', '/api/products', {
      product_name: `E2E Smart Valve ${uniqueId}`,
      sku,
      category: 'Plumbing',
      unit_price: 150.00,
      current_stock: 0,
      minimum_stock: 25,
      warehouse_location: 'Bay 4-A'
    }, adminToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    productId = res.body.data.id;
    assert(res.body.data.is_low_stock === true, 'Expected is_low_stock: true (0 <= 25)');
  });

  // Step 7: Edit Product
  console.log('\n--- Step 7: Edit Product ---');
  await test('PUT /api/products/:id - Edit Product', async () => {
    const res = await request('PUT', `/api/products/${productId}`, {
      product_name: `E2E Smart Valve Pro ${uniqueId}`,
      unit_price: 175.00
    }, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.unit_price === 175.00, 'Price not updated');
  });

  // Step 8: Add Stock (Stock IN)
  console.log('\n--- Step 8: Add Stock (Stock IN) ---');
  await test('POST /api/inventory/stock-in - Stock IN 100 units', async () => {
    const res = await request('POST', '/api/inventory/stock-in', {
      product_id: productId,
      quantity: 100,
      reason: 'Initial procurement batch'
    }, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.new_stock === 100, `Expected new_stock 100, got ${res.body.data.new_stock}`);
  });

  // Step 9: Verify Inventory
  console.log('\n--- Step 9: Verify Inventory ---');
  await test('GET /api/inventory/movements - Verify Stock IN movement logged', async () => {
    const res = await request('GET', `/api/inventory/movements?product_id=${productId}`, null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length >= 1, 'Expected at least 1 movement');
    assert(res.body.data[0].movement_type === 'IN', 'Expected movement_type: IN');
    assert(res.body.data[0].quantity === 100, 'Expected quantity: 100');
  });

  // Step 10: Create Draft Challan
  console.log('\n--- Step 10: Create Draft Challan ---');
  let challanId = null;
  let challanNumber = null;
  await test('POST /api/challans - Create Draft Challan (30 units)', async () => {
    const res = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [
        { product_id: productId, quantity: 30 }
      ]
    }, adminToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.status === 'Draft', 'Expected Draft status');
    assert(res.body.data.total_quantity === 30, 'Total quantity mismatch');
    challanId = res.body.data.id;
    challanNumber = res.body.data.challan_number;
  });

  // Step 11: Verify Stock Did Not Change
  console.log('\n--- Step 11: Verify Stock Did Not Change for Draft ---');
  await test('GET /api/products/:id - Stock remains 100', async () => {
    const res = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.current_stock === 100, `Expected stock 100, got ${res.body.data.current_stock}`);
  });

  // Step 12 & 13: Confirm Challan & Verify Stock Decreased
  console.log('\n--- Step 12 & 13: Confirm Challan & Verify Stock Deducted ---');
  await test('POST /api/challans/:id/confirm - Deducts 30 units (100 -> 70)', async () => {
    const res = await request('POST', `/api/challans/${challanId}/confirm`, {}, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.status === 'Confirmed', 'Expected Confirmed status');

    const checkProduct = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(checkProduct.body.data.current_stock === 70, `Expected stock 70, got ${checkProduct.body.data.current_stock}`);
  });

  // Step 14: Verify OUT Movement Exists
  console.log('\n--- Step 14: Verify OUT Movement Exists ---');
  await test('GET /api/inventory/movements - Verify OUT movement for challan', async () => {
    const res = await request('GET', `/api/inventory/movements?search=${challanNumber}`, null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length >= 1, 'Expected OUT movement');
    assert(res.body.data[0].movement_type === 'OUT', 'Expected OUT');
    assert(res.body.data[0].quantity === 30, 'Expected 30');
  });

  // Step 15: View Confirmed Challan
  console.log('\n--- Step 15: View Confirmed Challan ---');
  await test('GET /api/challans/:id - Read confirmed challan details', async () => {
    const res = await request('GET', `/api/challans/${challanId}`, null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.status === 'Confirmed', 'Expected Confirmed');
    assert(res.body.data.items[0].product_name_snapshot.includes('E2E Smart Valve Pro'), 'Snapshot mismatch');
  });

  // Step 16, 17, 18: Try Insufficient-Stock Challan & Verify Atomic Rejection
  console.log('\n--- Steps 16, 17, 18: Insufficient Stock Atomic Rejection ---');
  await test('Atomic Shortage Protection - Requesting 999 units fails without modifying stock', async () => {
    const draftRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [{ product_id: productId, quantity: 999 }]
    }, adminToken);
    const shortChallanId = draftRes.body.data.id;

    const confirmRes = await request('POST', `/api/challans/${shortChallanId}/confirm`, {}, adminToken);
    assert(confirmRes.status === 400, `Expected 400, got ${confirmRes.status}`);
    assert(confirmRes.body.message === 'Insufficient stock', 'Expected Insufficient stock');

    // Verify stock remains exactly 70
    const checkProduct = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(checkProduct.body.data.current_stock === 70, `Stock was corrupted! Got ${checkProduct.body.data.current_stock}`);
  });

  // Step 19, 20, 21: Multi-Role Login & Authorization Checks
  console.log('\n--- Steps 19, 20, 21: Multi-Role Authorization Verification ---');
  await test('Warehouse Role Authorization (Can adjust stock, cannot create challans)', async () => {
    const login = await request('POST', '/api/auth/login', { email: 'warehouse@example.com', password: 'Password123' });
    warehouseToken = login.body.token;

    // Can adjust stock
    const stockRes = await request('POST', '/api/inventory/stock-in', { product_id: productId, quantity: 10 }, warehouseToken);
    assert(stockRes.status === 200, 'Warehouse should be able to stock-in');

    // Cannot create customer or challan
    const custRes = await request('POST', '/api/customers', { customer_name: 'Fail', mobile_number: '123' }, warehouseToken);
    assert(custRes.status === 403, `Expected 403, got ${custRes.status}`);

    const chalRes = await request('POST', '/api/challans', { customer_id: customerId, items: [{ product_id: productId, quantity: 1 }] }, warehouseToken);
    assert(chalRes.status === 403, `Expected 403, got ${chalRes.status}`);
  });

  await test('Sales Role Authorization (Can manage customers and challans, cannot stock-in)', async () => {
    const login = await request('POST', '/api/auth/login', { email: 'sales@example.com', password: 'Password123' });
    salesToken = login.body.token;

    // Can create challan
    const chalRes = await request('POST', '/api/challans', { customer_id: customerId, items: [{ product_id: productId, quantity: 1 }] }, salesToken);
    assert(chalRes.status === 201, 'Sales should be able to create challans');

    // Cannot perform direct stock adjustment
    const stockRes = await request('POST', '/api/inventory/stock-in', { product_id: productId, quantity: 10 }, salesToken);
    assert(stockRes.status === 403, `Expected 403, got ${stockRes.status}`);
  });

  await test('Accounts Role Authorization (Read-only access across modules)', async () => {
    const login = await request('POST', '/api/auth/login', { email: 'accounts@example.com', password: 'Password123' });
    accountsToken = login.body.token;

    // Can read
    const getCust = await request('GET', '/api/customers', null, accountsToken);
    const getProd = await request('GET', '/api/products', null, accountsToken);
    const getMov = await request('GET', '/api/inventory/movements', null, accountsToken);
    const getChal = await request('GET', '/api/challans', null, accountsToken);
    const getDash = await request('GET', '/api/dashboard', null, accountsToken);

    assert(getCust.status === 200, 'Accounts should read customers');
    assert(getProd.status === 200, 'Accounts should read products');
    assert(getMov.status === 200, 'Accounts should read movements');
    assert(getChal.status === 200, 'Accounts should read challans');
    assert(getDash.status === 200, 'Accounts should read dashboard');

    // Cannot write
    const postCust = await request('POST', '/api/customers', { customer_name: 'Fail', mobile_number: '123' }, accountsToken);
    assert(postCust.status === 403, 'Accounts cannot write customers');
  });

  console.log('\n========================================');
  console.log('  ALL 21/21 E2E INTEGRATION TESTS PASS');
  console.log('========================================\n');
  process.exit(0);
};

run().catch(err => {
  console.error('E2E runner failed:', err);
  process.exit(1);
});
