const express = require('express');
const router = express.Router();
const {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} = require('../controllers/stationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getStations);
router.get('/:id', getStationById);
router.post('/', protect, authorize('owner', 'admin'), createStation);
router.put('/:id', protect, authorize('owner', 'admin'), updateStation);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteStation);

module.exports = router;
