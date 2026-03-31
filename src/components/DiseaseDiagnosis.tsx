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
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Crop Name</label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Tomato"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-stone-50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Yellow spots on leaves, wilting stems"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500 outline-none transition-all bg-stone-50 min-h-[100px]"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Bug size={20} />}
          Diagnose Disease
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
            <h3 className="text-red-900 font-bold text-xl mb-2 flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Possible Disease: {result.possibleDisease}
            </h3>
            <p className="text-red-700 text-sm">Cause: {result.causes}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Pill className="text-red-600" />
                Treatment Plan
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result.treatment}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                Prevention Tips
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">{result.prevention}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
