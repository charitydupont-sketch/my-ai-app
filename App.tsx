import React, { useState, useEffect } from 'react';
import { OSType } from './types';
import { IOSHome } from './components/IOSHome';
import { AndroidHome } from './components/AndroidHome';
import { RetroHome } from './components/RetroHome';
import { BrickHome } from './components/BrickHome';
import { PDAHome } from './components/PDAHome';
import { BlackberryHome } from './components/BlackberryHome';
import { RotaryHome } from './components/RotaryHome';
import { StatusBar } from './components/StatusBar';
import { LockScreen } from './components/LockScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const App = () => {
  const [currentOS, setCurrentOS] = useState<OSType>(OSType.IOS);
  const [isLocked, setIsLocked] = useState(true);

  // Auto-lock when switching OS to IOS for "realism" effect initially
  useEffect(() => {
    if (currentOS === OSType.IOS) {
        // Optional: setIsLocked(true); 
    }
  }, [currentOS]);


  const renderOS = () => {
    switch (currentOS) {
      case OSType.ANDROID:
        return <AndroidHome onSwitchOS={setCurrentOS} />;
      case OSType.RETRO:
        return <RetroHome onSwitchOS={setCurrentOS} />;
      case OSType.BRICK:
        return <BrickHome onSwitchOS={setCurrentOS} />;
      case OSType.PDA:
        return <PDAHome onSwitchOS={setCurrentOS} />;
      case OSType.BLACKBERRY:
        return <BlackberryHome onSwitchOS={setCurrentOS} />;
      case OSType.ROTARY:
        return <RotaryHome onSwitchOS={setCurrentOS} />;
      case OSType.CYBER:
        return <AndroidHome onSwitchOS={setCurrentOS} />; 
      case OSType.IOS:
      default:
        return <IOSHome onSwitchOS={setCurrentOS} />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#1a1a1a] p-4 font-sans overflow-hidden">
      
      {/* Phone Frame - SCALES TO FIT SCREEN */}
      <motion.div 
        className="relative bg-black rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-[6px] md:border-[8px] border-black overflow-hidden ring-4 ring-black/50"
        style={{
            height: 'min(95vh, 850px)',
            aspectRatio: '9/19.5',
            width: 'auto',
            maxWidth: '100%'
        }}
      >
        {/* Hardware Buttons (Visual Only) */}
        <div className="absolute -left-[9px] top-24 w-[3px] h-8 bg-[#222] rounded-l-md"></div>
        <div className="absolute -left-[9px] top-36 w-[3px] h-14 bg-[#222] rounded-l-md"></div>
        <div className="absolute -right-[9px] top-32 w-[3px] h-20 bg-[#222] rounded-r-md"></div>

        {/* Dynamic Island Area */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[30%] h-[3.5%] bg-black rounded-full z-[60] pointer-events-none"></div>

        {/* Status Bar Layer - HIDDEN FOR IOS (Managed by IOSHome) */}
        {currentOS !== OSType.IOS && currentOS !== OSType.PDA && currentOS !== OSType.ROTARY && (
            <div className="absolute top-0 left-0 w-full z-50 pointer-events-none">
                <StatusBar os={currentOS} />
            </div>
        )}

        {/* Global Back/Exit Button for Simulations */}
        <AnimatePresence>
          {currentOS !== OSType.IOS && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setCurrentOS(OSType.IOS)}
              className="absolute top-12 left-4 z-[70] bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-xs font-medium hover:bg-white/30 transition-colors shadow-lg"
            >
              <ChevronLeft size={14} />
              Back to iPhone
            </motion.button>
          )}
        </AnimatePresence>

        {/* Lock Screen Layer */}
        <AnimatePresence>
            {isLocked && currentOS === OSType.IOS && (
                <LockScreen onUnlock={() => setIsLocked(false)} />
            )}
        </AnimatePresence>

        {/* OS Content Layer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOS}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full bg-black"
          >
            {renderOS()}
          </motion.div>
        </AnimatePresence>
        
        {/* Home Indicator - Acts as Home Button (Hidden in IOS mode to let apps handle it) */}
        {currentOS !== OSType.IOS && (
            <div 
                onClick={() => setCurrentOS(OSType.IOS)}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-white rounded-full z-[80] cursor-pointer hover:scale-110 transition-transform active:scale-95 mix-blend-difference opacity-80" 
            />
        )}

      </motion.div>

      {/* Disclaimer / Info - Moved to stay out of way */}
      <div className="fixed bottom-2 right-2 text-white/20 text-[10px] text-right hidden md:block pointer-events-none">
        <p>Try Me OS</p>
      </div>
    </div>
  );
};

export default App;