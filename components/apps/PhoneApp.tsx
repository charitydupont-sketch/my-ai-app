
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Trash2, Info, Phone, Bot,
  Plus, Search, Mic, ChevronRight, Star, Clock, Users, Grid, Voicemail as VoicemailIcon,
  MessageSquare, Delete, Pause, ChevronLeft, Loader2, Video, Heart,
  Mail, DollarSign, Share, Ban, Camera, MessageCircle, Sparkles, Volume2, Edit, Shield, EyeOff, Lock, Ghost, Signal, AlertTriangle, VideoOff, MicOff, Wifi, WifiOff, PlusCircle, MinusCircle
} from 'lucide-react';
import { Voicemail as VoicemailType, InteractiveContact } from '../../types';
import { analyzeVoicemail, generateSpeech } from '../../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';

// --- CONSTANTS ---
const API_KEY = process.env.API_KEY; 

interface PhoneAppProps {
  onBack?: () => void;
  onClose?: () => void;
  silasEnabled?: boolean;
  onStartChat?: (contactName: string) => void;
  contacts: InteractiveContact[];
  setContacts: React.Dispatch<React.SetStateAction<InteractiveContact[]>>;
  networkMode?: 'STANDARD' | 'EMERGENCY';
}

interface RecentCall {
    id: string;
    contactId: string;
    date: string;
    type: 'missed' | 'outgoing' | 'incoming';
    isVideo: boolean;
}

// ... (Audio helpers omitted for brevity, assume they exist) ...
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const SilasLogoSmall = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10" fill="none">
    <defs>
      <linearGradient id="silasGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <path d="M50 5 L90 25 V55 C90 80 50 95 50 95 C50 95 10 80 10 55 V25 L50 5Z" fill="url(#silasGradSmall)" stroke="white" strokeWidth="2"/>
    <path d="M35 40 H65 M35 40 V55 H65 V70 H35" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ... (FaceTimeActiveCall component omitted for brevity, assumed existing) ...
const FaceTimeActiveCall = ({ 
    name, 
    onEnd, 
    intervention, 
    onCancelIntervention, 
    onProceedIntervention,
    status
}: { 
    name: string, 
    onEnd: () => void, 
    intervention: any, 
    onCancelIntervention: () => void, 
    onProceedIntervention: () => void,
    status: 'ringing' | 'connected' | 'ended'
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [duration, setDuration] = useState(0);
    const [cameraActive, setCameraActive] = useState(true);

    useEffect(() => {
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                // Request only video to avoid audio conflict with Live API
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.error("Camera denied", e);
                setCameraActive(false);
            }
        };
        startCamera();

        let timer: any;
        if (status === 'connected') {
            timer = setInterval(() => setDuration(prev => prev + 1), 1000);
        }

        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
            clearInterval(timer);
        };
    }, [status]);

    const formatDuration = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="absolute inset-0 z-[60] bg-gray-900 flex flex-col overflow-hidden animate-fade-in text-white">
            
            {/* SILAS INTERVENTION OVERLAY */}
            {intervention && (
                <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-scale-up">
                    <div className="w-24 h-24 bg-purple-900/30 rounded-full flex items-center justify-center mb-6 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                        <SilasLogoSmall />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Silas Insight</h3>
                    <p className="text-lg text-purple-200 font-medium mb-4">{intervention.title}</p>
                    <p className="text-sm text-gray-400 mb-10 leading-relaxed max-w-xs">{intervention.message}</p>
                    
                    <div className="flex flex-col gap-3 w-full">
                        <button 
                            onClick={onCancelIntervention}
                            className="w-full py-3.5 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform"
                        >
                            Cancel Call
                        </button>
                        <button 
                            onClick={onProceedIntervention}
                            className="w-full py-3.5 bg-white/10 text-white font-medium rounded-xl border border-white/10 active:scale-95 transition-transform hover:bg-white/20"
                        >
                            Call Anyway
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content (The "Remote" view - Blurred Monogram) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#1c1c1e]">
                {/* Simulated Blurred Video Feed Background - Only visible when connected */}
                {status === 'connected' && (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-black opacity-90" />
                        <div className="absolute inset-0 backdrop-blur-[80px] bg-white/5" />
                    </>
                )}
                
                {status === 'ringing' && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
                )}
                
                <div className="z-20 flex flex-col items-center gap-6 animate-pulse-slow">
                    <div className="w-28 h-28 rounded-full bg-gray-500/50 backdrop-blur-md flex items-center justify-center text-5xl font-medium text-white shadow-2xl border border-white/10">
                        {name.charAt(0)}
                    </div>
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold text-white tracking-tight">{name}</h2>
                        <p className="text-white/60 font-medium mt-1">
                            {status === 'ringing' ? 'Calling...' : 'FaceTime Video'}
                        </p>
                        {!intervention && status === 'connected' && (
                            <p className="text-white/40 text-sm mt-1 font-mono">{formatDuration(duration)}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Selfie Camera (PIP) */}
            <motion.div 
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute top-16 right-4 w-[100px] h-[160px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 z-30 cursor-grab active:cursor-grabbing"
            >
                {cameraActive ? (
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover scale-x-[-1]" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <VideoOff className="text-gray-500" size={24} />
                    </div>
                )}
            </motion.div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 to-transparent z-40 flex items-center justify-center gap-8 pb-8">
                <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:bg-white/30 transition-colors">
                    <Video className="w-6 h-6 text-white" />
                </button>
                <button 
                    onClick={onEnd} 
                    className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                    <Phone className="w-8 h-8 text-white rotate-[135deg] fill-current" />
                </button>
                <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center active:bg-white/30 transition-colors">
                    <Mic className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    )
}

export const PhoneApp: React.FC<PhoneAppProps> = ({ onBack, onClose, silasEnabled = true, onStartChat, contacts, setContacts, networkMode = 'STANDARD' }) => {
  const handleBack = onBack || onClose || (() => {});

  const [activeTab, setActiveTab] = useState<'favorites' | 'recents' | 'contacts' | 'keypad' | 'voicemail'>('contacts');
  const [isCalling, setIsCalling] = useState<{name: string, type: 'audio' | 'video'} | null>(null);
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ended');
  const [silasIntervention, setSilasIntervention] = useState<{title: string, message: string} | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  
  // Call Controls State
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [showKeypadOverlay, setShowKeypadOverlay] = useState(false);

  // Navigation State
  const [viewContactId, setViewContactId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InteractiveContact>>({});
  
  // Legacy Mode State
  const [legacyModeEnabled, setLegacyModeEnabled] = useState(false);

  // Data States
  const [recents, setRecents] = useState<RecentCall[]>([]);
  const [dialedNumber, setDialedNumber] = useState('');

  // Voicemail State
  const [selectedVmId, setSelectedVmId] = useState<string | null>(null);
  
  // GUARD DISABLED
  const [memoryGuardActive, setMemoryGuardActive] = useState(false);
  const [revealedVms, setRevealedVms] = useState<Set<string>>(new Set());

  // Define Emergency Contacts (Hardcoded for simulation logic)
  const EMERGENCY_CONTACT_IDS = ['daniel', 'c2', 'c6']; // Daniel, Mom, Dr. Aris

  const [voicemails, setVoicemails] = useState<VoicemailType[]>([
    {
      id: 'vm-thomas',
      caller: 'Thomas',
      duration: '0:34',
      timestamp: 'Today, 2:30 AM',
      transcript: "Hey... it's Thomas. Look, I'm really sorry for everything. I shouldn't have let things end like that. I miss you. Just... call me back if you want.",
      isReviewed: false,
      isPlaying: false,
      label: 'mobile',
      notes: ''
    },
    {
      id: 'vm-shiloh',
      caller: 'Shiloh',
      duration: '0:42',
      timestamp: 'Aug 23, 2023',
      transcript: "Hey El! It's me. Just saw the most insane sunset and... honestly it made me think of that road trip we took. Anyway, signal is spotty up here but I'm safe. Love you, bye!",
      isReviewed: false,
      isPlaying: false,
      label: 'mobile',
      notes: 'Legacy Voice Preservation'
    },
    {
      id: '1',
      caller: 'Mom',
      duration: '0:18',
      timestamp: '10:42 AM',
      transcript: "Hey honey, it's Mom. I wanted to let you know that I miss you and love you. Call me back when you get a chance.",
      isReviewed: false,
      isPlaying: false,
      label: 'mobile',
      notes: 'Birthday is April 5'
    },
  ]);

  const [processingVmId, setProcessingVmId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, summary: string, notes: string, suggestions?: string[]} | null>(null);

  // Audio Player State
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  
  const [audioCache, setAudioCache] = useState<Record<string, string>>({}); 
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackIntervalRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  // --- LIVE API STATE ---
  const [liveSession, setLiveSession] = useState<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // ... (stopAudio, useEffect, startLiveConversation, notifyLiveAgentVideoSwitch, switchToFaceTime, togglePlayback, handleAnalyzeVm, useEffect recents logic omitted for brevity - logic unchanged) ...
  const stopAudio = () => {
    // 1. Stop Ringtone
    if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
    }

    // 2. Stop Voicemail Playback
    if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch (e) {}
        audioSourceRef.current = null;
    }
    if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
    }
    setPlaybackTime(0);
    setVoicemails(prev => prev.map(v => ({ ...v, isPlaying: false })));

    // 3. Stop Live API Audio Output
    if (outputContextRef.current) {
        try { outputContextRef.current.close(); } catch(e) {}
        outputContextRef.current = null;
    }
    audioSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();

    // 4. Stop Microphone Input
    if (inputContextRef.current) {
        try { inputContextRef.current.close(); } catch(e) {}
        inputContextRef.current = null;
    }
  };

  useEffect(() => {
    // Setup Ringtone
    ringtoneRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
    ringtoneRef.current.loop = true;

    return () => {
        endCall(); // Ensure aggressive cleanup on unmount
    };
  }, []);

  // --- LIVE CONVERSATION LOGIC ---
  const startLiveConversation = async (contactName: string, isVideo: boolean = false) => {
      try {
          if (!inputContextRef.current) {
              inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
          }
          if (!outputContextRef.current) {
              outputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ai = new GoogleGenAI({ apiKey: API_KEY });
          
          let voiceName = 'Kore'; 
          if (contactName.includes('Daniel')) voiceName = 'Fenrir'; 
          else if (contactName.includes('Sarah')) voiceName = 'Puck'; 
          else if (contactName.includes('Aris') || contactName.includes('Iris')) voiceName = 'Aoede'; 
          else if (contactName.includes('Thomas')) voiceName = 'Charon'; 
          
          let systemInstruction = `You are playing the role of ${contactName}. You are talking to Eloise (the user) on the phone. Keep responses short, natural, and conversational.`;
          
          if (contactName.includes("Mom")) {
              systemInstruction = `You are Eloise's Mom. You are answering a phone call from your daughter, Eloise. 
              IMPORTANT: You did NOT call her. She called you. You are picking up the phone.
              Start by saying "Hello? Eloise?" or "Hi honey! Everything okay?". 
              Do NOT say "I called to check on you". 
              If the user switches to video/FaceTime, react with surprise. Say you aren't dressed or decent, but you'll answer. 
              You are loving but slightly worried.`;
          }

          const sessionPromise = ai.live.connect({
              model: 'gemini-2.5-flash-native-audio-preview-12-2025',
              config: {
                  responseModalities: [Modality.AUDIO],
                  speechConfig: {
                      voiceConfig: { prebuiltVoiceConfig: { voiceName } }, 
                  },
                  systemInstruction: systemInstruction,
              },
              callbacks: {
                  onopen: () => {
                      sessionPromise.then((session: any) => {
                          const initialPrompt = isVideo 
                            ? "I just picked up a FaceTime call from Eloise. I'm surprised by the video. Say hello." 
                            : "I just picked up the phone. Eloise is calling me. Say hello.";
                          session.send({ parts: [{ text: initialPrompt }], turnComplete: true });
                      });

                      const source = inputContextRef.current!.createMediaStreamSource(stream);
                      const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
                      scriptProcessor.onaudioprocess = (e) => {
                          const inputData = e.inputBuffer.getChannelData(0);
                          const pcmBlob = createBlob(inputData);
                          sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                      };
                      source.connect(scriptProcessor);
                      scriptProcessor.connect(inputContextRef.current!.destination);
                  },
                  onmessage: async (msg: LiveServerMessage) => {
                      const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                      if (audioData) {
                          const ctx = outputContextRef.current!;
                          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                          
                          const audioBuffer = await decodeAudioData(decodeBase64(audioData), ctx, 24000);
                          const source = ctx.createBufferSource();
                          source.buffer = audioBuffer;
                          source.connect(ctx.destination);
                          
                          source.start(nextStartTimeRef.current);
                          nextStartTimeRef.current += audioBuffer.duration;
                          audioSourcesRef.current.add(source);
                          source.onended = () => audioSourcesRef.current.delete(source);
                      }
                  },
                  onclose: () => console.log("Live Session Closed"),
                  onerror: (e) => console.error("Live Session Error", e),
              }
          });
          
          setLiveSession(sessionPromise);

      } catch (err) {
          console.error("Failed to start live conversation", err);
      }
  };

  const notifyLiveAgentVideoSwitch = () => {
      if (liveSession) {
          liveSession.then((session: any) => {
              session.send({ 
                  parts: [{ text: "[SYSTEM: User clicked FaceTime. Respond immediately with: 'Oh, FaceTime? Okay, give me a minute.' then pause.]" }], 
                  turnComplete: true 
              });
          });
      }
  };

  const switchToFaceTime = () => {
        notifyLiveAgentVideoSwitch();
        setTimeout(() => {
            setIsCalling(prev => prev ? ({ ...prev, type: 'video' }) : null);
            if (callStatus === 'connected') {
                setCallStatus('ringing'); 
                setTimeout(() => {
                    setCallStatus('connected');
                    if (liveSession) {
                        liveSession.then((session: any) => {
                            session.send({
                                parts: [{ text: "[SYSTEM: Video connected. You are visible.]" }],
                                turnComplete: true
                            });
                        });
                    }
                }, 2000);
            }
        }, 3000); 
  };

  const togglePlayback = async (id: string) => {
    const vm = voicemails.find(v => v.id === id);
    if (!vm) return;

    if (vm.isPlaying) {
        stopAudio();
        return;
    }
    stopAudio();
    setIsLoadingAudio(true);
    
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        let base64Audio = audioCache[id];
        if (!base64Audio) {
            let voice = 'Kore'; 
            if (['Thomas', 'Dr. Valerius', 'Scam Likely'].includes(vm.caller)) {
                voice = 'Puck'; 
            }
            const generated = await generateSpeech(vm.transcript, voice);
            if (generated) {
                base64Audio = generated;
                setAudioCache(prev => ({...prev, [id]: generated}));
            }
        }

        if (base64Audio) {
             const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), audioContextRef.current);
             const source = audioContextRef.current.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(audioContextRef.current.destination);
             
             source.onended = () => {
                 setVoicemails(prev => prev.map(v => v.id === id ? {...v, isPlaying: false} : v));
                 if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
                 setPlaybackTime(0);
                 audioSourceRef.current = null;
             };
             
             source.start();
             audioSourceRef.current = source;
             
             setPlaybackTime(0);
             playbackIntervalRef.current = setInterval(() => {
                 setPlaybackTime(t => t + 1);
             }, 1000);

             setVoicemails(prev => prev.map(v => v.id === id ? {...v, isPlaying: true, isReviewed: true} : v));
        }
    } catch (error) {
        console.error("Playback error", error);
    } finally {
        setIsLoadingAudio(false);
    }
  };

  const handleAnalyzeVm = async (vm: VoicemailType) => {
    if (processingVmId === vm.id) return;
    setProcessingVmId(vm.id);
    const result = await analyzeVoicemail(vm.transcript);
    setAnalysisResult({ id: vm.id, ...result });
    setProcessingVmId(null);
  };

  useEffect(() => {
      setRecents([
          { id: 'r1', contactId: 'daniel', date: '6:32 PM', type: 'incoming', isVideo: false }, 
          { id: 'r2', contactId: 'c2', date: '2:34 PM', type: 'outgoing', isVideo: true }, 
          { id: 'r3', contactId: 'c2', date: '2:29 PM', type: 'incoming', isVideo: false }, 
          { id: 'r4', contactId: 'c3', date: 'Yesterday', type: 'missed', isVideo: false }, 
      ]);
  }, []);

  const handleCall = (contactOrNum: any, type: 'audio' | 'video' = 'audio') => {
      const contactObj = typeof contactOrNum === 'string' ? contacts.find(c => c.firstName === contactOrNum) : contactOrNum;
      const name = contactObj ? `${contactObj.firstName} ${contactObj.lastName}` : (typeof contactOrNum === 'string' ? contactOrNum : 'Unknown');
      
      // EMERGENCY MODE CHECK
      if (networkMode === 'EMERGENCY') {
          let isEmergencyContact = false;
          if (contactObj && EMERGENCY_CONTACT_IDS.includes(contactObj.id)) {
              isEmergencyContact = true;
          }
          
          if (!isEmergencyContact) {
              setSilasIntervention({
                  title: "Emergency Mode Active",
                  message: "You are on the T-Mobile Emergency Network. You can only call your designated Emergency Contacts."
              });
              return; // Block call
          }
      }

      setIsCalling({ name, type });
      setCallStatus('ringing');
      setSilasIntervention(null);
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setShowKeypadOverlay(false);

      if (ringtoneRef.current) {
          ringtoneRef.current.currentTime = 0;
          ringtoneRef.current.play().catch(e => console.error("Ringtone error", e));
      }

      const pickupDelay = 3500;
      setTimeout(() => {
          if (ringtoneRef.current) {
              ringtoneRef.current.pause();
              ringtoneRef.current.currentTime = 0;
          }
          setCallStatus('connected');
          callTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
          startLiveConversation(name, type === 'video');
      }, pickupDelay);
  };

  const endCall = () => {
      stopAudio();
      if (liveSession) {
          liveSession.then((s: any) => s.close());
          setLiveSession(null);
      }
      if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
          callTimerRef.current = null;
      }
      setIsCalling(null);
      setCallStatus('ended');
      setSilasIntervention(null);
      setCallDuration(0);
  };
  
  const handleSaveContact = () => {
      if (viewContactId) {
          setContacts(prev => prev.map(c => c.id === viewContactId ? { ...c, ...editForm } as InteractiveContact : c));
          setIsEditing(false);
      }
  };

  const getContact = (id: string) => contacts.find(c => c.id === id);

  // --- CONTACT VIEW ---
  if (viewContactId) {
      const contact = getContact(viewContactId);
      if (!contact) return null;
      
      const isDeceased = contact.id === 'shiloh';

      return (
          <div className={`absolute inset-0 z-50 flex flex-col animate-slide-in text-black bg-[#F2F2F7]`}>
              <div className={`pt-14 pb-2 px-4 flex justify-between items-center sticky top-0 z-20 ${isDeceased ? 'bg-[#F2F2F7] border-b border-amber-500/20' : 'bg-[#F2F2F7]'}`}>
                  <button onClick={() => { setViewContactId(null); setIsEditing(false); }} className="flex items-center text-ios-blue gap-1 -ml-2">
                      <ChevronLeft className="w-7 h-7" /> <span className="text-[17px] -ml-1">Contacts</span>
                  </button>
                  
                  {!isDeceased && (
                      <button 
                        onClick={() => {
                            if (isEditing) handleSaveContact();
                            else {
                                setEditForm(contact);
                                setIsEditing(true);
                            }
                        }} 
                        className={`text-[17px] font-medium ${isEditing ? 'font-bold' : ''} text-ios-blue`}
                      >
                          {isEditing ? 'Done' : 'Edit'}
                      </button>
                  )}
                  {isDeceased && <span className="text-[12px] font-bold text-amber-600 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded">Legacy Profile</span>}
              </div>
              <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
                  
                  {isDeceased && (
                      <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 text-center">
                          <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                              This phone number has been disconnected and belongs to another person, but this contact is preserved via Grief Mode.
                          </p>
                      </div>
                  )}

                  <div className={`flex flex-col items-center pt-6 pb-6 ${isDeceased ? 'bg-gradient-to-b from-[#F2F2F7] to-white' : 'bg-gradient-to-b from-[#F2F2F7] to-[#F2F2F7]'}`}>
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-medium mb-3 shadow-sm overflow-hidden border ${isDeceased ? 'bg-amber-400 border-amber-200 ring-4 ring-amber-100' : 'bg-[#9CA3AF]'}`}>
                          {contact.avatar === 'img' && contact.avatarUrl ? (
                              <img src={contact.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <span className="bg-gradient-to-br from-[#9CA3AF] to-[#6B7280] w-full h-full flex items-center justify-center">{contact.initials}</span>
                          )}
                      </div>
                      
                      <h2 className="text-[26px] font-semibold text-black">{contact.firstName} {contact.lastName}</h2>
                      <p className="text-gray-500 text-[15px]">{contact.label}</p>
                  </div>
                  
                  {!isEditing && (
                      <div className="flex justify-center gap-3 px-4 mb-6">
                          {[
                              { icon: MessageSquare, label: 'message', onClick: () => onStartChat && onStartChat(`${contact.firstName} ${contact.lastName}`), disabled: isDeceased && !legacyModeEnabled },
                              { icon: Phone, label: 'call', onClick: () => handleCall(contact, 'audio'), disabled: isDeceased }, // Call remains disabled for deceased as per logic
                              { icon: Video, label: 'video', onClick: () => handleCall(contact, 'video'), disabled: isDeceased },
                              { icon: Mail, label: 'mail', disabled: true },
                          ].map((action, i) => (
                              <button 
                                key={i} 
                                onClick={action.onClick} 
                                disabled={action.disabled}
                                className={`flex flex-col items-center gap-1 w-[74px] bg-white rounded-xl py-2 shadow-sm ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-50'}`}
                              >
                                  <action.icon className={`w-5 h-5 ${isDeceased ? 'text-amber-500' : 'text-ios-blue'} fill-current`} />
                                  <span className={`text-[10px] ${isDeceased ? 'text-amber-600' : 'text-ios-blue'} font-medium`}>{action.label}</span>
                              </button>
                          ))}
                      </div>
                  )}

                  <div className="px-4 space-y-5">
                      {isDeceased && (
                          <div className="bg-white rounded-xl overflow-hidden shadow-md border border-amber-200 animate-scale-up">
                              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                      <Ghost className="w-5 h-5 text-amber-500" />
                                      <span className="font-bold text-slate-900">Death Delay Mode</span>
                                  </div>
                                  <div 
                                      className={`w-[51px] h-[31px] rounded-full p-[2px] cursor-pointer transition-colors duration-300 ${legacyModeEnabled ? 'bg-amber-500' : 'bg-[#E9E9EA]'}`}
                                      onClick={() => setLegacyModeEnabled(!legacyModeEnabled)}
                                  >
                                      <div className={`w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-300 ${legacyModeEnabled ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                                  </div>
                              </div>
                              <div className="p-4 bg-amber-50">
                                  <p className="text-xs text-amber-800 leading-relaxed">
                                      Allows you to simulate conversation via Silas Memory based on 4 years of chat history.
                                  </p>
                              </div>
                          </div>
                      )}
                      
                      {!isDeceased && (
                          <div className="bg-white rounded-xl overflow-hidden shadow-sm p-3 pl-4">
                              <span className="text-[13px] text-black font-normal block mb-1">mobile</span>
                              <span className="text-[17px] text-ios-blue">{contact.phone}</span>
                          </div>
                      )}

                      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                          <button onClick={() => onStartChat && onStartChat(`${contact.firstName} ${contact.lastName}`)} disabled={isDeceased && !legacyModeEnabled} className={`w-full p-3 pl-4 flex justify-between items-center ${isDeceased && !legacyModeEnabled ? 'opacity-50' : 'active:bg-gray-50'}`}>
                              <span className="text-[17px]">Send Message</span>
                          </button>
                          <div className="border-t border-gray-100 p-3 pl-4 flex justify-between items-center active:bg-gray-50">
                              <span className="text-[17px]">Share Contact</span>
                          </div>
                          <div className="border-t border-gray-100 p-3 pl-4 flex justify-between items-center active:bg-gray-50">
                              <span className="text-[17px]">Add to Favorites</span>
                          </div>
                      </div>

                      {isEditing ? (
                          <button className="w-full bg-white text-red-500 text-[17px] font-medium py-3 rounded-xl shadow-sm mb-8">
                              Delete Contact
                          </button>
                      ) : (
                          <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                              <div className="p-3 pl-4 text-red-500 text-[17px]">Block this Caller</div>
                          </div>
                      )}
                  </div>
              </div>
              
              <div 
                  className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
                  onClick={handleBack}
              >
                  <div className="w-32 h-1.5 bg-gray-300 rounded-full active:bg-gray-400 transition-colors" />
              </div>
          </div>
      );
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col ${networkMode === 'EMERGENCY' ? 'bg-[#F2F2F7] grayscale-[0.2]' : 'bg-white'} text-black animate-slide-in`}>
        
        {/* EMERGENCY STATUS BAR OVERLAY */}
        {networkMode === 'EMERGENCY' && (
            <div className="absolute top-0 left-0 w-full bg-red-600 text-white text-[10px] font-bold text-center py-1 z-[60] pt-12">
                EMERGENCY CALLS ONLY • T-MOBILE BACKUP
            </div>
        )}

        <div className="pt-14 pb-2 px-4 flex justify-between items-center bg-[#F9F9F9] border-b border-gray-300 sticky top-0 z-20 h-[88px] box-border">
            {activeTab === 'recents' && (
              <>
                 <button className="text-ios-blue text-[17px] font-medium">Edit</button>
                 <div className="flex bg-[#EEEEF0] p-0.5 rounded-lg text-[13px] font-medium">
                     <button className="px-5 py-1 bg-white rounded-[6px] shadow-sm text-black">All</button>
                     <button className="px-5 py-1 text-black">Missed</button>
                 </div>
                 <div className="w-8"></div>
              </>
            )}
             {activeTab === 'voicemail' && (
                <>
                   <div className="w-8"></div>
                   <button className="text-ios-blue text-[17px] font-normal">Greeting</button>
                </>
             )}
            {activeTab === 'contacts' && (
                <>
                  <button onClick={handleBack} className="text-ios-blue text-[17px] flex items-center gap-1">
                      <ChevronLeft className="w-6 h-6 -ml-2" />
                  </button>
                  <div className="flex-1" />
                  <button className="text-ios-blue"><Plus className="w-6 h-6" /></button>
                </>
            )}
            {activeTab === 'keypad' && <div className="w-full"></div>}
            {activeTab !== 'recents' && activeTab !== 'keypad' && activeTab !== 'voicemail' && activeTab !== 'contacts' && (
                <>
                  <button onClick={handleBack} className="text-ios-blue text-[17px] flex items-center gap-1">
                      <ChevronLeft className="w-6 h-6 -ml-2" />
                  </button>
                  {(activeTab === 'favorites') && (
                      <button className="text-ios-blue"><Plus className="w-6 h-6" /></button>
                  )}
                </>
            )}
        </div>

        <div className="flex-1 overflow-y-auto bg-white pb-20 no-scrollbar flex flex-col">
            {activeTab === 'favorites' && (
                <div className="px-4">
                    <h1 className="text-[34px] font-bold mt-2 mb-2">Favorites</h1>
                    <div className="space-y-1">
                        {contacts.filter(c => c.isFavorite).map((fav, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0" onClick={() => handleCall(fav, 'audio')}>
                                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium">{fav.initials}</div>
                                <div className="flex-1">
                                    <div className="font-bold text-[17px]">{fav.firstName} {fav.lastName}</div>
                                    <div className="text-gray-500 text-[15px] flex items-center gap-1">{fav.label} <ChevronRight className="w-3 h-3 text-gray-300" /></div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setViewContactId(fav.id); }}>
                                    <Info className="w-6 h-6 text-ios-blue" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'recents' && (
                <div className="">
                     <div className="px-4 pt-2 pb-2">
                        <h1 className="text-[34px] font-bold text-black mb-2">Recents</h1>
                    </div>
                    <div className="pl-4">
                        {recents.map((call, i) => {
                            const contact = contacts.find(c => c.id === call.contactId);
                            if(!contact) return null;
                            return (
                                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 pr-4 cursor-pointer active:bg-gray-100" onClick={() => handleCall(contact, call.isVideo ? 'video' : 'audio')}>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`font-bold text-[17px] ${call.type === 'missed' ? 'text-red-500' : 'text-black'}`}>{contact.firstName} {contact.lastName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-500 text-[15px] mt-0.5">
                                            {call.isVideo ? <Video className="w-3.5 h-3.5 text-gray-400 fill-gray-400" /> : <Phone className="w-3.5 h-3.5 text-gray-400 fill-gray-400" />}
                                            <span>{contact.label}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[15px] text-gray-400">{call.date}</span>
                                        <button onClick={(e) => { e.stopPropagation(); setViewContactId(contact.id); }} className="p-2 -mr-2">
                                            <Info className="w-6 h-6 text-ios-blue" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className="">
                    <div className="px-4 pb-2">
                        <h1 className="text-[34px] font-bold mt-2 mb-2">Contacts</h1>
                        <div className="relative mb-4">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                            <input type="text" placeholder="Search" className="w-full bg-[#E3E3E8] rounded-xl py-2 pl-9 pr-4 text-[17px] focus:outline-none placeholder-gray-500 text-black" />
                        </div>
                    </div>
                    {/* EMERGENCY MODE FILTER */}
                    {contacts
                        .filter(c => networkMode === 'STANDARD' || EMERGENCY_CONTACT_IDS.includes(c.id))
                        .map(contact => (
                        <div key={contact.id} className="px-4 py-3 border-b border-gray-100 last:border-0 text-[17px] font-medium cursor-pointer bg-white hover:bg-gray-50 transition-colors" onClick={() => setViewContactId(contact.id)}>
                            <span className={`font-bold ${contact.id === 'shiloh' ? 'text-gray-400' : 'text-black'}`}>{contact.firstName}</span> <span className={contact.id === 'shiloh' ? 'text-gray-400' : 'text-black'}>{contact.lastName}</span>
                            {networkMode === 'EMERGENCY' && <span className="ml-2 text-[10px] text-red-500 font-bold border border-red-200 px-1 rounded">EMERGENCY</span>}
                        </div>
                    ))}
                    {networkMode === 'EMERGENCY' && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Non-emergency contacts are hidden on T-Mobile Backup Network.
                        </div>
                    )}
                </div>
            )}

            {/* ... (Keypad and Voicemail tabs logic unchanged) ... */}
            {activeTab === 'keypad' && (
                <div className="flex-1 flex flex-col justify-end pb-8 min-h-0">
                    <div className="text-4xl text-black mb-auto mt-4 h-20 flex items-center justify-center font-medium tracking-tight px-4 break-all text-center">{dialedNumber}</div>
                    
                    <div className="flex flex-col gap-3 items-center mb-2">
                        <div className="flex gap-4 justify-center">
                            {[1, 2, 3].map(n => <KeypadBtn key={n} n={n} l={['','ABC','DEF'][n-1]} onClick={() => setDialedNumber(p => p+n)} />)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            {[4, 5, 6].map(n => <KeypadBtn key={n} n={n} l={['GHI','JKL','MNO'][n-4]} onClick={() => setDialedNumber(p => p+n)} />)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            {[7, 8, 9].map(n => <KeypadBtn key={n} n={n} l={['PQRS','TUV','WXYZ'][n-7]} onClick={() => setDialedNumber(p => p+n)} />)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <KeypadBtn n="*" onClick={() => setDialedNumber(p => p+'*')} />
                            <KeypadBtn n="0" l="+" onClick={() => setDialedNumber(p => p+'0')} />
                            <KeypadBtn n="#" onClick={() => setDialedNumber(p => p+'#')} />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-8 px-10 h-[70px]">
                        <div className="w-[70px]"></div> 
                        <button onClick={() => { if(dialedNumber) handleCall(dialedNumber); }} className="w-[70px] h-[70px] rounded-full bg-[#34C759] flex items-center justify-center shadow-lg active:opacity-80 transition-opacity">
                            <Phone className="w-8 h-8 text-white fill-current" />
                        </button>
                        <div className="w-[70px] flex justify-center">
                            {dialedNumber && (
                                <button onClick={() => setDialedNumber(prev => prev.slice(0, -1))} className="text-gray-300 active:text-gray-500 transition-colors">
                                    <Delete className="w-8 h-8" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'voicemail' && !selectedVmId && (
                <div>
                     <div className="px-4 pb-2 bg-white z-20">
                        <h1 className="text-[34px] font-bold text-black leading-tight mt-2">Voicemail</h1>
                    </div>
                    <div>
                        {voicemails.map(vm => {
                            const isLegacyVM = vm.caller === 'Shiloh';
                            return (
                                <div key={vm.id} onClick={() => setSelectedVmId(vm.id)} className={`flex items-center pl-4 py-2 border-b border-gray-100 active:bg-gray-100 cursor-pointer group ${isLegacyVM ? 'bg-amber-50/30' : ''}`}>
                                    <div className="pr-3 flex justify-center w-6 shrink-0">
                                        {!vm.isReviewed && <div className="w-2.5 h-2.5 bg-ios-blue rounded-full"></div>}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <div className="flex items-center gap-1">
                                                <span className={`font-bold text-[17px] truncate ${isLegacyVM ? 'text-amber-800' : 'text-black'}`}>{vm.caller}</span>
                                                {vm.caller === 'Mom' && <Heart className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />}
                                                {isLegacyVM && <Ghost className="w-3.5 h-3.5 text-amber-500" />}
                                            </div>
                                            <span className="text-[15px] text-gray-500 whitespace-nowrap">{vm.timestamp}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className={`text-[15px] text-gray-500`}>
                                                {vm.label}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[15px] text-gray-500">{vm.duration}</span>
                                                <Info className="w-5 h-5 text-ios-blue" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

             {activeTab === 'voicemail' && selectedVmId && (
                <div className="absolute inset-0 z-50 flex flex-col bg-white text-black animate-slide-in">
                    <div className="pt-14 pb-2 px-2 flex justify-between items-center bg-[#F9F9F9] border-b border-gray-300 sticky top-0 z-20">
                        <button onClick={() => { stopAudio(); setSelectedVmId(null); }} className="flex items-center text-ios-blue gap-1">
                            <ChevronLeft className="w-8 h-8" /> 
                            <span className="text-[17px] -ml-1">Voicemail</span>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pb-10 no-scrollbar bg-white">
                         {(() => {
                            const vm = voicemails.find(v => v.id === selectedVmId);
                            if (!vm) return null;
                            const isRevealed = revealedVms.has(vm.id);
                            
                            const durationParts = vm.duration.split(':').map(Number);
                            const totalSeconds = durationParts.length === 2 ? durationParts[0] * 60 + durationParts[1] : 0;
                            const progressPercent = totalSeconds > 0 ? (playbackTime / totalSeconds) * 100 : 0;
                            const remainingSeconds = Math.max(0, totalSeconds - playbackTime);

                            return (
                                <div className="px-5 pt-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h1 className="text-[26px] font-bold flex items-center gap-2">
                                                {vm.caller}
                                                {vm.caller === 'Mom' && <Heart className="w-5 h-5 fill-blue-500 text-blue-500" />}
                                                {vm.caller === 'Shiloh' && <Ghost className="w-5 h-5 text-amber-500" />}
                                            </h1>
                                            <div className="text-[13px] text-gray-500 font-medium">
                                                {vm.label} <br />
                                                <span className="text-gray-400 font-normal">{vm.timestamp}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 pt-1">
                                            <Share className="w-6 h-6 text-ios-blue" />
                                            <Info className="w-6 h-6 text-ios-blue" />
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <div className="w-full h-1 bg-gray-200 rounded-full mb-1 relative overflow-hidden">
                                            <div className="h-full bg-gray-400" style={{ width: `${progressPercent}%`, transition: 'width 0.5s linear' }}></div>
                                        </div>
                                        <div className="flex justify-between text-[11px] text-gray-400 font-medium">
                                            <span>{formatTime(playbackTime)}</span>
                                            <span>-{formatTime(remainingSeconds)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <button onClick={() => togglePlayback(vm.id)} className="w-[44px] h-[44px] flex items-center justify-center">
                                            {isLoadingAudio ? (
                                                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                                            ) : vm.isPlaying ? (
                                                <Pause className="w-10 h-10 fill-current text-ios-blue" />
                                            ) : (
                                                <Play className="w-10 h-10 fill-current text-ios-blue" />
                                            )}
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                            <Volume2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button onClick={() => handleCall(vm.caller)} className="w-10 h-10 rounded-full bg-ios-blue flex items-center justify-center">
                                            <Phone className="w-5 h-5 text-white fill-current" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                            <Trash2 className="w-5 h-5 text-white" />
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Transcription</h3>
                                        <p className="text-[15px] leading-relaxed text-gray-800 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                            "{vm.transcript}"
                                        </p>
                                    </div>
                                    
                                    {silasEnabled && (
                                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-4 mb-6 border border-purple-100 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                     <SilasLogoSmall />
                                                     <span className="text-xs font-bold text-purple-600 uppercase tracking-wide">Silas Intelligence</span>
                                                </div>
                                                {!analysisResult && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleAnalyzeVm(vm); }}
                                                        disabled={processingVmId === vm.id}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-purple-200 rounded-full text-xs font-semibold text-purple-700 shadow-sm active:bg-purple-50 transition-all"
                                                    >
                                                        {processingVmId === vm.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                                        {processingVmId === vm.id ? 'Analyzing...' : 'Analyze'}
                                                    </button>
                                                )}
                                            </div>
                                            
                                            {analysisResult?.id === vm.id ? (
                                                <div className="space-y-4 animate-fade-in">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Summary</span>
                                                        <p className="text-sm text-gray-800 leading-relaxed">{analysisResult.summary}</p>
                                                    </div>
                                                    {analysisResult.notes && (
                                                        <div className="bg-white/60 rounded-lg p-2.5 border border-purple-100/50">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Key Insight</span>
                                                            <p className="text-sm text-gray-700">{analysisResult.notes}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block flex items-center gap-1">
                                                            <MessageCircle className="w-3 h-3" /> Suggested Replies
                                                        </span>
                                                        <div className="flex flex-col gap-2">
                                                            {analysisResult.suggestions?.map((reply, i) => (
                                                                 <button 
                                                                    key={i}
                                                                    onClick={(e) => { e.stopPropagation(); onStartChat && onStartChat(vm.caller); }}
                                                                    className="text-left bg-white border border-gray-200 hover:border-purple-300 text-gray-700 text-sm px-4 py-2.5 rounded-xl shadow-sm transition-all active:bg-purple-50"
                                                                 >
                                                                    {reply}
                                                                 </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic pl-1">
                                                    Tap analyze to get a summary and AI-generated replies.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                         })()}
                    </div>
                </div>
             )}
        </div>

        {/* Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 w-full h-[83px] bg-[#F9F9F9] border-t border-gray-300 flex items-start justify-around pt-2" style={{paddingBottom: '34px'}}>
            <TabItem id="favorites" label="Favorites" icon={Star} active={activeTab} set={setActiveTab} />
            <TabItem id="recents" label="Recents" icon={Clock} active={activeTab} set={setActiveTab} />
            <TabItem id="contacts" label="Contacts" icon={Users} active={activeTab} set={setActiveTab} />
            <TabItem id="keypad" label="Keypad" icon={Grid} active={activeTab} set={setActiveTab} />
            <TabItem id="voicemail" label="Voicemail" icon={VoicemailIcon} active={activeTab} set={setActiveTab} badge={2} />
        </div>

        {/* Call Overlay Logic Unchanged... */}
        {isCalling && (
            <>
               {isCalling.type === 'video' ? (
                   <FaceTimeActiveCall 
                        name={isCalling.name} 
                        status={callStatus}
                        onEnd={endCall} 
                        intervention={silasIntervention}
                        onCancelIntervention={endCall}
                        onProceedIntervention={() => setSilasIntervention(null)}
                   />
               ) : (
                   <div className={`absolute inset-0 z-50 flex flex-col items-center text-white animate-fade-in bg-gradient-to-b from-[#2c3e50] to-[#000000]`}>
                        {silasIntervention && (
                            <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-scale-up">
                                <div className="w-24 h-24 bg-purple-900/30 rounded-full flex items-center justify-center mb-6 border border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                                    <SilasLogoSmall />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Silas Insight</h3>
                                <p className="text-lg text-purple-200 font-medium mb-4">{silasIntervention.title}</p>
                                <p className="text-sm text-gray-400 mb-10 leading-relaxed max-w-xs">{silasIntervention.message}</p>
                                
                                <div className="flex flex-col gap-3 w-full">
                                    <button onClick={endCall} className="w-full py-3.5 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform">Cancel Call</button>
                                    <button onClick={() => { setSilasIntervention(null); if (ringtoneRef.current && callStatus === 'ringing') ringtoneRef.current.play().catch(() => {}); }} className="w-full py-3.5 bg-white/10 text-white font-medium rounded-xl border border-white/10 active:scale-95 transition-transform hover:bg-white/20">Call Anyway</button>
                                </div>
                            </div>
                        )}
                        <div className="mt-20 flex flex-col items-center">
                            <div className="w-[100px] h-[100px] rounded-full bg-gray-600 flex items-center justify-center text-3xl font-medium text-white mb-4 shadow-lg border border-white/10">{isCalling.name.charAt(0)}</div>
                            <p className="text-white/60 text-lg mb-1">{callStatus === 'ringing' ? 'Calling...' : formatTime(callDuration)}</p>
                            <h2 className="text-3xl font-semibold text-white tracking-tight">{isCalling.name}</h2>
                        </div>
                        <div className="mt-auto mb-16 w-full max-w-[340px] px-4">
                            <div className="grid grid-cols-3 gap-x-6 gap-y-6 mb-8">
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => setIsSpeaker(!isSpeaker)} className={`w-[75px] h-[75px] rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isSpeaker ? 'bg-white text-black' : 'bg-white/20 text-white'}`}><Volume2 size={32} /></button>
                                    <span className="text-[13px] font-medium text-white">speaker</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={switchToFaceTime} className={`w-[75px] h-[75px] rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md text-white transition-all active:bg-white active:text-black`}><Video size={32} fill="currentColor" /></button>
                                    <span className="text-[13px] font-medium text-white">FaceTime</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => setIsMuted(!isMuted)} className={`w-[75px] h-[75px] rounded-full flex items-center justify-center backdrop-blur-md transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/20 text-white'}`}>{isMuted ? <MicOff size={32} /> : <Mic size={32} />}</button>
                                    <span className="text-[13px] font-medium text-white">mute</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button className="w-[75px] h-[75px] rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md text-white"><Plus size={32} /></button>
                                    <span className="text-[13px] font-medium text-white">add call</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={endCall} className="w-[75px] h-[75px] rounded-full bg-red-600 flex items-center justify-center shadow-lg active:opacity-80 transition-opacity"><Phone size={36} fill="white" className="rotate-[135deg]" /></button>
                                    <span className="text-[13px] font-medium text-white">End</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <button onClick={() => setShowKeypadOverlay(!showKeypadOverlay)} className={`w-[75px] h-[75px] rounded-full flex items-center justify-center backdrop-blur-md transition-all ${showKeypadOverlay ? 'bg-white text-black' : 'bg-white/20 text-white'}`}><Grid size={32} /></button>
                                    <span className="text-[13px] font-medium text-white">keypad</span>
                                </div>
                            </div>
                        </div>
                    </div>
               )}
            </>
        )}
        
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={handleBack}
        >
            <div className="w-32 h-1.5 bg-gray-300 rounded-full active:bg-gray-400 transition-colors" />
        </div>
    </div>
  );
};

const KeypadBtn = ({ n, l, onClick }: any) => (
    <button onClick={onClick} className="w-[70px] h-[70px] rounded-full bg-[#E5E5E5] active:bg-[#D1D1D1] flex flex-col items-center justify-center transition-colors">
        <span className="text-[28px] leading-none font-medium text-black -mb-1">{n}</span>
        {l && <span className="text-[9px] font-bold tracking-widest mt-0.5 text-black">{l}</span>}
    </button>
);

const TabItem = ({ id, label, icon: Icon, active, set, badge }: any) => (
    <button onClick={() => set(id)} className={`flex flex-col items-center gap-1 w-16 ${active === id ? 'text-ios-blue' : 'text-gray-400'}`}>
        <div className="relative">
            <Icon className={`w-7 h-7 ${active === id ? 'fill-current' : ''}`} strokeWidth={active === id ? 0 : 2} />
            {badge && <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full min-w-[16px] flex items-center justify-center">{badge}</div>}
        </div>
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);
