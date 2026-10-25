const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Station = require('../models/Station');
const Waitlist = require('../models/Waitlist');
const sendEmail = require('../utils/sendEmail');

// @desc    Book a slot (Prevents double booking via atomic check & update)
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { stationId, slotId, startTime, endTime } = req.body;

    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    // Atomic update to avoid race conditions and double booking
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, status: 'available' },
      { $set: { status: 'reserved' } },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(409).json({
        success: false,
        message: 'This slot was just booked by another user. Please choose a different slot.',
      });
    }

    const start = new Date(startTime || slot.startTime);
    const end = new Date(endTime || slot.endTime);
    const durationHours = Math.max(1, (end - start) / (1000 * 60 * 60));
    const totalAmount = slot.price || Math.round(station.pricePerHour * durationHours);

    const booking = await Booking.create({
      userId: req.user._id,
      stationId,
      slotId,
      startTime: start,
      endTime: end,
      totalAmount,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    updatedSlot.currentBookingId = booking._id;
    await updatedSlot.save();

    // Broadcast instant socket update
    const io = req.app.get('socketio');
    if (io) {
      io.to(`station_${stationId}`).emit('slotStatusChanged', {
        slotId: slot._id,
        status: 'reserved',
      });
    }

    res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('stationId', 'name address photos chargerTypes connectorTypes pricePerHour')
      .populate('slotId', 'slotNumber connectorType')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('stationId')
      .populate('slotId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Access check: User must own booking, or be station owner or admin
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'owner' &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking & notify waitlist
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'User cancelled reservation';
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }
    await booking.save();

    // Free up the slot
    await Slot.findByIdAndUpdate(booking.slotId, {
      status: 'available',
      currentBookingId: null,
    });

    const io = req.app.get('socketio');
    if (io) {
      io.to(`station_${booking.stationId}`).emit('slotStatusChanged', {
        slotId: booking.slotId,
        status: 'available',
      });
    }

    // Check waitlist to notify next in line
    const waitlisted = await Waitlist.findOne({
      stationId: booking.stationId,
      status: 'waiting',
    }).populate('userId', 'name email');

    if (waitlisted) {
      waitlisted.status = 'notified';
      waitlisted.notified = true;
      await waitlisted.save();

      if (waitlisted.userId && waitlisted.userId.email) {
        sendEmail({
          to: waitlisted.userId.email,
          subject: 'Slot Opened! An EV Charging Slot is Available for You',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 6px;">
              <h3 style="color: #3FA66A;">Good news from EV Charge Hub!</h3>
              <p>A slot has just freed up at your requested station. Please log in now to secure your reservation before it is taken.</p>
            </div>
          `,
        });
      }

      if (io) {
        io.to(`user_${waitlisted.userId._id}`).emit('waitlistAvailable', {
          stationId: booking.stationId,
          message: 'A previously booked slot is now open!',
        });
      }
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully and slot restored to available',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join waitlist for a fully booked station
// @route   POST /api/bookings/waitlist
// @access  Private
exports.joinWaitlist = async (req, res) => {
  try {
    const { stationId, requestedDate, connectorType } = req.body;

    const entry = await Waitlist.create({
      userId: req.user._id,
      stationId,
      requestedDate: requestedDate || new Date(),
      connectorType: connectorType || 'CCS',
    });

    res.status(201).json({
      success: true,
      message: 'You have been added to the station waitlist. We will notify you if a slot opens!',
      data: entry,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
