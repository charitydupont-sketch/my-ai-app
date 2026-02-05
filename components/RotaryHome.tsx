import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowLeft } from 'lucide-react';
import { OSType } from '../types';

interface RotaryHomeProps {
  onSwitchOS: (os: OSType) => void;
}

export const RotaryHome: React.FC<RotaryHomeProps> = ({ onSwitchOS }) => {
  const [dialedNumber, setDialedNumber] = useState("");
  const [isDialing, setIsDialing] = useState(false);

  const handleDial = (num: string) => {
    if (isDialing) return;
    setIsDialing(true);
    // Simulate dial rotation time
    setTimeout(() => {
        setDialedNumber(prev => prev + num);
        setIsDialing(false);
    }, 800);
  };

  const handleCall = () => {
    if (dialedNumber.length > 0) {
        setDialedNumber("Calling...");
        setTimeout(() => setDialedNumber(""), 3000);
    }
  };

  return (
    <div className="h-full w-full bg-[#e8dcc0] flex flex-col items-center py-8 relative overflow-hidden">
       {/* Texture */}
       <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/felt.png')] pointer-events-none" />

       {/* Exit Button */}
       <button onClick={() => onSwitchOS(OSType.IOS)} className="absolute top-4 left-4 p-2 bg-[#d4c5a3] rounded-full shadow-md text-[#5d4037] z-20">
          <ArrowLeft size={20} />
       </button>

       {/* Top: Receiver Holder / Number Card */}
       <div className="mt-8 mb-4 w-32 h-32 bg-white rounded-full border-4 border-[#d4c5a3] shadow-inner flex items-center justify-center relative">
          <div className="text-center font-serif text-[#5d4037]">
              <div className="text-xs uppercase font-bold opacity-50">Your Number</div>
              <div className="text-lg font-bold tracking-widest">{dialedNumber || "READY"}</div>
          </div>
       </div>

       {/* The Dial */}
       <div className="relative w-64 h-64 rounded-full bg-transparent flex items-center justify-center mt-auto mb-12">
            
            {/* Base Plate */}
            <div className="absolute inset-0 rounded-full bg-[#333] shadow-2xl border-4 border-[#111]" />
            
            {/* Center Info */}
            <div className="absolute inset-[30%] rounded-full bg-white border border-gray-300 z-10 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-[10px] font-bold text-gray-400">EMERGENCY</div>
                    <div className="text-xl font-bold text-red-600">911</div>
                </div>
            </div>

            {/* Finger Stopper */}
            <div className="absolute bottom-4 right-10 w-4 h-8 bg-metal-gradient rounded-full z-20 shadow-lg bg-gradient-to-r from-gray-200 to-gray-400 transform rotate-12" />

            {/* Holes and Numbers */}
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num, i) => {
                const angle = 60 + (i * 30); // Distribution
                // Simple CSS rotation simulation for visual placement
                return (
                    <motion.div
                        key={num}
                        className="absolute w-full h-full pointer-events-none"
                        style={{ rotate: `${angle}deg` }}
                    >
                        <div 
                            className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#e8dcc0]/10 border-2 border-white/20 cursor-pointer pointer-events-auto active:bg-white/20 transition-colors flex items-center justify-center"
                            onClick={() => handleDial(num)}
                        >
                            <span 
                                className="text-white font-bold text-xl drop-shadow-md" 
                                style={{ transform: `rotate(-${angle}deg)` }}
                            >
                                {num}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
       </div>

       {/* Call Button (Simulated Receiver Lift) */}
       <button 
        onClick={handleCall}
        className="mb-8 px-8 py-3 bg-[#5d4037] text-[#e8dcc0] rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2"
       >
           <Phone size={20} />
           PICK UP RECEIVER
       </button>

    </div>
  );
};