const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const User = require('../models/User');
const Station = require('../models/Station');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Waitlist = require('../models/Waitlist');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ev_charge_hub';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections in cluster...');
    await User.deleteMany({});
    await Station.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Waitlist.deleteMany({});

    console.log('1. Seeding realistic EV drivers and station owners...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Alex Vance',
        email: 'user@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+91 98765 43210',
        vehicleDetails: {
          make: 'Tata',
          model: 'Nexon.ev Max',
          batteryCapacityKwh: 40.5,
          vehicleRange: 453,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Rohan Verma',
        email: 'rohan@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+91 98111 22334',
        vehicleDetails: {
          make: 'Mahindra',
          model: 'XUV400 EV EL Pro',
          batteryCapacityKwh: 39.4,
          vehicleRange: 456,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1 (510) 555-7794',
        vehicleDetails: {
          make: 'Hyundai',
          model: 'Ioniq 5 AWD',
          batteryCapacityKwh: 77.4,
          vehicleRange: 412,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Marcus Sterling',
        email: 'marcus@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+1 (408) 555-3211',
        vehicleDetails: {
          make: 'Tesla',
          model: 'Model Y Long Range',
          batteryCapacityKwh: 82,
          vehicleRange: 510,
          connectorType: 'Tesla Supercharger',
        },
      },
      {
        name: 'Elena Rostova',
        email: 'owner@evhub.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 98200 12345',
        vehicleDetails: {
          make: 'Porsche',
          model: 'Taycan 4S Turbo',
          batteryCapacityKwh: 93.4,
          vehicleRange: 400,
          connectorType: 'CCS',
        },
      },
      {
        name: 'GridCore Infrastructure India',
        email: 'gridcore@evhub.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 80 5550 4743',
        vehicleDetails: {
          make: 'BYD',
          model: 'Seal Performance',
          batteryCapacityKwh: 82.5,
          vehicleRange: 570,
          connectorType: 'CCS',
        },
      },
    ]);

    const [alex, rohan, sarah, marcus, elena, gridcore] = users;

    console.log('2. Seeding high-power EV charging hubs across India and Global Tech Hubs...');
    const stations = await Station.create([
      // --- BENGALURU, INDIA ---
      {
        name: 'Koramangala 350kW HyperGrid Hub',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [77.6271, 12.9352], // Bengaluru Koramangala
        },
        address: {
          street: '80 Feet Road, 4th Block Koramangala',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560034',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Type 2', 'Tesla Supercharger'],
        powerOutputKw: 350,
        pricePerHour: 180.0,
        pricePerKwh: 18.5,
        photos: [
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Access', 'CCD Cafe Lounge', 'High-Speed Wi-Fi', 'EV Tire Inflation', 'Security Guard'],
        operatingHours: '24/7 Mon-Sun',
        totalSlots: 6,
        averageRating: 4.9,
        totalReviews: 64,
      },
      {
        name: 'Indiranagar 240kW EV Plaza & Lounge',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [77.6412, 12.9784], // Bengaluru Indiranagar
        },
        address: {
          street: '100 Feet Road, HAL 2nd Stage, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560038',
          country: 'India',
        },
        chargerTypes: ['Fast', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
        powerOutputKw: 240,
        pricePerHour: 160.0,
        pricePerKwh: 16.5,
        photos: [
          'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Artisan Coffee', 'Restrooms', 'EV Detailing Bay', 'Wi-Fi'],
        operatingHours: '06:00 - 23:30',
        totalSlots: 6,
        averageRating: 4.8,
        totalReviews: 42,
      },
      {
        name: 'Whitefield Tech Park High-Power Depot',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [77.7500, 12.9866], // Bengaluru Whitefield
        },
        address: {
          street: 'ITPB Road, Whitefield',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560066',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Type 2'],
        powerOutputKw: 180,
        pricePerHour: 140.0,
        pricePerKwh: 15.0,
        photos: [
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Covered Canopy', 'Clean Restrooms', '24/7 Surveillance'],
        operatingHours: '24/7',
        totalSlots: 6,
        averageRating: 4.7,
        totalReviews: 31,
      },

      // --- MUMBAI & PUNE EXPRESSWAY ---
      {
        name: 'Mumbai BKC Ultra-Rapid EV Terminal',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [72.8685, 19.0657], // Mumbai BKC
        },
        address: {
          street: 'G Block, Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400051',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Tesla Supercharger', 'Type 2'],
        powerOutputKw: 350,
        pricePerHour: 220.0,
        pricePerKwh: 21.0,
        photos: [
          'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Executive Lounge', 'Valet EV Bay', '24/7 Security', 'High-Speed Wi-Fi'],
        operatingHours: '24/7',
        totalSlots: 8,
        averageRating: 4.9,
        totalReviews: 78,
      },
      {
        name: 'Expressway Mid-Way Oasis FastCharge',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [73.2842, 18.8250], // Mumbai-Pune Expressway (Khalapur)
        },
        address: {
          street: 'Khalapur Toll Plaza Food Court, Mumbai-Pune Expy',
          city: 'Khalapur',
          state: 'Maharashtra',
          zipCode: '410203',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
        powerOutputKw: 250,
        pricePerHour: 190.0,
        pricePerKwh: 19.5,
        photos: [
          'https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Food Court', 'Clean Restrooms', '24/7 Access', 'Convenience Mart'],
        operatingHours: '24/7',
        totalSlots: 6,
        averageRating: 4.8,
        totalReviews: 53,
      },
      {
        name: 'Pune Hinjewadi EcoGrid Hub',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [73.7383, 18.5913], // Pune Hinjewadi
        },
        address: {
          street: 'Phase 1, Rajiv Gandhi Infotech Park',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411057',
          country: 'India',
        },
        chargerTypes: ['Fast', 'Rapid'],
        connectorTypes: ['CCS', 'Type 2'],
        powerOutputKw: 150,
        pricePerHour: 140.0,
        pricePerKwh: 15.0,
        photos: [
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Restrooms', 'Cafeteria Access', 'Shaded Canopy', '24/7 Surveillance'],
        operatingHours: '24/7',
        totalSlots: 4,
        averageRating: 4.6,
        totalReviews: 29,
      },

      // --- DELHI NCR ---
      {
        name: 'Delhi Connaught Place Flagship SuperCharger',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [77.2185, 28.6315], // New Delhi CP
        },
        address: {
          street: 'Inner Circle, Block C, Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Type 2', 'Tesla Supercharger'],
        powerOutputKw: 350,
        pricePerHour: 210.0,
        pricePerKwh: 20.0,
        photos: [
          'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Access', 'Shopping Arcade Access', 'Driver Lounge', 'Free Wi-Fi'],
        operatingHours: '24/7',
        totalSlots: 8,
        averageRating: 4.9,
        totalReviews: 85,
      },
      {
        name: 'Gurugram Cyber City High-Power Depot',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [77.0878, 28.4950], // Gurugram DLF Cyber City
        },
        address: {
          street: 'Building 10 Parking Arena, DLF Cyber City',
          city: 'Gurugram',
          state: 'Haryana',
          zipCode: '122002',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
        powerOutputKw: 200,
        pricePerHour: 175.0,
        pricePerKwh: 17.5,
        photos: [
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Security', 'Cafe', 'EV Wash Bay', 'Covered Parking'],
        operatingHours: '24/7',
        totalSlots: 6,
        averageRating: 4.8,
        totalReviews: 39,
      },

      // --- KOLKATA & HYDERABAD ---
      {
        name: 'Kolkata Sector V TechHub EcoCharge',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [88.4312, 22.5804], // Kolkata Salt Lake Sector V
        },
        address: {
          street: 'Street No 18, Block EP & GP, Sector V, Salt Lake',
          city: 'Kolkata',
          state: 'West Bengal',
          zipCode: '700091',
          country: 'India',
        },
        chargerTypes: ['Fast', 'Rapid'],
        connectorTypes: ['CCS', 'Type 2', 'GB/T'],
        powerOutputKw: 160,
        pricePerHour: 145.0,
        pricePerKwh: 15.0,
        photos: [
          'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Access', 'Coffee Kiosk', 'Clean Restrooms', 'CCTV'],
        operatingHours: '24/7',
        totalSlots: 4,
        averageRating: 4.7,
        totalReviews: 34,
      },
      {
        name: 'Hyderabad HITEC City TurboStation',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [78.3814, 17.4474], // Hyderabad HITEC City
        },
        address: {
          street: 'Mindspace IT Park, Madhapur',
          city: 'Hyderabad',
          state: 'Telangana',
          zipCode: '500081',
          country: 'India',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Type 2', 'Tesla Supercharger'],
        powerOutputKw: 300,
        pricePerHour: 180.0,
        pricePerKwh: 18.0,
        photos: [
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Access', 'Restrooms', 'Work Lounge', 'Tire Pressure Bay'],
        operatingHours: '24/7',
        totalSlots: 6,
        averageRating: 4.8,
        totalReviews: 46,
      },

      // --- SAN FRANCISCO BAY AREA ---
      {
        name: 'Apex Supercharge Hub - Financial District',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [-122.4018, 37.7915], // SF Financial District
        },
        address: {
          street: '550 California Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94104',
          country: 'USA',
        },
        chargerTypes: ['Rapid', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'Tesla Supercharger', 'Type 2'],
        powerOutputKw: 350,
        pricePerHour: 22.0,
        pricePerKwh: 0.42,
        photos: [
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['24/7 Access', 'Espresso Lounge', 'High-Speed Wi-Fi', 'Security Patrol'],
        operatingHours: '24/7 Mon-Sun',
        totalSlots: 6,
        averageRating: 4.9,
        totalReviews: 48,
      },
      {
        name: 'Silicon Valley HyperGrid Depot',
        ownerId: elena._id,
        location: {
          type: 'Point',
          coordinates: [-122.0842, 37.4220], // Mountain View
        },
        address: {
          street: '1600 Amphitheatre Pkwy',
          city: 'Mountain View',
          state: 'CA',
          zipCode: '94043',
          country: 'USA',
        },
        chargerTypes: ['Fast', 'Ultra-Rapid'],
        connectorTypes: ['CCS', 'CHAdeMO', 'Tesla Supercharger'],
        powerOutputKw: 250,
        pricePerHour: 16.5,
        pricePerKwh: 0.35,
        photos: [
          'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Solar Canopy Cover', 'Organic Cafe', 'Restrooms', 'Touchless Bay Activation'],
        operatingHours: '05:00 - 23:30',
        totalSlots: 6,
        averageRating: 4.8,
        totalReviews: 36,
      },
      {
        name: 'East Bay EcoPower Plaza',
        ownerId: gridcore._id,
        location: {
          type: 'Point',
          coordinates: [-122.2711, 37.8044], // Oakland
        },
        address: {
          street: '1100 Broadway Suite 200',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94607',
          country: 'USA',
        },
        chargerTypes: ['Fast', 'Rapid'],
        connectorTypes: ['CCS', 'Type 2'],
        powerOutputKw: 150,
        pricePerHour: 14.0,
        pricePerKwh: 0.31,
        photos: [
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80',
        ],
        amenities: ['Restrooms', 'Convenience Market', '24/7 Surveillance'],
        operatingHours: '24/7',
        totalSlots: 4,
        averageRating: 4.6,
        totalReviews: 19,
      },
    ]);

    console.log('3. Seeding real-time charging bay slots (time-window matrix)...');
    const now = new Date();
    const allSlots = [];

    stations.forEach((station) => {
      // 3 days window, 2-hour increments
      for (let day = 0; day < 3; day++) {
        for (let hour = 8; hour <= 20; hour += 2) {
          for (let s = 1; s <= station.totalSlots; s++) {
            const start = new Date(now);
            start.setDate(start.getDate() + day);
            start.setHours(hour, 0, 0, 0);

            const end = new Date(start);
            end.setHours(hour + 2, 0, 0, 0);

            // Spread realistic statuses across slots
            let status = 'available';
            if (day === 0 && (hour === 12 || hour === 14) && s <= 2) {
              status = 'reserved';
            } else if (day === 0 && hour === 10 && s === 1) {
              status = 'charging';
            } else if (day === 1 && hour === 16 && s === 1) {
              status = 'reserved';
            }

            allSlots.push({
              stationId: station._id,
              slotNumber: `Bay ${String.fromCharCode(64 + s)}`,
              connectorType: station.connectorTypes[(s - 1) % station.connectorTypes.length],
              startTime: start,
              endTime: end,
              status,
              price: station.pricePerHour * 2,
            });
          }
        }
      }
    });

    const insertedSlots = await Slot.insertMany(allSlots);

    console.log('4. Seeding confirmed, completed, and pending booking transactions...');
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const bookings = await Booking.create([
      {
        userId: alex._id,
        stationId: stations[0]._id, // Koramangala
        slotId: insertedSlots[0]._id,
        startTime: insertedSlots[0].startTime,
        endTime: insertedSlots[0].endTime,
        totalAmount: 360.0,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: 'pay_test_alex01kor',
        razorpayPaymentId: 'pay_test_alex01kor',
        razorpayOrderId: 'order_test_alex01kor',
      },
      {
        userId: rohan._id,
        stationId: stations[3]._id, // Mumbai BKC
        slotId: insertedSlots[10]._id,
        startTime: insertedSlots[10].startTime,
        endTime: insertedSlots[10].endTime,
        totalAmount: 440.0,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: 'pay_test_rohan02bkc',
        razorpayPaymentId: 'pay_test_rohan02bkc',
        razorpayOrderId: 'order_test_rohan02bkc',
      },
      {
        userId: sarah._id,
        stationId: stations[6]._id, // Delhi CP
        slotId: insertedSlots[30]._id,
        startTime: insertedSlots[30].startTime,
        endTime: insertedSlots[30].endTime,
        totalAmount: 420.0,
        status: 'completed',
        paymentStatus: 'paid',
        paymentId: 'pay_test_sarah03cp',
        razorpayPaymentId: 'pay_test_sarah03cp',
        razorpayOrderId: 'order_test_sarah03cp',
      },
      {
        userId: alex._id,
        stationId: stations[8]._id, // Kolkata Sector V
        slotId: insertedSlots[20]._id,
        startTime: pastDate,
        endTime: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000),
        totalAmount: 290.0,
        status: 'completed',
        paymentStatus: 'paid',
        paymentId: 'pay_test_alexPastKol',
        razorpayPaymentId: 'pay_test_alexPastKol',
        razorpayOrderId: 'order_test_alexPastKol',
      },
    ]);

    // Link booking to slot
    insertedSlots[0].currentBookingId = bookings[0]._id;
    await insertedSlots[0].save();

    console.log('5. Seeding verified reviews and performance ratings...');
    await Review.create([
      {
        userId: alex._id,
        stationId: stations[0]._id,
        bookingId: bookings[0]._id,
        rating: 5,
        comment: 'Blazing fast 350kW charging speed! Pulled sustained DC power into my Nexon EV Max. The CCD lounge and secure bays make this the premier Bengaluru hub.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 5,
      },
      {
        userId: rohan._id,
        stationId: stations[3]._id,
        bookingId: bookings[1]._id,
        rating: 5,
        comment: 'Outstanding setup at BKC. Smooth bay activation via QR, prompt valet assistance, and air-conditioned lounge.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 5,
      },
      {
        userId: sarah._id,
        stationId: stations[6]._id,
        bookingId: bookings[2]._id,
        rating: 5,
        comment: 'Very accessible location in central Delhi Connaught Place. Plugged in and recharged 80% while dining nearby.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 5,
      },
      {
        userId: alex._id,
        stationId: stations[8]._id,
        bookingId: bookings[3]._id,
        rating: 5,
        comment: 'Reliable 160kW charging in Sector V Kolkata. Clean parking area and immediate connection.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 4,
      },
    ]);

    console.log('6. Seeding waitlist queue records...');
    await Waitlist.create([
      {
        userId: marcus._id,
        stationId: stations[0]._id,
        requestedDate: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        connectorType: 'CCS',
        status: 'waiting',
        notified: false,
      },
      {
        userId: sarah._id,
        stationId: stations[3]._id,
        requestedDate: new Date(now.getTime() + 18 * 60 * 60 * 1000),
        connectorType: 'CCS',
        status: 'waiting',
        notified: false,
      },
    ]);

    console.log('✅ ALL COLLECTIONS SEEDED IN MONGODB ATLAS:');
    console.log(`- ${users.length} Users (Drivers + Station Owners)`);
    console.log(`- ${stations.length} Charging Hubs (Bengaluru, Mumbai, Pune, Delhi NCR, Kolkata, Hyderabad, USA)`);
    console.log(`- ${allSlots.length} Real-Time Charging Bay Slots`);
    console.log(`- ${bookings.length} Bookings (Confirmed, Completed, Active)`);
    console.log(`- 4 Verified Reviews`);
    console.log(`- 2 Active Waitlist Entries`);
    console.log('\nDemo User: user@evhub.com | password123');
    console.log('Demo Owner: owner@evhub.com | password123');
    return true;
  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  }
};

if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seed completed successfully.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { runSeed: seedData };
