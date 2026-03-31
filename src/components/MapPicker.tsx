import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, MapPin, Loader2, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Fix for default marker icon
const icon = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconShadow = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: { state: string; district: string; village: string }) => void;
}

function LocationMarker({ setPosition, position }: { setPosition: (pos: L.LatLng) => void, position: L.LatLng | null }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function ChangeView({ center }: { center: L.LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function MapPicker({ isOpen, onClose, onSelect }: MapPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
          setPosition(latlng);
        },
        () => {
          console.log("Geolocation denied or failed");
        }
      );
    }
  }, [isOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      if (data.length === 0) {
        setError("No locations found. Try a different search.");
      }
    } catch (err) {
      console.error(err);
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    const newPos = new L.LatLng(lat, lon);
    setCurrentLocation([lat, lon]);
    setPosition(newPos);
    setSearchResults([]);
    setSearchQuery(result.display_name);
  };

  const handleConfirm = async () => {
    if (!position) return;
    setLoading(true);
    setError(null);
    try {
      // Use Nominatim for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        const address = data.address;
        const state = address.state || address.region || "";
        const district = address.district || address.county || address.city_district || "";
        const village = address.village || address.suburb || address.town || address.city || "";
        
        onSelect({ state, district, village });
        onClose();
      } else {
        setError("Could not find address for this location. Please try another spot.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch location details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[80vh]"
      >
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="text-emerald-600" />
              Select Your Farm Location
            </h3>
            <p className="text-stone-500 text-sm">Search or click on the map to mark your land</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative flex flex-col">
          {/* Search Bar */}
          <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a village, district or state..."
                className="w-full p-4 pl-12 rounded-2xl shadow-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white/95 backdrop-blur-sm"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
              <button
                type="submit"
                disabled={searching}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {searching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              </button>
            </form>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden max-h-60 overflow-y-auto"
                >
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSearchResult(result)}
                      className="w-full p-4 text-left hover:bg-stone-50 border-b border-stone-50 last:border-0 transition-colors flex items-start gap-3"
                    >
                      <MapPin size={18} className="text-stone-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-stone-700 leading-tight">{result.display_name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <MapContainer
            center={currentLocation}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setPosition={setPosition} position={position} />
            <ChangeView center={currentLocation} />
          </MapContainer>
          
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-[1000] flex items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <p className="font-bold text-stone-900">Identifying location...</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="flex-1 mr-4">
            {error ? (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            ) : position ? (
              <p className="text-stone-600 text-sm">
                Coordinates: <span className="font-mono">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
              </p>
            ) : (
              <p className="text-stone-400 text-sm italic">No location selected yet</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position || loading}
              className="px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              Confirm Location
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
