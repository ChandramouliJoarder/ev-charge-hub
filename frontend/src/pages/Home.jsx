import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import {
  Zap,
  MapPin,
  Filter,
  Navigation,
  Star,
  ChevronRight,
  BatteryCharging,
  SlidersHorizontal,
  Compass,
  Globe,
  Info,
} from 'lucide-react';

// Custom SVG hardware map pin for charging station
const stationIcon = new L.DivIcon({
  className: 'custom-station-pin',
  html: `<div style="background-color: #14161A; border: 2px solid #3FA66A; border-radius: 4px; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(63, 166, 106, 0.6);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3FA66A" stroke="#3FA66A" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
  </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const userLocIcon = new L.DivIcon({
  className: 'custom-user-pin',
  html: `<div style="background-color: #E8A33D; border: 2px solid #FFFFFF; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 0 12px #E8A33D;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Helper component to center map on coordinates change with smooth flyTo animation
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

const CITY_PRESETS = [
  { id: 'all', label: 'All Hubs', coords: [20.5937, 78.9629], zoom: 5 },
  { id: 'bengaluru', label: 'Bengaluru', coords: [12.9716, 77.5946], zoom: 12, query: 'Bengaluru' },
  { id: 'mumbai', label: 'Mumbai / Pune', coords: [18.9200, 73.1200], zoom: 10, query: 'Mumbai' },
  { id: 'delhi', label: 'Delhi NCR', coords: [28.6139, 77.2090], zoom: 11, query: 'Delhi' },
  { id: 'kolkata', label: 'Kolkata', coords: [22.5726, 88.3639], zoom: 12, query: 'Kolkata' },
  { id: 'hyderabad', label: 'Hyderabad', coords: [17.4474, 78.3814], zoom: 12, query: 'Hyderabad' },
  { id: 'sf', label: 'San Francisco', coords: [37.7749, -122.4194], zoom: 11, query: 'San Francisco' },
];

export default function Home() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState([20.5937, 78.9629]); // Default India center
  const [hasLocation, setHasLocation] = useState(false);
  const [filterNearMe, setFilterNearMe] = useState(false);
  const [notice, setNotice] = useState('');

  // Map view controls
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [activeCity, setActiveCity] = useState('all');

  // Filters
  const [chargerType, setChargerType] = useState('all');
  const [connectorType, setConnectorType] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [searchQuery, setSearchQuery] = useState('');

  // Detect user geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserCoords(coords);
          setHasLocation(true);
        },
        (err) => {
          console.warn('Geolocation unavailable or denied:', err.message);
        }
      );
    }
  }, []);

  // Fetch stations with intelligent fallback
  const fetchStations = async () => {
    setLoading(true);
    try {
      const params = {
        chargerType,
        connectorType,
        sortBy,
      };
      if (maxPrice) params.maxPrice = maxPrice;

      // Only apply GPS radius if explicitly enabled by user
      if (filterNearMe && hasLocation) {
        params.lat = userCoords[0];
        params.lng = userCoords[1];
        params.distance = 100;
      }

      let res = await api.get('/stations', { params });
      let data = res.data?.data || [];

      // If Near Me returned 0 stations, automatically fallback to all stations
      if (data.length === 0 && params.lat) {
        delete params.lat;
        delete params.lng;
        delete params.distance;
        const fallbackRes = await api.get('/stations', { params });
        data = fallbackRes.data?.data || [];
        setNotice('No charging hubs within 100km of your GPS. Showing all network hubs.');
      } else {
        setNotice('');
      }

      setStations(data);

      // On initial load with stations, center nicely if not customized
      if (data.length > 0 && activeCity === 'all' && !filterNearMe) {
        // If user is in India, focus on India
        setMapCenter([20.5937, 78.9629]);
        setMapZoom(5);
      }
    } catch (err) {
      console.error('Failed to load stations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [chargerType, connectorType, maxPrice, sortBy, filterNearMe]);

  const handleCitySelect = (city) => {
    setActiveCity(city.id);
    setMapCenter(city.coords);
    setMapZoom(city.zoom);
    if (city.query) {
      setSearchQuery(city.query);
    } else {
      setSearchQuery('');
    }
  };

  const handleStationClick = (station) => {
    const [lng, lat] = station.location.coordinates;
    setMapCenter([lat, lng]);
    setMapZoom(14);
  };

  const filteredStations = stations.filter((st) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.address.city.toLowerCase().includes(q) ||
      st.address.state.toLowerCase().includes(q) ||
      st.connectorTypes.some((c) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-[#14161A]">
      {/* Left Sidebar: Filter Panel & Station Cards */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col border-r border-[#2E333D] bg-[#14161A] z-10 shrink-0 h-full">
        {/* Hardware Status Header */}
        <div className="p-4 border-b border-[#2E333D] bg-[#1B1D22]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-heading font-bold text-[#F2F3F5] uppercase tracking-wider flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#3FA66A]" />
                <span>Station Network</span>
              </h1>
              <p className="text-[11px] text-[#8C96A2] font-mono">
                {filteredStations.length} of {stations.length} CHARGING HUBS ACTIVE
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (filterNearMe) {
                    setFilterNearMe(false);
                    setMapCenter([20.5937, 78.9629]);
                    setMapZoom(5);
                  } else {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        const coords = [pos.coords.latitude, pos.coords.longitude];
                        setUserCoords(coords);
                        setHasLocation(true);
                        setFilterNearMe(true);
                        setMapCenter(coords);
                        setMapZoom(12);
                      });
                    }
                  }
                }}
                title={filterNearMe ? 'Showing hubs near GPS. Click to show all.' : 'Filter to stations near your GPS'}
                className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono border rounded-sm transition-colors ${
                  filterNearMe
                    ? 'bg-[#3FA66A] text-[#14161A] border-[#3FA66A] font-bold'
                    : 'bg-[#14161A] border-[#404754] text-[#C6CBD1] hover:border-[#3FA66A] hover:text-[#3FA66A]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{filterNearMe ? 'GPS NEAR ME ON' : 'NEAR ME'}</span>
              </button>
            </div>
          </div>

          {/* Quick City Selector Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2.5 mb-2.5 text-[11px] scrollbar-none">
            {CITY_PRESETS.map((city) => (
              <button
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={`px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap transition-colors border ${
                  activeCity === city.id
                    ? 'bg-[#3FA66A]/20 border-[#3FA66A] text-[#3FA66A] font-semibold'
                    : 'bg-[#14161A] border-[#2E333D] text-[#8C96A2] hover:text-[#F2F3F5] hover:border-[#404754]'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>

          {/* Fallback notification notice */}
          {notice && (
            <div className="mb-2.5 p-2 bg-[#E8A33D]/10 border border-[#E8A33D]/30 rounded-sm text-[11px] text-[#E8A33D] flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Search bar */}
          <input
            type="text"
            placeholder="Search city, station name, or connector..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 bg-[#14161A] border border-[#2E333D] text-[#F2F3F5] text-xs focus:outline-none focus:border-[#3FA66A] rounded-sm mb-3"
          />

          {/* Filtering hardware row */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-mono text-[#8C96A2] uppercase mb-0.5">
                Speed
              </label>
              <select
                value={chargerType}
                onChange={(e) => setChargerType(e.target.value)}
                className="w-full px-2 py-1 bg-[#14161A] border border-[#2E333D] text-[11px] text-[#F2F3F5] rounded-sm"
              >
                <option value="all">All Speeds</option>
                <option value="Fast">Fast</option>
                <option value="Rapid">Rapid</option>
                <option value="Ultra-Rapid">Ultra-Rapid (150kW+)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8C96A2] uppercase mb-0.5">
                Connector
              </label>
              <select
                value={connectorType}
                onChange={(e) => setConnectorType(e.target.value)}
                className="w-full px-2 py-1 bg-[#14161A] border border-[#2E333D] text-[11px] text-[#F2F3F5] rounded-sm"
              >
                <option value="all">All Ports</option>
                <option value="CCS">CCS</option>
                <option value="CHAdeMO">CHAdeMO</option>
                <option value="Type 2">Type 2</option>
                <option value="Tesla Supercharger">Tesla / NACS</option>
                <option value="GB/T">GB/T</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-[#8C96A2] uppercase mb-0.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-2 py-1 bg-[#14161A] border border-[#2E333D] text-[11px] text-[#F2F3F5] rounded-sm"
              >
                <option value="rating">Top Rated</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Speed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Station Cards Scrollable Feed */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-[#8C96A2]">
              <span className="inline-block w-6 h-6 border-2 border-[#3FA66A] border-r-transparent rounded-full animate-spin"></span>
              <span className="text-xs font-mono">SCANNING GRID HUBS...</span>
            </div>
          ) : filteredStations.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#2E333D] rounded-sm">
              <p className="text-sm text-[#8C96A2]">No charging hubs found with selected filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setChargerType('all');
                  setConnectorType('all');
                  setFilterNearMe(false);
                  setActiveCity('all');
                }}
                className="mt-3 px-3 py-1 text-xs bg-[#242830] text-[#3FA66A] border border-[#3FA66A]/40 rounded-sm hover:bg-[#3FA66A] hover:text-[#14161A] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredStations.map((station) => (
              <div
                key={station._id}
                onClick={() => handleStationClick(station)}
                className="hardware-panel hover:border-[#3FA66A]/80 cursor-pointer transition-colors rounded-sm overflow-hidden flex flex-col group"
              >
                <div className="p-3.5 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/stations/${station._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-heading font-bold text-sm text-[#F2F3F5] group-hover:text-[#3FA66A] transition-colors"
                      >
                        {station.name}
                      </Link>
                      <p className="text-xs text-[#8C96A2] mt-0.5">
                        {station.address.street}, {station.address.city}
                        {station.address.state ? `, ${station.address.state}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 bg-[#14161A] px-2 py-1 border border-[#2E333D] rounded-sm">
                      <Star className="w-3.5 h-3.5 text-[#E8A33D] fill-[#E8A33D]" />
                      <span className="text-xs font-mono font-bold text-[#F2F3F5]">
                        {station.averageRating ? station.averageRating.toFixed(1) : '4.8'}
                      </span>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap gap-1.5 my-2.5">
                    {station.connectorTypes.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#14161A] border border-[#404754] text-[#C6CBD1] rounded-sm"
                      >
                        {type}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-[#3FA66A]/15 border border-[#3FA66A]/40 text-[#3FA66A] rounded-sm">
                      {station.powerOutputKw} kW Output
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-[#2E333D] text-[#8C96A2] rounded-sm">
                      {station.totalSlots} Bays
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#2E333D] text-xs">
                    <div>
                      <span className="font-mono text-[#F2F3F5] font-semibold text-sm">
                        ₹{station.pricePerHour}
                      </span>
                      <span className="text-[11px] text-[#8C96A2]"> / hour</span>
                      <span className="text-[10px] text-[#8C96A2] ml-1.5 font-mono">
                        (₹{station.pricePerKwh}/kWh)
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStationClick(station);
                        }}
                        className="px-2.5 py-1 text-[11px] font-mono bg-[#14161A] text-[#8C96A2] hover:text-[#3FA66A] border border-[#2E333D] rounded-sm"
                      >
                        View on Map
                      </button>

                      <Link
                        to={`/stations/${station._id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1 bg-[#242830] hover:bg-[#3FA66A] hover:text-[#14161A] text-[#C6CBD1] text-xs font-medium border border-[#404754] hover:border-[#3FA66A] rounded-sm transition-colors flex items-center space-x-1"
                      >
                        <span>Reserve</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Map Canvas (Leaflet with industrial dark aesthetic) */}
      <div className="flex-1 h-full w-full relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full custom-ev-map"
        >
          <ChangeMapView center={mapCenter} zoom={mapZoom} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User GPS Pin */}
          {hasLocation && (
            <Marker position={userCoords} icon={userLocIcon}>
              <Popup>
                <div className="text-xs font-mono text-[#14161A]">
                  <strong>Current Location</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Charging Hub Pins */}
          {filteredStations.map((st) => {
            const [lng, lat] = st.location.coordinates;
            return (
              <Marker key={st._id} position={[lat, lng]} icon={stationIcon}>
                <Popup>
                  <div className="p-1 max-w-[220px] text-[#14161A]">
                    <h3 className="font-bold text-xs uppercase">{st.name}</h3>
                    <p className="text-[11px] text-gray-700">{st.address.street}, {st.address.city}</p>
                    <p className="text-[11px] font-bold text-emerald-700 mt-1">
                      {st.powerOutputKw} kW • ₹{st.pricePerHour}/hr (₹{st.pricePerKwh}/kWh)
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1 text-[9px] text-gray-600">
                      {st.connectorTypes.join(' • ')}
                    </div>
                    <Link
                      to={`/stations/${st._id}`}
                      className="mt-2 block text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                    >
                      Book Slot ({st.totalSlots} Bays)
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
