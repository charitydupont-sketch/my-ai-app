
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Heart, Share, Info, Trash2, Grid, Layers, Search, Play, Pause } from 'lucide-react';

interface PhotosAppProps {
  onClose: () => void;
}

interface Photo {
  id: string;
  url: string;
  date: string;
  location?: string;
  type: 'image' | 'video';
}

interface Album {
  id: string;
  title: string;
  count: number;
  cover: string;
  photos: Photo[];
}

export const PhotosApp: React.FC<PhotosAppProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'ALBUMS' | 'SEARCH'>('ALBUMS');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // --- DATA GENERATION ---
  
  const baseGraduation: Photo[] = [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80', date: 'May 24, 2015', location: 'University Hall', type: 'image' },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?auto=format&fit=crop&w=800&q=80', date: 'May 24, 2015', location: 'Campus Green', type: 'image' },
      { id: 'g3', url: 'https://images.unsplash.com/photo-1627556592933-ffe99c1cd9eb?auto=format&fit=crop&w=800&q=80', date: 'May 24, 2015', location: 'Ceremony Stage', type: 'image' },
      { id: 'g4', url: 'https://images.unsplash.com/photo-1604882737321-e6937ee9f6e6?auto=format&fit=crop&w=800&q=80', date: 'May 24, 2015', location: 'After Party', type: 'image' },
      { id: 'g5', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80', date: 'May 24, 2015', location: 'Robing Room', type: 'image' },
  ];

  const baseFamily: Photo[] = [
      { id: 'f1', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', date: 'Dec 25, 2023', location: 'Mom\'s House', type: 'image' },
      { id: 'f2', url: 'https://images.unsplash.com/photo-1576777647209-e8733d7b851d?auto=format&fit=crop&w=800&q=80', date: 'Dec 24, 2023', location: 'Living Room', type: 'image' },
      { id: 'f3', url: 'https://images.unsplash.com/photo-1596627685789-2996d997232b?auto=format&fit=crop&w=800&q=80', date: 'Nov 24, 2023', location: 'Thanksgiving', type: 'image' },
      { id: 'f4', url: 'https://images.unsplash.com/photo-1495954484750-af469f2f9be5?auto=format&fit=crop&w=800&q=80', date: 'Aug 12, 2023', location: 'Lake House', type: 'image' },
      { id: 'f5', url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=800&q=80', date: 'July 4, 2023', location: 'BBQ', type: 'image' },
  ];

  const baseBirthday: Photo[] = [
      { id: 'b1', url: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&w=800&q=80', date: 'Oct 24, 2023', location: 'The Loft', type: 'image' },
      { id: 'b2', url: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=80', date: 'Oct 24, 2023', location: 'Party', type: 'image' },
      { id: 'b3', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80', date: 'Oct 24, 2022', location: 'Bar 42', type: 'image' },
      { id: 'b4', url: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=800&q=80', date: 'Oct 24, 2021', location: 'Cake Cutting', type: 'image' },
  ];

  const albums: Album[] = useMemo(() => {
      // Just combine them without multiplying to keep them unique as requested
      const allList = [...baseFamily, ...baseBirthday, ...baseGraduation].sort(() => Math.random() - 0.5);

      return [
          { id: 'recents', title: 'Recents', count: allList.length, cover: allList[0].url, photos: allList },
          { id: 'favorites', title: 'Favorites', count: 8, cover: baseFamily[0].url, photos: baseFamily.slice(0, 8) },
          { id: 'grad', title: 'Graduation', count: baseGraduation.length, cover: baseGraduation[0].url, photos: baseGraduation },
          { id: 'family', title: 'Family', count: baseFamily.length, cover: baseFamily[1].url, photos: baseFamily },
          { id: 'bday', title: 'Birthdays', count: baseBirthday.length, cover: baseBirthday[0].url, photos: baseBirthday },
          { id: 'thomas', title: 'Thomas', count: 3, cover: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', photos: baseFamily.slice(0, 3) }, 
      ];
  }, []);

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden animate-fade-in">
        
        {/* --- PHOTO VIEWER (FULL SCREEN) --- */}
        <AnimatePresence>
            {selectedPhoto && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[60] bg-black flex flex-col"
                >
                    <div className="absolute top-0 left-0 right-0 p-4 pt-14 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
                        <button onClick={() => setSelectedPhoto(null)} className="text-white"><ChevronLeft size={28} /></button>
                        <div className="flex flex-col items-center">
                            <span className="text-white font-bold text-sm">{selectedPhoto.date}</span>
                            <span className="text-white/70 text-xs">{selectedPhoto.location}</span>
                        </div>
                        <button className="text-white font-bold text-xs">Edit</button>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                        <img src={selectedPhoto.url} className="w-full max-h-full object-contain" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 flex justify-between items-center bg-black/80 backdrop-blur-md">
                        <Share className="text-blue-500 w-6 h-6" />
                        <div className="flex gap-6">
                            <Heart className="text-white w-6 h-6" />
                            <Info className="text-white w-6 h-6" />
                        </div>
                        <Trash2 className="text-white w-6 h-6" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MAIN HEADER --- */}
        {!selectedPhoto && (
            <div className="pt-14 px-4 pb-2 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex justify-between items-center border-b border-gray-200">
                {selectedAlbum ? (
                    <button onClick={() => setSelectedAlbum(null)} className="flex items-center text-blue-500 text-[17px] gap-1 -ml-2">
                        <ChevronLeft size={26} /> Albums
                    </button>
                ) : (
                    <h1 className="text-3xl font-bold text-black">{activeTab === 'LIBRARY' ? 'Photos' : activeTab === 'ALBUMS' ? 'Albums' : 'Search'}</h1>
                )}
                
                {!selectedAlbum && activeTab === 'ALBUMS' && (
                    <button className="text-blue-500"><Search size={24} /></button>
                )}
                {selectedAlbum && (
                    <button className="text-blue-500 text-[17px]">Select</button>
                )}
            </div>
        )}

        {/* --- CONTENT --- */}
        <div className="flex-1 overflow-y-auto pb-20 bg-white">
            
            {/* ALBUM DETAIL VIEW */}
            {selectedAlbum ? (
                <div className="min-h-full">
                    <div className="px-4 py-3 mb-2">
                        <h2 className="text-3xl font-bold text-black">{selectedAlbum.title}</h2>
                        <p className="text-gray-500 text-sm font-medium">{selectedAlbum.photos.length} Photos</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-0.5">
                        {selectedAlbum.photos.map((photo) => (
                            <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="aspect-square relative cursor-pointer active:opacity-80">
                                <img src={photo.url} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                    {selectedAlbum.photos.length === 0 && (
                        <div className="py-20 text-center text-gray-400 text-sm">
                            No Photos
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* ALBUMS TAB */}
                    {activeTab === 'ALBUMS' && (
                        <div className="px-4 space-y-6">
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-bold text-black flex justify-between">
                                    My Albums <span className="text-blue-500 text-base font-normal">See All</span>
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                                    {albums.map((album) => (
                                        <div key={album.id} onClick={() => setSelectedAlbum(album)} className="flex flex-col gap-1 cursor-pointer active:scale-95 transition-transform">
                                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative shadow-sm border border-gray-100">
                                                {album.cover ? (
                                                    <img src={album.cover} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                                        <Grid className="text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-black truncate">{album.title}</span>
                                            <span className="text-xs text-gray-500">{album.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-xl font-bold text-black mb-4">People & Places</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="aspect-square bg-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                                        <div className="grid grid-cols-2 w-full h-full">
                                            <img src={baseFamily[0].url} className="object-cover w-full h-full" />
                                            <img src={baseFamily[1].url} className="object-cover w-full h-full" />
                                            <img src={baseFamily[2].url} className="object-cover w-full h-full" />
                                            <img src={baseFamily[3].url} className="object-cover w-full h-full" />
                                        </div>
                                        <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/50 to-transparent">
                                            <span className="text-white font-bold text-sm">People</span>
                                        </div>
                                    </div>
                                    <div className="aspect-square bg-gray-200 rounded-xl relative overflow-hidden">
                                         <div className="absolute inset-0 flex items-center justify-center bg-green-100">
                                             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=400&q=80')] bg-cover"></div>
                                         </div>
                                         <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/50 to-transparent">
                                            <span className="text-white font-bold text-sm">Places</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LIBRARY TAB */}
                    {activeTab === 'LIBRARY' && (
                        <div className="grid grid-cols-4 gap-0.5">
                            {albums[0].photos.map((photo) => (
                                <div key={photo.id} onClick={() => setSelectedPhoto(photo)} className="aspect-square relative cursor-pointer active:opacity-80">
                                    <img src={photo.url} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>

        {/* --- BOTTOM TAB BAR --- */}
        <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-[#F9F9F9] border-t border-gray-300 flex justify-around items-start pt-2 pb-8 z-30">
            <button onClick={() => { setActiveTab('LIBRARY'); setSelectedAlbum(null); }} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'LIBRARY' ? 'text-blue-500' : 'text-gray-400'}`}>
                <Layers className={`w-7 h-7 ${activeTab === 'LIBRARY' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'LIBRARY' ? 0 : 2} />
                <span className="text-[10px] font-medium">Library</span>
            </button>
            <button onClick={() => { setActiveTab('ALBUMS'); setSelectedAlbum(null); }} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'ALBUMS' ? 'text-blue-500' : 'text-gray-400'}`}>
                <Grid className={`w-7 h-7 ${activeTab === 'ALBUMS' ? 'fill-current' : ''}`} strokeWidth={activeTab === 'ALBUMS' ? 0 : 2} />
                <span className="text-[10px] font-medium">Albums</span>
            </button>
            <button onClick={() => { setActiveTab('SEARCH'); setSelectedAlbum(null); }} className={`flex flex-col items-center gap-1 w-16 ${activeTab === 'SEARCH' ? 'text-blue-500' : 'text-gray-400'}`}>
                <Search className="w-7 h-7" />
                <span className="text-[10px] font-medium">Search</span>
            </button>
        </div>

        {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-black rounded-full opacity-20" />
        </div>
    </div>
  );
};
