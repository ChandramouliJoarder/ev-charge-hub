const Station = require('../models/Station');
const Slot = require('../models/Slot');

// @desc    Get all stations with optional geo, chargerType, connectorType, price filtering
// @route   GET /api/stations
// @access  Public
exports.getStations = async (req, res) => {
  try {
    const {
      lat,
      lng,
      distance = 50, // default 50km
      chargerType,
      connectorType,
      minPrice,
      maxPrice,
      sortBy = 'rating', // 'rating', 'price_asc', 'price_desc', 'distance'
    } = req.query;

    let query = { isActive: true };

    // Filter by chargerType
    if (chargerType && chargerType !== 'all') {
      query.chargerTypes = { $in: [chargerType] };
    }

    // Filter by connectorType
    if (connectorType && connectorType !== 'all') {
      query.connectorTypes = { $in: [connectorType] };
    }

    // Filter by pricePerHour
    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    let stations;

    // Geospatial query if coordinates provided
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      const maxDistanceMeters = parseFloat(distance) * 1000;

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat],
          },
          $maxDistance: maxDistanceMeters,
        },
      };

      stations = await Station.find(query).populate('ownerId', 'name email');
    } else {
      let sortOption = {};
      if (sortBy === 'rating') sortOption = { averageRating: -1 };
      else if (sortBy === 'price_asc') sortOption = { pricePerHour: 1 };
      else if (sortBy === 'price_desc') sortOption = { pricePerHour: -1 };
      else sortOption = { createdAt: -1 };

      stations = await Station.find(query).sort(sortOption).populate('ownerId', 'name email');
    }

    res.json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single station by ID with its slots
// @route   GET /api/stations/:id
// @access  Public
exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Fetch slots for this station (today and onward)
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const slots = await Slot.find({
      stationId: station._id,
      startTime: { $gte: now },
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      data: {
        station,
        slots,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new station (Owner/Admin only)
// @route   POST /api/stations
// @access  Private (Owner/Admin)
exports.createStation = async (req, res) => {
  try {
    const {
      name,
      longitude,
      latitude,
      address,
      chargerTypes,
      connectorTypes,
      powerOutputKw,
      pricePerHour,
      pricePerKwh,
      photos,
      amenities,
      operatingHours,
      totalSlots,
    } = req.body;

    const station = await Station.create({
      name,
      ownerId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      address,
      chargerTypes: chargerTypes || ['Fast'],
      connectorTypes: connectorTypes || ['CCS'],
      powerOutputKw: powerOutputKw || 50,
      pricePerHour: pricePerHour || 12.0,
      pricePerKwh: pricePerKwh || 0.3,
      photos: photos || [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
      ],
      amenities: amenities || ['Restroom', 'Wi-Fi', '24/7 Access'],
      operatingHours: operatingHours || '24/7',
      totalSlots: totalSlots || 4,
    });

    // Auto-generate initial slots for the next 3 days
    const slotCount = totalSlots || 4;
    const initialSlots = [];
    const baseDate = new Date();

    for (let day = 0; day < 3; day++) {
      for (let hour = 8; hour < 20; hour += 2) {
        for (let s = 1; s <= slotCount; s++) {
          const sTime = new Date(baseDate);
          sTime.setDate(sTime.getDate() + day);
          sTime.setHours(hour, 0, 0, 0);

          const eTime = new Date(sTime);
          eTime.setHours(hour + 2, 0, 0, 0);

          initialSlots.push({
            stationId: station._id,
            slotNumber: `Slot ${String.fromCharCode(64 + s)}`,
            connectorType: station.connectorTypes[0] || 'CCS',
            startTime: sTime,
            endTime: eTime,
            status: 'available',
            price: station.pricePerHour * 2,
          });
        }
      }
    }

    if (initialSlots.length > 0) {
      await Slot.insertMany(initialSlots);
    }

    res.status(201).json({
      success: true,
      data: station,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update station (Owner/Admin)
// @route   PUT /api/stations/:id
// @access  Private (Owner/Admin)
exports.updateStation = async (req, res) => {
  try {
    let station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    // Check ownership
    if (station.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this station' });
    }

    if (req.body.longitude && req.body.latitude) {
      req.body.location = {
        type: 'Point',
        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)],
      };
    }

    station = await Station.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: station });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete station (Owner/Admin)
// @route   DELETE /api/stations/:id
// @access  Private (Owner/Admin)
exports.deleteStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    if (station.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this station' });
    }

    await Station.findByIdAndDelete(req.params.id);
    await Slot.deleteMany({ stationId: req.params.id });

    res.json({ success: true, message: 'Station and associated slots removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
