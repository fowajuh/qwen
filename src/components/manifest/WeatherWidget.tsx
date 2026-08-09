import { motion } from "framer-motion";
import { useState } from "react";
import { Cloud, Sun, Moon, CloudRain, Droplets, Wind, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  location: string;
  checkInDate: string;
  checkOutDate: string;
}

type WeatherCondition = "sunny" | "cloudy" | "rainy" | "partly-cloudy" | "stormy";

interface DayForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

// Mock weather data generator (in production, this would call a real weather API)
const generateWeatherForecast = (location: string, startDate: string, days: number): DayForecast[] => {
  const conditions: WeatherCondition[] = ["sunny", "partly-cloudy", "cloudy", "rainy"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    return {
      date: date.toISOString().split('T')[0],
      dayName: dayNames[date.getDay()],
      high: 75 + Math.floor(Math.random() * 15),
      low: 60 + Math.floor(Math.random() * 10),
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      precipitation: Math.floor(Math.random() * 40),
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15),
    };
  });
};

const WeatherIcon = ({ condition, className }: { condition: WeatherCondition; className?: string }) => {
  switch (condition) {
    case "sunny":
      return <Sun className={cn("text-amber-500", className)} />;
    case "cloudy":
      return <Cloud className={cn("text-slate-500", className)} />;
    case "rainy":
      return <CloudRain className={cn("text-blue-500", className)} />;
    case "partly-cloudy":
      return (
        <div className={cn("relative", className)}>
          <Sun className="absolute text-amber-500 w-full h-full" />
          <Cloud className="absolute text-slate-400 w-3/4 h-3/4 top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4" />
        </div>
      );
    case "stormy":
      return <CloudRain className={cn("text-purple-500", className)} />;
    default:
      return <Sun className={cn("text-amber-500", className)} />;
  }
};

export function WeatherWidget({ location, checkInDate, checkOutDate }: WeatherWidgetProps) {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  
  // Calculate trip duration
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const tripDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) || 3;
  
  const forecast = generateWeatherForecast(location, checkInDate, tripDays + 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-2xl p-5 border border-sky-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            Weather Forecast
          </h3>
          <p className="text-sm text-slate-500">{location}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Trip Weather</p>
          <p className="text-xs text-slate-500">{tripDays} days</p>
        </div>
      </div>

      {/* Current Day Highlight */}
      <motion.div
        key={selectedDay}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-700">{forecast[selectedDay].dayName}</p>
            <p className="text-xs text-slate-500">{new Date(forecast[selectedDay].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
          <WeatherIcon condition={forecast[selectedDay].condition} className="w-12 h-12" />
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{forecast[selectedDay].high}°</p>
            <p className="text-sm text-slate-500">L:{forecast[selectedDay].low}°</p>
          </div>
        </div>
        
        {/* Detailed Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Rain</p>
            <p className="font-bold text-slate-700">{forecast[selectedDay].precipitation}%</p>
          </div>
          <div className="text-center">
            <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Wind</p>
            <p className="font-bold text-slate-700">{forecast[selectedDay].windSpeed} mph</p>
          </div>
          <div className="text-center">
            <Thermometer className="w-4 h-4 text-rose-500 mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Humidity</p>
            <p className="font-bold text-slate-700">{forecast[selectedDay].humidity}%</p>
          </div>
        </div>
      </motion.div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {forecast.map((day, idx) => (
          <motion.button
            key={day.date}
            onClick={() => setSelectedDay(idx)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-shrink-0 p-3 rounded-xl text-center transition-all min-w-[70px]",
              selectedDay === idx
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                : "bg-white/60 text-slate-700 hover:bg-white/80"
            )}
          >
            <p className="text-[10px] uppercase tracking-wider mb-1">{day.dayName}</p>
            <WeatherIcon 
              condition={day.condition} 
              className={cn("w-6 h-6 mx-auto mb-1", selectedDay === idx ? "" : "")} 
            />
            <p className="font-bold text-sm">{day.high}°</p>
          </motion.button>
        ))}
      </div>

      {/* Packing Tips */}
      <div className="mt-4 pt-4 border-t border-sky-200">
        <p className="text-xs font-bold uppercase tracking-wider text-sky-600 mb-2">Packing Tips</p>
        <div className="flex flex-wrap gap-2">
          {forecast.some(d => d.condition === "rainy") && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              ☔ Pack an umbrella
            </span>
          )}
          {forecast.some(d => d.high > 85) && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              ☀️ Bring sunscreen
            </span>
          )}
          {forecast.some(d => d.low < 65) && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              🧥 Light jacket
            </span>
          )}
          {forecast.every(d => d.condition === "sunny") && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              👙 Perfect beach weather!
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Trip Command Center component that includes weather
interface TripCommandCenterProps {
  listingTitle: string;
  location: string;
  checkIn: string;
  checkOut: string;
  listingImage: string;
  hostName: string;
  hostAvatar: string;
  bookingRef: string;
}

export function TripCommandCenter({
  listingTitle,
  location,
  checkIn,
  checkOut,
  listingImage,
  hostName,
  hostAvatar,
  bookingRef,
}: TripCommandCenterProps) {
  const daysUntil = Math.ceil((new Date(checkIn).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isUpcoming = daysUntil > 0;
  const isActive = daysUntil <= 0 && daysUntil > -5;

  return (
    <div className="space-y-4">
      {/* Countdown Banner */}
      {isUpcoming && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Your trip starts in</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold">{daysUntil}</span>
                <span className="text-lg text-white/70">days</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white/80">Check-in</p>
              <p className="font-bold text-lg">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex gap-4">
          <img src={listingImage} alt={listingTitle} className="w-24 h-24 rounded-xl object-cover" />
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-slate-900 truncate">{listingTitle}</h3>
            <p className="text-sm text-slate-500 truncate">{location}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
              <span>📅 {new Date(checkIn).toLocaleDateString()} → {new Date(checkOut).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 text-xs font-mono text-slate-400">{bookingRef}</p>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <WeatherWidget location={location} checkInDate={checkIn} checkOutDate={checkOut} />

      {/* Host Contact */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={hostAvatar} alt={hostName} className="w-12 h-12 rounded-full object-cover" />
            <div>
              <p className="font-bold text-slate-900">{hostName}</p>
              <p className="text-xs text-slate-500">Your Host</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
            Message
          </button>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="text-lg">✓</span> Pre-Trip Checklist
        </h4>
        <div className="space-y-2">
          {[
            { task: "Confirm check-in time", done: false },
            { task: "Review house rules", done: true },
            { task: "Download offline maps", done: false },
            { task: "Pack for the weather", done: false },
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" defaultChecked={item.done} className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className={cn("text-sm", item.done ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-slate-900")}>
                {item.task}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
