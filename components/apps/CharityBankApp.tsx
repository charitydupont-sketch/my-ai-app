
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Send, TrendingUp, PieChart, Menu, Bell, Wallet, 
  ArrowUpRight, ArrowDownLeft, Plane, Bot, Scan, Receipt, X, 
  MapPin, Calendar, Share, Loader2, ShoppingBag, CheckCircle, 
  Home, Activity, DollarSign, Lock, Unlock, Eye, EyeOff, 
  ChevronRight, Search, Filter, User, Smartphone, Zap, Briefcase,
  Car, ArrowRight, ScanLine, FileText, Shield, Key, LogOut, ChevronDown, Landmark, BarChart3, Percent,
  Gift, ChevronLeft, Globe
} from 'lucide-react';
import { Transaction } from '../../types';
import { generateReceipt } from '../../services/geminiService';

interface CharityBankAppProps {
  onClose: () => void;
  transactions?: Transaction[];
  onAddToCart?: (item: { name: string; price: number; store: string; category?: string }) => void;
}

// --- Extended Types ---
interface Account {
    id: string;
    name: string;
    type: 'Checking' | 'Savings' | 'Investment' | 'Loan';
    balance: number;
    accountNum: string;
    color: string; // Gradient class
    change?: number; // Daily change for stocks
}

interface Stock {
    symbol: string;
    name: string;
    shares: number;
    price: number;
    change: number;
    color: string;
}

export const CharityBankApp: React.FC<CharityBankAppProps> = ({ onClose, transactions = [], onAddToCart }) => {
  // --- STATE ---
  const [bottomTab, setBottomTab] = useState<'CARDS' | 'BANKING' | 'LENDING' | 'INVESTING'>('BANKING');
  const [topTab, setTopTab] = useState<'MY_ACCOUNT' | 'BANKING' | 'CREDIT_CARDS' | 'LOANS' | 'INVEST'>('MY_ACCOUNT');
  
  // Navigation State
  const [viewState, setViewState] = useState<'DASHBOARD' | 'ACCOUNT_DETAIL' | 'STATEMENTS'>('DASHBOARD');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Card Flip State
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Gemini/Receipt State
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [receiptItems, setReceiptItems] = useState<{name: string, price: string}[]>([]);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // --- MOCK DATA ---
  
  const accounts: Account[] = [
      { id: 'chk', name: 'Charity Advantage Checking', type: 'Checking', balance: 24342.50, accountNum: '...8821', color: 'bg-black text-white' },
      { id: 'sav', name: 'High Yield Savings', type: 'Savings', balance: 145000.00, accountNum: '...9901', color: 'bg-blue-600 text-white' },
      { id: 'cc', name: 'Charity Platinum Reserve', type: 'Checking', balance: -4120.50, accountNum: '...4242', color: 'bg-gradient-to-br from-pink-600 to-purple-800 text-white' },
  ];

  const loans: Account[] = [
      { id: 'loan1', name: 'Auto Loan - Tesla Model 3', type: 'Loan', balance: -18420.00, accountNum: '...2219', color: 'bg-gray-800 text-white' }
  ];

  const stocks: Stock[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 150, price: 182.50, change: 1.2, color: 'bg-gray-900' },
      { symbol: 'TSLA', name: 'Tesla Inc.', shares: 40, price: 240.10, change: -0.5, color: 'bg-red-600' },
      { symbol: 'NVDA', name: 'NVIDIA Corp', shares: 10, price: 460.15, change: 2.4, color: 'bg-green-600' },
      { symbol: 'AMZN', name: 'Amazon.com', shares: 55, price: 130.20, change: 0.8, color: 'bg-orange-500' },
  ];

  // Massive Transaction History Generator
  const generateHistory = () => {
      const merchants = ['Whole Foods', 'Shell Station', 'Starbucks', 'Uber', 'Netflix', 'Spotify', 'Amazon', 'Target', 'CVS Pharmacy', 'Trader Joes', 'Equinox', 'Lumina', 'Charity Fly', 'Apple Store'];
      const categories = ['Groceries', 'Transport', 'Dining', 'Transport', 'Entertainment', 'Entertainment', 'Shopping', 'Shopping', 'Health', 'Groceries', 'Health', 'Shopping', 'Travel', 'Electronics'];
      
      let history: Transaction[] = [...transactions]; // Start with prop transactions
      
      // Generate 40 more
      for (let i = 0; i < 40; i++) {
          const rand = Math.floor(Math.random() * merchants.length);
          const amount = (Math.random() * 200 + 5).toFixed(2);
          history.push({
              id: `gen-${i}`,
              merchant: merchants[rand],
              category: categories[rand],
              amount: `-$${amount}`,
              date: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`,
              type: 'debit',
              icon: ShoppingBag, // Simplified icon logic
              color: 'bg-gray-100 text-gray-600'
          });
      }
      return history;
  };

  const [allTransactions] = useState<Transaction[]>(generateHistory());

  // --- ACTIONS ---

  const showToast = (msg: string) => {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTransactionClick = async (t: Transaction) => {
      setSelectedTransaction(t);
      setLoadingReceipt(true);
      setReceiptItems([]);
      try {
          const items = await generateReceipt(t.merchant, t.amount, t.category);
          setReceiptItems(items);
      } catch (e) { console.error(e); } 
      finally { setLoadingReceipt(false); }
  };

  const handleAddToCart = (e: React.MouseEvent, itemName: string, priceStr: string) => {
      e.stopPropagation();
      const price = parseFloat(priceStr.replace(/[^0-9.]/g, ''));
      if (onAddToCart && selectedTransaction) {
          onAddToCart({
              name: itemName,
              price: isNaN(price) ? 0 : price,
              store: selectedTransaction.merchant,
              category: selectedTransaction.category
          });
      }
      showToast(`Added ${itemName} to Cart`);
  };

  // --- SUB-COMPONENTS ---

  const QuickAction = ({ icon: Icon, label, color = "text-pink-600", onClick }: any) => (
      <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform" onClick={onClick}>
          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
              <Icon className={color} size={24} />
          </div>
          <span className="text-[11px] font-medium text-gray-600 text-center leading-tight w-16">{label}</span>
      </div>
  );

  const PromoCard = ({ title, subtitle, icon: Icon, bgClass }: any) => (
      <div className={`p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between mb-4 ${bgClass}`}>
          <div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">{title}</h4>
              <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
          {Icon && <Icon className="text-gray-400" size={20} />}
      </div>
  );

  // --- VIEWS ---

  const renderDashboard = () => (
      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-32">
          {/* Top Tabs */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="flex overflow-x-auto no-scrollbar px-4 pt-2">
                  {[
                      { id: 'MY_ACCOUNT', l: 'My Account' },
                      { id: 'BANKING', l: 'Banking' },
                      { id: 'CREDIT_CARDS', l: 'Credit Cards' },
                      { id: 'LOANS', l: 'Loans' },
                      { id: 'INVEST', l: 'Invest' }
                  ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setTopTab(tab.id as any)}
                        className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${topTab === tab.id ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500'}`}
                      >
                          {tab.l}
                      </button>
                  ))}
              </div>
          </div>

          {/* Dynamic Content Based on Top Tab */}
          <div className="p-4 space-y-6">
              
              {/* MY ACCOUNT VIEW */}
              {topTab === 'MY_ACCOUNT' && (
                  <>
                      {/* Account Summaries */}
                      <div className="space-y-4">
                          {accounts.map(acc => (
                              <div 
                                key={acc.id} 
                                onClick={() => { setSelectedAccount(acc); setViewState('ACCOUNT_DETAIL'); }}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 active:scale-[0.99] transition-transform cursor-pointer"
                              >
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${acc.color}`}>
                                              {acc.name.includes('Savings') ? <Landmark size={18} /> : <CreditCard size={18} />}
                                          </div>
                                          <div>
                                              <h3 className="font-bold text-gray-900 text-sm">{acc.name}</h3>
                                              <p className="text-xs text-gray-500 font-mono">{acc.accountNum}</p>
                                          </div>
                                      </div>
                                      <ChevronRight size={16} className="text-gray-300" />
                                  </div>
                                  <div className="pl-[52px]">
                                      <span className={`text-2xl font-bold tracking-tight ${acc.balance < 0 ? 'text-black' : 'text-green-600'}`}>
                                          ${Math.abs(acc.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                      </span>
                                      <span className="text-xs text-gray-400 block mt-1">Available Balance</span>
                                  </div>
                              </div>
                          ))}
                      </div>

                      {/* Quick Actions Grid */}
                      <div className="grid grid-cols-4 gap-4 py-4">
                          <QuickAction icon={Zap} label="Zelle" color="text-purple-600" />
                          <QuickAction icon={ArrowUpRight} label="Pay & Transfer" />
                          <QuickAction icon={ScanLine} label="Deposit Checks" />
                          <QuickAction icon={FileText} label="Statements" onClick={() => setViewState('STATEMENTS')} />
                          <QuickAction icon={Lock} label="Lock Card" />
                          <QuickAction icon={Gift} label="Rewards" />
                          <QuickAction icon={Shield} label="Security" />
                          <QuickAction icon={LogOut} label="Sign Off" color="text-red-500" onClick={onClose} />
                      </div>

                      {/* Marketing/Extra Cards */}
                      <div className="space-y-3">
                          <PromoCard title="Ways to Save" subtitle="Explore high-yield options." icon={ArrowRight} bgClass="bg-green-50 border-green-100" />
                          <PromoCard title="Recurring Payments" subtitle="Review & Sign off on subscriptions." icon={CheckCircle} bgClass="bg-blue-50 border-blue-100" />
                          <PromoCard title="Your New Account Guy" subtitle="Schedule a meeting with Daniel." icon={User} bgClass="bg-white" />
                      </div>
                  </>
              )}

              {/* LOANS VIEW */}
              {topTab === 'LOANS' && (
                  <div className="space-y-4">
                      {loans.map(loan => (
                          <div key={loan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white"><Car size={18} /></div>
                                      <div>
                                          <h3 className="font-bold text-gray-900">{loan.name}</h3>
                                          <p className="text-xs text-gray-500">{loan.accountNum}</p>
                                      </div>
                                  </div>
                              </div>
                              <div className="mb-4">
                                  <span className="text-3xl font-bold text-gray-900">${Math.abs(loan.balance).toLocaleString()}</span>
                                  <span className="text-xs text-gray-500 block">Remaining Balance</span>
                              </div>
                              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                                  <div className="w-2/3 h-full bg-blue-600 rounded-full" />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                  <span>Paid: 65%</span>
                                  <span>Next Payment: Oct 15</span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* INVEST VIEW */}
              {topTab === 'INVEST' && (
                  <div className="space-y-6">
                      <div className="bg-black text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                          <div className="relative z-10">
                              <span className="text-sm font-medium text-gray-400">Total Portfolio</span>
                              <div className="text-4xl font-bold mb-2">$128,450.00</div>
                              <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                  <TrendingUp size={12} /> +2.4% Today
                              </div>
                          </div>
                          {/* Background Chart Effect */}
                          <div className="absolute bottom-0 right-0 opacity-20">
                              <BarChart3 size={120} />
                          </div>
                      </div>

                      <div className="space-y-3">
                          <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider">Your Positions</h3>
                          {stocks.map(stock => (
                              <div key={stock.symbol} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${stock.color}`}>
                                          {stock.symbol[0]}
                                      </div>
                                      <div>
                                          <div className="font-bold text-gray-900">{stock.symbol}</div>
                                          <div className="text-xs text-gray-500">{stock.shares} shares</div>
                                      </div>
                                  </div>
                                  <div className="text-right">
                                      <div className="font-bold">${stock.price}</div>
                                      <div className={`text-xs font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                          {stock.change > 0 ? '+' : ''}{stock.change}%
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
  );

  const renderAccountDetail = () => {
      if (!selectedAccount) return null;
      
      // Filter transactions: If Savings, only show credits (Deposits)
      const visibleTransactions = selectedAccount.type === 'Savings'
          ? allTransactions.filter(t => t.type === 'credit')
          : allTransactions;

      return (
          <div className="flex-1 flex flex-col bg-white">
              {/* Detail Header */}
              <div className="bg-white p-6 pb-2 border-b border-gray-100 sticky top-0 z-20">
                  <button onClick={() => { setViewState('DASHBOARD'); setSelectedAccount(null); }} className="flex items-center gap-1 text-pink-600 font-bold mb-4 text-sm">
                      <ChevronLeft size={16} /> Back to Accounts
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{selectedAccount.name}</h1>
                  <p className="text-gray-500 text-sm font-mono mb-4">{selectedAccount.accountNum}</p>
                  <div className="text-4xl font-bold text-black mb-6">
                      ${Math.abs(selectedAccount.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                  
                  {/* Search / Filter Bar */}
                  <div className="flex gap-3 pb-2">
                      <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 flex items-center gap-2">
                          <Search size={16} className="text-gray-400" />
                          <input type="text" placeholder="Search transactions" className="bg-transparent outline-none text-sm w-full" />
                      </div>
                      <button className="p-2 bg-gray-100 rounded-lg text-gray-600"><Filter size={20} /></button>
                  </div>
              </div>

              {/* Transactions List */}
              <div className="flex-1 overflow-y-auto p-0 pb-32">
                  <div className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50">Transaction History</div>
                  {visibleTransactions.map((t, i) => (
                      <div 
                        key={i} 
                        onClick={() => handleTransactionClick(t)}
                        className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer active:bg-gray-100"
                      >
                          <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.color || 'bg-gray-200'}`}>
                                  {t.icon ? <t.icon size={16} /> : <ShoppingBag size={16} />}
                              </div>
                              <div>
                                  <div className="font-bold text-gray-900 text-sm">{t.merchant}</div>
                                  <div className="text-xs text-gray-500">{t.date} • {t.category}</div>
                              </div>
                          </div>
                          <span className={`font-bold text-sm ${t.type === 'credit' ? 'text-green-600' : 'text-black'}`}>
                              {t.amount}
                          </span>
                      </div>
                  ))}
                  {visibleTransactions.length === 0 && (
                      <div className="p-8 text-center text-gray-400 text-sm">No recent transactions.</div>
                  )}
              </div>
          </div>
      );
  };

  const renderCardView = () => (
      <div className="flex-1 flex flex-col items-center pt-8 bg-gray-100">
          <div className="perspective-1000 w-full max-w-sm px-6">
              <motion.div 
                  className="relative w-full aspect-[1.586] transition-all duration-500 preserve-3d cursor-pointer"
                  animate={{ rotateY: isCardFlipped ? 180 : 0 }}
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
              >
                  {/* FRONT */}
                  <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between text-white shadow-2xl backface-hidden bg-gradient-to-br from-pink-600 via-purple-700 to-black">
                      <div className="flex justify-between items-start">
                          <ScanLine className="opacity-80" size={28} />
                          <span className="font-bold font-serif italic text-lg tracking-wide opacity-90">Bank of Charity</span>
                      </div>
                      <div className="flex items-center gap-4">
                          <div className="w-12 h-8 bg-yellow-400/20 rounded border border-yellow-400/40" />
                          <div className="text-2xl font-mono tracking-widest drop-shadow-md">
                              •••• •••• •••• 4242
                          </div>
                      </div>
                      <div className="flex justify-between items-end">
                          <div>
                              <div className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Cardholder</div>
                              <div className="font-medium text-lg tracking-wide">ELOISE SAWYER</div>
                          </div>
                          <div className="text-right">
                              <div className="text-[10px] opacity-70 uppercase tracking-widest mb-1">Expires</div>
                              <div className="font-mono text-sm">12/28</div>
                          </div>
                      </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 rounded-2xl bg-gray-800 flex flex-col shadow-2xl rotate-y-180 backface-hidden overflow-hidden">
                      <div className="w-full h-12 bg-black mt-6" />
                      <div className="p-6">
                          <div className="flex justify-between items-center mb-2">
                              <div className="text-[10px] text-gray-400">Authorized Signature</div>
                              <div className="text-[10px] text-gray-400">Security Code</div>
                          </div>
                          <div className="flex gap-4 items-center">
                              <div className="flex-1 h-10 bg-white/10 rounded flex items-center px-2 font-handwriting text-gray-400 italic">Eloise Sawyer</div>
                              <div className="w-16 h-10 bg-white text-black font-mono font-bold flex items-center justify-center rounded">
                                  882
                              </div>
                          </div>
                          <div className="mt-8 text-[8px] text-gray-500 text-center leading-tight">
                              This card is issued by Bank of Charity pursuant to license by Visa International. 
                              Use of this card is subject to the agreement. If found, please return to any branch.
                          </div>
                      </div>
                  </div>
              </motion.div>
          </div>

          <div className="mt-12 w-full bg-white rounded-t-[2rem] flex-1 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6">
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <h3 className="font-bold text-gray-900 mb-4">Card Settings</h3>
              <div className="space-y-2">
                  <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Lock className="text-gray-500" size={20} />
                          <span>Lock Card</span>
                      </div>
                      <div className="w-10 h-6 bg-gray-200 rounded-full p-1"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Globe className="text-gray-500" size={20} />
                          <span>International Use</span>
                      </div>
                      <div className="w-10 h-6 bg-green-500 rounded-full p-1 flex justify-end"><div className="w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between cursor-pointer active:bg-gray-50">
                      <div className="flex items-center gap-3">
                          <Key className="text-gray-500" size={20} />
                          <span>Reset PIN</span>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                  </div>
              </div>
          </div>
      </div>
  );

  const renderStatements = () => (
      <div className="flex-1 bg-white flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
              <button onClick={() => setViewState('DASHBOARD')}><ChevronLeft className="text-pink-600" /></button>
              <h1 className="text-xl font-bold">Statements</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {['December 2025', 'November 2025', 'October 2025', 'September 2025', 'August 2025'].map((date, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                          <FileText className="text-red-500" size={20} />
                          <span className="font-medium text-gray-900">{date}</span>
                      </div>
                      <ArrowUpRight size={16} className="text-gray-400" />
                  </div>
              ))}
          </div>
      </div>
  );

  const renderActivityView = () => (
      <div className="flex-1 flex flex-col bg-gray-50">
          {/* Scrollable Header with Chart */}
          <div className="bg-white p-6 pb-2 border-b border-gray-200 sticky top-0 z-10 shadow-sm overflow-hidden">
              <h1 className="text-2xl font-bold mb-4">Activity</h1>
              
              {/* Visual Chart Mock */}
              <div className="h-32 w-full flex items-end gap-2 mb-4 px-2">
                  {[40, 65, 30, 85, 50, 90, 60, 45, 70, 55, 80, 40].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end group">
                          <div 
                            className="w-full bg-pink-100 rounded-t-sm transition-all group-hover:bg-pink-200 relative"
                            style={{ height: `${h}%` }}
                          >
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  ${h * 10}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 font-bold uppercase pb-2">
                  <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-0 pb-32">
              <div className="bg-white">
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase">Incoming</div>
                  {allTransactions.filter(t => t.type === 'credit').map((t, i) => (
                      <div key={`in-${i}`} className="p-4 border-b border-gray-100 flex justify-between">
                          <span className="font-bold">{t.merchant}</span>
                          <span className="text-green-600 font-bold">{t.amount}</span>
                      </div>
                  ))}
                  
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase mt-4">Expenses</div>
                  {allTransactions.filter(t => t.type === 'debit').map((t, i) => (
                      <div key={`out-${i}`} className="p-4 border-b border-gray-100 flex justify-between hover:bg-gray-50">
                          <div>
                              <div className="font-bold text-sm">{t.merchant}</div>
                              <div className="text-xs text-gray-400">{t.category}</div>
                          </div>
                          <span className="text-black font-medium">{t.amount}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  // --- RECEIPT MODAL ---
  const renderReceipt = () => (
      <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelectedTransaction(null)}
      >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[85%] rounded-t-xl" 
            onClick={e => e.stopPropagation()}
          >
              {/* Receipt Header */}
              <div className="p-8 pb-4 flex flex-col items-center border-b border-dashed border-gray-300 shrink-0 bg-gray-50">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                      <Receipt className="text-pink-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 text-center leading-tight">{selectedTransaction?.merchant}</h2>
                  <p className="text-gray-500 text-sm font-mono">{selectedTransaction?.date}</p>
                  <h3 className="text-4xl font-black mt-6 mb-2 text-gray-900">
                      {selectedTransaction?.amount.replace('-','')}
                  </h3>
              </div>

              {/* Receipt Body */}
              <div className="p-8 space-y-4 bg-white flex-1 overflow-y-auto no-scrollbar">
                  <div className="space-y-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Itemization</div>
                      {loadingReceipt ? (
                          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-pink-500" /></div>
                      ) : receiptItems.length > 0 ? (
                          receiptItems.map((item, i) => (
                              <div key={i} className="flex justify-between items-start text-sm py-1">
                                  <div className="flex-1 pr-4">
                                      <span className="text-gray-800 font-medium block">{item.name}</span>
                                      <button onClick={(e) => handleAddToCart(e, item.name, item.price)} className="text-[10px] text-pink-600 font-bold flex items-center gap-1 mt-1 hover:underline">
                                          <ShoppingBag size={10} /> Add to Cart
                                      </button>
                                  </div>
                                  <span className="font-mono text-gray-600">{item.price}</span>
                              </div>
                          ))
                      ) : (
                          <div className="text-center text-gray-400 text-sm py-4">Receipt data unavailable.</div>
                      )}
                  </div>
              </div>

              {/* Jagged Bottom */}
              <div className="h-4 bg-white w-full shrink-0 relative z-10" style={{ clipPath: 'polygon(0% 0%, 5% 100%, 10% 0%, 15% 100%, 20% 0%, 25% 100%, 30% 0%, 35% 100%, 40% 0%, 45% 100%, 50% 0%, 55% 100%, 60% 0%, 65% 100%, 70% 0%, 75% 100%, 80% 0%, 85% 100%, 90% 0%, 95% 100%, 100% 0%)' }}></div>
              
              <div className="p-4 bg-gray-900">
                  <button onClick={() => setSelectedTransaction(null)} className="w-full py-3 bg-white text-black font-bold rounded-xl">Close Receipt</button>
              </div>
          </motion.div>
      </motion.div>
  );

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      className="absolute inset-0 bg-white z-50 flex flex-col font-sans text-gray-900"
    >
      <AnimatePresence>
          {selectedTransaction && renderReceipt()}
          {toastMsg && (
              <motion.div 
                  initial={{ opacity: 0, y: 50, x: '-50%' }} 
                  animate={{ opacity: 1, y: 0, x: '-50%' }} 
                  exit={{ opacity: 0, y: 50, x: '-50%' }}
                  className="absolute bottom-24 left-1/2 bg-black/90 backdrop-blur-md text-white px-6 py-4 rounded-3xl text-sm font-bold shadow-2xl z-[70] flex items-center gap-3 w-[90%] max-w-[340px]"
              >
                  <CheckCircle size={20} className="text-green-400 shrink-0" />
                  <span className="leading-tight flex-1">{toastMsg}</span>
              </motion.div>
          )}
      </AnimatePresence>

      {/* --- APP HEADER --- */}
      <div className="pt-12 px-6 pb-4 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex justify-between items-center z-20 sticky top-0">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                <Wallet size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">Bank of Charity</span>
         </div>
         <div className="flex gap-4 text-gray-400">
             <Search size={24} />
             <Bell size={24} />
             <Menu size={24} />
         </div>
      </div>

      {/* --- MAIN CONTENT SWITCHER --- */}
      <div className="flex-1 overflow-hidden relative bg-gray-50 flex flex-col">
          {bottomTab === 'CARDS' && renderCardView()}
          {bottomTab === 'BANKING' && (
              <>
                  {viewState === 'DASHBOARD' && renderDashboard()}
                  {viewState === 'ACCOUNT_DETAIL' && renderAccountDetail()}
                  {viewState === 'STATEMENTS' && renderStatements()}
              </>
          )}
          {bottomTab === 'LENDING' && (
              <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                  <div>
                      <Home size={48} className="mx-auto mb-4 opacity-20" />
                      <h3 className="text-xl font-bold text-gray-600">Lending Center</h3>
                      <p>View mortgage and personal loan offers.</p>
                  </div>
              </div>
          )}
          {bottomTab === 'INVESTING' && renderActivityView()} {/* Reusing Activity for Investing/History tab per request flow */}
      </div>

      {/* --- BOTTOM TAB NAVIGATION --- */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-white border-t border-gray-200 flex justify-around items-start pt-4 z-40 pb-8 px-2">
          {[
              { id: 'CARDS', l: 'Cards', i: CreditCard },
              { id: 'BANKING', l: 'Banking', i: Landmark },
              { id: 'LENDING', l: 'Lending', i: Home },
              { id: 'INVESTING', l: 'Investing', i: Activity } // Using Activity Icon for Investing/Activity view
          ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { 
                    setBottomTab(tab.id as any); 
                    // Reset internal states when switching main tabs
                    if(tab.id === 'BANKING') setViewState('DASHBOARD');
                }} 
                className={`flex flex-col items-center gap-1 w-16 transition-colors ${bottomTab === tab.id ? 'text-pink-600' : 'text-gray-400'}`}
              >
                  <tab.i size={24} fill={bottomTab === tab.id ? "currentColor" : "none"} />
                  <span className="text-[10px] font-bold">{tab.l}</span>
              </button>
          ))}
      </div>

      {/* Home Indicator Overlay */}
      <div 
          className="absolute bottom-0 left-0 right-0 h-10 z-[100] flex items-end justify-center pb-2 cursor-pointer"
          onClick={onClose}
      >
          <div className="w-32 h-1.5 bg-gray-300 rounded-full active:bg-gray-400 transition-colors" />
      </div>
    </motion.div>
  );
};
