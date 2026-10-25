import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import StationDetail from './pages/StationDetail';
import TripPlanner from './pages/TripPlanner';
import Bookings from './pages/Bookings';
import OwnerDashboard from './pages/OwnerDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#14161A] text-[#F2F3F5] font-body selection:bg-[#3FA66A] selection:text-[#14161A]">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Discovery Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/stations/:id" element={<StationDetail />} />
              <Route path="/trip-planner" element={<TripPlanner />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Driver Routes */}
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Protected Station Owner Routes */}
              <Route
                path="/owner-dashboard"
                element={
                  <ProtectedRoute requiredRole="owner">
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
