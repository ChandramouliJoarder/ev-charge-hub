import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, MapPin, Navigation, Calendar, BarChart3, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isOwner, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#14161A] border-b border-[#2E333D] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Hardware Brand Badge */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#1B1D22] border border-[#404754] flex items-center justify-center transition-all group-hover:border-[#3FA66A]">
              <Zap className="w-5 h-5 text-[#3FA66A] fill-[#3FA66A]" />
            </div>
            <div>
              <span className="font-heading font-bold text-lg tracking-wider text-[#F2F3F5] uppercase">
                EV Charge<span className="text-[#3FA66A] ml-1">Hub</span>
              </span>
              <div className="flex items-center space-x-1.5 text-[10px] text-[#8C96A2] font-mono leading-none">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3FA66A] animate-pulse"></span>
                <span>GRID ONLINE</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/') ? 'text-[#F2F3F5] bg-[#242830] border-b-2 border-[#3FA66A]' : 'text-[#8C96A2] hover:text-[#F2F3F5] hover:bg-[#1B1D22]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#8C96A2]" />
                <span>Station Map</span>
              </span>
            </Link>

            <Link
              to="/trip-planner"
              className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive('/trip-planner') ? 'text-[#F2F3F5] bg-[#242830] border-b-2 border-[#3FA66A]' : 'text-[#8C96A2] hover:text-[#F2F3F5] hover:bg-[#1B1D22]'
              }`}
            >
              <span className="flex items-center space-x-1.5">
                <Navigation className="w-4 h-4 text-[#8C96A2]" />
                <span>Trip Planner</span>
              </span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/bookings"
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive('/bookings') ? 'text-[#F2F3F5] bg-[#242830] border-b-2 border-[#3FA66A]' : 'text-[#8C96A2] hover:text-[#F2F3F5] hover:bg-[#1B1D22]'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-[#8C96A2]" />
                  <span>My Bookings</span>
                </span>
              </Link>
            )}

            {isAuthenticated && isOwner && (
              <Link
                to="/owner-dashboard"
                className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive('/owner-dashboard') ? 'text-[#F2F3F5] bg-[#242830] border-b-2 border-[#E8A33D]' : 'text-[#E8A33D] hover:bg-[#1B1D22]'
                }`}
              >
                <span className="flex items-center space-x-1.5">
                  <BarChart3 className="w-4 h-4 text-[#E8A33D]" />
                  <span>Station Owner Portal</span>
                </span>
              </Link>
            )}
          </div>

          {/* Right Action / Auth Status */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[#1B1D22] border border-[#2E333D] rounded hover:border-[#8C96A2] transition-colors"
                >
                  <User className="w-4 h-4 text-[#C6CBD1]" />
                  <span className="text-xs font-mono text-[#F2F3F5]">{user?.name}</span>
                  {user?.role === 'owner' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-[#E8A33D]/20 text-[#E8A33D] border border-[#E8A33D]/40 rounded font-mono">
                      OWNER
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-[#8C96A2] hover:text-[#F2F3F5] hover:bg-[#242830] rounded transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-mono uppercase text-[#C6CBD1] hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-medium text-[#14161A] bg-[#3FA66A] hover:bg-[#4ECB82] rounded-sm transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#8C96A2] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1B1D22] border-b border-[#2E333D] px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-base text-[#F2F3F5] hover:bg-[#242830]"
          >
            Station Map
          </Link>
          <Link
            to="/trip-planner"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded text-base text-[#F2F3F5] hover:bg-[#242830]"
          >
            Trip Planner
          </Link>
          {isAuthenticated && (
            <Link
              to="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-base text-[#F2F3F5] hover:bg-[#242830]"
            >
              My Bookings
            </Link>
          )}
          {isAuthenticated && isOwner && (
            <Link
              to="/owner-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded text-base text-[#E8A33D] hover:bg-[#242830]"
            >
              Station Owner Portal
            </Link>
          )}
          <div className="pt-2 border-t border-[#2E333D]">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-[#F2F3F5]"
                >
                  Profile ({user?.name})
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm text-[#8C96A2] hover:text-red-400"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm text-[#C6CBD1] border border-[#404754] rounded"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium bg-[#3FA66A] text-[#14161A] rounded"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
