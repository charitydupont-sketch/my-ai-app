
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, ListMusic, Radio, Mic2, Search, Library, Volume2, MoreHorizontal, Heart, Shuffle, Repeat } from 'lucide-react';
import { Song } from '../../types';

interface MusicAppProps {
  onClose: () => void;
  currentSong: Song | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const MusicApp: React.FC<MusicAppProps> = ({ onClose, currentSong, isPlaying, onPlay, onPause, onNext, onPrev }) => {
  const [activeTab, setActiveTab] = useState<'LISTEN' | 'LIBRARY' | 'RADIO' | 'SEARCH'>('LISTEN');
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Mock Library
  const recentlyPlayed: Song[] = [
      { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', duration: 243 },
      { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&w=400&q=80', url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', duration: 200 },
      { id: '3', title: 'Dreams', artist: 'Fleetwood Mac', album: 'Rumours', cover: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=400&q=80', url: 'https://cdn.pixabay.com/download/audio/2023/09/06/audio_5b30605963.mp3', duration: 257 },
  ];

  const madeForYou = [
      { title: 'Chill Mix', color: 'from-pink-500 to-rose-500' },
      { title: 'Get Up! Mix', color: 'from-yellow-400 to-orange-500' },
      { title: 'New Music', color: 'from-blue-500 to-cyan-400' },
      { title: 'Favorites', color: 'from-purple-500 to-indigo-600' }
  ];

  return (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      className="absolute inset-0 bg-[#1c1c1e] z-50 flex flex-col font-sans text-white overflow-hidden"
    >
      {!showNowPlaying ? (
        <>
            {/* --- MAIN INTERFACE --- */}
            <div className="flex-1 overflow-y-auto pb-36 no-scrollbar">
                
                {/* LISTEN NOW TAB */}
                {activeTab === 'LISTEN' && (
                    <div className="pt-14 px-5">
                        <h1 className="text-3xl font-bold mb-6">Listen Now</h1>
                        
                        <section className="mb-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-200">Top Picks for Eloise</h2>
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
                                {madeForYou.map((mix, i) => (
                                    <div key={i} className="shrink-0 space-y-2 cursor-pointer group">
                                        <div className={`w-40 h-40 rounded-lg shadow-lg relative overflow-hidden bg-gradient-to-br ${mix.color}`}>
                                            <div className="absolute inset-0 flex items-end p-3">
                                                <span className="font-bold text-lg leading-tight">{mix.title}</span>
                                            </div>
                                            <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Play size={20} fill="white" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex justify-between items-end mb-4 border-b border-gray-800 pb-2">
                                <h2 className="text-xl font-bold text-gray-200">Recently Played</h2>
                                <span className="text-red-500 text-sm font-medium">See All</span>
                            </div>
                            <div className="space-y-4">
                                {recentlyPlayed.map((song) => (
                                    <div key={song.id} className="flex gap-4 items-center cursor-pointer active:opacity-60" onClick={() => onPlay(song)}>
                                        <div className="w-14 h-14 rounded-md overflow-hidden shadow-md bg-gray-800">
                                            <img src={song.cover} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-base font-medium truncate">{song.title}</div>
                                            <div className="text-sm text-gray-400 truncate">{song.artist} • {song.album}</div>
                                        </div>
                                        <MoreHorizontal className="text-gray-500" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {/* LIBRARY TAB */}
                {activeTab === 'LIBRARY' && (
                    <div className="pt-14 px-5">
                        <h1 className="text-3xl font-bold mb-6">Library</h1>
                        <div className="space-y-1">
                            {['Playlists', 'Artists', 'Albums', 'Songs', 'Made For You', 'Downloaded'].map((item, i) => (
                                <div key={i} className="py-3 border-b border-gray-800 text-xl text-red-500 active:opacity-50 cursor-pointer">
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8">
                            <h2 className="text-xl font-bold mb-4">Recently Added</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {recentlyPlayed.map(song => (
                                    <div key={song.id} onClick={() => onPlay(song)} className="space-y-2">
                                        <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden">
                                            <img src={song.cover} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <div className="font-medium truncate">{song.title}</div>
                                            <div className="text-xs text-gray-400 truncate">{song.artist}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RADIO TAB */}
                {activeTab === 'RADIO' && (
                    <div className="pt-14 px-5">
                        <h1 className="text-3xl font-bold mb-6">Radio</h1>
                        <div className="w-full aspect-[2/1] bg-gradient-to-r from-red-600 to-purple-900 rounded-xl mb-8 relative overflow-hidden p-6 flex flex-col justify-end shadow-2xl">
                            <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-widest text-white/70">Featured Station</div>
                            <div className="text-3xl font-black italic">SILAS.FM</div>
                            <div className="text-sm font-medium opacity-80">AI-Curated hits for your mood.</div>
                            <div className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                                <Play size={20} fill="black" />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">Broadcasts</h2>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-24 h-24 bg-gray-800 rounded-lg relative overflow-hidden">
                                        <div className="absolute inset-0 bg-blue-500 opacity-20"></div>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-2xl opacity-30">Hits {i}</div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold">Station {i}</div>
                                        <div className="text-xs text-gray-400">Live • 10AM - 12PM</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* --- MINI PLAYER BAR --- */}
            {currentSong && (
                <div 
                    className="absolute bottom-[84px] left-2 right-2 h-16 bg-[#2c2c2e]/95 backdrop-blur-xl rounded-xl flex items-center p-2 pr-4 shadow-2xl cursor-pointer z-20 border border-white/5"
                    onClick={() => setShowNowPlaying(true)}
                >
                    <div className="w-12 h-12 bg-gray-800 rounded-md mr-3 shadow-md overflow-hidden shrink-0">
                        <img src={currentSong.cover} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                        <div className="text-sm font-medium truncate">{currentSong.title}</div>
                        <div className="text-xs text-gray-400 truncate">{currentSong.artist}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={(e) => { e.stopPropagation(); isPlaying ? onPause() : onPlay(currentSong); }}>
                            {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onNext(); }}>
                            <SkipForward size={24} fill="white" className="opacity-50 active:opacity-100" />
                        </button>
                    </div>
                </div>
            )}

            {/* --- BOTTOM TAB BAR --- */}
            <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-gray-800 flex justify-around items-start pt-2 px-4 z-20">
                {[
                    { id: 'LISTEN', l: 'Listen Now', i: Play, filled: true },
                    { id: 'RADIO', l: 'Radio', i: Radio, filled: false },
                    { id: 'LIBRARY', l: 'Library', i: Library, filled: true },
                    { id: 'SEARCH', l: 'Search', i: Search, filled: false },
                ].map((t, i) => (
                    <div 
                        key={i} 
                        onClick={() => setActiveTab(t.id as any)}
                        className={`flex flex-col items-center gap-1 w-16 cursor-pointer ${activeTab === t.id ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        <t.i size={24} fill={t.filled && activeTab === t.id ? "currentColor" : "none"} />
                        <span className="text-[10px] font-medium">{t.l}</span>
                    </div>
                ))}
            </div>
        </>
      ) : (
        /* --- FULL SCREEN PLAYER --- */
        currentSong && (
            <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="absolute inset-0 bg-gradient-to-b from-[#4c4c4e] to-[#1c1c1e] z-50 flex flex-col p-6 pt-12"
            >
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8 cursor-pointer active:bg-white/40" onClick={() => setShowNowPlaying(false)} />
                
                <div className="aspect-square bg-gray-800 rounded-2xl shadow-2xl mb-8 relative overflow-hidden mx-4">
                    <img src={currentSong.cover} className="w-full h-full object-cover" />
                </div>

                <div className="flex justify-between items-center mb-6 px-2">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold truncate leading-tight">{currentSong.title}</h2>
                        <p className="text-lg text-gray-400 truncate">{currentSong.artist}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <MoreHorizontal size={20} />
                    </div>
                </div>

                {/* Scrubber */}
                <div className="mb-6 px-2">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-white/80" 
                            initial={{ width: 0 }}
                            animate={{ width: isPlaying ? '100%' : '0%' }}
                            transition={{ duration: currentSong.duration, ease: "linear" }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>0:00</span>
                        <span>-{Math.floor(currentSong.duration / 60)}:{currentSong.duration % 60 < 10 ? '0' : ''}{currentSong.duration % 60}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-around items-center mb-10">
                     <SkipBack size={36} fill="white" onClick={onPrev} className="active:scale-90 transition-transform" />
                     <div onClick={() => isPlaying ? onPause() : onPlay(currentSong)} className="cursor-pointer active:scale-95 transition-transform">
                        {isPlaying ? <Pause size={64} fill="white" /> : <Play size={64} fill="white" />}
                     </div>
                     <SkipForward size={36} fill="white" onClick={onNext} className="active:scale-90 transition-transform" />
                </div>
                
                {/* Volume / Extra */}
                <div className="mt-auto flex justify-between items-center text-gray-400 px-4 pb-8">
                    <Mic2 size={24} />
                    <div className="flex items-center gap-2 w-full max-w-[200px]">
                        <Volume2 size={16} />
                        <div className="flex-1 h-1 bg-white/20 rounded-full">
                            <div className="w-2/3 h-full bg-white rounded-full" />
                        </div>
                        <Volume2 size={20} />
                    </div>
                    <ListMusic size={24} />
                </div>
            </motion.div>
        )
      )}

      {/* STANDARD GRAY BAR HOME INDICATOR */}
      <motion.div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
            onClick={() => { setShowNowPlaying(false); onClose(); }}
        >
            <div className="w-32 h-1.5 bg-gray-500 rounded-full active:bg-gray-400 transition-colors" />
        </motion.div>
    </motion.div>
  );
};
