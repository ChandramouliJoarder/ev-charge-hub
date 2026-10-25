const express = require('express');
const router = express.Router();
const { getOwnerAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/owner', protect, authorize('owner', 'admin'), getOwnerAnalytics);

module.exports = router;
