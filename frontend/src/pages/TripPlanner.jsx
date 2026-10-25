import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Navigation,
  Battery,
  MapPin,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const startIcon = new L.DivIcon({
  className: 'custom-start-pin',
  html: `<div style="background-color: #3FA66A; border: 2px solid #FFFFFF; border-radius: 50%; width: 18px; height: 18px; box-shadow: 0 0 10px #3FA66A;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const endIcon = new L.DivIcon({
  className: 'custom-end-pin',
  html: `<div style="background-color: #E8A33D; border: 2px solid #FFFFFF; border-radius: 50%; width: 18px; height: 18px; box-shadow: 0 0 10px #E8A33D;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const stopIcon = new L.DivIcon({
  className: 'custom-stop-pin',
  html: `<div style="background-color: #14161A; border: 2px solid #3FA66A; border-radius: 4px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(63, 166, 106, 0.8);">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3FA66A" stroke="#3FA66A"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

export default function TripPlanner() {
  const { user } = useAuth();

  const [origin, setOrigin] = useState('San Francisco, CA');
  const [destination, setDestination] = useState('San Jose, CA');
  const [rangeKm, setRangeKm] = useState(user?.vehicleDetails?.vehicleRange || 300);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Predefined route coordinate pairs for Indian EV highways & corridors
  const routePresets = {
    'Mumbai to Pune Expressway (150 km)': {
      originCoords: [19.0760, 72.8777],
      destCoords: [18.5204, 73.8567],
      originName: 'Mumbai BKC Terminal',
      destName: 'Pune Hinjewadi Tech Park',
    },
    'Delhi to Jaipur National Highway (280 km)': {
      originCoords: [28.6139, 77.2090],
      destCoords: [26.9124, 75.7873],
      originName: 'Delhi Connaught Place Hub',
      destName: 'Jaipur Pink City Depot',
    },
    'Bengaluru to Chennai Expressway (345 km)': {
      originCoords: [12.9716, 77.5946],
      destCoords: [13.0827, 80.2707],
      originName: 'Bengaluru Indiranagar Hub',
      destName: 'Chennai OMR Tech Corridor',
    },
    'Delhi to Chandigarh Grand Trunk Highway (245 km)': {
      originCoords: [28.6139, 77.2090],
      destCoords: [30.7333, 76.7794],
      originName: 'Delhi Connaught Place Hub',
      destName: 'Chandigarh Sector 26 FastStation',
    },
  };

  const [selectedPreset, setSelectedPreset] = useState('Mumbai to Pune Expressway (150 km)');


  const handleCalculateRoute = async () => {
    setLoading(true);
    const preset = routePresets[selectedPreset];

    try {
      const res = await api.post('/trip-planner/calculate', {
        originCoords: preset.originCoords,
        destCoords: preset.destCoords,
        vehicleRange: Number(rangeKm),
        originName: preset.originName,
        destName: preset.destName,
      });

      if (res.data?.success) {
        setTripData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-[#14161A] overflow-hidden">
      {/* Sidebar Trip Parameters */}
      <div className="w-full lg:w-[460px] flex flex-col border-r border-[#2E333D] bg-[#14161A] z-10 shrink-0 h-full">
        <div className="p-4 border-b border-[#2E333D] bg-[#1B1D22]">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#3FA66A] uppercase mb-1">
            <Navigation className="w-4 h-4" />
            <span>ENERGY ROUTE COMPUTATION</span>
          </div>
          <h1 className="text-xl font-heading font-bold text-[#F2F3F5] uppercase">
            EV Trip Planner
          </h1>
          <p className="text-xs text-[#8C96A2] mt-0.5">
            Automatic range-depletion stop recommendations with an 80% safety buffer.
          </p>
        </div>

        <div className="p-4 space-y-4 border-b border-[#2E333D]">
          <div>
            <label className="block text-xs font-mono text-[#8C96A2] uppercase mb-1">
              Select Waypoint Route
            </label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full px-3 py-2 bg-[#1B1D22] border border-[#2E333D] text-xs text-[#F2F3F5] rounded-sm"
            >
              {Object.keys(routePresets).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono text-[#8C96A2] uppercase">
                Vehicle Battery Range Buffer: {rangeKm} km
              </label>
              <span className="text-[11px] font-mono text-[#3FA66A]">
                {Math.round(rangeKm * 0.75)} km threshold
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="600"
              step="20"
              value={rangeKm}
              onChange={(e) => setRangeKm(e.target.value)}
              className="w-full accent-[#3FA66A] bg-[#2E333D] h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleCalculateRoute}
            disabled={loading}
            className="w-full py-2.5 bg-[#3FA66A] hover:bg-[#4ECB82] text-[#14161A] font-heading font-bold text-xs uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                <span>Calculate Charging Stops</span>
              </>
            )}
          </button>
        </div>

        {/* Route Calculation Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tripData ? (
            <div className="space-y-4">
              {/* Trip stats banner */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#1B1D22] border border-[#2E333D] rounded-sm text-center">
                <div>
                  <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                    DISTANCE
                  </span>
                  <span className="text-sm font-mono font-bold text-[#F2F3F5]">
                    {tripData.totalDistanceKm} km
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                    DRIVE TIME
                  </span>
                  <span className="text-sm font-mono font-bold text-[#F2F3F5]">
                    {tripData.estimatedDriveTimeHours} hrs
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-mono text-[#8C96A2] uppercase">
                    CHARGING STOPS
                  </span>
                  <span className="text-sm font-mono font-bold text-[#3FA66A]">
                    {tripData.suggestedStops.length} STOPS
                  </span>
                </div>
              </div>

              {/* Waypoint steps */}
              <div className="space-y-3">
                <div className="p-3 bg-[#14161A] border border-[#2E333D] rounded-sm flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#3FA66A] shrink-0"></div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8C96A2] uppercase">
                      ORIGIN POINT
                    </span>
                    <div className="text-xs font-bold text-[#F2F3F5]">
                      {tripData.origin.name}
                    </div>
                  </div>
                </div>

                {tripData.suggestedStops.map((stop, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 hardware-panel border-l-4 border-l-[#3FA66A] rounded-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#3FA66A] uppercase">
                        CHARGING STOP #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#14161A] border border-[#404754] text-[#C6CBD1]">
                        +35 MIN CHARGE
                      </span>
                    </div>

                    <div className="text-sm font-heading font-bold text-[#F2F3F5]">
                      {stop.station.name}
                    </div>

                    <p className="text-xs text-[#8C96A2]">
                      {stop.station.address.street}, {stop.station.address.city}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#2E333D]">
                      <span className="text-xs font-mono text-[#E8A33D]">
                        {stop.station.powerOutputKw} kW High Speed
                      </span>
                      <Link
                        to={`/stations/${stop.station._id}`}
                        className="text-xs font-mono text-[#3FA66A] hover:underline"
                      >
                        Book Bay Now →
                      </Link>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-[#14161A] border border-[#2E333D] rounded-sm flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-[#E8A33D] shrink-0"></div>
                  <div>
                    <span className="text-[10px] font-mono text-[#8C96A2] uppercase">
                      DESTINATION
                    </span>
                    <div className="text-xs font-bold text-[#F2F3F5]">
                      {tripData.destination.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[#2E333D] rounded-sm">
              <Zap className="w-8 h-8 text-[#5B6B7A] mx-auto mb-2" />
              <p className="text-xs text-[#8C96A2]">
                Select a route preset and click Calculate to simulate live route telemetry and stop recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map route viewer */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer
          center={[19.0760, 72.8777]}
          zoom={7}
          scrollWheelZoom={true}
          className="h-full w-full custom-ev-map"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {tripData && (
            <>
              {/* Animated/Glowing Route Polyline */}
              <Polyline
                positions={tripData.routePath}
                color="#3FA66A"
                weight={4}
                opacity={0.85}
                dashArray="8, 6"
              />

              {/* Origin Marker */}
              <Marker position={tripData.origin.coords} icon={startIcon}>
                <Popup>
                  <div className="p-1 text-xs">Origin: {tripData.origin.name}</div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker position={tripData.destination.coords} icon={endIcon}>
                <Popup>
                  <div className="p-1 text-xs">Destination: {tripData.destination.name}</div>
                </Popup>
              </Marker>

              {/* Suggested Stops along route */}
              {tripData.suggestedStops.map((stop, i) => {
                const [lng, lat] = stop.station.location.coordinates;
                return (
                  <Marker key={i} position={[lat, lng]} icon={stopIcon}>
                    <Popup>
                      <div className="p-1 text-xs">
                        <strong>Suggested Stop #{i + 1}</strong>
                        <br />
                        {stop.station.name}
                        <br />
                        {stop.station.powerOutputKw} kW High Speed
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
