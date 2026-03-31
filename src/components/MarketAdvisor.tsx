import React, { useState } from "react";
import { generateMarketAdvice } from "../services/geminiService";
import { Loader2, TrendingUp, DollarSign, Clock, BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import LocationSelector from "./LocationSelector";

export default function MarketAdvisor() {
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await generateMarketAdvice(crop, location);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch market advice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <TrendingUp size={18} />
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Cotton"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-stone-50"
              required
            />
          </div>
          <LocationSelector
            label="Location"
            value={location}
            onChange={setLocation}
            color="indigo"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <TrendingUp size={20} />}
          Get Market Advice
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${result.sellNowOrWait === 'Sell Now' ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
            <div>
              <h3 className={`font-bold text-xl ${result.sellNowOrWait === 'Sell Now' ? 'text-indigo-900' : 'text-amber-900'}`}>
                Decision: {result.sellNowOrWait}
              </h3>
              <p className="text-stone-600 mt-1">Best timing: {result.bestTiming}</p>
            </div>
            <div className={`p-4 rounded-full ${result.sellNowOrWait === 'Sell Now' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
              <DollarSign size={32} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                Market Trend
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result.marketTrend}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Clock className="text-indigo-600" />
                Profit Advice
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result.profitAdvice}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
