require('dotenv').config({ path: '.env' });

const BASE_URL = 'http://localhost:5000/api';

const runCleanStateVerification = async () => {
  console.log('====================================================');
  console.log('  CLEAN STATE & REAL DATABASE VERIFICATION TEST     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assertEqual = (testName, actual, expected) => {
    if (actual === expected) {
      console.log(`  ✓ PASS: ${testName} (Got: ${actual})`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName} - Expected ${expected}, got ${actual}`);
      failed++;
    }
  };

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

  try {
    // 1. Authenticate as Admin
    console.log('[Step 1] Logging in as Admin...');
    const loginRes = await req('POST', '/auth/login', null, {
      email: 'admin@example.com',
      password: 'Password123!'
    });
    assertEqual('Admin login successful', loginRes.status, 200);
    const adminToken = loginRes.data.token;

    // 2. Verify Initial Clean State (Zero business records)
    console.log('\n[Step 2] Verifying initial database zero-state...');
    const initCust = await req('GET', '/customers', adminToken);
    const initProd = await req('GET', '/products', adminToken);
    const initMove = await req('GET', '/inventory/movements', adminToken);
    const initChal = await req('GET', '/challans', adminToken);
    const initDash = await req('GET', '/dashboard', adminToken);

    assertEqual('Initial Customers count is 0', initCust.data.pagination.total, 0);
    assertEqual('Initial Products count is 0', initProd.data.pagination.total, 0);
    assertEqual('Initial Stock Movements count is 0', initMove.data.pagination.total, 0);
    assertEqual('Initial Challans count is 0', initChal.data.pagination.total, 0);
    assertEqual('Initial Dashboard Total Customers = 0', initDash.data.data.totalCustomers, 0);
    assertEqual('Initial Dashboard Total Products = 0', initDash.data.data.totalProducts, 0);
    assertEqual('Initial Dashboard Low Stock Items = 0', initDash.data.data.lowStockItems, 0);
    assertEqual('Initial Dashboard Draft Challans = 0', initDash.data.data.draftChallans, 0);
    assertEqual('Initial Dashboard Confirmed Challans = 0', initDash.data.data.confirmedChallans, 0);

    // 3. Create one Customer
    console.log('\n[Step 3] Creating real customer in MySQL...');
    const createCustRes = await req('POST', '/customers', adminToken, {
      customer_name: 'Mahindra Logistics Ltd',
      mobile_number: '9820012345',
      email: 'contact@mahindralogistics.com',
      business_name: 'Mahindra Group',
      gst_number: '27AAACM1234F1Z5',
      customer_type: 'Wholesale',
      address: 'Plot 4, MIDC Industrial Area, Pune',
      status: 'Active',
      follow_up_date: '2026-09-30',
      notes: 'Quarterly supply contract discussion.'
    });
    assertEqual('Customer created successfully', createCustRes.status, 201);
    const customerId = createCustRes.data.data.id;

    // 4. Verify Customer Count = 1
    const custAfter = await req('GET', '/customers', adminToken);
    assertEqual('Customer total count in DB = 1', custAfter.data.pagination.total, 1);
    assertEqual('Customer name matches DB record', custAfter.data.data[0].customer_name, 'Mahindra Logistics Ltd');

    // 5. Create one Product (initial stock 0, min stock 10)
    console.log('\n[Step 4] Creating real product in MySQL...');
    const createProdRes = await req('POST', '/products', adminToken, {
      product_name: 'Hydraulic Cylinder 50mm',
      sku: 'SKU-HYD-50MM',
      category: 'Machinery',
      unit_price: 450.00,
      current_stock: 0,
      minimum_stock: 10,
      warehouse_location: 'Bay C-12'
    });
    assertEqual('Product created successfully', createProdRes.status, 201);
    const productId = createProdRes.data.data.id;

    // 6. Verify Product Count = 1 & Stock = 0
    const prodAfter = await req('GET', '/products', adminToken);
    assertEqual('Product total count in DB = 1', prodAfter.data.pagination.total, 1);
    assertEqual('Product current_stock = 0', prodAfter.data.data[0].current_stock, 0);

    // 7. Perform Stock IN 20
    console.log('\n[Step 5] Performing Stock IN (20 units)...');
    const stockInRes = await req('POST', '/inventory/stock-in', adminToken, {
      product_id: productId,
      quantity: 20,
      reason: 'Procurement shipment #PO-8821'
    });
    assertEqual('Stock IN successful', stockInRes.status, 200);
    assertEqual('Updated on-hand stock is 20', stockInRes.data.data.new_stock, 20);

    // Verify product stock in DB
    const prodStockCheck = await req('GET', `/products/${productId}`, adminToken);
    assertEqual('Database product current_stock is 20', prodStockCheck.data.data.current_stock, 20);

    // 8. Create Draft Challan for 5 units
    console.log('\n[Step 6] Creating Draft Challan for 5 units...');
    const challanDraftRes = await req('POST', '/challans', adminToken, {
      customer_id: customerId,
      items: [{ product_id: productId, quantity: 5 }]
    });
    assertEqual('Draft Challan created', challanDraftRes.status, 201);
    const challanId = challanDraftRes.data.data.id;
    assertEqual('Challan status is Draft', challanDraftRes.data.data.status, 'Draft');

    // Verify stock remains 20 (no deduction on Draft)
    const prodDraftCheck = await req('GET', `/products/${productId}`, adminToken);
    assertEqual('Stock remains 20 after Draft creation', prodDraftCheck.data.data.current_stock, 20);

    // Verify dashboard: Draft Challans = 1, Confirmed = 0
    const dashDraft = await req('GET', '/dashboard', adminToken);
    assertEqual('Dashboard Draft Challans = 1', dashDraft.data.data.draftChallans, 1);
    assertEqual('Dashboard Confirmed Challans = 0', dashDraft.data.data.confirmedChallans, 0);

    // 9. Confirm Challan
    console.log('\n[Step 7] Confirming Challan (Deducting stock atomically)...');
    const confirmRes = await req('POST', `/challans/${challanId}/confirm`, adminToken);
    assertEqual('Challan confirmation successful', confirmRes.status, 200);

    // 10. Verify stock = 15 (20 - 5)
    const prodConfirmedCheck = await req('GET', `/products/${productId}`, adminToken);
    assertEqual('Stock reduced from 20 to 15', prodConfirmedCheck.data.data.current_stock, 15);

    // 11. Verify OUT movement logged in DB
    const moveAfter = await req('GET', '/inventory/movements', adminToken);
    assertEqual('Total stock movements count = 2 (1 IN, 1 OUT)', moveAfter.data.pagination.total, 2);
    assertEqual('Latest movement is OUT', moveAfter.data.data[0].movement_type, 'OUT');
    assertEqual('OUT movement quantity = 5', moveAfter.data.data[0].quantity, 5);

    // 12. Verify Dashboard State
    const dashFinal = await req('GET', '/dashboard', adminToken);
    assertEqual('Final Dashboard Total Customers = 1', dashFinal.data.data.totalCustomers, 1);
    assertEqual('Final Dashboard Total Products = 1', dashFinal.data.data.totalProducts, 1);
    assertEqual('Final Dashboard Draft Challans = 0', dashFinal.data.data.draftChallans, 0);
    assertEqual('Final Dashboard Confirmed Challans = 1', dashFinal.data.data.confirmedChallans, 1);
    assertEqual('Recent Challans feed count = 1', dashFinal.data.data.recentChallans.length, 1);

    // 13. Test Data Consistency Across Roles (Shared Database)
    console.log('\n[Step 8] Verifying data consistency across Sales, Warehouse, and Accounts...');

    // Sales Login
    const salesLogin = await req('POST', '/auth/login', null, { email: 'sales@example.com', password: 'Password123!' });
    const salesToken = salesLogin.data.token;
    const salesCust = await req('GET', '/customers', salesToken);
    const salesChal = await req('GET', '/challans', salesToken);
    assertEqual('Sales sees the exact same Customer #1', salesCust.data.data[0].customer_name, 'Mahindra Logistics Ltd');
    assertEqual('Sales sees the exact same Confirmed Challan', salesChal.data.data[0].id, challanId);

    // Warehouse Login
    const whLogin = await req('POST', '/auth/login', null, { email: 'warehouse@example.com', password: 'Password123!' });
    const whToken = whLogin.data.token;
    const whProd = await req('GET', `/products/${productId}`, whToken);
    const whMove = await req('GET', '/inventory/movements', whToken);
    assertEqual('Warehouse sees the exact same Product stock = 15', whProd.data.data.current_stock, 15);
    assertEqual('Warehouse sees both 2 movements (IN and OUT)', whMove.data.pagination.total, 2);

    // Accounts Login
    const accLogin = await req('POST', '/auth/login', null, { email: 'accounts@example.com', password: 'Password123!' });
    const accToken = accLogin.data.token;
    const accDash = await req('GET', '/dashboard', accToken);
    assertEqual('Accounts sees accurate shared Dashboard metrics', accDash.data.data.confirmedChallans, 1);

    console.log('\n====================================================');
    console.log(`  CLEAN-STATE TEST COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal error during clean-state testing:', error);
    process.exit(1);
  }
};

runCleanStateVerification();
