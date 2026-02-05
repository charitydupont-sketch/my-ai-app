import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX, Disc, MapPin, Camera, Zap, Music2, Pause, Play, Wind, Keyboard } from 'lucide-react';

interface NightModeCityAppProps {
  onClose: () => void;
}

interface Echo {
  id: number;
  x: number;
  text: string;
  color: string;
  type: 'memory' | 'glitch' | 'data';
}

export const NightModeCityApp: React.FC<NightModeCityAppProps> = ({ onClose }) => {
  // --- STATE ---
  const [gameActive, setGameActive] = useState(false);
  const [worldX, setWorldX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [activeEcho, setActiveEcho] = useState<Echo | null>(null);
  const [inventory, setInventory] = useState<number[]>([]);
  const [showControls, setShowControls] = useState(true);

  // --- REFS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<Set<string>>(new Set());

  // --- CONSTANTS ---
  const WORLD_WIDTH = 20000;
  const MAX_SPEED = 12;
  const ACCEL = 0.8;
  const FRICTION = 0.92;
  
  const AUDIO_URL = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3";
  const CHAR_SPRITE = "https://media.tenor.com/On7kvXy7I6AAAAAj/walking.gif";
  const CHAR_IDLE = "https://cdn.pixabay.com/photo/2016/11/21/15/37/silhouette-1846069_960_720.png";

  // --- GENERATION ---
  const buildings = useMemo(() => {
      return Array.from({ length: 40 }).map((_, i) => ({
          x: i * 600 + (Math.random() * 200 - 100),
          w: 250 + Math.random() * 300,
          h: 400 + Math.random() * 500,
          z: -200 - Math.random() * 800, // Depth
          hue: 220 + Math.random() * 60, // Blue/Purple range
          lights: Math.random() > 0.2
      }));
  }, []);

  const streetLights = useMemo(() => {
      return Array.from({ length: 20 }).map((_, i) => ({
          x: i * 1200 + 400,
      }));
  }, []);

  const echoes: Echo[] = useMemo(() => [
      { id: 1, x: 1500, text: "The rain smells like copper and ozone.", color: "#f472b6", type: 'memory' },
      { id: 2, x: 3200, text: "I waited here for three hours. You never came.", color: "#60a5fa", type: 'memory' },
      { id: 3, x: 5500, text: "SYSTEM ERROR: REALITY_BUFFER_OVERFLOW", color: "#ef4444", type: 'glitch' },
      { id: 4, x: 8000, text: "A lost cat poster. The paper is dissolving.", color: "#fbbf24", type: 'data' },
      { id: 5, x: 11000, text: "This payphone still rings every night at 3 AM.", color: "#34d399", type: 'memory' },
  ], []);

  // --- GAME LOOP ---
  useEffect(() => {
    if (!gameActive) return;

    const animate = () => {
        // Input Handling
        let inputDir = 0;
        if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d')) inputDir = 1;
        if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a')) inputDir = -1;

        // Physics
        setVelocity(v => {
            let next = v;
            if (inputDir !== 0) {
                next += inputDir * ACCEL;
                setDirection(inputDir as 1 | -1);
            } else {
                next *= FRICTION;
            }
            // Clamp Speed
            return Math.max(Math.min(next, MAX_SPEED), -MAX_SPEED);
        });

        // Update Position
        setWorldX(prev => {
            const next = prev + velocity;
            // Loop world illusion or clamp
            if (next < 0) return 0;
            if (next > WORLD_WIDTH) return WORLD_WIDTH;
            return next;
        });

        requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameActive, velocity]);

  // --- INPUT LISTENERS ---
  useEffect(() => {
      const handleDown = (e: KeyboardEvent) => {
          keysPressed.current.add(e.key);
          if (e.key === ' ' && gameActive) checkInteract();
      };
      const handleUp = (e: KeyboardEvent) => {
          keysPressed.current.delete(e.key);
      };
      
      window.addEventListener('keydown', handleDown);
      window.addEventListener('keyup', handleUp);
      return () => {
          window.removeEventListener('keydown', handleDown);
          window.removeEventListener('keyup', handleUp);
      };
  }, [gameActive, worldX, inventory]);

  const checkInteract = () => {
      const playerX = worldX + window.innerWidth / 2;
      const hit = echoes.find(e => Math.abs(e.x - playerX) < 150);
      if (hit) {
          setActiveEcho(hit);
          setInventory(prev => [...new Set([...prev, hit.id])]);
          setVelocity(0); // Stop player
      }
  };

  const startGame = () => {
      setGameActive(true);
      if (audioRef.current) audioRef.current.play().catch(() => {});
      if (containerRef.current) containerRef.current.focus();
  };

  // --- RENDER HELPERS ---
  const isWalking = Math.abs(velocity) > 0.5;

  return (
    <div 
        ref={containerRef}
        className="absolute inset-0 bg-black z-50 overflow-hidden font-sans select-none outline-none"
        tabIndex={0}
        onClick={() => containerRef.current?.focus()}
    >
        <audio ref={audioRef} src={AUDIO_URL} loop />

        {/* --- UI LAYER --- */}
        <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-start pointer-events-none">
            <div className="pointer-events-auto">
                <button onClick={onClose} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium tracking-widest uppercase">Exit Sim</span>
                </button>
            </div>
            
            <div className="flex flex-col items-end gap-2 pointer-events-auto">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Music2 size={14} className="text-purple-400" />
                    <span className="text-[10px] text-purple-200 font-mono">NEON_FM_88.4</span>
                    <button onClick={() => {
                        setIsMuted(!isMuted);
                        if(audioRef.current) isMuted ? audioRef.current.play() : audioRef.current.pause();
                    }}>
                        {isMuted ? <VolumeX size={14} className="text-gray-500" /> : <Volume2 size={14} className="text-white" />}
                    </button>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                    MEMORIES: {inventory.length} / {echoes.length}
                </div>
            </div>
        </div>

        {/* --- START SCREEN --- */}
        {!gameActive && (
            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-white">
                <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    NIGHT MODE
                </h1>
                <p className="text-gray-400 mb-8 max-w-md text-center text-sm leading-relaxed">
                    A cinematic walking simulation. Use your keyboard to explore the city. Find the echoes of the past.
                </p>
                
                <button 
                    onClick={startGame}
                    className="group relative px-8 py-3 bg-white text-black font-bold rounded-full overflow-hidden transition-transform active:scale-95"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors">
                        ENTER CITY <Keyboard size={16} />
                    </span>
                </button>
            </div>
        )}

        {/* --- 3D WORLD --- */}
        <div 
            className="absolute inset-0 perspective-[1000px] bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e]"
            style={{ transformStyle: 'preserve-3d' }}
        >
            {/* 1. SKYBOX */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[10%] right-[20%] w-64 h-64 bg-purple-600 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black to-transparent opacity-80" />
                {/* Stars */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
            </div>

            {/* 2. WORLD TRANSFORM GROUP */}
            <div className="absolute inset-0 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* FAR BUILDINGS (Parallax Slow) */}
                {buildings.map((b, i) => {
                    // Only render if roughly in view or creates depth
                    const relativeX = b.x - worldX * 0.5; // Parallax Factor 0.5
                    if (relativeX < -1000 || relativeX > window.innerWidth + 1000) return null;

                    return (
                        <div 
                            key={`b-${i}`}
                            className="absolute bottom-0 bg-[#0a0a0f] border-t border-white/5"
                            style={{
                                width: b.w,
                                height: b.h,
                                left: 0, // Position controlled by transform
                                transform: `translateX(${relativeX}px) translateZ(${b.z}px)`,
                                boxShadow: b.lights ? `0 -20px 60px ${b.hue > 250 ? 'rgba(192,38,211,0.2)' : 'rgba(59,130,246,0.2)'}` : 'none'
                            }}
                        >
                            {/* Windows */}
                            {b.lights && (
                                <div className="w-full h-full opacity-50 p-4 grid grid-cols-3 gap-2">
                                    {Array.from({ length: 12 }).map((_, w) => (
                                        <div key={w} className={`h-2 w-full rounded-sm ${Math.random() > 0.7 ? 'bg-yellow-100' : 'bg-transparent'}`} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* STREET LIGHTS (Parallax Fast) */}
                {streetLights.map((l, i) => {
                    const relativeX = l.x - worldX;
                    if (relativeX < -500 || relativeX > window.innerWidth + 500) return null;

                    return (
                        <div key={`l-${i}`} className="absolute bottom-0 z-20" style={{ transform: `translateX(${relativeX}px)` }}>
                            <div className="w-2 h-64 bg-black/80 mx-auto" />
                            {/* Light Bloom */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500/30 blur-[40px] rounded-full mix-blend-screen" />
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_20px_orange]" />
                            {/* Ground Reflection */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-48 h-8 bg-orange-500/20 blur-xl rounded-full" style={{ transform: 'rotateX(80deg)' }} />
                        </div>
                    );
                })}

                {/* ECHOES (Collectibles) */}
                {echoes.map((e) => {
                    const relativeX = e.x - worldX;
                    const collected = inventory.includes(e.id);
                    if (relativeX < -200 || relativeX > window.innerWidth + 200) return null;

                    return (
                        <div 
                            key={`e-${e.id}`} 
                            className="absolute bottom-32 z-30 flex flex-col items-center justify-center pointer-events-none"
                            style={{ 
                                transform: `translateX(${relativeX}px)`,
                                opacity: collected ? 0.2 : 1 
                            }}
                        >
                            <div 
                                className="w-4 h-4 rounded-full animate-pulse shadow-[0_0_30px_5px_currentColor]"
                                style={{ backgroundColor: e.color, color: e.color }}
                            />
                            {!collected && (
                                <div className="mt-2 text-[10px] font-mono text-white bg-black/50 px-2 rounded backdrop-blur-sm">
                                    [SPACE]
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* GROUND PLANE (Reflective) */}
                <div 
                    className="absolute bottom-0 left-[-50%] w-[200%] h-[300px] z-10 origin-bottom"
                    style={{
                        background: 'linear-gradient(to bottom, #050505, #111)',
                        transform: 'perspective(500px) rotateX(45deg)',
                    }}
                >
                    {/* Wet Noise Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
                </div>
            </div>

            {/* --- PLAYER CHARACTER --- */}
            <div 
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300"
                style={{ transform: `translateX(-50%) scaleX(${direction})` }}
            >
                <img 
                    src={isWalking ? CHAR_SPRITE : CHAR_IDLE} 
                    className="h-48 object-contain filter contrast-[1.2] brightness-75 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]"
                    alt="Player"
                />
            </div>

            {/* --- RAIN & FOREGROUND OVERLAY --- */}
            <div className="absolute inset-0 z-50 pointer-events-none mix-blend-overlay opacity-30">
                 <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[rain_0.5s_linear_infinite]" />
            </div>
            
            <style>{`
                @keyframes rain { 
                    0% { background-position: 0 0; }
                    100% { background-position: 10px 100px; }
                }
            `}</style>
        </div>

        {/* --- POPUPS --- */}
        <AnimatePresence>
            {activeEcho && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setActiveEcho(null)}
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-8"
                >
                    <div 
                        className="bg-black border border-white/20 p-8 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden group cursor-pointer"
                        style={{ boxShadow: `0 0 30px ${activeEcho.color}20` }}
                    >
                        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: activeEcho.color }} />
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-white">
                                {activeEcho.type === 'glitch' ? <Zap size={16} /> : <Camera size={16} />}
                            </div>
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{activeEcho.type} RECORD_0{activeEcho.id}</span>
                        </div>
                        <h3 className="text-xl text-white font-medium mb-2 leading-relaxed font-serif italic">
                            "{activeEcho.text}"
                        </h3>
                        <div className="mt-6 text-[10px] text-gray-600 font-mono flex justify-between">
                             <span>COORDS: {activeEcho.x}</span>
                             <span className="animate-pulse">TAP TO CLOSE</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- CONTROLS OVERLAY (Mobile/Mouse Support) --- */}
        <div className="absolute bottom-8 left-8 right-8 z-[60] flex justify-between items-end pointer-events-none">
             <div className="flex gap-2">
                 {/* Visual Key Hints */}
                 <div className={`w-10 h-10 border border-white/20 rounded flex items-center justify-center text-xs text-white ${keysPressed.current.has('ArrowLeft') ? 'bg-white text-black' : 'bg-black/50'}`}>←</div>
                 <div className={`w-10 h-10 border border-white/20 rounded flex items-center justify-center text-xs text-white ${keysPressed.current.has('ArrowRight') ? 'bg-white text-black' : 'bg-black/50'}`}>→</div>
             </div>
             <div className={`px-4 py-2 rounded-full border border-white/20 text-xs text-white backdrop-blur-md transition-opacity ${activeEcho || inventory.some(id => !echoes.find(e => e.id === id)) ? 'opacity-100' : 'opacity-0'}`}>
                 [SPACE] TO INTERACT
             </div>
        </div>
    </div>
  );
};