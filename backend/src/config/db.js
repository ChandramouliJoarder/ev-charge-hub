const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ev_charge_hub';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);

  } catch (error) {
    console.warn(`[MongoDB Connection Notice]: ${error.message}`);
    console.log('ℹ️ Running in API development mode. To persist live queries, connect your MongoDB instance or MongoDB Atlas cluster in .env');
  }
};

module.exports = connectDB;


