require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const seed = async () => {
  let pool;
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log('Connecting to database server...');
    const connection = await pool.getConnection();
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    
    // Users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Sales', 'Warehouse', 'Accounts') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(50) NOT NULL,
        email VARCHAR(255) NULL,
        business_name VARCHAR(255) NULL,
        gst_number VARCHAR(50) NULL,
        customer_type ENUM('Retail', 'Wholesale', 'Distributor') NOT NULL DEFAULT 'Retail',
        address TEXT NULL,
        status ENUM('Lead', 'Active', 'Inactive') NOT NULL DEFAULT 'Lead',
        follow_up_date DATE NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        current_stock INT NOT NULL DEFAULT 0,
        minimum_stock INT NOT NULL DEFAULT 0,
        warehouse_location VARCHAR(100) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM customers');
    await connection.query('DELETE FROM products');
    
    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);

    const users = [
      { name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
      { name: 'Sales User', email: 'sales@example.com', role: 'Sales' },
      { name: 'Warehouse User', email: 'warehouse@example.com', role: 'Warehouse' },
      { name: 'Accounts User', email: 'accounts@example.com', role: 'Accounts' }
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role]
      );
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    // Seed Customers
    const customers = [
      {
        customer_name: 'Acme Corp',
        mobile_number: '9876543210',
        email: 'contact@acme.com',
        business_name: 'Acme Industries LLC',
        gst_number: '27AABCU9603R1ZN',
        customer_type: 'Wholesale',
        address: '123 Industrial Area, Phase 2, Mumbai, MH',
        status: 'Active',
        follow_up_date: '2026-08-20',
        notes: 'Preferred wholesale buyer with 30-day payment term.'
      },
      {
        customer_name: 'Globex UI',
        mobile_number: '9876543211',
        email: 'info@globex.com',
        business_name: 'Globex Corporation',
        gst_number: '29AABCU9603R1ZM',
        customer_type: 'Distributor',
        address: '45 Commercial Complex, Bengaluru, KA',
        status: 'Lead',
        follow_up_date: '2026-08-25',
        notes: 'Interested in becoming state-wide distributor.'
      },
      {
        customer_name: 'Soylent Corp',
        mobile_number: '9876543212',
        email: 'sales@soylent.com',
        business_name: 'Soylent Foods Ltd',
        gst_number: '07AABCU9603R1ZL',
        customer_type: 'Retail',
        address: '78 Market Street, New Delhi, DL',
        status: 'Inactive',
        follow_up_date: '2026-08-15',
        notes: 'Follow up regarding catalog refresh.'
      }
    ];

    for (const c of customers) {
      await connection.query(
        `INSERT INTO customers (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.customer_name, c.mobile_number, c.email, c.business_name, c.gst_number, c.customer_type, c.address, c.status, c.follow_up_date, c.notes]
      );
      console.log(`Created customer: ${c.customer_name}`);
    }

    // Seed Products
    const products = [
      { product_name: 'Widget A - Blue', sku: 'SKU-WID-001', category: 'Widgets', unit_price: 25.00, current_stock: 2, minimum_stock: 50, warehouse_location: 'Rack A-12' },
      { product_name: 'Gear Assembly X', sku: 'SKU-GEAR-002', category: 'Machinery', unit_price: 120.00, current_stock: 5, minimum_stock: 100, warehouse_location: 'Rack B-04' },
      { product_name: 'Connector Pin 4mm', sku: 'SKU-PIN-003', category: 'Hardware', unit_price: 2.50, current_stock: 12, minimum_stock: 500, warehouse_location: 'Bin C-01' },
      { product_name: 'Steel Bracket M', sku: 'SKU-BRK-004', category: 'Hardware', unit_price: 15.00, current_stock: 18, minimum_stock: 200, warehouse_location: 'Rack B-09' },
      { product_name: 'Industrial Valve 2-inch', sku: 'SKU-VLV-005', category: 'Plumbing', unit_price: 85.00, current_stock: 150, minimum_stock: 20, warehouse_location: 'Rack D-03' },
      { product_name: 'Hydraulic Seal Kit', sku: 'SKU-SEAL-006', category: 'Plumbing', unit_price: 45.00, current_stock: 220, minimum_stock: 30, warehouse_location: 'Bin C-15' }
    ];

    for (const p of products) {
      await connection.query(
        `INSERT INTO products (product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.product_name, p.sku, p.category, p.unit_price, p.current_stock, p.minimum_stock, p.warehouse_location]
      );
      console.log(`Created product: ${p.product_name} (${p.sku})`);
    }

    console.log('Seeding completed successfully!');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

seed();
