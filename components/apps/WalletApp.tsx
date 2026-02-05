
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreHorizontal, Plus, QrCode, CreditCard, Plane, ShoppingBag, Coffee, Utensils, Zap, Shield, CheckCircle } from 'lucide-react';

interface WalletAppProps {
  onClose: () => void;
  onOpenApp?: (appName: string) => void;
}

interface WalletTransaction {
    id: string;
    merchant: string;
    location: string;
    amount: string;
    date: string;
    icon: any;
    category: string;
}

interface Card {
    id: string;
    type: 'credit' | 'debit' | 'store';
    bank: string;
    name: string;
    last4: string;
    balance?: string; // For Apple Card style
    theme: string; // CSS classes for background
    textColor: string;
    transactions: WalletTransaction[];
    logo?: React.ReactNode;
}

export const WalletApp: React.FC<WalletAppProps> = ({ onClose, onOpenApp }) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const cards: Card[] = [
      {
          id: 'apple-card',
          type: 'credit',
          bank: 'Apple',
          name: 'Apple Card',
          last4: '9021',
          balance: '$142.50',
          theme: 'bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300',
          textColor: 'text-gray-800',
          logo: <div className="font-medium tracking-tight"> Card</div>,
          transactions: [
              { id: 't1', merchant: 'Apple Store', location: 'Palo Alto', amount: '$1,299.00', date: 'Yesterday', icon: ShoppingBag, category: 'Electronics' },
              { id: 't2', merchant: 'Uber', location: 'San Francisco', amount: '$45.20', date: 'Yesterday', icon: Zap, category: 'Transport' },
              { id: 't3', merchant: 'Whole Foods', location: 'Downtown', amount: '$82.15', date: 'Tuesday', icon: ShoppingBag, category: 'Groceries' },
          ]
      },
      {
          id: 'charity-secure',
          type: 'credit',
          bank: 'Bank of Charity',
          name: 'Secure Reserve',
          last4: '4242',
          theme: 'bg-gradient-to-br from-pink-600 via-purple-700 to-black',
          textColor: 'text-white',
          logo: <div className="font-bold italic">Bank of Charity</div>,
          transactions: [
              { id: 't4', merchant: 'Juno', location: 'Online', amount: '$64.99', date: 'Today', icon: ShoppingBag, category: 'Shopping' },
              { id: 't5', merchant: 'Charity Fly', location: 'Booking', amount: '$450.00', date: 'Monday', icon: Plane, category: 'Travel' },
          ]
      },
      {
          id: 'amex-plat',
          type: 'credit',
          bank: 'American Express',
          name: 'Platinum',
          last4: '1001',
          theme: 'bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500',
          textColor: 'text-slate-900',
          logo: <div className="font-serif font-bold tracking-widest text-xs border-2 border-slate-700 px-1">AMEX</div>,
          transactions: [
              { id: 't6', merchant: 'Equinox', location: 'Membership', amount: '$280.00', date: 'Oct 1', icon: Zap, category: 'Health' },
              { id: 't7', merchant: 'Starbucks', location: 'Palo Alto', amount: '$8.45', date: 'Sep 29', icon: Coffee, category: 'Dining' },
              { id: 't8', merchant: 'Nobu', location: 'Palo Alto', amount: '$320.00', date: 'Sep 28', icon: Utensils, category: 'Dining' },
          ]
      }
  ];

  const handleOpenCharityFly = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOpenApp) {
          onOpenApp('charityfly');
      }
  };

  const handleOpenZion = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onOpenApp) {
          onOpenApp('zion');
      }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="absolute inset-0 bg-black z-50 flex flex-col font-sans text-white overflow-hidden"
    >
      {/* Header */}
      <div className="pt-14 px-6 pb-4 flex justify-between items-center bg-black z-20 sticky top-0">
          {selectedCard ? (
              <button 
                onClick={() => setSelectedCard(null)} 
                className="flex items-center gap-1 text-white font-medium active:opacity-50"
              >
                  <ChevronLeft /> Wallet
              </button>
          ) : (
              <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
          )}
          
          <div className="flex gap-4">
              <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center active:bg-gray-700">
                  <Plus size={20} />
              </button>
              {selectedCard && (
                  <button className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center active:bg-gray-700">
                      <MoreHorizontal size={20} />
                  </button>
              )}
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 no-scrollbar relative">
          
          {/* --- CARD STACK / DETAIL --- */}
          <div className={`relative transition-all duration-500 ${selectedCard ? 'mt-0' : 'mt-4 space-y-[-140px]'}`}>
              {cards.map((card, index) => {
                  const isSelected = selectedCard?.id === card.id;
                  const isHidden = selectedCard && !isSelected;

                  if (isHidden) return null;

                  return (
                      <motion.div
                          key={card.id}
                          layoutId={`card-${card.id}`}
                          onClick={() => !selectedCard && setSelectedCard(card)}
                          className={`w-full aspect-[1.586] rounded-[20px] shadow-2xl relative overflow-hidden cursor-pointer ${card.theme} ${selectedCard ? 'mb-6' : ''}`}
                          style={{ 
                              zIndex: index,
                              transformOrigin: 'top center',
                          }}
                          whileTap={!selectedCard ? { scale: 0.98, y: 10 } : {}}
                      >
                          {/* Card Content */}
                          <div className={`absolute inset-0 p-6 flex flex-col justify-between ${card.textColor}`}>
                              <div className="flex justify-between items-start">
                                  {card.logo}
                                  {card.type === 'credit' && <CreditCard size={24} className="opacity-50" />}
                              </div>
                              
                              <div className="flex justify-between items-end">
                                  <div>
                                      <div className="text-xs font-bold opacity-70 mb-1">
                                          {card.bank === 'Apple' ? 'Cash Balance' : '.... ' + card.last4}
                                      </div>
                                      {card.balance && (
                                          <div className="text-xl font-bold">{card.balance}</div>
                                      )}
                                  </div>
                                  
                                  {card.id === 'charity-secure' && (
                                      <div className="flex items-center gap-1 text-[10px] font-bold border border-white/30 px-2 py-1 rounded-full bg-black/20 backdrop-blur-sm">
                                          <Shield size={10} /> SECURE
                                      </div>
                                  )}
                              </div>
                          </div>
                          
                          {/* Shine Effect */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-50 pointer-events-none" />
                      </motion.div>
                  );
              })}
          </div>

          {/* --- TRANSACTION LIST (ONLY WHEN CARD SELECTED) --- */}
          <AnimatePresence>
              {selectedCard && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6"
                  >
                      <h3 className="text-lg font-bold mb-4">Latest Transactions</h3>
                      <div className="space-y-4">
                          {selectedCard.transactions.map((t) => (
                              <div key={t.id} className="flex items-center gap-4 bg-[#1c1c1e] p-4 rounded-2xl">
                                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                                      <t.icon size={18} />
                                  </div>
                                  <div className="flex-1">
                                      <div className="font-bold text-base">{t.merchant}</div>
                                      <div className="text-xs text-gray-400">{t.location} • {t.category}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-medium text-white">{t.amount}</div>
                                      <div className="text-xs text-gray-500">{t.date}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                      
                      <div className="mt-8 p-4 bg-[#1c1c1e] rounded-2xl flex items-center justify-between text-sm text-gray-400">
                          <span>Total Balance</span>
                          <span className="text-white font-bold">$4,284.22</span>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* --- PASSES SECTION (ONLY WHEN NO CARD SELECTED) --- */}
          {!selectedCard && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.2 }}
                className="mt-[40px]"
              >
                  <h3 className="text-xl font-bold mb-4 pl-1">Passes</h3>
                  
                  {/* Boarding Pass with Image */}
                  <div 
                    onClick={handleOpenCharityFly}
                    className="w-full bg-white rounded-xl overflow-hidden mb-4 relative group cursor-pointer active:scale-[0.98] transition-transform shadow-lg"
                  >
                      {/* Top Part - Image Background */}
                      <div className="h-28 relative overflow-hidden">
                          <img 
                            src="https://images.unsplash.com/photo-1518182170546-07661fd94144?auto=format&fit=crop&w=800&q=80" 
                            className="w-full h-full object-cover"
                            alt="Costa Rica"
                          />
                          <div className="absolute inset-0 bg-black/40"></div>
                          <div className="absolute inset-0 p-4 flex flex-col justify-between">
                              <div className="flex justify-between items-center text-white">
                                  <div className="flex items-center gap-2">
                                      <Plane size={18} />
                                      <span className="font-bold italic">Charity Fly</span>
                                  </div>
                                  <span className="font-mono text-[10px] opacity-80 border border-white/50 px-1 rounded">BOARDING PASS</span>
                              </div>
                              <div className="flex justify-between items-end text-white">
                                  <div>
                                      <div className="text-3xl font-black leading-none">JFK</div>
                                      <div className="text-xs opacity-80">New York</div>
                                  </div>
                                  <Plane size={24} className="rotate-90 opacity-80 mb-2" />
                                  <div className="text-right">
                                      <div className="text-3xl font-black leading-none">LIR</div>
                                      <div className="text-xs opacity-80">Costa Rica</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      {/* Details */}
                      <div className="p-4 bg-white text-black">
                          <div className="flex justify-between items-center">
                              <div>
                                  <span className="text-xs text-gray-400 uppercase block">Passenger</span>
                                  <span className="font-bold text-sm">ELOISE SAWYER</span>
                              </div>
                              <div className="text-right">
                                  <span className="text-xs text-gray-400 uppercase block">Flight</span>
                                  <span className="font-bold text-sm text-sky-600">CF-882</span>
                              </div>
                          </div>
                      </div>

                      {/* Barcode Strip */}
                      <div className="bg-gray-100 p-3 flex items-center justify-between border-t border-gray-200">
                          <QrCode size={32} className="text-black" />
                          <div className="text-[10px] font-mono text-gray-400">
                              TK: 88291029381
                          </div>
                      </div>
                  </div>

                  {/* Store Card with Background Text */}
                  <div 
                    onClick={handleOpenZion}
                    className="w-full h-44 bg-white rounded-xl flex flex-col justify-between p-4 border border-gray-200 shadow-lg relative overflow-hidden group cursor-pointer"
                  >
                      {/* Big Background Text */}
                      <div className="absolute -right-4 -bottom-4 text-[100px] font-black text-black/5 leading-none font-serif italic pointer-events-none select-none">
                          JUNO
                      </div>
                      
                      <div className="relative z-10 flex justify-between items-start">
                          <div className="w-10 h-10 bg-black rounded-md flex items-center justify-center shadow-md">
                              <span className="font-black font-serif italic text-white text-[8px] tracking-widest">JUNO</span>
                          </div>
                          <CheckCircle size={20} className="text-black" />
                      </div>
                      
                      <div className="relative z-10">
                          <div className="font-bold text-lg text-black">Juno Rewards</div>
                          <div className="text-sm text-gray-500">$25.00 Store Credit Available</div>
                      </div>
                  </div>
              </motion.div>
          )}
      </div>

      {/* Home Indicator */}
      <div 
          className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
          onClick={onClose}
      >
          <div className="w-32 h-1.5 bg-gray-400/50 rounded-full active:bg-gray-400 transition-colors" />
      </div>
    </motion.div>
  );
};
