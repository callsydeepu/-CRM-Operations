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

    await connection.query('DELETE FROM users');
    
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
