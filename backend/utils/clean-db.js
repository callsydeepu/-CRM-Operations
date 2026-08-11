require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

const cleanDatabase = async () => {
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

    const connection = await pool.getConnection();
    await connection.query(`USE \`${process.env.DB_NAME}\``);

    console.log('Cleaning all tables in database...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE challan_items');
    await connection.query('TRUNCATE TABLE challans');
    await connection.query('TRUNCATE TABLE stock_movements');
    await connection.query('TRUNCATE TABLE products');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('All 6 tables truncated successfully. Database is 100% clean and empty.');

    // Count rows in all tables
    const [c1] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [c2] = await connection.query('SELECT COUNT(*) as count FROM customers');
    const [c3] = await connection.query('SELECT COUNT(*) as count FROM products');
    const [c4] = await connection.query('SELECT COUNT(*) as count FROM stock_movements');
    const [c5] = await connection.query('SELECT COUNT(*) as count FROM challans');
    const [c6] = await connection.query('SELECT COUNT(*) as count FROM challan_items');

    console.log(`Current Row Counts:\n - Users: ${c1[0].count}\n - Customers: ${c2[0].count}\n - Products: ${c3[0].count}\n - Stock Movements: ${c4[0].count}\n - Challans: ${c5[0].count}\n - Challan Items: ${c6[0].count}`);

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
};

cleanDatabase();
