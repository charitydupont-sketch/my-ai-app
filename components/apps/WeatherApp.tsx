
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudSun, CloudRain, Sun, Wind, Droplets, MapPin, List, Menu, Bot, Sparkles, Shirt, Calendar, ArrowRight, Cloud, Moon, Search, X, ShoppingBag, Tag, ChevronDown, Layers, Receipt, Mail, CheckCircle, CalendarDays, Clock } from 'lucide-react';
import { SilasLogo } from '../SilasApp';
import { generateSmartResponse, getWeather, getFashionAdvice, generateImage } from '../../services/geminiService';
import { CalendarEvent } from '../../types';

interface WeatherAppProps {
  onClose: () => void;
  calendarEvents: CalendarEvent[];
}

interface WeatherData {
    location: string;
    temp: number;
    condition: string;
    high: number;
    low: number;
    hourly: { time: string; icon: string; temp: number }[];
}

interface OutfitOption {
    type: "WARDROBE" | "VIBE" | "PRACTICAL";
    title: string;
    description: string;
    item?: string;
    tags: string[];
    imagePrompt?: string;
    imageUrl?: string | null;
    receipt?: {
        store: string;
        date: string;
        price: string;
        orderId: string;
    };
}

// Mock Purchase History for Silas to "Recall" with enhanced metadata covering diverse climates
const PURCHASE_HISTORY = [
    { name: "Platform Chelsea Boots", category: "Footwear", condition: ["Rain", "Snow", "Cloudy", "Cold"], date: "Oct 10, 2023", store: "Juno Store", price: "$142.00", orderId: "#Z-8821" },
    { name: "Wool Maxi Coat", category: "Outerwear", condition: ["Rain", "Wind", "Drizzle", "Cold"], date: "Oct 12, 2023", store: "ThriftFinds Online", price: "$185.50", orderId: "#TF-9920" },
    { name: "Oversized Cashmere Scarf", category: "Accessory", condition: ["Cold", "Freezing", "Wind"], date: "Nov 01, 2023", store: "Luxury Knits", price: "$220.00", orderId: "#LK-1102" },
    { name: "Cat-Eye Sunglasses", category: "Accessory", condition: ["Sunny", "Clear"], date: "July 04, 2023", store: "SunGods", price: "$160.00", orderId: "#SG-7741" },
    { name: "Silk Midi Skirt", category: "Bottom", condition: ["Hot", "Sunny", "Warm"], date: "July 15, 2023", store: "Reformation", price: "$120.00", orderId: "#REF-5523" },
    { name: "High-Waisted Wide Leg Trousers", category: "Bottom", condition: ["Cloudy", "Office", "Mild"], date: "Sept 20, 2023", store: "Aritzia", price: "$148.00", orderId: "#AR-1122" },
    { name: "Thermal Parka", category: "Outerwear", condition: ["Snow", "Freezing", "Blizzard"], date: "Dec 05, 2022", store: "North Face", price: "$320.00", orderId: "#NF-9911" },
    { name: "Linen Beach Cover-Up", category: "Dress", condition: ["Hot", "Sunny", "Beach"], date: "June 20, 2023", store: "Juno Store", price: "$65.00", orderId: "#Z-4422" }
];

export const WeatherApp: React.FC<WeatherAppProps> = ({ onClose, calendarEvents }) => {
  const [silasAdvice, setSilasAdvice] = useState<string | null>(null);
  const [outfitOptions, setOutfitOptions] = useState<OutfitOption[] | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [isLoadingOutfit, setIsLoadingOutfit] = useState(false);
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'OUTFIT' | 'SCHEDULE'>('FORECAST');
  
  // Weather State - Default to New York
  const [weather, setWeather] = useState<WeatherData>({
      location: 'New York',
      temp: 58,
      condition: 'Cloudy',
      high: 62,
      low: 51,
      hourly: [
          { time: 'Now', icon: 'Cloud', temp: 58 },
          { time: '1PM', icon: 'Cloud', temp: 59 },
          { time: '2PM', icon: 'CloudRain', temp: 57 },
          { time: '3PM', icon: 'CloudRain', temp: 56 },
          { time: '4PM', icon: 'Cloud', temp: 55 },
          { time: '5PM', icon: 'Moon', temp: 53 },
      ]
  });

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  
  // Pop-out Menu State
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);

  const getAdvice = async (currentWeather: WeatherData) => {
      setIsLoadingAdvice(true);
      setSilasAdvice(null); 
      
      const scheduleText = calendarEvents.map(e => `${e.time}: ${e.title} at ${e.location}`).join(", ");
      
      const prompt = `
          You are 'Silas', an advanced AI integrated into a weather app.
          User: Eloise (Female).
          Context: 
          - Location: ${currentWeather.location}.
          - Current Weather: ${currentWeather.temp}°F, ${currentWeather.condition}. High: ${currentWeather.high}, Low: ${currentWeather.low}.
          - Full Schedule Today: ${scheduleText}.
          
          Give a 1-sentence helpful insight combining the weather and her ACTUAL schedule. 
          Be specific (e.g., mention bringing a jacket for the specific event location, or sunglasses).
      `;
      const response = await generateSmartResponse("Weather Insight", prompt);
      setSilasAdvice(response);
      setIsLoadingAdvice(false);
  };

  const getOutfitRecommendations = async (currentWeather: WeatherData) => {
      if (outfitOptions && activeTab === 'OUTFIT') return; 
      
      setIsLoadingOutfit(true);
      setOutfitOptions(null); 
      
      const wardrobeNames = PURCHASE_HISTORY.map(p => p.name);
      const weatherCtx = `${currentWeather.condition}, ${currentWeather.temp}°F in ${currentWeather.location}`;
      
      try {
          const recommendations = await getFashionAdvice(weatherCtx, wardrobeNames);
          
          const enhancedRecommendations = await Promise.all(recommendations.map(async (opt) => {
              let receipt = undefined;
              if (opt.type === 'WARDROBE' && opt.item) {
                  const historyItem = PURCHASE_HISTORY.find(p => p.name.includes(opt.item) || opt.item.includes(p.name));
                  if (historyItem) {
                      receipt = {
                          store: historyItem.store,
                          date: historyItem.date,
                          price: historyItem.price,
                          orderId: historyItem.orderId
                      };
                  }
              }

              let imageUrl = null;
              if (opt.imagePrompt) {
                  imageUrl = await generateImage(opt.imagePrompt + ", fashion photography style, female subject, no text, realistic lighting");
              }

              return { ...opt, receipt, imageUrl };
          }));

          setOutfitOptions(enhancedRecommendations);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingOutfit(false);
      }
  };

  const handleSearch = async (e?: React.FormEvent, cityOverride?: string) => {
      if (e) e.preventDefault();
      const query = cityOverride || searchQuery;
      if (!query.trim()) return;

      setIsFetchingWeather(true);
      const data = await getWeather(query);
      if (data) {
          setWeather(data);
          
          setSilasAdvice(null);
          setOutfitOptions(null);
          
          getAdvice(data); 
          
          setIsSearchOpen(false);
          setSearchQuery('');
          setIsLocationMenuOpen(false); 
      }
      setIsFetchingWeather(false);
  };

  useEffect(() => {
      setTimeout(() => getAdvice(weather), 1000);
  }, [calendarEvents]); // Trigger when events load

  useEffect(() => {
      if (activeTab === 'OUTFIT') {
          getOutfitRecommendations(weather);
      }
  }, [activeTab, weather]);

  const getIcon = (iconName: string) => {
      switch(iconName) {
          case 'Sun': return Sun;
          case 'CloudRain': return CloudRain;
          case 'CloudSun': return CloudSun;
          case 'Moon': return Moon;
          case 'Cloud': return Cloud;
          default: return Sun;
      }
  };

  // Dynamic Background based on condition
  const getBackground = () => {
      const c = weather.condition.toLowerCase();
      if (c.includes('rain') || c.includes('drizzle') || c.includes('storm')) return 'from-slate-800 to-slate-900';
      if (c.includes('cloud')) return 'from-slate-500 to-slate-700';
      if (c.includes('night') || (c.includes('clear') && weather.hourly[0].time.includes('PM'))) return 'from-[#0f2027] to-[#2c5364]';
      if (c.includes('snow') || c.includes('ice') || c.includes('freez')) return 'from-blue-100 to-white text-slate-800'; 
      if (c.includes('hot') || c.includes('sunny')) return 'from-orange-400 to-yellow-300';
      return 'from-[#4facfe] to-[#00f2fe]'; // Default Sunny
  };

  // Distinct saved locations for demo purposes
  const savedLocations = [
      { city: 'New York', temp: 58, time: '7:42 PM', condition: 'Cloudy' },
      { city: 'Reykjavik', temp: 28, time: '11:42 PM', condition: 'Snow' },
      { city: 'Dubai', temp: 95, time: '3:42 AM', condition: 'Sunny' },
      { city: 'London', temp: 48, time: '12:42 AM', condition: 'Rain' },
  ];

  // Mock Weekly Forecast
  const weeklyForecast = [
      { day: "Today", icon: weather.hourly[0].icon, min: weather.low, max: weather.high },
      { day: "Wed", icon: "Sun", min: 55, max: 68 },
      { day: "Thu", icon: "CloudRain", min: 50, max: 58 },
      { day: "Fri", icon: "CloudSun", min: 52, max: 64 },
      { day: "Sat", icon: "Sun", min: 58, max: 72 },
  ];

  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${getBackground()} z-50 flex flex-col font-sans text-white overflow-hidden transition-colors duration-1000`}>
        
        {/* Background Animation Layers */}
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        
        {/* Header */}
        <div className="pt-14 px-6 flex justify-between items-start z-10 relative">
            <div className="relative">
                <div 
                    className="flex flex-col cursor-pointer active:opacity-50" 
                    onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
                >
                    <h2 className="text-3xl font-semibold drop-shadow-md flex items-center gap-2">
                        {weather.location} 
                        <ChevronDown size={20} className={`opacity-50 transition-transform ${isLocationMenuOpen ? 'rotate-180' : ''}`} />
                    </h2>
                    <div className="flex items-center gap-1 text-sm font-medium opacity-90">
                        <MapPin size={12} /> Current Location
                    </div>
                </div>

                {/* Quick Location Pop-out Menu */}
                <AnimatePresence>
                    {isLocationMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-2 w-56 bg-white/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-2 space-y-1">
                                {savedLocations.map((loc, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSearch(undefined, loc.city)}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex justify-between items-center transition-colors group"
                                    >
                                        <span className="font-bold text-sm">{loc.city}</span>
                                        <span className="text-xs opacity-70 group-hover:opacity-100">{loc.temp}°</span>
                                    </button>
                                ))}
                                <div className="h-[1px] bg-white/10 my-1" />
                                <button 
                                    onClick={() => { setIsLocationMenuOpen(false); setIsSearchOpen(true); }}
                                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-xs font-medium flex items-center gap-2"
                                >
                                    <Search size={12} /> Manage Locations...
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <button onClick={() => setIsSearchOpen(true)} className="p-2 bg-black/10 rounded-full hover:bg-black/20 backdrop-blur-md transition-colors">
                <List size={24} />
            </button>
        </div>

        {/* Main Temperature */}
        <div className="flex flex-col items-center justify-center mt-6 z-10 shrink-0">
            <div className="text-[100px] font-thin leading-none drop-shadow-lg tracking-tighter">
                {Math.round(weather.temp)}°
            </div>
            <div className="text-xl font-medium opacity-90 mb-1">{weather.condition}</div>
            <div className="flex gap-4 text-lg font-medium opacity-80">
                <span>H:{Math.round(weather.high)}°</span>
                <span>L:{Math.round(weather.low)}°</span>
            </div>
        </div>

        {/* Silas Insight Card */}
        <div className="mx-4 mt-6 relative z-20 shrink-0">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-500 opacity-70"></div>
                
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <SilasLogo className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm text-white uppercase tracking-wide">Atmospheric Insight</span>
                    </div>
                    {isLoadingAdvice && <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />}
                </div>

                <AnimatePresence mode="wait">
                    {silasAdvice ? (
                        <motion.div 
                            key="advice"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-[15px] font-medium leading-relaxed text-white drop-shadow-sm"
                        >
                            "{silasAdvice}"
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-12 flex items-center text-sm opacity-70"
                        >
                            Scanning schedule & conditions...
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-4 flex gap-2">
                    <button 
                        onClick={() => setActiveTab('OUTFIT')}
                        className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Shirt size={14} /> Plan Outfit
                    </button>
                    <button 
                        onClick={() => setActiveTab('SCHEDULE')}
                        className="flex-1 bg-white/20 hover:bg-white/30 transition-colors py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                    >
                        <Calendar size={14} /> Check Schedule
                    </button>
                </div>
            </div>
        </div>

        {/* Scrollable Bottom Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar mt-6 px-6 pb-20 z-10 space-y-6">
            
            {/* Hourly Forecast (Centered) */}
            <div className="w-full">
                <div className="flex justify-between items-center w-full max-w-md mx-auto">
                    {weather.hourly.map((h, i) => {
                        const Icon = getIcon(h.icon);
                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-xs font-bold opacity-80">{h.time}</span>
                                <Icon size={24} className="text-yellow-300 drop-shadow-sm my-1" />
                                <span className="text-lg font-bold">{Math.round(h.temp)}°</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Weekly Forecast Summary */}
            <div className="bg-black/20 rounded-3xl p-5 backdrop-blur-md border border-white/5">
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <CalendarDays size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">5-Day Forecast</span>
                </div>
                <div className="space-y-4">
                    {weeklyForecast.map((day, i) => {
                        const Icon = getIcon(day.icon);
                        return (
                            <div key={i} className="flex items-center justify-between">
                                <span className="w-12 font-bold text-sm">{day.day}</span>
                                <Icon size={20} className="text-white opacity-90" />
                                <div className="flex items-center gap-4 w-32">
                                    <span className="text-white/60 text-sm">{day.min}°</span>
                                    <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden relative">
                                        <div className="absolute inset-y-0 left-1 right-1 bg-gradient-to-r from-blue-300 to-yellow-300 rounded-full" />
                                    </div>
                                    <span className="text-white font-bold text-sm">{day.max}°</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- SCHEDULE OVERLAY --- */}
        <AnimatePresence>
            {activeTab === 'SCHEDULE' && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 bg-[#0F0F11]/95 backdrop-blur-2xl z-50 flex flex-col"
                >
                    <div className="pt-14 px-6 pb-2 flex justify-between items-center z-10 border-b border-white/10">
                        <button onClick={() => setActiveTab('FORECAST')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                            <ChevronDown size={24} className="text-white" />
                        </button>
                        <span className="font-bold text-lg tracking-wide uppercase text-white">Today's Schedule</span>
                        <div className="w-10" /> 
                    </div>
                    
                    <div className="p-6 flex-1 overflow-y-auto">
                        <h2 className="text-2xl font-light text-white mb-6">Synced from Calendar</h2>
                        {calendarEvents.length > 0 ? (
                            <div className="space-y-4">
                                {calendarEvents.map((event, i) => (
                                    <div key={i} className="bg-white/10 border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                                        <div className={`w-1 h-full rounded-full ${event.color || 'bg-blue-500'} shrink-0`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-lg text-white">{event.title}</h3>
                                                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">{event.type}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                                                <Clock size={14} />
                                                <span>{event.time} - {event.end}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-400">
                                                <MapPin size={14} />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 mt-20">
                                No events scheduled for today.
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- SEARCH OVERLAY --- */}
        <AnimatePresence>
            {isSearchOpen && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 bg-[#1c1c1e] z-50 flex flex-col"
                >
                    <div className="pt-14 px-4 pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Weather</h2>
                            <button onClick={() => setIsSearchOpen(false)} className="text-blue-500 font-medium">Done</button>
                        </div>
                        
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
                            <input 
                                type="text" 
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city (e.g. Dubai, London)"
                                className="w-full bg-[#2c2c2e] text-white rounded-xl py-2.5 pl-10 pr-4 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {isFetchingWeather && (
                                <div className="absolute right-3 top-3 w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </form>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Saved Locations</div>
                            {savedLocations.map((loc, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => handleSearch(undefined, loc.city)}
                                    className="bg-[#2c2c2e] p-4 rounded-2xl flex justify-between items-center cursor-pointer active:scale-95 transition-transform"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{loc.city}</h3>
                                        <p className="text-sm text-gray-400">{loc.time}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-light text-white">{loc.temp}°</div>
                                        <div className="text-xs text-gray-400">{loc.condition}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- FULL SCREEN OUTFIT OVERLAY --- */}
        <AnimatePresence>
            {activeTab === 'OUTFIT' && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 bg-[#0F0F11]/95 backdrop-blur-2xl z-50 flex flex-col"
                >
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Header */}
                    <div className="pt-14 px-6 pb-2 flex justify-between items-center z-10">
                        <button onClick={() => setActiveTab('FORECAST')} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center active:scale-90 transition-transform">
                            <ChevronDown size={24} className="text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <SilasLogo className="w-6 h-6" />
                            <span className="font-bold text-lg tracking-wide uppercase text-white">Stylist</span>
                        </div>
                        <div className="w-10" /> 
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 z-10 no-scrollbar">
                        
                        {/* Title Section */}
                        <div className="mb-8">
                            <h2 className="text-4xl font-thin text-white leading-tight">
                                Weather Ready <br />
                                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Fits for {weather.location}</span>
                            </h2>
                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1"><CloudRain size={14} /> {weather.condition}</span>
                                <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                <span>{Math.round(weather.temp)}°F</span>
                            </div>
                        </div>

                        {/* Silas Generated Content */}
                        {isLoadingOutfit ? (
                            <div className="h-60 flex flex-col items-center justify-center gap-4">
                                <Sparkles className="w-10 h-10 text-purple-400 animate-spin" />
                                <span className="text-xs text-purple-300 font-medium tracking-widest animate-pulse">GENERATING LOOKS FOR {weather.location.toUpperCase()}...</span>
                            </div>
                        ) : (
                            <div className="space-y-8 pb-20">
                                {outfitOptions?.map((opt, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`rounded-[2rem] overflow-hidden relative group border ${
                                            opt.type === 'WARDROBE' ? 'border-purple-500/50 bg-[#1a1a1a]' : 'border-white/10 bg-[#1a1a1a]'
                                        }`}
                                    >
                                        {/* Image Section */}
                                        <div className="h-64 w-full bg-gray-800 relative overflow-hidden">
                                            {opt.imageUrl ? (
                                                <img src={opt.imageUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                                    <Sparkles className="text-white/20" size={40} />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                            
                                            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-widest">
                                                {opt.type === 'WARDROBE' ? 'OWNED' : opt.type === 'VIBE' ? 'AESTHETIC' : 'ESSENTIAL'}
                                            </div>
                                        </div>

                                        <div className="p-5 relative -mt-10">
                                            <h3 className="text-2xl font-bold text-white leading-tight mb-2 drop-shadow-md">{opt.title}</h3>
                                            <p className="text-sm text-gray-300 leading-relaxed font-light mb-4">
                                                {opt.description}
                                            </p>

                                            {/* EVIDENCE CARD (Only for Wardrobe Items) */}
                                            {opt.receipt && (
                                                <div className="mt-4 bg-white rounded-xl p-4 shadow-lg transform rotate-1 border border-gray-200">
                                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                            <Mail className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Receipt Found</div>
                                                            <div className="text-sm font-bold text-black">{opt.receipt.store}</div>
                                                        </div>
                                                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Item</span>
                                                            <span className="font-medium text-black">{opt.item}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Date</span>
                                                            <span className="font-medium text-black">{opt.receipt.date}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Order ID</span>
                                                            <span className="font-medium text-black font-mono">{opt.receipt.orderId}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-2">
                                                            <span>Total</span>
                                                            <span>{opt.receipt.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex gap-2 mt-4">
                                                {opt.tags.map((tag, t) => (
                                                    <span key={t} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-gray-400 border border-white/5">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 pt-0 z-20 absolute bottom-0 w-full bg-gradient-to-t from-[#0F0F11] to-transparent pb-8">
                        <button 
                            onClick={() => setActiveTab('FORECAST')}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl shadow-xl active:scale-95 transition-transform"
                        >
                            Back to Forecast
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-white/50 rounded-full active:bg-white transition-colors" />
        </div>
    </div>
  );
};
