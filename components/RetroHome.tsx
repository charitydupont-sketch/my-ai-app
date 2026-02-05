import React, { useState } from 'react';
import { Battery, Signal, Phone, User, MessageSquare, Menu, Delete, Hash } from 'lucide-react';
import { OSType } from '../types';

interface RetroHomeProps {
  onSwitchOS: (os: OSType) => void;
}

export const RetroHome: React.FC<RetroHomeProps> = ({ onSwitchOS }) => {
  const [screenText, setScreenText] = useState('Ready');
  const [typedNumber, setTypedNumber] = useState('');

  const handleKeyPress = (key: string) => {
    // Basic interaction simulation
    if (key === 'BACK') {
        onSwitchOS(OSType.IOS);
        return;
    }
    if (key === 'CLR') {
        setTypedNumber(prev => prev.slice(0, -1));
        return;
    }
    
    setTypedNumber(prev => (prev + key).slice(0, 12));
    setScreenText('Dialing...');
  };

  return (
    <div className="h-full w-full bg-[#2a2a2a] flex flex-col p-4 gap-4 select-none">
      
      {/* Top Half: The Screen */}
      <div className="flex-1 bg-[#8b9bb4] rounded-xl border-8 border-[#555] shadow-inner relative overflow-hidden flex flex-col">
        {/* LCD Grain/Grid effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] bg-[length:4px_4px]" />
        
        {/* Screen Content */}
        <div className="flex-1 p-4 font-retro text-[#222] flex flex-col justify-between z-10">
          <div className="flex justify-between text-lg border-b border-[#222]/20 pb-1">
             <div className="flex items-center gap-1"><Signal size={16} /> T-Mobile</div>
             <div className="flex items-center gap-1"><Battery size={16} /></div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {typedNumber ? (
                 <div className="text-4xl tracking-widest">{typedNumber}</div>
            ) : (
                <>
                    <div className="text-5xl mb-2">12:34</div>
                    <div className="text-xl opacity-75">Oct 24, 2004</div>
                </>
            )}
            <div className="mt-4 text-xl animate-pulse">{typedNumber ? 'Calling...' : screenText}</div>
          </div>

          <div className="flex justify-between text-lg pt-2 border-t border-[#222]/20">
            <span>Menu</span>
            <span>Contacts</span>
          </div>
        </div>
      </div>

      {/* Hinge */}
      <div className="h-8 bg-gradient-to-b from-[#444] to-[#222] rounded-lg mx-2 shadow-lg flex items-center justify-center border-t border-b border-[#111]">
         <div className="w-1/2 h-full border-l border-r border-[#666] opacity-30"></div>
      </div>

      {/* Bottom Half: Keypad */}
      <div className="h-1/2 bg-[#d1d5db] rounded-t-xl rounded-b-[3rem] p-4 pt-6 shadow-2xl border-4 border-[#999] relative">
        
        {/* Navigation Keys */}
        <div className="flex justify-between items-center mb-6 px-2">
            <button className="w-16 h-10 bg-gray-300 rounded-lg shadow-[0_4px_0_#999] active:shadow-none active:translate-y-1 text-xs font-bold font-sans" onClick={() => handleKeyPress('MENU')}>-</button>
            <div className="w-16 h-16 rounded-full bg-gray-300 shadow-[0_4px_0_#999] flex items-center justify-center border-2 border-gray-400">
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <button className="w-16 h-10 bg-gray-300 rounded-lg shadow-[0_4px_0_#999] active:shadow-none active:translate-y-1 text-xs font-bold font-sans" onClick={() => handleKeyPress('BACK')}>EXIT</button>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3">
            {[
                {k: '1', s: ''}, {k: '2', s: 'abc'}, {k: '3', s: 'def'},
                {k: '4', s: 'ghi'}, {k: '5', s: 'jkl'}, {k: '6', s: 'mno'},
                {k: '7', s: 'pqrs'}, {k: '8', s: 'tuv'}, {k: '9', s: 'wxyz'},
                {k: '*', s: ''}, {k: '0', s: '+'}, {k: '#', s: ''}
            ].map((btn) => (
                <button 
                    key={btn.k} 
                    onClick={() => handleKeyPress(btn.k)}
                    className="h-10 bg-gray-100 rounded-md shadow-[0_3px_0_#bbb] active:shadow-none active:translate-y-1 flex flex-col items-center justify-center leading-none"
                >
                    <span className="text-xl font-bold font-sans text-gray-800">{btn.k}</span>
                    {btn.s && <span className="text-[0.5rem] font-bold text-gray-500 uppercase">{btn.s}</span>}
                </button>
            ))}
        </div>
        
        {/* Call Actions */}
        <div className="grid grid-cols-3 gap-4 mt-6">
            <button className="h-10 bg-green-500 rounded-full shadow-[0_3px_0_#166534] active:shadow-none active:translate-y-1 flex items-center justify-center text-white">
                <Phone size={18} fill="currentColor" />
            </button>
             <button onClick={() => handleKeyPress('CLR')} className="h-10 bg-yellow-400 rounded-full shadow-[0_3px_0_#ca8a04] active:shadow-none active:translate-y-1 flex items-center justify-center text-white font-bold font-sans">
                C
            </button>
            <button className="h-10 bg-red-500 rounded-full shadow-[0_3px_0_#991b1b] active:shadow-none active:translate-y-1 flex items-center justify-center text-white">
                <Phone size={18} className="rotate-[135deg]" fill="currentColor" />
            </button>
        </div>

      </div>
    </div>
  );
};
