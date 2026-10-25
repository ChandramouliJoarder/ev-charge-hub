const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
      country: { type: String, default: 'USA' },
    },
    chargerTypes: {
      type: [String],
      enum: ['Slow', 'Fast', 'Rapid', 'Ultra-Rapid'],
      default: ['Fast'],
    },
    connectorTypes: {
      type: [String],
      enum: ['CCS', 'CHAdeMO', 'Type 2', 'Tesla Supercharger', 'GB/T'],
      required: true,
    },
    powerOutputKw: {
      type: Number,
      default: 50, // kW
    },
    pricePerHour: {
      type: Number,
      required: true,
      default: 15.0,
    },
    pricePerKwh: {
      type: Number,
      default: 0.35,
    },
    photos: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: ['Restroom', 'Cafe', 'Wi-Fi', '24/7 Access'],
    },
    operatingHours: {
      type: String,
      default: '24/7',
    },
    totalSlots: {
      type: Number,
      default: 4,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial searching
stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);
