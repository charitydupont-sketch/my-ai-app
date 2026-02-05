import React, { useState, useEffect } from 'react';
import { ChevronLeft, Book, Sparkles, Bot, Share, Bookmark, Search, MoreHorizontal, User, CheckCircle, X, Library, List, ArrowRight, Highlighter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SilasLogo } from '../SilasApp';

interface BooksAppProps {
  onClose: () => void;
  silasEnabled?: boolean;
}

export const BooksApp: React.FC<BooksAppProps> = ({ onClose, silasEnabled = true }) => {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'SEARCH'>('LIBRARY');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Silas Recommendation State
  const [viewingRec, setViewingRec] = useState(false);
  const [showHighlights, setShowHighlights] = useState(false);

  // Updated Data with Real-ish Images
  const books = [
      { id: 1, title: 'The Midnight Library', author: 'Matt Haig', progress: 45, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', category: 'Fiction' },
      { id: 2, title: 'Atomic Habits', author: 'James Clear', progress: 12, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80', category: 'Self-Help' },
      { id: 3, title: 'Dune', author: 'Frank Herbert', progress: 88, image: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&w=400&q=80', category: 'Sci-Fi' },
      { id: 4, title: 'Project Hail Mary', author: 'Andy Weir', progress: 5, image: 'https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?auto=format&fit=crop&w=400&q=80', category: 'Sci-Fi' },
      { id: 5, title: 'The Silent Patient', author: 'Alex Michaelides', progress: 0, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80', category: 'Thriller' },
      { id: 6, title: 'Educated', author: 'Tara Westover', progress: 0, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=400&q=80', category: 'Memoir' },
  ];

  const handleCloseBook = () => {
      setReadingMode(false);
  };

  // READING VIEW (Simple)
  if (readingMode && selectedBook) {
      return (
          <div className="absolute inset-0 z-50 flex flex-col bg-[#F8F1E7] text-gray-900 animate-slide-in">
               <div className="pt-14 pb-4 px-4 flex justify-between items-center bg-[#F8F1E7] sticky top-0 z-20 shadow-sm border-b border-gray-300/50">
                   <button onClick={handleCloseBook} className="flex items-center gap-1 text-black font-medium"><ChevronLeft className="w-6 h-6" /> Back</button>
                   <button><Bookmark className="w-5 h-5 text-gray-600" /></button>
               </div>
               <div className="flex-1 overflow-y-auto px-8 py-8 font-serif leading-loose text-lg text-gray-900">
                   <h2 className="text-2xl font-bold mb-6 text-center">{selectedBook.title}</h2>
                   <p className="mb-6 indent-8">
                       The library was infinite. Or so it seemed. Nora Seed sat at the small wooden table, staring at the chess board.
                   </p>
                   <p className="mb-6 indent-8">
                       Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices...
                   </p>
                   <p className="mb-6 indent-8">
                       Would you have done anything different, if you had the chance to undo your regrets? A heavy silence hung in the air, thick with the dust of unread pages and unspoken words.
                   </p>
               </div>
               <div className="bg-[#F8F1E7] px-6 py-4 border-t border-gray-300 flex justify-between items-center text-xs text-gray-500 font-sans">
                   <span>Page 42 of 320</span>
                   <span>{selectedBook.progress}%</span>
               </div>
          </div>
      );
  }

  // SILAS RECOMMENDATION DETAIL VIEW
  if (viewingRec) {
      return (
          <div className="absolute inset-0 z-50 flex flex-col bg-white text-black animate-slide-in overflow-hidden">
              <div className="pt-12 px-4 pb-2 flex justify-between items-center bg-white z-20">
                  <button onClick={() => { setViewingRec(false); setShowHighlights(false); }} className="flex items-center gap-1 text-blue-500 font-medium text-[17px]">
                      <ChevronLeft className="w-6 h-6 -ml-2" /> Library
                  </button>
                  <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
                      <SilasLogo className="w-4 h-4" />
                      <span className="text-xs font-bold text-purple-700">Silas Insight</span>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center"><Share className="w-5 h-5 text-blue-500" /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                  {/* Insight Header */}
                  <div className="px-6 pt-4 pb-6">
                      <h1 className="text-2xl font-bold mb-2 leading-tight">Why this book?</h1>
                      <p className="text-gray-500 text-sm leading-relaxed">
                          You have highlighted passages about <strong className="text-purple-600">psychology</strong> and <strong className="text-purple-600">finding home</strong> in your recent readings. Here is a book that shares those common themes.
                      </p>
                  </div>

                  {/* The Book Card */}
                  <div className="mx-6 flex gap-4 mb-8">
                      <div className="w-24 h-36 rounded-md shadow-lg overflow-hidden shrink-0 relative bg-gray-200">
                          <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                          <h2 className="text-xl font-bold leading-tight mb-1">The House in the Cerulean Sea</h2>
                          <p className="text-gray-500 text-sm mb-2">TJ Klune</p>
                          <div className="flex gap-2">
                              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-medium text-gray-600">Fantasy</span>
                              <span className="text-[10px] bg-purple-50 px-2 py-1 rounded font-medium text-purple-600">Psychology</span>
                          </div>
                      </div>
                  </div>

                  {/* The "Before & After" Interactive Section */}
                  <div className="mx-4 bg-[#F8F1E7] rounded-xl p-6 relative overflow-hidden transition-all duration-500 shadow-inner">
                      <div className="flex justify-between items-center mb-6">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Excerpt Analysis</span>
                          <button 
                            onClick={() => setShowHighlights(!showHighlights)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${showHighlights ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-400 ring-offset-1' : 'bg-white text-gray-500 border border-gray-200'}`}
                          >
                              <Highlighter size={14} />
                              {showHighlights ? 'Highlights Active' : 'Reveal Connection'}
                          </button>
                      </div>

                      <div className="font-serif text-lg leading-loose text-gray-800 relative">
                          <p>
                              "A home isn't always the house we live in. It's also the people we choose to surround ourselves with. <br/><br/>
                              
                              <span className={`transition-all duration-700 ${showHighlights ? 'bg-yellow-200 decoration-yellow-400' : ''}`}>
                                  You may not have been born to them, but they are your family nonetheless.
                              </span> 
                              {' '}
                              <span className={`transition-all duration-700 ${showHighlights ? 'bg-purple-200' : ''}`}>
                                  It is in the acceptance of our own broken pieces that we find where we truly belong.
                              </span>"
                          </p>

                          {/* Annotations appearing when highlighted */}
                          <AnimatePresence>
                              {showHighlights && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-6 pt-4 border-t border-gray-300/50 flex flex-col gap-3"
                                  >
                                      <div className="flex items-start gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 shrink-0" />
                                          <div className="text-sm text-gray-600">
                                              <strong className="text-gray-900 block text-xs uppercase mb-0.5">Theme: Home</strong>
                                              Matches your highlight in <em className="text-gray-800">The Midnight Library</em> regarding "root systems".
                                          </div>
                                      </div>
                                      <div className="flex items-start gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                                          <div className="text-sm text-gray-600">
                                              <strong className="text-gray-900 block text-xs uppercase mb-0.5">Theme: Psychology</strong>
                                              Resonates with your notes on "self-acceptance" from <em className="text-gray-800">The Silent Patient</em>.
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                      </div>
                  </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 border-t border-gray-100 bg-white/90 backdrop-blur-md absolute bottom-0 w-full z-20 pb-8">
                  <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-gray-100 text-black font-bold rounded-xl active:scale-95 transition-transform">Sample</button>
                      <button className="flex-[2] py-3 bg-black text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                          <span>Get Book</span>
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">$12.99</span>
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // BOOK DETAIL
  if (selectedBook && !readingMode) {
      return (
          <div className="absolute inset-0 z-50 flex flex-col bg-white text-black animate-slide-in">
              <div className="pt-14 px-4 pb-2 flex justify-between items-center">
                  <button onClick={() => setSelectedBook(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
                  <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><Share className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
                  <div className="flex flex-col items-center mb-8">
                      <div className="w-40 h-60 shadow-2xl mb-6 rounded-md overflow-hidden relative">
                          <img src={selectedBook.image} className="w-full h-full object-cover" />
                      </div>
                      <h1 className="text-2xl font-bold text-center mb-1 leading-tight">{selectedBook.title}</h1>
                      <p className="text-gray-500">{selectedBook.author}</p>
                      <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">{selectedBook.category}</p>
                  </div>
                  <div className="flex gap-3 mb-8">
                      <button onClick={() => setReadingMode(true)} className="flex-1 bg-black text-white font-bold py-3 rounded-full shadow-lg">Read</button>
                      <button className="flex-1 bg-gray-100 text-black font-bold py-3 rounded-full">Sample</button>
                  </div>
                  <div className="space-y-4">
                      <h3 className="font-bold text-lg">Publisher's Summary</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                          Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices... Would you have done anything different, if you had the chance to undo your regrets?
                      </p>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-white text-black animate-slide-in">
       {/* Header */}
       <div className="pt-14 pb-2 px-4 flex justify-between items-end bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
           <h1 className="text-3xl font-bold">{activeTab === 'LIBRARY' ? 'Library' : 'Search'}</h1>
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
               AV
           </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
           {activeTab === 'LIBRARY' && (
               <div className="mt-4">
                   {/* SILAS RECOMMENDATION CARD */}
                   {silasEnabled && (
                       <div onClick={() => setViewingRec(true)} className="mb-8 cursor-pointer group active:scale-[0.98] transition-transform">
                           <div className="flex items-center gap-2 mb-2">
                               <SilasLogo className="w-4 h-4" />
                               <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Silas Suggests</span>
                           </div>
                           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-purple-100 shadow-sm relative overflow-hidden">
                               <div className="flex gap-4 relative z-10">
                                   <div className="w-16 h-24 rounded shadow-md bg-gray-300 shrink-0 overflow-hidden">
                                       <img src="https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" />
                                   </div>
                                   <div className="flex-1 py-1">
                                       <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-1">Match: 98%</div>
                                       <h3 className="font-bold text-lg leading-tight mb-1">The House in the Cerulean Sea</h3>
                                       <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                                           Shares themes with your highlights on <span className="text-black font-medium">Psychology</span> & <span className="text-black font-medium">Home</span>.
                                       </p>
                                       <div className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                                           View Connection <ArrowRight size={12} />
                                       </div>
                                   </div>
                               </div>
                               {/* Decor */}
                               <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-200 rounded-full blur-2xl opacity-50 pointer-events-none" />
                           </div>
                       </div>
                   )}

                   <div className="flex justify-between items-center mb-4">
                       <h2 className="text-xl font-bold">Reading Now</h2>
                       <span className="text-blue-500 text-sm">See All</span>
                   </div>
                   
                   {/* Clean Grid Layout */}
                   <div className="grid grid-cols-2 gap-x-4 gap-y-8">
                       {books.map(book => (
                           <div key={book.id} onClick={() => setSelectedBook(book)} className="flex flex-col gap-2 cursor-pointer active:opacity-80 group">
                               <div className="aspect-[2/3] w-full rounded-md shadow-md overflow-hidden relative bg-gray-100">
                                   <img src={book.image} className="w-full h-full object-cover" />
                                   {book.progress > 0 && (
                                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300">
                                           <div className="h-full bg-black" style={{ width: `${book.progress}%` }}></div>
                                       </div>
                                   )}
                               </div>
                               <div>
                                   <p className="font-bold text-sm leading-tight line-clamp-2">{book.title}</p>
                                   <p className="text-xs text-gray-500">{book.author}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}

           {activeTab === 'SEARCH' && (
               <div className="mt-2">
                   <div className="relative mb-6">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                        <input 
                            type="text" 
                            placeholder="Books, Authors" 
                            className="w-full bg-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-black placeholder-gray-500 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                   </div>
                   <div className="space-y-6">
                       <h2 className="text-lg font-bold">Top Charts</h2>
                       {books.slice(0, 4).map((book, i) => (
                           <div key={book.id} onClick={() => setSelectedBook(book)} className="flex gap-4 items-center">
                               <span className="text-lg font-bold text-gray-300 w-4">{i + 1}</span>
                               <div className="w-12 h-16 rounded shadow-sm shrink-0 overflow-hidden bg-gray-100">
                                   <img src={book.image} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 border-b border-gray-100 pb-4">
                                   <p className="font-bold text-sm">{book.title}</p>
                                   <p className="text-xs text-gray-500">{book.author}</p>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           )}
       </div>

       {/* Tab Bar */}
       <div className="absolute bottom-0 left-0 right-0 z-30 w-full h-[83px] bg-[#F9F9F9] border-t border-gray-300 flex justify-around items-start pt-3" style={{paddingBottom: '34px'}}>
            <button onClick={() => setActiveTab('LIBRARY')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'LIBRARY' ? 'text-black' : 'text-gray-400'}`}>
                <Library className={`w-6 h-6 ${activeTab === 'LIBRARY' ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-medium">Library</span>
            </button>
            <button onClick={() => setActiveTab('SEARCH')} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'SEARCH' ? 'text-black' : 'text-gray-400'}`}>
                <Search className="w-6 h-6" />
                <span className="text-[10px] font-medium">Search</span>
            </button>
       </div>
       
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-black rounded-full opacity-20" />
        </div>
    </div>
  );
};