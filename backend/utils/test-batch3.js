// Batch 3 - API Test Script: Inventory Stock Movements & Sales Challans
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
  console.log('  BATCH 3 - INVENTORY & SALES CHALLANS TESTS');
  console.log('========================================\n');

  // 1. Authenticate roles
  console.log('--- 1. Authenticating Test Users ---');
  const roles = ['admin', 'sales', 'warehouse', 'accounts'];
  for (const r of roles) {
    const res = await request('POST', '/api/auth/login', {
      email: `${r}@example.com`,
      password: 'Password123'
    });
    assert(res.status === 200, `Login failed for ${r}`);
    if (r === 'admin') adminToken = res.body.token;
    if (r === 'sales') salesToken = res.body.token;
    if (r === 'warehouse') warehouseToken = res.body.token;
    if (r === 'accounts') accountsToken = res.body.token;
  }
  console.log('  PASS: All 4 test users logged in');

  const uniqueId = Date.now();

  // Create clean test products & customer
  const customerRes = await request('POST', '/api/customers', {
    customer_name: `Batch3 Customer ${uniqueId}`,
    mobile_number: '9876543210',
    customer_type: 'Wholesale'
  }, adminToken);
  const customerId = customerRes.body.data.id;

  const prodARes = await request('POST', '/api/products', {
    product_name: `Product Alpha ${uniqueId}`,
    sku: `SKU-ALP-${uniqueId}`,
    category: 'Hardware',
    unit_price: 50.00,
    current_stock: 100,
    minimum_stock: 20
  }, adminToken);
  const prodA = prodARes.body.data;

  const prodBRes = await request('POST', '/api/products', {
    product_name: `Product Beta ${uniqueId}`,
    sku: `SKU-BET-${uniqueId}`,
    category: 'Hardware',
    unit_price: 80.00,
    current_stock: 50,
    minimum_stock: 10
  }, adminToken);
  const prodB = prodBRes.body.data;

  // ==================== INVENTORY TESTS ====================
  console.log('\n--- 2. Inventory / Stock Movements ---');

  await test('POST /api/inventory/stock-in - Stock IN increases stock', async () => {
    const res = await request('POST', '/api/inventory/stock-in', {
      product_id: prodA.id,
      quantity: 25,
      reason: 'Supplier delivery batch #1'
    }, warehouseToken);

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success');
    assert(res.body.data.new_stock === 125, `Expected 125, got ${res.body.data.new_stock}`);

    // Verify in product query
    const check = await request('GET', `/api/products/${prodA.id}`, null, adminToken);
    assert(check.body.data.current_stock === 125, 'Current stock not 125');
  });

  await test('POST /api/inventory/stock-out - Stock OUT decreases stock', async () => {
    const res = await request('POST', '/api/inventory/stock-out', {
      product_id: prodA.id,
      quantity: 25,
      reason: 'Sample dispatch'
    }, warehouseToken);

    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.new_stock === 100, `Expected 100, got ${res.body.data.new_stock}`);
  });

  await test('POST /api/inventory/stock-out - Rejects when requested > current_stock (no negative stock)', async () => {
    const res = await request('POST', '/api/inventory/stock-out', {
      product_id: prodA.id,
      quantity: 999,
      reason: 'Over-request attempt'
    }, adminToken);

    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(res.body.success === false, 'Expected success: false');
    assert(res.body.message === 'Insufficient stock', `Got message: ${res.body.message}`);

    // Verify stock unchanged
    const check = await request('GET', `/api/products/${prodA.id}`, null, adminToken);
    assert(check.body.data.current_stock === 100, 'Stock was corrupted');
  });

  await test('POST /api/inventory/stock-in - Sales role rejected (403)', async () => {
    const res = await request('POST', '/api/inventory/stock-in', {
      product_id: prodA.id,
      quantity: 10
    }, salesToken);
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('GET /api/inventory/movements - Lists movements log with user and product details', async () => {
    const res = await request('GET', `/api/inventory/movements?product_id=${prodA.id}`, null, accountsToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length >= 2, `Expected >= 2 movements, got ${res.body.data.length}`);
    assert(res.body.data[0].created_by_name, 'Missing created_by_name');
    assert(res.body.data[0].product_name, 'Missing product_name');
  });

  // ==================== SALES CHALLANS TESTS ====================
  console.log('\n--- 3. Sales Challans Module ---');

  let challan1Id = null;
  let challan1Number = null;

  await test('POST /api/challans - Create Draft Challan (Draft does NOT modify stock)', async () => {
    const res = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [
        { product_id: prodA.id, quantity: 20 },
        { product_id: prodB.id, quantity: 10 }
      ]
    }, salesToken);

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.status === 'Draft', 'Expected Draft status');
    assert(res.body.data.challan_number.startsWith('CH-'), 'Expected CH- prefix in challan_number');
    assert(res.body.data.total_quantity === 30, `Expected total_quantity: 30, got ${res.body.data.total_quantity}`);
    assert(res.body.data.items[0].product_name_snapshot, 'Missing product_name_snapshot');
    assert(res.body.data.items[0].sku_snapshot, 'Missing sku_snapshot');
    assert(res.body.data.items[0].unit_price_snapshot === 50, 'Snapshot price mismatch');

    challan1Id = res.body.data.id;
    challan1Number = res.body.data.challan_number;

    // Verify stock is UNCHANGED for Draft
    const checkA = await request('GET', `/api/products/${prodA.id}`, null, adminToken);
    const checkB = await request('GET', `/api/products/${prodB.id}`, null, adminToken);
    assert(checkA.body.data.current_stock === 100, `Expected ProdA stock 100, got ${checkA.body.data.current_stock}`);
    assert(checkB.body.data.current_stock === 50, `Expected ProdB stock 50, got ${checkB.body.data.current_stock}`);
  });

  await test('Challan Snapshot Test - Changing product catalog does not alter challan snapshot', async () => {
    // Update Product Alpha's price and name in the catalog
    await request('PUT', `/api/products/${prodA.id}`, {
      product_name: `Product Alpha Renamed ${uniqueId}`,
      unit_price: 999.00
    }, adminToken);

    // Retrieve Draft Challan and verify it preserved original snapshot values
    const res = await request('GET', `/api/challans/${challan1Id}`, null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const itemA = res.body.data.items.find(i => i.product_id === prodA.id);
    assert(itemA.product_name_snapshot === `Product Alpha ${uniqueId}`, 'Snapshot name was mutated');
    assert(itemA.unit_price_snapshot === 50, 'Snapshot price was mutated');
  });

  await test('PUT /api/challans/:id - Edit Draft Challan', async () => {
    const res = await request('PUT', `/api/challans/${challan1Id}`, {
      customer_id: customerId,
      items: [
        { product_id: prodA.id, quantity: 20 },
        { product_id: prodB.id, quantity: 10 }
      ]
    }, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.total_quantity === 30, 'Total quantity mismatch');
  });

  await test('POST /api/challans/:id/confirm - Confirm Challan successfully reduces stock and logs OUT movements', async () => {
    const res = await request('POST', `/api/challans/${challan1Id}/confirm`, {}, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.status === 'Confirmed', 'Challan status not Confirmed');

    // Verify stock is deducted: A was 100 - 20 = 80, B was 50 - 10 = 40
    const checkA = await request('GET', `/api/products/${prodA.id}`, null, adminToken);
    const checkB = await request('GET', `/api/products/${prodB.id}`, null, adminToken);
    assert(checkA.body.data.current_stock === 80, `Expected ProdA stock 80, got ${checkA.body.data.current_stock}`);
    assert(checkB.body.data.current_stock === 40, `Expected ProdB stock 40, got ${checkB.body.data.current_stock}`);

    // Verify OUT movements created with challan reference
    const movements = await request('GET', `/api/inventory/movements?search=${challan1Number}`, null, adminToken);
    assert(movements.body.data.length === 2, `Expected 2 movements for challan, got ${movements.body.data.length}`);
    assert(movements.body.data.every(m => m.movement_type === 'OUT'), 'Expected OUT movement type');
  });

  await test('PUT /api/challans/:id - Confirmed challan cannot be edited (400)', async () => {
    const res = await request('PUT', `/api/challans/${challan1Id}`, {
      customer_id: customerId,
      items: [{ product_id: prodA.id, quantity: 5 }]
    }, salesToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('POST /api/challans/:id/confirm - Confirmed challan cannot be re-confirmed (400)', async () => {
    const res = await request('POST', `/api/challans/${challan1Id}/confirm`, {}, salesToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  // ==================== CRITICAL ATOMIC TRANSACTION TEST ====================
  console.log('\n--- 4. Critical Atomic Transaction Test ---');

  await test('Atomic Rollback Test: Over-request of Product A (90 > 80) fails with NO partial deduction', async () => {
    // Current: A = 80, B = 40
    // Request: A = 90, B = 20
    const draftRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [
        { product_id: prodA.id, quantity: 90 }, // Insufficient (80 available)
        { product_id: prodB.id, quantity: 20 }  // Sufficient (40 available)
      ]
    }, salesToken);

    const draftId = draftRes.body.data.id;

    // Attempt to confirm
    const confirmRes = await request('POST', `/api/challans/${draftId}/confirm`, {}, salesToken);
    assert(confirmRes.status === 400, `Expected 400, got ${confirmRes.status}`);
    assert(confirmRes.body.message === 'Insufficient stock', `Expected Insufficient stock, got: ${confirmRes.body.message}`);

    // Verify stock is completely UNCHANGED: A must be 80, B must be 40 (NO partial deduction!)
    const checkA = await request('GET', `/api/products/${prodA.id}`, null, adminToken);
    const checkB = await request('GET', `/api/products/${prodB.id}`, null, adminToken);
    assert(checkA.body.data.current_stock === 80, `Atomic check failed! ProdA stock: ${checkA.body.data.current_stock}`);
    assert(checkB.body.data.current_stock === 40, `Atomic check failed! ProdB stock: ${checkB.body.data.current_stock}`);

    // Verify challan status remains Draft
    const checkChallan = await request('GET', `/api/challans/${draftId}`, null, adminToken);
    assert(checkChallan.body.data.status === 'Draft', 'Challan status should remain Draft');
  });

  // ==================== CANCELLATION TEST ====================
  console.log('\n--- 5. Challan Cancellation ---');

  await test('POST /api/challans/:id/cancel - Cancel Draft challan (does NOT modify stock)', async () => {
    const draftRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [{ product_id: prodB.id, quantity: 5 }]
    }, salesToken);

    const cancelRes = await request('POST', `/api/challans/${draftRes.body.data.id}/cancel`, {}, salesToken);
    assert(cancelRes.status === 200, `Expected 200, got ${cancelRes.status}`);
    assert(cancelRes.body.data.status === 'Cancelled', 'Expected Cancelled status');

    // Stock unchanged
    const checkB = await request('GET', `/api/products/${prodB.id}`, null, adminToken);
    assert(checkB.body.data.current_stock === 40, 'Stock was altered on cancellation');
  });

  console.log('\n========================================');
  console.log('  ALL BATCH 3 TESTS COMPLETED');
  console.log('========================================\n');
  process.exit(0);
};

run().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
