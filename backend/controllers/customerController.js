const pool = require('../config/db');

// @desc    Get all customers with optional search, filter, and pagination
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, status, customer_type, page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    let query = 'SELECT * FROM customers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
    const params = [];
    const countParams = [];

    // Search by customer name, business name, mobile number, or email
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      const searchClause = ' AND (customer_name LIKE ? OR business_name LIKE ? OR mobile_number LIKE ? OR email LIKE ?)';
      query += searchClause;
      countQuery += searchClause;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    // Filter by status
    if (status && ['Lead', 'Active', 'Inactive'].includes(status)) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    // Filter by customer_type
    if (customer_type && ['Retail', 'Wholesale', 'Distributor'].includes(customer_type)) {
      query += ' AND customer_type = ?';
      countQuery += ' AND customer_type = ?';
      params.push(customer_type);
      countParams.push(customer_type);
    }

    // Get total count
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Order & Pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
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

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const {
      customer_name,
      mobile_number,
      email,
      business_name,
      gst_number,
      customer_type = 'Retail',
      address,
      status = 'Lead',
      follow_up_date,
      notes
    } = req.body;

    // Validation
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }

    if (!mobile_number || !mobile_number.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    if (customer_type && !['Retail', 'Wholesale', 'Distributor'].includes(customer_type)) {
      return res.status(400).json({ success: false, message: 'Customer type must be Retail, Wholesale, or Distributor' });
    }

    if (status && !['Lead', 'Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Lead, Active, or Inactive' });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    const formattedFollowUpDate = follow_up_date && follow_up_date.trim() ? follow_up_date.trim() : null;

    const [result] = await pool.query(
      `INSERT INTO customers 
       (customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customer_name.trim(),
        mobile_number.trim(),
        email && email.trim() ? email.trim() : null,
        business_name && business_name.trim() ? business_name.trim() : null,
        gst_number && gst_number.trim() ? gst_number.trim() : null,
        customer_type,
        address && address.trim() ? address.trim() : null,
        status,
        formattedFollowUpDate,
        notes && notes.trim() ? notes.trim() : null
      ]
    );

    const [newCustomer] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: newCustomer[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const {
      customer_name,
      mobile_number,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes
    } = req.body;

    const updatedCustomerName = customer_name !== undefined ? (customer_name && customer_name.trim() ? customer_name.trim() : existing[0].customer_name) : existing[0].customer_name;
    const updatedMobile = mobile_number !== undefined ? (mobile_number && mobile_number.trim() ? mobile_number.trim() : existing[0].mobile_number) : existing[0].mobile_number;
    
    if (!updatedCustomerName) {
      return res.status(400).json({ success: false, message: 'Customer name cannot be empty' });
    }

    if (!updatedMobile) {
      return res.status(400).json({ success: false, message: 'Mobile number cannot be empty' });
    }

    if (customer_type && !['Retail', 'Wholesale', 'Distributor'].includes(customer_type)) {
      return res.status(400).json({ success: false, message: 'Customer type must be Retail, Wholesale, or Distributor' });
    }

    if (status && !['Lead', 'Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Lead, Active, or Inactive' });
    }

    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    await pool.query(
      `UPDATE customers SET 
        customer_name = ?, 
        mobile_number = ?, 
        email = ?, 
        business_name = ?, 
        gst_number = ?, 
        customer_type = ?, 
        address = ?, 
        status = ?, 
        follow_up_date = ?, 
        notes = ?
       WHERE id = ?`,
      [
        updatedCustomerName,
        updatedMobile,
        email !== undefined ? (email && email.trim() ? email.trim() : null) : existing[0].email,
        business_name !== undefined ? (business_name && business_name.trim() ? business_name.trim() : null) : existing[0].business_name,
        gst_number !== undefined ? (gst_number && gst_number.trim() ? gst_number.trim() : null) : existing[0].gst_number,
        customer_type !== undefined ? customer_type : existing[0].customer_type,
        address !== undefined ? (address && address.trim() ? address.trim() : null) : existing[0].address,
        status !== undefined ? status : existing[0].status,
        follow_up_date !== undefined ? (follow_up_date && follow_up_date.trim() ? follow_up_date.trim() : null) : existing[0].follow_up_date,
        notes !== undefined ? (notes && notes.trim() ? notes.trim() : null) : existing[0].notes,
        id
      ]
    );

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or update follow-up notes & date
// @route   POST /api/customers/:id/followup
const updateFollowup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { follow_up_date, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const newFollowUpDate = follow_up_date !== undefined ? (follow_up_date && follow_up_date.trim() ? follow_up_date.trim() : null) : existing[0].follow_up_date;
    const newNotes = notes !== undefined ? (notes && notes.trim() ? notes.trim() : null) : existing[0].notes;

    await pool.query(
      'UPDATE customers SET follow_up_date = ?, notes = ? WHERE id = ?',
      [newFollowUpDate, newNotes, id]
    );

    const [updated] = await pool.query('SELECT * FROM customers WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully',
      data: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateFollowup
};
