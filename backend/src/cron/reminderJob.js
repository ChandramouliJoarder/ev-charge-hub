const cron = require('node-cron');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');

const initCronJobs = () => {
  // Check every 30 minutes for bookings starting in the next 30-60 minutes
  cron.schedule('*/30 * * * *', async () => {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    try {
      const now = new Date();
      const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

      const upcomingBookings = await Booking.find({
        status: 'confirmed',
        reminderSent: false,
        startTime: { $gte: now, $lte: inOneHour },
      })
        .populate('userId', 'name email')
        .populate('stationId', 'name address');

      for (const booking of upcomingBookings) {
        if (booking.userId && booking.userId.email) {
          await sendEmail({
            to: booking.userId.email,
            subject: 'Reminder: Your EV Charging Slot Starts Soon!',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #3FA66A;">EV Charge Hub Reminder</h2>
                <p>Hello <strong>${booking.userId.name}</strong>,</p>
                <p>Your charging reservation at <strong>${booking.stationId.name}</strong> starts at <strong>${new Date(booking.startTime).toLocaleTimeString()}</strong>.</p>
                <p>Location: ${booking.stationId.address.street}, ${booking.stationId.address.city}</p>
                <p>Please arrive 5 minutes early to connect your vehicle smoothly.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <small style="color: #666;">EV Charge Hub Platform Notifications</small>
              </div>
            `,
          });
          booking.reminderSent = true;
          await booking.save();
        }
      }
    } catch (error) {
      console.error('Cron job error:', error.message);
    }
  });

  console.log('[Node-Cron Service Started]: Automated 30-min booking reminders active.');
};

module.exports = initCronJobs;
