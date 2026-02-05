import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, FlipVertical, Cpu, X, Grid3X3, PenTool, Mail, Phone } from 'lucide-react';
import { OSType } from '../types';

interface TryMeSelectorProps {
  onSelect: (os: OSType) => void;
  onClose: () => void;
}

export const TryMeSelector: React.FC<TryMeSelectorProps> = ({ onSelect, onClose }) => {
  const options = [
    {
      id: OSType.ANDROID,
      name: 'Droid OS 14',
      description: 'Material You. Widgets. Freedom.',
      color: 'bg-green-100 text-green-800',
      icon: Smartphone,
      gradient: 'from-green-400 to-emerald-600'
    },
    {
      id: OSType.BLACKBERRY,
      name: 'BizBerry 8800',
      description: 'Physical Keyboard. Trackball. Secure.',
      color: 'bg-blue-100 text-blue-900',
      icon: Mail,
      gradient: 'from-blue-700 to-slate-800'
    },
    {
      id: OSType.RETRO,
      name: 'Flip Phone 2004',
      description: 'T9 Keypad. 8-bit games. Nostalgia.',
      color: 'bg-orange-100 text-orange-800',
      icon: FlipVertical,
      gradient: 'from-orange-400 to-amber-600'
    },
    {
      id: OSType.BRICK,
      name: 'Indestructible 3310',
      description: 'Monochrome. Snake. Battery lasts forever.',
      color: 'bg-slate-100 text-slate-800',
      icon: Grid3X3,
      gradient: 'from-slate-500 to-gray-700'
    },
    {
      id: OSType.PDA,
      name: 'PDA 1999',
      description: 'Stylus input. Graffiti. Productivity.',
      color: 'bg-lime-100 text-lime-900',
      icon: PenTool,
      gradient: 'from-lime-600 to-green-700'
    },
    {
      id: OSType.ROTARY,
      name: 'Rotary 1955',
      description: 'Analog dialing. No screen. Pure talk.',
      color: 'bg-amber-100 text-amber-900',
      icon: Phone,
      gradient: 'from-amber-700 to-yellow-900'
    },
    {
      id: OSType.CYBER,
      name: 'Neon Cyber',
      description: 'Futuristic. Dark Mode. Data.',
      color: 'bg-purple-100 text-purple-800',
      icon: Cpu,
      gradient: 'from-purple-500 to-indigo-600'
    }
  ];

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 bg-white z-40 flex flex-col overflow-hidden rounded-[3rem]"
    >
      <div className="p-6 pt-12 flex justify-between items-center border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nostalgia Phones</h1>
          <p className="text-gray-500 text-sm">Choose your reality.</p>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X size={24} className="text-gray-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(opt.id)}
            className={`w-full p-6 rounded-2xl shadow-lg bg-gradient-to-br ${opt.gradient} text-white text-left flex items-center justify-between group relative overflow-hidden`}
          >
             {/* Decorative blob */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />

            <div>
              <opt.icon size={32} className="mb-3 opacity-90" />
              <h3 className="text-2xl font-bold">{opt.name}</h3>
              <p className="opacity-90 font-medium">{opt.description}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
              <span className="text-sm font-bold px-2">TRY</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};