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
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
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
              placeholder="e.g. Wheat"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-stone-50"
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
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-500">Target Date</label>
            <select
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-stone-50"
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Droplets size={20} />}
          Get {targetDate === "today" ? "Today's" : "Tomorrow's"} Irrigation Advice
        </button>
      </form>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${result.shouldIrrigate ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${targetDate === 'today' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {targetDate === 'today' ? 'Today' : 'Tomorrow'}
                </span>
              </div>
              <h3 className={`font-bold text-xl ${result.shouldIrrigate ? 'text-blue-900' : 'text-amber-900'}`}>
                {result.shouldIrrigate ? 'Irrigation Recommended' : 'Irrigation Not Recommended'}
              </h3>
              <p className="text-stone-600 mt-1">Next timing: {result.nextIrrigationTiming}</p>
            </div>
            <div className={`p-4 rounded-full ${result.shouldIrrigate ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
              {result.shouldIrrigate ? <CloudRain size={32} /> : <Thermometer size={32} />}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weather && !weather.error && (
              <>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
                  <Thermometer className="text-orange-500" />
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold">Temp</p>
                    <p className="font-bold">{weather.main.temp}°C</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
                  <Droplets className="text-blue-500" />
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold">Humidity</p>
                    <p className="font-bold">{weather.main.humidity}%</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-stone-200 flex items-center gap-3">
                  <Wind className="text-stone-400" />
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold">Wind</p>
                    <p className="font-bold">{weather.wind.speed} m/s</p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
            <h4 className="font-bold text-stone-900 mb-4">Watering Details</h4>
            <p className="text-stone-600 mb-6">{result.waterAmount}</p>
            
            {result.riskAlerts.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase text-amber-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Risk Alerts
                </h5>
                <ul className="space-y-2">
                  {result.riskAlerts.map((alert: string, i: number) => (
                    <li key={i} className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100">
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
