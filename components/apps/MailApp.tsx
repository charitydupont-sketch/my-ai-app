
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, Trash2, Reply, SquarePen, Folder, Flag, ChevronUp, ChevronDown, Filter, ChevronRight } from 'lucide-react';
import { Email } from '../../types';

interface MailAppProps {
  onClose: () => void;
  emails: Email[];
  setEmails: React.Dispatch<React.SetStateAction<Email[]>>;
}

export const MailApp: React.FC<MailAppProps> = ({ onClose, emails, setEmails }) => {
  const [view, setView] = useState<'INBOX' | 'DETAIL' | 'COMPOSE'>('INBOX');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const openEmail = (email: Email) => {
    setSelectedEmail(email);
    setView('DETAIL');
    setEmails(prev => prev.map(e => e.id === email.id ? { ...e, unread: false } : e));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(e => e.id !== id));
    if (view === 'DETAIL') {
      setView('INBOX');
      setSelectedEmail(null);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden h-full w-full">
      <AnimatePresence mode="wait">
        
        {/* INBOX VIEW */}
        {view === 'INBOX' && (
          <motion.div 
            key="inbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col h-full bg-white"
          >
            {/* Top Navigation Bar */}
            <div className="pt-12 px-4 pb-2 flex justify-between items-center bg-white/95 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200/50">
               <button onClick={onClose} className="text-blue-500 text-[17px] flex items-center -ml-1.5 active:opacity-50 transition-opacity">
                  <ChevronLeft size={26} /> <span className="font-medium">Mailboxes</span>
               </button>
               <button className="text-blue-500 text-[17px] font-medium active:opacity-50 transition-opacity">Edit</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 pt-2 pb-2">
                    <h1 className="text-[34px] font-bold text-black leading-tight">Inbox</h1>
                </div>
                <div className="px-4 pb-2 mb-2">
                    <div className="relative group">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2" />
                        <input 
                          type="text" 
                          placeholder="Search" 
                          className="w-full bg-[#E3E3E8] text-black rounded-[10px] py-1.5 pl-9 pr-4 text-[17px] focus:outline-none placeholder-gray-500" 
                        />
                    </div>
                </div>

                {/* Email List */}
                <div className="ml-4 border-t border-gray-200">
                   {emails.map((email) => (
                     <div 
                       key={email.id} 
                       onClick={() => openEmail(email)}
                       className="flex items-start gap-2 py-3 pr-4 border-b border-gray-200 active:bg-gray-100 cursor-pointer group transition-colors relative"
                     >
                        {/* Unread Indicator */}
                        {email.unread && (
                            <div className="absolute -left-2.5 top-5 w-2.5 h-2.5 bg-blue-500 rounded-full" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <span className={`text-[17px] truncate ${email.unread ? 'font-bold text-black' : 'font-semibold text-black'}`}>
                                    {email.sender}
                                </span>
                                <div className="flex items-center gap-1 shrink-0 pl-2">
                                    <span className="text-[15px] text-gray-400 font-normal">{email.time}</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-60" />
                                </div>
                            </div>
                            <div className={`text-[15px] truncate mb-0.5 ${email.unread ? 'font-semibold text-black' : 'font-medium text-black'}`}>
                                {email.subject}
                            </div>
                            <div className="text-[15px] text-gray-500 line-clamp-2 leading-snug">
                                {email.preview}
                            </div>
                        </div>
                     </div>
                   ))}
                </div>
                
                <div className="py-6 text-center text-xs text-gray-400 font-medium">
                    Updated Just Now
                </div>
                <div className="h-20" /> {/* Spacer for bottom bar */}
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-[#F9F9F9]/90 backdrop-blur-xl border-t border-gray-200 h-[83px] flex justify-between items-start pt-3 px-5 absolute bottom-0 w-full z-30 pb-8">
                <button className="p-1 text-blue-500 active:opacity-50">
                    <Filter size={20} strokeWidth={2} className="rounded-full border-[1.5px] border-blue-500 p-0.5" />
                </button>
                <div className="text-[13px] font-medium text-black pt-1.5">
                    {emails.filter(e => e.unread).length > 0 ? `${emails.filter(e => e.unread).length} Unread` : 'Updated Just Now'}
                </div>
                <button onClick={() => setView('COMPOSE')} className="p-1 text-blue-500 active:opacity-50">
                    <SquarePen size={24} strokeWidth={2} />
                </button>
            </div>
          </motion.div>
        )}

        {/* DETAIL VIEW */}
        {view === 'DETAIL' && selectedEmail && (
          <motion.div 
            key="detail"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-0 bg-white z-50 flex flex-col h-full"
          >
             {/* Header */}
             <div className="pt-12 px-2 pb-2 flex justify-between items-center bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-20">
                <button onClick={() => setView('INBOX')} className="text-blue-500 text-[17px] flex items-center gap-1 pl-1 active:opacity-50">
                   <ChevronLeft size={26} className="-ml-1" /> <span className="font-normal">Inbox</span>
                </button>
                <div className="flex gap-6 pr-4 text-blue-500">
                    <ChevronUp size={24} className="text-gray-300 stroke-[1.5]" />
                    <ChevronDown size={24} className="text-gray-300 stroke-[1.5]" />
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-5">
                 <div className="flex justify-between items-start mb-4 pt-2">
                     <div className="flex-1 min-w-0 pr-4">
                         <div className="flex items-center justify-between mb-1">
                             <h2 className="text-xl font-bold text-black leading-tight truncate">{selectedEmail.subject}</h2>
                             <span className="text-[12px] bg-gray-200 text-gray-600 px-1.5 rounded font-medium">Inbox</span>
                         </div>
                     </div>
                     <button className="text-gray-400"><Flag size={20} /></button>
                 </div>

                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                     <div className={`w-10 h-10 rounded-full ${selectedEmail.avatarColor} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                         {selectedEmail.initials}
                     </div>
                     <div className="flex-1">
                         <div className="flex justify-between items-baseline">
                             <span className="text-[17px] font-semibold text-black">{selectedEmail.sender === 'Zion Store' ? 'Lumina' : selectedEmail.sender}</span>
                             <span className="text-[13px] text-gray-400">{selectedEmail.dateFull?.split(' at ')[0]}</span>
                         </div>
                         <div className="text-[15px] text-gray-500">
                             To: {selectedEmail.to} &gt;
                         </div>
                     </div>
                 </div>
                 
                 <div className="text-[17px] text-black leading-relaxed whitespace-pre-line font-light">
                     {selectedEmail.body}
                 </div>
                 
                 <div className="h-24"></div>
             </div>

             {/* Bottom Bar */}
             <div className="bg-[#F9F9F9]/90 backdrop-blur-xl border-t border-gray-200 h-[83px] flex justify-between items-start pt-3 px-6 absolute bottom-0 w-full z-30">
                 <button className="text-blue-500 active:opacity-50"><Trash2 size={24} strokeWidth={1.5} onClick={() => deleteEmail(selectedEmail.id)} /></button>
                 <button className="text-blue-500 active:opacity-50"><Folder size={24} strokeWidth={1.5} /></button>
                 <button className="text-blue-500 active:opacity-50"><Reply size={24} strokeWidth={1.5} /></button>
                 <button className="text-blue-500 active:opacity-50"><SquarePen size={24} strokeWidth={1.5} /></button>
             </div>
          </motion.div>
        )}

        {/* COMPOSE VIEW */}
        {view === 'COMPOSE' && (
            <motion.div 
              key="compose"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-0 bg-[#F2F2F7] z-50 flex flex-col h-full sm:rounded-t-[10px] overflow-hidden"
            >
                <div className="pt-12 px-4 pb-3 flex justify-between items-center bg-[#F9F9F9] border-b border-gray-300">
                    <button onClick={() => setView('INBOX')} className="text-blue-500 text-[17px] font-normal active:opacity-50">Cancel</button>
                    <span className="font-semibold text-black text-[17px]">New Message</span>
                    <button onClick={() => setView('INBOX')} className="text-gray-300 font-bold text-[17px]" disabled>Send</button>
                </div>

                <div className="bg-white flex-1 flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-gray-500 w-12 text-[15px]">To:</span>
                        <input type="text" className="flex-1 focus:outline-none text-[15px]" autoFocus />
                        <button className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg leading-none pb-0.5 active:opacity-80">+</button>
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-gray-500 w-12 text-[15px]">Cc/Bcc:</span>
                        <input type="text" className="flex-1 focus:outline-none text-[15px]" />
                    </div>
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-gray-500 w-12 text-[15px]">Subject:</span>
                        <input type="text" className="flex-1 focus:outline-none text-[15px] font-semibold" />
                    </div>
                    <div className="flex-1 p-4">
                        <textarea className="w-full h-full resize-none focus:outline-none text-[17px] font-normal text-black" placeholder="Sent from my iPhone"></textarea>
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
