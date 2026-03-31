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
  onSelect: (location: { state: string; district: string; village: string; lat: number; lng: number }) => void;
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
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<[number, number]>([20.5937, 78.9629]); // Default to India center
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
          setPosition(latlng);
          setLocating(false);
        },
        () => {
          console.log("Geolocation denied or failed");
          setLocating(false);
        },
        { timeout: 5000 }
      );
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (searching) return;
    setSearching(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setSearching(false);
    }, 8000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
        { 
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal
        }
      );
      const data = await response.json();
      clearTimeout(timeoutId);
      setSearchResults(data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
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
    
    // Automatically identify and confirm if enough address info is present
    if (result.address) {
      const address = result.address;
      const state = address.state || address.region || address.state_district || "Unknown State";
      const district = address.district || address.county || address.city_district || address.city || address.town || "Unknown District";
      const village = address.village || address.suburb || address.neighbourhood || address.hamlet || address.croft || "";
      
      onSelect({ 
        state, 
        district, 
        village, 
        lat, 
        lng: lon 
      });
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!position) return;
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setLoading(false);
      setError("Location identification timed out. Please try again or select a nearby spot.");
    }, 10000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1`,
        { 
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal
        }
      );
      
      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      clearTimeout(timeoutId);
      
      if (data.address) {
        const address = data.address;
        const state = address.state || address.region || address.state_district || "Unknown State";
        const district = address.district || address.county || address.city_district || address.city || address.town || "Unknown District";
        const village = address.village || address.suburb || address.neighbourhood || address.hamlet || address.croft || "";
        
        onSelect({ 
          state, 
          district, 
          village, 
          lat: position.lat, 
          lng: position.lng 
        });
        onClose();
      } else {
        setError("Could not find address for this location. Please try another spot.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return; // Already handled by timeout
      console.error(err);
      setError("Failed to fetch location details. Please check your connection and try again.");
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh] md:h-[80vh]"
      >
        <div className="p-4 md:p-6 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="text-emerald-600" size={20} />
              Select Farm Location
            </h3>
            <p className="text-stone-500 text-xs md:text-sm">Search or click on the map</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 relative flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="absolute top-3 left-3 right-3 z-[1000] max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search location..."
                className="w-full p-3.5 md:p-4 pl-10 md:pl-12 pr-20 md:pr-24 rounded-2xl shadow-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white/95 backdrop-blur-sm text-sm md:text-base"
              />
              <Search className="absolute left-3.5 md:left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={searching}
                  className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {searching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
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

          {locating && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000]">
              <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-emerald-100 flex items-center gap-2">
                <Loader2 className="animate-spin text-emerald-600" size={14} />
                <span className="text-xs font-bold text-emerald-700">Locating you...</span>
              </div>
            </div>
          )}

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

          {/* Locate Me Button */}
          <button
            onClick={() => {
              if (navigator.geolocation) {
                setLocating(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                    setCurrentLocation([pos.coords.latitude, pos.coords.longitude]);
                    setPosition(latlng);
                    setLocating(false);
                  },
                  () => {
                    setError("Could not access your location. Please check permissions.");
                    setLocating(false);
                  }
                );
              }
            }}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-[1000] p-3 md:p-4 bg-white text-emerald-600 rounded-2xl shadow-2xl hover:bg-stone-50 transition-all border border-stone-100 flex items-center gap-2 font-bold text-xs md:text-sm"
          >
            <MapPin size={18} />
            Locate Me
          </button>
          
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-[1000] flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-xs text-center">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
                <div>
                  <p className="font-bold text-stone-900">Identifying location...</p>
                  <p className="text-xs text-stone-500 mt-1">Fetching your village and district details from the map</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 md:p-6 bg-stone-50 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="w-full sm:flex-1">
            {error ? (
              <p className="text-red-500 text-xs md:text-sm font-medium text-center sm:text-left">{error}</p>
            ) : position ? (
              <p className="text-stone-600 text-xs md:text-sm text-center sm:text-left">
                Coordinates: <span className="font-mono">{position.lat.toFixed(4)}, {position.lng.toFixed(4)}</span>
              </p>
            ) : (
              <p className="text-stone-400 text-xs md:text-sm italic text-center sm:text-left">No location selected yet</p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 md:px-6 py-3 rounded-xl font-bold text-stone-600 hover:bg-stone-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!position || loading}
              className="flex-1 sm:flex-none px-6 md:px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              Confirm
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
