import React, { useState } from 'react';
import { Mail, Phone, Calendar, Globe, MessageSquare, Briefcase, Bell } from 'lucide-react';
import { OSType } from '../types';

interface BlackberryHomeProps {
  onSwitchOS: (os: OSType) => void;
}

export const BlackberryHome: React.FC<BlackberryHomeProps> = ({ onSwitchOS }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastAction, setLastAction] = useState("");

  const apps = [
    { name: 'Messages', icon: MessageSquare },
    { name: 'Phone', icon: Phone },
    { name: 'Address Book', icon: Briefcase },
    { name: 'Calendar', icon: Calendar },
    { name: 'Browser', icon: Globe },
    { name: 'Mail', icon: Mail },
    { name: 'Profiles', icon: Bell },
    { name: 'Exit', icon: null } // Special case
  ];

  const handleScroll = (dir: number) => {
    let next = selectedIndex + dir;
    if (next < 0) next = apps.length - 1;
    if (next >= apps.length) next = 0;
    setSelectedIndex(next);
  };

  const handleClick = () => {
    const app = apps[selectedIndex];
    if (app.name === 'Exit') {
        onSwitchOS(OSType.IOS);
    } else {
        setLastAction(`Opening ${app.name}...`);
        setTimeout(() => setLastAction(""), 2000);
        if (app.name === 'Phone') {
            setLastAction("Dialing...");
        }
    }
  };

  return (
    <div className="h-full w-full bg-[#111] flex flex-col items-center py-4 font-sans relative overflow-hidden">
      
      {/* Top Speaker */}
      <div className="w-16 h-2 rounded-full bg-[#333] mb-4 border border-[#444] opacity-50"></div>

      {/* Screen */}
      <div className="w-[90%] aspect-[4/3] bg-[#f0f8ff] rounded-md border-2 border-[#444] overflow-hidden flex flex-col relative shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]">
         {/* Status Bar */}
         <div className="bg-blue-900 text-white text-[10px] px-1 py-0.5 flex justify-between font-bold">
            <span>EDGE</span>
            <span>10:24 AM</span>
            <span>100%</span>
         </div>

         {/* Main Content */}
         <div className="flex-1 p-2 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]">
            <div className="flex gap-2 items-center mb-4">
               <div className="text-xs font-bold text-gray-700">Tue, Oct 24</div>
               <Mail size={12} className="text-gray-500" />
            </div>

            <div className="grid grid-cols-4 gap-2">
                {apps.map((app, i) => (
                    <div key={i} className={`flex flex-col items-center p-1 rounded ${selectedIndex === i ? 'bg-blue-200 outline outline-1 outline-blue-500' : ''}`}>
                        {app.icon ? <app.icon size={20} className="text-gray-800" /> : <div className="w-5 h-5 bg-red-600 rounded-sm flex items-center justify-center text-[8px] text-white font-bold">X</div>}
                        <span className="text-[8px] mt-1 text-center leading-none truncate w-full text-gray-800">{app.name}</span>
                    </div>
                ))}
            </div>

            {/* Action Popup */}
            {lastAction && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="bg-white px-4 py-2 border border-gray-400 shadow-lg text-xs font-bold">
                        {lastAction}
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* Branding */}
      <div className="text-gray-500 font-bold tracking-widest text-[10px] mt-1 mb-2">BlackBerry</div>

      {/* Navigation Bar (Trackball area) */}
      <div className="w-full px-4 flex justify-between items-center mb-2">
         <button className="w-10 h-8 bg-[#222] rounded-md border-b-2 border-[#444] flex items-center justify-center active:translate-y-0.5">
             <Phone size={14} className="text-green-500" />
         </button>
         <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-8 bg-[#222] rounded-md border-b-2 border-[#444] flex items-center justify-center active:translate-y-0.5">
             <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                 {[1,2,3,4,5,6,7].map(i => <div key={i} className="bg-white rounded-[1px]" />)}
             </div>
         </button>
         
         {/* Trackball */}
         <div className="w-12 h-12 bg-[#222] rounded-full border border-[#444] flex items-center justify-center relative">
             <button onClick={handleClick} className="w-8 h-8 rounded-full bg-[#ddd] shadow-[inset_0_-2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center active:bg-blue-200 cursor-pointer z-10">
                 <div className="w-full h-full opacity-50 bg-[radial-gradient(circle,_#999_1px,_transparent_1px)] bg-[length:4px_4px]" />
             </button>
             {/* Virtual Arrows for nav */}
             <button onClick={() => handleScroll(-1)} className="absolute left-0 top-0 bottom-0 w-4 z-0 hover:bg-white/10" />
             <button onClick={() => handleScroll(1)} className="absolute right-0 top-0 bottom-0 w-4 z-0 hover:bg-white/10" />
         </div>

         <button onClick={() => onSwitchOS(OSType.IOS)} className="w-10 h-8 bg-[#222] rounded-md border-b-2 border-[#444] flex items-center justify-center active:translate-y-0.5">
             <div className="text-white text-xs font-bold">↩</div>
         </button>
         <button className="w-10 h-8 bg-[#222] rounded-md border-b-2 border-[#444] flex items-center justify-center active:translate-y-0.5">
             <Phone size={14} className="text-red-500 rotate-[135deg]" />
         </button>
      </div>

      {/* Keyboard */}
      <div className="flex-1 w-full px-4 grid grid-cols-10 gap-[2px] content-start">
         {['Q','W','E','R','T','Y','U','I','O','P',
           'A','S','D','F','G','H','J','K','L','del',
           'alt','Z','X','C','V','B','N','M','$','ent'
          ].map((key, i) => (
             <button 
                key={i} 
                className={`h-6 rounded-[2px] bg-black border-t border-l border-gray-700 shadow-[2px_2px_0_#111] active:translate-y-[1px] active:shadow-none flex items-center justify-center group ${key === 'space' ? 'col-span-4' : ''}`}
             >
                 <span className="text-[8px] font-bold text-white group-active:text-blue-400">{key.toUpperCase()}</span>
             </button>
         ))}
         {/* Spacebar Row */}
         <div className="col-span-10 flex justify-center mt-1">
             <button className="w-1/2 h-6 bg-black border border-gray-700 rounded-sm shadow-sm active:translate-y-0.5"></button>
         </div>
      </div>

    </div>
  );
};