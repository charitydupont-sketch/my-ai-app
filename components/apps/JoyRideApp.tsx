
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Menu, Search, Clock, Star, Share2, Phone, Shield, X, User, Car, Calendar, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Flag, CheckCircle } from 'lucide-react';
import { ActiveRide, InteractiveContact } from '../../types';

interface JoyRideAppProps {
  onClose: () => void;
  activeRide: ActiveRide;
  setActiveRide: React.Dispatch<React.SetStateAction<ActiveRide>>;
  contacts: InteractiveContact[];
}

export const JoyRideApp: React.FC<JoyRideAppProps> = ({ onClose, activeRide, setActiveRide, contacts }) => {
  const [view, setView] = useState<'MAP' | 'SEARCH' | 'RIDE_SELECT' | 'CONFIRMING' | 'ACTIVE'>('MAP');
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  
  // Booking State
  const [pickup, setPickup] = useState('Current Location');
  const [destination, setDestination] = useState('');
  const [rider, setRider] = useState<{name: string, id: string}>({ name: 'Me', id: 'me' });
  const [showRiderMenu, setShowRiderMenu] = useState(false);
  const [selectedCar, setSelectedCar] = useState('saver');
  const [isScheduled, setIsScheduled] = useState(false);

  // Active Ride UI State
  const [showDriverMenu, setShowDriverMenu] = useState(false);
  const [showSafetySheet, setShowSafetySheet] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync internal view state with global activeRide
  useEffect(() => {
      if (activeRide.status !== 'IDLE') {
          setView('ACTIVE');
      } else {
          setView('MAP'); // Reset to map if ride is cancelled externally
      }
  }, [activeRide.status]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBookRide = () => {
      setView('CONFIRMING');
      setTimeout(() => {
          setActiveRide({
              status: 'CONFIRMED',
              driverName: "Michael",
              carModel: selectedCar === 'xl' ? "Chevy Suburban" : "Toyota Camry",
              plateNumber: "8XYZ992",
              rating: "4.9",
              eta: "4 mins",
              destination: destination || "Dropoff Location",
              source: 'APP',
              riderId: rider.id
          });
      }, 2000);
  };

  const handleChangeDriver = () => {
      setShowDriverMenu(false);
      showToast("Finding new driver...");
      setTimeout(() => {
          setActiveRide(prev => ({
              ...prev,
              driverName: "Jessica",
              carModel: "Honda Accord",
              plateNumber: "2ABC123",
              rating: "4.8",
              eta: "6 mins"
          }));
          showToast("Driver Updated");
      }, 1500);
  };

  const handleCancelRide = () => {
      setShowDriverMenu(false);
      setActiveRide({ status: 'IDLE' });
      setDestination('');
      setView('MAP');
      showToast("Ride Cancelled");
  };

  const handleShare = (contactName: string) => {
      setShareSuccess(contactName);
      setTimeout(() => {
          setShareSuccess(null);
          setShowShareSheet(false);
          showToast(`Shared with ${contactName}`);
      }, 1500);
  };

  const CarOption = ({ id, name, price, eta, icon: Icon }: any) => (
      <div 
        onClick={() => setSelectedCar(id)}
        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedCar === id ? 'border-teal-600 bg-teal-50' : 'border-transparent hover:bg-gray-100'}`}
      >
          <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Icon size={24} className="text-slate-800" />
              </div>
              <div>
                  <div className="font-bold text-sm text-slate-900">{name}</div>
                  <div className="text-xs text-slate-500">{eta}</div>
              </div>
          </div>
          <div className="font-bold text-slate-900">{price}</div>
      </div>
  );

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col font-sans overflow-hidden text-slate-900">
        {/* --- MAP BACKGROUND (Simulated) --- */}
        <div className="absolute inset-0 z-0 bg-[#e5e5e5]">
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/map-markers.png')]"></div>
            {/* Map Roads Simulation */}
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                <path d="M-10 100 L400 300" stroke="#fff" strokeWidth="20" />
                <path d="M200 -10 L200 800" stroke="#fff" strokeWidth="25" />
                <path d="M50 400 L350 400" stroke="#fff" strokeWidth="15" />
            </svg>
            
            {/* Markers */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-teal-600 rounded-full ring-4 ring-teal-600/30 animate-pulse"></div>
            </div>

            {/* Cars on Map */}
            {view === 'ACTIVE' && (
                <motion.div 
                    initial={{ x: -100, y: 100 }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="absolute top-1/3 left-1/2 -translate-x-6 translate-y-6"
                >
                    <div className="bg-slate-900 text-white p-2 rounded-lg shadow-lg transform -rotate-12">
                        <Car size={16} fill="currentColor" />
                    </div>
                </motion.div>
            )}
        </div>

        {/* --- HEADER --- */}
        <div className="absolute top-0 left-0 right-0 pt-12 px-4 z-20 flex justify-between pointer-events-none">
             <button onClick={onClose} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-900 pointer-events-auto active:scale-90 transition-transform">
                <Menu size={20} />
            </button>
            {view === 'ACTIVE' && activeRide.source === 'CALENDAR' && (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-slide-in pointer-events-auto border border-blue-500">
                    <Calendar size={12} /> Scheduled via Calendar
                </div>
            )}
        </div>

        {/* --- TOAST --- */}
        <AnimatePresence>
            {toastMessage && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl z-50 flex items-center gap-2"
                >
                    <CheckCircle size={16} className="text-green-400" /> {toastMessage}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- IDLE / SEARCH STATE --- */}
        {view === 'MAP' && (
            <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-12 z-10">
                {/* Rider Switcher */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Good morning, Eloise.</h2>
                    <div className="relative">
                        <button 
                            onClick={() => setShowRiderMenu(!showRiderMenu)}
                            className="bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 active:bg-gray-200 text-slate-800"
                        >
                            <User size={14} /> {rider.name} <ChevronDown size={14} />
                        </button>
                        
                        <AnimatePresence>
                            {showRiderMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                                >
                                    <div className="p-2 border-b border-gray-100 text-xs text-gray-400 font-bold uppercase pl-3">Switch Rider</div>
                                    <div onClick={() => { setRider({name: 'Me', id: 'me'}); setShowRiderMenu(false); }} className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm font-medium flex items-center justify-between text-slate-800">
                                        Me {rider.id === 'me' && <CheckCircle size={14} className="text-teal-600" />}
                                    </div>
                                    {contacts.filter(c => c.id !== 'shiloh').map(c => (
                                        <div key={c.id} onClick={() => { setRider({name: c.firstName, id: c.id}); setShowRiderMenu(false); }} className="px-4 py-3 hover:bg-teal-50 cursor-pointer text-sm font-medium flex items-center justify-between text-slate-800">
                                            {c.firstName} {rider.id === c.id && <CheckCircle size={14} className="text-teal-600" />}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div 
                    onClick={() => setView('SEARCH')}
                    className="bg-gray-100 p-4 rounded-xl flex items-center gap-3 mb-6 cursor-pointer hover:bg-gray-200 transition-colors"
                >
                    <Search size={20} className="text-slate-800" />
                    <span className="text-lg font-medium text-gray-500">Where to?</span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl min-w-[140px] cursor-pointer active:scale-95 transition-transform" onClick={() => { setDestination('Home'); setView('RIDE_SELECT'); }}>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-slate-700"><Clock size={18} /></div>
                        <div>
                            <div className="font-bold text-sm text-slate-900">Home</div>
                            <div className="text-xs text-gray-500">15 min</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl min-w-[140px] cursor-pointer active:scale-95 transition-transform" onClick={() => { setDestination('Juno Store'); setView('RIDE_SELECT'); }}>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-slate-700"><Clock size={18} /></div>
                        <div>
                            <div className="font-bold text-sm text-slate-900">Juno</div>
                            <div className="text-xs text-gray-500">22 min</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- SEARCH / DESTINATION ENTRY --- */}
        {view === 'SEARCH' && (
            <div className="absolute inset-0 bg-white z-20 flex flex-col p-4 pt-16">
                <button onClick={() => setView('MAP')} className="absolute top-4 left-4 p-2 bg-gray-100 rounded-full text-slate-800"><ChevronDown size={24} className="rotate-90" /></button>
                <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border border-gray-200">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <input 
                            value={pickup} 
                            onChange={e => setPickup(e.target.value)} 
                            className="bg-transparent font-medium w-full outline-none text-slate-900 placeholder-gray-400" 
                        />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3 border-2 border-slate-900">
                        <div className="w-2 h-2 bg-teal-500 rounded-sm" />
                        <input 
                            autoFocus
                            value={destination} 
                            onChange={e => setDestination(e.target.value)} 
                            placeholder="Where to?" 
                            className="bg-transparent font-medium w-full outline-none text-slate-900 placeholder-gray-400"
                            onKeyDown={e => e.key === 'Enter' && setView('RIDE_SELECT')}
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <div className="text-xs font-bold text-gray-400 uppercase mb-2">Saved Places</div>
                    <div onClick={() => { setDestination('Home'); setView('RIDE_SELECT'); }} className="p-4 border-b border-gray-100 font-bold flex items-center gap-3 cursor-pointer hover:bg-gray-50 text-slate-800">
                        <div className="bg-gray-200 p-2 rounded-full text-slate-600"><Clock size={16} /></div> Home
                    </div>
                    <div onClick={() => { setDestination('Juno Store'); setView('RIDE_SELECT'); }} className="p-4 border-b border-gray-100 font-bold flex items-center gap-3 cursor-pointer hover:bg-gray-50 text-slate-800">
                        <div className="bg-gray-200 p-2 rounded-full text-slate-600"><Clock size={16} /></div> Juno Store
                    </div>
                </div>
            </div>
        )}

        {/* --- RIDE SELECT --- */}
        {view === 'RIDE_SELECT' && (
            <div className="absolute bottom-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-12 z-20 flex flex-col max-h-[80%]">
                <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
                <h3 className="text-center font-bold text-lg mb-6 text-slate-900">Choose a ride</h3>
                
                <div className="space-y-3 mb-6 overflow-y-auto">
                    <CarOption id="saver" name="JoyRide Saver" price="$14.92" eta="4 min away" icon={Car} />
                    <CarOption id="comfort" name="JoyRide Comfort" price="$21.50" eta="6 min away" icon={Car} />
                    <CarOption id="xl" name="JoyRide XL" price="$32.20" eta="9 min away" icon={Car} />
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={handleBookRide}
                        className="flex-1 bg-teal-600 text-white font-bold py-4 rounded-xl text-lg shadow-xl active:scale-95 transition-transform"
                    >
                        Confirm {selectedCar === 'saver' ? 'Saver' : selectedCar === 'comfort' ? 'Comfort' : 'XL'}
                    </button>
                    <button onClick={() => { setIsScheduled(true); showToast("Schedule mode (sim)"); }} className="w-16 bg-gray-100 rounded-xl flex items-center justify-center text-slate-600 active:bg-gray-200">
                        <Clock size={24} />
                    </button>
                </div>
            </div>
        )}

        {/* --- CONFIRMING --- */}
        {view === 'CONFIRMING' && (
            <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center animate-ping opacity-20 absolute"></div>
                <div className="w-20 h-20 bg-teal-500 rounded-full flex items-center justify-center shadow-xl text-white relative z-10">
                    <Car size={32} />
                </div>
                <h3 className="mt-6 font-bold text-xl text-slate-900">Connecting you to a driver...</h3>
            </div>
        )}

        {/* --- ACTIVE RIDE --- */}
        {view === 'ACTIVE' && (
            <div className="absolute bottom-0 w-full z-10 pointer-events-auto">
                {/* ETA Pill */}
                <div className="mx-auto w-fit bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg mb-4 flex items-center gap-2 animate-bounce-subtle">
                    <span className="font-bold">{activeRide.eta}</span>
                    <span className="text-gray-400 text-xs">to pickup</span>
                </div>

                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-8"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="relative">
                            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Driver</h2>
                            <button 
                                onClick={() => setShowDriverMenu(!showDriverMenu)}
                                className="flex items-center gap-2 active:opacity-50"
                            >
                                <h1 className="text-2xl font-bold text-slate-900">{activeRide.driverName}</h1>
                                <ChevronDown size={20} className="text-gray-400" />
                            </button>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Star size={14} fill="currentColor" className="text-yellow-400" />
                                <span>{activeRide.rating}</span>
                                {activeRide.riderId !== 'me' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 rounded font-bold ml-2">For {contacts.find(c => c.id === activeRide.riderId)?.firstName}</span>}
                            </div>

                            {/* Driver Menu Dropdown */}
                            <AnimatePresence>
                                {showDriverMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                                    >
                                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium flex items-center gap-3 text-slate-800">
                                            <Phone size={16} /> Contact Driver
                                        </button>
                                        <button onClick={handleChangeDriver} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium flex items-center gap-3 text-slate-800">
                                            <RefreshCw size={16} /> Change Driver
                                        </button>
                                        <button onClick={() => { setShowDriverMenu(false); showToast("Safety Report Filed"); }} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium flex items-center gap-3 text-red-600 border-t border-gray-100">
                                            <Flag size={16} /> Report Issue
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex flex-col items-end">
                            <img 
                                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=200&q=80" 
                                className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-white shadow-md"
                            />
                            <div className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600 border border-gray-200">
                                {activeRide.plateNumber}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <Car size={24} className="text-teal-600" />
                        </div>
                        <div>
                            <div className="font-bold text-lg text-slate-900">{activeRide.carModel}</div>
                            <div className="text-xs text-teal-600 font-bold uppercase tracking-wide">JoyRide Comfort</div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            onClick={() => setShowShareSheet(true)}
                            className="flex-1 bg-teal-50 text-teal-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Share2 size={18} /> Share Status
                        </button>
                        <button 
                            onClick={() => setShowSafetySheet(true)}
                            className="w-16 bg-blue-50 text-blue-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <Shield size={20} />
                        </button>
                        <button 
                            onClick={handleCancelRide}
                            className="w-16 bg-red-50 text-red-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        )}

        {/* --- SAFETY SHEET --- */}
        <AnimatePresence>
            {showSafetySheet && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end"
                    onClick={() => setShowSafetySheet(false)}
                >
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="bg-white w-full rounded-t-3xl p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <Shield size={24} className="text-blue-600 fill-blue-100" />
                            <h3 className="font-bold text-xl text-slate-900">Safety Toolkit</h3>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-4 cursor-pointer active:bg-red-100">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600"><AlertCircle size={20} /></div>
                                <div className="flex-1">
                                    <div className="font-bold text-red-700">Emergency Call</div>
                                    <div className="text-xs text-red-500">Call 911 immediately</div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-4 cursor-pointer active:bg-gray-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm"><Shield size={20} /></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">Report Safety Issue</div>
                                    <div className="text-xs text-gray-500">Driver behavior, vehicle condition</div>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-4 cursor-pointer active:bg-gray-100" onClick={() => { setShowSafetySheet(false); setShowShareSheet(true); }}>
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-600 shadow-sm"><Share2 size={20} /></div>
                                <div className="flex-1">
                                    <div className="font-bold text-slate-800">Share Trip Status</div>
                                    <div className="text-xs text-gray-500">Send live location to friends</div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowSafetySheet(false)} className="w-full mt-6 py-4 bg-gray-100 rounded-xl font-bold text-slate-800">Close</button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- SHARE SHEET --- */}
        <AnimatePresence>
            {showShareSheet && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end"
                    onClick={() => setShowShareSheet(false)}
                >
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        className="bg-white w-full rounded-t-3xl p-6"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-slate-900">Share Trip Status</h3>
                            <button onClick={() => setShowShareSheet(false)} className="p-2 bg-gray-100 rounded-full text-slate-800"><X size={20} /></button>
                        </div>

                        {shareSuccess ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center text-green-600">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <Share2 size={24} />
                                </div>
                                <h4 className="font-bold text-lg">Sent to {shareSuccess}</h4>
                                <p className="text-sm text-gray-500">They can now track your ride live.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-80 overflow-y-auto">
                                {contacts.filter(c => c.id !== 'shiloh').map(contact => (
                                    <div 
                                        key={contact.id} 
                                        onClick={() => handleShare(contact.firstName)}
                                        className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl cursor-pointer active:scale-95 transition-transform"
                                    >
                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600">
                                            {contact.initials}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-900">{contact.firstName} {contact.lastName}</div>
                                            <div className="text-xs text-gray-500">{contact.phone}</div>
                                        </div>
                                        <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-bold">Send</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-black rounded-full opacity-20" />
        </div>
    </div>
  );
};
