const express = require('express');
const router = express.Router();
const { getStationReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/station/:stationId', getStationReviews);
router.post('/', protect, createReview);

module.exports = router;
