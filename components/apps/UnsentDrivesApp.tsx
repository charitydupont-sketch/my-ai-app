import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lock, Fingerprint, HardDrive, MessageSquare, AlertTriangle, RefreshCw, EyeOff, Send, X, Terminal, Cpu, AlertCircle, FileText } from 'lucide-react';
import { SilasLogo } from '../SilasApp';
import { generateSmartResponse } from '../../services/geminiService';

interface UnsentDrivesAppProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: string;
  text: string;
  isMe: boolean;
}

interface Drive {
  id: string;
  recipient: string;
  relation: string;
  date: string;
  draft: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
  status: 'RECOVERED' | 'CORRUPTED';
  context: string; // Backstory for the AI
}

export const UnsentDrivesApp: React.FC<UnsentDrivesAppProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<'PERMISSION' | 'DASHBOARD' | 'SIMULATION'>('PERMISSION');
  const [regretLevel, setRegretLevel] = useState(0); // 0 to 100
  const [activeDrive, setActiveDrive] = useState<Drive | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [glitchIntensity, setGlitchIntensity] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // --- DATA: DRAFTS ---
  const drives: Drive[] = [
    {
        id: 'thomas',
        recipient: 'Thomas',
        relation: 'Ex-Boyfriend',
        date: 'July 14, 2023',
        draft: "I made a mistake leaving.",
        riskLevel: 'MEDIUM',
        status: 'RECOVERED',
        context: "The user (Archie) broke up with Thomas 6 months ago. Thomas was heartbroken but is trying to move on. He is confused why Archie is texting now. He might be seeing someone else."
    },
    {
        id: 'mom',
        recipient: 'Mom',
        relation: 'Mother',
        date: 'Sunday, 10:00 AM',
        draft: "I can't come to dinner. I'm overwhelmed.",
        riskLevel: 'LOW',
        status: 'RECOVERED',
        context: "Archie's mom is caring but overbearing. She worries excessively. She just wants Archie to come home for roast dinner. She might be passive-aggressive if cancelled on."
    },
    {
        id: 'shiloh',
        recipient: 'Shiloh',
        relation: 'Deceased Best Friend',
        date: 'Aug 24, 2023',
        draft: "Please don't go on the hike. The weather looks bad.",
        riskLevel: 'CRITICAL',
        status: 'CORRUPTED',
        context: "Shiloh died on a hiking trip on Aug 24. This message was never sent. Any response from Shiloh is a glitch in the simulation or a timeline error. Responses should be garbled or haunting."
    }
  ];

  // --- AUDIO LOGIC ---
  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2023/09/06/audio_5b30605963.mp3?filename=ambient-piano-loop-166266.mp3");
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  useEffect(() => {
      if (audioRef.current) {
          if (phase === 'SIMULATION') audioRef.current.play().catch(() => {});
          const rate = Math.max(0.5, 1 - (regretLevel / 200));
          audioRef.current.playbackRate = rate;
      }
  }, [regretLevel, phase]);

  // Scroll to bottom on new message
  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [history, isTyping]);

  // --- GAMEPLAY LOGIC ---
  const startGame = (drive: Drive) => {
      setActiveDrive(drive);
      setHistory([]);
      setRegretLevel(0);
      setGlitchIntensity(0);
      setPhase('SIMULATION');
      setInput(drive.draft); // Pre-fill the draft
  };

  const handleSend = async () => {
      if (!input.trim() || !activeDrive) return;

      const userText = input;
      const newMsg: Message = { id: Date.now().toString(), sender: 'Me', text: userText, isMe: true };
      
      setHistory(prev => [...prev, newMsg]);
      setInput('');
      setIsTyping(true);

      // Simulate Silas calculation delay
      setTimeout(async () => {
          try {
              // Construct Prompt for Gemini
              const systemPrompt = `
                  You are simulating a conversation history.
                  You are roleplaying as: ${activeDrive.recipient}.
                  Relationship to user: ${activeDrive.relation}.
                  Context/Backstory: ${activeDrive.context}.
                  
                  The user just sent: "${userText}".
                  
                  Respond as ${activeDrive.recipient} would. 
                  Keep it short (under 25 words).
                  If the relationship is strained, be distant. 
                  If it's the 'Shiloh' (deceased) context, act confused or glitchy.
              `;
              
              const responseText = await generateSmartResponse(userText, systemPrompt);
              
              const replyMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  sender: activeDrive.recipient,
                  text: responseText,
                  isMe: false
              };
              
              setHistory(prev => [...prev, replyMsg]);

              // Regret Logic
              if (responseText.toLowerCase().includes('stop') || responseText.toLowerCase().includes('no') || responseText.toLowerCase().includes('error')) {
                  setRegretLevel(prev => Math.min(prev + 20, 100));
                  setGlitchIntensity(prev => Math.min(prev + 1, 5));
              }

          } catch (error) {
              setHistory(prev => [...prev, { id: Date.now().toString(), sender: 'System', text: "SILAS CONNECTION LOST...", isMe: false }]);
          } finally {
              setIsTyping(false);
          }
      }, 1500 + Math.random() * 1000);
  };

  // --- RENDER ---
  return (
    <div className="absolute inset-0 bg-black z-50 text-green-500 font-mono flex flex-col overflow-hidden">
      
      {/* GLITCH OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none z-[100] opacity-20 mix-blend-screen"
        style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)`,
            backgroundSize: '100% 4px',
            opacity: 0.1 + (glitchIntensity * 0.1)
        }}
      />
      
      {/* Dynamic Red Overlay based on Regret */}
      <div 
         className="absolute inset-0 pointer-events-none z-[90] bg-red-900 mix-blend-overlay transition-opacity duration-1000"
         style={{ opacity: regretLevel / 100 * 0.5 }}
      />

      {/* HEADER */}
      <div className="pt-14 px-4 pb-4 flex justify-between items-center border-b border-green-900 bg-black z-50 shrink-0">
          <div className="flex items-center gap-2">
              <HardDrive size={20} />
              <span className="font-bold tracking-widest uppercase text-sm">Unsent Drafts</span>
          </div>
          <button onClick={onClose} className="hover:text-white transition-colors"><X size={24} /></button>
      </div>

      {/* --- PHASE: PERMISSION --- */}
      {phase === 'PERMISSION' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 animate-fade-in">
              <div className="w-24 h-24 border border-green-500 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-green-500 rounded-full animate-ping opacity-20"></div>
                  <SilasLogo className="w-12 h-12 text-green-500" />
              </div>
              
              <div className="space-y-4 max-w-md">
                  <h1 className="text-2xl font-bold text-white">Silas Permissions Request</h1>
                  <p className="text-green-400/80 text-sm leading-relaxed">
                      To reconstruct deleted timelines, Silas Intelligence requires access to your 
                      <span className="text-white font-bold"> Unsent Drafts</span> and
                      <span className="text-white font-bold"> Regret Metrics</span>.
                  </p>
                  <div className="bg-green-900/20 border border-green-800 p-4 rounded text-xs text-left font-mono space-y-2">
                      <div className="flex items-center gap-2"><Lock size={12} /> Encrypted Drafts Access</div>
                      <div className="flex items-center gap-2"><EyeOff size={12} /> Predictive Response Engine</div>
                  </div>
              </div>

              <div className="flex gap-4 w-full max-w-xs">
                  <button onClick={onClose} className="flex-1 py-3 border border-green-800 text-green-700 hover:bg-green-900/20 transition-colors">DENY</button>
                  <button onClick={() => setPhase('DASHBOARD')} className="flex-1 py-3 bg-green-600 text-black font-bold hover:bg-green-500 transition-colors shadow-[0_0_20px_rgba(34,197,94,0.4)]">ALLOW</button>
              </div>
          </div>
      )}

      {/* --- PHASE: DASHBOARD --- */}
      {phase === 'DASHBOARD' && (
          <div className="flex-1 overflow-y-auto p-6 animate-fade-in pb-20">
              <div className="mb-8 border-l-2 border-green-500 pl-4">
                  <h2 className="text-2xl font-bold text-white mb-1">Recovered Drafts</h2>
                  <p className="text-xs opacity-60">"Some words live forever in drafts."</p>
              </div>

              <div className="grid gap-4">
                  {drives.map((drive) => (
                      <motion.div 
                          key={drive.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => startGame(drive)}
                          className={`p-5 border border-green-900 bg-green-900/10 rounded-lg cursor-pointer hover:bg-green-900/20 hover:border-green-500 transition-all group relative overflow-hidden ${drive.riskLevel === 'CRITICAL' ? 'border-red-900/50 bg-red-900/5 hover:border-red-500' : ''}`}
                      >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-scan" />
                          
                          <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                  <FileText size={16} className={drive.riskLevel === 'CRITICAL' ? 'text-red-500' : 'text-green-500'} />
                                  <span className={`font-bold text-sm ${drive.riskLevel === 'CRITICAL' ? 'text-red-400' : 'text-white'}`}>To: {drive.recipient}</span>
                              </div>
                              <span className="text-[10px] bg-black px-2 py-0.5 border border-green-900 rounded text-green-700 font-mono">{drive.date}</span>
                          </div>
                          
                          <p className="text-base text-green-100/90 font-serif italic mb-4 border-l-2 border-white/20 pl-3 py-1">
                              "{drive.draft}"
                          </p>

                          <div className="flex justify-between items-end">
                              <div className="flex gap-3 text-[10px] font-mono opacity-50">
                                  <span>RISK: <span className={drive.riskLevel === 'CRITICAL' ? 'text-red-500 blink' : 'text-green-500'}>{drive.riskLevel}</span></span>
                                  <span>STATUS: {drive.status}</span>
                              </div>
                              <div className="text-[10px] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-green-900/40 px-2 py-1 rounded">
                                  OPEN DRAFT <ChevronLeft className="rotate-180" size={10} />
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      )}

      {/* --- PHASE: SIMULATION --- */}
      {phase === 'SIMULATION' && activeDrive && (
          <div className="flex-1 flex flex-col relative h-full">
              {/* Top Info Bar */}
              <div className="px-4 py-2 bg-green-900/10 border-b border-green-900/30 flex justify-between items-center text-xs">
                  <div>
                      <span className="text-gray-500">SIMULATION TARGET:</span> <span className="text-white font-bold">{activeDrive.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <span className="text-gray-500">REGRET:</span> 
                      <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${regretLevel}%` }} />
                      </div>
                  </div>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 pb-4"
                style={{
                    filter: `blur(${regretLevel / 80}px) hue-rotate(${regretLevel > 50 ? -20 : 0}deg)`
                }}
              >
                  {/* Date Divider */}
                  <div className="text-center text-[10px] text-green-900 my-4 uppercase tracking-widest">
                      — Reconstruction Start —
                  </div>

                  {history.map((msg, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                      >
                          <div className={`max-w-[85%] p-3 text-sm rounded-lg border ${
                              msg.sender === 'System' 
                                ? 'border-red-500 text-red-500 font-bold bg-red-900/10 text-center w-full' 
                                : msg.isMe 
                                    ? 'border-green-500 bg-green-900/20 text-green-100 rounded-br-none' 
                                    : 'border-gray-700 bg-gray-900/80 text-gray-300 rounded-bl-none'
                          }`}>
                              {msg.text}
                          </div>
                          <span className="text-[9px] opacity-30 mt-1 uppercase tracking-widest">{msg.sender}</span>
                      </motion.div>
                  ))}
                  
                  {isTyping && (
                      <div className="flex items-center gap-1 opacity-50 p-2">
                          <span className="text-xs text-green-700 mr-2 animate-pulse">SILAS CALCULATING RESPONSE</span>
                          <span className="w-1 h-1 bg-green-500 animate-bounce"></span>
                          <span className="w-1 h-1 bg-green-500 animate-bounce delay-75"></span>
                          <span className="w-1 h-1 bg-green-500 animate-bounce delay-150"></span>
                      </div>
                  )}
              </div>

              {/* Input Area */}
              <div className="p-4 bg-black border-t border-green-900 z-30 shrink-0">
                  <div className="flex items-end gap-2 bg-green-900/10 border border-green-800 rounded-lg p-2">
                      <Terminal size={18} className="text-green-600 mb-2 ml-1" />
                      <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-transparent text-green-400 placeholder-green-900/50 resize-none outline-none font-mono text-sm max-h-24 py-2"
                          rows={1}
                          onKeyDown={(e) => {
                              if(e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSend();
                              }
                          }}
                      />
                      <button 
                          onClick={handleSend}
                          disabled={!input.trim() || isTyping}
                          className={`p-2 rounded-md transition-colors ${!input.trim() || isTyping ? 'text-green-900 cursor-not-allowed' : 'text-green-400 hover:bg-green-900/30'}`}
                      >
                          <Send size={18} />
                      </button>
                  </div>
                  <div className="text-[9px] text-green-900 mt-2 text-center flex justify-center items-center gap-1">
                      <Cpu size={10} /> SILAS PREDICTION ENGINE ACTIVE
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};