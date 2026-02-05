
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Gamepad2, Layers, Star, User, Activity, Wallet, Moon, HardDrive, Plane } from 'lucide-react';

interface AppStoreAppProps {
  onClose: () => void;
  installedApps: string[];
  onInstall: (appId: string) => void;
  onOpenApp: (appId: string) => void;
}

export const AppStoreApp: React.FC<AppStoreAppProps> = ({ onClose, installedApps, onInstall, onOpenApp }) => {
  const [activeTab, setActiveTab] = useState('apps');
  const [loadingApps, setLoadingApps] = useState<Record<string, boolean>>({});

  const handleGet = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (installedApps.includes(appId)) {
        onOpenApp(appId);
        return;
    }

    setLoadingApps(prev => ({ ...prev, [appId]: true }));
    
    // Simulate download time
    setTimeout(() => {
        setLoadingApps(prev => ({ ...prev, [appId]: false }));
        onInstall(appId);
    }, 2000);
  };

  const appsList = [
      {
          id: 'charityfly',
          name: 'Charity Fly',
          category: 'Travel',
          desc: 'Plan trips. Save money. Fly together.',
          iconColor: 'bg-sky-500',
          icon: (
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-sky-100">
                  <div className="flex flex-col items-center">
                      <Plane size={24} className="text-sky-600 mb-0.5" />
                      <div className="text-sky-600 font-black text-[8px] leading-none italic">FLY</div>
                  </div>
              </div>
          )
      },
      {
          id: 'unsent',
          name: 'Unsent Drafts',
          category: 'Simulation',
          desc: 'Some words live forever in drafts.',
          iconColor: 'bg-[#09090b]',
          icon: (
             <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-[#0f172a] border border-gray-700">
                 <HardDrive size={32} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" fill="currentColor" />
             </div>
          )
      },
      {
          id: 'zion',
          name: 'Juno',
          category: 'Shopping',
          desc: 'Modern essentials for modern living.',
          iconColor: 'bg-white',
          icon: (
              <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-white border border-gray-200">
                <div className="text-black font-serif font-bold italic tracking-widest text-[10px]">JUNO</div>
              </div>
          )
      }
  ];

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-0 bg-[#1c1c1e] z-50 flex flex-col font-sans text-white overflow-hidden"
    >
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        
        {/* Header */}
        <div className="pt-12 px-5 pb-4 flex justify-between items-center sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-md z-20 border-b border-white/5">
            <h1 className="text-3xl font-bold">Apps</h1>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <User size={16} className="text-white" />
            </div>
        </div>

        {/* Featured Section */}
        <div className="px-5 mb-8">
            <h2 className="text-xl font-bold mb-4 border-t border-gray-800 pt-4">Featured Now</h2>
            <div 
                className="w-full aspect-video bg-sky-900 rounded-xl relative overflow-hidden mb-2 cursor-pointer group border border-sky-700"
                onClick={(e) => handleGet(e, 'charityfly')}
            >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80')] bg-cover opacity-60" />
                
                <div className="absolute top-4 right-4">
                    <Plane size={32} className="text-white drop-shadow-md" />
                </div>
                
                <div className="absolute bottom-4 left-4">
                    <div className="text-xs font-bold uppercase text-sky-300 mb-1 tracking-widest">Editor's Choice</div>
                    <div className="text-2xl font-bold text-white shadow-black drop-shadow-md italic">Charity Fly</div>
                    <div className="text-sm text-gray-200 font-medium">Plan the impossible trip.</div>
                </div>
                
                {!installedApps.includes('charityfly') && (
                    <div className="absolute bottom-4 right-4 bg-white text-sky-600 text-xs font-bold px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        GET
                    </div>
                )}
            </div>
        </div>

        {/* Apps List */}
        <div className="px-5 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Popular Apps</h2>
                <span className="text-blue-500 text-sm">See All</span>
            </div>

            {appsList.map((app) => {
                const isInstalled = installedApps.includes(app.id);
                const isLoading = loadingApps[app.id];

                return (
                    <div key={app.id} className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-[14px] ${app.iconColor} shadow-md flex items-center justify-center overflow-hidden shrink-0`}>
                            {app.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base truncate">{app.name}</h3>
                            <p className="text-xs text-gray-400 truncate">{app.desc}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">{app.category}</span>
                            </div>
                        </div>
                        <button 
                            onClick={(e) => handleGet(e, app.id)}
                            className={`px-5 py-1.5 rounded-full font-bold text-xs transition-all w-20 flex items-center justify-center ${
                                isInstalled 
                                    ? 'bg-gray-800 text-gray-400' 
                                    : 'bg-white/10 text-blue-500 hover:bg-blue-500 hover:text-white'
                            }`}
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                isInstalled ? 'OPEN' : 'GET'
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1c1c1e]/90 backdrop-blur-xl border-t border-gray-800 flex justify-around items-start pt-2 px-2 z-30">
        {[
            { id: 'today', l: 'Today', i: Layers },
            { id: 'games', l: 'Games', i: Gamepad2 },
            { id: 'apps', l: 'Apps', i: Layers }, // Using Apps as default active
            { id: 'arcade', l: 'Arcade', i: Gamepad2 },
            { id: 'search', l: 'Search', i: Search },
        ].map((tab, i) => (
            <button 
                key={i}
                onClick={() => setActiveTab(tab.id)} 
                className={`flex flex-col items-center gap-1 w-16 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'}`}
            >
                <tab.i size={24} fill={activeTab === tab.id ? "currentColor" : "none"} />
                <span className="text-xs font-medium">{tab.l}</span>
            </button>
        ))}
      </div>

      {/* STANDARD GRAY BAR HOME INDICATOR */}
      <motion.div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
                if (offset.y < -20 || velocity.y < -20) {
                    onClose();
                }
            }}
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-gray-500 rounded-full active:bg-gray-400 transition-colors" />
        </motion.div>
    </motion.div>
  );
};
