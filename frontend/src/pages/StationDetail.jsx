import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import {
  Zap,
  MapPin,
  Clock,
  Shield,
  Star,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  CreditCard,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import PaymentModal from '../components/PaymentModal';


export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [station, setStation] = useState(null);
  const [slots, setSlots] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [ratingBreakdown, setRatingBreakdown] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState(null);


  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Real-time socket listener for slot updates
  useSocket(id, (updatedData) => {
    if (updatedData.slotId) {
      setSlots((prev) =>
        prev.map((s) =>
          s._id === updatedData.slotId ? { ...s, status: updatedData.status } : s
        )
      );
      if (selectedSlot?._id === updatedData.slotId && updatedData.status !== 'available') {
        setSelectedSlot(null);
      }
    }
  });

  const fetchData = async () => {
    try {
      const stationRes = await api.get(`/stations/${id}`);
      if (stationRes.data?.success) {
        setStation(stationRes.data.data.station);
        setSlots(stationRes.data.data.slots);
      }

      const reviewsRes = await api.get(`/reviews/station/${id}`);
      if (reviewsRes.data?.success) {
        setReviews(reviewsRes.data.data);
        setRatingBreakdown(reviewsRes.data.ratingBreakdown || {});
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load station details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Open payment modal when user confirms slot
  const handleBookingConfirm = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedSlot) return;
    setErrorMsg('');
    setShowPaymentModal(true);
  };

  // Called from PaymentModal after method selection
  const handlePaymentProceed = async (paymentMethod) => {
    setBookingInProgress(true);
    try {
      // 1. Create booking in pending status
      const bookingRes = await api.post('/bookings', {
        stationId: station._id,
        slotId: selectedSlot._id,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
      });

      const booking = bookingRes.data.data;
      setPendingBooking(booking);

      // 2. Generate Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        amount: booking.totalAmount,
        bookingId: booking._id,
      });

      const orderData = orderRes.data;

      // 3. Launch Razorpay modal if SDK available and credentials are real
      if (window.Razorpay && !orderData.isMock) {
        setShowPaymentModal(false);
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'EV Charge Hub',
          description: `Charging Bay Reservation - ${station.name}`,
          order_id: orderData.orderId,
          method: paymentMethod === 'card' ? 'card' : paymentMethod === 'upi' ? 'upi' : paymentMethod === 'netbanking' ? 'netbanking' : 'wallet',
          handler: async (response) => {
            try {
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id,
              });
              if (verifyRes.data.success) {
                setBookingSuccess(verifyRes.data.data);
                setSelectedSlot(null);
                setPendingBooking(null);
                fetchData();
              }
            } catch (vErr) {
              setErrorMsg('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: '#3FA66A' },
          modal: { ondismiss: () => setBookingInProgress(false) },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Sandbox fallback — auto-verify with test IDs
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'sandbox_test_signature',
          bookingId: booking._id,
        });
        setShowPaymentModal(false);
        if (verifyRes.data.success) {
          setBookingSuccess(verifyRes.data.data);
          setSelectedSlot(null);
          setPendingBooking(null);
          fetchData();
        }
      }
    } catch (err) {
      setShowPaymentModal(false);
      setErrorMsg(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };


  const handleJoinWaitlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/bookings/waitlist', {
        stationId: station._id,
        requestedDate: new Date(),
      });
      setWaitlistSuccess(true);
      setTimeout(() => setWaitlistSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-[#8C96A2] font-mono">
        <span className="inline-block w-6 h-6 border-2 border-[#3FA66A] border-r-transparent rounded-full animate-spin mr-3"></span>
        INITIALIZING STATION HARDWARE TELEMETRY...
      </div>
    );
  }

  if (!station) {
    return (
      <div className="p-8 text-center text-red-400">
        Station hardware not located.
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Station Header */}
      <div className="hardware-panel p-6 rounded-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#3FA66A] mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3FA66A] animate-pulse"></span>
              <span>GRID STATION CODE: {station._id.slice(-6).toUpperCase()}</span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-[#F2F3F5] uppercase">
              {station.name}
            </h1>
            <p className="text-xs text-[#8C96A2] flex items-center space-x-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6B7A]" />
              <span>
                {station.address.street}, {station.address.city}, {station.address.state}
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="bg-[#14161A] p-3 border border-[#2E333D] rounded-sm text-center min-w-[90px]">
              <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                RATING
              </span>
              <div className="flex items-center justify-center space-x-1 text-[#E8A33D] font-mono font-bold text-base mt-0.5">
                <Star className="w-4 h-4 fill-current" />
                <span>{station.averageRating ? station.averageRating.toFixed(1) : '4.8'}</span>
              </div>
            </div>

            <div className="bg-[#14161A] p-3 border border-[#2E333D] rounded-sm text-center min-w-[90px]">
              <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                MAX OUTPUT
              </span>
              <span className="block font-mono font-bold text-[#3FA66A] text-base mt-0.5">
                {station.powerOutputKw} kW
              </span>
            </div>

            <div className="bg-[#14161A] p-3 border border-[#2E333D] rounded-sm text-center min-w-[90px]">
              <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                HOURLY RATE
              </span>
              <span className="block font-mono font-bold text-[#F2F3F5] text-base mt-0.5">
                ₹{station.pricePerHour}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo, Specs, Amenities */}
        <div className="lg:col-span-1 space-y-6">
          <div className="hardware-panel rounded-sm overflow-hidden">
            <img
              src={
                station.photos[0] ||
                'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
              }
              alt={station.name}
              className="w-full h-48 object-cover filter brightness-90"
            />
            <div className="p-4 space-y-3">
              <h3 className="text-xs font-mono uppercase text-[#C6CBD1] font-bold">
                Supported Connectors
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.connectorTypes.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 text-xs font-mono bg-[#14161A] border border-[#404754] text-[#F2F3F5] rounded-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <h3 className="text-xs font-mono uppercase text-[#C6CBD1] font-bold pt-2">
                Station Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((a) => (
                  <span
                    key={a}
                    className="px-2 py-0.5 text-[11px] bg-[#14161A] border border-[#2E333D] text-[#8C96A2] rounded-sm"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Waitlist Banner */}
          <div className="p-4 bg-[#1B1D22] border border-[#404754] rounded-sm">
            <h4 className="text-xs font-mono uppercase text-[#E8A33D] font-bold mb-1">
              Station Congestion?
            </h4>
            <p className="text-xs text-[#8C96A2] mb-3">
              If all slots are taken at your desired hour, enroll in the automated queue to be notified immediately when a slot frees up.
            </p>
            {waitlistSuccess ? (
              <span className="text-xs font-mono text-[#3FA66A]">
                ✓ ENROLLED IN NOTIFICATION QUEUE
              </span>
            ) : (
              <button
                onClick={handleJoinWaitlist}
                className="w-full py-1.5 px-3 bg-[#14161A] hover:bg-[#242830] border border-[#E8A33D] text-[#E8A33D] text-xs font-mono rounded-sm transition-colors"
              >
                Join Waitlist Queue
              </button>
            )}
          </div>
        </div>

        {/* Right Column (2 cols): Slot Reservation Matrix & Real-time Booking Flow */}
        <div className="lg:col-span-2 space-y-6">
          <div className="hardware-panel p-6 rounded-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2E333D]">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#3FA66A]" />
                <h2 className="text-sm font-mono uppercase text-[#F2F3F5] font-bold">
                  Real-Time Bay Availability
                </h2>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono">
                <span className="flex items-center space-x-1 text-[#3FA66A]">
                  <span className="w-2 h-2 rounded-full bg-[#3FA66A]"></span>
                  <span>AVAILABLE</span>
                </span>
                <span className="flex items-center space-x-1 text-[#8C96A2]">
                  <span className="w-2 h-2 rounded-full bg-[#5B6B7A]"></span>
                  <span>BOOKED</span>
                </span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 rounded-sm text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            {bookingSuccess && (
              <div className="mb-6 p-4 bg-[#3FA66A]/10 border border-[#3FA66A] rounded-sm">
                <div className="flex items-center space-x-2 text-[#3FA66A] font-heading font-bold text-sm uppercase">
                  <CheckCircle className="w-4 h-4" />
                  <span>Charging Slot Confirmed (Razorpay Sandbox Verified)</span>
                </div>
                <p className="text-xs text-[#8C96A2] mt-1">
                  Confirmation dispatched to {user?.email}. Booking Ref: {bookingSuccess._id}
                </p>
              </div>
            )}

            {/* Slots Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?._id === slot._id;
                const isAvailable = slot.status === 'available';

                return (
                  <button
                    key={slot._id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 border text-left rounded-sm transition-all relative ${
                      isSelected
                        ? 'border-[#3FA66A] bg-[#3FA66A]/10 animate-charging-pulse'
                        : isAvailable
                        ? 'border-[#2E333D] bg-[#14161A] hover:border-[#8C96A2]'
                        : 'border-[#242830] bg-[#14161A]/40 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-[#F2F3F5]">
                        {slot.slotNumber}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-1 py-0.5 rounded-xs ${
                          isAvailable
                            ? 'bg-[#3FA66A]/20 text-[#3FA66A]'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {slot.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-[#8C96A2]">
                      {new Date(slot.startTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(slot.endTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="mt-2 text-xs font-mono text-[#3FA66A] font-semibold">
                      ₹{slot.price || station.pricePerHour * 2}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Booking action bar */}
            {selectedSlot && (
              <div className="mt-6 p-4 bg-[#14161A] border border-[#3FA66A] rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono text-[#8C96A2]">RESERVING:</span>
                  <div className="font-heading font-bold text-[#F2F3F5]">
                    {selectedSlot.slotNumber} •{' '}
                    {new Date(selectedSlot.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <span className="text-xs font-mono text-[#3FA66A]">
                    Total Test Amount: ₹{selectedSlot.price || station.pricePerHour * 2}
                  </span>
                </div>

                <button
                  onClick={handleBookingConfirm}
                  disabled={bookingInProgress}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] font-heading font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {bookingInProgress ? 'Processing Sandbox...' : 'Confirm with Razorpay Test'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Reviews & Ratings Section */}
          <div className="hardware-panel p-6 rounded-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2E333D]">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-[#3FA66A]" />
                <h2 className="text-sm font-mono uppercase text-[#F2F3F5] font-bold">
                  Driver Reviews & Verification
                </h2>
              </div>
              <span className="text-xs font-mono text-[#8C96A2]">
                {reviews.length} VERIFIED VISITS
              </span>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-[#8C96A2]">No reviews submitted yet.</p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3 bg-[#14161A] border border-[#2E333D] rounded-sm"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-[#F2F3F5] font-bold">
                        {rev.userId?.name || 'Verified EV Driver'}
                      </span>
                      <div className="flex items-center text-[#E8A33D] text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#C6CBD1] mt-1">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Payment Method Modal */}
    {showPaymentModal && selectedSlot && (
      <PaymentModal
        booking={{ totalAmount: selectedSlot.price || station?.pricePerHour * 2 }}
        station={station}
        slot={selectedSlot}
        onProceed={handlePaymentProceed}
        onClose={() => setShowPaymentModal(false)}
        loading={bookingInProgress}
      />
    )}
    </>
  );
}
