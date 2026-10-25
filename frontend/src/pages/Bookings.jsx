import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Confirm cancellation of this charging slot reservation?')) return;
    setCancellingId(id);
    try {
      await api.put(`/bookings/${id}/cancel`, {
        reason: 'Cancelled by driver from dashboard',
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-[#8C96A2] font-mono">
        <span className="inline-block w-6 h-6 border-2 border-[#3FA66A] border-r-transparent rounded-full animate-spin mr-3"></span>
        LOADING RESERVATION LOGS...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#2E333D] mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#F2F3F5] uppercase tracking-wider">
            My Charging Reservations
          </h1>
          <p className="text-xs text-[#8C96A2] font-mono mt-1">
            DRIVER BOOKING LOG & PAYMENT AUDIT TRAIL
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="hardware-panel p-12 text-center rounded-sm">
          <Calendar className="w-10 h-10 text-[#5B6B7A] mx-auto mb-3" />
          <h3 className="text-base font-heading font-bold text-[#F2F3F5] uppercase mb-1">
            No active reservations
          </h3>
          <p className="text-xs text-[#8C96A2] mb-4">
            Discover charging stations and secure a charging bay in advance.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] text-xs font-heading font-bold uppercase rounded-sm inline-block"
          >
            Locate Stations
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const isConfirmed = booking.status === 'confirmed';

            return (
              <div
                key={booking._id}
                className="hardware-panel p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-xs uppercase ${
                        isConfirmed
                          ? 'bg-[#3FA66A]/20 text-[#3FA66A] border border-[#3FA66A]/40'
                          : isCancelled
                          ? 'bg-red-950/40 text-red-400 border border-red-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs font-mono text-[#8C96A2]">
                      REF: {booking._id.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-heading font-bold text-[#F2F3F5]">
                    {booking.stationId?.name || 'EV Charging Station'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8C96A2]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-[#5B6B7A]" />
                      <span>
                        {new Date(booking.startTime).toLocaleDateString()},{' '}
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </span>

                    <span className="font-mono text-[#C6CBD1]">
                      Bay: {booking.slotId?.slotNumber || 'Bay 1'}
                    </span>

                    <span className="font-mono text-[#3FA66A] font-semibold">
                      ₹{booking.totalAmount} (Razorpay Test Sandbox)
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {isConfirmed && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="px-3 py-1.5 bg-[#14161A] hover:bg-red-950/30 border border-red-500/40 text-red-400 text-xs font-mono rounded-sm transition-colors"
                    >
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}

                  <Link
                    to={`/stations/${booking.stationId?._id}`}
                    className="px-3.5 py-1.5 bg-[#242830] hover:bg-[#3FA66A] hover:text-[#14161A] text-[#C6CBD1] text-xs font-medium border border-[#404754] rounded-sm transition-colors"
                  >
                    View Station
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
