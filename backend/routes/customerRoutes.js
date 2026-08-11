const express = require('express');
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateFollowup
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All customer routes require authentication
router.use(protect);

// View routes: Admin, Sales, Warehouse, Accounts
router.get('/', authorize('Admin', 'Sales', 'Warehouse', 'Accounts'), getCustomers);
router.get('/:id', authorize('Admin', 'Sales', 'Warehouse', 'Accounts'), getCustomerById);

// Create / Edit routes: Admin, Sales
router.post('/', authorize('Admin', 'Sales'), createCustomer);
router.put('/:id', authorize('Admin', 'Sales'), updateCustomer);
router.post('/:id/followup', authorize('Admin', 'Sales'), updateFollowup);

module.exports = router;
