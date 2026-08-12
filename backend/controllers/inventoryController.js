const pool = require('../config/db');

// @desc    Get stock movements log with search, filter, and pagination
// @route   GET /api/inventory/movements
const getMovements = async (req, res, next) => {
  try {
    const { product_id, movement_type, search, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT sm.*, p.product_name, p.sku, p.category, u.name as created_by_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      JOIN users u ON sm.created_by = u.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (product_id) {
      query += ' AND sm.product_id = ?';
      countQuery += ' AND sm.product_id = ?';
      params.push(product_id);
      countParams.push(product_id);
    }

    if (movement_type && ['IN', 'OUT'].includes(movement_type.toUpperCase())) {
      query += ' AND sm.movement_type = ?';
      countQuery += ' AND sm.movement_type = ?';
      params.push(movement_type.toUpperCase());
      countParams.push(movement_type.toUpperCase());
    }

    if (search && search.trim()) {
      const pattern = `%${search.trim()}%`;
      const searchClause = ' AND (p.product_name LIKE ? OR p.sku LIKE ? OR sm.reason LIKE ?)';
      query += searchClause;
      countQuery += searchClause;
      params.push(pattern, pattern, pattern);
      countParams.push(pattern, pattern, pattern);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    query += ' ORDER BY sm.created_at DESC, sm.id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record Stock IN (increase product stock)
// @route   POST /api/inventory/stock-in
const stockIn = async (req, res, next) => {
  let connection;
  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];
    const newStock = product.current_stock + qty;

    await connection.query('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, product_id]);

    const movementReason = reason && reason.trim() ? reason.trim() : 'Stock IN adjustment';
    const [movementResult] = await connection.query(
      'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
      [product_id, qty, 'IN', movementReason, req.user.id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Stock IN recorded successfully',
      data: {
        movement_id: movementResult.insertId,
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        quantity_added: qty,
        previous_stock: product.current_stock,
        new_stock: newStock,
        movement_type: 'IN',
        reason: movementReason
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Record Stock OUT (decrease product stock, prevent negative stock)
// @route   POST /api/inventory/stock-out
const stockOut = async (req, res, next) => {
  let connection;
  try {
    const { product_id, quantity, reason } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [product_id]);
    if (products.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = products[0];

    if (product.current_stock < qty) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        product: product.product_name,
        available: product.current_stock,
        requested: qty
      });
    }

    const newStock = product.current_stock - qty;

    await connection.query('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, product_id]);

    const movementReason = reason && reason.trim() ? reason.trim() : 'Stock OUT adjustment';
    const [movementResult] = await connection.query(
      'INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES (?, ?, ?, ?, ?)',
      [product_id, qty, 'OUT', movementReason, req.user.id]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Stock OUT recorded successfully',
      data: {
        movement_id: movementResult.insertId,
        product_id: product.id,
        product_name: product.product_name,
        sku: product.sku,
        quantity_deducted: qty,
        previous_stock: product.current_stock,
        new_stock: newStock,
        movement_type: 'OUT',
        reason: movementReason
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getMovements,
  stockIn,
  stockOut
};
