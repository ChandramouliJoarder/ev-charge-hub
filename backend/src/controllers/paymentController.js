const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const Station = require('../models/Station');
const sendEmail = require('../utils/sendEmail');

// Initialize Razorpay (Sandbox test mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mockSecretKey67890',
});

// @desc    Get Razorpay key for frontend
// @route   GET /api/payments/key
// @access  Private
exports.getKey = (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
  });
};

// @desc    Create Razorpay Order for a booking
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { amount, bookingId, currency = 'INR' } = req.body;

    const booking = await Booking.findById(bookingId).populate('stationId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // In test mode: amount in paise (1 INR = 100 paise)
    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: `rcpt_ev_${bookingId.toString().slice(-8)}_${Date.now()}`,
      notes: {
        bookingId: bookingId.toString(),
        stationName: booking.stationId ? booking.stationId.name : 'EV Station',
        userId: req.user._id.toString(),
      },
    };

    try {
      const order = await razorpay.orders.create(options);
      booking.razorpayOrderId = order.id;
      await booking.save();

      return res.json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKeyId12345',
      });
    } catch (rzpErr) {
      // If Razorpay test API credentials fail or network restricted, provide mock test order
      console.warn('Razorpay live test API warning, utilizing test sandbox order structure:', rzpErr.message);
      const mockOrderId = `order_test_${Date.now()}`;
      booking.razorpayOrderId = mockOrderId;
      await booking.save();

      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: Math.round(amount * 100),
        currency,
        key: 'rzp_test_mockKeyId12345',
        isMock: true,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment Signature and finalize booking
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('stationId', 'name address');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    let isValid = false;

    // Test mode bypass for simulated client payments
    if (
      razorpay_order_id &&
      razorpay_order_id.startsWith('order_test_') &&
      razorpay_payment_id &&
      razorpay_payment_id.startsWith('pay_test_')
    ) {
      isValid = true;
    } else {
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'mockSecretKey67890')
        .update(body.toString())
        .digest('hex');

      isValid = expectedSignature === razorpay_signature;
    }

    if (isValid) {
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.paymentId = razorpay_payment_id;
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save();

      // Ensure slot is marked reserved/booked
      await Slot.findByIdAndUpdate(booking.slotId, {
        status: 'reserved',
        currentBookingId: booking._id,
      });

      // Broadcast slot change via Socket.io
      const io = req.app.get('socketio');
      if (io) {
        io.to(`station_${booking.stationId._id}`).emit('slotStatusChanged', {
          slotId: booking.slotId,
          status: 'reserved',
        });
      }

      // Send confirmation email
      if (booking.userId && booking.userId.email) {
        sendEmail({
          to: booking.userId.email,
          subject: `Booking Confirmed: ${booking.stationId.name} [EV Charge Hub]`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #14161A; border-radius: 6px; background-color: #F8F9FA;">
              <h2 style="color: #3FA66A; margin-top: 0;">Charging Slot Confirmed</h2>
              <p>Hello <strong>${booking.userId.name}</strong>,</p>
              <p>Your payment test confirmation has been verified. Here are your booking details:</p>
              <div style="background-color: #FFFFFF; border: 1px solid #C6CBD1; padding: 16px; border-radius: 4px; margin: 16px 0;">
                <p><strong>Station:</strong> ${booking.stationId.name}</p>
                <p><strong>Address:</strong> ${booking.stationId.address.street}, ${booking.stationId.address.city}</p>
                <p><strong>Start Time:</strong> ${new Date(booking.startTime).toLocaleString()}</p>
                <p><strong>End Time:</strong> ${new Date(booking.endTime).toLocaleString()}</p>
                <p><strong>Amount Paid:</strong> ₹${booking.totalAmount} (Razorpay Sandbox)</p>
                <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
              </div>
              <p style="font-size: 13px; color: #5B6B7A;">This transaction ran in Razorpay Test Mode with test cards. No real monetary transactions occurred.</p>
            </div>
          `,
        });
      }

      return res.json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        data: booking,
      });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
