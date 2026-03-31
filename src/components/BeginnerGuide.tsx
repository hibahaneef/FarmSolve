import React, { useState } from "react";
import { generateFarmingGuide } from "../services/geminiService";
import ReactMarkdown from "react-markdown";
import { Loader2, Sprout, Calendar, AlertTriangle, CheckCircle2, Save, BookmarkCheck, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, collection, addDoc, serverTimestamp, auth, OperationType, handleFirestoreError } from "../firebase";
import MapPicker from "./MapPicker";

export default function BeginnerGuide() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [isMapOpen, setIsMapOpen] = useState(false);
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

  const handleMapSelect = (location: { state: string; district: string; village: string }) => {
    setState(location.state);
    setDistrict(location.district);
    setVillage(location.village);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      if (!state || !district) {
        setError("Please select a location on the map first.");
        setLoading(false);
        return;
      }
      const location = `${state}, ${district}, ${village}`;
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
      const location = `${state}, ${district}, ${village}`;
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
      <AnimatePresence>
        {isMapOpen && (
          <MapPicker 
            isOpen={isMapOpen} 
            onClose={() => setIsMapOpen(false)} 
            onSelect={handleMapSelect} 
          />
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Farm Location</h3>
            <button
              type="button"
              onClick={() => setIsMapOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl transition-all border border-emerald-100 hover:shadow-md active:scale-95"
            >
              <MapPin size={16} />
              {state ? "Change Location" : "Select on Map"}
            </button>
          </div>

          {state ? (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-4"
            >
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <MapPin size={20} />
              </div>
              <div>
                <p className="font-bold text-stone-900">{village || "Selected Location"}</p>
                <p className="text-sm text-stone-500">{district}, {state}</p>
              </div>
            </motion.div>
          ) : (
            <div 
              onClick={() => setIsMapOpen(true)}
              className="p-8 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-3 text-stone-400 hover:border-emerald-300 hover:text-emerald-500 cursor-pointer transition-all group"
            >
              <MapPin size={32} className="group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium">Click to select your farm location on the map</p>
            </div>
          )}
        </div>

        <div className="h-px bg-stone-100 my-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Land Size */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Land Size</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
                placeholder="e.g. 5"
                className="flex-1 p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
                required
              />
              <select
                value={landUnit}
                onChange={(e) => setLandUnit(e.target.value)}
                className="w-32 p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              >
                <option value="Acres">Acres</option>
                <option value="Cents">Cents</option>
                <option value="Hectares">Hectares</option>
              </select>
            </div>
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Soil Type</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
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

          {/* Water Availability */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Water Availability</label>
            <select
              value={water}
              onChange={(e) => setWater(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              required
            >
              <option value="">Select Availability...</option>
              <option value="High">High (Borewell/River)</option>
              <option value="Medium">Medium (Canal/Rain)</option>
              <option value="Low">Low (Water Scarcity)</option>
            </select>
          </div>

          {/* Farming Season */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Farming Season</label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              required
            >
              <option value="">Select Season...</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
          </div>

          {/* Budget Range */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Budget Range</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              required
            >
              <option value="">Select Budget...</option>
              <option value="Low">Low (Minimal Investment)</option>
              <option value="Medium">Medium (Standard)</option>
              <option value="High">High (Advanced Tech/Large Scale)</option>
            </select>
          </div>

          {/* Farming Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Farming Type</label>
            <select
              value={farmingType}
              onChange={(e) => setFarmingType(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              required
            >
              <option value="">Select Type...</option>
              <option value="Organic">Organic (No Chemicals)</option>
              <option value="Chemical">Chemical (Fertilizers/Pesticides)</option>
              <option value="Mixed">Mixed (Integrated)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sprout size={20} />}
          Generate Personalized Farming Plan
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between">
            <h3 className="text-emerald-900 font-bold text-xl flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" />
              Recommended Crop: {result.bestCrop}
            </h3>
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                saved 
                ? "bg-emerald-600 text-white" 
                : "bg-white text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-600 hover:text-white"
              }`}
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : saved ? <BookmarkCheck size={18} /> : <Save size={18} />}
              {saved ? "Saved to Profile" : "Save Plan"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Calendar className="text-emerald-600" />
                7-Day Action Plan
              </h4>
              <ul className="space-y-3">
                {result.sevenDayActionPlan.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-stone-600">
                    <span className="font-bold text-emerald-600">Day {i + 1}</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" />
                Common Mistakes
              </h4>
              <ul className="space-y-3">
                {result.commonMistakes.map((mistake: string, i: number) => (
                  <li key={i} className="flex gap-3 text-stone-600">
                    <span className="text-amber-500">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 prose prose-stone max-w-none">
            <h4 className="font-bold text-stone-900 mb-4">Detailed Farming Plan</h4>
            <ReactMarkdown>{result.farmingPlan}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
}
