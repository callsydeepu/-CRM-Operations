// Batch 5 - Complete Full Suite QA Runner
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

const assert = (condition, msg) => {
  if (!condition) throw new Error(msg);
};

let passCount = 0;
let failCount = 0;

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passCount++;
  } catch (err) {
    console.log(`  [FAIL] ${name} - ${err.message}`);
    failCount++;
    throw err;
  }
};

const runQA = async () => {
  console.log('\n=============================================================');
  console.log('  MODULE 9 & 10: COMPLETE APPLICATION QA & VALIDATION SUITE');
  console.log('=============================================================\n');

  const uniqueId = Date.now();

  // -------------------------------------------------------------
  // 1. AUTHENTICATION & SECURITY TESTS
  // -------------------------------------------------------------
  console.log('--- 1. Authentication & Security ---');

  await test('Admin Login (admin@example.com)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'admin@example.com', password: 'Password123' });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.token, 'Missing JWT token');
    assert(res.body.user.role === 'Admin', 'Role mismatch');
    assert(!res.body.user.password, 'Security violation: Password returned in login response');
    adminToken = res.body.token;
  });

  await test('Sales Login (sales@example.com)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'sales@example.com', password: 'Password123' });
    assert(res.status === 200, 'Sales login failed');
    assert(res.body.user.role === 'Sales', 'Role mismatch');
    salesToken = res.body.token;
  });

  await test('Warehouse Login (warehouse@example.com)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'warehouse@example.com', password: 'Password123' });
    assert(res.status === 200, 'Warehouse login failed');
    assert(res.body.user.role === 'Warehouse', 'Role mismatch');
    warehouseToken = res.body.token;
  });

  await test('Accounts Login (accounts@example.com)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'accounts@example.com', password: 'Password123' });
    assert(res.status === 200, 'Accounts login failed');
    assert(res.body.user.role === 'Accounts', 'Role mismatch');
    accountsToken = res.body.token;
  });

  await test('Rejection of invalid password (401)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'admin@example.com', password: 'WrongPassword!' });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Rejection of unknown email (401)', async () => {
    const res = await request('POST', '/api/auth/login', { email: 'nobody@nowhere.com', password: 'Password123' });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Rejection of missing credentials (400)', async () => {
    const res = await request('POST', '/api/auth/login', { email: '' });
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('GET /api/auth/me returns authenticated profile without password', async () => {
    const res = await request('GET', '/api/auth/me', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.user.email === 'admin@example.com', 'Email mismatch');
    assert(!res.body.user.password, 'Security violation: Password exposed');
  });

  await test('Rejection of unauthenticated request without token (401)', async () => {
    const res = await request('GET', '/api/auth/me', null, null);
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Rejection of malformed/fake token (401)', async () => {
    const res = await request('GET', '/api/auth/me', null, 'fake-invalid-token-12345');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  // -------------------------------------------------------------
  // 2. CUSTOMER CRM MODULE QA
  // -------------------------------------------------------------
  console.log('\n--- 2. Customer CRM Module QA ---');
  let customerId = null;

  await test('Create Customer (Admin / Sales)', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: `QA Client Corp ${uniqueId}`,
      mobile_number: '9876543210',
      email: `qa_${uniqueId}@clientcorp.com`,
      business_name: 'QA Client Corp Ltd',
      gst_number: '27AABCU1234R1ZT',
      customer_type: 'Wholesale',
      address: 'Suite 404, Tech Park, Hyderabad',
      status: 'Lead',
      follow_up_date: '2026-09-25',
      notes: 'Initial requirements shared.'
    }, salesToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    customerId = res.body.data.id;
  });

  await test('Customer Search & Filter by Type / Status', async () => {
    const res = await request('GET', `/api/customers?search=${uniqueId}&status=Lead&customer_type=Wholesale`, null, accountsToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length === 1, 'Expected 1 search match');
    assert(res.body.data[0].id === customerId, 'Matched wrong customer');
  });

  await test('Get Customer by ID', async () => {
    const res = await request('GET', `/api/customers/${customerId}`, null, warehouseToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.customer_name.includes(`QA Client Corp ${uniqueId}`), 'Name mismatch');
  });

  await test('Update Customer Details', async () => {
    const res = await request('PUT', `/api/customers/${customerId}`, {
      customer_name: `QA Client Corp Updated ${uniqueId}`,
      status: 'Active',
      customer_type: 'Distributor'
    }, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.status === 'Active', 'Status not updated');
  });

  await test('Update Follow-up Notes & Date', async () => {
    const res = await request('POST', `/api/customers/${customerId}/followup`, {
      follow_up_date: '2026-09-30',
      notes: 'Follow-up call completed. Client requested product demo.'
    }, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.notes.includes('Client requested product demo'), 'Notes not updated');
  });

  await test('Validation rejects customer with missing name or mobile', async () => {
    const res1 = await request('POST', '/api/customers', { mobile_number: '12345' }, adminToken);
    assert(res1.status === 400, 'Expected 400 for missing name');
    const res2 = await request('POST', '/api/customers', { customer_name: 'Name' }, adminToken);
    assert(res2.status === 400, 'Expected 400 for missing mobile');
  });

  await test('Warehouse & Accounts rejected from mutating customers (403)', async () => {
    const res1 = await request('POST', '/api/customers', { customer_name: 'Fail', mobile_number: '123' }, warehouseToken);
    assert(res1.status === 403, 'Warehouse should get 403 on create customer');
    const res2 = await request('PUT', `/api/customers/${customerId}`, { customer_name: 'Fail' }, accountsToken);
    assert(res2.status === 403, 'Accounts should get 403 on edit customer');
  });

  // -------------------------------------------------------------
  // 3. PRODUCT MANAGEMENT MODULE QA
  // -------------------------------------------------------------
  console.log('\n--- 3. Product Management Module QA ---');
  let productId = null;
  const productSku = `SKU-QA-${uniqueId}`;

  await test('Create Product (Admin / Warehouse)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: `Precision Tool X ${uniqueId}`,
      sku: productSku,
      category: 'Hardware',
      unit_price: 125.00,
      current_stock: 0,
      minimum_stock: 20,
      warehouse_location: 'Bay 5-A'
    }, warehouseToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    productId = res.body.data.id;
    assert(res.body.data.is_low_stock === true, 'Expected is_low_stock: true');
  });

  await test('Duplicate SKU rejected (400)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Duplicate Item',
      sku: productSku,
      category: 'Hardware',
      unit_price: 100.00
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('Negative price & negative stock rejected (400)', async () => {
    const res1 = await request('POST', '/api/products', { product_name: 'P1', sku: `SKU-N1-${uniqueId}`, category: 'C', unit_price: -10 }, adminToken);
    assert(res1.status === 400, 'Negative price not rejected');
    const res2 = await request('POST', '/api/products', { product_name: 'P2', sku: `SKU-N2-${uniqueId}`, category: 'C', unit_price: 10, current_stock: -5 }, adminToken);
    assert(res2.status === 400, 'Negative stock not rejected');
  });

  await test('Search Product & Low Stock Filter', async () => {
    const res = await request('GET', `/api/products?search=${productSku}&lowStock=true`, null, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length === 1, 'Expected 1 match');
  });

  await test('Sales & Accounts rejected from mutating products (403)', async () => {
    const res = await request('POST', '/api/products', { product_name: 'Fail', sku: `SKU-F-${uniqueId}`, category: 'C', unit_price: 10 }, salesToken);
    assert(res.status === 403, 'Sales should get 403 on create product');
  });

  // -------------------------------------------------------------
  // 4. INVENTORY / STOCK MOVEMENTS QA
  // -------------------------------------------------------------
  console.log('\n--- 4. Inventory / Stock Movements QA ---');

  await test('Stock IN increases stock & logs movement', async () => {
    const res = await request('POST', '/api/inventory/stock-in', {
      product_id: productId,
      quantity: 150,
      reason: 'Batch receiving from vendor'
    }, warehouseToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.new_stock === 150, 'Stock did not increase to 150');

    // Verify stock level in products query
    const prod = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(prod.body.data.current_stock === 150, 'Current stock mismatch');
    assert(prod.body.data.is_low_stock === false, 'Expected is_low_stock: false (150 > 20)');
  });

  await test('Stock OUT decreases stock & logs movement', async () => {
    const res = await request('POST', '/api/inventory/stock-out', {
      product_id: productId,
      quantity: 50,
      reason: 'Internal engineering allocation'
    }, warehouseToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.new_stock === 100, 'Stock did not decrease to 100');
  });

  await test('Stock OUT over available quantity rejected without negative balance', async () => {
    const res = await request('POST', '/api/inventory/stock-out', {
      product_id: productId,
      quantity: 999,
      reason: 'Excess request'
    }, warehouseToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(res.body.message === 'Insufficient stock', 'Expected Insufficient stock');

    const check = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(check.body.data.current_stock === 100, 'Stock was corrupted');
  });

  // -------------------------------------------------------------
  // 5. SPECIFIC REQUIRED TEST: PRODUCT SNAPSHOT TEST
  // -------------------------------------------------------------
  console.log('\n--- 5. Product Snapshot Preservation Test ---');

  await test('Product Snapshot Test: Catalog edits do not mutate historical snapshot on challan', async () => {
    // 1. Create product: Name = Keyboard, SKU = KEY-001, Price = 500
    const kbdSku = `KEY-${uniqueId}`;
    const kbdRes = await request('POST', '/api/products', {
      product_name: `Keyboard ${uniqueId}`,
      sku: kbdSku,
      category: 'Electronics',
      unit_price: 500.00,
      current_stock: 50,
      minimum_stock: 10
    }, adminToken);
    const kbdId = kbdRes.body.data.id;

    // 2. Create Draft Challan using this product
    const chalRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [{ product_id: kbdId, quantity: 5 }]
    }, salesToken);
    const snapChallanId = chalRes.body.data.id;

    // 3. Change product in catalog: Name = Mechanical Keyboard, SKU = KEY-002, Price = 700
    const newKbdSku = `KEY-002-${uniqueId}`;
    await request('PUT', `/api/products/${kbdId}`, {
      product_name: `Mechanical Keyboard ${uniqueId}`,
      sku: newKbdSku,
      unit_price: 700.00
    }, adminToken);

    // 4. Verify existing challan displays original snapshot (Keyboard, KEY-001, 500)
    const viewChallan = await request('GET', `/api/challans/${snapChallanId}`, null, adminToken);
    assert(viewChallan.status === 200, `Expected 200, got ${viewChallan.status}`);
    const snapItem = viewChallan.body.data.items.find(i => i.product_id === kbdId);
    assert(snapItem.product_name_snapshot === `Keyboard ${uniqueId}`, `Snapshot name mutated! Got: ${snapItem.product_name_snapshot}`);
    assert(snapItem.sku_snapshot === kbdSku, `Snapshot SKU mutated! Got: ${snapItem.sku_snapshot}`);
    assert(snapItem.unit_price_snapshot === 500, `Snapshot price mutated! Got: ${snapItem.unit_price_snapshot}`);
  });

  // -------------------------------------------------------------
  // 6. SPECIFIC REQUIRED TEST: INSUFFICIENT STOCK ATOMICITY
  // -------------------------------------------------------------
  console.log('\n--- 6. Insufficient Stock Atomic Rollback Test ---');

  await test('Insufficient Stock Test: A=100, B=5; Request A=20, B=10 -> Rejects with ZERO partial deduction', async () => {
    // Setup Product A (Stock = 100) and Product B (Stock = 5)
    const prodARes = await request('POST', '/api/products', {
      product_name: `Item A ${uniqueId}`,
      sku: `SKU-A-${uniqueId}`,
      category: 'Hardware',
      unit_price: 10.00,
      current_stock: 100,
      minimum_stock: 10
    }, adminToken);
    const itemAId = prodARes.body.data.id;

    const prodBRes = await request('POST', '/api/products', {
      product_name: `Item B ${uniqueId}`,
      sku: `SKU-B-${uniqueId}`,
      category: 'Hardware',
      unit_price: 20.00,
      current_stock: 5,
      minimum_stock: 5
    }, adminToken);
    const itemBId = prodBRes.body.data.id;

    // Create Draft Challan: A = 20, B = 10
    const challanRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [
        { product_id: itemAId, quantity: 20 },
        { product_id: itemBId, quantity: 10 }
      ]
    }, salesToken);
    const testChalId = challanRes.body.data.id;

    // Confirm -> Expected: FAILS with insufficient stock
    const confirmRes = await request('POST', `/api/challans/${testChalId}/confirm`, {}, salesToken);
    assert(confirmRes.status === 400, `Expected 400, got ${confirmRes.status}`);
    assert(confirmRes.body.message === 'Insufficient stock', `Expected Insufficient stock, got: ${confirmRes.body.message}`);

    // Verify stock remains exactly A = 100, B = 5 (NO partial deduction)
    const checkA = await request('GET', `/api/products/${itemAId}`, null, adminToken);
    const checkB = await request('GET', `/api/products/${itemBId}`, null, adminToken);
    assert(checkA.body.data.current_stock === 100, `Item A stock changed! Got: ${checkA.body.data.current_stock}`);
    assert(checkB.body.data.current_stock === 5, `Item B stock changed! Got: ${checkB.body.data.current_stock}`);

    // Verify challan remains Draft
    const checkChallan = await request('GET', `/api/challans/${testChalId}`, null, adminToken);
    assert(checkChallan.body.data.status === 'Draft', 'Challan should remain Draft');
  });

  // -------------------------------------------------------------
  // 7. END-TO-END BUSINESS FLOW VERIFICATION
  // -------------------------------------------------------------
  console.log('\n--- 7. End-to-End Business Flow ---');

  await test('Full E2E Flow: Draft -> Confirm -> Deduct -> Audit OUT -> Dashboard Update', async () => {
    // 1. Create Draft Challan
    const draftRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [{ product_id: productId, quantity: 25 }]
    }, salesToken);
    assert(draftRes.status === 201, 'Create draft failed');
    const flowChallanId = draftRes.body.data.id;
    const flowChallanNumber = draftRes.body.data.challan_number;

    // Verify stock unchanged for Draft
    const beforeConfirm = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(beforeConfirm.body.data.current_stock === 100, 'Draft should not deduct stock');

    // 2. Confirm Challan
    const confirmRes = await request('POST', `/api/challans/${flowChallanId}/confirm`, {}, salesToken);
    assert(confirmRes.status === 200, 'Confirmation failed');
    assert(confirmRes.body.data.status === 'Confirmed', 'Status not Confirmed');

    // 3. Verify stock decreased: 100 - 25 = 75
    const afterConfirm = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(afterConfirm.body.data.current_stock === 75, `Stock not 75, got: ${afterConfirm.body.data.current_stock}`);

    // 4. Verify OUT movement logged
    const movementRes = await request('GET', `/api/inventory/movements?search=${flowChallanNumber}`, null, adminToken);
    assert(movementRes.status === 200, 'Failed to fetch movements');
    assert(movementRes.body.data.length >= 1, 'OUT movement not found');
    assert(movementRes.body.data[0].movement_type === 'OUT', 'Expected movement_type OUT');

    // 5. Verify Confirmed challan cannot be edited or re-confirmed
    const editRes = await request('PUT', `/api/challans/${flowChallanId}`, { customer_id: customerId, items: [] }, salesToken);
    assert(editRes.status === 400, 'Editing confirmed challan must fail');

    const reConfirmRes = await request('POST', `/api/challans/${flowChallanId}/confirm`, {}, salesToken);
    assert(reConfirmRes.status === 400, 'Re-confirming confirmed challan must fail');

    // 6. Dashboard metrics reflect updated counts
    const dashRes = await request('GET', '/api/dashboard', null, adminToken);
    assert(dashRes.status === 200, 'Dashboard request failed');
    assert(dashRes.body.data.confirmedChallans >= 1, 'Confirmed challans count not updated');
  });

  // -------------------------------------------------------------
  // 8. CHALLAN CANCELLATION
  // -------------------------------------------------------------
  console.log('\n--- 8. Challan Cancellation QA ---');

  await test('Cancel Draft Challan leaves inventory intact', async () => {
    const draftRes = await request('POST', '/api/challans', {
      customer_id: customerId,
      items: [{ product_id: productId, quantity: 10 }]
    }, salesToken);
    const cancelId = draftRes.body.data.id;

    const cancelRes = await request('POST', `/api/challans/${cancelId}/cancel`, {}, salesToken);
    assert(cancelRes.status === 200, 'Cancel request failed');
    assert(cancelRes.body.data.status === 'Cancelled', 'Status not Cancelled');

    // Stock untouched (remains 75)
    const checkStock = await request('GET', `/api/products/${productId}`, null, adminToken);
    assert(checkStock.body.data.current_stock === 75, 'Cancelled draft altered stock');
  });

  console.log('\n=============================================================');
  console.log(`  QA SUITE FINISHED: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('=============================================================\n');

  if (failCount > 0) process.exit(1);
  process.exit(0);
};

runQA().catch(err => {
  console.error('QA Runner encountered error:', err);
  process.exit(1);
});
