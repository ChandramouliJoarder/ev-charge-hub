import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Car, Battery, Zap, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    make: user?.vehicleDetails?.make || 'Tesla',
    model: user?.vehicleDetails?.model || 'Model 3',
    vehicleRange: user?.vehicleDetails?.vehicleRange || 350,
    batteryCapacityKwh: user?.vehicleDetails?.batteryCapacityKwh || 75,
    connectorType: user?.vehicleDetails?.connectorType || 'CCS',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        vehicleDetails: {
          make: formData.make,
          model: formData.model,
          vehicleRange: Number(formData.vehicleRange),
          batteryCapacityKwh: Number(formData.batteryCapacityKwh),
          connectorType: formData.connectorType,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#2E333D] mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#F2F3F5] uppercase tracking-wider">
            Vehicle & Operator Telemetry
          </h1>
          <p className="text-xs text-[#8C96A2] font-mono mt-1">
            ACCOUNT ID: {user?.id || user?._id} | ROLE: {user?.role?.toUpperCase()}
          </p>
        </div>
        {saved && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#3FA66A] bg-[#3FA66A]/10 border border-[#3FA66A] px-3 py-1.5 rounded-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIG SAVED</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Driver identity */}
        <div className="hardware-panel p-6 rounded-sm">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#2E333D]">
            <User className="w-4 h-4 text-[#3FA66A]" />
            <h2 className="text-sm font-mono uppercase text-[#F2F3F5] font-semibold">
              Driver Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Registered Email
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-[#14161A]/50 border border-[#2E333D] text-[#5B6B7A] text-sm rounded-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>
          </div>
        </div>

        {/* Vehicle Telemetry & Battery Specs */}
        <div className="hardware-panel p-6 rounded-sm">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-[#2E333D]">
            <Car className="w-4 h-4 text-[#3FA66A]" />
            <h2 className="text-sm font-mono uppercase text-[#F2F3F5] font-semibold">
              Electric Vehicle Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Vehicle Make
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Default Connector Port
              </label>
              <select
                value={formData.connectorType}
                onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              >
                <option value="CCS">CCS (Combined Charging System)</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Type 2">Type 2 (Mennekes)</option>
                <option value="Tesla Supercharger">Tesla Supercharger / NACS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Full Charge Range (km)
              </label>
              <input
                type="number"
                value={formData.vehicleRange}
                onChange={(e) => setFormData({ ...formData, vehicleRange: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
                Pack Capacity (kWh)
              </label>
              <input
                type="number"
                value={formData.batteryCapacityKwh}
                onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: e.target.value })}
                className="w-full px-3 py-2 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-sm rounded-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] font-heading font-bold text-sm tracking-wider uppercase rounded-sm transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : 'Update Telemetry'}</span>
        </button>
      </form>
    </div>
  );
}
