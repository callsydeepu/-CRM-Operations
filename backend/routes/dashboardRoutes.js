const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// All authenticated roles can view dashboard summary stats
router.use(protect);
router.get('/', authorize('Admin', 'Sales', 'Warehouse', 'Accounts'), getDashboardStats);

module.exports = router;
