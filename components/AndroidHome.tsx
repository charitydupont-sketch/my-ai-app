import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mic, Chrome, Camera, Mail, Phone, MessageSquare, ArrowLeft, MoreVertical, LayoutGrid, CloudSun, Grid3X3 } from 'lucide-react';
import { OSType } from '../types';
import { generateSmartResponse } from '../services/geminiService';

interface AndroidHomeProps {
  onSwitchOS: (os: OSType) => void;
}

// Custom 3x3 Dot Grid Icon for App Drawer
const AppDrawerIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="4" cy="4" r="2" />
    <circle cx="12" cy="4" r="2" />
    <circle cx="20" cy="4" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="20" cy="12" r="2" />
    <circle cx="4" cy="20" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="20" cy="20" r="2" />
  </svg>
);

export const AndroidHome: React.FC<AndroidHomeProps> = ({ onSwitchOS }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantReply, setAssistantReply] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const reply = await generateSmartResponse(searchQuery, "User is using the search bar widget on an Android home screen simulation.");
    setAssistantReply(reply);
    setIsSearching(false);
    // Auto clear after 5s
    setTimeout(() => setAssistantReply(null), 8000);
  };

  return (
    <div className="h-full w-full bg-[url('https://picsum.photos/id/160/1000/2000')] bg-cover bg-center text-white font-roboto flex flex-col relative">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 px-4 pt-16 flex flex-col">
        
        {/* Date Widget */}
        <div className="mt-8 mb-6">
          <div className="text-6xl font-thin tracking-tighter opacity-90">10:24</div>
          <div className="text-lg opacity-80 flex items-center gap-2">
            <CloudSun size={20} />
            <span>72°F • Thu, Jan 1</span>
          </div>
        </div>

        {/* Search Widget (Interactive) */}
        <div className="bg-[#f0f4f8] rounded-full p-1 pl-4 flex items-center shadow-lg text-gray-800 mb-8 transition-all focus-within:ring-2 ring-blue-400">
          <Search size={20} className="text-gray-500 mr-3" />
          <form onSubmit={handleSearch} className="flex-1">
             <input 
              type="text" 
              placeholder="Ask Assistant..." 
              className="w-full bg-transparent outline-none text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          {assistantReply && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-4 right-4 mt-2 p-3 bg-white rounded-xl shadow-xl z-50 text-sm text-gray-800 border border-gray-100"
            >
              <span className="font-bold text-blue-600">Gemini:</span> {isSearching ? 'Thinking...' : assistantReply}
            </motion.div>
          )}
          <div className="p-2">
            <Mic size={20} className="text-blue-500" />
          </div>
        </div>

        {/* Loose Grid Icons */}
        <div className="grid grid-cols-4 gap-6 gap-y-8 mt-auto mb-8">
          {[
            { n: 'Gmail', i: Mail, c: 'bg-red-100 text-red-600' },
            { n: 'Maps', i: LayoutGrid, c: 'bg-green-100 text-green-600' },
            { n: 'Photos', i: Camera, c: 'bg-yellow-100 text-yellow-600' },
            { n: 'Chrome', i: Chrome, c: 'bg-white text-blue-500' },
            { n: 'Return', i: ArrowLeft, c: 'bg-black text-white', action: () => onSwitchOS(OSType.IOS) },
          ].map((app, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1 group" onClick={app.action}>
               <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${app.c} transform transition-transform group-active:scale-90`}>
                 <app.i size={24} />
               </div>
               <span className="text-xs text-shadow-sm font-medium">{app.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dock / Hotseat */}
      <div className="h-24 px-4 pb-6 relative z-10 flex justify-between items-end">
        {[
          { i: Phone, c: 'bg-blue-100 text-blue-600' },
          { i: MessageSquare, c: 'bg-blue-100 text-blue-600' },
          { i: AppDrawerIcon, c: 'bg-white text-gray-600' }, // Custom 9-dot grid icon
          { i: Chrome, c: 'bg-gray-100 text-green-600' },
          { i: Camera, c: 'bg-orange-100 text-orange-600' },
        ].map((item, idx) => (
           <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${item.c}`}>
              <item.i size={20} />
           </div>
        ))}
      </div>

      {/* Android Nav Bar */}
      <div className="h-12 bg-black/10 backdrop-blur-sm flex justify-around items-center text-white/80">
        <ArrowLeft size={20} />
        <div className="w-4 h-4 rounded-full border-2 border-white/80"></div>
        <div className="w-4 h-4 rounded-sm border-2 border-white/80"></div>
      </div>
    </div>
  );
};