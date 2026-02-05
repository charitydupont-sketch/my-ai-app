
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, ChevronLeft, Settings as SettingsIcon, Activity, List, CreditCard, MessageSquare, Voicemail, Sparkles, BrainCircuit, ShoppingBag, Book, Footprints, Users, Fingerprint, Map, FileText, Image as ImageIcon, Plane, Lock, Heart, Briefcase, FileX, Signal, X, Play, Pause, ArrowLeft, Star, Smile, Loader2, MapPin, Home, Clock, Scroll, Receipt, Shield, User, Car, Info, Truck, Check, Ban, Package, Store, Baby, LogOut, LogIn, AlertCircle, Plus, Search, Trash2, Globe, Phone, Sliders, Layers, Music, Calendar as CalendarIcon, ThumbsUp, ThumbsDown, BookOpen, CloudRain, CloudSun, TrendingUp, Newspaper, Bell, Lock as LockIcon } from 'lucide-react';
import { generateSpeech, generateImage } from '../services/geminiService';
import { GlobalCartItem } from '../types';

interface SilasAppProps {
  onClose: () => void;
  globalCart?: GlobalCartItem[];
  setGlobalCart?: React.Dispatch<React.SetStateAction<GlobalCartItem[]>>;
  silasConfig: { permissionsGranted: boolean; isSignedIn: boolean; };
  setSilasConfig: React.Dispatch<React.SetStateAction<{ permissionsGranted: boolean; isSignedIn: boolean; }>>;
}

// --- Types ---
interface EvidenceItem {
    id: string; // Added ID for deletion
    type: 'text' | 'voice' | 'photo' | 'document' | 'location' | 'obituary' | 'recipe' | 'ticket' | 'web' | 'email';
    icon: any;
    label: string;
    date: string;
    detail: string;
    content?: string;
    title: string;
    imageUrl?: string;
    imagePrompt?: string; // For generating fake evidence
    audioTranscript?: string; // For generating speech
    audioUrl?: string; // Direct URL if available
    // For simulated context
    contextMessages?: { sender: string; text: string; isMe: boolean; isTarget?: boolean }[]; 
}

interface PersonProfile {
    id: string;
    name: string;
    relation: string;
    status: string;
    confidence: number;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    summary: string;
    evidence: EvidenceItem[];
    // Influence Settings
    influences: boolean;
    influenceTopics: string[];
}

// --- Custom Components ---

// Silas Logo
export const SilasLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <path d="M50 5 L90 20 V50 C90 75 50 95 50 95 C50 95 10 75 10 50 V20 L50 5Z" fill="url(#silasGrad)" stroke="white" strokeWidth="2"/>
    <path d="M35 35 H65 M35 35 V50 H65 V65 H35" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Simulated Message Bubble
const MessageBubble: React.FC<{ text: string, isMe: boolean, isTarget?: boolean }> = ({ text, isMe, isTarget }) => (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-3 relative w-full`}>
        <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-[16px] leading-snug relative whitespace-pre-wrap break-words ${
            isMe 
            ? 'bg-blue-500 text-white rounded-br-sm' 
            : 'bg-[#262626] text-white rounded-bl-sm'
        }`}>
            {text}
        </div>
        {/* Red Circle Animation for Target Evidence */}
        {isTarget && (
            <div className="absolute -inset-4 pointer-events-none z-20">
                <svg className="w-full h-full overflow-visible">
                    <motion.path
                        d="M 10,25 C 10,10 30,-5 80,5 C 130,15 140,40 120,55 C 100,70 40,65 20,50 C 5,40 10,25 10,25"
                        fill="none"
                        stroke="#ef4444" // Red-500
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                        // Scale path to fit dynamic bubble roughly
                        transform="scale(1.1, 1.2)" 
                    />
                </svg>
            </div>
        )}
    </div>
);

// --- AUDIO HELPERS ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  let alignedData = data;
  if (data.byteLength % 2 !== 0) {
      alignedData = data.slice(0, data.byteLength - 1);
  }
  
  const dataInt16 = new Int16Array(alignedData.buffer.slice(alignedData.byteOffset, alignedData.byteOffset + alignedData.byteLength));
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Nav Item Component
const NavItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 w-16 transition-colors ${active ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
        <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={active ? 0 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

// --- MOCK INITIAL DATA ---
const INITIAL_PROFILES: PersonProfile[] = [
      {
          id: 'shiloh',
          name: 'Shiloh',
          relation: 'Best Friend (Deceased)',
          status: 'Archived',
          confidence: 100.0,
          color: 'text-amber-200',
          bgColor: 'bg-amber-900/20',
          borderColor: 'border-amber-500/50',
          icon: <Sparkles className="w-5 h-5 text-amber-200 fill-amber-200/20" />,
          summary: "Identified as Best Friend (2015-2023). Status confirmed as 'Deceased'. Legacy Mode active via Grief Protocols.",
          influences: true,
          influenceTopics: ['Music', 'Travel', 'Food'],
          evidence: [
              { 
                  id: 'ev1',
                  type: 'obituary', 
                  icon: Scroll, 
                  label: 'Obituary Record', 
                  date: 'Aug 24, 2023', 
                  detail: 'Match found in NYT Archives. Confidence: 99.9%.',
                  content: "Shiloh Lewis, 28, passed away peacefully on August 24th, 2023. A spirited adventurer, Shiloh is survived by her loving family and countless friends who were touched by her light.",
                  title: "Obituary: Shiloh Lewis",
                  contextMessages: [] 
              },
              {
                  id: 'ev2',
                  type: 'photo',
                  icon: MapPin,
                  label: 'Grave Site',
                  date: 'Sep 01, 2023',
                  detail: 'Location verified: Serenity Gardens Cemetery.',
                  title: "Photo: Resting Place",
                  imagePrompt: "A weathered grey granite headstone in a cemetery with the engraved name 'SHILOH LEWIS' and dates '1995 - 2023', surrounded by green grass and a small bouquet of dried flowers, natural overcast lighting, realistic photography"
              },
              {
                  id: 'ev3',
                  type: 'ticket',
                  icon: Receipt,
                  label: 'Kept Artifact',
                  date: 'June 12, 2023',
                  detail: 'Concert Ticket Stub found in photo library.',
                  title: "Ticket: The National",
                  imagePrompt: "A used concert ticket stub for The National, date June 12 2023, realistic texture, lying on a wooden surface, high detail photography"
              },
              { 
                  id: 'ev4',
                  type: 'voice', 
                  icon: Mic, 
                  label: 'Last Voicemail', 
                  date: 'Aug 23, 2023', 
                  detail: 'Biometric voice ID matches "Shiloh". High emotional resonance detected.',
                  audioTranscript: "Hey El! Signal is spotty up here but I'm safe. Just wanted to hear your voice. Love you, bye!",
                  title: "Voicemail: The Hike"
              }
          ]
      },
      {
          id: 'daniel',
          name: 'Daniel',
          relation: 'Husband',
          status: 'Active',
          confidence: 99.9,
          color: 'text-blue-400',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-500/50',
          icon: <Heart className="w-5 h-5 text-blue-400 fill-blue-400/20" />,
          summary: "Primary relationship. High frequency of contact. Shared financial assets and location data indicate cohabitation.",
          influences: true,
          influenceTopics: ['Shopping', 'Calendar', 'Finance'],
          evidence: [
              {
                  id: 'ev5',
                  type: 'document',
                  icon: FileText,
                  label: 'Legal Document',
                  date: 'June 20, 2020',
                  detail: 'Marriage Certificate scan detected in secure vault.',
                  title: "Certificate: Marriage License",
                  imagePrompt: "A formal marriage certificate document for Daniel Sawyer and Eloise Sawyer, dated June 20 2020, official government seal, paper texture, high quality scan"
              },
              {
                  id: 'ev6',
                  type: 'text',
                  icon: MessageSquare,
                  label: 'Daily Check-ins',
                  date: 'Ongoing',
                  detail: 'Consistent messaging pattern detected (Morning/Evening).',
                  title: "Chat Analysis: Routine",
                  contextMessages: [
                      { sender: 'Daniel', text: "Dinner's in the oven.", isMe: false },
                      { sender: 'Me', text: "Be there in 20.", isMe: true }
                  ]
              },
              {
                  id: 'ev7',
                  type: 'location',
                  icon: Map,
                  label: 'Shared Location',
                  date: 'Live',
                  detail: 'Device proximity >12hrs/day.',
                  title: "Location: 1042 Silicon Ave"
              }
          ]
      },
      {
          id: 'kids',
          name: 'Talulah & Rue',
          relation: 'Daughters',
          status: 'Protected',
          confidence: 99.5,
          color: 'text-orange-400',
          bgColor: 'bg-orange-900/20',
          borderColor: 'border-orange-500/50',
          icon: <Baby className="w-5 h-5 text-orange-400" />,
          summary: "Children detected. High volume of photo capture and calendar events (School, Pediatrician).",
          influences: true,
          influenceTopics: ['Shopping', 'Schedule', 'Safety'],
          evidence: [
              {
                  id: 'ev8',
                  type: 'photo',
                  icon: ImageIcon,
                  label: 'First Day of School',
                  date: 'Sep 05, 2025',
                  detail: 'Photo metadata: Elementary School.',
                  title: "Photo: Talulah & Rue",
                  imagePrompt: "A photo of two young girls, Talulah and Rue, wearing backpacks and smiling on their first day of school, suburban porch setting, morning light, realistic family photography"
              }
          ]
      },
      {
          id: 'mom',
          name: 'Mom',
          relation: 'Mother',
          status: 'Active',
          confidence: 98.5,
          color: 'text-pink-400',
          bgColor: 'bg-pink-900/20',
          borderColor: 'border-pink-500/50',
          icon: <User className="w-5 h-5 text-pink-400" />,
          summary: "Maternal figure. Communication characterized by check-ins and family event planning. High priority notification status.",
          influences: true,
          influenceTopics: ['Calendar', 'Recipes', 'Health'],
          evidence: [
              {
                  id: 'ev9',
                  type: 'document',
                  icon: FileText,
                  label: 'Birth Certificate',
                  date: 'Apr 05, 1993',
                  detail: 'File scan. Mother listed: Eleanor Sawyer.',
                  title: "Document: Birth Certificate",
                  imagePrompt: "A close up photo of an official birth certificate document for 'Eloise Sawyer', aged paper with creases, official government wax seal, typewriter font, listing mother 'Eleanor Sawyer', date of birth April 5 1993, realistic texture"
              },
              {
                  id: 'ev10',
                  type: 'recipe',
                  icon: Book,
                  label: 'Handwritten Note',
                  date: 'Sep 15, 2023',
                  detail: 'Recipe for "Nana\'s Lasagna". Handwriting match "Mom".',
                  title: "Note: Family Recipes",
                  imagePrompt: "A handwritten recipe card for Lasagna on old index paper, cursive handwriting, kitchen aesthetic, realistic photography"
              },
              {
                  id: 'ev11',
                  type: 'voice',
                  icon: Voicemail,
                  label: 'Voicemail Log',
                  date: 'Oct 22, 2023',
                  detail: 'Sentiment Analysis: Caring/Anxious.',
                  title: "Voicemail: Sunday Dinner",
                  audioTranscript: "Hi honey, just checking if you're coming for roast on Sunday. Dad bought that wine you like. Call me back!"
              }
          ]
      },
      {
          id: 'thomas',
          name: 'Thomas',
          relation: 'Ex-Partner',
          status: 'Restricted',
          confidence: 92.0,
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/50',
          icon: <Ban className="w-5 h-5 text-red-400" />,
          summary: "Former romantic partner. Breakup detected approx. 6 months ago via keyword analysis ('move out', 'it's over'). Contact is sporadic and emotionally charged.",
          influences: false,
          influenceTopics: [],
          evidence: [
              {
                  id: 'ev12',
                  type: 'text',
                  icon: MessageSquare,
                  label: 'Breakup Thread',
                  date: 'April 14, 2023',
                  detail: 'High stress markers detected.',
                  title: "Chat: The End",
                  contextMessages: [
                      { sender: 'Thomas', text: "Is this really it?", isMe: false },
                      { sender: 'Me', text: "I can't do this anymore, Thomas.", isMe: true },
                      { sender: 'Thomas', text: "I'll pack my things.", isMe: false }
                  ]
              },
              {
                  id: 'ev13',
                  type: 'photo',
                  icon: ImageIcon,
                  label: 'Archived Photo',
                  date: 'Feb 14, 2023',
                  detail: 'Detected in "Hidden" folder.',
                  title: "Photo: Valentine's 2023",
                  imagePrompt: "A polaroid photograph of a couple's hands held together, sunset lighting, nostalgic vibe, slightly grainy, 2023 aesthetic"
              }
          ]
      },
      {
          id: 'aris',
          name: 'Dr. Aris',
          relation: 'Therapist',
          status: 'Professional',
          confidence: 95.0,
          color: 'text-purple-400',
          bgColor: 'bg-purple-900/20',
          borderColor: 'border-purple-500/50',
          icon: <Activity className="w-5 h-5 text-purple-400" />,
          summary: "Medical professional. Recurring calendar appointments detected weekly on Tuesdays. Voice memos suggest therapy context.",
          influences: true,
          influenceTopics: ['Wellness', 'Health', 'Schedule'],
          evidence: [
              {
                  id: 'ev14',
                  type: 'document',
                  icon: FileText,
                  label: 'Appointment Receipt',
                  date: 'Weekly',
                  detail: 'Recurring payment: $150.00',
                  title: "Billing: Dr. Aris Psychology",
                  imagePrompt: "A printed medical receipt for Dr. Aris Psychology, amount $150.00, printed on white paper, realistic texture, closeup"
              }
          ]
      }
  ];

export const SilasApp: React.FC<SilasAppProps> = ({ onClose, globalCart = [], setGlobalCart, silasConfig, setSilasConfig }) => {
  const [activeTab, setActiveTab] = useState<'HOME' | 'MEMORY' | 'PROFILE' | 'CART'>('HOME');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  
  // Navigation State
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceItem | null>(null);
  const [profiles, setProfiles] = useState<PersonProfile[]>(INITIAL_PROFILES);
  const [activeTile, setActiveTile] = useState<string | null>(null);

  // Settings State
  const [scanDepth, setScanDepth] = useState(3); // 3 = 4 Years
  const scanOptions = ['30 Days', '6 Months', '1 Year', '4 Years', 'Lifetime'];

  // Add Evidence/Person State
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRelation, setNewPersonRelation] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceCategory, setEvidenceCategory] = useState<'ALL'|'TEXT'|'CALL'|'PHOTO'|'EMAIL'>('ALL');
  
  // Preferences State
  const [allergies, setAllergies] = useState(['Peanuts', 'Latex']);
  const [likes, setLikes] = useState(['Modern Style', 'Healthy Food', 'Sci-Fi']);
  const [dislikes, setDislikes] = useState(['Clutter', 'Spicy Food']);
  const [allergyInput, setAllergyInput] = useState('');
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  // Image Generation State
  const [evidenceImages, setEvidenceImages] = useState<Record<string, string>>({});
  const [loadingImage, setLoadingImage] = useState(false);

  // Info Modal State
  const [showInfo, setShowInfo] = useState(false);
  
  // Checkout State
  const [checkoutStatus, setCheckoutStatus] = useState<'IDLE' | 'REVIEW_DELIVERY' | 'PROCESSING' | 'DONE'>('IDLE');
  const [deliveryMethods, setDeliveryMethods] = useState<Record<string, 'DELIVERY' | 'PICKUP'>>({});
  
  // Login State Animation
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- MOCK DATA ---
  const history = [
      { id: 2, type: 'book', title: 'Bookmarked Page', desc: 'The Midnight Library', time: '1 hr ago', details: 'Saved location: Page 42.\nNoted highlight regarding "Parallel Lives".' },
      { id: 4, type: 'pay', title: 'Bill Paid: Electric', desc: '$145.00 via Bank of Charity', time: 'Yesterday', details: 'Provider: City Power\nDue: Sep 20\nStatus: Paid' },
  ];

  // --- MOCK SEARCH LOGIC ---
  const getMockSearchResults = () => {
      const person = profiles.find(p => p.id === selectedPerson);
      if (!person) return [];
      
      const allMockItems = [
          { type: 'text', label: `Text: "Hey ${person.name}, where are you?"`, detail: 'From Messages app', date: 'Yesterday' },
          { type: 'text', label: `Text: "Can you grab milk?"`, detail: 'From Messages app', date: '2 days ago' },
          { type: 'voice', label: `Call: ${person.name} (Missed)`, detail: 'Incoming Call', date: 'Last week' },
          { type: 'photo', label: `Photo with ${person.name}`, detail: 'Face detected in library', date: 'Aug 12, 2023' },
          { type: 'email', label: `Email: Re: Dinner Plans`, detail: 'Subject match', date: 'Oct 15, 2023' },
          { type: 'web', label: `Link: ${person.name}'s Wishlist`, detail: 'Found in Notes', date: 'Sep 20, 2023' },
      ];

      return allMockItems.filter(item => {
          if (evidenceCategory !== 'ALL' && item.type.toUpperCase() !== evidenceCategory) return false;
          if (searchQuery && !item.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
          return true;
      });
  };

  // --- ACTIONS ---
  const handleDeleteEvidence = (evidenceId: string) => {
      if (selectedPerson) {
          setProfiles(prev => prev.map(p => {
              if (p.id !== selectedPerson) return p;
              return { ...p, evidence: p.evidence.filter(e => e.id !== evidenceId) };
          }));
          setActiveEvidence(null);
          // Stop audio if playing
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch (e) {}
              audioSourceRef.current = null;
          }
          setIsPlayingAudio(false);
      }
  };

  const handleAddEvidence = (item: any) => {
      if (selectedPerson) {
          const newEvidence: EvidenceItem = {
              id: Date.now().toString(),
              type: item.type,
              icon: item.type === 'text' ? MessageSquare : item.type === 'voice' ? Phone : item.type === 'email' ? FileText : item.type === 'web' ? Globe : ImageIcon,
              label: item.label,
              title: item.label,
              detail: item.detail,
              date: item.date,
              content: `${item.label} - Added manually from device search. Original source: ${item.detail}.`,
          };

          setProfiles(prev => prev.map(p => {
              if (p.id !== selectedPerson) return p;
              return { ...p, evidence: [newEvidence, ...p.evidence] };
          }));
          setShowAddEvidence(false);
          setSearchQuery('');
      }
  };

  const handleAddNewPerson = () => {
      if (!newPersonName.trim()) return;
      const newId = Date.now().toString();
      const newProfile: PersonProfile = {
          id: newId,
          name: newPersonName,
          relation: newPersonRelation || 'Unknown',
          status: 'Monitoring',
          confidence: 50.0,
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/50',
          icon: <User className="w-5 h-5 text-gray-400" />,
          summary: "New entity added to monitoring graph. Analyzing connections...",
          evidence: [],
          influences: true,
          influenceTopics: []
      };
      setProfiles(prev => [...prev, newProfile]);
      setShowAddPersonModal(false);
      setNewPersonName('');
      setNewPersonRelation('');
  };

  const handleDeletePerson = (id: string) => {
      setProfiles(prev => prev.filter(p => p.id !== id));
      setSelectedPerson(null);
  };

  const toggleInfluence = (id: string) => {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, influences: !p.influences } : p));
  };

  const addTag = (type: 'allergy'|'like'|'dislike') => {
    if(type === 'allergy' && allergyInput.trim()) { setAllergies([...allergies, allergyInput.trim()]); setAllergyInput(''); }
    if(type === 'like' && likeInput.trim()) { setLikes([...likes, likeInput.trim()]); setLikeInput(''); }
    if(type === 'dislike' && dislikeInput.trim()) { setDislikes([...dislikes, dislikeInput.trim()]); setDislikeInput(''); }
  };

  const removeTag = (type: 'allergy'|'like'|'dislike', tag: string) => {
    if(type === 'allergy') setAllergies(allergies.filter(t => t !== tag));
    if(type === 'like') setLikes(likes.filter(t => t !== tag));
    if(type === 'dislike') setDislikes(dislikes.filter(t => t !== tag));
  };

  // --- Effects ---
  useEffect(() => {
    if (!isListening) return;
    const phrases = ["Analyzing ambient audio...", "Detected context: 'Project Deadline'...", "Summarizing key points...", "Eloise looks stressed..."];
    let i = 0;
    const int = setInterval(() => {
        if(i < phrases.length) {
            setTranscript(prev => [...prev, phrases[i]]);
            i++;
        }
    }, 2500);
    return () => clearInterval(int);
  }, [isListening]);

  // Audio Cleanup
  useEffect(() => {
      return () => {
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch(e) {}
          }
          if (audioContextRef.current) {
              audioContextRef.current.close();
          }
      };
  }, []);

  // Evidence Image Generation
  useEffect(() => {
      if (activeEvidence?.imagePrompt && !evidenceImages[activeEvidence.title]) {
          setLoadingImage(true);
          generateImage(activeEvidence.imagePrompt).then(url => {
              if (url) {
                  setEvidenceImages(prev => ({...prev, [activeEvidence.title]: url}));
              }
              setLoadingImage(false);
          });
      }
  }, [activeEvidence]);

  // Initialize delivery methods
  useEffect(() => {
      if (globalCart.length > 0) {
          const stores = Array.from(new Set(globalCart.map(i => i.store)));
          const defaults: Record<string, 'DELIVERY' | 'PICKUP'> = {};
          stores.forEach(s => defaults[s] = 'DELIVERY');
          setDeliveryMethods(defaults);
      }
  }, [globalCart.length]);

  // --- Audio Logic ---
  const toggleAudio = async () => {
      if (isPlayingAudio) {
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch (e) {}
              audioSourceRef.current = null;
          }
          setIsPlayingAudio(false);
          return;
      }

      if (!activeEvidence?.audioTranscript) return;

      setIsLoadingAudio(true);
      try {
          if (!audioContextRef.current) {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }
          if (audioContextRef.current.state === 'suspended') {
              await audioContextRef.current.resume();
          }

          let voiceName = 'Kore';
          if (activeEvidence.title.includes('Thomas')) voiceName = 'Puck';
          if (activeEvidence.title.includes('Mom')) voiceName = 'Kore';
          if (activeEvidence.title.includes('Shiloh')) voiceName = 'Fenrir'; 

          const base64 = await generateSpeech(activeEvidence.audioTranscript, voiceName);
          
          if (base64) {
              const audioBuffer = await decodeAudioData(decodeBase64(base64), audioContextRef.current);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              
              source.onended = () => {
                  setIsPlayingAudio(false);
                  audioSourceRef.current = null;
              };
              
              source.start();
              audioSourceRef.current = source;
              setIsPlayingAudio(true);
          }
      } catch (err) {
          console.error("Evidence audio error", err);
      } finally {
          setIsLoadingAudio(false);
      }
  };

  // --- Helpers ---
  const handleBack = () => {
      if (activeTile) {
          setActiveTile(null);
          return;
      }
      if (activeEvidence) {
          if (audioSourceRef.current) {
              try { audioSourceRef.current.stop(); } catch(e) {}
              audioSourceRef.current = null;
          }
          setIsPlayingAudio(false);
          setActiveEvidence(null);
          return;
      }
      if (selectedPerson) {
          setSelectedPerson(null);
          return;
      }
      if (activeTab === 'PROFILE') {
          setActiveTab('HOME');
          return;
      }
      if (checkoutStatus === 'REVIEW_DELIVERY') {
          setCheckoutStatus('IDLE');
          return;
      }
      onClose();
  };

  // --- LOGIN LOGIC ---
  const handleSignIn = () => {
      setIsLoggingIn(true);
      setTimeout(() => {
          setSilasConfig(prev => ({ ...prev, isSignedIn: true }));
          setIsLoggingIn(false);
      }, 1500);
  };

  const handleSignOut = () => {
      setSilasConfig(prev => ({ ...prev, isSignedIn: false }));
      // Optional: Reset active tab or clear local session state if needed
      setActiveTab('HOME');
  };

  // --- CART HELPERS ---
  const groupedCart = globalCart.reduce<Record<string, GlobalCartItem[]>>((acc, item) => {
      if (!acc[item.store]) acc[item.store] = [];
      acc[item.store].push(item);
      return acc;
  }, {});

  const cartTotal = globalCart.reduce((sum, item) => sum + item.price, 0);

  const startCheckout = () => {
      setCheckoutStatus('REVIEW_DELIVERY');
  };

  const confirmCheckout = () => {
      setCheckoutStatus('PROCESSING');
      setTimeout(() => {
          setCheckoutStatus('DONE');
          setTimeout(() => {
              if (setGlobalCart) setGlobalCart([]);
              setCheckoutStatus('IDLE');
          }, 3000);
      }, 2500);
  };

  const toggleDeliveryMethod = (store: string) => {
      setDeliveryMethods(prev => ({
          ...prev,
          [store]: prev[store] === 'DELIVERY' ? 'PICKUP' : 'DELIVERY'
      }));
  };

  const getIcon = (type: string) => {
      switch(type) {
          case 'msg': return <MessageSquare className="w-6 h-6" />;
          case 'pay': return <CreditCard className="w-6 h-6" />;
          case 'vm': return <Voicemail className="w-6 h-6" />;
          case 'shop': return <ShoppingBag className="w-6 h-6" />;
          case 'book': return <Book className="w-6 h-6" />;
          case 'fit': return <Footprints className="w-6 h-6" />;
          default: return <Sparkles className="w-6 h-6" />;
      }
  };

  const getColor = (type: string) => {
      switch(type) {
          case 'msg': return 'bg-green-500/10 text-green-400 border-green-500/20';
          case 'pay': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
          case 'vm': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
          case 'shop': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          case 'book': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
          case 'fit': return 'bg-red-500/10 text-red-400 border-red-500/20';
          default: return 'bg-white/10 text-white';
      }
  };

  // --- LOGIN VIEW ---
  if (!silasConfig.isSignedIn) {
      return (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center font-sans text-white p-8"
          >
              <div className="w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-8 shadow-[0_0_60px_rgba(34,197,94,0.15)] relative">
                  <SilasLogo className="w-16 h-16 text-green-400" />
                  {isLoggingIn && <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-ping opacity-50" />}
              </div>
              
              <h1 className="text-4xl font-light mb-2 tracking-tight">Silas <span className="font-bold text-green-400">Intelligence</span></h1>
              <p className="text-gray-500 mb-12 text-sm tracking-widest uppercase">System Version 2.0</p>

              <button 
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className="w-full max-w-xs py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 active:scale-95 transition-all"
              >
                  {isLoggingIn ? (
                      <>
                          <Loader2 className="animate-spin" size={20} /> Authenticating...
                      </>
                  ) : (
                      <>
                          <LogIn size={20} /> Sign In
                      </>
                  )}
              </button>
              
              <div className="mt-8 text-center max-w-xs">
                  <p className="text-[10px] text-gray-600 leading-relaxed">
                      By signing in, you acknowledge that Silas processes personal data locally on your device. Manage data permissions in Settings &gt; Safety Profile.
                  </p>
              </div>
          </motion.div>
      );
  }

  // --- PERMISSION CHECK (POST-LOGIN) ---
  if (silasConfig.isSignedIn && !silasConfig.permissionsGranted) {
      return (
          <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center font-sans text-white p-8"
          >
              <AlertCircle size={48} className="text-yellow-500 mb-6" />
              <h2 className="text-2xl font-bold mb-4 text-center">Permissions Required</h2>
              <p className="text-gray-400 text-center mb-8 max-w-sm leading-relaxed">
                  Silas Intelligence requires connection to your Safety Profile to function. Please enable "Connect to Silas" in your device Settings.
              </p>
              
              <div className="flex flex-col gap-4 w-full max-w-xs">
                  <button 
                      onClick={onClose}
                      className="w-full py-3 border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-colors"
                  >
                      Go to Home Screen
                  </button>
                  <button 
                      onClick={handleSignOut}
                      className="text-gray-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                      Sign Out
                  </button>
              </div>
          </motion.div>
      );
  }

  const DashboardTile = ({ type, title, subtitle, icon: Icon, color, onClick, wide, height }: any) => (
      <motion.div 
          layoutId={`tile-${type}`}
          onClick={onClick}
          className={`relative rounded-3xl p-5 overflow-hidden shadow-lg cursor-pointer group ${color} ${wide ? 'col-span-2' : ''} ${height ? height : 'h-40'} flex flex-col justify-between`}
          whileTap={{ scale: 0.98 }}
      >
          <div className="flex justify-between items-start">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                  <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="bg-black/20 px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Insight Ready
              </div>
          </div>
          <div>
              <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
              <p className="text-white/80 text-xs font-medium mt-1 leading-snug">{subtitle}</p>
          </div>
      </motion.div>
  );

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(e, { offset, velocity }) => {
          if (offset.x > 100 || velocity.x > 200) {
              handleBack();
          }
      }}
      className="absolute inset-0 bg-black z-50 flex flex-col font-sans text-white overflow-hidden h-full w-full"
    >
       {/* Ambient Background */}
       <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-black to-black pointer-events-none"></div>
       <div className="absolute top-[-20%] right-[-30%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>

       {/* --- MAIN HEADER --- */}
       {!activeEvidence && !activeTile && (
           <div className="pt-14 pb-2 px-6 flex justify-between items-center z-20 bg-transparent shrink-0">
               {/* Left: Silas Logo & Text */}
               <div className="flex items-center gap-3">
                   <SilasLogo className="w-8 h-8" />
                   <div>
                       <h1 className="text-lg font-bold leading-none tracking-tight">Silas Intelligence</h1>
                       <span className="text-[10px] text-gray-500 uppercase tracking-widest">System v2.0</span>
                   </div>
               </div>
               
               {/* Right: Profile Access */}
               <div 
                   onClick={() => setActiveTab('PROFILE')}
                   className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border cursor-pointer active:scale-95 transition-transform overflow-hidden ${activeTab === 'PROFILE' ? 'ring-2 ring-white' : ''}`}
               >
                   <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" alt="Profile" />
               </div>
           </div>
       )}

       {/* --- MAIN CONTENT --- */}
       {!activeEvidence && (
           <div className="flex-1 overflow-y-auto pb-32 relative z-10 no-scrollbar">
                
                {/* --- HOME TAB (DASHBOARD) --- */}
                {activeTab === 'HOME' && !selectedPerson && (
                    <div className="px-6 animate-fade-in pt-6 space-y-4">
                        
                        {/* 1. URGENT TO DO */}
                        <DashboardTile 
                            type="TODO"
                            title="Order ballet slippers"
                            subtitle="For Tululah's recital in 3 weeks. High Priority."
                            icon={AlertCircle}
                            color="bg-gradient-to-r from-red-800 to-red-600"
                            wide={true}
                            height="h-32"
                            onClick={() => {}}
                        />

                        {/* 2. TRACKING */}
                        <DashboardTile 
                            type="TRACKING"
                            title="Tracking on Upcoming Orders"
                            subtitle="2 Packages arriving tomorrow by 8 PM."
                            icon={Package}
                            color="bg-gradient-to-r from-blue-800 to-blue-600"
                            wide={true}
                            height="h-28"
                            onClick={() => {}}
                        />

                        {/* 3. CALENDAR */}
                        <DashboardTile 
                            type="CALENDAR"
                            title="Next Event: Dinner"
                            subtitle="7:00 PM at Nobu with Daniel."
                            icon={CalendarIcon}
                            color="bg-gradient-to-r from-purple-800 to-purple-600"
                            wide={true}
                            height="h-28"
                            onClick={() => {}}
                        />

                        {/* 4. WEATHER */}
                        <DashboardTile 
                            type="WEATHER"
                            title="Weather: Outfit Suggestion"
                            subtitle="58°F Cloudy. Wear the Wool Maxi Coat."
                            icon={CloudSun}
                            color="bg-gradient-to-r from-teal-800 to-teal-600"
                            wide={true}
                            height="h-28"
                            onClick={() => setActiveTile('WEATHER')}
                        />

                        {/* GRID SECTION */}
                        <div className="grid grid-cols-2 gap-4">
                            <DashboardTile 
                                type="TRAVEL"
                                title="Travel Plans"
                                subtitle="Costa Rica Trip"
                                icon={Plane}
                                color="bg-zinc-800"
                                onClick={() => setActiveTile('FLY')}
                            />
                            <DashboardTile 
                                type="FINANCE"
                                title="Finances"
                                subtitle="Review Spending"
                                icon={TrendingUp}
                                color="bg-zinc-800"
                                onClick={() => {}}
                            />
                            <DashboardTile 
                                type="SECURITY"
                                title="Home Security"
                                subtitle="System Armed"
                                icon={LockIcon}
                                color="bg-zinc-800"
                                onClick={() => {}}
                            />
                            {/* News Feed Placeholder */}
                            <div className="col-span-2 space-y-2 mt-2">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Headlines</h3>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-zinc-900 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                                            <Newspaper size={16} className="text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="h-3 bg-white/10 rounded w-3/4 mb-1.5" />
                                            <div className="h-2 bg-white/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TILE POPUPS --- */}
                <AnimatePresence>
                    {activeTile && (
                        <motion.div 
                            layoutId={`tile-${activeTile}`}
                            className="absolute inset-0 z-50 bg-[#111] p-6 flex flex-col"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <button 
                                onClick={() => setActiveTile(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 z-20"
                            >
                                <X size={20} />
                            </button>

                            {activeTile === 'WEATHER' && (
                                <div className="flex flex-col h-full justify-center items-center text-center">
                                    <CloudRain size={80} className="text-teal-400 mb-6" />
                                    <h2 className="text-4xl font-bold mb-2">It's Chilly Today.</h2>
                                    <p className="text-xl text-gray-400 mb-8">58°F • Rain at 4PM</p>
                                    
                                    <div className="bg-teal-900/30 border border-teal-500/30 p-6 rounded-3xl max-w-sm w-full backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-4 text-teal-300 font-bold uppercase tracking-widest text-xs">
                                            <Sparkles size={14} /> Silas Recommendation
                                        </div>
                                        <p className="text-lg leading-relaxed text-teal-100 font-medium">
                                            "Based on your wardrobe, I recommend wearing your <span className="text-white font-bold">Wool Maxi Coat</span> and <span className="text-white font-bold">Chelsea Boots</span> to stay dry."
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTile === 'FLY' && (
                                <div className="flex flex-col h-full justify-center items-center text-center">
                                    <Plane size={80} className="text-white mb-6" />
                                    <h2 className="text-4xl font-bold mb-2">Trip to Costa Rica</h2>
                                    <p className="text-xl text-gray-400 mb-8">Flight CF-882 • Mar 12</p>
                                    
                                    <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-3xl max-w-sm w-full backdrop-blur-md">
                                        <div className="flex items-center gap-3 mb-4 text-gray-300 font-bold uppercase tracking-widest text-xs">
                                            <Sparkles size={14} /> Silas Recommendation
                                        </div>
                                        <p className="text-lg leading-relaxed text-gray-200 font-medium">
                                            "I've synced this trip with Daniel's calendar. He has marked these dates as free. Don't forget to pack sunscreen."
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- CART TAB --- */}
                {activeTab === 'CART' && (
                    <div className="px-6 animate-fade-in pb-40">
                       <div className="mt-4 mb-6 text-center">
                            <h2 className="text-2xl font-bold text-white mb-1">Global Cart</h2>
                            <p className="text-gray-500 text-xs">Aggregated from your transactions.</p>
                        </div>
                        {/* Simple Empty State for demo */}
                        <div className="text-center py-20 text-gray-600">
                            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Your cart is empty.</p>
                        </div>
                    </div>
                )}

                {/* --- MEMORY TAB (PEOPLE) --- */}
                {activeTab === 'MEMORY' && !selectedPerson && (
                    <div className="px-6 animate-fade-in pb-24">
                        <div className="mt-4 mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Memory Graph</h2>
                            <p className="text-gray-500 text-sm">Key individuals identified in your network.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {profiles.map((person) => (
                                <div 
                                    key={person.id}
                                    onClick={() => setSelectedPerson(person.id)}
                                    className={`p-4 rounded-2xl border cursor-pointer hover:opacity-80 transition-opacity flex flex-col justify-between h-40 relative overflow-hidden ${person.bgColor} ${person.borderColor}`}
                                >
                                    <div className="flex justify-between items-start z-10">
                                        {person.icon}
                                        <span className={`text-[10px] font-mono opacity-70 ${person.color}`}>{person.confidence}%</span>
                                    </div>
                                    <div className="z-10">
                                        <h3 className={`font-bold text-lg leading-tight ${person.color}`}>{person.name}</h3>
                                        <p className={`text-[10px] opacity-70 mt-1 ${person.color}`}>{person.relation}</p>
                                    </div>
                                    {/* Decor */}
                                    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-xl opacity-20 bg-current ${person.color}`} />
                                </div>
                            ))}
                            {/* ADD ENTITY BUTTON */}
                            <button
                                onClick={() => setShowAddPersonModal(true)}
                                className="p-4 rounded-2xl border border-dashed border-gray-700 hover:border-gray-500 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 h-40 text-gray-500 hover:text-gray-300"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                    <Plus size={24} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">Add Entity</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PERSON DETAIL VIEW --- */}
                {selectedPerson && (
                    <div className="px-6 animate-fade-in">
                        {(() => {
                            const person = profiles.find(p => p.id === selectedPerson);
                            if(!person) return null;
                            return (
                                <>
                                    <div className="flex items-center gap-4 mb-6 mt-2">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${person.borderColor} ${person.bgColor}`}>
                                            {person.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white">{person.name}</h2>
                                            <p className="text-gray-400 text-sm">{person.relation}</p>
                                        </div>
                                    </div>

                                    <div className="bg-[#111] p-4 rounded-2xl border border-gray-800 mb-6">
                                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <BrainCircuit size={14} /> Silas Summary
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed">
                                            {person.summary}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Collected Evidence</h3>
                                        <button 
                                            onClick={() => setShowAddEvidence(true)}
                                            className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                                        >
                                            <Plus size={12} /> Add Evidence
                                        </button>
                                    </div>

                                    <div className="space-y-3 pb-8">
                                        {person.evidence.map((ev, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => setActiveEvidence(ev)}
                                                className="bg-[#111] p-4 rounded-xl border border-gray-800 flex items-center gap-4 cursor-pointer hover:border-gray-600 transition-colors"
                                            >
                                                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
                                                    {ev.imageUrl || evidenceImages[ev.title] ? (
                                                        <img src={evidenceImages[ev.title] || ev.imageUrl} className="w-full h-full object-cover opacity-80" />
                                                    ) : (
                                                        <ev.icon size={18} />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-white truncate">{ev.label}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{ev.detail}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-mono">{ev.date}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DELETE PERSON BUTTON */}
                                    <button
                                        onClick={() => handleDeletePerson(person.id)}
                                        className="w-full py-4 mb-24 border border-red-900/50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-900/10 transition-colors active:scale-95"
                                    >
                                        <Trash2 size={18} /> Remove from Memory
                                    </button>
                                </>
                            )
                        })()}
                    </div>
                )}

                {/* --- ADD EVIDENCE MODAL --- */}
                <AnimatePresence>
                    {showAddEvidence && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Add to Memory</h3>
                                <button onClick={() => setShowAddEvidence(false)} className="bg-white/10 p-2 rounded-full hover:bg-white/20">
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-2 border-b border-gray-800 pb-2 mb-2">
                                    <Search size={16} className="text-gray-500" />
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search messages, calls, etc..."
                                        className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-600"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
                                    {['ALL', 'TEXT', 'CALL', 'EMAIL', 'PHOTO'].map((cat) => (
                                        <button 
                                            key={cat}
                                            onClick={() => setEvidenceCategory(cat as any)}
                                            className={`text-[10px] px-3 py-1.5 rounded-full font-bold transition-colors whitespace-nowrap ${evidenceCategory === cat ? 'bg-white text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pb-24">
                                {getMockSearchResults().map((item, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => handleAddEvidence(item)}
                                        className="bg-[#111] p-4 rounded-xl border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                            {item.type === 'text' && <MessageSquare size={18} />}
                                            {item.type === 'voice' && <Phone size={18} />}
                                            {item.type === 'photo' && <ImageIcon size={18} />}
                                            {item.type === 'email' && <FileText size={18} />}
                                            {item.type === 'web' && <Globe size={18} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-white">{item.label}</h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <span>{item.detail}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                                <span>{item.date}</span>
                                            </div>
                                        </div>
                                        <Plus size={16} className="text-gray-500" />
                                    </div>
                                ))}
                                {getMockSearchResults().length === 0 && (
                                    <div className="text-center text-gray-600 text-sm mt-10">
                                        No results found for "{searchQuery}".
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- ADD PERSON MODAL --- */}
                <AnimatePresence>
                    {showAddPersonModal && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col justify-center p-6"
                        >
                            <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 w-full max-w-sm mx-auto">
                                <h3 className="text-xl font-bold text-white mb-6 text-center">Track New Entity</h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Name</label>
                                        <input 
                                            type="text" 
                                            value={newPersonName}
                                            onChange={(e) => setNewPersonName(e.target.value)}
                                            placeholder="e.g. John Doe"
                                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Relationship</label>
                                        <input 
                                            type="text" 
                                            value={newPersonRelation}
                                            onChange={(e) => setNewPersonRelation(e.target.value)}
                                            placeholder="e.g. Colleague"
                                            className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowAddPersonModal(false)}
                                        className="flex-1 py-3 border border-gray-700 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleAddNewPerson}
                                        disabled={!newPersonName.trim()}
                                        className={`flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold transition-all ${!newPersonName.trim() ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 hover:bg-blue-500'}`}
                                    >
                                        Add to Graph
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- PROFILE / SAFETY / INFLUENCE TAB --- */}
                {activeTab === 'PROFILE' && (
                    <div className="px-6 animate-fade-in pb-24">
                        <div className="mt-4 mb-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-3">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">Eloise Sawyer</h2>
                            <p className="text-gray-500 text-xs">Profile & Safety Settings</p>
                        </div>

                        <div className="space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <User size={14} /> Personal Identity
                                </h3>
                                <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Name</span>
                                        <span className="text-white font-medium">Eloise Sawyer</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Age</span>
                                        <span className="text-white font-medium">31</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Address</span>
                                        <span className="text-white font-medium text-right">1042 Silicon Ave<br/>Palo Alto, CA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scan Depth Control (Moved from Influence) */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={14} /> Memory Horizon
                                </h3>
                                <div className="bg-[#111] border border-gray-800 rounded-2xl p-5">
                                    <div className="relative pt-2 pb-2 px-2">
                                        <input 
                                            type="range" 
                                            min="0" max="4" 
                                            value={scanDepth} 
                                            onChange={(e) => setScanDepth(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                                        />
                                        <div className="flex justify-between mt-3 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                            {scanOptions.map((opt, i) => (
                                                <span key={i} className={`transition-colors ${i === scanDepth ? 'text-white' : ''}`}>{opt}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Influencers (Moved from Influence) */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Users size={14} /> Active Influencers
                                </h3>
                                <div className="space-y-4">
                                    {profiles.map((profile) => (
                                        <div key={profile.id} className="bg-[#111] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${profile.borderColor} ${profile.bgColor}`}>
                                                    {profile.icon}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-sm ${profile.color}`}>{profile.name}</h3>
                                                    <div className="flex gap-2 mt-1">
                                                        {profile.influenceTopics.map((topic, i) => (
                                                            <span key={i} className="text-[9px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">{topic}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <div 
                                                onClick={() => toggleInfluence(profile.id)}
                                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${profile.influences ? 'bg-green-600' : 'bg-gray-800'}`}
                                            >
                                                <motion.div 
                                                    layout 
                                                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                                                    animate={{ x: profile.influences ? 20 : 0 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Personalized Recommendations */}
                            <div>
                                <div className="flex justify-between items-end mb-3 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Personalized Recommendations</span>
                                    </div>
                                    <span className="text-[9px] bg-purple-900/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
                                        <Check size={10} /> Synced with Juno & Dining
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {/* Allergies */}
                                    <div className="bg-[#111] border border-red-900/30 rounded-2xl p-4 transition-colors hover:border-red-900/60 group">
                                        <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                                            <AlertCircle size={16} /> Allergies
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {allergies.map(tag => (
                                                <span key={tag} className="bg-red-900/20 text-red-300 text-xs px-2 py-1 rounded-full border border-red-900/50 flex items-center gap-1 group-hover:bg-red-900/30 transition-colors">
                                                    {tag} <button onClick={() => removeTag('allergy', tag)} className="hover:text-white transition-colors"><X size={10} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center bg-black/50 border border-gray-800 rounded-full px-1 focus-within:border-red-500/50 transition-colors">
                                            <input 
                                                type="text" 
                                                placeholder="Add allergy..." 
                                                className="bg-transparent text-xs text-white px-3 py-2 outline-none flex-1"
                                                value={allergyInput}
                                                onChange={e => setAllergyInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addTag('allergy')}
                                            />
                                            <button onClick={() => addTag('allergy')} className="bg-gray-800 text-gray-400 p-1.5 rounded-full hover:text-white hover:bg-gray-700 transition-all m-1">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Likes */}
                                    <div className="bg-[#111] border border-green-900/30 rounded-2xl p-4 transition-colors hover:border-green-900/60 group">
                                        <h4 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2">
                                            <ThumbsUp size={16} /> Likes
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {likes.map(tag => (
                                                <span key={tag} className="bg-green-900/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-900/50 flex items-center gap-1 group-hover:bg-green-900/30 transition-colors">
                                                    {tag} <button onClick={() => removeTag('like', tag)} className="hover:text-white transition-colors"><X size={10} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center bg-black/50 border border-gray-800 rounded-full px-1 focus-within:border-green-500/50 transition-colors">
                                            <input 
                                                type="text" 
                                                placeholder="Add preference..." 
                                                className="bg-transparent text-xs text-white px-3 py-2 outline-none flex-1"
                                                value={likeInput}
                                                onChange={e => setLikeInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addTag('like')}
                                            />
                                            <button onClick={() => addTag('like')} className="bg-gray-800 text-gray-400 p-1.5 rounded-full hover:text-white hover:bg-gray-700 transition-all m-1">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Dislikes */}
                                    <div className="bg-[#111] border border-orange-900/30 rounded-2xl p-4 transition-colors hover:border-orange-900/60 group">
                                        <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                                            <ThumbsDown size={16} /> Dislikes
                                        </h4>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {dislikes.map(tag => (
                                                <span key={tag} className="bg-orange-900/20 text-orange-300 text-xs px-2 py-1 rounded-full border border-orange-900/50 flex items-center gap-1 group-hover:bg-orange-900/30 transition-colors">
                                                    {tag} <button onClick={() => removeTag('dislike', tag)} className="hover:text-white transition-colors"><X size={10} /></button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex items-center bg-black/50 border border-gray-800 rounded-full px-1 focus-within:border-orange-500/50 transition-colors">
                                            <input 
                                                type="text" 
                                                placeholder="Add dislike..." 
                                                className="bg-transparent text-xs text-white px-3 py-2 outline-none flex-1"
                                                value={dislikeInput}
                                                onChange={e => setDislikeInput(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addTag('dislike')}
                                            />
                                            <button onClick={() => addTag('dislike')} className="bg-gray-800 text-gray-400 p-1.5 rounded-full hover:text-white hover:bg-gray-700 transition-all m-1">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Car size={14} /> Vehicle
                                </h3>
                                <div className="bg-[#111] border border-gray-800 rounded-2xl p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Model</span>
                                        <span className="text-white font-medium">Tesla Model 3</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Plate</span>
                                        <span className="text-white font-medium">8XYZ992</span>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Heart size={14} className="text-red-500" /> Emergency Contacts
                                </h3>
                                <div className="grid gap-3">
                                    {[
                                        { n: 'Daniel (Husband)', r: 'Primary' },
                                        { n: 'Mom', r: 'Parent' },
                                        { n: 'Dr. Aris', r: 'Medical' }
                                    ].map((c, i) => (
                                        <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-3 flex justify-between items-center">
                                            <span className="text-white text-sm font-medium">{c.n}</span>
                                            <span className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-900/50">{c.r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

           </div>
       )}

       {/* --- INFO MODAL --- */}
       <AnimatePresence>
         {showInfo && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
                onClick={() => setShowInfo(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#111] border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Content describing Silas */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <SilasLogo className="w-8 h-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Silas Intelligence</h2>
                        <p className="text-sm text-gray-400">Your personal cognitive monitoring system.</p>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex gap-4 items-start text-left">
                            <div className="p-2 bg-gray-800 rounded-lg shrink-0"><BrainCircuit size={18} className="text-purple-400" /></div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Memory Graph</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">Silas builds a private knowledge graph of your life by analyzing texts, photos, and voice logs to help you recall details.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start text-left">
                            <div className="p-2 bg-gray-800 rounded-lg shrink-0"><Sparkles size={18} className="text-yellow-400" /></div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Predictive Insight</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">Anticipates your needs (like weather-appropriate outfits or calendar conflicts) before you realize them.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start text-left">
                            <div className="p-2 bg-gray-800 rounded-lg shrink-0"><Shield size={18} className="text-green-400" /></div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Digital Guardian</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">Monitors your digital footprint and protects you from emotional or security risks in real-time.</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowInfo(false)}
                        className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform"
                    >
                        Got it
                    </button>
                </motion.div>
            </motion.div>
         )}
       </AnimatePresence>

       {/* --- EVIDENCE DETAIL VIEW (FULL SCREEN) --- */}
       <AnimatePresence>
       {activeEvidence && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="absolute inset-0 z-50 bg-[#000000] flex flex-col" 
           >
               {/* Evidence Header */}
               <div className="pt-14 pb-4 px-4 flex items-center gap-4 bg-[#1C1C1E] border-b border-gray-800 z-50 shadow-md">
                   <button onClick={() => {
                       // Stop audio if playing
                       if (audioSourceRef.current) {
                           try { audioSourceRef.current.stop(); } catch(e) {}
                           audioSourceRef.current = null;
                       }
                       setIsPlayingAudio(false);
                       setActiveEvidence(null);
                   }} className="flex items-center text-blue-500 gap-1 active:opacity-50">
                       <ChevronLeft className="w-8 h-8" />
                       <span className="text-[17px] font-medium">Back</span>
                   </button>
                   <div className="flex-1 text-center pr-12">
                       <span className="font-bold text-gray-200 block text-sm">{activeEvidence.title}</span>
                       <span className="text-[10px] text-gray-500">{activeEvidence.date}</span>
                   </div>
                   {/* Delete Button */}
                   <button 
                        onClick={() => handleDeleteEvidence(activeEvidence.id)}
                        className="p-2 text-red-500 active:opacity-50"
                   >
                       <Trash2 size={20} />
                   </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 bg-[#000000]">
                   
                   {/* Conditional Visual for Artifacts */}
                   {evidenceImages[activeEvidence.title] || activeEvidence.imageUrl ? (
                        <div className="flex justify-center mb-8 mt-4">
                            <div className="w-full max-w-sm aspect-[3/4] bg-white rounded-lg p-2 shadow-2xl rotate-1 overflow-hidden relative">
                                <img src={evidenceImages[activeEvidence.title] || activeEvidence.imageUrl} className="w-full h-full object-cover filter contrast-125" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20 pointer-events-none mix-blend-overlay"></div>
                            </div>
                        </div>
                   ) : loadingImage ? (
                        <div className="flex justify-center mb-8 mt-4 h-[300px] items-center">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-10 h-10 text-gray-500 animate-spin" />
                                <span className="text-xs text-gray-500 font-mono animate-pulse">RECONSTRUCTING ARTIFACT...</span>
                            </div>
                        </div>
                   ) : (
                       /* Icon Hero if no image generated yet */
                       <div className="flex justify-center mb-8 mt-4">
                           <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/20 border border-gray-800">
                               <activeEvidence.icon className="w-8 h-8 text-gray-400" />
                           </div>
                       </div>
                   )}

                   {/* Detail Text */}
                   <div className="text-center mb-8">
                       <p className="text-gray-300 text-lg font-medium leading-relaxed px-4">
                           {activeEvidence.content || activeEvidence.detail}
                       </p>
                   </div>

                   {/* Audio Player */}
                   {activeEvidence.audioTranscript && (
                       <div className="bg-[#1C1C1E] rounded-2xl p-6 mb-8 border border-gray-800">
                           <div className="flex items-center gap-4 mb-4">
                               <button 
                                   onClick={toggleAudio}
                                   className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg active:scale-95 transition-transform"
                               >
                                   {isLoadingAudio ? <Loader2 className="animate-spin" /> : isPlayingAudio ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                               </button>
                               <div className="flex-1">
                                   <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                                       <motion.div 
                                           className="h-full bg-white" 
                                           animate={{ width: isPlayingAudio ? "100%" : "0%" }} 
                                           transition={{ duration: 10, ease: "linear" }}
                                       />
                                   </div>
                               </div>
                           </div>
                           <div className="text-sm text-gray-400 font-mono leading-relaxed p-3 bg-black/50 rounded-lg border border-gray-800/50">
                               "{activeEvidence.audioTranscript}"
                           </div>
                       </div>
                   )}

                   {/* Context Chat Simulation */}
                   {activeEvidence.contextMessages && (
                       <div className="space-y-2 mb-8">
                           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">Historical Context</h4>
                           {activeEvidence.contextMessages.map((msg, i) => (
                               <MessageBubble key={i} text={msg.text} isMe={msg.isMe} isTarget={msg.isTarget} />
                           ))}
                       </div>
                   )}
               </div>
           </motion.div>
       )}
       </AnimatePresence>

       {/* --- BOTTOM TAB NAV --- */}
       {!activeEvidence && (
           <div className="absolute bottom-0 left-0 right-0 h-24 bg-[#0a0a0f] border-t border-white/10 z-50 flex justify-around items-center pb-6 px-4 shrink-0">
                <NavItem 
                    icon={Activity} label="Dashboard" 
                    active={activeTab === 'HOME'} 
                    onClick={() => { setActiveTab('HOME'); setSelectedPerson(null); }} 
                />
                <NavItem 
                    icon={ShoppingBag} label="Cart" 
                    active={activeTab === 'CART'} 
                    onClick={() => { setActiveTab('CART'); setSelectedPerson(null); }} 
                />
                <NavItem 
                    icon={BrainCircuit} label="Memory" 
                    active={activeTab === 'MEMORY'} 
                    onClick={() => { setActiveTab('MEMORY'); setSelectedPerson(null); }} 
                />
           </div>
       )}

       {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-gray-500 rounded-full opacity-50" />
        </div>
    </motion.div>
  );
};
