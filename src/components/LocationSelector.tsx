import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MapPicker from "./MapPicker";

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (location: string) => void;
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

  const handleLocationSelect = (data: { village: string; district: string; state: string; lat: number; lng: number }) => {
    const locationString = `${data.village ? data.village + ", " : ""}${data.district}, ${data.state}`;
    onChange(locationString);
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</label>
        <button
          type="button"
          onClick={() => setIsMapOpen(true)}
          className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border hover:shadow-sm active:scale-95 ${selectedColorClass}`}
        >
          <MapPin size={14} />
          {value ? "Change" : "Select on Map"}
        </button>
      </div>
      
      <div 
        onClick={() => setIsMapOpen(true)}
        className={`w-full p-3 rounded-xl border border-stone-200 outline-none transition-all cursor-pointer flex items-center gap-3 ${value ? 'bg-white' : 'bg-stone-50 text-stone-400'}`}
      >
        <MapPin size={18} className={value ? `text-${color}-500` : 'text-stone-300'} />
        <span className="truncate flex-1">
          {value || "Click to select location..."}
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
