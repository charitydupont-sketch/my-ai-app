
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Search, List, Calendar as CalendarIcon, MapPin, Clock, X, Send, Sparkles, CloudRain, Sun, Cloud, AlertCircle, Check, Video, Mail, MessageSquare, Bot, User, Mic, Car, Navigation, ArrowRight } from 'lucide-react';
import { generateSmartResponse } from '../../services/geminiService';
import { SilasLogo } from '../SilasApp';
import { CalendarEvent, ActiveRide } from '../../types';

interface CalendarAppProps {
  onClose: () => void;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  activeRide: ActiveRide;
  setActiveRide: React.Dispatch<React.SetStateAction<ActiveRide>>;
  onOpenJoyRide: () => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'silas';
    text: string;
    isEventProposal?: boolean;
    proposedEvent?: Partial<CalendarEvent>;
}

export const CalendarApp: React.FC<CalendarAppProps> = ({ onClose, events, setEvents, activeRide, setActiveRide, onOpenJoyRide }) => {
  const [selectedDay, setSelectedDay] = useState(1); // Set to Jan 1st
  const [isSilasOpen, setIsSilasOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { id: '1', sender: 'silas', text: "I've synced with your emails and texts. I found a few conflicts for the week." }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Updated Data for Jan 2026
  const currentMonth = "January";
  const currentYear = 2026;
  const daysInMonth = 31;
  const startDayOffset = 4; // Jan 1 2026 is a Thursday
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getIcon = (name?: string) => {
      if(name === 'Sun') return Sun;
      if(name === 'Cloud') return Cloud;
      if(name === 'CloudRain') return CloudRain;
      return undefined;
  };

  // Scroll chat to bottom
  useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, isSilasOpen]);

  const handleSendMessage = async () => {
      if (!chatInput.trim()) return;
      
      const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput };
      setChatHistory(prev => [...prev, userMsg]);
      setChatInput("");
      setIsProcessing(true);

      const eventListStr = events.map(e => `${e.title} at ${e.time}`).join(", ");
      const prompt = `
          You are Silas, an AI Calendar Assistant.
          Current Context:
          - User: Archie.
          - Date: Jan 1, 2026.
          - Weather: Cold but sunny.
          - Existing Events Today: ${eventListStr}.
          
          User Input: "${userMsg.text}"

          If adding an event, reply with JSON:
          \`\`\`json
          { "isEvent": true, "title": "Title", "time": "Time", "location": "Location", "weatherNote": "Note" }
          \`\`\`
          Else plain text.
      `;

      try {
          const response = await generateSmartResponse(userMsg.text, prompt);
          const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
          
          if (jsonMatch) {
              const eventData = JSON.parse(jsonMatch[1]);
              const botMsg: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  sender: 'silas',
                  text: `I can add that. ${eventData.weatherNote || ''}`,
                  isEventProposal: true,
                  proposedEvent: {
                      title: eventData.title,
                      time: eventData.time,
                      end: "1h later",
                      location: eventData.location || "TBD",
                      type: "Personal",
                      color: "bg-purple-500"
                  }
              };
              setChatHistory(prev => [...prev, botMsg]);
          } else {
              setChatHistory(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'silas', text: response }]);
          }
      } catch (e) {
          setChatHistory(prev => [...prev, { id: Date.now().toString(), sender: 'silas', text: "Connection error." }]);
      } finally {
          setIsProcessing(false);
      }
  };

  const confirmEvent = (msgId: string, event: Partial<CalendarEvent>) => {
      const newEvent: CalendarEvent = {
          id: Date.now(),
          title: event.title || "New Event",
          time: event.time || "TBD",
          end: event.end || "TBD",
          location: event.location || "TBD",
          type: event.type as any || "Personal",
          color: event.color || "bg-purple-500",
          weatherIconName: "Sun",
          silasContext: "Added via Silas Chat.",
          evidence: []
      };
      setEvents(prev => [...prev, newEvent]);
      setChatHistory(prev => prev.map(msg => msg.id === msgId ? { ...msg, isEventProposal: false, text: `Confirmed: ${newEvent.title} added.` } : msg));
  };

  const requestJoyRide = () => {
      setActiveRide(prev => ({ ...prev, status: 'REQUESTING' }));
      setTimeout(() => {
          setActiveRide({
              status: 'CONFIRMED',
              driverName: "Sarah",
              carModel: "Tesla Model 3",
              plateNumber: "7XGS291",
              rating: "4.9",
              eta: "4 mins",
              source: 'CALENDAR',
              riderId: 'me'
          });
          onOpenJoyRide();
      }, 2000);
  };

  const isZoom = (location: string) => location.toLowerCase().includes('zoom') || location.toLowerCase().includes('home');

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden"
    >
        {/* --- MAIN HEADER --- */}
        <div className="pt-12 px-4 pb-2 flex justify-between items-end bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="flex items-center gap-1 text-red-500 cursor-pointer active:opacity-50" onClick={onClose}>
                <ChevronLeft size={24} className="-ml-2" />
                <span className="text-[17px] font-medium">{currentYear}</span>
            </div>
            <div className="flex gap-5 text-red-500">
                <List size={24} />
                <Search size={24} />
                <Plus size={24} />
            </div>
        </div>

        {/* --- CALENDAR CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-24">
            {/* Month Header */}
            <div className="px-4 py-4 flex justify-between items-end">
                <div>
                    <h1 className="text-[34px] font-bold text-black leading-tight">{currentMonth}</h1>
                    <p className="text-gray-500">{currentYear}</p>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-2 mb-6">
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map((d, i) => (
                        <div key={i} className="text-center text-[11px] font-semibold text-gray-400 uppercase">
                            {d}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-4">
                    {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const isToday = day === 1; // Jan 1st
                        const isSelected = day === selectedDay;
                        const hasEvent = [1, 5, 12, 24].includes(day);

                        return (
                            <div key={day} onClick={() => setSelectedDay(day)} className="flex flex-col items-center gap-1 cursor-pointer">
                                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-[19px] font-medium transition-colors ${isToday ? 'bg-red-500 text-white' : isSelected ? 'bg-black text-white' : 'text-black'}`}>
                                    {day}
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${hasEvent ? (isToday || isSelected ? 'bg-white/50' : 'bg-gray-300') : 'bg-transparent'}`} />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Agenda View */}
            <div className="bg-[#F2F2F7] min-h-[400px] border-t border-gray-200">
                <div className="px-4 py-3 bg-[#F2F2F7] sticky top-0 z-10 text-gray-500 text-sm font-semibold border-b border-gray-200/50 flex justify-between">
                    <span>{currentMonth} {selectedDay}, {currentYear}</span>
                    {selectedDay === 1 && <span className="text-blue-500">Today</span>}
                </div>
                
                <div className="divide-y divide-gray-200 bg-white">
                    {selectedDay === 1 ? (
                        events.map((event) => {
                            const WeatherIcon = getIcon(event.weatherIconName);
                            return (
                                <div 
                                    key={event.id} 
                                    onClick={() => setSelectedEvent(event)}
                                    className="flex gap-3 p-4 hover:bg-gray-50 transition-colors group relative cursor-pointer"
                                >
                                    <div className="flex flex-col items-end min-w-[70px]">
                                        <span className="text-[15px] font-medium text-black">{event.time}</span>
                                        <span className="text-[13px] text-gray-500">{event.end}</span>
                                    </div>
                                    <div className={`w-1 rounded-full ${event.color} shrink-0`}></div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[17px] font-semibold text-black truncate">{event.title}</h3>
                                        <div className="flex items-center gap-1 text-[15px] text-gray-500">
                                            {isZoom(event.location) ? <Video size={12} /> : <MapPin size={12} />} 
                                            {event.location}
                                        </div>
                                        {/* Weather Hint (Hidden if Zoom) */}
                                        {WeatherIcon && !isZoom(event.location) && (
                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                                                <WeatherIcon size={12} />
                                                {event.notes || "Forecast OK"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                            <CalendarIcon size={40} className="opacity-20" />
                            <span className="text-sm">No events</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* --- EVENT DETAIL OVERLAY --- */}
        <AnimatePresence>
            {selectedEvent && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 bg-[#F2F2F7] z-50 flex flex-col"
                >
                    <div className="pt-12 px-4 pb-2 flex justify-between items-center bg-[#F2F2F7] border-b border-gray-200">
                        <button onClick={() => { setSelectedEvent(null); }} className="text-red-500 flex items-center gap-1">
                            <ChevronLeft size={24} /> Back
                        </button>
                        <span className="font-semibold">Event Details</span>
                        <span className="text-red-500 font-medium">Edit</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Event Title Card */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: selectedEvent.color.replace('bg-', '') }}>
                            <h2 className="text-2xl font-bold text-black mb-1">{selectedEvent.title}</h2>
                            <p className="text-lg text-gray-500">{selectedEvent.location}</p>
                        </div>

                        {/* SILAS / JOYRIDE SUGGESTION */}
                        {!isZoom(selectedEvent.location) && (
                            <div className="bg-white rounded-xl p-5 shadow-md border border-purple-100 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500"></div>
                                
                                <div className="flex justify-between items-start mb-3 pl-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Silas Suggestion</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium">{activeRide.status === 'IDLE' ? 'Recommendation' : 'Ride Active'}</span>
                                </div>

                                <div className="pl-2 mb-4">
                                    <p className="text-sm text-gray-800 leading-relaxed font-medium">
                                        Traffic is light. I can schedule a ride to pick you up at <span className="font-bold text-black">10:45 AM</span> to ensure you arrive on time.
                                    </p>
                                </div>

                                <div className="pl-2">
                                    {activeRide.status === 'IDLE' ? (
                                        <button 
                                            onClick={requestJoyRide}
                                            className="w-full bg-black text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                                        >
                                            <Car size={16} /> Schedule JoyRide ($14.92)
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={onOpenJoyRide}
                                            className="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-3 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                                        >
                                            <Check size={16} /> Ride Scheduled - View
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Time Card */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 flex justify-between items-center border-b border-gray-100">
                                <span className="text-gray-500">Starts</span>
                                <span className="text-black font-medium">Jan 1, 2026 at {selectedEvent.time}</span>
                            </div>
                            <div className="p-4 flex justify-between items-center">
                                <span className="text-gray-500">Ends</span>
                                <span className="text-black font-medium">Jan 1, 2026 at {selectedEvent.end}</span>
                            </div>
                        </div>

                        {/* Weather Card (Conditional) */}
                        {(() => {
                            const WeatherIcon = getIcon(selectedEvent.weatherIconName);
                            if (!isZoom(selectedEvent.location) && WeatherIcon) {
                                return (
                                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 shadow-sm border border-blue-100 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                                            <WeatherIcon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-black">Weather Forecast</h3>
                                            <p className="text-sm text-gray-500">{selectedEvent.notes || "Conditions look good."}</p>
                                        </div>
                                    </div>
                                )
                            }
                            return null;
                        })()}

                        {/* SILAS INTELLIGENCE / EVIDENCE */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-3 px-1">
                                <Bot size={16} className="text-purple-600" />
                                <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Silas Context</span>
                            </div>
                            
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-purple-100 relative overflow-hidden">
                                {/* Context */}
                                <div className="flex gap-3 mb-4">
                                    <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900">Why is this here?</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">{selectedEvent.silasContext}</p>
                                    </div>
                                </div>

                                {/* Evidence List */}
                                {selectedEvent.evidence && selectedEvent.evidence.length > 0 && (
                                    <div className="space-y-3 pt-3 border-t border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Supporting Evidence</span>
                                        {selectedEvent.evidence.map((ev, i) => (
                                            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-gray-100">
                                                    {ev.type === 'email' && <Mail size={14} className="text-blue-500" />}
                                                    {ev.type === 'message' && <MessageSquare size={14} className="text-green-500" />}
                                                    {ev.type === 'voice' && <Mic size={14} className="text-orange-500" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className="text-xs font-bold text-gray-900">{ev.source}</span>
                                                        <span className="text-[9px] text-gray-400">{ev.timestamp}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 truncate">"{ev.content}"</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Invitees (Mock) */}
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                            <span className="text-gray-500 text-sm block mb-3">Invitees</span>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">AV</div>
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">SM</div>
                                <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-xs">+</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- SILAS FLOATING BUTTON --- */}
        <AnimatePresence>
            {!isSilasOpen && !selectedEvent && (
                <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => setIsSilasOpen(true)}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-black rounded-full shadow-2xl flex items-center justify-center z-40 border border-white/20 active:scale-90 transition-transform"
                >
                    <SilasLogo className="w-8 h-8" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                </motion.button>
            )}
        </AnimatePresence>

        {/* --- SILAS CHAT OVERLAY --- */}
        <AnimatePresence>
            {isSilasOpen && (
                <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-x-0 bottom-0 top-16 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 flex flex-col overflow-hidden border-t border-gray-200"
                >
                    <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={() => setIsSilasOpen(false)}>
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>
                    <div className="px-6 pb-4 border-b border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                                <SilasLogo className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Silas</h3>
                                <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
                                    <Sparkles size={10} fill="currentColor" /> Calendar Assistant
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsSilasOpen(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" ref={scrollRef}>
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                    {msg.text}
                                </div>
                                {msg.isEventProposal && msg.proposedEvent && (
                                    <div className="mt-2 bg-white rounded-xl border border-purple-200 shadow-md overflow-hidden w-64 animate-scale-up">
                                        <div className="bg-purple-50 px-4 py-2 border-b border-purple-100 flex justify-between items-center">
                                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">Proposed Event</span>
                                            <CalendarIcon size={14} className="text-purple-400" />
                                        </div>
                                        <div className="p-4">
                                            <div className="font-bold text-lg mb-1">{msg.proposedEvent.title}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1"><Clock size={14} /> {msg.proposedEvent.time}</div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} /> {msg.proposedEvent.location}</div>
                                        </div>
                                        <div className="p-2 bg-gray-50 flex gap-2">
                                            <button onClick={() => confirmEvent(msg.id, msg.proposedEvent!)} className="flex-1 bg-black text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 active:scale-95 transition-transform"><Check size={14} /> Confirm</button>
                                            <button className="px-3 bg-white border border-gray-200 rounded-lg text-gray-500 text-xs font-bold active:bg-gray-100">Edit</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isProcessing && <div className="flex items-center gap-2 text-gray-400 text-xs ml-2"><Sparkles size={12} className="animate-spin" /> Silas is thinking...</div>}
                    </div>
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
                            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Add lunch with Mom tomorrow..." className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500" autoFocus />
                            <button onClick={handleSendMessage} disabled={!chatInput.trim() || isProcessing} className={`p-2 rounded-full transition-colors ${chatInput.trim() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}><Send size={16} fill="currentColor" /></button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex justify-between items-start px-6 pt-3 text-red-500 z-10">
            <span className="font-medium text-[17px]">Today</span>
            <span className="font-medium text-[17px]">Calendars</span>
            <span className="font-medium text-[17px]">Inbox</span>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer" onClick={onClose}>
            <div className="w-32 h-1.5 bg-black rounded-full opacity-20" />
        </div>
    </motion.div>
  );
};
