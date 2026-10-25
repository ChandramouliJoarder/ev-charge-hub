const express = require('express');
const router = express.Router();
const { calculateTripPlan } = require('../controllers/tripPlannerController');

router.post('/calculate', calculateTripPlan);

module.exports = router;
