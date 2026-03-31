import React, { useState } from "react";
import { generateFarmingGuide } from "../services/geminiService";
import ReactMarkdown from "react-markdown";
import { Loader2, Sprout, Calendar, AlertTriangle, CheckCircle2, Save, BookmarkCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, addDoc, serverTimestamp, auth, OperationType, handleFirestoreError } from "../firebase";
import LocationSelector from "./LocationSelector";

export default function BeginnerGuide() {
  const [location, setLocation] = useState("");
  const [landSize, setLandSize] = useState("");
  const [landUnit, setLandUnit] = useState("Acres");
  const [soilType, setSoilType] = useState("");
  const [water, setWater] = useState("");
  const [season, setSeason] = useState("");
  const [budget, setBudget] = useState("");
  const [farmingType, setFarmingType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      if (!location) {
        setError("Please select a location on the map first.");
        setLoading(false);
        return;
      }
      const data = await generateFarmingGuide(
        location,
        landSize,
        landUnit,
        soilType,
        water,
        season,
        budget,
        farmingType
      );
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate farming plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !auth.currentUser) return;
    setSaving(true);
    setError(null);
    try {
      await addDoc(collection(db, "plans"), {
        uid: auth.currentUser.uid,
        location,
        bestCrop: result.bestCrop,
        farmingPlan: result.farmingPlan,
        sevenDayActionPlan: result.sevenDayActionPlan,
        commonMistakes: result.commonMistakes,
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "plans");
      setError("Failed to save plan to profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
        
        <LocationSelector
          label="Farm Location"
          value={location}
          onChange={setLocation}
          color="emerald"
        />

        <div className="h-px bg-stone-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Land Details</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="Size"
                className="flex-1 min-w-0 p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white"
                required
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="w-32 p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer shrink-0"
              >
                <option value="Acres">Acres</option>
                <option value="Cents">Cents</option>
                <option value="Hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer"
              required
            >
              <option value="">Select Soil Type...</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Laterite">Laterite</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Water Availability</label>
            <select
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer"
              required
            >
              <option value="">Select Availability...</option>
              <option value="High">High (Borewell/River)</option>
              <option value="Medium">Medium (Canal/Rain)</option>
              <option value="Low">Low (Water Scarcity)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Farming Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer"
              required
            >
              <option value="">Select Season...</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Budget Range</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer"
              required
            >
              <option value="">Select Budget...</option>
              <option value="Low">Low (Minimal Investment)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="High">High (Advanced Tech)</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">Farming Type</label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white cursor-pointer"
              required
            >
              <option value="">Select Type...</option>
              <option value="Organic">Organic (No Chemicals)</option>
              <option value="Chemical">Chemical (Fertilizers)</option>
              <option value="Mixed">Mixed (Integrated)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-emerald-100 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sprout size={24} />}
          Generate Personalized Farming Plan
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-emerald-600 p-8 sm:p-10 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 pointer-events-none">
              <Sprout size={160} />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md shrink-0">
                    <BookmarkCheck size={24} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-80 truncate">Recommended Crop</span>
                </div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight truncate">{result.bestCrop}</h3>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || saved}
                className={`shrink-0 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 ${
                  saved 
                  ? "bg-white text-emerald-600" 
                  : "bg-emerald-500 text-white hover:bg-emerald-400 border border-emerald-400"
                }`}
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : saved ? <CheckCircle2 size={20} /> : <Save size={20} />}
                {saved ? "Saved to Profile" : "Save Plan"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-stone-200 flex flex-col min-h-[400px]">
              <h4 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                  <Calendar size={24} />
                </div>
                7-Day Action Plan
              </h4>
              <div className="space-y-6 flex-1">
                {result.sevenDayActionPlan.map((step: string, i: number) => (
                  <div key={i} className="flex gap-6 group min-h-0">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-10 h-10 rounded-full bg-stone-50 border-2 border-stone-100 flex items-center justify-center font-black text-stone-400 group-hover:border-emerald-500 group-hover:text-emerald-600 transition-colors shrink-0">
                        {i + 1}
                      </div>
                      {i < result.sevenDayActionPlan.length - 1 && (
                        <div className="w-0.5 flex-1 bg-stone-100 group-hover:bg-emerald-100 transition-colors my-2" />
                      )}
                    </div>
                    <div className="pb-6 flex-1 min-w-0">
                      <p className="text-stone-600 leading-relaxed font-medium">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-stone-200 flex flex-col min-h-[400px]">
              <h4 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3 shrink-0">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                  <AlertTriangle size={24} />
                </div>
                Common Mistakes
              </h4>
              <div className="space-y-4 flex-1">
                {result.commonMistakes.map((mistake: string, i: number) => (
                  <div key={i} className="flex gap-4 p-6 bg-amber-50/50 rounded-3xl border border-amber-100 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black shrink-0">
                      !
                    </div>
                    <p className="text-stone-700 leading-relaxed font-medium flex-1">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-stone-200">
            <h4 className="text-2xl font-black text-stone-900 mb-8 flex items-center gap-3">
              <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                <Sprout size={24} />
              </div>
              Detailed Farming Plan
            </h4>
            <div className="prose prose-stone max-w-none prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-headings:text-stone-900 prose-headings:font-black">
              <ReactMarkdown>{result.farmingPlan}</ReactMarkdown>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
