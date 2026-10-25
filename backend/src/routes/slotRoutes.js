const express = require('express');
const router = express.Router();
const {
  getSlotsByStation,
  createSlot,
  updateSlot,
} = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.get('/station/:stationId', getSlotsByStation);
router.post('/', protect, authorize('owner', 'admin'), createSlot);
router.put('/:id', protect, authorize('owner', 'admin'), updateSlot);

module.exports = router;
