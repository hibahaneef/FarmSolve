import React, { useState } from "react";
import { generateIrrigationAdvice } from "../services/geminiService";
import { Loader2, Droplets, CloudRain, Thermometer, Wind, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import LocationSelector from "./LocationSelector";

export default function IrrigationAdvisor() {
  const [crop, setCrop] = useState("");
  const [location, setLocation] = useState("");
  const [targetDate, setTargetDate] = useState("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      let weatherData;
      if (targetDate === "today") {
        const weatherRes = await fetch(`/api/weather?city=${location}`);
        weatherData = await weatherRes.json();
      } else {
        const forecastRes = await fetch(`/api/forecast?city=${location}`);
        const forecastData = await forecastRes.json();
        
        if (forecastData.list) {
          // Find forecast for tomorrow (roughly 8 intervals of 3 hours = 24 hours)
          // Or just find the one closest to +24h
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowTimestamp = tomorrow.getTime() / 1000;
          
          weatherData = forecastData.list.reduce((prev: any, curr: any) => {
            return Math.abs(curr.dt - tomorrowTimestamp) < Math.abs(prev.dt - tomorrowTimestamp) ? curr : prev;
          });
          
          // Format it to look like current weather response for the AI
          weatherData = {
            ...weatherData,
            name: forecastData.city.name,
            main: weatherData.main,
            wind: weatherData.wind,
            weather: weatherData.weather
          };
        } else {
          weatherData = forecastData;
        }
      }
      
      setWeather(weatherData);

      if (weatherData.error) {
        setError(weatherData.error);
        setLoading(false);
        return;
      }

      const data = await generateIrrigationAdvice(crop, location, weatherData);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
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
              placeholder="e.g. Wheat"
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-stone-50 hover:bg-white"
              required
            />
          </div>
          <LocationSelector
            label="Location (City)"
            value={location}
            onChange={setLocation}
            color="blue"
          />
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-stone-400">Target Date</label>
            <select
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-stone-50 hover:bg-white appearance-none cursor-pointer"
              required
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Droplets size={20} />}
          Get {targetDate === "today" ? "Today's" : "Tomorrow's"} Irrigation Advice
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className={`p-8 rounded-3xl border flex items-center justify-between relative overflow-hidden ${result.shouldIrrigate ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10">
              {result.shouldIrrigate ? <CloudRain size={120} /> : <Thermometer size={120} />}
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${targetDate === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {targetDate === 'today' ? 'Today' : 'Tomorrow'}
                </span>
              </div>
              <h3 className={`text-3xl font-black mb-2 ${result.shouldIrrigate ? 'text-blue-900' : 'text-amber-900'}`}>
                {result.shouldIrrigate ? 'Irrigation Recommended' : 'Irrigation Not Recommended'}
              </h3>
              <p className="text-stone-600 font-medium">Next timing: {result.nextIrrigationTiming}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weather && !weather.error && (
              <>
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Temperature</p>
                    <p className="text-xl font-black text-stone-900">{weather.main.temp}°C</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                    <Droplets size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Humidity</p>
                    <p className="text-xl font-black text-stone-900">{weather.main.humidity}%</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-stone-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="p-3 bg-stone-50 rounded-2xl text-stone-400">
                    <Wind size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest">Wind Speed</p>
                    <p className="text-xl font-black text-stone-900">{weather.wind.speed} m/s</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200">
            <h4 className="font-bold text-stone-900 mb-6 text-xl flex items-center gap-2">
              <Droplets className="text-blue-600" />
              Watering Strategy
            </h4>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 mb-8">
              <p className="text-stone-600 leading-relaxed font-medium">{result.waterAmount}</p>
            </div>
            
            {result.riskAlerts.length > 0 && (
              <div className="space-y-4">
                <h5 className="text-xs font-black uppercase text-amber-600 flex items-center gap-2 tracking-[0.2em]">
                  <AlertCircle size={16} />
                  Critical Risk Alerts
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.riskAlerts.map((alert: string, i: number) => (
                    <div key={i} className="text-sm text-stone-600 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
