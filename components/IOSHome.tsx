
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppWindow, MessageCircle, Phone, Compass, Camera, Settings, Wallet, Music, Calendar, Map, Mail, Cloud, Video, Calculator, StickyNote, Podcast, Store, Book, Activity, Moon, HardDrive, Plane, CreditCard, ShoppingBag, ArrowDownLeft, Search, ShoppingCart, Globe, Car, Navigation } from 'lucide-react';
import { OSType, InteractiveContact, CalendarEvent, Transaction, GlobalCartItem, Song, Conversation, Email, Message, ActiveRide } from '../types';
import { SilasApp, SilasLogo } from './SilasApp';
import { PhoneApp } from './apps/PhoneApp';
import { MessagesApp } from './apps/MessagesApp';
import { MusicApp } from './apps/MusicApp';
import { SafariApp } from './apps/SafariApp';
import { ZionStoreApp } from './apps/ZionStoreApp';
import { CharityBankApp } from './apps/CharityBankApp';
import { WalletApp } from './apps/WalletApp';
import { AppStoreApp } from './apps/AppStoreApp';
import { SettingsApp } from './apps/SettingsApp';
import { UnsentDrivesApp } from './apps/UnsentDrivesApp';
import { MailApp } from './apps/MailApp';
import { BooksApp } from './apps/BooksApp';
import { WeatherApp } from './apps/WeatherApp';
import { CalendarApp } from './apps/CalendarApp';
import { CharityFlyApp } from './apps/CharityFlyApp';
import { PhotosApp } from './apps/PhotosApp';
import { SilasSearchApp } from './apps/SilasSearchApp';
import { JoyRideApp } from './apps/JoyRideApp';
import { StatusBar } from './StatusBar';
import { generateSmartResponse } from '../services/geminiService';

interface IOSHomeProps {
  onSwitchOS: (os: OSType) => void;
}

const AppIconImage = ({ src }: { src: string }) => (
  <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] shadow-md relative overflow-hidden">
    <img src={src} alt="App Icon" className="w-full h-full object-cover" />
  </div>
);

export const IOSHome: React.FC<IOSHomeProps> = ({ onSwitchOS }) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [[page, direction], setPage] = useState([0, 0]);
  
  // Pre-install 'zion' and 'charityfly' so they appear on home screen by default
  const [installedApps, setInstalledApps] = useState<string[]>(['zion', 'charityfly']);
  const [networkMode, setNetworkMode] = useState<'STANDARD' | 'EMERGENCY'>('STANDARD');

  // --- PERSISTENT STATE ---
  
  // 0. SILAS CONFIG
  const [silasConfig, setSilasConfig] = useState({
      permissionsGranted: true, // Toggled in Settings > Safety Profile
      isSignedIn: true,         // Toggled in Silas App > Login Screen
  });

  // 0.5 JOYRIDE STATE
  const [activeRide, setActiveRide] = useState<ActiveRide>({
      status: 'IDLE'
  });

  // 1. MUSIC STATE
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
      if (currentSong && audioRef.current) {
          audioRef.current.src = currentSong.url;
          if (isPlaying) audioRef.current.play().catch(e => console.error("Audio Play Error:", e));
      }
  }, [currentSong]);

  useEffect(() => {
      if (audioRef.current) {
          isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
      }
  }, [isPlaying]);

  // 2. MESSAGES STATE
  const [contacts, setContacts] = useState<InteractiveContact[]>([
      { id: 'daniel', firstName: 'Daniel', lastName: 'Sawyer', initials: 'DS', label: 'husband', phone: '(555) 928-1029', isFavorite: true, relation: 'Husband', avatar: 'img', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
      { id: 'c2', firstName: 'Mom', lastName: '', initials: 'M', label: 'mobile', phone: '(555) 291-0021', isFavorite: true, relation: 'Mother' },
      { id: 'talulah', firstName: 'Talulah', lastName: '', initials: 'T', label: 'daughter', phone: '(555) 888-9999', isFavorite: true, relation: 'Daughter' },
      { id: 'shiloh', firstName: 'Shiloh', lastName: '', initials: 'S', label: 'mobile', phone: '(555) 111-2222', isFavorite: true, relation: 'Best Friend (Deceased)' },
      { id: 'c3', firstName: 'Sarah', lastName: 'Miller', initials: 'SM', label: 'friend', phone: '(555) 333-4444', relation: 'Friend' },
      { id: 'c6', firstName: 'Dr.', lastName: 'Aris', initials: 'DA', label: 'work', phone: '(555) 555-0123', relation: 'Therapist' },
      { id: 'c7', firstName: 'Dad', lastName: '', initials: 'D', label: 'mobile', phone: '(555) 123-4567', relation: 'Father' },
      { id: 'c9', firstName: 'Pizza', lastName: 'Place', initials: 'P', label: 'other', phone: '(555) 000-0000', relation: 'Service' },
      { id: 'c10', firstName: 'Thomas', lastName: '', initials: 'T', label: 'mobile', phone: '(555) 666-0666', relation: 'Ex' }
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_daniel', contactId: 'daniel', unread: true,
      messages: [
        { id: 'm1', text: 'Hey, are you still at work?', isMe: false, timestamp: new Date(Date.now() - 17200000) },
        { id: 'm2', text: 'Yeah, wrapping up soon.', isMe: true, timestamp: new Date(Date.now() - 17000000) },
        { id: 'm3', text: 'Hunter is out of dog food, can you order some?', isMe: false, timestamp: new Date(Date.now() - 86400000) }, // Yesterday
        { id: 'm4', text: 'On it.', isMe: true, timestamp: new Date(Date.now() - 86300000) },
        { id: 'm5', text: 'Love you.', isMe: false, timestamp: new Date(Date.now() - 6500000) }
      ]
    },
    {
      id: 'conv_mom', contactId: 'c2', unread: false,
      messages: [
         { id: 'm1', text: 'Did you call? I missed it.', isMe: false, timestamp: new Date(Date.now() - 86400000) },
         { id: 'm2', text: 'Just checking in. I was busy earlier.', isMe: true, timestamp: new Date(Date.now() - 86000000) },
         { id: 'm3', text: 'Are we still on for Sunday dinner?', isMe: false, timestamp: new Date(Date.now() - 85000000) },
         { id: 'm4', text: 'Yes! Bring the girls.', isMe: false, timestamp: new Date(Date.now() - 84000000) }
      ]
    },
    {
      id: 'conv_sarah', contactId: 'c3', unread: false,
      messages: [
          { id: 'm1', text: 'Brunch tomorrow?', isMe: false, timestamp: new Date(Date.now() - 120000000) },
          { id: 'm2', text: 'Can\'t, Talulah has dance.', isMe: true, timestamp: new Date(Date.now() - 119000000) },
          { id: 'm3', text: 'Next week then!', isMe: false, timestamp: new Date(Date.now() - 118000000) }
      ]
    },
    {
      id: 'conv_shiloh', contactId: 'shiloh', unread: false,
      messages: [
          { id: 'm1', text: 'Look at this view!! 🏔️', isMe: false, timestamp: new Date('2023-08-20T14:30:00') },
          { id: 'm2', text: 'Wish I was there! Be safe.', isMe: true, timestamp: new Date('2023-08-20T14:32:00') },
          { id: 'm3', text: 'Always. Love you El.', isMe: false, timestamp: new Date('2023-08-20T14:33:00') },
          { id: 'm4', text: 'Love you too.', isMe: true, timestamp: new Date('2023-08-20T14:33:30') }
      ]
    }
  ]);

  const handleSendMessage = (text: string, contactId: string) => {
      // 1. Add User Message
      const userMsg: Message = { id: Date.now().toString(), text, isMe: true, timestamp: new Date() };
      setConversations(prev => {
          const exists = prev.find(c => c.contactId === contactId);
          if (exists) {
              return prev.map(c => c.contactId === contactId ? { ...c, messages: [...c.messages, userMsg], unread: false } : c);
          } else {
              return [...prev, { id: `conv_${contactId}`, contactId, messages: [userMsg], unread: false }];
          }
      });

      // 2. Schedule AI Reply (Background Task)
      setTimeout(async () => {
          try {
              const contact = contacts.find(c => c.id === contactId);
              if (!contact) return;
              
              let prompt = `You are ${contact.firstName} ${contact.lastName}. Relationship: ${contact.relation}. Replying to text: "${text}". Keep it very short.`;
              if (contact.id === 'shiloh') prompt += " You are deceased. This is a dream/glitch. Be vague.";
              
              const replyText = await generateSmartResponse(text, prompt);
              
              const replyMsg: Message = { id: (Date.now() + 1).toString(), text: replyText, isMe: false, timestamp: new Date() };
              setConversations(prev => prev.map(c => c.contactId === contactId ? { ...c, messages: [...c.messages, replyMsg], unread: activeApp !== 'messages' } : c));
          } catch(e) { console.error(e); }
      }, 3000 + Math.random() * 2000);
  };

  // --- INTEGRATION: Share Itinerary to Messages ---
  const handleShareItinerary = (contactId: string, details: string) => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      const userMsg: Message = { 
          id: Date.now().toString(), 
          text: `Check out my trip! ${details}`, 
          isMe: true, 
          timestamp: new Date() 
      };

      setConversations(prev => {
          const exists = prev.find(c => c.contactId === contactId);
          if (exists) {
              return prev.map(c => c.contactId === contactId ? { ...c, messages: [...c.messages, userMsg], unread: false } : c);
          } else {
              return [...prev, { id: `conv_${contactId}`, contactId, messages: [userMsg], unread: false }];
          }
      });
  };

  // 3. MAIL STATE
  const [emails, setEmails] = useState<Email[]>([
    {
      id: '1', sender: 'Silas Intelligence', subject: 'Weekly Report: Digital Footprint', preview: 'Your weekly privacy summary is ready...', body: `Hello Eloise,\n\nWeekly summary ready.`, time: '10:42 AM', dateFull: 'Today at 10:42 AM', unread: true, isVip: true, avatarColor: 'bg-black', initials: 'SI', to: 'Eloise Sawyer'
    },
    {
      id: '2', sender: 'Juno', subject: 'Order #8821 Shipped', preview: 'Your Omni-Bone is on the way.', body: `Hi Eloise,\n\nOrder #8821 shipped via Drone Express.`, time: 'Yesterday', dateFull: 'Yesterday at 4:20 PM', unread: true, isVip: false, avatarColor: 'bg-black', initials: 'J', to: 'Eloise Sawyer'
    }
  ]);

  // 4. CART & TRANSACTIONS
  const [globalCart, setGlobalCart] = useState<GlobalCartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([
      { id: 't1', merchant: 'Sephora', category: 'Beauty & Cosmetics', amount: '-$142.50', date: 'Today', type: 'debit', icon: CreditCard, color: 'bg-pink-100 text-pink-600' },
      { id: 't4', merchant: 'Whole Foods Market', category: 'Groceries', amount: '-$350.22', date: 'Today', type: 'debit', icon: ShoppingCart, color: 'bg-green-100 text-green-600' },
      { id: 't3', merchant: 'Daniel Sawyer', category: 'Wire Transfer', amount: '+$8,500.00', date: 'Yesterday', type: 'credit', icon: ArrowDownLeft, color: 'bg-green-100 text-green-600' },
  ]);

  // Shared Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { id: 1, title: "New Year's Brunch", time: "11:00 AM", end: "1:00 PM", location: "Home", type: "Social", color: "bg-orange-500", weatherIconName: 'Sun', silasContext: "Tradition with Mom & Dad.", evidence: [] },
    { id: 2, title: "School Pickup", time: "3:00 PM", end: "3:30 PM", location: "Elementary School", type: "Personal", color: "bg-green-500", weatherIconName: 'Cloud', silasContext: "Talulah & Rue pickup.", evidence: [] },
    { id: 3, title: "Vet for Hunter", time: "4:00 PM", end: "5:00 PM", location: "Palo Alto Vet", type: "Personal", color: "bg-blue-500", weatherIconName: 'Sun', silasContext: "Annual checkup for Hunter.", evidence: [] },
    { id: 4, title: "Dinner with Daniel", time: "7:00 PM", end: "9:00 PM", location: "Nobu", type: "Social", color: "bg-purple-500", weatherIconName: 'Moon', silasContext: "Anniversary Dinner.", evidence: [] },
    { id: 5, title: "Talulah's Recital", time: "10:00 AM", end: "12:00 PM", location: "Community Center", type: "Personal", color: "bg-pink-500", weatherIconName: 'Cloud', silasContext: "Dance recital.", evidence: [] }
  ]);

  // Determine status bar color
  const statusBarColor = useMemo(() => {
      if (['settings', 'phone', 'messages', 'calendar', 'mail', 'photos', 'zion', 'joyride'].includes(activeApp || '')) return 'black';
      return 'white';
  }, [activeApp]);

  const installableAppsRegistry: Record<string, any> = {
      'zion': {
        name: 'Juno', isSpecial: true, action: () => setActiveApp('zion'),
        component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-white flex items-center justify-center shadow-md relative overflow-hidden"><div className="text-black font-serif tracking-widest font-bold text-[10px]">JUNO</div></div>
      },
      'charityfly': {
        name: 'Charity Fly', isSpecial: true, action: () => setActiveApp('charityfly'),
        component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-sky-100 flex items-center justify-center shadow-md border border-sky-200"><Plane size={24} className="text-sky-600 mb-0.5" /></div>
      },
      'unsent': {
        name: 'Unsent Drafts', isSpecial: true, action: () => setActiveApp('unsent'),
        component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-[#0f172a] flex items-center justify-center shadow-md border border-gray-700"><HardDrive size={28} className="text-green-500" /></div>
      }
  };

  const handleInstallApp = (appId: string) => {
      if (!installedApps.includes(appId)) setInstalledApps(prev => [...prev, appId]);
  };

  // Base Apps (Reduced to fit on one screen with custom apps)
  const baseApps = [
    { name: 'FaceTime', component: <AppIconImage src="https://i.postimg.cc/qqYYftYQ/Face-Time-i-OS-svg.png" /> },
    { name: 'Calendar', isSpecial: true, action: () => setActiveApp('calendar'), component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-white flex flex-col items-center justify-center shadow-md font-sans"><span className="text-[10px] font-bold text-red-500 uppercase mt-1">THU</span><span className="text-[2.2rem] font-light text-black -mt-1 tracking-tighter leading-none">1</span></div> },
    { name: 'Photos', isSpecial: true, action: () => setActiveApp('photos'), component: <AppIconImage src="https://i.postimg.cc/rwFxCxX7/ios-photos.jpg" /> }, 
    { name: 'Camera', component: <AppIconImage src="https://i.postimg.cc/CxYyw859/Fotocamera-(i-OS).png" /> },
    { name: 'Mail', isSpecial: true, action: () => setActiveApp('mail'), component: <AppIconImage src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Mail_%28iOS%29.svg" /> },
    { name: 'Clock', component: <AppIconImage src="https://i.postimg.cc/7685mXmf/Clock-(i-OS).png" /> },
    { name: 'Maps', component: <AppIconImage src="https://i.postimg.cc/9F3LyjdW/Apple-Maps-Logo-3D.png" /> },
    { name: 'Weather', isSpecial: true, action: () => setActiveApp('weather'), component: <AppIconImage src="https://i.postimg.cc/zX8pBFwS/Weather-(i-OS).png" /> },
    { name: 'Settings', isSpecial: true, action: () => setActiveApp('settings'), component: <AppIconImage src="https://i.postimg.cc/85C02jvp/free-apple-settings-icon-svg-download-png-493162.webp" /> },
    { name: 'Wallet', action: () => setActiveApp('wallet'), isSpecial: true, component: <AppIconImage src="https://i.postimg.cc/TPbwr31d/png-clipart-apple-wallet-apple-pay-ios-9-apple-rectangle-payment-thumbnail.png" /> },
    { name: 'JoyRide', isSpecial: true, action: () => setActiveApp('joyride'), component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-white flex items-center justify-center shadow-md relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-emerald-500" /><div className="relative z-10 text-white font-black italic tracking-tighter text-sm">JoyRide</div></div> },
    { name: 'Bank of Charity', isSpecial: true, action: () => setActiveApp('charity'), component: <AppIconImage src="https://i.postimg.cc/8zdRWb9r/Bank-of-Charity.png" /> },
    { name: 'Notes', component: <AppIconImage src="https://i.postimg.cc/766vzyrt/Apple-Notes-(i-OS).png" /> },
    { name: 'Books', isSpecial: true, action: () => setActiveApp('books'), component: <AppIconImage src="https://i.postimg.cc/wTzC5JzJ/free_apple_ibooks_icon_svg_download_png_493146.webp" /> },
    { name: 'Silas', isSpecial: true, action: () => setActiveApp('silas'), component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-black flex items-center justify-center shadow-md relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 to-black" /><div className="relative z-10 w-8 h-8 rounded-full border border-indigo-500 flex items-center justify-center"><Activity size={18} className="text-indigo-400" /></div></div> },
    { name: 'Silas Search', isSpecial: true, action: () => setActiveApp('silas-search'), component: <div className="w-[3.8rem] h-[3.8rem] rounded-[14px] bg-white flex items-center justify-center shadow-md border border-purple-200"><SilasLogo className="w-8 h-8" /></div> },
    { name: 'App Store', isSpecial: true, action: () => setActiveApp('appstore'), component: <AppIconImage src="https://i.postimg.cc/jS73GSRH/App-Store-(i-OS)-svg.png" /> },
  ];

  const displayedApps = useMemo(() => {
      const installedComponents = installedApps.map(id => installableAppsRegistry[id]).filter(Boolean);
      return [...baseApps, ...installedComponents];
  }, [installedApps]);

  const chunk = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (v, i) => arr.slice(i * size, i * size + size));
  const pages = chunk(displayedApps, 20);

  const paginate = (newDirection: number) => {
    const newPage = page + newDirection;
    if (newPage >= 0 && newPage < pages.length) {
        setPage([newPage, newDirection]);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 320 : -320,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 320 : -320,
      opacity: 0
    })
  };

  return (
    <div className="h-full w-full bg-black relative overflow-hidden">
      
      {/* Background Audio Player (Hidden) */}
      <audio ref={audioRef} loop={false} onEnded={() => setIsPlaying(false)} />

      <div className="absolute top-0 left-0 w-full z-[60] pointer-events-none">
          <StatusBar os={OSType.IOS} color={statusBarColor} showLock={!activeApp} />
      </div>
      
      {/* Wallpaper */}
      <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{
              backgroundImage: 'url("https://i.postimg.cc/kXgL18YZ/IMG-0402.jpg")',
              filter: activeApp ? 'blur(20px) brightness(0.4)' : 'blur(3px) brightness(0.8)',
              transform: activeApp ? 'scale(1.1)' : 'scale(1)'
          }}
      />

      {/* Grid */}
      <div className={`absolute inset-0 flex flex-col pt-14 pb-2 transition-all duration-300 ${activeApp ? 'scale-95 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
          <div className="flex-1 w-full relative">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div 
                    key={page}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 px-6 grid grid-cols-4 gap-x-5 gap-y-6 content-start pt-8"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={1}
                    onDragEnd={(e, { offset, velocity }) => {
                        const swipe = offset.x;
                        if (swipe < -30) {
                            paginate(1);
                        } else if (swipe > 30) {
                            paginate(-1);
                        }
                    }}
                    style={{ touchAction: 'pan-y' }}
                >
                    {pages[page] && pages[page].map((app) => (
                        <motion.div key={app.name} whileTap={{ scale: 0.9 }} onClick={app.action} className="flex flex-col items-center gap-1.5 cursor-pointer select-none">
                            {app.component}
                            <span className="text-[11px] font-medium text-white tracking-normal drop-shadow-lg text-center leading-3 h-3 overflow-visible">{app.name}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-2 mb-6 relative z-10">
            {pages.map((_, i) => (
                <div 
                    key={i} 
                    onClick={() => setPage([i, i > page ? 1 : -1])} 
                    className={`w-2 h-2 rounded-full shadow-sm transition-colors cursor-pointer ${i === page ? 'bg-white' : 'bg-white/40'}`} 
                />
            ))}
          </div>

          <div className="mx-3 mb-2 h-[5.5rem] bg-white/20 backdrop-blur-2xl rounded-[2.2rem] flex items-center justify-center relative z-10 gap-5 px-4">
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setActiveApp('phone')} className="w-[3.8rem] h-[3.8rem] cursor-pointer"><AppIconImage src="https://i.postimg.cc/Fsqj5bKw/Phone-i-OS.png" /></motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setActiveApp('safari')} className="w-[3.8rem] h-[3.8rem] cursor-pointer"><AppIconImage src="https://i.postimg.cc/YSXFRQTg/Safari-browser-logo-svg.png" /></motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setActiveApp('messages')} className="w-[3.8rem] h-[3.8rem] cursor-pointer"><AppIconImage src="https://i.postimg.cc/NMwDh6pC/IMessage-logo-svg.png" /></motion.div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setActiveApp('music')} className="w-[3.8rem] h-[3.8rem] cursor-pointer"><AppIconImage src="https://i.postimg.cc/kgL3bHg2/Apple-Music-icon-svg.png" /></motion.div>
          </div>
      </div>

      {/* --- APPS --- */}
      <AnimatePresence>
        {activeApp === 'joyride' && (
            <JoyRideApp 
                onClose={() => setActiveApp(null)} 
                activeRide={activeRide}
                setActiveRide={setActiveRide}
                contacts={contacts}
            />
        )}
        {activeApp === 'silas' && (
            <SilasApp 
                onClose={() => setActiveApp(null)} 
                globalCart={globalCart} 
                setGlobalCart={setGlobalCart} 
                silasConfig={silasConfig}
                setSilasConfig={setSilasConfig}
            />
        )}
        {activeApp === 'silas-search' && <SilasSearchApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'phone' && <PhoneApp onClose={() => setActiveApp(null)} contacts={contacts} setContacts={setContacts} networkMode={networkMode} />}
        {activeApp === 'messages' && <MessagesApp onClose={() => setActiveApp(null)} contacts={contacts} setContacts={setContacts} conversations={conversations} setConversations={setConversations} onSendMessage={handleSendMessage} />}
        {activeApp === 'mail' && <MailApp onClose={() => setActiveApp(null)} emails={emails} setEmails={setEmails} />}
        {activeApp === 'music' && <MusicApp onClose={() => setActiveApp(null)} currentSong={currentSong} isPlaying={isPlaying} onPlay={(s) => { setCurrentSong(s); setIsPlaying(true); }} onPause={() => setIsPlaying(false)} onNext={() => {}} onPrev={() => {}} />}
        {activeApp === 'safari' && <SafariApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'zion' && <ZionStoreApp onClose={() => setActiveApp(null)} onTransaction={(t) => setTransactions(prev => [t, ...prev])} cart={globalCart} addToCart={(i) => setGlobalCart(p => [...p, i])} removeFromCart={(id) => setGlobalCart(p => p.filter(x => x.id !== id))} />}
        {activeApp === 'charity' && <CharityBankApp onClose={() => setActiveApp(null)} transactions={transactions} onAddToCart={(i) => setGlobalCart(p => [...p, { ...i, id: Date.now().toString(), addedAt: new Date() }])} />}
        {activeApp === 'charityfly' && <CharityFlyApp onClose={() => setActiveApp(null)} onShareContext={handleShareItinerary} />}
        {activeApp === 'appstore' && <AppStoreApp onClose={() => setActiveApp(null)} installedApps={installedApps} onInstall={handleInstallApp} onOpenApp={setActiveApp} />}
        {activeApp === 'settings' && (
            <SettingsApp 
                onClose={() => setActiveApp(null)} 
                networkMode={networkMode} 
                setNetworkMode={setNetworkMode} 
                silasConfig={silasConfig}
                setSilasConfig={setSilasConfig}
            />
        )}
        {activeApp === 'wallet' && <WalletApp onClose={() => setActiveApp(null)} onOpenApp={setActiveApp} />}
        {activeApp === 'unsent' && <UnsentDrivesApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'books' && <BooksApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'photos' && <PhotosApp onClose={() => setActiveApp(null)} />}
        {activeApp === 'weather' && <WeatherApp onClose={() => setActiveApp(null)} calendarEvents={calendarEvents} />}
        {activeApp === 'calendar' && (
            <CalendarApp 
                onClose={() => setActiveApp(null)} 
                events={calendarEvents} 
                setEvents={setCalendarEvents} 
                activeRide={activeRide}
                setActiveRide={setActiveRide}
                onOpenJoyRide={() => setActiveApp('joyride')}
            />
        )}
      </AnimatePresence>
    </div>
  );
};
