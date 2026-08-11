const pool = require('../config/db');

// @desc    Get all products with search, filter, low-stock detection, and pagination
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    const { search, category, lowStock, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const params = [];
    const countParams = [];

    // Search by product_name, sku, or category
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      const searchClause = ' AND (product_name LIKE ? OR sku LIKE ? OR category LIKE ?)';
      query += searchClause;
      countQuery += searchClause;
      params.push(searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter by category
    if (category && category.trim()) {
      query += ' AND category = ?';
      countQuery += ' AND category = ?';
      params.push(category.trim());
      countParams.push(category.trim());
    }

    // Filter by lowStock
    if (lowStock === 'true' || lowStock === true) {
      query += ' AND current_stock <= minimum_stock';
      countQuery += ' AND current_stock <= minimum_stock';
    }

    // Get total count
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Order & Pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [rows] = await pool.query(query, params);

    // Add is_low_stock computed flag
    const data = rows.map(p => ({
      ...p,
      unit_price: parseFloat(p.unit_price),
      is_low_stock: p.current_stock <= p.minimum_stock
    }));

    res.status(200).json({
      success: true,
      data,
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

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = rows[0];
    product.unit_price = parseFloat(product.unit_price);
    product.is_low_stock = product.current_stock <= product.minimum_stock;

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const {
      product_name,
      sku,
      category,
      unit_price = 0,
      current_stock = 0,
      minimum_stock = 0,
      warehouse_location
    } = req.body;

    // Validation
    if (!product_name || !product_name.trim()) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({ success: false, message: 'SKU is required' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }

    const parsedPrice = parseFloat(unit_price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: 'Unit price must be a non-negative number' });
    }

    const parsedCurrentStock = parseInt(current_stock, 10);
    if (isNaN(parsedCurrentStock) || parsedCurrentStock < 0) {
      return res.status(400).json({ success: false, message: 'Current stock must be a non-negative integer' });
    }

    const parsedMinStock = parseInt(minimum_stock, 10);
    if (isNaN(parsedMinStock) || parsedMinStock < 0) {
      return res.status(400).json({ success: false, message: 'Minimum stock must be a non-negative integer' });
    }

    // Check SKU uniqueness
    const [existingSku] = await pool.query('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (existingSku.length > 0) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const [result] = await pool.query(
      `INSERT INTO products 
       (product_name, sku, category, unit_price, current_stock, minimum_stock, warehouse_location)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name.trim(),
        sku.trim(),
        category.trim(),
        parsedPrice,
        parsedCurrentStock,
        parsedMinStock,
        warehouse_location && warehouse_location.trim() ? warehouse_location.trim() : null
      ]
    );

    const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    const created = newProduct[0];
    created.unit_price = parseFloat(created.unit_price);
    created.is_low_stock = created.current_stock <= created.minimum_stock;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const current = existing[0];
    const {
      product_name,
      sku,
      category,
      unit_price,
      current_stock,
      minimum_stock,
      warehouse_location
    } = req.body;

    const updatedName = product_name !== undefined ? product_name.trim() : current.product_name;
    const updatedSku = sku !== undefined ? sku.trim() : current.sku;
    const updatedCategory = category !== undefined ? category.trim() : current.category;

    if (!updatedName) {
      return res.status(400).json({ success: false, message: 'Product name cannot be empty' });
    }

    if (!updatedSku) {
      return res.status(400).json({ success: false, message: 'SKU cannot be empty' });
    }

    if (!updatedCategory) {
      return res.status(400).json({ success: false, message: 'Category cannot be empty' });
    }

    // Check SKU uniqueness if changed
    if (updatedSku !== current.sku) {
      const [duplicateSku] = await pool.query('SELECT id FROM products WHERE sku = ? AND id != ?', [updatedSku, id]);
      if (duplicateSku.length > 0) {
        return res.status(400).json({ success: false, message: 'SKU already exists' });
      }
    }

    let updatedPrice = current.unit_price;
    if (unit_price !== undefined) {
      const parsed = parseFloat(unit_price);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: 'Unit price must be a non-negative number' });
      }
      updatedPrice = parsed;
    }

    let updatedCurrentStock = current.current_stock;
    if (current_stock !== undefined) {
      const parsed = parseInt(current_stock, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: 'Current stock must be a non-negative integer' });
      }
      updatedCurrentStock = parsed;
    }

    let updatedMinStock = current.minimum_stock;
    if (minimum_stock !== undefined) {
      const parsed = parseInt(minimum_stock, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({ success: false, message: 'Minimum stock must be a non-negative integer' });
      }
      updatedMinStock = parsed;
    }

    const updatedLocation = warehouse_location !== undefined ? (warehouse_location && warehouse_location.trim() ? warehouse_location.trim() : null) : current.warehouse_location;

    await pool.query(
      `UPDATE products SET 
        product_name = ?, 
        sku = ?, 
        category = ?, 
        unit_price = ?, 
        current_stock = ?, 
        minimum_stock = ?, 
        warehouse_location = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedSku,
        updatedCategory,
        updatedPrice,
        updatedCurrentStock,
        updatedMinStock,
        updatedLocation,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const p = updated[0];
    p.unit_price = parseFloat(p.unit_price);
    p.is_low_stock = p.current_stock <= p.minimum_stock;

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: p
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
};
