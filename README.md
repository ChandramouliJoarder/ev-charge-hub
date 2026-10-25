# EV Charge Hub ⚡
> Intelligent EV charging station discovery, slot reservation, and energy fleet management platform.

Built as an industry-standard full-stack MERN portfolio project showcasing clean architecture, realistic hardware & energy design aesthetics, real-time WebSocket synchronization, and geospatial computation.

---

## 🎨 Design Philosophy & Hardware Identity

Rather than generic templates or SaaS styling, **EV Charge Hub** takes direct visual inspiration from modern high-performance EV dashboards, charging cabinets, brushed steel hardware, and industrial power distribution equipment:

- **Graphite / Charcoal App Shell (`#14161A`, `#1B1D22`)**: Grounded industrial foundation preventing glare and emphasizing charging data.
- **Brushed Steel & Metallic Accents (`#C6CBD1`, `#404754`)**: Deliberately applied to navigation rails, connector badges, hardware card borders, and dashboard frames.
- **High-Readability Off-White (`#F2F3F5`)**: Used for all vital telemetry and body text to maximize readability without stark white eye fatigue.
- **Confident Energy Charge-Green (`#3FA66A`)**: Used exclusively for live active states, available slots, verified confirmations, and primary actions.
- **Electric Amber (`#E8A33D`)**: Secondary high-visibility indicator for peak metrics, owner portals, and warnings.
- **Typography**: 
  - **Headings**: *Space Grotesk* — condensed, technical/industrial sans-serif that fits naturally on an automotive dashboard.
  - **Body**: *Work Sans* — humanist sans-serif offering maximum legibility at small telemetry scales.

---

## 🛠 Tech Stack

### Frontend
- **React (Vite)** with modern functional components & hooks
- **Tailwind CSS v4** with tailored theme tokens and metallic hardware styling
- **React Router v7** with role-based protected route wrappers
- **Leaflet & React-Leaflet** for interactive geospatial maps
- **Recharts** for analytics and revenue trend visualizations
- **Socket.io-client** for real-time bay availability and status sync
- **Razorpay Checkout SDK** for sandbox test mode transactions

### Backend
- **Node.js & Express.js** REST API with centralized error handling
- **MongoDB & Mongoose** with **`2dsphere`** geospatial indexing
- **Socket.io** WebSocket server for instant room-based slot state broadcasts
- **JSON Web Tokens (JWT) & bcryptjs** for secure role-based authorization
- **node-cron** for periodic 30-minute automated booking reminder jobs
- **Nodemailer** with Ethereal email simulation & sandbox previews

---

## 🚀 Key Feature Breakdown

1. **Authentication & Multi-Role Architecture**:
   - Distinct roles: **Driver / Regular User** and **Station Owner / Admin**.
   - Driver profile with vehicle telemetry specifications (range in km, battery kWh, port types).

2. **Geospatial Station Discovery**:
   - Interactive Leaflet map powered by OpenStreetMap.
   - Filter stations by charger speed (Fast/Rapid/Ultra-Rapid), port type (CCS/CHAdeMO/Type 2), price, and rating.
   - Browser GPS integration to sort and locate hubs closest to the driver.

3. **Atomic Slot Booking & Real-Time Sync**:
   - Live bay status matrix (Available, Reserved, Charging).
   - Atomic database reservation checking preventing double-booking race conditions.
   - Instant WebSocket broadcasting when bays change status.

4. **Razorpay Sandbox Payment Verification**:
   - Nominal test booking fee confirmation.
   - Server-side SHA256 HMAC signature verification before confirming reservations.
   - *100% Sandbox / Test mode with zero real money involved.*

5. **Intelligent EV Trip Planner**:
   - Calculates routes between waypoints.
   - Applies an 80% battery safety margin and automatically computes recommended high-speed charging stops along the path.
   - Direct one-click booking at recommended stops.

6. **Station Owner Analytics Dashboard**:
   - MongoDB Aggregation pipelines computing total reservations, test revenue, slot utilization percentages, and peak hours.
   - Custom-themed Recharts visualization for revenue trends, hourly load, and bay allocation.
   - Station publishing modal to deploy new hubs to the grid.

7. **Notification & Automated Jobs**:
   - Automated booking confirmation emails.
   - Recurring **node-cron** jobs running every 30 minutes scanning for reservations starting within the hour.
   - Congestion waitlist queue with automated notifications when reservations are cancelled.

---

## 📦 Project Structure

```text
ev-charge-hub/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # Auth, Station, Slot, Booking, Payment, Review, Trip, Analytics
│   │   ├── models/          # User, Station, Slot, Booking, Review, Waitlist
│   │   ├── routes/          # Express route definitions
│   │   ├── middleware/      # JWT auth and role verification
│   │   ├── utils/           # Nodemailer service, seed script
│   │   ├── cron/            # Scheduled reminder jobs
│   │   └── server.js        # Main Express & Socket.io server
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, ProtectedRoute
    │   ├── context/         # AuthContext
    │   ├── hooks/           # useSocket
    │   ├── pages/           # Home, StationDetail, TripPlanner, Bookings, OwnerDashboard, Login, Register, Profile
    │   ├── services/        # Axios API client
    │   ├── App.jsx          # Router & layout
    │   ├── index.css        # Custom theme & hardware styling
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local community edition or MongoDB Atlas free URI)

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # (Optional) Populates demo users, geospatial stations, and slots
npm run dev      # Runs on port 5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Runs on http://localhost:5173
```

---

## 🔑 Demo Credentials (from Seed Script)

| Role | Email | Password |
|---|---|---|
| **Driver / User** | `user@evhub.com` | `password123` |
| **Station Owner** | `owner@evhub.com` | `password123` |
