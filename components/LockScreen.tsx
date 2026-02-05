
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Flashlight, Camera } from 'lucide-react';
import { StatusBar } from './StatusBar';
import { OSType } from '../types';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());
  const controls = useAnimation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.y < -150) {
      controls.start({ y: -1000, opacity: 0 }).then(onUnlock);
    } else {
      controls.start({ y: 0, opacity: 1 });
    }
  };

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes}`;
  };

  const formatDate = (date: Date) => {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[100] bg-black text-white overflow-hidden flex flex-col items-center"
      style={{
        backgroundImage: `url('https://i.postimg.cc/kXgL18YZ/IMG-0402.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Dim Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Status Bar */}
      <div className="absolute top-0 left-0 w-full z-50">
          <StatusBar os={OSType.IOS} isLockScreen={true} color="white" />
      </div>

      {/* Time & Date */}
      <div className="mt-20 flex flex-col items-center relative z-10 w-full text-center">
        <div className="text-xl font-medium text-white/90 drop-shadow-md mb-2">
          {formatDate(time)}
        </div>
        <div className="text-[6rem] font-bold leading-none tracking-tight font-roboto text-white drop-shadow-lg">
          {formatTime(time)}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="mt-auto w-full px-12 pb-12 flex justify-between items-end relative z-10">
        <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:bg-white/20 transition-colors">
          <Flashlight size={20} className="text-white" />
        </button>
        
        <motion.div 
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          className="flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing mb-2"
        >
           <span className="text-xs font-semibold opacity-60 tracking-wide">Swipe up to open</span>
           <div className="w-32 h-1 bg-white rounded-full opacity-80" />
        </motion.div>

        <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center active:bg-white/20 transition-colors">
          <Camera size={20} className="text-white" />
        </button>
      </div>
    </motion.div>
  );
};
