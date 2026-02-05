
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, Wifi, Bluetooth, Globe, Moon, Bell, 
  Battery, Shield, ChevronRight, User, Key, Cloud, CreditCard, 
  Smartphone, Share2, Eye, Lock, Fingerprint, AlertTriangle, 
  CheckCircle, RefreshCw, X, ArrowUpRight, Zap, Heart, Car, MapPin, Contact, Activity, Plus, Radio, BookOpen, MessageSquare, Image, ShoppingBag, Voicemail
} from 'lucide-react';
import { SilasLogo } from '../SilasApp';

interface SettingsAppProps {
  onClose: () => void;
  networkMode?: 'STANDARD' | 'EMERGENCY';
  setNetworkMode?: React.Dispatch<React.SetStateAction<'STANDARD' | 'EMERGENCY'>>;
  silasConfig: { permissionsGranted: boolean; isSignedIn: boolean; };
  setSilasConfig: React.Dispatch<React.SetStateAction<{ permissionsGranted: boolean; isSignedIn: boolean; }>>;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({ onClose, networkMode = 'STANDARD', setNetworkMode, silasConfig, setSilasConfig }) => {
  const [view, setView] = useState<'MAIN' | 'PROFILE' | 'FEED' | 'DETAIL' | 'BATTERY' | 'MEDICAL' | 'SAFETY' | 'CELLULAR'>('MAIN');
  const [detailType, setDetailType] = useState<'NAME' | 'EMAIL' | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  
  // Interactive Toggles
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [protectionEnabled, setProtectionEnabled] = useState(true);
  const [batteryReserve, setBatteryReserve] = useState(15); // %

  // --- SUB-COMPONENTS ---

  const SettingsRow = ({ icon: Icon, color, label, value, hasArrow = true, onClick, isDestructive = false, isToggle = false, toggleState, onToggle, sublabel }: any) => (
    <div 
      onClick={!isToggle ? onClick : undefined}
      className={`flex items-center gap-3 p-3 bg-white active:bg-gray-100 transition-colors cursor-pointer ${(!isToggle && !onClick) ? 'cursor-default' : ''}`}
    >
      {Icon && (
        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      )}
      <div className="flex-1 flex justify-between items-center border-b border-gray-100 pb-3 pt-1 -mb-3 ml-1 min-h-[44px]">
        <div className="flex flex-col">
            <span className={`text-[17px] ${isDestructive ? 'text-red-500' : 'text-black'}`}>{label}</span>
            {sublabel && <span className="text-[12px] text-gray-500 leading-tight mt-0.5">{sublabel}</span>}
        </div>
        <div className="flex items-center gap-2">
          {value && <span className="text-[17px] text-gray-500">{value}</span>}
          {isToggle && (
              <div 
                onClick={(e) => { e.stopPropagation(); if(onToggle) onToggle(); }}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${toggleState ? 'bg-green-500' : 'bg-gray-200'}`}
              >
                 <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${toggleState ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
          )}
          {hasArrow && !isToggle && <ChevronRight size={16} className="text-gray-300" />}
        </div>
      </div>
    </div>
  );

  const Section = ({ children, title, footer }: any) => (
    <div className="mb-6">
      {title && <div className="px-4 mb-2 text-xs text-gray-500 uppercase font-medium">{title}</div>}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {children}
      </div>
      {footer && <div className="px-4 mt-2 text-xs text-gray-500 leading-relaxed">{footer}</div>}
    </div>
  );

  const handleSilasToggle = () => {
      if (!silasConfig.permissionsGranted) {
          setShowPermissionModal(true);
      } else {
          setSilasConfig(prev => ({ ...prev, permissionsGranted: false }));
      }
  };

  const confirmPermissions = () => {
      setSilasConfig(prev => ({ ...prev, permissionsGranted: true }));
      setShowPermissionModal(false);
  };

  // --- VIEWS ---

  const MainView = () => (
    <motion.div 
      initial={{ x: -20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      className="flex-1 overflow-y-auto bg-[#F2F2F7] pb-20"
    >
      {/* Header */}
      <div className="pt-14 px-4 pb-2">
        <h1 className="text-3xl font-bold text-black mb-2">Settings</h1>
        <div className="bg-[#E3E3E8] rounded-xl px-3 py-2 flex items-center gap-2 text-gray-500">
          <Search size={16} />
          <span className="text-[17px]">Search</span>
        </div>
      </div>

      <div className="px-4 mt-4">
        {/* Profile Card */}
        <div onClick={() => setView('PROFILE')} className="flex items-center gap-4 bg-white p-4 rounded-xl mb-6 border border-gray-200 active:bg-gray-50 cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-medium text-gray-500 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium text-black">Eloise Sawyer</h2>
            <p className="text-sm text-gray-500">Apple ID, iCloud, Media & Purchases</p>
          </div>
          <ChevronRight size={20} className="text-gray-300" />
        </div>

        {/* Group 1 */}
        <Section>
          <SettingsRow icon={Smartphone} color="bg-orange-500" label="Airplane Mode" isToggle={true} toggleState={false} onToggle={() => {}} />
          <SettingsRow 
            icon={Wifi} color="bg-blue-500" label="Wi-Fi" 
            value={wifiEnabled ? "Home_5G" : "Off"} 
            onClick={() => setWifiEnabled(!wifiEnabled)}
          />
          <SettingsRow 
            icon={Bluetooth} color="bg-blue-500" label="Bluetooth" 
            value={bluetoothEnabled ? "On" : "Off"} 
            onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
          />
          <SettingsRow 
            icon={Globe} color="bg-green-500" label="Cellular" 
            value={networkMode === 'EMERGENCY' ? "SOS Active" : "Verizon"}
            onClick={() => setView('CELLULAR')}
          />
        </Section>

        {/* Group 2 */}
        <Section>
          <SettingsRow icon={Bell} color="bg-red-500" label="Notifications" />
          <SettingsRow icon={Moon} color="bg-indigo-500" label="Focus" />
          <SettingsRow 
            icon={Battery} color="bg-green-500" label="Battery" 
            onClick={() => setView('BATTERY')} 
            value={`${batteryReserve}% Rsrv`}
          />
        </Section>

        {/* Group 3 */}
        <Section>
          <SettingsRow icon={Key} color="bg-gray-500" label="Passwords" />
          <SettingsRow icon={Shield} color="bg-blue-500" label="Privacy & Security" />
        </Section>
      </div>
    </motion.div>
  );

  const CellularView = () => (
      <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
      >
          <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
              <button onClick={() => setView('MAIN')} className="flex items-center text-blue-500 gap-1 px-2">
                  <ChevronLeft size={24} /> <span className="text-[17px]">Settings</span>
              </button>
              <div className="flex-1 text-center font-semibold pr-16">Cellular</div>
          </div>

          <div className="p-4 pb-20">
              <Section>
                  <SettingsRow label="Cellular Data" isToggle={true} toggleState={true} />
                  <SettingsRow label="Cellular Data Options" value="Roaming Off" />
                  <SettingsRow label="Personal Hotspot" value="Off" />
              </Section>

              <Section title="SIMs">
                  <SettingsRow label="Primary" value="+1 (555) 392-0192" />
              </Section>

              <div className="mb-2 px-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase">Emergency SOS</span>
              </div>
              <Section footer="Enabling this will switch your connection to the T-Mobile Emergency Backup Network. Only calls to emergency contacts will be permitted.">
                  <SettingsRow 
                      label="Emergency Backup Network" 
                      sublabel="Switch to T-Mobile Towers"
                      isToggle={true} 
                      toggleState={networkMode === 'EMERGENCY'} 
                      onToggle={() => setNetworkMode && setNetworkMode(prev => prev === 'STANDARD' ? 'EMERGENCY' : 'STANDARD')}
                  />
              </Section>

              {networkMode === 'EMERGENCY' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <Section title="Active Emergency Contacts">
                          <SettingsRow label="Daniel (Husband)" value="Connected" />
                          <SettingsRow label="Mom" value="Connected" />
                          <SettingsRow label="Dr. Aris" value="Connected" />
                      </Section>
                      <div className="px-4 p-3 bg-red-100 border border-red-200 rounded-xl text-red-700 text-sm font-medium flex items-center gap-2 mb-6">
                          <Radio className="w-4 h-4 animate-pulse" />
                          Connection routed via T-Mobile Emergency Band 12.
                      </div>
                  </motion.div>
              )}
          </div>
      </motion.div>
  );

  const ProfileView = () => (
    <motion.div 
      initial={{ x: '100%' }} 
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
    >
      <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => setView('MAIN')} className="flex items-center text-blue-500 gap-1 px-2">
          <ChevronLeft size={24} /> <span className="text-[17px]">Settings</span>
        </button>
        <div className="flex-1 text-center font-semibold pr-16">Apple ID</div>
      </div>

      <div className="flex flex-col items-center py-6 border-b border-gray-200 mb-6 bg-white">
        <div className="w-24 h-24 rounded-full bg-gray-200 mb-3 overflow-hidden">
             <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-medium">Eloise Sawyer</h2>
        <p className="text-gray-500">eloise.sawyer@icloud.com</p>
      </div>

      <div className="px-4 pb-20">
        <div className="mb-2 px-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-gray-500 uppercase">Emergency & Safety</span>
        </div>
        <Section>
            <SettingsRow 
                icon={Activity} 
                color="bg-red-500" 
                label="Medical ID" 
                value="Emergency Contacts"
                onClick={() => setView('MEDICAL')}
            />
            <SettingsRow 
                icon={Shield} 
                color="bg-purple-600" 
                label="Safety Profile" 
                value={silasConfig.permissionsGranted ? "Silas Active" : "Setup Required"}
                onClick={() => setView('SAFETY')}
            />
        </Section>

        <Section>
          <SettingsRow label="Name, Phone Numbers, Email" />
          <SettingsRow label="Password & Security" />
          <SettingsRow label="Payment & Shipping" />
        </Section>

        <Section>
          <SettingsRow icon={Cloud} color="bg-blue-400" label="iCloud" value="2 TB" />
          <SettingsRow icon={CreditCard} color="bg-black" label="Media & Purchases" />
          <SettingsRow icon={Smartphone} color="bg-gray-500" label="Find My" value="On" />
        </Section>

        <Section>
            <SettingsRow label="Sign Out" isDestructive={true} hasArrow={false} />
        </Section>
      </div>
    </motion.div>
  );

  const BatteryView = () => (
      <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
      >
          <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
              <button onClick={() => setView('MAIN')} className="flex items-center text-blue-500 gap-1 px-2">
                  <ChevronLeft size={24} /> <span className="text-[17px]">Back</span>
              </button>
              <div className="flex-1 text-center font-semibold pr-16">Battery Reserve</div>
          </div>

          <div className="p-4 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                  <h3 className="text-gray-500 font-medium mb-2 uppercase text-xs tracking-widest">Reserve Level</h3>
                  <div className="text-6xl font-black text-green-500 mb-2 flex items-center justify-center">
                      <Zap size={48} className="mr-2" fill="currentColor" /> {batteryReserve}%
                  </div>
                  <p className="text-sm text-gray-400">Emergency power available when depleted.</p>
              </div>

              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer active:bg-gray-50" onClick={() => setBatteryReserve(prev => Math.min(prev + 10, 50))}>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                              <Plus size={20} />
                          </div>
                          <div>
                              <div className="font-bold text-black">Buy Battery Time</div>
                              <div className="text-xs text-gray-500">$5.00 for 10%</div>
                          </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                  </div>
                  <div className="p-4 flex items-center justify-between cursor-pointer active:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                              <Share2 size={20} />
                          </div>
                          <div>
                              <div className="font-bold text-black">Request Battery</div>
                              <div className="text-xs text-gray-500">Ask a contact for power</div>
                          </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                  </div>
              </div>
          </div>
      </motion.div>
  );

  const MedicalIDView = () => (
      <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
      >
          <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
              <button onClick={() => setView('PROFILE')} className="flex items-center text-blue-500 gap-1 px-2">
                  <ChevronLeft size={24} /> <span className="text-[17px]">Back</span>
              </button>
              <div className="flex-1 text-center font-semibold pr-16">Medical ID</div>
          </div>

          <div className="p-4">
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                  <div className="flex gap-4 items-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <h2 className="text-xl font-bold">Eloise Sawyer</h2>
                          <p className="text-gray-500 text-sm">DOB: Apr 05, 1993</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <span className="text-gray-400 block text-xs uppercase">Weight</span>
                          <span className="font-medium">135 lb</span>
                      </div>
                      <div>
                          <span className="text-gray-400 block text-xs uppercase">Height</span>
                          <span className="font-medium">5' 7"</span>
                      </div>
                      <div>
                          <span className="text-gray-400 block text-xs uppercase">Blood Type</span>
                          <span className="font-medium">A+</span>
                      </div>
                  </div>
              </div>

              <h3 className="text-xs font-bold text-gray-500 uppercase px-4 mb-2">Emergency Contacts</h3>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">D</div>
                          <div>
                              <div className="font-medium">Daniel (Husband)</div>
                              <div className="text-xs text-gray-500">Emergency & T-Mobile Access</div>
                          </div>
                      </div>
                  </div>
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">M</div>
                          <div>
                              <div className="font-medium">Mom</div>
                              <div className="text-xs text-gray-500">Emergency & T-Mobile Access</div>
                          </div>
                      </div>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">D</div>
                          <div>
                              <div className="font-medium">Dr. Aris</div>
                              <div className="text-xs text-gray-500">Emergency & T-Mobile Access</div>
                          </div>
                      </div>
                  </div>
                  <div className="bg-gray-50 p-3 flex items-center gap-2 text-green-600 border-t border-gray-100 cursor-pointer">
                      <Plus size={16} /> <span className="font-bold text-sm">add emergency contact</span>
                  </div>
              </div>
              <p className="text-xs text-gray-400 px-4 mt-2">
                  These 3 contacts are the only ones accessible when using Emergency Network (T-Mobile).
              </p>
          </div>
      </motion.div>
  );

  const SafetyProfileView = () => (
      <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
      >
          {/* Header */}
          <div className="pt-12 px-2 pb-4 flex items-center border-b border-gray-200 sticky top-0 bg-[#F2F2F7]/90 backdrop-blur-md z-10">
              <button onClick={() => setView('PROFILE')} className="flex items-center text-blue-500 gap-1 px-2">
                  <ChevronLeft size={24} /> <span className="text-[17px]">Back</span>
              </button>
              <div className="flex-1 text-center font-semibold pr-16">Safety Profile</div>
          </div>

          <div className="p-4 space-y-6 pb-20">
              
              {/* STATIC INFO SECTION */}
              <Section title="Personal Information">
                  <SettingsRow label="Full Name" value="Eloise Sawyer" />
                  <SettingsRow label="Age" value="31" />
                  <SettingsRow label="Blood Type" value="A+" />
                  <SettingsRow label="Address" value="1042 Silicon Ave" />
              </Section>

              <Section title="Vehicle">
                  <SettingsRow label="Model" value="Tesla Model 3" />
                  <SettingsRow label="License Plate" value="8XYZ992" />
              </Section>

              {/* SILAS INTEGRATION SECTION */}
              <div className="flex items-center gap-2 px-4 mb-2">
                  <SilasLogo className="w-5 h-5" />
                  <span className="text-xs font-bold text-gray-500 uppercase">Silas Intelligence</span>
              </div>
              
              <Section footer="Enabling this grants Silas read-only permissions to your device history, improving predictive safety and memory recall.">
                  <SettingsRow 
                      label="Connect to Silas"
                      isToggle={true}
                      toggleState={silasConfig.permissionsGranted}
                      onToggle={handleSilasToggle}
                  />
                  {silasConfig.permissionsGranted && (
                      <SettingsRow label="Data Permissions" value="Full Access" />
                  )}
              </Section>

          </div>

          {/* PERMISSION MODAL */}
          <AnimatePresence>
              {showPermissionModal && (
                  <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6"
                  >
                      <motion.div 
                          initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                          className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                      >
                          <div className="p-6 text-center">
                              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <SilasLogo className="w-8 h-8 text-purple-600" />
                              </div>
                              <h3 className="text-xl font-bold mb-2">Connect Silas?</h3>
                              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                  "Silas" would like to access your personal data to provide safety monitoring and memory assistance.
                              </p>
                              
                              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6">
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
                                      <BookOpen size={16} className="text-gray-400" /> Read Books & Highlights
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
                                      <MessageSquare size={16} className="text-gray-400" /> Analyze Messages
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
                                      <ShoppingBag size={16} className="text-gray-400" /> View Purchase History
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
                                      <Image size={16} className="text-gray-400" /> Access Photos
                                  </div>
                                  <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
                                      <Voicemail size={16} className="text-gray-400" /> Transcribe Voicemails
                                  </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                  <button 
                                      onClick={confirmPermissions}
                                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                                  >
                                      Allow Access
                                  </button>
                                  <button 
                                      onClick={() => setShowPermissionModal(false)}
                                      className="w-full py-3 text-blue-600 font-bold active:bg-gray-50 rounded-xl transition-colors"
                                  >
                                      Don't Allow
                                  </button>
                              </div>
                          </div>
                      </motion.div>
                  </motion.div>
              )}
          </AnimatePresence>

      </motion.div>
  );

  const InternetFeedView = () => (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
    >
      <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => setView('MAIN')} className="flex items-center text-blue-500 gap-1 px-2">
          <ChevronLeft size={24} /> <span className="text-[17px]">Back</span>
        </button>
        <div className="flex-1 text-center font-semibold pr-16">Feed</div>
      </div>
      <div className="p-4 text-center text-gray-500">
        No feed available.
      </div>
    </motion.div>
  );

  const DetailView = () => (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="absolute inset-0 bg-[#F2F2F7] flex flex-col overflow-y-auto"
    >
      <div className="pt-12 px-2 pb-2 flex items-center bg-[#F2F2F7]/90 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <button onClick={() => setView('PROFILE')} className="flex items-center text-blue-500 gap-1 px-2">
          <ChevronLeft size={24} /> <span className="text-[17px]">Back</span>
        </button>
        <div className="flex-1 text-center font-semibold pr-16">Details</div>
      </div>
      <div className="p-4">
        <Section>
            <SettingsRow label="Info" value="Protected" hasArrow={false} />
        </Section>
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="absolute inset-0 bg-white z-50 flex flex-col font-sans overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {view === 'MAIN' && <MainView key="main" />}
        {view === 'PROFILE' && <ProfileView key="profile" />}
        {view === 'FEED' && <InternetFeedView key="feed" />}
        {view === 'DETAIL' && <DetailView key="detail" />}
        {view === 'BATTERY' && <BatteryView key="battery" />}
        {view === 'MEDICAL' && <MedicalIDView key="medical" />}
        {view === 'SAFETY' && <SafetyProfileView key="safety" />}
        {view === 'CELLULAR' && <CellularView key="cellular" />}
      </AnimatePresence>

      {/* Swipe to Close Home Indicator */}
      <motion.div 
          className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer bg-gradient-to-t from-white/50 to-transparent"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(e, { offset, velocity }) => {
              if (offset.y < -20 || velocity.y < -20) {
                  onClose();
              }
          }}
      >
          <div className="w-32 h-1.5 bg-black/20 rounded-full" />
      </motion.div>
    </motion.div>
  );
};
