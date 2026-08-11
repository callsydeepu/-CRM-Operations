const express = require('express');
const {
  getMovements,
  stockIn,
  stockOut
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All inventory routes require authentication
router.use(protect);

// View movement logs: Admin, Warehouse, Sales, Accounts
router.get('/movements', authorize('Admin', 'Warehouse', 'Sales', 'Accounts'), getMovements);

// Stock IN / OUT transactions: Admin, Warehouse
router.post('/stock-in', authorize('Admin', 'Warehouse'), stockIn);
router.post('/stock-out', authorize('Admin', 'Warehouse'), stockOut);

module.exports = router;
