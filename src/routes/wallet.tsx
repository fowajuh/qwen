import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Scissors, Coffee, Shield, Building2, Flower2, Wrench, Key, Dumbbell } from "lucide-react";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Nexa" },
      { name: "description", content: "All your Nexa bookings, receipts, warranties, and payment methods — in one beautiful wallet." },
    ],
  }),
  component: WalletPage,
});

type WalletCard = {
  id: string;
  type: "booking" | "receipt" | "warranty";
  business: string;
  detail: string;
  time: string;
  amount: string;
  gradient: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  cardLogo?: string;
};

const CARDS: WalletCard[] = [
  { id: "c1", type: "booking", business: "Kori Hair Studio", detail: "Signature cut & finish", time: "Today 2:30pm", amount: "$85.00", gradient: "from-zinc-800 via-zinc-900 to-black", Icon: Scissors, cardLogo: "Nexa Black" },
  { id: "c2", type: "receipt", business: "Ostro Coffee Bar", detail: "Pour-over flight", time: "Yesterday 9:15am", amount: "$18.50", gradient: "from-blue-600 via-indigo-700 to-purple-800", Icon: Coffee, cardLogo: "Nexa Pay" },
  { id: "c3", type: "warranty", business: "North Fork Plumbing", detail: "Leak repair · 30-day warranty", time: "Expires Aug 7", amount: "$145.00", gradient: "from-emerald-500 via-teal-600 to-cyan-700", Icon: Shield, cardLogo: "Nexa Protect" },
];

const TRANSACTIONS = [
  { date: "Today", items: [
     { business: "Kori Hair Studio", category: "Beauty", amount: "-$85.00", time: "2:30 PM", Icon: Scissors, status: "Confirmed" },
     { business: "Transfer to Bank", category: "Transfer", amount: "+$200.00", time: "10:00 AM", Icon: Building2, status: "Completed" }
  ]},
  { date: "Yesterday", items: [
     { business: "Ostro Coffee Bar", category: "Food & Drink", amount: "-$18.50", time: "9:15 AM", Icon: Coffee, status: "Completed" },
     { business: "Mira Yoga", category: "Health", amount: "-$22.00", time: "6:30 AM", Icon: Dumbbell, status: "Completed" }
  ]},
  { date: "August 12", items: [
     { business: "Atelier Fleur", category: "Shopping", amount: "-$45.00", time: "3:45 PM", Icon: Flower2, status: "Completed" },
     { business: "Swift Lock & Key", category: "Services", amount: "+$95.00", time: "11:20 AM", Icon: Key, status: "Refunded" }
  ]}
];

const TX_STYLE: Record<string, string> = {
  Confirmed: "text-blue-500 bg-blue-500/10",
  Completed: "text-green-500 bg-green-500/10",
  Refunded: "text-amber-500 bg-amber-500/10",
};

function WalletPage() {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  return (
    <div className="pt-28 pb-44 min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        
        {/* Premium Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
           <div>
             <Kicker>Finances</Kicker>
             <div className="mt-5">
               <KineticHeading text="Wallet" className="text-5xl md:text-7xl font-display tracking-tight" />
             </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right">
                 <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-1">Total Balance</div>
                 <div className="text-4xl md:text-5xl font-display">$1,245.00</div>
              </div>
              <button className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-xl">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
           </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Column: Cards & Loyalty */}
          <div className="lg:col-span-5 space-y-12">
            
            {/* 3D Interactive Card Stack */}
            <div>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold tracking-tight">Your Cards</h3>
                  <button className="text-blue-500 text-sm font-medium hover:text-blue-400">Add New</button>
               </div>
               
               <div className="relative" style={{ perspective: "1500px", height: 260 }}>
                 {CARDS.map((card, i) => {
                   const isActive = activeCard === card.id;
                   return (
                     <motion.div
                       key={card.id}
                       animate={{
                         y: isActive ? -20 : i * 25,
                         scale: isActive ? 1.05 : 1 - i * 0.05,
                         rotateX: isActive ? 0 : 5 + (i * 2),
                         zIndex: isActive ? 20 : CARDS.length - i,
                       }}
                       transition={{ type: "spring", stiffness: 300, damping: 30 }}
                       whileHover={{ y: isActive ? -20 : (i * 25 - 10), scale: isActive ? 1.05 : 1 - i * 0.05 + 0.02 }}
                       onClick={() => setActiveCard(isActive ? null : card.id)}
                       className="absolute w-full cursor-pointer will-change-transform drop-shadow-2xl"
                     >
                       <div className={`relative rounded-[2rem] p-6 h-[220px] overflow-hidden bg-gradient-to-br ${card.gradient} shadow-2xl ring-1 ring-white/10`}>
                         
                         {/* Abstract Glass Elements inside card */}
                         <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                         <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/20 rounded-full blur-3xl pointer-events-none"></div>
                         <div className="absolute inset-0 bg-noise opacity-20 mix-blend-overlay pointer-events-none"></div>

                         <div className="relative z-10 flex flex-col h-full justify-between text-white drop-shadow-md">
                           <div className="flex items-start justify-between">
                             <div>
                               <div className="font-display text-lg tracking-wide opacity-90 mb-1">{card.cardLogo}</div>
                               <div className="text-[10px] uppercase tracking-[0.2em] opacity-60">
                                 {card.type === "booking" ? "Active Booking" : card.type === "receipt" ? "Receipt" : "Warranty"}
                               </div>
                             </div>
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10">
                                 <card.Icon size={20} className="text-white" />
                              </div>
                           </div>
                           
                           <div>
                             <div className="font-mono text-sm tracking-widest opacity-80 mb-4">•••• •••• •••• 4242</div>
                             <div className="flex items-end justify-between">
                               <div>
                                 <div className="text-xs opacity-70 mb-0.5">Valid Thru</div>
                                 <div className="font-mono text-sm tracking-widest">12/28</div>
                               </div>
                               <div className="text-right">
                                  <div className="font-display text-2xl tracking-tight">{card.amount}</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   );
                 })}
               </div>

               {/* Expanded Action Panel for Active Card */}
               <AnimatePresence>
                 {activeCard && (
                   <motion.div
                     initial={{ opacity: 0, y: -20, height: 0 }}
                     animate={{ opacity: 1, y: 0, height: "auto" }}
                     exit={{ opacity: 0, y: -20, height: 0 }}
                     className="mt-6 overflow-hidden"
                   >
                      <div className="bg-foreground/5 border border-foreground/10 rounded-[2rem] p-6 backdrop-blur-xl">
                         {CARDS.filter(c => c.id === activeCard).map(card => (
                            <div key="detail" className="space-y-4">
                               <div className="flex justify-between items-center pb-4 border-b border-foreground/10">
                                  <div>
                                     <div className="font-semibold">{card.business}</div>
                                     <div className="text-sm text-muted-foreground">{card.detail}</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="font-semibold">{card.amount}</div>
                                     <div className="text-sm text-muted-foreground">{card.time}</div>
                                  </div>
                               </div>
                               <div className="flex gap-3">
                                  <button className="flex-1 bg-foreground text-background py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-foreground/20">Pay Now</button>
                                  <button className="flex-1 bg-background text-foreground border border-foreground/10 py-3 rounded-xl text-sm font-semibold hover:bg-foreground/5 transition-colors">View Receipt</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Premium Loyalty / Rewards Section */}
            <Reveal delay={0.2}>
               <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-[2rem] p-8 relative overflow-hidden group cursor-pointer">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 group-hover:opacity-30 transition-all duration-500">
                     <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </div>
                  
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
                           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <div>
                           <div className="font-display text-xl text-amber-500 dark:text-amber-400 tracking-tight">Nexa Rewards</div>
                           <div className="text-sm font-medium text-amber-600/80 dark:text-amber-300/80">Gold Tier</div>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm font-semibold">
                           <span>12,450 Points</span>
                           <span>$124.50 Value</span>
                        </div>
                        <div className="h-3 w-full bg-amber-500/20 rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                              initial={{ width: 0 }}
                              whileInView={{ width: '75%' }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                           />
                        </div>
                        <div className="text-xs text-amber-600/80 dark:text-amber-300/80 font-medium">2,550 pts to Platinum</div>
                     </div>
                  </div>
               </div>
            </Reveal>

          </div>

          {/* Right Column: Transaction History */}
          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-display tracking-tight">Recent Activity</h3>
                 <button className="text-sm font-semibold text-blue-500 flex items-center gap-1 bg-blue-500/10 px-4 py-2 rounded-full hover:bg-blue-500/20 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="10" y1="18" x2="14" y2="18"></line></svg>
                    Filter
                 </button>
              </div>

              <div className="space-y-10">
                 {TRANSACTIONS.map((group, groupIdx) => (
                    <div key={group.date}>
                       <div className="text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-4 sticky top-24 bg-background/90 backdrop-blur py-2 z-10 border-b border-foreground/5">
                          {group.date}
                       </div>
                       <div className="space-y-2">
                          {group.items.map((tx, txIdx) => (
                             <motion.div
                               key={tx.business + txIdx}
                               initial={{ opacity: 0, y: 10 }}
                               whileInView={{ opacity: 1, y: 0 }}
                               viewport={{ once: true }}
                               transition={{ delay: txIdx * 0.05 }}
                               className="group flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-foreground/5 cursor-pointer transition-all duration-300 hover:shadow-sm border border-transparent hover:border-foreground/5"
                             >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform group-hover:rotate-3">
                                       <tx.Icon size={20} className="text-foreground/70" />
                                    </div>
                                   <div>
                                      <div className="font-semibold text-base mb-0.5">{tx.business}</div>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                         <span>{tx.category}</span>
                                         <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
                                         <span>{tx.time}</span>
                                      </div>
                                   </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                   <div className={`font-display text-lg tracking-tight ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-foreground'}`}>
                                      {tx.amount}
                                   </div>
                                   <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${TX_STYLE[tx.status]}`}>
                                      {tx.status}
                                   </div>
                                </div>
                             </motion.div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
            </Reveal>
            
            <Reveal delay={0.4} className="mt-12 text-center">
               <button className="text-sm font-semibold text-foreground/70 hover:text-foreground transition-colors py-4 px-8 rounded-full border border-foreground/10 hover:bg-foreground/5">
                  View All Transactions
               </button>
            </Reveal>
          </div>

        </div>
      </div>
    </div>
  );
}
