import React, { useState } from "react";
import { diagnoseDisease } from "../services/geminiService";
import { Loader2, Bug, AlertTriangle, ShieldCheck, Pill } from "lucide-react";
import { motion } from "motion/react";

export default function DiseaseDiagnosis() {
  const [crop, setCrop] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const sampleSymptoms = [
    { crop: "Tomato", text: "Yellow spots on leaves, wilting stems" },
    { crop: "Wheat", text: "Brown rust spots on leaves, stunted growth" },
    { crop: "Rice", text: "Brown spots with gray centers on leaves" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await diagnoseDisease(crop, symptoms);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to diagnose disease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato"
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-stone-50 hover:bg-white"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Symptoms</label>
              <span className="text-[10px] font-bold text-stone-300 uppercase">Be descriptive</span>
            </div>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Yellow spots on leaves, wilting stems"
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-stone-50 hover:bg-white min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Try a sample</p>
            <div className="flex flex-wrap gap-2">
              {sampleSymptoms.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCrop(sample.crop);
                    setSymptoms(sample.text);
                  }}
                  className="text-xs font-bold px-4 py-2 rounded-xl border border-stone-200 text-stone-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                >
                  {sample.crop}: {sample.text.slice(0, 20)}...
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-100 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Bug size={20} />}
          Diagnose Disease
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-red-50 border border-red-100 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Bug size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-red-900 font-black text-3xl mb-4 flex items-center gap-3">
                <AlertTriangle className="text-red-600" size={32} />
                {result.possibleDisease}
              </h3>
              <div className="flex items-center gap-2 text-red-700 bg-red-100/50 w-fit px-4 py-2 rounded-xl border border-red-200/50">
                <span className="font-bold uppercase text-[10px] tracking-widest">Root Cause</span>
                <p className="text-sm font-medium">{result.causes}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 group hover:border-red-200 transition-colors">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 rounded-xl text-red-600 group-hover:scale-110 transition-transform">
                  <Pill size={24} />
                </div>
                Treatment Plan
              </h4>
              <p className="text-stone-600 leading-relaxed">{result.treatment}</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 group hover:border-emerald-200 transition-colors">
              <h4 className="font-bold text-stone-900 mb-6 flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                Prevention Tips
              </h4>
              <p className="text-stone-600 leading-relaxed">{result.prevention}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
