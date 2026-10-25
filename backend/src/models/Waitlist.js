const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
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
    requestedDate: {
      type: Date,
      required: true,
    },
    connectorType: {
      type: String,
      default: 'CCS',
    },
    notified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['waiting', 'notified', 'fulfilled', 'expired'],
      default: 'waiting',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Waitlist', waitlistSchema);
