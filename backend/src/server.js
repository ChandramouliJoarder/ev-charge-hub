const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config({ path: path.resolve(__dirname, '../.env') });




const connectDB = require('./config/db');
const initCronJobs = require('./cron/reminderJob');

// Route files
const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const tripPlannerRoutes = require('./routes/tripPlannerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB handled in startServer()

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach socket.io instance to express app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Real-time Socket.io connections
io.on('connection', (socket) => {
  console.log(`[Socket Connected]: ${socket.id}`);

  // User or dashboard joins station-specific room for real-time slot state
  socket.on('joinStation', (stationId) => {
    socket.join(`station_${stationId}`);
    console.log(`Socket ${socket.id} joined room station_${stationId}`);
  });

  socket.on('leaveStation', (stationId) => {
    socket.leave(`station_${stationId}`);
  });

  // User private channel for notifications
  socket.on('joinUserRoom', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket Disconnected]: ${socket.id}`);
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/trip-planner', tripPlannerRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'EV Charge Hub Core Engine',
    uptime: process.uptime(),
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Start Scheduled Reminder Cron Job
  initCronJobs();

  server.listen(PORT, () => {
    console.log(`⚡ EV Charge Hub Server running on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
  });
};

startServer();

