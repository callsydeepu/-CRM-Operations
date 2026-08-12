require('dotenv').config({ path: '.env' });

const BASE_URL = 'http://localhost:5000/api';

const runRBACTestSuite = async () => {
  console.log('====================================================');
  console.log('  STARTING RBAC ROLE-PERMISSION DIRECT API AUDIT    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assertEqual = (testName, actual, expected) => {
    if (actual === expected) {
      console.log(`  ✓ PASS: ${testName} (Status: ${actual})`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - Expected ${expected}, got ${actual}`);
      failed++;
    }
  };

  try {
    const timestamp = Date.now();

    const req = async (method, path, token = null, body = null) => {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);

      const res = await fetch(`${BASE_URL}${path}`, options);
      let json = null;
      try {
        json = await res.json();
      } catch (e) {}
      return { status: res.status, data: json };
    };

    // Helper: Register & get token for a given role
    const getRoleToken = async (roleName) => {
      const email = `${roleName.toLowerCase()}_${timestamp}@rbac-test.com`;
      const res = await req('POST', '/auth/register', null, {
        name: `RBAC ${roleName}`,
        email,
        password: 'Password123!',
        role: roleName
      });
      if (!res.data || !res.data.token) {
        throw new Error(`Failed to register ${roleName}: ${JSON.stringify(res.data)}`);
      }
      return { token: res.data.token, user: res.data.user };
    };

    console.log('[Setup] Registering test accounts for all 4 roles...');
    const admin = await getRoleToken('Admin');
    const sales = await getRoleToken('Sales');
    const warehouse = await getRoleToken('Warehouse');
    const accounts = await getRoleToken('Accounts');
    console.log('  ✓ Admin, Sales, Warehouse, and Accounts tokens acquired.\n');

    // Create an initial customer & product using Admin for test target fixtures
    console.log('[Setup] Creating baseline fixtures via Admin...');
    const custRes = await req('POST', '/customers', admin.token, {
      customer_name: `RBAC Customer ${timestamp}`,
      mobile_number: '9999988888',
      email: `cust_${timestamp}@test.com`,
      customer_type: 'Wholesale',
      status: 'Active'
    });
    const testCustomerId = custRes.data.data.id;

    const prodRes = await req('POST', '/products', admin.token, {
      product_name: `RBAC Product ${timestamp}`,
      sku: `SKU-RBAC-${timestamp}`,
      category: 'Hardware',
      unit_price: 150.00,
      current_stock: 100,
      minimum_stock: 10
    });
    const testProductId = prodRes.data.data.id;

    const challanRes = await req('POST', '/challans', admin.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 5 }]
    });
    const testChallanId = challanRes.data.data.id;
    console.log(`  ✓ Baseline fixtures created: Customer #${testCustomerId}, Product #${testProductId}, Challan #${testChallanId}\n`);

    console.log('====================================================');
    console.log('  TESTING 1: CUSTOMER CRM PERMISSIONS');
    console.log('====================================================');
    // View Customers
    assertEqual('Admin can view customers', (await req('GET', '/customers', admin.token)).status, 200);
    assertEqual('Sales can view customers', (await req('GET', '/customers', sales.token)).status, 200);
    assertEqual('Warehouse can view customers', (await req('GET', '/customers', warehouse.token)).status, 200);
    assertEqual('Accounts can view customers', (await req('GET', '/customers', accounts.token)).status, 200);

    // Create Customer
    assertEqual('Admin can create customer', (await req('POST', '/customers', admin.token, {
      customer_name: `Admin Cust ${timestamp}`,
      mobile_number: '1111111111'
    })).status, 201);
    assertEqual('Sales can create customer', (await req('POST', '/customers', sales.token, {
      customer_name: `Sales Cust ${timestamp}`,
      mobile_number: '2222222222'
    })).status, 201);
    assertEqual('Warehouse CANNOT create customer (403)', (await req('POST', '/customers', warehouse.token, {
      customer_name: `Warehouse Cust ${timestamp}`,
      mobile_number: '3333333333'
    })).status, 403);
    assertEqual('Accounts CANNOT create customer (403)', (await req('POST', '/customers', accounts.token, {
      customer_name: `Accounts Cust ${timestamp}`,
      mobile_number: '4444444444'
    })).status, 403);

    // Edit Customer
    assertEqual('Admin can edit customer', (await req('PUT', `/customers/${testCustomerId}`, admin.token, { status: 'Active' })).status, 200);
    assertEqual('Sales can edit customer', (await req('PUT', `/customers/${testCustomerId}`, sales.token, { status: 'Active' })).status, 200);
    assertEqual('Warehouse CANNOT edit customer (403)', (await req('PUT', `/customers/${testCustomerId}`, warehouse.token, { status: 'Active' })).status, 403);
    assertEqual('Accounts CANNOT edit customer (403)', (await req('PUT', `/customers/${testCustomerId}`, accounts.token, { status: 'Active' })).status, 403);

    // Follow-up Notes
    assertEqual('Admin can update follow-up', (await req('POST', `/customers/${testCustomerId}/followup`, admin.token, { notes: 'Admin note' })).status, 200);
    assertEqual('Sales can update follow-up', (await req('POST', `/customers/${testCustomerId}/followup`, sales.token, { notes: 'Sales note' })).status, 200);
    assertEqual('Warehouse CANNOT update follow-up (403)', (await req('POST', `/customers/${testCustomerId}/followup`, warehouse.token, { notes: 'Wh note' })).status, 403);
    assertEqual('Accounts CANNOT update follow-up (403)', (await req('POST', `/customers/${testCustomerId}/followup`, accounts.token, { notes: 'Acc note' })).status, 403);

    console.log('\n====================================================');
    console.log('  TESTING 2: PRODUCT MANAGEMENT PERMISSIONS');
    console.log('====================================================');
    // View Products
    assertEqual('Admin can view products', (await req('GET', '/products', admin.token)).status, 200);
    assertEqual('Sales can view products', (await req('GET', '/products', sales.token)).status, 200);
    assertEqual('Warehouse can view products', (await req('GET', '/products', warehouse.token)).status, 200);
    assertEqual('Accounts can view products', (await req('GET', '/products', accounts.token)).status, 200);

    // Create Product
    assertEqual('Admin can create product', (await req('POST', '/products', admin.token, {
      product_name: `Admin Product ${timestamp}`,
      sku: `SKU-ADM-${timestamp}`,
      category: 'Tools',
      unit_price: 50,
      current_stock: 10,
      minimum_stock: 2
    })).status, 201);
    assertEqual('Warehouse can create product', (await req('POST', '/products', warehouse.token, {
      product_name: `Warehouse Product ${timestamp}`,
      sku: `SKU-WH-${timestamp}`,
      category: 'Tools',
      unit_price: 60,
      current_stock: 20,
      minimum_stock: 5
    })).status, 201);
    assertEqual('Sales CANNOT create product (403)', (await req('POST', '/products', sales.token, {
      product_name: `Sales Product ${timestamp}`,
      sku: `SKU-SL-${timestamp}`,
      category: 'Tools',
      unit_price: 70,
      current_stock: 30,
      minimum_stock: 5
    })).status, 403);
    assertEqual('Accounts CANNOT create product (403)', (await req('POST', '/products', accounts.token, {
      product_name: `Accounts Product ${timestamp}`,
      sku: `SKU-ACC-${timestamp}`,
      category: 'Tools',
      unit_price: 80,
      current_stock: 40,
      minimum_stock: 5
    })).status, 403);

    // Edit Product
    assertEqual('Admin can edit product', (await req('PUT', `/products/${testProductId}`, admin.token, { unit_price: 155 })).status, 200);
    assertEqual('Warehouse can edit product', (await req('PUT', `/products/${testProductId}`, warehouse.token, { unit_price: 160 })).status, 200);
    assertEqual('Sales CANNOT edit product (403)', (await req('PUT', `/products/${testProductId}`, sales.token, { unit_price: 165 })).status, 403);
    assertEqual('Accounts CANNOT edit product (403)', (await req('PUT', `/products/${testProductId}`, accounts.token, { unit_price: 170 })).status, 403);

    console.log('\n====================================================');
    console.log('  TESTING 3: INVENTORY / STOCK MOVEMENT PERMISSIONS');
    console.log('====================================================');
    // View Movements
    assertEqual('Admin can view stock movements', (await req('GET', '/inventory/movements', admin.token)).status, 200);
    assertEqual('Sales can view stock movements', (await req('GET', '/inventory/movements', sales.token)).status, 200);
    assertEqual('Warehouse can view stock movements', (await req('GET', '/inventory/movements', warehouse.token)).status, 200);
    assertEqual('Accounts can view stock movements', (await req('GET', '/inventory/movements', accounts.token)).status, 200);

    // Stock IN
    assertEqual('Admin can perform Stock IN', (await req('POST', '/inventory/stock-in', admin.token, {
      product_id: testProductId,
      quantity: 10,
      reason: 'Admin restock'
    })).status, 200);
    assertEqual('Warehouse can perform Stock IN', (await req('POST', '/inventory/stock-in', warehouse.token, {
      product_id: testProductId,
      quantity: 10,
      reason: 'Warehouse restock'
    })).status, 200);
    assertEqual('Sales CANNOT perform Stock IN (403)', (await req('POST', '/inventory/stock-in', sales.token, {
      product_id: testProductId,
      quantity: 10,
      reason: 'Sales attempt'
    })).status, 403);
    assertEqual('Accounts CANNOT perform Stock IN (403)', (await req('POST', '/inventory/stock-in', accounts.token, {
      product_id: testProductId,
      quantity: 10,
      reason: 'Accounts attempt'
    })).status, 403);

    // Stock OUT
    assertEqual('Admin can perform Stock OUT', (await req('POST', '/inventory/stock-out', admin.token, {
      product_id: testProductId,
      quantity: 2,
      reason: 'Admin disposal'
    })).status, 200);
    assertEqual('Warehouse can perform Stock OUT', (await req('POST', '/inventory/stock-out', warehouse.token, {
      product_id: testProductId,
      quantity: 2,
      reason: 'Warehouse disposal'
    })).status, 200);
    assertEqual('Sales CANNOT perform Stock OUT (403)', (await req('POST', '/inventory/stock-out', sales.token, {
      product_id: testProductId,
      quantity: 2,
      reason: 'Sales attempt'
    })).status, 403);
    assertEqual('Accounts CANNOT perform Stock OUT (403)', (await req('POST', '/inventory/stock-out', accounts.token, {
      product_id: testProductId,
      quantity: 2,
      reason: 'Accounts attempt'
    })).status, 403);

    console.log('\n====================================================');
    console.log('  TESTING 4: SALES CHALLAN PERMISSIONS');
    console.log('====================================================');
    // View Challans
    assertEqual('Admin can view challans', (await req('GET', '/challans', admin.token)).status, 200);
    assertEqual('Sales can view challans', (await req('GET', '/challans', sales.token)).status, 200);
    assertEqual('Warehouse can view challans', (await req('GET', '/challans', warehouse.token)).status, 200);
    assertEqual('Accounts can view challans', (await req('GET', '/challans', accounts.token)).status, 200);

    // Create Challan
    assertEqual('Admin can create challan', (await req('POST', '/challans', admin.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 1 }]
    })).status, 201);
    assertEqual('Sales can create challan', (await req('POST', '/challans', sales.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 1 }]
    })).status, 201);
    assertEqual('Warehouse CANNOT create challan (403)', (await req('POST', '/challans', warehouse.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 1 }]
    })).status, 403);
    assertEqual('Accounts CANNOT create challan (403)', (await req('POST', '/challans', accounts.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 1 }]
    })).status, 403);

    // Create another Draft challan for edit/confirm tests
    const cSalesRes = await req('POST', '/challans', sales.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 2 }]
    });
    const draftChallanId = cSalesRes.data.data.id;

    // Edit Draft Challan
    assertEqual('Admin can edit draft challan', (await req('PUT', `/challans/${draftChallanId}`, admin.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 3 }]
    })).status, 200);
    assertEqual('Sales can edit draft challan', (await req('PUT', `/challans/${draftChallanId}`, sales.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 4 }]
    })).status, 200);
    assertEqual('Warehouse CANNOT edit draft challan (403)', (await req('PUT', `/challans/${draftChallanId}`, warehouse.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 5 }]
    })).status, 403);
    assertEqual('Accounts CANNOT edit draft challan (403)', (await req('PUT', `/challans/${draftChallanId}`, accounts.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 5 }]
    })).status, 403);

    // Confirm Challan
    assertEqual('Warehouse CANNOT confirm challan (403)', (await req('POST', `/challans/${draftChallanId}/confirm`, warehouse.token)).status, 403);
    assertEqual('Accounts CANNOT confirm challan (403)', (await req('POST', `/challans/${draftChallanId}/confirm`, accounts.token)).status, 403);
    assertEqual('Sales can confirm challan', (await req('POST', `/challans/${draftChallanId}/confirm`, sales.token)).status, 200);

    // Cancel Challan (on a fresh draft)
    const cCancelRes = await req('POST', '/challans', sales.token, {
      customer_id: testCustomerId,
      items: [{ product_id: testProductId, quantity: 1 }]
    });
    const cancelChallanId = cCancelRes.data.data.id;

    assertEqual('Warehouse CANNOT cancel challan (403)', (await req('POST', `/challans/${cancelChallanId}/cancel`, warehouse.token)).status, 403);
    assertEqual('Accounts CANNOT cancel challan (403)', (await req('POST', `/challans/${cancelChallanId}/cancel`, accounts.token)).status, 403);
    assertEqual('Sales can cancel challan', (await req('POST', `/challans/${cancelChallanId}/cancel`, sales.token)).status, 200);

    console.log('\n====================================================');
    console.log('  TESTING 5: DASHBOARD PERMISSIONS');
    console.log('====================================================');
    assertEqual('Admin can view dashboard', (await req('GET', '/dashboard', admin.token)).status, 200);
    assertEqual('Sales can view dashboard', (await req('GET', '/dashboard', sales.token)).status, 200);
    assertEqual('Warehouse can view dashboard', (await req('GET', '/dashboard', warehouse.token)).status, 200);
    assertEqual('Accounts can view dashboard', (await req('GET', '/dashboard', accounts.token)).status, 200);

    console.log('\n====================================================');
    console.log(`  RBAC AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during RBAC testing:', error);
    process.exit(1);
  }
};

runRBACTestSuite();
