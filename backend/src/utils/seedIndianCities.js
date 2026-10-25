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

const indianStationsData = [
  // 1. New Delhi / NCR
  {
    name: 'Jio-bp Pulse HyperCharge Hub - Connaught Place',
    location: { type: 'Point', coordinates: [77.2167, 28.6328] }, // [lng, lat]
    address: {
      street: 'Inner Circle, Block C, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2', 'CHAdeMO'],
    powerOutputKw: 240,
    pricePerHour: 18.0, // in USD or nominal units
    pricePerKwh: 0.28,
    photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80'],
    amenities: ['24/7 Access', 'Coffee Lounge', 'Security Guards', 'Fast Wi-Fi', 'Restrooms'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.8,
    totalReviews: 42,
  },
  {
    name: 'Tata Power EZ Charge - Cyber City Hub',
    location: { type: 'Point', coordinates: [77.0888, 28.4950] },
    address: {
      street: 'Building 10, DLF Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122002',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'GB/T', 'Type 2'],
    powerOutputKw: 180,
    pricePerHour: 16.0,
    pricePerKwh: 0.26,
    photos: ['https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Underground Covered Bays', 'Cafe', 'EV Tire Care'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.7,
    totalReviews: 38,
  },
  // 2. Mumbai / MMR
  {
    name: 'Adani TotalEnergies EV Station - BKC Nexus',
    location: { type: 'Point', coordinates: [72.8687, 19.0662] },
    address: {
      street: 'G Block, Bandra Kurla Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400051',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Tesla Supercharger', 'Type 2'],
    powerOutputKw: 300,
    pricePerHour: 22.0,
    pricePerKwh: 0.32,
    photos: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Executive EV Lounge', 'Showers', 'High-Speed Wi-Fi', 'Restrooms'],
    operatingHours: '24/7',
    totalSlots: 8,
    averageRating: 4.9,
    totalReviews: 64,
  },
  {
    name: 'Statiq HyperGrid Hub - Western Express Highway',
    location: { type: 'Point', coordinates: [72.8530, 19.1176] },
    address: {
      street: 'Near Domestic Airport Flyover, Vile Parle East',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400057',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 150,
    pricePerHour: 15.0,
    pricePerKwh: 0.24,
    photos: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80'],
    amenities: ['24/7 Food Court', 'Car Wash Bay', 'Security Patrol'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.6,
    totalReviews: 29,
  },
  // 3. Bengaluru (Tech Capital)
  {
    name: 'Ather Grid & ChargeZone SuperHub - Indiranagar',
    location: { type: 'Point', coordinates: [77.6412, 12.9719] },
    address: {
      street: '100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560038',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2', 'Tesla Supercharger'],
    powerOutputKw: 250,
    pricePerHour: 20.0,
    pricePerKwh: 0.30,
    photos: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Specialty Coffee Lounge', 'Co-working Pods', 'Solar Powered', '24/7 Access'],
    operatingHours: '24/7',
    totalSlots: 8,
    averageRating: 4.9,
    totalReviews: 76,
  },
  {
    name: 'Zeon Charging Mega Depot - Electronic City',
    location: { type: 'Point', coordinates: [77.6766, 12.8399] },
    address: {
      street: 'Hosur Road, Phase 1, Electronic City',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560100',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
    powerOutputKw: 200,
    pricePerHour: 17.5,
    pricePerKwh: 0.27,
    photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Solar Canopy', 'EV Inspection Center', 'Restrooms', 'Snack Kiosk'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.8,
    totalReviews: 54,
  },
  // 4. Hyderabad (HITEC City & Gachibowli)
  {
    name: 'GMR AeroCity GreenVolt Hub - Rajiv Gandhi Airport',
    location: { type: 'Point', coordinates: [78.4294, 17.2403] },
    address: {
      street: 'Airport Approach Road, Shamshabad',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500409',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 350,
    pricePerHour: 24.0,
    pricePerKwh: 0.35,
    photos: ['https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Airport Valet', 'Airconditioned Drivers Lounge', 'Restrooms', '24/7 Access'],
    operatingHours: '24/7',
    totalSlots: 8,
    averageRating: 4.9,
    totalReviews: 58,
  },
  {
    name: 'Tata Power FastCharge - HITEC City Cyber Towers',
    location: { type: 'Point', coordinates: [78.3772, 17.4504] },
    address: {
      street: 'Madhapur Main Road, HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500081',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'CHAdeMO', 'Type 2'],
    powerOutputKw: 150,
    pricePerHour: 15.0,
    pricePerKwh: 0.25,
    photos: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Food Street Adjacent', '24/7 Security', 'Mobile App QR Start'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.7,
    totalReviews: 33,
  },
  // 5. Chennai
  {
    name: 'Relux Electric SuperStation - OMR IT Corridor',
    location: { type: 'Point', coordinates: [80.2281, 12.9249] },
    address: {
      street: 'Old Mahabalipuram Road, Sholinganallur',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600119',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 180,
    pricePerHour: 16.0,
    pricePerKwh: 0.26,
    photos: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Covered Parking', 'Restaurant', 'EV Detailing'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.7,
    totalReviews: 35,
  },
  // 6. Pune (Automotive & Tech Hub)
  {
    name: 'Pulse Grid Express - Pune Mumbai Expressway Entry',
    location: { type: 'Point', coordinates: [73.7423, 18.6298] },
    address: {
      street: 'Wakad Bridge Junction, Hinjewadi Road',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411057',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2', 'CHAdeMO'],
    powerOutputKw: 240,
    pricePerHour: 18.0,
    pricePerKwh: 0.28,
    photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Highway Rest Stop', '24/7 Convenience Store', 'Clean Restrooms', 'Cafe'],
    operatingHours: '24/7',
    totalSlots: 8,
    averageRating: 4.8,
    totalReviews: 49,
  },
  // 7. Kolkata
  {
    name: 'EcoGrid Bengal Hub - Salt Lake Sector V',
    location: { type: 'Point', coordinates: [88.4332, 22.5804] },
    address: {
      street: 'Ring Road, Sector V, Bidhannagar',
      city: 'Kolkata',
      state: 'West Bengal',
      zipCode: '700091',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 150,
    pricePerHour: 14.5,
    pricePerKwh: 0.23,
    photos: ['https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80'],
    amenities: ['24/7 Guarded Stalls', 'Tea & Coffee Lounge', 'EV Air & Tire Station'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.6,
    totalReviews: 27,
  },
  // 8. Ahmedabad / Gujarat Clean Energy Corridor
  {
    name: 'Torrent GreenVolt Hub - SG Highway',
    location: { type: 'Point', coordinates: [72.5074, 23.0338] },
    address: {
      street: 'Sarkhej - Gandhinagar Highway, Bodakdev',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zipCode: '380054',
      country: 'India',
    },
    chargerTypes: ['Rapid', 'Ultra-Rapid'],
    connectorTypes: ['CCS', 'Type 2', 'Tesla Supercharger'],
    powerOutputKw: 250,
    pricePerHour: 17.0,
    pricePerKwh: 0.25,
    photos: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Solar Canopy', 'Restrooms', 'Shopping Mall Access', '24/7 Stalls'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.8,
    totalReviews: 39,
  },
  // 9. Jaipur
  {
    name: 'Rajasthan EcoCharge Depot - Tonk Road',
    location: { type: 'Point', coordinates: [75.7951, 26.8524] },
    address: {
      street: 'Tonk Road near Airport Circle',
      city: 'Jaipur',
      state: 'Rajasthan',
      zipCode: '302018',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 120,
    pricePerHour: 13.5,
    pricePerKwh: 0.22,
    photos: ['https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Highway Diner', 'Tourist Information Desk', 'Restrooms'],
    operatingHours: '06:00 - 23:00',
    totalSlots: 4,
    averageRating: 4.6,
    totalReviews: 22,
  },
  // 10. Chandigarh (Tricity Gateway)
  {
    name: 'StatIQ Alpine Gateway FastStation - Madhya Marg',
    location: { type: 'Point', coordinates: [76.7915, 30.7398] },
    address: {
      street: 'Sector 26, Madhya Marg',
      city: 'Chandigarh',
      state: 'Punjab',
      zipCode: '160019',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 150,
    pricePerHour: 15.0,
    pricePerKwh: 0.24,
    photos: ['https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Covered Bays', 'Coffee Bar', 'Tire Pressure Point'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.7,
    totalReviews: 31,
  },
  // 11. Kochi / Kerala Coastal Corridor
  {
    name: 'Kochi SmartGrid Solar Charger - MG Road',
    location: { type: 'Point', coordinates: [76.2829, 9.9723] },
    address: {
      street: 'Mahatma Gandhi Road, Ravipuram',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682016',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 120,
    pricePerHour: 14.0,
    pricePerKwh: 0.22,
    photos: ['https://images.unsplash.com/photo-1558441719-8b489c63f732?auto=format&fit=crop&w=900&q=80'],
    amenities: ['Metro Station Access', 'Restrooms', '24/7 CCTV'],
    operatingHours: '24/7',
    totalSlots: 4,
    averageRating: 4.7,
    totalReviews: 24,
  },
  // 12. Lucknow
  {
    name: 'Awadh GreenGrid Depot - Gomti Nagar',
    location: { type: 'Point', coordinates: [80.9984, 26.8526] },
    address: {
      street: 'Vibhuti Khand, Gomti Nagar',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      zipCode: '226010',
      country: 'India',
    },
    chargerTypes: ['Fast', 'Rapid'],
    connectorTypes: ['CCS', 'Type 2'],
    powerOutputKw: 150,
    pricePerHour: 14.0,
    pricePerKwh: 0.23,
    photos: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=900&q=80'],
    amenities: ['24/7 Security', 'Snack Bar', 'Clean Restrooms'],
    operatingHours: '24/7',
    totalSlots: 6,
    averageRating: 4.6,
    totalReviews: 21,
  },
];

const seedIndianDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ev_charge_hub';
    console.log(`Connecting to MongoDB Atlas...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing records...');
    await User.deleteMany({});
    await Station.deleteMany({});
    await Slot.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    await Waitlist.deleteMany({});

    console.log('Creating demo users (Indian EV drivers and Hub Owners)...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'user@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+91 98765 43210',
        vehicleDetails: {
          make: 'Tata',
          model: 'Nexon EV Empowered+',
          batteryCapacityKwh: 45,
          vehicleRange: 465,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Rohan Mehra',
        email: 'rohan@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+91 98200 12345',
        vehicleDetails: {
          make: 'Mahindra',
          model: 'XUV400 Pro EV',
          batteryCapacityKwh: 39.4,
          vehicleRange: 456,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Priya Iyer',
        email: 'priya@evhub.com',
        password: hashedPassword,
        role: 'user',
        phone: '+91 99401 56789',
        vehicleDetails: {
          make: 'MG',
          model: 'ZS EV Exclusive',
          batteryCapacityKwh: 50.3,
          vehicleRange: 461,
          connectorType: 'CCS',
        },
      },
      {
        name: 'Elena Rostova',
        email: 'owner@evhub.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 98110 54321',
        vehicleDetails: {
          make: 'Hyundai',
          model: 'Ioniq 5 AWD',
          batteryCapacityKwh: 72.6,
          vehicleRange: 631,
          connectorType: 'CCS',
        },
      },
      {
        name: 'National EV Grid Operations',
        email: 'gridops@evhub.com',
        password: hashedPassword,
        role: 'owner',
        phone: '+91 1800 200 4455',
        vehicleDetails: {
          make: 'BYD',
          model: 'Seal Performance',
          batteryCapacityKwh: 82.5,
          vehicleRange: 580,
          connectorType: 'CCS',
        },
      },
    ]);

    const ownerElena = users[3];
    const ownerGrid = users[4];
    const driverAarav = users[0];
    const driverRohan = users[1];

    console.log('Seeding 12 major Indian metropolitan & corridor charging hubs...');
    const stationDocs = indianStationsData.map((st, i) => ({
      ...st,
      ownerId: i % 2 === 0 ? ownerElena._id : ownerGrid._id,
    }));

    const createdStations = await Station.create(stationDocs);

    console.log('Generating real-time bay slots for each station (3-day schedule)...');
    const now = new Date();
    const allSlots = [];

    createdStations.forEach((station) => {
      for (let day = 0; day < 3; day++) {
        for (let hour = 8; hour <= 20; hour += 2) {
          for (let s = 1; s <= station.totalSlots; s++) {
            const start = new Date(now);
            start.setDate(start.getDate() + day);
            start.setHours(hour, 0, 0, 0);

            const end = new Date(start);
            end.setHours(hour + 2, 0, 0, 0);

            let status = 'available';
            if (day === 0 && (hour === 12 || hour === 16) && s <= 2) {
              status = 'reserved';
            } else if (day === 0 && hour === 10 && s === 1) {
              status = 'charging';
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

    console.log('Creating realistic sample bookings...');
    const sampleBookings = await Booking.create([
      {
        userId: driverAarav._id,
        stationId: createdStations[0]._id, // Delhi
        slotId: insertedSlots[0]._id,
        startTime: insertedSlots[0].startTime,
        endTime: insertedSlots[0].endTime,
        totalAmount: 36.0,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: 'pay_rzp_test_delhi01',
        razorpayPaymentId: 'pay_rzp_test_delhi01',
        razorpayOrderId: 'order_rzp_test_delhi01',
      },
      {
        userId: driverRohan._id,
        stationId: createdStations[2]._id, // Mumbai BKC
        slotId: insertedSlots[10]._id,
        startTime: insertedSlots[10].startTime,
        endTime: insertedSlots[10].endTime,
        totalAmount: 44.0,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentId: 'pay_rzp_test_mumbai02',
        razorpayPaymentId: 'pay_rzp_test_mumbai02',
        razorpayOrderId: 'order_rzp_test_mumbai02',
      },
      {
        userId: driverAarav._id,
        stationId: createdStations[4]._id, // Bengaluru
        slotId: insertedSlots[25]._id,
        startTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        totalAmount: 40.0,
        status: 'completed',
        paymentStatus: 'paid',
        paymentId: 'pay_rzp_test_blr03',
        razorpayPaymentId: 'pay_rzp_test_blr03',
        razorpayOrderId: 'order_rzp_test_blr03',
      },
    ]);

    insertedSlots[0].currentBookingId = sampleBookings[0]._id;
    await insertedSlots[0].save();

    console.log('Creating verified driver reviews for Indian hubs...');
    await Review.create([
      {
        userId: driverAarav._id,
        stationId: createdStations[0]._id,
        bookingId: sampleBookings[0]._id,
        rating: 5,
        comment: 'Super fast charging at Connaught Place! Topped up my Nexon EV from 20% to 80% in 28 minutes. Great coffee lounge while waiting.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 5,
      },
      {
        userId: driverRohan._id,
        stationId: createdStations[2]._id,
        bookingId: sampleBookings[1]._id,
        rating: 5,
        comment: 'BKC station is world class. 300kW chargers with dedicated security guards and spacious covered bays.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 5,
      },
      {
        userId: driverAarav._id,
        stationId: createdStations[4]._id,
        bookingId: sampleBookings[2]._id,
        rating: 5,
        comment: 'Indiranagar 100 Feet Road location is super convenient. Instant app unlock and reliable power throughput.',
        chargingSpeedSatisfaction: 5,
        cleanlinessRating: 4,
      },
    ]);

    console.log('Creating waitlist entries...');
    await Waitlist.create([
      {
        userId: driverRohan._id,
        stationId: createdStations[0]._id,
        requestedDate: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        connectorType: 'CCS',
        status: 'waiting',
        notified: false,
      },
    ]);

    console.log('\n======================================================');
    console.log('🇮🇳 MONGODB ATLAS POPULATED FOR MAJOR INDIAN CITIES:');
    console.log(`- 12 Stations across: Delhi, Gurugram, Mumbai, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Chandigarh, Kochi, Lucknow`);
    console.log(`- ${insertedSlots.length} Real-Time 2-Hour Charging Slots`);
    console.log(`- ${users.length} Users (Indian EV Drivers with Nexon EV, XUV400, ZS EV, Ioniq 5)`);
    console.log(`- ${sampleBookings.length} Bookings + Verified 5-Star Reviews`);
    console.log('======================================================\n');
    console.log('Demo Driver Login: user@evhub.com | password123');
    console.log('Demo Owner Login: owner@evhub.com | password123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedIndianDatabase();
