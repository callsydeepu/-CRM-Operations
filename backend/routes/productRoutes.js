const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All product routes require authentication
router.use(protect);

// View routes: Admin, Warehouse, Sales, Accounts
router.get('/', authorize('Admin', 'Warehouse', 'Sales', 'Accounts'), getProducts);
router.get('/:id', authorize('Admin', 'Warehouse', 'Sales', 'Accounts'), getProductById);

// Create / Edit routes: Admin, Warehouse
router.post('/', authorize('Admin', 'Warehouse'), createProduct);
router.put('/:id', authorize('Admin', 'Warehouse'), updateProduct);

module.exports = router;
