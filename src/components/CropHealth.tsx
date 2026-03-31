import React, { useState } from "react";
import { generateCropHealthAdvice } from "../services/geminiService";
import { Loader2, Leaf, Zap, Shield, FlaskConical } from "lucide-react";
import { motion } from "motion/react";

export default function CropHealth() {
  const [crop, setCrop] = useState("");
  const [stage, setStage] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateCropHealthAdvice(crop, stage, type);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch health advice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <Leaf size={18} />
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Rice"
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Growth Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white appearance-none cursor-pointer"
              required
            >
              <option value="">Select...</option>
              <option value="Seedling">Seedling</option>
              <option value="Vegetative">Vegetative</option>
              <option value="Flowering">Flowering</option>
              <option value="Fruiting">Fruiting</option>
              <option value="Harvesting">Harvesting</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Farming Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50 hover:bg-white appearance-none cursor-pointer"
              required
            >
              <option value="">Select...</option>
              <option value="Organic">Organic</option>
              <option value="Chemical">Chemical</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-100 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Leaf size={20} />}
          Get Health Advice
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-emerald-900 font-black text-3xl mb-4 flex items-center gap-3">
                <Zap className="text-emerald-600" size={32} />
                Nutrient Needs
              </h3>
              <p className="text-emerald-700 text-lg font-medium leading-relaxed max-w-2xl">{result.nutrientNeeds}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 group hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <FlaskConical size={24} />
                </div>
                Fertilizer Suggestions
              </h4>
              <ul className="space-y-4">
                {result.fertilizerSuggestions.map((item: string, i: number) => (
                  <li key={i} className="text-stone-600 flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 group hover:border-blue-200 transition-colors">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                Organic Alternatives
              </h4>
              <ul className="space-y-4">
                {result.organicAlternatives.map((item: string, i: number) => (
                  <li key={i} className="text-stone-600 flex gap-3 items-start">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
            <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2 text-xl">
              <Shield className="text-emerald-600" />
              Safety & Maintenance Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.safetyTips.map((tip: string, i: number) => (
                <div key={i} className="text-sm text-stone-600 bg-stone-50 p-4 rounded-2xl border border-stone-100 hover:bg-white hover:shadow-md transition-all cursor-default">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
