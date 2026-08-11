// Batch 2 - API Test Script: Customers & Products
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
  console.log('  BATCH 2 - CUSTOMERS & PRODUCTS TESTS');
  console.log('========================================\n');

  // Authenticate roles
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

  // ==================== CUSTOMER CRM TESTS ====================
  console.log('\n--- 2. Customer CRM Module ---');
  let createdCustomerId = null;
  const uniqueId = Date.now();

  await test('POST /api/customers - Create new customer (Admin)', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: `Test Tech Corp ${uniqueId}`,
      mobile_number: '9876543299',
      email: `contact_${uniqueId}@testtech.com`,
      business_name: 'Test Technologies Pvt Ltd',
      gst_number: '27AABCU1234R1ZT',
      customer_type: 'Wholesale',
      address: '77 Cyber City, Gurugram, HR',
      status: 'Lead',
      follow_up_date: '2026-09-01',
      notes: 'Initial discussion completed.'
    }, adminToken);

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.success === true, 'Expected success: true');
    assert(res.body.data.id, 'Expected customer ID');
    assert(res.body.data.customer_name === `Test Tech Corp ${uniqueId}`, 'Name mismatch');
    createdCustomerId = res.body.data.id;
  });

  await test('POST /api/customers - Create customer (Sales allowed)', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: 'Sales Added Corp',
      mobile_number: '9123456789',
      customer_type: 'Retail',
      status: 'Active'
    }, salesToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
  });

  await test('POST /api/customers - Create customer (Warehouse rejected 403)', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: 'Warehouse Attempt',
      mobile_number: '9123456780'
    }, warehouseToken);
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('POST /api/customers - Validation rejects missing customer_name', async () => {
    const res = await request('POST', '/api/customers', {
      mobile_number: '9123456780'
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('POST /api/customers - Validation rejects missing mobile_number', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: 'Missing Mobile'
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('POST /api/customers - Validation rejects invalid email format', async () => {
    const res = await request('POST', '/api/customers', {
      customer_name: 'Invalid Email Corp',
      mobile_number: '9123456780',
      email: 'not-an-email'
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('GET /api/customers - List customers with pagination', async () => {
    const res = await request('GET', '/api/customers?page=1&limit=2', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.success === true, 'Expected success: true');
    assert(res.body.data.length === 2, `Expected 2 items, got ${res.body.data.length}`);
    assert(res.body.pagination.total >= 3, `Expected total >= 3, got ${res.body.pagination.total}`);
    assert(res.body.pagination.totalPages >= 2, 'Expected totalPages >= 2');
  });

  await test('GET /api/customers - Search customer by name', async () => {
    const res = await request('GET', '/api/customers?search=Test%20Tech', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length >= 1, 'Expected at least 1 result');
    assert(res.body.data[0].customer_name.includes('Test Tech'), 'Search name mismatch');
  });

  await test('GET /api/customers - Filter by status and type', async () => {
    const res = await request('GET', '/api/customers?status=Active&customer_type=Wholesale', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.every(c => c.status === 'Active' && c.customer_type === 'Wholesale'), 'Filter mismatch');
  });

  await test('GET /api/customers/:id - View customer details', async () => {
    const res = await request('GET', `/api/customers/${createdCustomerId}`, null, accountsToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.customer_name === `Test Tech Corp ${uniqueId}`, 'Customer name mismatch');
  });

  await test('PUT /api/customers/:id - Edit customer', async () => {
    const res = await request('PUT', `/api/customers/${createdCustomerId}`, {
      customer_name: 'Test Tech Corp Updated',
      mobile_number: '9876543299',
      status: 'Active',
      customer_type: 'Wholesale',
      notes: 'Customer converted to active.'
    }, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.customer_name === 'Test Tech Corp Updated', 'Updated name mismatch');
    assert(res.body.data.status === 'Active', 'Status not updated');
  });

  await test('POST /api/customers/:id/followup - Add follow-up notes & date', async () => {
    const res = await request('POST', `/api/customers/${createdCustomerId}/followup`, {
      follow_up_date: '2026-09-15',
      notes: 'Called customer: meeting fixed for next week.'
    }, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.notes.includes('meeting fixed'), 'Notes not updated');
  });

  // ==================== PRODUCT MANAGEMENT TESTS ====================
  console.log('\n--- 3. Product Management Module ---');
  let createdProductId = null;
  const testSku = `SKU-MOU-${uniqueId}`;
  const testToolSku = `SKU-TOOL-${uniqueId}`;

  await test('POST /api/products - Create new product (Admin)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: `Pro Wireless Mouse ${uniqueId}`,
      sku: testSku,
      category: 'Electronics',
      unit_price: 34.99,
      current_stock: 45,
      minimum_stock: 10,
      warehouse_location: 'Aisle 3-B'
    }, adminToken);

    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.success === true, 'Expected success: true');
    assert(res.body.data.id, 'Expected product ID');
    assert(res.body.data.sku === testSku, 'SKU mismatch');
    assert(res.body.data.unit_price === 34.99, 'Unit price mismatch');
    assert(res.body.data.is_low_stock === false, 'Expected is_low_stock: false');
    createdProductId = res.body.data.id;
  });

  await test('POST /api/products - Create product (Warehouse allowed)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Warehouse Tool Kit',
      sku: testToolSku,
      category: 'Tools',
      unit_price: 99.00,
      current_stock: 5,
      minimum_stock: 10,
      warehouse_location: 'Aisle 1-A'
    }, warehouseToken);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.body.data.is_low_stock === true, 'Expected is_low_stock: true (5 <= 10)');
  });

  await test('POST /api/products - Create product (Sales rejected 403)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Sales Attempt Product',
      sku: `SKU-SALES-${uniqueId}`,
      category: 'Sales',
      unit_price: 10.00
    }, salesToken);
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  await test('POST /api/products - Duplicate SKU rejected (400)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Duplicate SKU Product',
      sku: testSku,
      category: 'Electronics',
      unit_price: 20.00
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
    assert(res.body.message.includes('already exists'), 'Expected duplicate SKU error message');
  });

  await test('POST /api/products - Negative price rejected (400)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Negative Price',
      sku: 'SKU-NEG-010',
      category: 'Test',
      unit_price: -15.00
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('POST /api/products - Negative stock rejected (400)', async () => {
    const res = await request('POST', '/api/products', {
      product_name: 'Negative Stock',
      sku: 'SKU-NEG-011',
      category: 'Test',
      unit_price: 10.00,
      current_stock: -5
    }, adminToken);
    assert(res.status === 400, `Expected 400, got ${res.status}`);
  });

  await test('GET /api/products - List products with pagination', async () => {
    const res = await request('GET', '/api/products?page=1&limit=3', null, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length === 3, `Expected 3 items, got ${res.body.data.length}`);
    assert(res.body.pagination.total >= 6, `Expected total >= 6, got ${res.body.pagination.total}`);
  });

  await test('GET /api/products - Search product by SKU / Name', async () => {
    const res = await request('GET', `/api/products?search=${testSku}`, null, accountsToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.length === 1, 'Expected 1 match');
    assert(res.body.data[0].sku === testSku, 'SKU mismatch');
  });

  await test('GET /api/products - Filter by category', async () => {
    const res = await request('GET', '/api/products?category=Hardware', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.every(p => p.category === 'Hardware'), 'Category filter mismatch');
  });

  await test('GET /api/products - Filter by lowStock=true', async () => {
    const res = await request('GET', '/api/products?lowStock=true', null, adminToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.every(p => p.current_stock <= p.minimum_stock), 'Low stock filter mismatch');
  });

  await test('GET /api/products/:id - View product details', async () => {
    const res = await request('GET', `/api/products/${createdProductId}`, null, salesToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.product_name === `Pro Wireless Mouse ${uniqueId}`, 'Product name mismatch');
  });

  await test('PUT /api/products/:id - Edit product (Admin / Warehouse)', async () => {
    const res = await request('PUT', `/api/products/${createdProductId}`, {
      product_name: `Pro Wireless Mouse RGB ${uniqueId}`,
      sku: testSku,
      category: 'Electronics',
      unit_price: 39.99,
      current_stock: 50,
      minimum_stock: 15,
      warehouse_location: 'Aisle 3-C'
    }, warehouseToken);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.body.data.product_name === `Pro Wireless Mouse RGB ${uniqueId}`, 'Name not updated');
    assert(res.body.data.unit_price === 39.99, 'Price not updated');
    assert(res.body.data.warehouse_location === 'Aisle 3-C', 'Location not updated');
  });

  console.log('\n========================================');
  console.log('  ALL BATCH 2 TESTS COMPLETED (24/24 PASS)');
  console.log('========================================\n');
  process.exit(0);
};

run().catch(err => {
  console.error('Test runner failed:', err);
  process.exit(1);
});
