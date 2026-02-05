
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Edit, Search, Info, UserPlus, X, Camera, AppWindow, Mic, ArrowUp, Delete, Ghost, MessageSquare, Phone, Video, Mail } from 'lucide-react';
import { InteractiveContact, Conversation, Message } from '../../types';

interface MessagesAppProps {
  onClose: () => void;
  contacts: InteractiveContact[];
  setContacts: React.Dispatch<React.SetStateAction<InteractiveContact[]>>;
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  onSendMessage: (text: string, contactId: string) => void;
}

// --- Helper Component for Avatars ---
const ContactAvatar = ({ contact, isLegacy, size = 'md' }: { contact: InteractiveContact, isLegacy?: boolean, size?: 'sm'|'md'|'lg'|'xl' }) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-12 h-12 text-lg',
        lg: 'w-20 h-20 text-3xl',
        xl: 'w-24 h-24 text-3xl' // Updated to match Phone app better
    };
    
    const badgeSize = size === 'xl' ? 'w-8 h-8' : size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
    const iconSize = size === 'xl' ? 18 : size === 'lg' ? 14 : size === 'sm' ? 8 : 12;

    return (
        <div className={`relative ${sizeClasses[size]} shrink-0`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-medium overflow-hidden shadow-sm ${isLegacy ? 'bg-amber-400' : 'bg-[#999999]'}`}>
                {contact.avatar === 'img' && contact.avatarUrl ? (
                    <img src={contact.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                    <span className="leading-none mt-[1px]">{contact.initials}</span>
                )}
            </div>
            
            {/* Badges - Positioned to "stick out" */}
            <div className="absolute -bottom-0.5 -right-0.5 flex flex-col gap-1 items-end">
                {isLegacy && (
                    <div className={`${badgeSize} bg-amber-400 rounded-full flex items-center justify-center shadow-sm border-2 border-white z-10`}>
                        <Ghost size={iconSize} className="text-white fill-current" />
                    </div>
                )}
            </div>
        </div>
    );
};

export const MessagesApp: React.FC<MessagesAppProps> = ({ onClose, contacts, setContacts, conversations, setConversations, onSendMessage }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false); 
  const [showPhotoPicker, setShowPhotoPicker] = useState(false); 
  
  // Compose State
  const [isComposing, setIsComposing] = useState(false);
  const [composeInput, setComposeInput] = useState('');

  // Legacy Simulation State (for Shiloh)
  const [legacySimActive, setLegacySimActive] = useState(false);

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const activeContact = activeConv ? contacts.find(c => c.id === activeConv.contactId) : null;

  const isLegacy = (contactId: string) => contactId === 'shiloh'; 

  const photos = [
      { id: 'p1', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=300&q=80', category: 'graduation' },
      { id: 'p2', url: 'https://images.unsplash.com/photo-1530103862676-de3c9da59af7?auto=format&fit=crop&w=300&q=80', category: 'family' },
      { id: 'p3', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80', category: 'birthday' },
      { id: 'p4', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=300&q=80', category: 'family' },
      { id: 'p5', url: 'https://images.unsplash.com/photo-1621609764095-b32bbe35cf3a?auto=format&fit=crop&w=300&q=80', category: 'sensitive' }, 
      { id: 'p6', url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=300&q=80', category: 'graduation' },
  ];

  // Auto-scroll when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConv?.messages]);

  useEffect(() => {
      if (activeConversationId && inputRef.current && showVirtualKeyboard) {
          inputRef.current.focus();
      }
  }, [activeConversationId, showVirtualKeyboard]);

  const handleComposeEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && composeInput.trim()) {
          const rawInput = composeInput.trim();
          const existing = contacts.find(c => 
              c.firstName.toLowerCase() === rawInput.toLowerCase() || 
              (c.firstName + ' ' + c.lastName).toLowerCase() === rawInput.toLowerCase() ||
              c.phone === rawInput
          );

          if (existing) {
              const conv = conversations.find(c => c.contactId === existing.id);
              if (conv) setActiveConversationId(conv.id);
              else {
                  const newConv: Conversation = {
                      id: `conv_${existing.id}`,
                      contactId: existing.id,
                      messages: [],
                      unread: false,
                  };
                  setConversations(prev => [...prev, newConv]);
                  setActiveConversationId(newConv.id);
              }
              setIsComposing(false);
          } else {
              const newId = `temp_${Date.now()}`;
              const newContact: InteractiveContact = {
                  id: newId,
                  firstName: rawInput,
                  lastName: '',
                  initials: rawInput.substring(0, 2).toUpperCase(),
                  phone: 'New Contact',
                  isFavorite: false,
                  relation: 'New Contact'
              };
              setContacts(prev => [...prev, newContact]);
              const newConv: Conversation = {
                  id: `conv_${newId}`,
                  contactId: newId,
                  messages: [],
                  unread: false,
              };
              setConversations(prev => [...prev, newConv]);
              setActiveConversationId(newConv.id);
              setIsComposing(false);
          }
      }
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeConv || !activeContact) return;
    onSendMessage(inputText, activeContact.id);
    setInputText('');
  };

  const getContact = (id: string) => contacts.find(c => c.id === id);

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden h-full w-full">
        <AnimatePresence mode="wait">
            
            {/* COMPOSE SCREEN */}
            {isComposing && (
                <motion.div 
                    key="compose"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 bg-white z-[55] flex flex-col"
                >
                    <div className="pt-12 px-4 pb-2 flex justify-between items-center bg-[#F9F9F9] border-b border-gray-300">
                        <button onClick={() => setIsComposing(false)} className="text-blue-500 text-[17px]">Cancel</button>
                        <span className="font-bold">New Message</span>
                        <button className="text-gray-300 font-bold" disabled>To:</button>
                    </div>
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-gray-500">To:</span>
                        <input 
                            autoFocus
                            value={composeInput}
                            onChange={(e) => setComposeInput(e.target.value)}
                            onKeyDown={handleComposeEnter}
                            className="flex-1 outline-none text-[17px]"
                            placeholder="Name or Number"
                        />
                        <button className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm"><UserPlus size={14} /></button>
                    </div>
                    <div className="p-4 text-gray-400 text-sm text-center mt-10">
                        Type a name and press Enter to start chatting instantly.
                    </div>
                </motion.div>
            )}

            {/* FULL CONTACT DETAIL OVERLAY (MATCHING PHONE APP) */}
            {viewingProfileId && (
                <motion.div 
                    key="contact-detail"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    className="absolute inset-0 z-[70] flex flex-col bg-[#F2F2F7]"
                >
                    {(() => {
                        const contact = getContact(viewingProfileId);
                        if (!contact) return null;
                        const isLegacyProfile = isLegacy(contact.id);

                        return (
                            <>
                                <div className="pt-14 pb-2 px-4 flex justify-between items-center sticky top-0 z-20 bg-[#F2F2F7]">
                                    <button 
                                        onClick={() => setViewingProfileId(null)} 
                                        className="flex items-center text-blue-500 gap-1 -ml-2"
                                    >
                                        <ChevronLeft className="w-7 h-7" /> <span className="text-[17px] -ml-1">Message</span>
                                    </button>
                                    <button className="text-[17px] font-medium text-blue-500">Edit</button>
                                </div>

                                <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
                                    {isLegacyProfile && (
                                        <div className="bg-amber-500/10 border-b border-amber-500/20 p-4 text-center">
                                            <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                                                Legacy Profile Active. Interactions limited by Silas Memory.
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center pt-6 pb-6 bg-[#F2F2F7]">
                                        <ContactAvatar contact={contact} isLegacy={isLegacyProfile} size="xl" />
                                        <h2 className="text-[26px] font-semibold text-black mt-3">{contact.firstName} {contact.lastName}</h2>
                                        <p className="text-gray-500 text-[15px]">{contact.label}</p>
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex justify-center gap-3 px-4 mb-6">
                                        {[
                                            { icon: MessageSquare, label: 'message', active: true },
                                            { icon: Phone, label: 'call', active: !isLegacyProfile },
                                            { icon: Video, label: 'video', active: !isLegacyProfile },
                                            { icon: Mail, label: 'mail', active: true },
                                        ].map((action, i) => (
                                            <button 
                                                key={i} 
                                                disabled={!action.active}
                                                className={`flex flex-col items-center gap-1 w-[74px] bg-white rounded-xl py-2 shadow-sm ${!action.active ? 'opacity-50 cursor-not-allowed' : 'active:bg-gray-50'}`}
                                            >
                                                <action.icon className={`w-5 h-5 ${isLegacyProfile ? 'text-amber-500' : 'text-blue-500'} fill-current`} />
                                                <span className={`text-[10px] ${isLegacyProfile ? 'text-amber-600' : 'text-blue-500'} font-medium`}>{action.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="px-4 space-y-5">
                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm p-3 pl-4">
                                            <span className="text-[13px] text-black font-normal block mb-1">mobile</span>
                                            <span className="text-[17px] text-blue-500">{contact.phone}</span>
                                        </div>

                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm p-3 pl-4">
                                            <span className="text-[13px] text-black font-normal block mb-1">notes</span>
                                            <span className="text-[17px] text-black">{contact.relation}</span>
                                        </div>

                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                            <button onClick={() => setViewingProfileId(null)} className="w-full p-3 pl-4 flex justify-between items-center active:bg-gray-50">
                                                <span className="text-[17px] text-blue-500">Send Message</span>
                                            </button>
                                            <div className="border-t border-gray-100 p-3 pl-4 flex justify-between items-center active:bg-gray-50">
                                                <span className="text-[17px] text-blue-500">Share Contact</span>
                                            </div>
                                            <div className="border-t border-gray-100 p-3 pl-4 flex justify-between items-center active:bg-gray-50">
                                                <span className="text-[17px] text-blue-500">Add to Favorites</span>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-8">
                                            <div className="p-3 pl-4 text-red-500 text-[17px]">Block this Caller</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </motion.div>
            )}

            {!activeConversationId ? (
                // CONVERSATION LIST
                <motion.div 
                    key="list"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col bg-white"
                >
                    <div className="pt-12 px-4 pb-2 flex justify-between items-center bg-[#F9F9F9]/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
                        <button className="text-blue-500 text-[17px] font-normal active:opacity-50">Edit</button>
                        <div /> 
                        <button onClick={() => setIsComposing(true)} className="text-blue-500 active:opacity-50"><Edit size={24} /></button>
                    </div>
                    
                    <div className="px-4 py-2">
                         <h1 className="text-[34px] font-bold text-black mb-2">Messages</h1>
                         <div className="relative mb-2">
                            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2" />
                            <input type="text" placeholder="Search" className="w-full bg-[#E3E3E8] rounded-xl py-1.5 pl-9 pr-4 text-[17px] focus:outline-none placeholder-gray-500 text-black" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.map(conv => {
                            const contact = getContact(conv.contactId);
                            const lastMsg = conv.messages[conv.messages.length - 1];
                            if (!contact) return null;
                            
                            const isLegacyProfile = isLegacy(contact.id);

                            return (
                                <div 
                                    key={conv.id} 
                                    onClick={() => setActiveConversationId(conv.id)}
                                    className={`flex items-center gap-3 pl-4 py-2 border-b border-gray-100 active:bg-gray-100 cursor-pointer ${isLegacyProfile ? 'bg-amber-50/20' : ''}`}
                                >
                                    <ContactAvatar 
                                        contact={contact} 
                                        isLegacy={isLegacyProfile}
                                    />
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className={`font-bold text-[17px] truncate ${isLegacyProfile ? 'text-amber-800' : ''}`}>{contact.firstName} {contact.lastName}</h3>
                                            <span className="text-[15px] text-gray-400">{lastMsg?.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <p className={`text-[15px] truncate flex-1 ${conv.unread ? 'text-black font-semibold' : 'text-gray-500'}`}>
                                                {lastMsg?.text || 'Sent an image'}
                                            </p>
                                            <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            ) : (
                // CHAT VIEW
                <motion.div 
                    key="chat"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="flex-1 flex flex-col bg-white h-full relative"
                >
                    {/* Header */}
                    <div className="pt-12 px-2 pb-2 flex justify-between items-center bg-[#F9F9F9]/90 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
                        <button onClick={() => { setActiveConversationId(null); setShowVirtualKeyboard(false); }} className="flex items-center text-blue-500 gap-1 pl-1 active:opacity-50">
                             <ChevronLeft size={28} className="-ml-1" /> 
                             <span className="text-[17px]">
                                {conversations.reduce((acc, c) => acc + (c.unread ? 1 : 0), 0) || 1}
                             </span>
                        </button>
                        
                        <div className="flex flex-col items-center cursor-pointer active:opacity-60" onClick={() => setViewingProfileId(activeContact?.id || null)}>
                            <div className="mb-1">
                                <ContactAvatar contact={activeContact!} size="sm" />
                            </div>
                            <span className="font-semibold text-[13px] flex items-center gap-1">
                                {activeContact?.firstName} 
                                <ChevronLeft size={10} className="rotate-[-90deg] text-gray-400" />
                            </span>
                        </div>

                        <div className="flex gap-4 pr-4 text-blue-500 items-center w-12">
                             {/* Spacer */}
                        </div>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white relative">
                         <div className="text-center text-[11px] text-gray-400 font-medium py-4">
                             iMessage with {activeContact?.firstName}
                         </div>
                         {activeConv?.messages.map((msg, i) => {
                             if (msg.isSystem) {
                                 return (
                                     <div key={msg.id} className="flex justify-center my-4 px-8">
                                         <div className="text-center bg-gray-100/80 px-4 py-1.5 rounded-xl border border-gray-100 shadow-sm backdrop-blur-sm">
                                             <span className="text-[11px] text-gray-500 font-medium leading-tight block">
                                                 {msg.text}
                                             </span>
                                         </div>
                                     </div>
                                 );
                             }
                             return (
                                 <div 
                                    key={msg.id} 
                                    className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'} mb-1`}
                                 >
                                     <div className="relative max-w-[75%]">
                                         {msg.image ? (
                                             <div className={`rounded-2xl overflow-hidden shadow-sm border ${msg.isMe ? 'border-blue-100' : 'border-gray-200'}`}>
                                                 <img src={msg.image} className="w-full max-w-[200px] h-auto object-cover" />
                                             </div>
                                         ) : (
                                             <div 
                                                className={`px-4 py-2 rounded-2xl text-[17px] leading-snug relative ${
                                                    msg.isMe 
                                                    ? 'bg-blue-500 text-white rounded-br-sm' 
                                                    : activeContact?.id === 'shiloh' 
                                                        ? 'bg-[#FDE68A] text-amber-900 rounded-bl-sm border border-amber-200' // Legacy Yellow
                                                        : 'bg-[#E9E9EB] text-black rounded-bl-sm'
                                                }`}
                                             >
                                                 {msg.text}
                                             </div>
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                    </div>

                    {/* Input Area */}
                    <div className={`p-2 pb-8 border-t transition-colors z-30 bg-[#F9F9F9] border-gray-200 flex items-end gap-3`}>
                        <button 
                            className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors mb-0.5"
                            onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                        >
                            <Camera size={26} className={showPhotoPicker ? "text-blue-500 fill-current" : "text-gray-400"} />
                        </button>
                        <button className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors mb-0.5 hidden sm:block">
                            <AppWindow size={24} />
                        </button>
                        
                        <div className="flex-1 min-h-[36px] border border-gray-300 rounded-[18px] px-4 py-1.5 bg-white flex items-center">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="iMessage"
                                className="w-full bg-transparent outline-none text-[17px]"
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                onFocus={() => { setShowVirtualKeyboard(true); setShowPhotoPicker(false); }}
                            />
                            {inputText && (
                                <button onClick={handleSend} className="ml-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white active:scale-90 transition-transform">
                                    <ArrowUp size={16} strokeWidth={3} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      
      {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-none"
        >
            <div className="w-32 h-1.5 bg-black rounded-full opacity-20 pointer-events-auto" onClick={onClose} />
        </div>
    </div>
  );
};
