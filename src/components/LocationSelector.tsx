import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MapPicker from "./MapPicker";

interface LocationData {
  village: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
}

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (location: string, data?: LocationData) => void;
  required?: boolean;
  color?: string;
}

export default function LocationSelector({ 
  label, 
  value, 
  onChange, 
  required = false,
  color = "blue"
}: LocationSelectorProps) {
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handleLocationSelect = (data: LocationData) => {
    const locationString = `${data.village ? data.village + ", " : ""}${data.district}, ${data.state}`;
    onChange(locationString, data);
    setIsMapOpen(false);
  };

  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 hover:text-blue-700 focus:ring-blue-500",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:text-emerald-700 focus:ring-emerald-500",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100 hover:text-indigo-700 focus:ring-indigo-500",
    red: "text-red-600 bg-red-50 border-red-100 hover:text-red-700 focus:ring-red-500",
  };

  const selectedColorClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 truncate flex-1">{label}</label>
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className={`shrink-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border shadow-sm active:scale-95 ${selectedColorClass}`}
        >
          <MapPin size={12} />
          {value ? "Change Location" : "Open Map"}
        </button>
      </div>
      
      <div 
        onClick={() => setIsMapOpen(true)}
        className={`w-full p-5 rounded-2xl border border-stone-200 outline-none transition-all cursor-pointer flex items-center gap-4 group hover:border-emerald-500 hover:bg-white ${value ? 'bg-white' : 'bg-stone-50 text-stone-400'}`}
      >
        <div className={`p-2 rounded-xl transition-colors ${value ? `bg-emerald-100 text-emerald-600` : 'bg-stone-100 text-stone-300 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
          <MapPin size={20} />
        </div>
        <span className={`truncate flex-1 font-bold ${value ? 'text-stone-900' : 'text-stone-400'}`}>
          {value || "Click to select farm location..."}
        </span>
      </div>

      <AnimatePresence>
        {isMapOpen && (
          <MapPicker
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            onSelect={handleLocationSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
