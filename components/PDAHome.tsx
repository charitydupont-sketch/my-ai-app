import React, { useState } from 'react';
import { Edit2, Calendar, Clock, List, Calculator, XCircle } from 'lucide-react';
import { OSType } from '../types';

interface PDAHomeProps {
  onSwitchOS: (os: OSType) => void;
}

export const PDAHome: React.FC<PDAHomeProps> = ({ onSwitchOS }) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);

  const apps = [
    { name: 'Memo Pad', icon: Edit2 },
    { name: 'Date Book', icon: Calendar },
    { name: 'ToDo List', icon: List },
    { name: 'Calc', icon: Calculator },
    { name: 'Clock', icon: Clock },
    { name: 'Exit', icon: XCircle, action: () => onSwitchOS(OSType.IOS) },
  ];

  return (
    <div className="h-full w-full bg-[#9ea990] flex flex-col font-mono select-none relative overflow-hidden">
      {/* Backlight effect */}
      <div className="absolute inset-0 bg-[#00ff00] opacity-5 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pixel-weave.png')] opacity-20 pointer-events-none"></div>

      {/* Status Bar */}
      <div className="flex justify-between items-center p-2 border-b-2 border-[#555] bg-[#8d9980] text-[#222] text-xs font-bold">
        <span>10:24 am</span>
        <span>BAT [====]</span>
      </div>

      {/* Main Area */}
      <div className="flex-1 p-4 grid grid-cols-3 gap-4 content-start">
        {apps.map((app) => (
          <div 
            key={app.name} 
            onClick={app.action || (() => setActiveApp(app.name))}
            className="flex flex-col items-center gap-1 active:invert transition-all cursor-pointer"
          >
            <div className="w-12 h-12 border-2 border-[#222] rounded-md flex items-center justify-center bg-[#9ea990] shadow-sm">
              <app.icon size={24} className="text-[#222]" />
            </div>
            <span className="text-[10px] font-bold text-[#222] uppercase">{app.name}</span>
          </div>
        ))}
      </div>

      {/* Simulated Graffiti Area (Bottom) */}
      <div className="h-1/4 border-t-2 border-[#555] bg-[#8d9980] flex relative">
         <div className="w-1/3 border-r border-[#777] flex items-center justify-center opacity-30">
            <span className="text-4xl text-[#222] font-serif italic">abc</span>
         </div>
         <div className="w-1/3 flex items-center justify-center opacity-30">
            <span className="text-4xl text-[#222] font-serif">123</span>
         </div>
         <div className="w-1/3 border-l border-[#777] flex flex-col items-center justify-center gap-2">
            <button className="p-2 border border-[#444] rounded-full bg-[#808c75] active:bg-[#222] active:text-[#9ea990]" onClick={() => onSwitchOS(OSType.IOS)}>
                <span className="text-[9px] font-bold">HOME</span>
            </button>
            <button className="p-2 border border-[#444] rounded-full bg-[#808c75] active:bg-[#222] active:text-[#9ea990]">
                <span className="text-[9px] font-bold">FIND</span>
            </button>
         </div>
      </div>

      {/* App Popup */}
      {activeApp && (
        <div className="absolute inset-4 bg-[#eef5e5] border-2 border-[#222] shadow-[4px_4px_0px_#222] z-50 flex flex-col p-2">
            <div className="flex justify-between border-b-2 border-[#222] pb-2 mb-2">
                <span className="font-bold">{activeApp}</span>
                <XCircle size={16} className="cursor-pointer" onClick={() => setActiveApp(null)} />
            </div>
            <div className="flex-1 flex items-center justify-center text-center text-sm">
                (Simulated App)<br/>tap X to close
            </div>
        </div>
      )}
    </div>
  );
};