const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/admin-test', protect, authorize('Admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin! You have admin access.' });
});

module.exports = router;
