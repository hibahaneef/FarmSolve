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
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <Leaf size={18} />
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Rice"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Growth Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
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
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Farming Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-stone-50"
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Leaf size={20} />}
          Get Health Advice
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
            <h3 className="text-emerald-900 font-bold text-xl mb-2 flex items-center gap-2">
              <Zap className="text-emerald-600" />
              Nutrient Needs
            </h3>
            <p className="text-emerald-700 text-sm">{result.nutrientNeeds}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <FlaskConical className="text-emerald-600" />
                Fertilizer Suggestions
              </h4>
              <ul className="space-y-3">
                {result.fertilizerSuggestions.map((item: string, i: number) => (
                  <li key={i} className="text-stone-600 text-sm flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Shield className="text-emerald-600" />
                Organic Alternatives
              </h4>
              <ul className="space-y-3">
                {result.organicAlternatives.map((item: string, i: number) => (
                  <li key={i} className="text-stone-600 text-sm flex gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h4 className="font-bold text-stone-900 mb-4">Safety Tips</h4>
            <ul className="space-y-2">
              {result.safetyTips.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
