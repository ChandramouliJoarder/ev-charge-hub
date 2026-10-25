const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    chargingSpeedSatisfaction: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    cleanlinessRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

// Prevent multiple reviews on same booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

// Static method to calculate average rating of station
reviewSchema.statics.calculateStationRating = async function (stationId) {
  const stats = await this.aggregate([
    { $match: { stationId: new mongoose.Types.ObjectId(stationId) } },
    {
      $group: {
        _id: '$stationId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await mongoose.model('Station').findByIdAndUpdate(stationId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await mongoose.model('Station').findByIdAndUpdate(stationId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

reviewSchema.post('save', async function () {
  await this.constructor.calculateStationRating(this.stationId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateStationRating(doc.stationId);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
