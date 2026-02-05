import React, { useState } from 'react';
import { Signal, Battery, Menu, Phone } from 'lucide-react';
import { OSType } from '../types';

interface BrickHomeProps {
  onSwitchOS: (os: OSType) => void;
}

export const BrickHome: React.FC<BrickHomeProps> = ({ onSwitchOS }) => {
  const [menuIndex, setMenuIndex] = useState(0);
  const menuItems = ['Contacts', 'Messages', 'Call Log', 'Settings', 'Snake II', 'EXIT'];

  const handleNav = (dir: 'UP' | 'DOWN') => {
    if (dir === 'UP') setMenuIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
    if (dir === 'DOWN') setMenuIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
  };

  const handleSelect = () => {
    if (menuItems[menuIndex] === 'EXIT') {
        onSwitchOS(OSType.IOS);
    }
  };

  return (
    <div className="h-full w-full bg-[#333] flex flex-col items-center justify-center py-12 font-mono select-none relative">
       
       {/* Background Pattern */}
       <div className="absolute inset-0 bg-[#222] opacity-50 z-0">
          <div className="w-full h-full opacity-10 bg-[radial-gradient(circle,_#555_1px,_transparent_1px)] bg-[length:20px_20px]"></div>
       </div>

       <div className="relative z-10 w-full px-8 flex flex-col items-center gap-6 scale-90 sm:scale-100">
           {/* Screen Area */}
           <div className="w-full bg-[#9ea786] border-4 border-[#111] rounded-lg h-48 shadow-[inset_0_0_20px_rgba(0,0,0,0.2)] p-3 flex flex-col relative overflow-hidden">
                {/* Pixels Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />
                
                <div className="flex justify-between border-b-2 border-[#4a5238] pb-1 mb-2 text-[#222] opacity-80 font-bold text-xs">
                    <div className="flex"><Signal size={12} /> <Signal size={12} className="-ml-2" /></div>
                    <Battery size={14} />
                </div>

                <div className="flex-1 flex flex-col items-center justify-center z-0">
                    <span className="text-xs uppercase font-bold mb-1 tracking-widest text-[#444]">Menu</span>
                    <div className="text-xl font-bold tracking-widest text-[#111] bg-[#8d9675] px-6 py-2 border-2 border-[#4a5238] shadow-sm">
                        {menuItems[menuIndex]}
                    </div>
                     <div className="mt-2 text-[10px] text-[#444] animate-pulse">Select</div>
                </div>
           </div>

           {/* Logo */}
           <div className="text-gray-500 font-bold tracking-[0.3em] text-sm">NOKIA</div>

           {/* Keypad Layout */}
           <div className="w-full flex flex-col gap-4">
              {/* Nav Buttons */}
              <div className="flex justify-between items-end px-1">
                 <button onClick={() => handleSelect()} className="w-20 h-10 bg-gray-200 rounded-t-lg border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 text-xs font-bold shadow-md">OK</button>
                 
                 {/* D-Padish */}
                 <div className="flex flex-col gap-1">
                     <button onClick={() => handleNav('UP')} className="w-14 h-8 bg-gray-200 rounded-t-full border-b-2 border-gray-400 active:translate-y-0.5 text-[10px] flex items-center justify-center">▲</button>
                     <button onClick={() => handleNav('DOWN')} className="w-14 h-8 bg-gray-200 rounded-b-full border-b-2 border-gray-400 active:translate-y-0.5 text-[10px] flex items-center justify-center">▼</button>
                 </div>

                 <button onClick={() => onSwitchOS(OSType.IOS)} className="w-20 h-10 bg-gray-200 rounded-t-lg border-b-4 border-gray-400 active:border-b-0 active:translate-y-1 text-xs font-bold shadow-md">Back</button>
              </div>

              {/* Num Pad */}
              <div className="grid grid-cols-3 gap-3 mt-2">
                 {['1','2 abc','3 def','4 ghi','5 jkl','6 mno','7 pqrs','8 tuv','9 wxyz','*','0','_'].map((k, i) => (
                     <button key={i} className="h-12 bg-[#e0e0e0] rounded-2xl shadow-[0_4px_0_#999] active:shadow-none active:translate-y-[4px] flex flex-col items-center justify-center group border border-gray-300">
                        <span className="text-lg font-bold text-gray-800 leading-none">{k.split(' ')[0]}</span>
                        <span className="text-[9px] font-bold text-gray-500 leading-none mt-0.5">{k.split(' ')[1] || ''}</span>
                     </button>
                 ))}
              </div>
           </div>
       </div>
    </div>
  );
};