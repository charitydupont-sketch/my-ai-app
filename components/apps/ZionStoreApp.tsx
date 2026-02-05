
import React, { useState } from 'react';
import { 
  ChevronLeft, ShoppingCart, Search, Bot, MessageSquare, Plus, Minus,
  MapPin, Menu, X, Star, ArrowRight, Zap, ShoppingBag, Truck, Gift, Heart,
  ScanLine, Package, Shield, ExternalLink, ChevronDown, Check, Trash2, CreditCard, CheckCircle, Lock, Share,
  Filter, User, Clock, Bell, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SilasLogo } from '../SilasApp';
import { Transaction, GlobalCartItem } from '../../types';

interface ZionStoreAppProps {
  onClose: () => void;
  silasEnabled?: boolean;
  onTransaction?: (t: Transaction) => void;
  cart: GlobalCartItem[];
  addToCart: (item: GlobalCartItem) => void;
  removeFromCart: (itemId: string) => void;
}

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  isSilas?: boolean;
  isPrime?: boolean;
  silasEvidence?: {
      type: 'message' | 'note';
      context: string; // The "Reasoning" displayed
      text: string; // The raw text matched
      source: string; // "iMessage with Daniel"
      sender: string; // Initials or Name
      date: string;
  };
}

// Mock Orders
const PAST_ORDERS = [
    { id: 'ORD-9921', date: 'Oct 24, 2023', total: '$142.50', status: 'Delivered', items: ['Aesop Hand Wash', 'Ceramic Vase'] },
    { id: 'ORD-8812', date: 'Oct 10, 2023', total: '$64.99', status: 'Delivered', items: ['Blue Buffalo Dog Food'] },
    { id: 'ORD-7763', date: 'Sep 28, 2023', total: '$320.00', status: 'Returned', items: ['Winter Parka'] },
];

export const ZionStoreApp: React.FC<ZionStoreAppProps> = ({ onClose, silasEnabled = true, onTransaction, cart, addToCart, removeFromCart }) => {
  const [view, setView] = useState<'HOME' | 'DETAIL' | 'CART' | 'CHECKOUT' | 'SUCCESS' | 'PROFILE'>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Instant "Buy Now" flow (Separate from Global Cart)
  const [instantCheckoutItem, setInstantCheckoutItem] = useState<GlobalCartItem | null>(null);
  
  // --- MOCK DATA ---
  const products: Product[] = [
      { 
          id: 1, name: 'Blue Buffalo Life Protection Formula', brand: 'Blue Buffalo', price: 64.99, rating: 4.8, reviews: 14209,
          image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80', 
          category: 'Pet Supplies',
          isSilas: true, 
          isPrime: true,
          silasEvidence: {
              type: 'message',
              context: 'Context: Daniel mentioned "Hunter is out of food".',
              text: "Hunter is out of dog food, can you order some?",
              source: "iMessage with Daniel",
              sender: "Daniel",
              date: "Yesterday 9:41 AM"
          }
      },
      { 
          id: 2, name: 'Sony WH-1000XM5 Noise Canceling', brand: 'Sony', price: 348.00, rating: 4.6, reviews: 8902,
          image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80', 
          category: 'Electronics',
          isPrime: true
      },
      { 
          id: 3, name: 'The Midnight Library: A Novel', brand: 'Matt Haig', price: 13.29, rating: 4.5, reviews: 24050,
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', 
          category: 'Books',
          isSilas: true,
          isPrime: true,
          silasEvidence: {
              type: 'note',
              context: 'Context: You highlighted themes of "Regret" & "Parallel Lives".',
              text: "Bookmarked page 42. Highlights regarding parallel lives and regret.",
              source: "Books App",
              sender: "System",
              date: "Yesterday"
          }
      },
      {
          id: 5, name: 'Apple Watch Series 9 [GPS 41mm]', brand: 'Apple', price: 329.00, rating: 4.9, reviews: 5200,
          image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
          category: 'Wearable',
          isSilas: true,
          isPrime: true,
          silasEvidence: {
              type: 'message',
              context: 'Context: Complaint about fatigue in chat.',
              text: "I need to start tracking my sleep. I'm so tired lately.",
              source: "Text to Sarah",
              sender: "Me",
              date: "Monday"
          }
      },
      {
          id: 6, name: 'Lumos Smart Sleep Mask', brand: 'Lumos', price: 55.00, rating: 4.2, reviews: 890,
          image: 'https://images.unsplash.com/photo-1542848284-8afa78a08ccb?auto=format&fit=crop&w=800&q=80',
          category: 'Wellness',
          isPrime: false
      }
  ];

  // --- ACTIONS ---
  const openProduct = (p: Product) => {
      setSelectedProduct(p);
      setView('DETAIL');
      setShowEvidenceModal(false);
  };

  const handleAddToCart = (p: Product) => {
      const item: GlobalCartItem = {
          id: Date.now().toString(),
          name: p.name,
          price: p.price,
          store: 'Juno Store',
          category: p.category,
          addedAt: new Date(),
          image: p.image,
          brand: p.brand
      };
      addToCart(item);
      setInstantCheckoutItem(null); 
      setView('CART');
  };

  const handleBuyNow = (p: Product) => {
      // Create temp item for immediate checkout
      const item: GlobalCartItem = {
          id: `instant-${Date.now()}`,
          name: p.name,
          price: p.price,
          store: 'Juno Store',
          category: p.category,
          addedAt: new Date(),
          image: p.image,
          brand: p.brand
      };
      setInstantCheckoutItem(item);
      setView('CHECKOUT');
  };

  const zionCartItems = cart.filter(i => i.store === 'Juno Store' || i.store === 'Zion Store' || i.store === 'Lumina'); // Support old names for compatibility

  // Determine checkout items
  const activeCheckoutItems = instantCheckoutItem ? [instantCheckoutItem] : zionCartItems;
  const activeTotal = activeCheckoutItems.reduce((total, item) => total + item.price, 0).toFixed(2);

  const handlePlaceOrder = () => {
      if (onTransaction) {
          onTransaction({
              id: `t-${Date.now()}`,
              merchant: 'Juno Store',
              category: 'Shopping',
              amount: `-$${activeTotal}`,
              date: 'Just now',
              type: 'debit',
              icon: ShoppingBag,
              color: 'bg-black text-white'
          });
      }
      setView('SUCCESS');
  };

  const handleBack = () => {
      if (view === 'DETAIL' || view === 'CART' || view === 'PROFILE') setView('HOME');
      else if (view === 'CHECKOUT') {
          if (instantCheckoutItem) {
              setView('DETAIL');
              setInstantCheckoutItem(null);
          } else {
              setView('CART');
          }
      }
      else if (view === 'SUCCESS') { 
          if (!instantCheckoutItem) {
              zionCartItems.forEach(i => removeFromCart(i.id));
          }
          setInstantCheckoutItem(null);
          setView('HOME'); 
      }
      else onClose();
  };

  return (
    <div className="absolute inset-0 z-[60] w-full h-full bg-white text-black font-sans overflow-hidden flex flex-col">
       
       {/* --- HEADER --- */}
       <div className="pt-12 pb-4 px-6 z-30 sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 flex justify-between items-center shrink-0">
           <div className="flex items-center gap-4">
                {view !== 'HOME' && (
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="w-6 h-6 text-black" />
                    </button>
                )}
                {view === 'HOME' && (
                    <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-6 h-6 text-black" />
                    </button>
                )}
                <span className="font-black text-2xl tracking-tighter uppercase italic">JUNO</span>
           </div>
           
           <div className="flex items-center gap-3">
                <button onClick={() => setView('PROFILE')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <User className="w-6 h-6 text-black" />
                </button>
                <button onClick={() => { setInstantCheckoutItem(null); setView('CART'); }} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <ShoppingBag className="w-6 h-6 text-black" />
                    {zionCartItems.length > 0 && (
                        <span className="absolute top-1 right-0 w-4 h-4 bg-black text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                            {zionCartItems.length}
                        </span>
                    )}
                </button>
           </div>
       </div>

       {/* --- HOME VIEW --- */}
       {view === 'HOME' && (
           <div className="flex-1 overflow-y-auto no-scrollbar">
               {/* Search Hero */}
               <div className="px-6 mb-8 mt-4">
                   <h1 className="text-4xl font-light mb-6">Curated for <br/><span className="font-bold">Eloise.</span></h1>
                   <div className="relative group">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                       <input 
                            type="text" 
                            placeholder="What do you need?" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-lg outline-none focus:border-black transition-all shadow-sm focus:shadow-md"
                       />
                   </div>
               </div>

               {/* Featured Grid */}
               <div className="px-6 grid grid-cols-2 gap-x-4 gap-y-8 pb-24">
                   {products.map((p) => (
                       <div key={p.id} onClick={() => openProduct(p)} className="group cursor-pointer">
                           <div className="aspect-[3/4] bg-gray-100 rounded-2xl mb-3 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                               <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                               {p.isSilas && (
                                   <div className="absolute top-3 left-3 bg-black/90 backdrop-blur-md w-8 h-8 rounded-full shadow-sm flex items-center justify-center border border-purple-500/30">
                                       <SilasLogo className="w-4 h-4 text-purple-400" />
                                   </div>
                               )}
                               <button className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                   <Plus size={20} />
                               </button>
                           </div>
                           <div className="flex justify-between items-start px-1">
                               <div>
                                   <h3 className="font-bold text-sm leading-tight mb-1">{p.name}</h3>
                                   <p className="text-xs text-gray-500">{p.brand}</p>
                               </div>
                               <span className="font-medium text-sm">${Math.floor(p.price)}</span>
                           </div>
                       </div>
                   ))}
               </div>
           </div>
       )}

       {/* --- PRODUCT DETAIL VIEW --- */}
       {view === 'DETAIL' && selectedProduct && (
           <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col min-h-0 bg-white"
           >
               <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                   <div className="h-[50vh] bg-gray-100 relative shrink-0">
                       <img src={selectedProduct.image} className="w-full h-full object-cover" />
                       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
                   </div>

                   <div className="px-6 -mt-12 relative z-10 pb-8">
                       <div className="flex justify-between items-start mb-2">
                           <div>
                               <h1 className="text-3xl font-black mb-1">{selectedProduct.brand}</h1>
                               <p className="text-lg text-gray-600 font-medium">{selectedProduct.name}</p>
                           </div>
                           <div className="text-2xl font-bold">${selectedProduct.price}</div>
                       </div>

                       {/* SILAS INTERACTIVE CARD */}
                       {selectedProduct.isSilas && selectedProduct.silasEvidence && (
                            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 p-5 rounded-2xl mb-8 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                                            <SilasLogo className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-black uppercase tracking-wide">Silas Context</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-800 font-medium mb-4 relative z-10 leading-relaxed">
                                    {selectedProduct.silasEvidence.context}
                                </p>

                                <button 
                                    onClick={() => setShowEvidenceModal(true)}
                                    className="w-full bg-white border border-purple-200 text-purple-700 font-bold text-xs py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
                                >
                                    <MessageSquare size={14} /> View Evidence
                                </button>
                            </div>
                       )}

                       <div className="space-y-4">
                           <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Description</h3>
                           <p className="text-gray-800 leading-relaxed font-light text-lg">
                               Premium quality meets modern design. The {selectedProduct.name} is rated {selectedProduct.rating}/5 stars by our community. Built for durability and style.
                           </p>
                       </div>
                   </div>
               </div>

               {/* Footer */}
               <div className="p-6 bg-white border-t border-gray-100 flex gap-4 shrink-0 pb-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                   <button 
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="flex-1 py-4 bg-gray-100 text-black font-bold rounded-2xl hover:bg-gray-200 transition-colors"
                   >
                       Add to Cart
                   </button>
                   <button 
                        onClick={() => handleBuyNow(selectedProduct)}
                        className="flex-1 py-4 bg-black text-white font-bold rounded-2xl shadow-xl hover:bg-gray-900 transition-colors"
                   >
                       Buy Now
                   </button>
               </div>
           </motion.div>
       )}

       {/* --- PROFILE VIEW --- */}
       {view === 'PROFILE' && (
           <motion.div 
               initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
               className="flex-1 flex flex-col min-h-0 bg-gray-50"
           >
               <div className="flex-1 overflow-y-auto">
                   <div className="bg-white pb-8 pt-4 px-6 border-b border-gray-100">
                       <div className="flex items-center gap-4 mb-6">
                           <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                               <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover" />
                           </div>
                           <div>
                               <h2 className="text-2xl font-bold">Eloise Sawyer</h2>
                               <p className="text-gray-500 text-sm">eloise.sawyer@icloud.com</p>
                               <div className="flex gap-2 mt-2">
                                   <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded">Juno Member</span>
                               </div>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4">
                           <button className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                               <CreditCard size={20} className="mb-2 text-gray-700" />
                               <div className="font-bold text-sm">Payment</div>
                               <div className="text-xs text-gray-500">**** 4242</div>
                           </button>
                           <button className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                               <MapPin size={20} className="mb-2 text-gray-700" />
                               <div className="font-bold text-sm">Shipping</div>
                               <div className="text-xs text-gray-500">Palo Alto, CA</div>
                           </button>
                       </div>
                   </div>

                   <div className="p-6">
                       <h3 className="font-bold text-lg mb-4">Past Orders</h3>
                       <div className="space-y-4">
                           {PAST_ORDERS.map(order => (
                               <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                   <div className="flex justify-between items-start mb-3">
                                       <div>
                                           <div className="font-bold text-sm">{order.id}</div>
                                           <div className="text-xs text-gray-500">{order.date}</div>
                                       </div>
                                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                           {order.status}
                                       </span>
                                   </div>
                                   <div className="space-y-1 mb-3">
                                       {order.items.map((item, i) => (
                                           <div key={i} className="text-sm text-gray-800">{item}</div>
                                       ))}
                                   </div>
                                   <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-sm font-medium">
                                       <span>Total</span>
                                       <span>{order.total}</span>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           </motion.div>
       )}

       {/* --- CART VIEW --- */}
       {view === 'CART' && (
           <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="flex-1 flex flex-col min-h-0 bg-gray-50"
           >
               <div className="flex-1 overflow-y-auto p-6 space-y-4">
                   <h2 className="text-2xl font-bold mb-6">Your Bag ({zionCartItems.length})</h2>
                   
                   {zionCartItems.map((item, i) => (
                       <div key={i} className="bg-white p-4 rounded-2xl flex gap-4 shadow-sm">
                           <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                               {item.image ? (
                                   <img src={item.image} className="w-full h-full object-cover" />
                               ) : (
                                   <ShoppingBag size={24} className="text-gray-300 m-auto mt-6" />
                               )}
                           </div>
                           <div className="flex-1 flex flex-col justify-between">
                               <div>
                                   <div className="font-bold text-sm line-clamp-1">{item.name}</div>
                                   <div className="text-xs text-gray-500">{item.brand || 'Juno'}</div>
                               </div>
                               <div className="flex justify-between items-center">
                                   <div className="font-bold">${item.price}</div>
                                   <button onClick={() => removeFromCart(item.id)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                                       <Trash2 size={14} className="text-gray-500" />
                                   </button>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>

               {/* Cart Footer */}
               <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0 pb-10">
                   <div className="flex justify-between items-center mb-6">
                       <span className="text-gray-500">Total</span>
                       <span className="text-2xl font-bold">${activeTotal}</span>
                   </div>
                   <button 
                        onClick={() => setView('CHECKOUT')}
                        className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex justify-between px-6 items-center"
                   >
                       <span>Checkout</span>
                       <ArrowRight size={20} />
                   </button>
               </div>
           </motion.div>
       )}

       {/* --- CHECKOUT & SUCCESS VIEWS --- */}
       {(view === 'CHECKOUT' || view === 'SUCCESS') && (
           <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="flex-1 flex flex-col min-h-0 bg-gray-50"
           >
               {view === 'CHECKOUT' ? (
                   <>
                       <div className="p-6 flex-1 overflow-y-auto space-y-6">
                           <h2 className="text-2xl font-bold">Checkout</h2>
                           <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">
                               <div className="flex items-center justify-between">
                                   <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Shipping</span>
                                   <span className="text-black font-bold text-sm">Edit</span>
                               </div>
                               <div>
                                   <div className="font-bold">Eloise Sawyer</div>
                                   <div className="text-gray-500 text-sm">1042 Silicon Ave<br/>Palo Alto, CA</div>
                               </div>
                           </div>
                           <div className="bg-white p-5 rounded-2xl shadow-sm space-y-3">
                               <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${activeTotal}</span></div>
                               <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="text-green-600 font-bold">Free</span></div>
                               <div className="border-t border-gray-100 pt-3 flex justify-between items-center"><span className="font-bold">Total</span><span className="text-xl font-bold">${activeTotal}</span></div>
                           </div>
                       </div>
                       <div className="p-6 bg-white border-t border-gray-100 shrink-0 pb-10">
                           <button onClick={handlePlaceOrder} className="w-full py-4 bg-black text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2">
                               <Lock size={16} /> Pay ${activeTotal}
                           </button>
                       </div>
                   </>
               ) : (
                   <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                       <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                           <Check size={48} className="text-green-600" strokeWidth={3} />
                       </div>
                       <h2 className="text-3xl font-bold mb-4">Order Confirmed</h2>
                       <p className="text-gray-500 mb-12">Thank you for shopping with Juno.</p>
                       <button onClick={handleBack} className="px-10 py-4 bg-black text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform">Continue Shopping</button>
                   </div>
               )}
           </motion.div>
       )}

       {/* --- EVIDENCE MODAL --- */}
       <AnimatePresence>
           {showEvidenceModal && selectedProduct && selectedProduct.silasEvidence && (
               <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                   className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-end justify-center"
                   onClick={() => setShowEvidenceModal(false)}
               >
                   <motion.div 
                       initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                       className="bg-[#F2F2F7] w-full rounded-t-[2rem] p-6 shadow-2xl overflow-hidden relative pb-12"
                       onClick={e => e.stopPropagation()}
                   >
                       <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-md">
                                   <SilasLogo className="w-5 h-5 text-white" />
                               </div>
                               <div>
                                   <h3 className="font-bold text-xl text-slate-900">Evidence Found</h3>
                                   <p className="text-xs text-gray-500">Source: {selectedProduct.silasEvidence.source}</p>
                               </div>
                           </div>
                           <button onClick={() => setShowEvidenceModal(false)} className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition-colors"><X size={20} className="text-gray-600" /></button>
                       </div>

                       {/* Simulated Chat Interface */}
                       <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 relative overflow-hidden">
                           <div className="flex flex-col gap-4">
                               <div className="text-[10px] text-gray-400 text-center uppercase tracking-widest">{selectedProduct.silasEvidence.date}</div>
                               
                               <div className="flex items-end gap-2">
                                   <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                       {selectedProduct.silasEvidence.sender.charAt(0)}
                                   </div>
                                   <div className="relative">
                                       <div className="bg-[#E9E9EB] text-black px-4 py-2 rounded-2xl rounded-bl-sm text-[15px] leading-snug max-w-[240px]">
                                           {selectedProduct.silasEvidence.text}
                                       </div>
                                       
                                       {/* Red Circle Annotation Overlay */}
                                       <div className="absolute -inset-2 pointer-events-none z-20">
                                           <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                                               <motion.path
                                                   d="M 5,50 C 5,10 20,-10 95,5 C 120,20 110,80 90,95 C 60,110 20,100 5,80 C -10,60 0,50 5,50"
                                                   fill="none"
                                                   stroke="#ff3b30" 
                                                   strokeWidth="3"
                                                   strokeLinecap="round"
                                                   initial={{ pathLength: 0, opacity: 0 }}
                                                   animate={{ pathLength: 1, opacity: 0.8 }}
                                                   transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                                   vectorEffect="non-scaling-stroke"
                                                   transform="scale(1.05, 1.3) translate(0, -5)"
                                               />
                                           </svg>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       </div>

                       <div className="mt-8">
                           <button 
                               onClick={() => setShowEvidenceModal(false)}
                               className="w-full py-4 bg-black text-white font-bold rounded-2xl active:scale-95 transition-transform"
                           >
                               Close
                           </button>
                       </div>
                   </motion.div>
               </motion.div>
           )}
       </AnimatePresence>

       {/* Home Indicator */}
        <div 
            className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer pointer-events-auto"
            onClick={onClose}
        >
            <div className="w-32 h-1.5 bg-black/20 rounded-full" />
        </div>
    </div>
  );
};
