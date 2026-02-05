
import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';
import { OSType } from '../types';

interface StatusBarProps {
  os: OSType;
  color?: 'white' | 'black';
  isLockScreen?: boolean;
  showLock?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ os, color = 'white', isLockScreen = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (os === OSType.RETRO) {
    return (
      <div className="w-full px-4 py-1 flex justify-between items-center bg-transparent text-[#333] font-retro text-xl border-b border-[#99aa99] opacity-70">
        <div className="flex gap-1">
          <span>SIGNAL</span>
          <span>|||||</span>
        </div>
        <div>{formatTime(time)}</div>
        <div className="flex gap-1">
          <span>BAT</span>
          <span>[III]</span>
        </div>
      </div>
    );
  }

  const isAndroid = os === OSType.ANDROID;
  const textColor = color === 'black' ? 'text-black' : 'text-white';
  const fillColor = color === 'black' ? 'black' : 'white';

  return (
    <div className={`w-full px-6 pt-3 pb-2 flex justify-between items-center text-xs font-medium z-50 transition-colors duration-300 ${isAndroid ? 'text-white pt-3' : textColor} overflow-visible`}>
      <div className="flex items-center gap-1 w-1/3 pl-2">
        {isLockScreen ? (
            <span className="text-[13px] font-semibold tracking-wide">Verizon</span>
        ) : (
            <span className="text-[13px] font-semibold tracking-wide">{formatTime(time)}</span>
        )}
        {isAndroid && <span className="text-xs opacity-80 ml-2">Tue, Jan 24</span>}
      </div>
      
      {!isAndroid && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[11px] z-50 pointer-events-none">
           {/* Dynamic Island - Thinner pill */}
           <div className="w-[90px] h-[24px] bg-black rounded-[20px] shadow-sm flex items-center justify-start px-3">
              {isLockScreen && (
                  <img 
                      src="https://img.icons8.com/?size=100&id=59825&format=png&color=FFFFFF" 
                      alt="Locked" 
                      className="w-3 h-3"
                  />
              )}
           </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 w-1/3 pr-2">
        <Signal size={16} className={isAndroid ? "fill-white" : "fill-current"} strokeWidth={2} />
        <Wifi size={16} strokeWidth={2.5} />
        <Battery size={22} className={isAndroid ? "rotate-90" : ""} fill={fillColor} strokeWidth={2} />
      </div>
    </div>
  );
};
