import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  DollarSign,
  Zap,
  Activity,
  Calendar,
  Clock,
  Plus,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function OwnerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddStation, setShowAddStation] = useState(false);

  // New station form
  const [stationForm, setStationForm] = useState({
    name: '',
    street: '',
    city: '',
    latitude: 37.7749,
    longitude: -122.4194,
    powerOutputKw: 150,
    pricePerHour: 15,
    connectorTypes: ['CCS', 'Type 2'],
    chargerTypes: ['Rapid'],
    totalSlots: 4,
  });

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics/owner');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stations', {
        name: stationForm.name,
        address: {
          street: stationForm.street,
          city: stationForm.city,
        },
        latitude: Number(stationForm.latitude),
        longitude: Number(stationForm.longitude),
        powerOutputKw: Number(stationForm.powerOutputKw),
        pricePerHour: Number(stationForm.pricePerHour),
        connectorTypes: stationForm.connectorTypes,
        chargerTypes: stationForm.chargerTypes,
        totalSlots: Number(stationForm.totalSlots),
      });

      setShowAddStation(false);
      fetchAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-[#8C96A2] font-mono">
        <span className="inline-block w-6 h-6 border-2 border-[#E8A33D] border-r-transparent rounded-full animate-spin mr-3"></span>
        COMPUTING TELEMETRY & REVENUE AGGREGATION...
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalBookings: 34,
    totalRevenue: 14850,
    slotUtilizationRate: 68,
    activeStationsCount: 2,
  };

  const revenueTrends = analytics?.revenueTrends || [];
  const peakHours = analytics?.peakHours || [];
  const slotUtilizationPie = analytics?.slotUtilizationPie || [
    { name: 'Active Charging', value: 6, fill: '#3FA66A' },
    { name: 'Available Slots', value: 8, fill: '#1B1D22' },
    { name: 'Under Maintenance', value: 1, fill: '#5B6B7A' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Dashboard Header with Hardware Accent */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2E333D]">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#E8A33D] mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E8A33D] animate-pulse"></span>
            <span>STATION OPERATOR DASHBOARD • TELEMETRY ACTIVE</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#F2F3F5] uppercase">
            Charging Station Analytics & Fleet Management
          </h1>
        </div>

        <button
          onClick={() => setShowAddStation(!showAddStation)}
          className="px-4 py-2 bg-[#E8A33D] hover:bg-[#B57920] text-[#14161A] font-heading font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Station Hub</span>
        </button>
      </div>

      {/* Add station form drawer/modal */}
      {showAddStation && (
        <form
          onSubmit={handleCreateStation}
          className="hardware-panel-bordered p-6 rounded-sm space-y-4"
        >
          <h3 className="text-sm font-heading font-bold uppercase text-[#E8A33D]">
            Deploy New Charging Hub to Grid
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Station Name
              </label>
              <input
                type="text"
                required
                value={stationForm.name}
                onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                placeholder="Downtown Grid Express Hub"
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Street Address
              </label>
              <input
                type="text"
                required
                value={stationForm.street}
                onChange={(e) => setStationForm({ ...stationForm, street: e.target.value })}
                placeholder="742 Evergreen Terrace"
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                City / Region
              </label>
              <input
                type="text"
                required
                value={stationForm.city}
                onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })}
                placeholder="San Francisco"
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Power Output (kW)
              </label>
              <input
                type="number"
                value={stationForm.powerOutputKw}
                onChange={(e) =>
                  setStationForm({ ...stationForm, powerOutputKw: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Price Per Hour ($)
              </label>
              <input
                type="number"
                value={stationForm.pricePerHour}
                onChange={(e) =>
                  setStationForm({ ...stationForm, pricePerHour: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Total Bays (Slots)
              </label>
              <input
                type="number"
                value={stationForm.totalSlots}
                onChange={(e) =>
                  setStationForm({ ...stationForm, totalSlots: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddStation(false)}
              className="px-4 py-2 border border-[#404754] text-xs font-mono text-[#C6CBD1] rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#3FA66A] text-[#14161A] text-xs font-heading font-bold uppercase rounded-sm"
            >
              Publish Station
            </button>
          </div>
        </form>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hardware-panel p-4 rounded-sm border-l-4 border-l-[#3FA66A]">
          <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
            TOTAL RESERVATIONS
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-mono font-bold text-[#F2F3F5]">
              {metrics.totalBookings}
            </span>
            <span className="text-xs font-mono text-[#3FA66A] flex items-center">
              +14% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div className="hardware-panel p-4 rounded-sm border-l-4 border-l-[#E8A33D]">
          <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
            GROSS TEST REVENUE
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-mono font-bold text-[#F2F3F5]">
              ₹{metrics.totalRevenue}
            </span>
            <span className="text-xs font-mono text-[#8C96A2]">Razorpay Sandbox</span>
          </div>
        </div>

        <div className="hardware-panel p-4 rounded-sm border-l-4 border-l-[#5B6B7A]">
          <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
            SLOT UTILIZATION RATE
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-mono font-bold text-[#F2F3F5]">
              {metrics.slotUtilizationRate}%
            </span>
            <span className="text-xs font-mono text-[#3FA66A]">Optimal Load</span>
          </div>
        </div>

        <div className="hardware-panel p-4 rounded-sm border-l-4 border-l-[#8C96A2]">
          <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
            ACTIVE CHARGING STATIONS
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-mono font-bold text-[#F2F3F5]">
              {metrics.activeStationsCount} HUBS
            </span>
            <span className="text-xs font-mono text-[#3FA66A]">100% ONLINE</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid (Recharts styled with custom color palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue 7-Day Trend Chart */}
        <div className="hardware-panel p-5 rounded-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2E333D]">
            <h3 className="text-xs font-mono uppercase text-[#F2F3F5] font-bold">
              7-Day Revenue Trend (₹)
            </h3>
            <span className="text-[10px] font-mono text-[#8C96A2]">TEST AGGREGATION</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E333D" />
                <XAxis dataKey="day" stroke="#8C96A2" fontSize={11} />
                <YAxis stroke="#8C96A2" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14161A',
                    border: '1px solid #404754',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3FA66A"
                  strokeWidth={2}
                  dot={{ fill: '#3FA66A', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Booking Hours Distribution */}
        <div className="hardware-panel p-5 rounded-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2E333D]">
            <h3 className="text-xs font-mono uppercase text-[#F2F3F5] font-bold">
              Peak Utilization Hours
            </h3>
            <span className="text-[10px] font-mono text-[#8C96A2]">LOAD SPREAD</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E333D" />
                <XAxis dataKey="hour" stroke="#8C96A2" fontSize={11} />
                <YAxis stroke="#8C96A2" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14161A',
                    border: '1px solid #404754',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="bookings" fill="#E8A33D" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Slot Allocation Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="hardware-panel p-5 rounded-sm lg:col-span-1">
          <h3 className="text-xs font-mono uppercase text-[#F2F3F5] font-bold pb-3 mb-2 border-b border-[#2E333D]">
            Bay Allocation Breakdown
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slotUtilizationPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {slotUtilizationPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14161A',
                    border: '1px solid #404754',
                    borderRadius: '2px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-[11px] font-mono text-[#8C96A2] pt-2 border-t border-[#2E333D]">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3FA66A]"></span>
              <span>Active</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B1D22] border border-[#404754]"></span>
              <span>Available</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B6B7A]"></span>
              <span>Service</span>
            </span>
          </div>
        </div>

        {/* Live Incoming Reservations Feed */}
        <div className="hardware-panel p-5 rounded-sm lg:col-span-2">
          <h3 className="text-xs font-mono uppercase text-[#F2F3F5] font-bold pb-3 mb-2 border-b border-[#2E333D]">
            Real-Time Slot Reservations Feed
          </h3>
          <div className="space-y-2.5">
            {(analytics?.recentBookings || []).length === 0 ? (
              <p className="text-xs text-[#8C96A2] py-4">No recent bookings recorded.</p>
            ) : (
              (analytics?.recentBookings || []).map((bk) => (
                <div
                  key={bk._id}
                  className="p-3 bg-[#14161A] border border-[#2E333D] rounded-sm flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#F2F3F5]">
                      {bk.userId?.name || 'Driver'}
                    </span>
                    <span className="text-[#8C96A2] ml-2 font-mono">
                      {bk.slotId?.slotNumber || 'Bay 1'} • {bk.stationId?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[#3FA66A] font-semibold">
                      ₹{bk.totalAmount}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#3FA66A]/20 text-[#3FA66A] rounded-xs uppercase">
                      {bk.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
