import React, { useState } from "react";
import { generateCropSuitability } from "../services/geminiService";
import { Loader2, MapPin, Sprout, Sun, Cloud, Wind } from "lucide-react";
import { motion } from "motion/react";
import LocationSelector from "./LocationSelector";

export default function CropSuitability() {
  const [location, setLocation] = useState("");
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
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <Sprout size={18} />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <LocationSelector
            label="Location"
            value={location}
            onChange={setLocation}
            color="emerald"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <MapPin size={20} />}
            Find Crops
          </button>
        </div>
      </form>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.map((crop: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-emerald-200 transition-all group"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Sprout size={24} />
              </div>
              <h3 className="font-bold text-lg text-stone-900 mb-2">{crop.cropName}</h3>
              <p className="text-sm text-stone-600 mb-4 line-clamp-3">{crop.reasons}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-stone-400 tracking-wider">Ideal Seasons</p>
                <div className="flex flex-wrap gap-2">
                  {crop.idealSeasons.map((season: string, j: number) => (
                    <span key={j} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-md flex items-center gap-1">
                      {season.toLowerCase().includes('summer') && <Sun size={12} />}
                      {season.toLowerCase().includes('monsoon') && <Cloud size={12} />}
                      {season.toLowerCase().includes('winter') && <Wind size={12} />}
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
