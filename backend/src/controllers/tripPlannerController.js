const Station = require('../models/Station');

// Helper: Haversine distance in km between two coordinates
function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// @desc    Calculate trip route segments and recommend EV charging stops
// @route   POST /api/trip-planner/calculate
// @access  Public
exports.calculateTripPlan = async (req, res) => {
  try {
    const {
      originCoords, // [lat, lng]
      destCoords, // [lat, lng]
      vehicleRange = 350, // default vehicle range in km
      originName = 'Origin',
      destName = 'Destination',
    } = req.body;

    if (!originCoords || !destCoords) {
      return res.status(400).json({
        success: false,
        message: 'Origin and Destination coordinates are required [lat, lng]',
      });
    }

    const [startLat, startLng] = originCoords;
    const [endLat, endLng] = destCoords;

    const totalDirectDistanceKm = Math.round(
      getHaversineDistanceKm(startLat, startLng, endLat, endLng)
    );

    // Fetch all active stations from database
    const allStations = await Station.find({ isActive: true });

    // Threshold is 75% of vehicle range to ensure safety buffer
    const safeLegRangeKm = Math.max(80, vehicleRange * 0.75);

    // Generate waypoints along route
    const numWaypoints = Math.max(5, Math.ceil(totalDirectDistanceKm / 40));
    const pathCoordinates = [];
    for (let i = 0; i <= numWaypoints; i++) {
      const fraction = i / numWaypoints;
      // Slight realistic bezier curve arc for visual realism
      const arcOffset = Math.sin(fraction * Math.PI) * 0.04;
      const lat = startLat + (endLat - startLat) * fraction + arcOffset;
      const lng = startLng + (endLng - startLng) * fraction;
      pathCoordinates.push([lat, lng]);
    }

    // Identify needed stops if trip exceeds range
    const suggestedStops = [];
    let currentBatteryKm = vehicleRange * 0.9; // start with 90% charge
    let distanceCovered = 0;

    if (totalDirectDistanceKm > currentBatteryKm) {
      // Find candidate stations closest to the mid-route intervals
      const stopsNeeded = Math.ceil(totalDirectDistanceKm / safeLegRangeKm) - 1;

      for (let s = 1; s <= stopsNeeded; s++) {
        const targetDistance = s * safeLegRangeKm;
        const targetFraction = Math.min(0.9, targetDistance / totalDirectDistanceKm);
        const approxTargetLat = startLat + (endLat - startLat) * targetFraction;
        const approxTargetLng = startLng + (endLng - startLng) * targetFraction;

        // Find closest station to this waypoint
        let closestStation = null;
        let minStopDist = Infinity;

        allStations.forEach((station) => {
          const [stLng, stLat] = station.location.coordinates;
          const d = getHaversineDistanceKm(approxTargetLat, approxTargetLng, stLat, stLng);
          if (d < minStopDist) {
            minStopDist = d;
            closestStation = station;
          }
        });

        if (closestStation && !suggestedStops.some((st) => st._id.toString() === closestStation._id.toString())) {
          suggestedStops.push({
            station: closestStation,
            stopIndex: s,
            distanceFromOriginKm: Math.round(targetDistance),
            recommendedChargeDurationMins: 35,
            suggestedKwh: Math.round(closestStation.powerOutputKw * 0.5),
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        origin: { name: originName, coords: [startLat, startLng] },
        destination: { name: destName, coords: [endLat, endLng] },
        totalDistanceKm: totalDirectDistanceKm,
        estimatedDriveTimeHours: (totalDirectDistanceKm / 80).toFixed(1),
        vehicleRangeKm: vehicleRange,
        stopsNeededCount: suggestedStops.length,
        suggestedStops,
        routePath: pathCoordinates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
