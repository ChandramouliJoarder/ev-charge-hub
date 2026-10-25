const Slot = require('../models/Slot');
const Station = require('../models/Station');
const Waitlist = require('../models/Waitlist');

// @desc    Get slots for a station by date
// @route   GET /api/slots/station/:stationId
// @access  Public
exports.getSlotsByStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const { date } = req.query;

    let query = { stationId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const slots = await Slot.find(query).sort({ startTime: 1 });
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create custom slots for a station (Owner/Admin)
// @route   POST /api/slots
// @access  Private (Owner/Admin)
exports.createSlot = async (req, res) => {
  try {
    const { stationId, slotNumber, connectorType, startTime, endTime, price } = req.body;

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    if (station.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized for this station' });
    }

    const slot = await Slot.create({
      stationId,
      slotNumber,
      connectorType,
      startTime,
      endTime,
      price: price || station.pricePerHour * 2,
      status: 'available',
    });

    // Real-time broadcast if socket io attached to req.app
    const io = req.app.get('socketio');
    if (io) {
      io.to(`station_${stationId}`).emit('slotCreated', slot);
    }

    res.status(201).json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update slot status manually (maintenance/reserved)
// @route   PUT /api/slots/:id
// @access  Private (Owner/Admin)
exports.updateSlot = async (req, res) => {
  try {
    const { status, price } = req.body;
    const slot = await Slot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    if (status) slot.status = status;
    if (price) slot.price = price;

    await slot.save();

    const io = req.app.get('socketio');
    if (io) {
      io.to(`station_${slot.stationId}`).emit('slotStatusChanged', {
        slotId: slot._id,
        status: slot.status,
      });
    }

    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
