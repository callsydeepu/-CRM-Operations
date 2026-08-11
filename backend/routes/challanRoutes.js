const express = require('express');
const {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan
} = require('../controllers/challanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All challan routes require authentication
router.use(protect);

// View routes: Admin, Sales, Warehouse, Accounts
router.get('/', authorize('Admin', 'Sales', 'Warehouse', 'Accounts'), getChallans);
router.get('/:id', authorize('Admin', 'Sales', 'Warehouse', 'Accounts'), getChallanById);

// Create, Edit, Confirm, Cancel: Admin, Sales
router.post('/', authorize('Admin', 'Sales'), createChallan);
router.put('/:id', authorize('Admin', 'Sales'), updateChallan);
router.post('/:id/confirm', authorize('Admin', 'Sales'), confirmChallan);
router.post('/:id/cancel', authorize('Admin', 'Sales'), cancelChallan);

module.exports = router;
