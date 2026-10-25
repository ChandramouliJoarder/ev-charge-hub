const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
      index: true,
    },
    slotNumber: {
      type: String,
      required: true,
    },
    connectorType: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'charging', 'maintenance'],
      default: 'available',
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to help avoid overlaps
slotSchema.index({ stationId: 1, slotNumber: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Slot', slotSchema);
