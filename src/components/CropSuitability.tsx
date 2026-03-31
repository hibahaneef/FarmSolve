import React, { useState } from "react";
import { generateCropSuitability } from "../services/geminiService";
import { Loader2, MapPin, Sprout, Sun, Cloud, Wind } from "lucide-react";
import { motion } from "motion/react";
import LocationSelector from "./LocationSelector";

export default function CropSuitability() {
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateCropSuitability(location);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch crop suitability data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <Sprout size={18} />
            {error}
          </div>
        )}
        <div className="space-y-6">
          <LocationSelector
            label="Farm Location"
            value={location}
            onChange={(val, data) => {
              setLocation(val);
              if (data) setLocationData(data);
            }}
            color="emerald"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
            Find Suitable Crops
          </button>
        </div>
      </form>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {result.map((crop: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 hover:border-emerald-200 transition-all group hover:shadow-xl hover:shadow-emerald-50/50 flex flex-col"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                <Sprout size={28} />
              </div>
              <h3 className="font-black text-2xl text-stone-900 mb-3 group-hover:text-emerald-700 transition-colors">{crop.cropName}</h3>
              <p className="text-sm text-stone-600 mb-6 leading-relaxed flex-1">{crop.reasons}</p>
              
              <div className="space-y-4 pt-6 border-t border-stone-100">
                <p className="text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">Ideal Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {crop.idealSeasons.map((season: string, j: number) => (
                    <span key={j} className="text-xs font-bold bg-stone-50 text-stone-600 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-stone-100 group-hover:border-emerald-100 group-hover:bg-emerald-50/50 transition-colors">
                      {season.toLowerCase().includes('summer') && <Sun size={14} className="text-orange-500" />}
                      {season.toLowerCase().includes('monsoon') && <Cloud size={14} className="text-blue-500" />}
                      {season.toLowerCase().includes('winter') && <Wind size={14} className="text-stone-400" />}
                      {season}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
