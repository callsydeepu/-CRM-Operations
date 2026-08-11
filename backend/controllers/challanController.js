const pool = require('../config/db');

// Helper to generate unique Challan Number (e.g. CH-2026-000001)
const generateChallanNumber = async (connection) => {
  const currentYear = new Date().getFullYear();
  const prefix = `CH-${currentYear}-`;
  
  const [rows] = await connection.query(
    'SELECT challan_number FROM challans WHERE challan_number LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].challan_number;
    const parts = lastNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(6, '0');
  return `${prefix}${paddedSeq}`;
};

// @desc    Get all challans with search, filter, and pagination
// @route   GET /api/challans
const getChallans = async (req, res, next) => {
  try {
    const { search, status, customer_id, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT ch.*, c.customer_name, c.business_name, c.mobile_number, u.name as created_by_name
      FROM challans ch
      JOIN customers c ON ch.customer_id = c.id
      JOIN users u ON ch.created_by = u.id
      WHERE 1=1
    `;
    let countQuery = `
      SELECT COUNT(*) as total
      FROM challans ch
      JOIN customers c ON ch.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    const countParams = [];

    if (search && search.trim()) {
      const pattern = `%${search.trim()}%`;
      const searchClause = ' AND (ch.challan_number LIKE ? OR c.customer_name LIKE ? OR c.business_name LIKE ?)';
      query += searchClause;
      countQuery += searchClause;
      params.push(pattern, pattern, pattern);
      countParams.push(pattern, pattern, pattern);
    }

    if (status && ['Draft', 'Confirmed', 'Cancelled'].includes(status)) {
      query += ' AND ch.status = ?';
      countQuery += ' AND ch.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (customer_id) {
      query += ' AND ch.customer_id = ?';
      countQuery += ' AND ch.customer_id = ?';
      params.push(customer_id);
      countParams.push(customer_id);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    query += ' ORDER BY ch.created_at DESC LIMIT ? OFFSET ?';
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

// @desc    Get single challan by ID with customer and snapshot items
// @route   GET /api/challans/:id
const getChallanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [challanRows] = await pool.query(
      `SELECT ch.*, c.customer_name, c.business_name, c.mobile_number, c.email, c.address, c.gst_number, u.name as created_by_name
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       WHERE ch.id = ?`,
      [id]
    );

    if (challanRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanRows[0];

    const [itemRows] = await pool.query(
      `SELECT ci.*, p.current_stock as live_current_stock
       FROM challan_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.challan_id = ?`,
      [id]
    );

    challan.items = itemRows.map(item => ({
      ...item,
      unit_price_snapshot: parseFloat(item.unit_price_snapshot),
      total_price: parseFloat(item.unit_price_snapshot) * item.quantity
    }));

    res.status(200).json({
      success: true,
      data: challan
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new Sales Challan (stores product snapshots, default Draft)
// @route   POST /api/challans
const createChallan = async (req, res, next) => {
  let connection;
  try {
    const { customer_id, items } = req.body;

    if (!customer_id) {
      return res.status(400).json({ success: false, message: 'Customer is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product item is required' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verify customer exists
    const [customers] = await connection.query('SELECT id, customer_name FROM customers WHERE id = ?', [customer_id]);
    if (customers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Validate each item and collect snapshot data
    const itemSnapshots = [];
    let totalQuantity = 0;

    for (const item of items) {
      const { product_id, quantity } = item;
      const qty = parseInt(quantity, 10);

      if (!product_id) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Product ID is required for all items' });
      }

      if (isNaN(qty) || qty <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Item quantity must be a positive integer' });
      }

      const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product with ID ${product_id} not found` });
      }

      const product = products[0];
      totalQuantity += qty;

      itemSnapshots.push({
        product_id: product.id,
        product_name_snapshot: product.product_name,
        sku_snapshot: product.sku,
        unit_price_snapshot: parseFloat(product.unit_price),
        quantity: qty
      });
    }

    const challanNumber = await generateChallanNumber(connection);

    const [challanResult] = await connection.query(
      'INSERT INTO challans (challan_number, customer_id, total_quantity, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [challanNumber, customer_id, totalQuantity, 'Draft', req.user.id]
    );

    const challanId = challanResult.insertId;

    for (const item of itemSnapshots) {
      await connection.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [challanId, item.product_id, item.product_name_snapshot, item.sku_snapshot, item.unit_price_snapshot, item.quantity]
      );
    }

    await connection.commit();

    // Fetch created challan
    const [created] = await pool.query(
      `SELECT ch.*, c.customer_name, u.name as created_by_name
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       WHERE ch.id = ?`,
      [challanId]
    );

    const fullChallan = created[0];
    fullChallan.items = itemSnapshots;

    res.status(201).json({
      success: true,
      message: 'Challan created successfully as Draft',
      data: fullChallan
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Update Draft Challan (only Draft allowed)
// @route   PUT /api/challans/:id
const updateChallan = async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;
    const { customer_id, items } = req.body;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [challanRows] = await connection.query('SELECT * FROM challans WHERE id = ? FOR UPDATE', [id]);
    if (challanRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanRows[0];
    if (challan.status !== 'Draft') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot edit challan in '${challan.status}' status. Only Draft challans can be edited.`
      });
    }

    const updatedCustomerId = customer_id || challan.customer_id;

    // Verify customer exists
    const [customers] = await connection.query('SELECT id FROM customers WHERE id = ?', [updatedCustomerId]);
    if (customers.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'At least one product item is required' });
    }

    const itemSnapshots = [];
    let totalQuantity = 0;

    for (const item of items) {
      const { product_id, quantity } = item;
      const qty = parseInt(quantity, 10);

      if (!product_id || isNaN(qty) || qty <= 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Valid product ID and positive quantity required for all items' });
      }

      const [products] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: `Product with ID ${product_id} not found` });
      }

      const product = products[0];
      totalQuantity += qty;

      itemSnapshots.push({
        product_id: product.id,
        product_name_snapshot: product.product_name,
        sku_snapshot: product.sku,
        unit_price_snapshot: parseFloat(product.unit_price),
        quantity: qty
      });
    }

    await connection.query(
      'UPDATE challans SET customer_id = ?, total_quantity = ? WHERE id = ?',
      [updatedCustomerId, totalQuantity, id]
    );

    // Replace items
    await connection.query('DELETE FROM challan_items WHERE challan_id = ?', [id]);

    for (const item of itemSnapshots) {
      await connection.query(
        `INSERT INTO challan_items (challan_id, product_id, product_name_snapshot, sku_snapshot, unit_price_snapshot, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id, item.product_id, item.product_name_snapshot, item.sku_snapshot, item.unit_price_snapshot, item.quantity]
      );
    }

    await connection.commit();

    res.status(200).json({
      success: true,
      message: 'Draft challan updated successfully',
      data: {
        id: challan.id,
        challan_number: challan.challan_number,
        customer_id: updatedCustomerId,
        total_quantity: totalQuantity,
        status: 'Draft',
        items: itemSnapshots
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Confirm Challan (atomic stock check and deduction)
// @route   POST /api/challans/:id/confirm
const confirmChallan = async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;

    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [challanRows] = await connection.query('SELECT * FROM challans WHERE id = ? FOR UPDATE', [id]);
    if (challanRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanRows[0];
    if (challan.status !== 'Draft') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Challan is already in '${challan.status}' status. Only Draft challans can be confirmed.`
      });
    }

    const [items] = await connection.query('SELECT * FROM challan_items WHERE challan_id = ?', [id]);
    if (items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Challan has no items' });
    }

    // Check stock for ALL items before any deduction
    for (const item of items) {
      const [products] = await connection.query('SELECT * FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: `Product '${item.product_name_snapshot}' no longer exists`
        });
      }

      const product = products[0];
      if (product.current_stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          product: product.product_name,
          available: product.current_stock,
          requested: item.quantity
        });
      }
    }

    // All stock checks passed -> Perform deductions and create OUT movements atomically
    for (const item of items) {
      await connection.query(
        'UPDATE products SET current_stock = current_stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      await connection.query(
        `INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by)
         VALUES (?, ?, 'OUT', ?, ?)`,
        [item.product_id, item.quantity, `Sales Challan ${challan.challan_number}`, req.user.id]
      );
    }

    // Update challan status to Confirmed
    await connection.query("UPDATE challans SET status = 'Confirmed' WHERE id = ?", [id]);

    await connection.commit();

    const [updated] = await pool.query(
      `SELECT ch.*, c.customer_name, u.name as created_by_name
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       WHERE ch.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Challan confirmed and stock deducted successfully',
      data: updated[0]
    });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

// @desc    Cancel Draft Challan (does not modify stock)
// @route   POST /api/challans/:id/cancel
const cancelChallan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [challanRows] = await pool.query('SELECT * FROM challans WHERE id = ?', [id]);
    if (challanRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    const challan = challanRows[0];
    if (challan.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel challan in '${challan.status}' status. Only Draft challans can be cancelled.`
      });
    }

    await pool.query("UPDATE challans SET status = 'Cancelled' WHERE id = ?", [id]);

    const [updated] = await pool.query(
      `SELECT ch.*, c.customer_name, u.name as created_by_name
       FROM challans ch
       JOIN customers c ON ch.customer_id = c.id
       JOIN users u ON ch.created_by = u.id
       WHERE ch.id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Challan cancelled successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan
};
