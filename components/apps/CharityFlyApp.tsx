
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, MapPin, Calendar, Users, Wallet, Bot, ChevronLeft, CheckCircle, Plus, Search, ArrowRight, Sparkles, MessageSquare, Shield, X, Map, CreditCard, Share, Trash2, Armchair, Info, Mail, MessageCircle, User, Check, Heart, Ban, Loader2 } from 'lucide-react';
import { SilasLogo } from '../SilasApp';
import { generateSmartResponse } from '../../services/geminiService';

interface CharityFlyAppProps {
  onClose: () => void;
  onShareContext?: (contactId: string, details: string) => void;
}

interface Flight {
    id: string;
    airline: string;
    flightNum: string;
    dep: string;
    arr: string;
    depTime: string;
    arrTime: string;
    duration: string;
    price: number;
    stops: number;
    insight: string; // Silas analysis
    isBest?: boolean;
}

interface Seat {
    id: string;
    row: number;
    col: string;
    price: number;
    status: 'available' | 'occupied' | 'selected' | 'premium';
    insight: string; // Silas analysis for this specific seat
}

interface Trip {
    id: string;
    destination: string;
    dates: string;
    flightNum: string;
    seat: string; // Display string e.g. "4A, 4B"
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
    image: string;
    silasNote?: string;
    coPilot?: boolean;
    passengers?: string[];
    price?: number;
}

interface WishlistItem {
    id: string;
    title: string;
    subtitle: string;
    icon: any;
    color: string;
}

interface SeatInsightState {
    seat: Seat;
    passenger: string;
    loading: boolean;
    analysis?: string;
    isGood?: boolean; // Derived from analysis
}

export const CharityFlyApp: React.FC<CharityFlyAppProps> = ({ onClose, onShareContext }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'BOOKING' | 'SOCIAL'>('DASHBOARD');
  const [viewState, setViewState] = useState<'SEARCH' | 'RESULTS' | 'SEATS' | 'CHECKOUT' | 'SUCCESS'>('SEARCH');
  const [activeTripForManage, setActiveTripForManage] = useState<Trip | null>(null);
  
  // Search State
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('Apr 10 - Apr 15');
  const [passengers, setPassengers] = useState<string[]>(['Eloise']); // Default to user
  
  // Search Suggestions State
  const [activeField, setActiveField] = useState<'origin' | 'destination' | null>(null);
  
  const familyMembers = [
      { name: 'Daniel', relation: 'Husband' },
      { name: 'Talulah', relation: 'Daughter' },
      { name: 'Rue', relation: 'Daughter' }
  ];

  // --- UPDATED SUGGESTION DATA ---
  const nyNjAirports = [
      { code: 'JFK', name: 'John F. Kennedy Intl', location: 'New York, NY' },
      { code: 'EWR', name: 'Newark Liberty Intl', location: 'Newark, NJ' },
      { code: 'LGA', name: 'LaGuardia', location: 'New York, NY' },
      { code: 'SWF', name: 'New York Stewart', location: 'New Windsor, NY' },
      { code: 'BUF', name: 'Buffalo Niagara', location: 'Buffalo, NY' },
      { code: 'ALB', name: 'Albany Intl', location: 'Albany, NY' },
      { code: 'ACC', name: 'Atlantic City Intl', location: 'Egg Harbor Twp, NJ' },
      { code: 'TTN', name: 'Trenton Mercer', location: 'Trenton, NJ' },
  ];

  const destinationSuggestions = [
      { code: 'LAS', name: 'Maybe Las Vegas', location: 'Nevada, USA', type: 'suggested' },
      { code: 'ESP', name: 'Maybe Spain', location: 'Europe', type: 'suggested' },
      { code: 'ANY', name: 'Anywhere in the world', location: 'Explore', type: 'special' },
  ];

  // Selection State
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  
  // NEW: Specific Assignment State
  const [seatAssignments, setSeatAssignments] = useState<Record<string, Seat>>({});
  const [activePassengerIdx, setActivePassengerIdx] = useState(0);
  
  // Popups State
  const [flightInfoPopup, setFlightInfoPopup] = useState<Flight | null>(null);
  const [seatInsightPopup, setSeatInsightPopup] = useState<SeatInsightState | null>(null);
  const [showManageTrip, setShowManageTrip] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  
  // Feedback State
  const [toastMsg, setToastMsg] = useState<string|null>(null);

  // Trips State
  const [trips, setTrips] = useState<Trip[]>([
      {
          id: 't1',
          destination: 'Costa Rica',
          dates: 'Mar 12 - Mar 19',
          flightNum: 'CF-882',
          seat: '4A (Eloise), 4B (Daniel)',
          status: 'CONFIRMED',
          image: 'https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=800&q=80',
          silasNote: "I've coordinated with Daniel's calendar. He marked these dates as \"Free\".",
          coPilot: true,
          passengers: ['Eloise', 'Daniel']
      }
  ]);

  const [cancelledTrips, setCancelledTrips] = useState<Trip[]>([
      {
          id: 't_cancel_1',
          destination: 'Paris',
          dates: 'Dec 10 - Dec 15',
          flightNum: 'AF-220',
          seat: '12C',
          status: 'CANCELLED',
          image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
          passengers: ['Eloise']
      }
  ]);

  const wishlistItems: WishlistItem[] = [
      { id: 'w1', title: "Kids' Jungle Tour", subtitle: 'Suggested by Mom', icon: Sparkles, color: 'text-orange-600 bg-orange-100' },
      { id: 'w2', title: "Aurora Borealis", subtitle: 'Iceland (Winter)', icon: Map, color: 'text-purple-600 bg-purple-100' },
      { id: 'w3', title: "Disneyland", subtitle: 'Family Trip', icon: Heart, color: 'text-pink-600 bg-pink-100' }
  ];

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const togglePassenger = (name: string) => {
      setPassengers(prev => {
          if (prev.includes(name)) return prev.filter(p => p !== name);
          return [...prev, name];
      });
  };

  // --- ACTIONS ---
  const handleCancelTrip = () => {
      if (activeTripForManage) {
          const updatedTrip = { ...activeTripForManage, status: 'CANCELLED' as const };
          setTrips(prev => prev.filter(t => t.id !== activeTripForManage.id));
          setCancelledTrips(prev => [updatedTrip, ...prev]);
          setShowManageTrip(false);
          setActiveTripForManage(null);
          showToast("Trip Cancelled");
      }
  };

  const handleChangeSeats = () => {
      // Simulate going back to seat selection for the existing flight
      const mockFlight = generateFlights('JFK', 'SJO')[0]; 
      setSelectedFlight(mockFlight);
      
      // Reset seat selection but keep passengers
      setSeatAssignments({});
      setPassengers(activeTripForManage?.passengers || ['Eloise']);
      setActivePassengerIdx(0);
      
      setShowManageTrip(false);
      setViewState('SEATS');
      setActiveTab('BOOKING');
      showToast(`Re-selecting seats for ${activeTripForManage?.passengers?.length || 1} people`);
  };

  const handleAddPeople = () => {
      if (activeTripForManage) {
          const currentPassengers = activeTripForManage.passengers || [];
          const missing = familyMembers.find(m => !currentPassengers.includes(m.name));
          
          if (missing) {
              const updatedTrip = { 
                  ...activeTripForManage, 
                  passengers: [...currentPassengers, missing.name],
                  seat: activeTripForManage.seat + ", TBD"
              };
              setTrips(prev => prev.map(t => t.id === activeTripForManage.id ? updatedTrip : t));
              setActiveTripForManage(updatedTrip);
              showToast(`${missing.name} added. Select a seat.`);
              
              handleChangeSeats();
          } else {
              showToast("Everyone is already on this trip!");
          }
      }
  };

  const handleShareToContact = (contactId: string, name: string) => {
      if (onShareContext && activeTripForManage) {
          onShareContext(contactId, `Trip to ${activeTripForManage.destination} (${activeTripForManage.dates}). Flight: ${activeTripForManage.flightNum}.`);
          showToast(`Shared with ${name}`);
          setShowShareSheet(false);
      }
  };

  // --- MOCK DATA GENERATORS ---
  const generateFlights = (from: string, to: string): Flight[] => [
      { 
          id: 'f1', airline: 'Charity Air', flightNum: 'CF-101', dep: from || 'JFK', arr: to || 'LAS', depTime: '08:00 AM', arrTime: '11:30 AM', duration: '3h 30m', price: 245, stops: 0, 
          insight: "Best option for families. Direct flight minimizes stress for kids.", isBest: true 
      },
      { 
          id: 'f2', airline: 'SkyWays', flightNum: 'SW-99', dep: from || 'JFK', arr: to || 'LAS', depTime: '10:15 AM', arrTime: '02:00 PM', duration: '3h 45m', price: 198, stops: 1,
          insight: "Cheaper, but the layover might risk missing the connection with toddlers." 
      },
      { 
          id: 'f3', airline: 'Charity Air', flightNum: 'CF-404', dep: from || 'JFK', arr: to || 'LAS', depTime: '04:00 PM', arrTime: '07:30 PM', duration: '3h 30m', price: 280, stops: 0,
          insight: "Good flight, but arrives late. Daniel might be tired." 
      },
      { 
          id: 'f4', airline: 'JetLux', flightNum: 'JL-500', dep: from || 'JFK', arr: to || 'LAS', depTime: '06:00 AM', arrTime: '09:00 AM', duration: '3h 00m', price: 450, stops: 0,
          insight: "Premium cabin available. Expensive but highly comfortable." 
      },
  ];

  const handleSearch = () => {
      setSearchResults(generateFlights(origin, destination));
      setViewState('RESULTS');
  };

  // --- SEAT SELECTION LOGIC WITH SILAS ---
  
  const getPassengerContext = (name: string) => {
      if (name === 'Eloise') return 'Adult Female, User';
      if (name === 'Daniel') return 'Adult Male, Husband';
      if (name === 'Talulah' || name === 'Rue') return 'Child (Under 10)';
      return 'Adult Passenger';
  };

  const handleSeatClick = async (seat: Seat) => {
      if (seat.status === 'occupied') return;
      
      const currentPassenger = passengers[activePassengerIdx];

      // Explicitly typed to avoid unknown error
      const currentAssignment: Seat | undefined = seatAssignments[currentPassenger];
      
      if (currentAssignment && currentAssignment.id === seat.id) {
          const newAssignments = { ...seatAssignments };
          delete newAssignments[currentPassenger];
          setSeatAssignments(newAssignments);
          return;
      }

      // Instead of assigning immediately, ASK SILAS
      setSeatInsightPopup({
          seat,
          passenger: currentPassenger,
          loading: true
      });

      // Prepare context for Gemini
      const otherSeats = Object.entries(seatAssignments).map(([p, s]) => `${p} is in seat ${(s as Seat).id}`).join(', ');
      const seatType = ['A','K'].includes(seat.col) ? 'Window' : ['C','D','G','H'].includes(seat.col) ? 'Aisle' : 'Middle';
      const isExitRow = seat.row === 10;
      
      const prompt = `
          You are Silas, a travel AI assistant.
          Passenger: ${currentPassenger} (${getPassengerContext(currentPassenger)}).
          Selected Seat: ${seat.id} (Row ${seat.row}, ${seatType}).
          Current Assignments: ${otherSeats || 'None yet'}.
          Exit Row: ${isExitRow}.
          
          Analyze if this is a good seat choice.
          - If Child (Talulah/Rue): Are they sitting next to a parent (Eloise/Daniel)? They cannot sit in Exit Rows. They prefer Windows.
          - If Parent: Are they near the kids?
          - Exit Row: Good for adults (legroom), bad/illegal for kids.
          - Middle Seats: Generally bad unless sitting between family.
          
          Start response with a verdict in CAPS: "GOOD CHOICE", "WARNING", "NOTE", or "PERFECT".
          Then provide a 1-sentence explanation.
      `;

      try {
          const analysis = await generateSmartResponse("Seat Analysis", prompt);
          
          setSeatInsightPopup(prev => prev ? { 
              ...prev, 
              loading: false, 
              analysis 
          } : null);

      } catch (e) {
          // Fallback if AI fails
          setSeatInsightPopup(prev => prev ? { 
              ...prev, 
              loading: false, 
              analysis: "NOTE: Unable to analyze seat preference at this time." 
          } : null);
      }
  };

  const confirmSeatSelection = () => {
      if (!seatInsightPopup) return;
      
      const { seat, passenger } = seatInsightPopup;
      const newAssignments = { ...seatAssignments };
      
      // Clear seat if taken by someone else locally (rare case in this flow)
      // Safely check for existing assignment by ID using Object.entries to avoid 'unknown' type errors
      const assignments = newAssignments as Record<string, Seat>;
      const existingEntry = Object.entries(assignments).find(([_, s]) => (s as Seat).id === seat.id);
      
      if (existingEntry) {
          const existingPassenger = existingEntry[0];
          delete newAssignments[existingPassenger];
      }

      // Assign
      newAssignments[passenger] = { ...seat, status: 'selected' };
      setSeatAssignments(newAssignments);
      
      // Close popup
      setSeatInsightPopup(null);

      // Auto-advance
      const nextUnseatedIdx = passengers.findIndex((p, idx) => !newAssignments[p] && idx !== activePassengerIdx);
      if (nextUnseatedIdx !== -1) {
          setActivePassengerIdx(nextUnseatedIdx);
      }
  };

  const handleConfirmSeats = () => {
      const unseated = passengers.filter(p => !seatAssignments[p]);
      if (unseated.length > 0) {
          showToast(`Please select a seat for ${unseated[0]}`);
          return;
      }
      setViewState('CHECKOUT');
  };

  const handleBookingComplete = () => {
      if (selectedFlight) {
          // Format seats string with names
          const seatsStr = passengers.map(p => {
              const seat = seatAssignments[p];
              return seat ? `${seat.id} (${p})` : '';
          }).filter(Boolean).join(', ');

          // Explicitly cast to Seat[]
          const totalExtras = (Object.values(seatAssignments) as Seat[]).reduce((sum: number, seat: Seat) => sum + seat.price, 0);

          const newTrip: Trip = {
              id: `t-${Date.now()}`,
              destination: destination || 'New Trip',
              dates: dates,
              flightNum: selectedFlight.flightNum,
              seat: seatsStr,
              status: 'CONFIRMED',
              image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
              silasNote: `Booked via Charity Fly. ${selectedFlight.insight}`,
              coPilot: true,
              passengers: passengers,
              price: (selectedFlight.price * passengers.length) + totalExtras
          };
          setTrips(prev => [newTrip, ...prev]);
      }
      setActiveTab('DASHBOARD');
      setViewState('SEARCH');
      setSeatAssignments({});
      showToast("Trip Booked Successfully");
  };

  const renderSuggestions = () => {
      if (!activeField) return null;
      
      let list = [];
      if (activeField === 'origin') {
          list = nyNjAirports;
          if (origin) {
              list = list.filter(item => 
                  item.name.toLowerCase().includes(origin.toLowerCase()) || 
                  item.code.toLowerCase().includes(origin.toLowerCase()) ||
                  item.location.toLowerCase().includes(origin.toLowerCase())
              );
          }
      } else {
          list = destinationSuggestions;
          if (destination) {
              list = list.filter(item => item.name.toLowerCase().includes(destination.toLowerCase()));
          }
      }

      return (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-60 overflow-y-auto">
              {list.map((item) => (
                  <div 
                    key={item.code} 
                    className="p-3 border-b border-gray-100 last:border-0 hover:bg-sky-50 cursor-pointer flex justify-between items-center"
                    onClick={() => {
                        if (activeField === 'origin') setOrigin(`${item.name} (${item.code})`);
                        else setDestination(item.name.replace('Maybe ', ''));
                        setActiveField(null);
                    }}
                  >
                      <div>
                          <div className={`font-bold text-sm ${item.type === 'special' ? 'text-sky-600 italic' : 'text-slate-800'}`}>{item.name}</div>
                          <div className="text-xs text-gray-500">{item.location}</div>
                      </div>
                      <div className="font-mono text-xs font-bold text-sky-600 bg-sky-100 px-2 py-1 rounded">
                          {item.code}
                      </div>
                  </div>
              ))}
              {list.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">No suggestions found.</div>
              )}
          </div>
      );
  };

  // --- RENDERERS ---

  // 1. SILAS INSIGHT POPUP (Generic)
  const renderInsightPopup = (
      title: string, 
      subtitle: string, 
      insight: string, 
      onClosePopup: () => void, 
      onConfirm?: () => void, 
      confirmText: string = "Select"
  ) => (
      <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={onClosePopup}
      >
          <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full rounded-2xl p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}
          >
              <button 
                  onClick={onClosePopup}
                  className="absolute top-4 right-4 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
              >
                  <X size={16} className="text-gray-500" />
              </button>

              <div className="flex gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Bot size={24} className="text-purple-600" />
                  </div>
                  <div className="pr-8">
                      <h3 className="font-bold text-xl text-slate-900">{title}</h3>
                      <p className="text-sm text-gray-500">{subtitle}</p>
                  </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                  <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-1 block">Silas Recommendation</span>
                  <p className="text-sm text-purple-900 leading-relaxed font-medium">
                      "{insight}"
                  </p>
              </div>

              <div className="flex gap-3">
                  <button onClick={onClosePopup} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Cancel</button>
                  {onConfirm && (
                      <button onClick={onConfirm} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-200">
                          {confirmText}
                      </button>
                  )}
              </div>
          </motion.div>
      </motion.div>
  );

  // 2. MANAGE TRIP OVERLAY
  const renderManageTrip = () => (
      <motion.div 
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          className="absolute inset-0 z-50 bg-white flex flex-col"
      >
          <div className="pt-12 px-6 pb-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-2xl font-bold">Manage Trip</h2>
              <button onClick={() => setShowManageTrip(false)} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
          </div>
          
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h3 className="text-xl font-black text-sky-900">{activeTripForManage?.destination}</h3>
                          <p className="text-sky-600 font-medium">{activeTripForManage?.dates}</p>
                      </div>
                      <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-sky-600 shadow-sm">CONFIRMED</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-sky-800">
                      <div className="flex items-center gap-1"><Plane size={14} /> {activeTripForManage?.flightNum}</div>
                      <div className="flex items-center gap-1"><Armchair size={14} /> {activeTripForManage?.seat}</div>
                  </div>
                  {activeTripForManage?.passengers && (
                      <div className="mt-4 pt-4 border-t border-sky-200/50">
                          <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wide block mb-2">Passengers</span>
                          <div className="flex flex-wrap gap-2">
                              {activeTripForManage.passengers.map(p => (
                                  <span key={p} className="bg-white px-2 py-1 rounded-md text-xs font-medium text-sky-800 shadow-sm">{p}</span>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Actions</h4>
                  
                  <button onClick={() => setShowShareSheet(true)} className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Share size={18} /></div>
                          <span className="font-bold text-slate-700">Share Itinerary</span>
                      </div>
                      <ChevronLeft size={16} className="rotate-180 text-gray-300" />
                  </button>

                  <button 
                    onClick={handleAddPeople}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50"
                  >
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Users size={18} /></div>
                          <span className="font-bold text-slate-700">Add People</span>
                      </div>
                      <ChevronLeft size={16} className="rotate-180 text-gray-300" />
                  </button>

                  <button 
                    onClick={handleChangeSeats}
                    className="w-full p-4 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50"
                  >
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Armchair size={18} /></div>
                          <span className="font-bold text-slate-700">Change Seats</span>
                      </div>
                      <ChevronLeft size={16} className="rotate-180 text-gray-300" />
                  </button>

                  <button 
                    onClick={handleCancelTrip}
                    className="w-full p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between hover:bg-red-100 mt-4"
                  >
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-white text-red-600 rounded-lg"><Trash2 size={18} /></div>
                          <span className="font-bold text-red-700">Cancel Trip</span>
                      </div>
                  </button>
              </div>
          </div>
      </motion.div>
  );

  // 3. SHARE SHEET
  const renderShareSheet = () => (
      <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end"
          onClick={() => setShowShareSheet(false)}
      >
          <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full bg-[#F2F2F7] rounded-t-[20px] p-4"
              onClick={e => e.stopPropagation()}
          >
              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="font-bold text-lg">Share Flight</span>
                  <button onClick={() => setShowShareSheet(false)} className="bg-gray-200 p-1 rounded-full"><X size={16} /></button>
              </div>
              
              <div className="bg-white rounded-xl p-4 mb-4 flex gap-4 shadow-sm">
                  <div className="w-16 h-16 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Plane className="text-sky-600" size={32} />
                  </div>
                  <div>
                      <h4 className="font-bold">Trip to {activeTripForManage?.destination}</h4>
                      <p className="text-xs text-gray-500">{activeTripForManage?.dates} • {activeTripForManage?.flightNum}</p>
                  </div>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {[
                      { id: 'daniel', name: 'Daniel' }, 
                      { id: 'c2', name: 'Mom' }, 
                      { id: 'talulah', name: 'Talulah' }
                  ].map((contact, i) => (
                      <div 
                        key={i} 
                        className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer"
                        onClick={() => handleShareToContact(contact.id, contact.name)}
                      >
                          <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm active:scale-95 transition-transform">
                              {contact.name[0]}
                          </div>
                          <span className="text-xs font-medium text-black">{contact.name}</span>
                      </div>
                  ))}
              </div>

              <div className="bg-white rounded-xl p-2">
                  <div className="flex items-center gap-3 p-3 border-b border-gray-100 active:bg-gray-50">
                      <MessageCircle className="text-green-500" />
                      <span className="font-medium">Messages</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 active:bg-gray-50">
                      <Mail className="text-blue-500" />
                      <span className="font-medium">Mail</span>
                  </div>
              </div>
          </motion.div>
      </motion.div>
  );

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="absolute inset-0 bg-sky-50 z-50 flex flex-col font-sans text-slate-900"
    >
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
          {toastMsg && (
              <motion.div 
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 50, x: '-50%' }}
                  className="absolute bottom-24 left-1/2 bg-black text-white px-4 py-2 rounded-full shadow-xl z-[80] flex items-center gap-2 whitespace-nowrap"
              >
                  <CheckCircle size={14} className="text-green-400" />
                  <span className="text-sm font-bold">{toastMsg}</span>
              </motion.div>
          )}
      </AnimatePresence>

      {/* GLOBAL POPUPS */}
      <AnimatePresence>
          {flightInfoPopup && renderInsightPopup(
              flightInfoPopup.airline, 
              flightInfoPopup.flightNum, 
              flightInfoPopup.insight, 
              () => setFlightInfoPopup(null),
              () => { setSelectedFlight(flightInfoPopup); setFlightInfoPopup(null); setViewState('SEATS'); },
              "Select Flight"
          )}
          
          {/* SEAT INSIGHT POPUP */}
          {seatInsightPopup && (
              <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[65] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                  onClick={() => setSeatInsightPopup(null)}
              >
                  <motion.div 
                      initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                      className="bg-white w-full rounded-2xl p-6 shadow-2xl relative"
                      onClick={e => e.stopPropagation()}
                  >
                      <button onClick={() => setSeatInsightPopup(null)} className="absolute top-4 right-4 p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                          <X size={16} className="text-gray-500" />
                      </button>

                      <div className="flex gap-4 mb-4">
                          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shrink-0">
                              <SilasLogo className="w-6 h-6 text-white" />
                          </div>
                          <div>
                              <h3 className="font-bold text-xl text-slate-900">Seat Analysis</h3>
                              <p className="text-sm text-gray-500">For {seatInsightPopup.passenger}</p>
                          </div>
                      </div>

                      <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 mb-6 min-h-[100px] flex items-center justify-center text-center">
                          {seatInsightPopup.loading ? (
                              <div className="flex flex-col items-center gap-2">
                                  <Loader2 className="animate-spin text-purple-500" />
                                  <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Analyzing Cabins...</span>
                              </div>
                          ) : (
                              <p className="text-base text-purple-900 font-medium leading-relaxed">
                                  {seatInsightPopup.analysis}
                              </p>
                          )}
                      </div>

                      <div className="flex gap-3">
                          <button onClick={() => setSeatInsightPopup(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600">Choose Another</button>
                          <button 
                            onClick={confirmSeatSelection}
                            disabled={seatInsightPopup.loading}
                            className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg transition-all ${seatInsightPopup.loading ? 'bg-gray-300' : 'bg-slate-900 active:scale-95'}`}
                          >
                              Confirm Seat
                          </button>
                      </div>
                  </motion.div>
              </motion.div>
          )}

          {showManageTrip && renderManageTrip()}
          {showShareSheet && renderShareSheet()}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-12 px-6 pb-4 bg-white shadow-sm z-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
              <button onClick={() => {
                  if (viewState === 'SEARCH') {
                      if (activeTab === 'BOOKING') setActiveTab('DASHBOARD');
                      else onClose();
                  } else if (viewState === 'RESULTS') setViewState('SEARCH');
                  else if (viewState === 'SEATS') setViewState('RESULTS');
                  else if (viewState === 'CHECKOUT') setViewState('SEATS');
                  else if (viewState === 'SUCCESS') { handleBookingComplete(); }
                  else setActiveTab('DASHBOARD');
              }} className="p-1 -ml-2 rounded-full hover:bg-gray-100">
                  <ChevronLeft size={24} className="text-sky-600" />
              </button>
              <div className="flex flex-col">
                  <h1 className="font-black text-xl text-sky-600 italic tracking-tighter leading-none">Charity Fly</h1>
                  <span className="text-[10px] text-gray-400 font-medium tracking-wide">AI-POWERED TRAVEL</span>
              </div>
          </div>
          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
              <Plane size={16} className="text-sky-600" />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
          
          {/* --- DASHBOARD VIEW --- */}
          {activeTab === 'DASHBOARD' && (
              <>
                <div className="p-6">
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Active Trips</h2>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> {trips.length} BOOKED
                        </span>
                    </div>

                    <div className="space-y-6">
                        {trips.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                No upcoming trips. Tap "Book" to start planning.
                            </div>
                        )}
                        {trips.map((trip) => (
                            <div key={trip.id} onClick={() => { setActiveTripForManage(trip); setShowManageTrip(true); }} className="bg-white rounded-[2rem] shadow-xl overflow-hidden relative cursor-pointer active:scale-[0.98] transition-transform">
                                {/* Destination Image */}
                                <div className="h-48 relative">
                                    <img 
                                        src={trip.image} 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-6 text-white">
                                        <h3 className="text-3xl font-black italic tracking-tight">{trip.destination}</h3>
                                        <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                                            <Calendar size={14} /> {trip.dates}
                                        </div>
                                    </div>
                                    {trip.passengers && trip.passengers.length > 1 && (
                                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                                            <Users size={12} /> {trip.passengers.length}
                                        </div>
                                    )}
                                </div>

                                {/* Silas Co-Pilot Logic */}
                                <div className="p-5 bg-gradient-to-br from-indigo-50 to-white relative">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            <SilasLogo className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Silas Co-Pilot</span>
                                                <span className="text-[10px] text-gray-400">Just now</span>
                                            </div>
                                            <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                                {trip.silasNote}
                                            </p>
                                            <button 
                                                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-bold flex items-center gap-1 hover:bg-indigo-200 transition-colors w-fit"
                                            >
                                                <Shield size={12} /> View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cancelled Trips Section */}
                {cancelledTrips.length > 0 && (
                    <div className="px-6 pb-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Ban size={16} className="text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-500">Cancelled Flights</h2>
                        </div>
                        <div className="space-y-4">
                            {cancelledTrips.map(trip => (
                                <div key={trip.id} className="bg-gray-100 rounded-2xl p-4 flex gap-4 items-center opacity-70">
                                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0 grayscale">
                                        <img src={trip.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-600">{trip.destination}</h4>
                                        <p className="text-xs text-gray-500">{trip.dates}</p>
                                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold mt-1 inline-block">CANCELLED</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Interactive Wishlist / Planning */}
                <div className="px-6 pb-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Trip Wishlist</h2>
                    <div className="space-y-3">
                        {wishlistItems.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.color}`}>
                                    <item.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                    <p className="text-xs text-gray-500">{item.subtitle}</p>
                                </div>
                                <input type="checkbox" checked className="accent-sky-600 w-5 h-5" readOnly />
                            </div>
                        ))}
                    </div>
                </div>
              </>
          )}

          {/* --- BOOKING FLOW --- */}
          {activeTab === 'BOOKING' && (
              <>
                  {/* STEP 1: SEARCH */}
                  {viewState === 'SEARCH' && (
                      <div className="px-6 pt-4 min-h-[500px]" onClick={() => setActiveField(null)}>
                          <h2 className="text-2xl font-bold text-slate-900 mb-4">Book a Flight</h2>
                          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 relative">
                              <div className="flex gap-2 relative">
                                  <div className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 relative">
                                      <span className="text-[10px] text-gray-400 uppercase font-bold">From</span>
                                      <input 
                                        value={origin} 
                                        onChange={(e) => setOrigin(e.target.value)}
                                        onClick={(e) => { e.stopPropagation(); setActiveField('origin'); }}
                                        className="w-full bg-transparent font-bold outline-none placeholder-gray-300"
                                        placeholder="City or Airport"
                                      />
                                      {activeField === 'origin' && renderSuggestions()}
                                  </div>
                                  <div className="flex-1 bg-gray-50 p-2 rounded-xl border border-gray-100 relative">
                                      <span className="text-[10px] text-gray-400 uppercase font-bold">To</span>
                                      <input 
                                        value={destination} 
                                        onChange={(e) => setDestination(e.target.value)}
                                        onClick={(e) => { e.stopPropagation(); setActiveField('destination'); }}
                                        className="w-full bg-transparent font-bold outline-none placeholder-gray-300"
                                        placeholder="Where to?"
                                      />
                                      {activeField === 'destination' && renderSuggestions()}
                                  </div>
                              </div>
                              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold">Dates</span>
                                  <input 
                                        value={dates} onChange={(e) => setDates(e.target.value)}
                                        className="w-full bg-transparent font-bold outline-none"
                                  />
                              </div>

                              {/* NEW: Travelers Selection */}
                              <div className="pt-2">
                                  <span className="text-[10px] text-gray-400 uppercase font-bold mb-2 block">Travelers</span>
                                  <div className="flex flex-wrap gap-2">
                                      <button
                                          onClick={() => togglePassenger('Eloise')}
                                          className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${passengers.includes('Eloise') ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}
                                      >
                                          {passengers.includes('Eloise') && <Check size={12} strokeWidth={3} />}
                                          Eloise (Me)
                                      </button>
                                      {familyMembers.map((member) => (
                                          <button
                                              key={member.name}
                                              onClick={() => togglePassenger(member.name)}
                                              className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 transition-all ${passengers.includes(member.name) ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200'}`}
                                          >
                                              {passengers.includes(member.name) && <Check size={12} strokeWidth={3} />}
                                              {member.name}
                                          </button>
                                      ))}
                                  </div>
                              </div>

                              <button onClick={handleSearch} className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl shadow-lg active:scale-95 transition-transform mt-2">
                                  Search Flights {passengers.length > 1 && `(${passengers.length})`}
                              </button>
                          </div>
                      </div>
                  )}

                  {/* STEP 2: RESULTS */}
                  {viewState === 'RESULTS' && (
                      <div className="px-6 pt-4">
                          <div className="flex justify-between items-end mb-4">
                              <h2 className="text-2xl font-bold text-slate-900">Results</h2>
                              {passengers.length > 1 && (
                                  <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg">
                                      {passengers.length} Travelers
                                  </span>
                              )}
                          </div>
                          <div className="space-y-4">
                              {searchResults.map(flight => (
                                  <div key={flight.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform" onClick={() => setFlightInfoPopup(flight)}>
                                      <div className="flex justify-between items-center mb-2">
                                          <span className="font-bold text-slate-900">{flight.airline}</span>
                                          <span className="text-sky-600 font-black">${flight.price} <span className="text-[10px] text-gray-400 font-normal">/person</span></span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                          <span>{flight.depTime}</span>
                                          <div className="h-[1px] bg-gray-300 flex-1 relative">
                                              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-1 text-[10px] text-gray-400">{flight.duration}</div>
                                          </div>
                                          <span>{flight.arrTime}</span>
                                      </div>
                                      {flight.isBest && (
                                          <div className="inline-block bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                                              SILAS PICK
                                          </div>
                                      )}
                                      <button className="w-full py-2 border border-sky-100 text-sky-600 font-bold rounded-lg text-xs">Tap for Details</button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

                  {/* STEP 3: SEATS (WIDE BODY 2-4-2) */}
                  {viewState === 'SEATS' && selectedFlight && (
                      <div className="px-6 pt-4 h-full flex flex-col">
                          <div className="flex items-center gap-2 mb-4">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                                  <Bot size={20} />
                              </div>
                              <div className="bg-purple-100 text-purple-900 px-3 py-2 rounded-xl text-xs font-medium max-w-[200px]">
                                  <strong>Silas:</strong> Select a passenger, then tap a seat to assign.
                              </div>
                          </div>

                          {/* PASSENGER SELECTOR BAR */}
                          <div className="mb-4 overflow-x-auto no-scrollbar pb-2">
                              <div className="flex gap-3">
                                  {passengers.map((p, i) => {
                                      const isAssigned = !!seatAssignments[p];
                                      const isActive = i === activePassengerIdx;
                                      return (
                                          <button 
                                              key={p} 
                                              onClick={() => setActivePassengerIdx(i)}
                                              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm border ${
                                                  isActive 
                                                      ? 'bg-sky-600 text-white border-sky-600 scale-105' 
                                                      : isAssigned 
                                                          ? 'bg-green-50 text-green-700 border-green-200' 
                                                          : 'bg-white text-gray-500 border-gray-200'
                                              }`}
                                          >
                                              {p}
                                              {isAssigned && <CheckCircle size={12} />}
                                              {seatAssignments[p] && <span className="ml-1 opacity-75">({seatAssignments[p].id})</span>}
                                          </button>
                                      )
                                  })}
                              </div>
                          </div>

                          <div className="flex-1 bg-white rounded-t-[3rem] shadow-2xl border-t border-gray-200 relative overflow-hidden flex flex-col">
                              {/* Cockpit / Header */}
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-200 rounded-full z-10" />
                              <div className="mt-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
                                  Wide Body Cabin (2-4-2)
                              </div>
                              
                              {/* Seat Map */}
                              <div className="flex-1 overflow-y-auto no-scrollbar pb-24 pt-4 px-4">
                                  <div className="grid grid-cols-8 gap-1.5 w-full max-w-md mx-auto">
                                      {/* Column Headers */}
                                      <div className="col-span-2 flex justify-around text-[10px] text-gray-400 font-bold"><span>A</span><span>B</span></div>
                                      <div className="col-span-4 flex justify-around text-[10px] text-gray-400 font-bold"><span>D</span><span>E</span><span>F</span><span>G</span></div>
                                      <div className="col-span-2 flex justify-around text-[10px] text-gray-400 font-bold"><span>H</span><span>K</span></div>

                                      {/* Rows */}
                                      {Array.from({ length: 20 }).map((_, r) => {
                                          const row = r + 1;
                                          const isExitRow = row === 10;
                                          
                                          return (
                                              <React.Fragment key={row}>
                                                  {['A', 'B', 'D', 'E', 'F', 'G', 'H', 'K'].map((col, cIdx) => {
                                                      const seatId = `${row}${col}`;
                                                      const isOccupied = (row * cIdx) % 7 === 0 || (row === 1 && col === 'A'); // Mock occupation
                                                      
                                                      // Find assignee for this seat
                                                      const assigneeName = Object.keys(seatAssignments).find(key => seatAssignments[key].id === seatId);
                                                      const isSelected = !!assigneeName;
                                                      
                                                      // Style adjustments for aisles
                                                      let marginClass = '';
                                                      if (col === 'B') marginClass = 'mr-4'; // Aisle right of B
                                                      if (col === 'G') marginClass = 'mr-4'; // Aisle right of G

                                                      return (
                                                          <div 
                                                            key={seatId}
                                                            onClick={() => handleSeatClick({ id: seatId, row, col, price: isExitRow ? 50 : 0, status: isOccupied ? 'occupied' : 'available', insight: '' })}
                                                            className={`
                                                                h-9 rounded-md border flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all relative
                                                                ${marginClass}
                                                                ${
                                                                    isOccupied ? 'bg-gray-100 border-transparent text-gray-300 cursor-not-allowed' :
                                                                    isSelected ? 'bg-sky-600 border-sky-600 text-white shadow-md' :
                                                                    isExitRow ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                                    'border-gray-200 text-gray-500 hover:border-sky-300'
                                                                }
                                                            `}
                                                          >
                                                              {assigneeName ? (
                                                                  <span className="text-[8px] uppercase tracking-tighter">{assigneeName.substring(0,2)}</span>
                                                              ) : (
                                                                  !isOccupied && col
                                                              )}
                                                              {isOccupied && <X size={10} />}
                                                          </div>
                                                      )
                                                  })}
                                              </React.Fragment>
                                          );
                                      })}
                                  </div>
                              </div>

                              {/* Footer Summary */}
                              <div className="p-4 border-t border-gray-100 bg-white/90 backdrop-blur-md absolute bottom-0 w-full">
                                  <div className="flex justify-between items-center mb-3">
                                      <span className="text-xs text-gray-500 font-bold uppercase">{Object.keys(seatAssignments).length} / {passengers.length} Assigned</span>
                                      <span className="font-bold text-sky-600">${(Object.values(seatAssignments) as Seat[]).reduce((a: number, b: Seat) => a + b.price, 0)} Extras</span>
                                  </div>
                                  <button 
                                    onClick={handleConfirmSeats}
                                    className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${Object.keys(seatAssignments).length === passengers.length ? 'bg-slate-900 active:scale-95' : 'bg-gray-300 cursor-not-allowed'}`}
                                  >
                                      {Object.keys(seatAssignments).length === passengers.length ? 'Confirm Seats' : 'Assign All Seats'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* STEP 4: CHECKOUT */}
                  {viewState === 'CHECKOUT' && selectedFlight && (
                      <div className="px-6 pt-4">
                          <h2 className="text-2xl font-bold text-slate-900 mb-6">Summary</h2>
                          
                          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 mb-6">
                              <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                  <div>
                                      <h3 className="font-black text-xl text-slate-900">{selectedFlight.airline}</h3>
                                      <p className="text-sm text-gray-500">{selectedFlight.flightNum}</p>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-bold text-lg">{origin} <ArrowRight size={14} className="inline" /> {destination}</div>
                                      <div className="text-sm text-gray-500">{dates}</div>
                                  </div>
                              </div>
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-gray-500">Flight Fare</span>
                                  <span className="font-bold">${selectedFlight.price} x {passengers.length}</span>
                              </div>
                              
                              <div className="border-t border-gray-100 my-4 pt-4 space-y-2">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Assignments</span>
                                  {passengers.map(p => (
                                      <div key={p} className="flex justify-between text-sm">
                                          <span className="text-gray-700">{p}</span>
                                          <div className="flex gap-4">
                                              <span className="font-mono text-slate-900">{seatAssignments[p]?.id || 'N/A'}</span>
                                              <span className="font-bold text-gray-500 w-10 text-right">${seatAssignments[p]?.price || 0}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>

                              <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
                                  <span className="font-black text-lg">Total</span>
                                  <span className="font-black text-2xl text-sky-600">${(selectedFlight.price * passengers.length) + (Object.values(seatAssignments) as Seat[]).reduce((a: number, b: Seat) => a + b.price, 0)}</span>
                              </div>
                          </div>

                          <div className="bg-sky-50 p-4 rounded-xl flex items-center gap-3 mb-6">
                              <CreditCard className="text-sky-600" />
                              <div className="flex-1">
                                  <div className="font-bold text-sky-900">Bank of Charity</div>
                                  <div className="text-xs text-sky-700">**** 4242</div>
                              </div>
                              <CheckCircle size={20} className="text-sky-600" />
                          </div>

                          <button onClick={() => setViewState('SUCCESS')} className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-transform">
                              Pay & Book
                          </button>
                      </div>
                  )}

                  {/* STEP 5: SUCCESS */}
                  {viewState === 'SUCCESS' && (
                      <div className="flex flex-col items-center justify-center h-full px-8 text-center pb-20">
                          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                              <CheckCircle size={48} className="text-green-600" />
                          </div>
                          <h2 className="text-3xl font-black text-slate-900 mb-2">You're Going!</h2>
                          <p className="text-gray-500 mb-8">
                              Flight confirmed for {passengers.length} people. Check your email for individual boarding passes.
                          </p>
                          <button onClick={handleBookingComplete} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg">
                              Done
                          </button>
                      </div>
                  )}
              </>
          )}

      </div>

      {/* Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white border-t border-gray-200 flex justify-around items-start pt-3 pb-8 z-30">
          <button onClick={() => setActiveTab('DASHBOARD')} className={`flex flex-col items-center gap-1 ${activeTab === 'DASHBOARD' ? 'text-sky-600' : 'text-gray-400'}`}>
              <MapPin size={24} />
              <span className="text-[10px] font-bold">Trips</span>
          </button>
          <button onClick={() => setActiveTab('BOOKING')} className={`flex flex-col items-center gap-1 ${activeTab === 'BOOKING' ? 'text-sky-600' : 'text-gray-400'}`}>
              <Search size={24} />
              <span className="text-[10px] font-medium">Book</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
              <Users size={24} />
              <span className="text-[10px] font-medium">Social</span>
          </button>
      </div>

      {/* Home Indicator */}
      <div 
          className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
          onClick={onClose}
      >
          <div className="w-32 h-1.5 bg-gray-300 rounded-full active:bg-gray-400 transition-colors" />
      </div>
    </motion.div>
  );
};
