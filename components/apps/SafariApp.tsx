
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Share, Book, Copy, RefreshCw, X, Lock, Star, Grid, Shield } from 'lucide-react';
import { generateSmartResponse } from '../../services/geminiService';

interface SafariAppProps {
  onClose: () => void;
}

export const SafariApp: React.FC<SafariAppProps> = ({ onClose }) => {
  const [urlInput, setUrlInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageContent, setPageContent] = useState<string | null>(null); // 'HOME' or HTML/Text content
  const [history, setHistory] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const favorites = [
      { name: 'Apple', url: 'apple.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
      { name: 'Juno', url: 'juno.store', icon: 'J', isText: true, color: 'bg-black text-white' },
      { name: 'News', url: 'news.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_News_icon.svg' },
      { name: 'Wiki', url: 'wikipedia.org', icon: 'https://upload.wikimedia.org/wikipedia/en/8/80/Wikipedia-logo-v2.svg' },
  ];

  const handleSearch = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!urlInput.trim()) return;

      let target = urlInput.trim();
      if (!target.includes('.') && !target.includes('://')) {
          // It's a search
          target = `google.com/search?q=${target}`;
      } else if (!target.startsWith('http')) {
          target = `https://${target}`;
      }

      setIsLoading(true);
      setCurrentUrl(target);
      setIsTyping(false);
      
      // Simulate network delay
      setTimeout(async () => {
          try {
              // Use Gemini to hallucinate the webpage content based on the URL/Query
              const content = await generateSmartResponse(
                  target, 
                  "You are a web browser renderer. Generate a simplified HTML/Tailwind representation of what this website or search result would look like. Use placeholder images (https://picsum.photos/...) if needed. If it's a search, show results. If it's a site, show the homepage. Do not include ```html tags, just the raw div content."
              );
              setPageContent(content);
          } catch (e) {
              setPageContent('<div class="p-8 text-center"><h1>Connection Error</h1><p>Could not load page.</p></div>');
          } finally {
              setIsLoading(false);
          }
      }, 1500);
  };

  const goHome = () => {
      setPageContent(null);
      setCurrentUrl('');
      setUrlInput('');
  };

  return (
    <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden"
    >
        {/* --- TOP BAR (ADDRESS BAR) --- */}
        <div className="bg-[#F9F9F9]/90 backdrop-blur-md border-b border-gray-200 z-30 sticky top-0 pt-12 pb-2 px-4 transition-all duration-300">
            {isTyping ? (
                // Typing Mode
                <form onSubmit={handleSearch} className="flex gap-2 items-center">
                    <div className="flex-1 bg-gray-200/80 rounded-xl px-3 py-2 flex items-center gap-2">
                        <Search size={16} className="text-gray-500" />
                        <input 
                            className="flex-1 bg-transparent outline-none text-[17px] text-black"
                            value={urlInput}
                            onChange={e => setUrlInput(e.target.value)}
                            placeholder="Search or enter website name"
                            autoFocus
                        />
                        {urlInput && <button type="button" onClick={() => setUrlInput('')}><X size={16} className="text-gray-500" /></button>}
                    </div>
                    <button type="button" onClick={() => setIsTyping(false)} className="text-blue-500 font-medium">Cancel</button>
                </form>
            ) : (
                // Viewing Mode
                <div 
                    className="flex-1 h-10 bg-gray-200/50 hover:bg-gray-200/80 rounded-xl flex items-center justify-center gap-2 relative cursor-text transition-colors"
                    onClick={() => { setUrlInput(currentUrl); setIsTyping(true); }}
                >
                    <span className="text-[11px] font-bold text-gray-400 absolute left-3">AA</span>
                    <div className="flex items-center gap-1 text-[15px] text-black">
                        {currentUrl && <Lock size={12} className="text-black" fill="currentColor" />}
                        <span className="truncate max-w-[200px]">
                            {currentUrl ? currentUrl.replace('https://','').replace('http://','').split('/')[0] : 'Search or enter website name'}
                        </span>
                    </div>
                    {isLoading ? (
                        <RefreshCw size={14} className="text-gray-400 animate-spin absolute right-3" />
                    ) : (
                        <RefreshCw size={14} className="text-gray-400 absolute right-3" />
                    )}
                </div>
            )}
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 overflow-y-auto bg-white relative">
            {!pageContent ? (
                // START PAGE
                <div className="px-6 pt-8 pb-24">
                    <div className="text-3xl font-bold mb-8 text-slate-900">Favorites</div>
                    <div className="grid grid-cols-4 gap-y-8 gap-x-4">
                        {favorites.map((fav, i) => (
                            <div key={i} onClick={() => { setUrlInput(fav.url); handleSearch(); }} className="flex flex-col items-center gap-2 cursor-pointer active:opacity-60">
                                <div className={`w-16 h-16 rounded-xl shadow-sm flex items-center justify-center overflow-hidden ${fav.isText ? fav.color : 'bg-gray-100'}`}>
                                    {fav.isText ? (
                                        <span className="text-2xl font-black">{fav.icon}</span>
                                    ) : (
                                        <img src={fav.icon} className="w-10 h-10" />
                                    )}
                                </div>
                                <span className="text-[11px] text-gray-500 text-center leading-tight">{fav.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <h3 className="text-xl font-bold mb-4 text-slate-900">Privacy Report</h3>
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                <Shield size={24} fill="currentColor" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[15px] font-medium">14 Trackers Prevented</div>
                                <div className="text-xs text-gray-400">Silas Protection Active</div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // BROWSER CONTENT (Simulated)
                <div className="w-full min-h-full pb-24">
                    {isLoading ? (
                        <div className="w-full h-1 bg-gray-100 relative">
                            <div className="absolute top-0 left-0 h-full bg-blue-500 animate-loading-bar w-1/3"></div>
                        </div>
                    ) : (
                        <div className="animate-fade-in p-4 safari-content" dangerouslySetInnerHTML={{ __html: pageContent }} />
                    )}
                </div>
            )}
        </div>

        {/* --- BOTTOM BAR (TOOLS ONLY) --- */}
        <div className="bg-[#F9F9F9]/90 backdrop-blur-xl border-t border-gray-200 pb-8 pt-2 px-4 sticky bottom-0 z-30 flex justify-between items-center text-blue-500">
            <button onClick={goHome} className="p-2 active:opacity-50"><ChevronLeft size={28} /></button>
            <button className="p-2 active:opacity-50 opacity-30" disabled><ChevronRight size={28} /></button>
            <button className="p-2 active:opacity-50"><Share size={24} /></button>
            <button className="p-2 active:opacity-50"><Book size={24} /></button>
            <button className="p-2 active:opacity-50"><Grid size={24} /></button>
        </div>
        
        {/* --- HOME INDICATOR (EXIT) --- */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-black/20 rounded-full active:bg-black/40 transition-colors" />
        </div>

        {/* Helper Styles for generated content */}
        <style>{`
            .safari-content h1 { font-size: 2rem; font-weight: 800; margin-bottom: 1rem; }
            .safari-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            .safari-content p { line-height: 1.6; color: #333; margin-bottom: 1rem; }
            .safari-content img { width: 100%; border-radius: 0.75rem; margin: 1rem 0; }
            .safari-content button { background: #007AFF; color: white; padding: 10px 20px; border-radius: 99px; font-weight: 600; border: none; margin-top: 1rem; }
            .safari-content a { color: #007AFF; text-decoration: underline; }
            @keyframes loading-bar {
                0% { left: 0; width: 0; }
                50% { width: 50%; }
                100% { left: 100%; width: 0; }
            }
            .animate-loading-bar {
                animation: loading-bar 1.5s infinite linear;
            }
        `}</style>
    </motion.div>
  );
};
