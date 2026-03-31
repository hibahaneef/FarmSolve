import React, { useState } from "react";
import { generateMarketAdvice } from "../services/geminiService";
import { Loader2, TrendingUp, DollarSign, Clock, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "motion/react";
import LocationSelector from "./LocationSelector";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function MarketAdvisor() {
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<any>(null);
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
      setError("Failed to fetch market trends. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <TrendingUp size={18} />
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Cotton"
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-stone-50 hover:bg-white"
              required
            />
          </div>
          <LocationSelector
            label="Location"
            value={location}
            onChange={(val, data) => {
              setLocation(val);
              if (data) setLocationData(data);
            }}
            color="indigo"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-100 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <BarChart3 size={20} />}
          Analyze Market Trends
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-8 rounded-3xl border flex flex-col justify-between min-h-[200px] ${result.sellNowOrWait === 'Sell Now' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${result.sellNowOrWait === 'Sell Now' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    Recommendation
                  </span>
                </div>
                <h3 className={`text-4xl font-bold mb-4 ${result.sellNowOrWait === 'Sell Now' ? 'text-emerald-900' : 'text-amber-900'}`}>
                  {result.sellNowOrWait}
                </h3>
                <p className="text-stone-600 leading-relaxed max-w-xl">{result.marketTrend}</p>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${result.sellNowOrWait === 'Sell Now' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                  {result.sellNowOrWait === 'Sell Now' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Best Timing</p>
                  <p className="font-bold text-stone-900">{result.bestTiming}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-2">
                <DollarSign className="text-indigo-600" />
                Profit Strategy
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed flex-1">{result.profitAdvice}</p>
              <div className="mt-8 pt-6 border-t border-stone-100">
                <div className="flex items-center gap-3 text-stone-400">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Updated Today</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold text-stone-900 flex items-center gap-2 text-xl">
                <TrendingUp className="text-indigo-600" />
                Price Trend (Last 6 Months)
              </h4>
              <div className="flex items-center gap-4 text-xs font-bold text-stone-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  Market Price
                </div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#a8a29e', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px', color: '#1c1917' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
