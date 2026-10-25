import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Lock, Mail, User as UserIcon, Car, Shield, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    vehicleMake: 'Tesla',
    vehicleModel: 'Model 3',
    vehicleRange: 380,
    batteryCapacityKwh: 75,
    connectorType: 'CCS',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        vehicleDetails: {
          make: formData.vehicleMake,
          model: formData.vehicleModel,
          vehicleRange: Number(formData.vehicleRange),
          batteryCapacityKwh: Number(formData.batteryCapacityKwh),
          connectorType: formData.connectorType,
        },
      };

      const data = await register(payload);
      if (data?.user?.role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#14161A]">
      <div className="w-full max-w-xl hardware-panel-bordered p-8 rounded-sm">
        <div className="flex items-center justify-between pb-5 border-b border-[#2E333D] mb-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-[#3FA66A]" />
            <h2 className="text-xl font-heading font-bold uppercase tracking-wider text-[#F2F3F5]">
              Network Registration
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 bg-[#1B1D22] border border-[#404754] text-[#C6CBD1]">
            ROLE CONFIG
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-950/40 border border-red-500/50 rounded-sm flex items-start space-x-2.5 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'user' })}
              className={`p-3 border text-left transition-all ${
                formData.role === 'user'
                  ? 'border-[#3FA66A] bg-[#3FA66A]/10 text-[#F2F3F5]'
                  : 'border-[#2E333D] bg-[#1B1D22] text-[#8C96A2] hover:border-[#404754]'
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase text-[#3FA66A]">Driver Account</div>
              <div className="text-xs text-[#8C96A2] mt-0.5">Locate stations, book slots, navigate routes</div>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'owner' })}
              className={`p-3 border text-left transition-all ${
                formData.role === 'owner'
                  ? 'border-[#E8A33D] bg-[#E8A33D]/10 text-[#F2F3F5]'
                  : 'border-[#2E333D] bg-[#1B1D22] text-[#8C96A2] hover:border-[#404754]'
              }`}
            >
              <div className="text-xs font-mono font-bold uppercase text-[#E8A33D]">Station Owner</div>
              <div className="text-xs text-[#8C96A2] mt-0.5">Publish stations, manage slots, view analytics</div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                className="w-full px-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8C96A2] mb-1">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0123"
                className="w-full px-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-[#F2F3F5] text-sm focus:outline-none focus:border-[#3FA66A] rounded-sm"
              />
            </div>
          </div>

          {/* Vehicle specs section */}
          <div className="pt-3 border-t border-[#2E333D]">
            <span className="block text-xs font-mono text-[#3FA66A] uppercase mb-2">
              Vehicle Telemetry Specs (for Route & Range calculation)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#8C96A2] mb-1">Make / Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Model 3"
                  className="w-full px-2.5 py-1.5 bg-[#1B1D22] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8C96A2] mb-1">Range (km)</label>
                <input
                  type="number"
                  name="vehicleRange"
                  value={formData.vehicleRange}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 bg-[#1B1D22] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8C96A2] mb-1">Port Type</label>
                <select
                  name="connectorType"
                  value={formData.connectorType}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-[#1B1D22] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
                >
                  <option value="CCS">CCS</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="Type 2">Type 2</option>
                  <option value="Tesla Supercharger">Tesla Supercharger</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-2.5 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] font-heading font-bold text-sm tracking-wider uppercase rounded-sm transition-colors flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[#8C96A2]">
          Already registered?{' '}
          <Link to="/login" className="text-[#3FA66A] hover:underline font-medium">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
