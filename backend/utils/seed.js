require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const initDatabase = async () => {
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Stock Movements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS stock_movements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        movement_type ENUM('IN', 'OUT') NOT NULL,
        reason VARCHAR(255) NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Challans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS challans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        challan_number VARCHAR(50) NOT NULL UNIQUE,
        customer_id INT NOT NULL,
        total_quantity INT NOT NULL DEFAULT 0,
        status ENUM('Draft', 'Confirmed', 'Cancelled') NOT NULL DEFAULT 'Draft',
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Challan Items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS challan_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        challan_id INT NOT NULL,
        product_id INT NOT NULL,
        product_name_snapshot VARCHAR(255) NOT NULL,
        sku_snapshot VARCHAR(100) NOT NULL,
        unit_price_snapshot DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (challan_id) REFERENCES challans(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Seed default authentication users if not already present
    const [existingUsers] = await connection.query('SELECT id, email, role FROM users');
    if (existingUsers.length === 0) {
      console.log('Seeding baseline authentication role accounts...');
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      await connection.query(`
        INSERT INTO users (name, email, password, role) VALUES
        ('System Administrator', 'admin@example.com', ?, 'Admin'),
        ('Sales Representative', 'sales@example.com', ?, 'Sales'),
        ('Warehouse Manager', 'warehouse@example.com', ?, 'Warehouse'),
        ('Accounts Auditor', 'accounts@example.com', ?, 'Accounts')
      `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword]);
      console.log('  ✓ 4 authentication user accounts created (Admin, Sales, Warehouse, Accounts).');
    }

    console.log('Database initialized successfully: ZERO business records (Customers=0, Products=0, Stock=0, Challans=0).');
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

initDatabase();
