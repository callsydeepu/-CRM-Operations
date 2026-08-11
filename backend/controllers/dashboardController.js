const pool = require('../config/db');

// @desc    Get dashboard metrics, low-stock items, and recent challans
// @route   GET /api/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total Customers
    const [custResult] = await pool.query('SELECT COUNT(*) as total FROM customers');
    const totalCustomers = custResult[0].total;

    // 2. Total Products
    const [prodResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    const totalProducts = prodResult[0].total;

    // 3. Low Stock Items
    const [lowStockResult] = await pool.query(
      'SELECT COUNT(*) as total FROM products WHERE current_stock <= minimum_stock'
    );
    const lowStockItems = lowStockResult[0].total;

    // 4. Draft Challans
    const [draftResult] = await pool.query(
      "SELECT COUNT(*) as total FROM challans WHERE status = 'Draft'"
    );
    const draftChallans = draftResult[0].total;

    // 5. Confirmed Challans
    const [confirmedResult] = await pool.query(
      "SELECT COUNT(*) as total FROM challans WHERE status = 'Confirmed'"
    );
    const confirmedChallans = confirmedResult[0].total;

    // 6. Recent Challans (Top 5)
    const [recentChallans] = await pool.query(
      `SELECT ch.id, ch.challan_number, ch.total_quantity, ch.status, ch.created_at, c.customer_name, c.business_name
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       ORDER BY ch.created_at DESC
       LIMIT 5`
    );

    // 7. Low Stock Products (Top 5 lowest stock)
    const [lowStockProducts] = await pool.query(
      `SELECT id, product_name, sku, category, current_stock, minimum_stock
       FROM products
       WHERE current_stock <= minimum_stock
       ORDER BY current_stock ASC
       LIMIT 5`
    );

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        lowStockItems,
        draftChallans,
        confirmedChallans,
        recentChallans,
        lowStockProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
