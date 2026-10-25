const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// @desc    Get reviews for a station with rating breakdown
// @route   GET /api/reviews/station/:stationId
// @access  Public
exports.getStationReviews = async (req, res) => {
  try {
    const { stationId } = req.params;

    const reviews = await Review.find({ stationId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Aggregation pipeline for rating distribution breakdown
    const distribution = await Review.aggregate([
      { $match: { stationId: new mongoose.Types.ObjectId(stationId) } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((item) => {
      ratingBreakdown[item._id] = item.count;
    });

    res.json({
      success: true,
      count: reviews.length,
      ratingBreakdown,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a completed booking
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { stationId, bookingId, rating, comment, chargingSpeedSatisfaction, cleanlinessRating } = req.body;

    // Verify user actually completed or confirmed a booking here
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      stationId,
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review stations where you have booked a charging slot.',
      });
    }

    // Check if review already exists
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    const review = await Review.create({
      userId: req.user._id,
      stationId,
      bookingId,
      rating: Number(rating),
      comment,
      chargingSpeedSatisfaction: chargingSpeedSatisfaction || 5,
      cleanlinessRating: cleanlinessRating || 5,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
