import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Kicker, Reveal, KineticHeading } from "@/components/app-shell";
import { 
  MessageCircle, CalendarCheck, TrendingUp, Clock, 
  Settings2, Activity, PlaySquare, ArrowRight, Zap,
  CheckCircle2, XCircle, RefreshCw, Send, Sparkles
} from "lucide-react";

export const Route = createFileRoute("/ai/studio")({
  head: () => ({
    meta: [{ title: "AI Studio — Nexa" }],
  }),
  component: AIStudio,
});

const BOOKING_DATA = [
  { name: 'Mon', bookings: 4, manual: 1 },
  { name: 'Tue', bookings: 7, manual: 2 },
  { name: 'Wed', bookings: 5, manual: 1 },
  { name: 'Thu', bookings: 12, manual: 3 },
  { name: 'Fri', bookings: 18, manual: 2 },
  { name: 'Sat', bookings: 24, manual: 4 },
  { name: 'Sun', bookings: 15, manual: 1 },
];

const REVENUE_DATA = [
  { name: 'Haircuts', value: 1200 },
  { name: 'Coloring', value: 2400 },
  { name: 'Styling', value: 800 },
  { name: 'Products', value: 450 },
];

interface AIAction {
  id: string;
  type: 'reply' | 'book' | 'decline' | 'followup' | 'marketing' | 'pricing';
  action: string;
  customer?: string;
  time: string;
  amount?: string;
}

const MOCK_ACTIONS: AIAction[] = [
  { id: '1', type: 'book', action: 'Confirmed balayage appointment', customer: 'Emma S.', time: 'Just now', amount: '$220' },
  { id: '2', type: 'reply', action: 'Answered question about parking', customer: 'Michael T.', time: '2m ago' },
  { id: '3', type: 'marketing', action: 'Posted Instagram story for empty 2pm slot', time: '15m ago' },
  { id: '4', type: 'pricing', action: 'Increased Saturday morning prices by 10% due to high demand', time: '1h ago' },
  { id: '5', type: 'decline', action: 'Declined request - fully booked', customer: 'Sarah L.', time: '1h ago' },
  { id: '6', type: 'followup', action: 'Sent review request', customer: 'David W.', time: '2h ago' },
];

function AIStudio() {
  const [actions, setActions] = useState<AIAction[]>(MOCK_ACTIONS);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'settings'>('overview');
  const [toggles, setToggles] = useState({
    reply: true,
    booking: true,
    marketing: true,
    pricing: false,
    reputation: true,
    forecasting: false,
  });

  // Simulate incoming actions
  useEffect(() => {
    const interval = setInterval(() => {
      const newAction: AIAction = {
        id: Date.now().toString(),
        type: 'reply',
        action: 'Replied to inquiry about availability',
        customer: 'New Client',
        time: 'Just now'
      };
      setActions(prev => [newAction, ...prev].slice(0, 8)); // keep 8 max
      
      // Update times of others
      setActions(prev => prev.map((a, i) => i === 0 ? a : { ...a, time: i === 1 ? '1m ago' : a.time }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* ── HEADER ── */}
      <div className="bg-foreground text-background pt-24 pb-12 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center font-display text-xl">K</div>
              <div>
                <div className="font-semibold leading-tight">Kori Hair Studio</div>
                <div className="text-xs text-background/60 flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  AI is active & handling requests
                </div>
              </div>
            </div>
            <KineticHeading text="AI Studio" className="text-4xl md:text-6xl" />
          </div>
          
          <div className="flex gap-3">
             <button className="bg-background/10 hover:bg-background/20 text-background px-4 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-md">
               View Public Profile
             </button>
             <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-lg shadow-primary/20">
               Manual Override
             </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 mt-8 flex gap-6 border-b border-background/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'conversations', label: 'Conversations' },
            { id: 'settings', label: 'Configuration' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-medium relative transition-colors ${activeTab === tab.id ? 'text-background' : 'text-background/50 hover:text-background/80'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="studioTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-10">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* ── STATS ROW ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Messages Handled", value: "84", delta: "+12%", icon: <MessageCircle size={18} /> },
                  { label: "Bookings Confirmed", value: "24", delta: "+3", icon: <CalendarCheck size={18} /> },
                  { label: "Revenue Generated", value: "$4,120", delta: "+$450", icon: <TrendingUp size={18} /> },
                  { label: "Avg Response Time", value: "1m 42s", delta: "Top 5%", icon: <Clock size={18} /> },
                ].map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 0.1}>
                    <div className="surface-card p-5 h-full">
                      <div className="flex justify-between items-start mb-4 text-muted-foreground">
                        <div className="text-xs uppercase tracking-wider font-semibold">{stat.label}</div>
                        {stat.icon}
                      </div>
                      <div className="font-display text-4xl mb-2">{stat.value}</div>
                      <div className="text-xs text-primary font-medium">{stat.delta} vs last week</div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* ── LIVE FEED ── */}
                <div className="md:col-span-1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-display font-semibold">Live AI Activity</h3>
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-full font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                    </div>
                  </div>
                  <div className="surface-card p-2 overflow-hidden h-[400px] relative">
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
                    <AnimatePresence>
                      {actions.map((action, i) => (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, x: 50, height: 0 }}
                          animate={{ opacity: 1, x: 0, height: 'auto' }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className="p-3 border-b border-hairline last:border-0 flex gap-3 items-start bg-card"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            action.type === 'book' ? 'bg-green-500/10 text-green-600' :
                            action.type === 'decline' ? 'bg-red-500/10 text-red-600' :
                            action.type === 'marketing' ? 'bg-purple-500/10 text-purple-600' :
                            action.type === 'pricing' ? 'bg-amber-500/10 text-amber-600' :
                            'bg-blue-500/10 text-blue-600'
                          }`}>
                            {action.type === 'book' ? <CheckCircle2 size={14} /> :
                             action.type === 'decline' ? <XCircle size={14} /> :
                             action.type === 'marketing' ? <Sparkles size={14} /> :
                             action.type === 'pricing' ? <TrendingUp size={14} /> :
                             <MessageCircle size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium leading-tight">{action.action}</div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">{action.customer || 'System'}</span>
                              <div className="flex items-center gap-2 text-xs">
                                {action.amount && <span className="font-semibold text-foreground">{action.amount}</span>}
                                <span className="text-muted-foreground">{action.time}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* ── CHARTS ── */}
                <div className="md:col-span-2 space-y-6">
                  <div className="surface-card p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-display font-semibold">Booking Volume</h3>
                      <select className="bg-background border border-hairline rounded-md text-xs px-2 py-1 outline-none">
                        <option>Last 7 Days</option>
                        <option>This Month</option>
                      </select>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={BOOKING_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorManual" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-float)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                            itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                          />
                          <Area type="monotone" dataKey="bookings" name="AI Bookings" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAI)" />
                          <Area type="monotone" dataKey="manual" name="Manual Bookings" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorManual)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── QUICK COMMANDS ── */}
                  <div className="surface-card p-6">
                    <h3 className="text-lg font-display font-semibold mb-4">Quick Commands</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Draft this week's promotion",
                        "Show me peak hours",
                        "Summarize customer feedback",
                        "Suggest price adjustments"
                      ].map((cmd, i) => (
                        <button key={i} className="flex items-center justify-between text-left px-4 py-3 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-xl transition-colors group">
                          <span className="text-sm font-medium">{cmd}</span>
                          <Send size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="surface-card overflow-hidden">
                 <div className="p-6 border-b border-hairline">
                   <h2 className="text-xl font-display font-semibold">AI Capabilities</h2>
                   <p className="text-sm text-muted-foreground mt-1">Configure what your AI employee is allowed to do autonomously.</p>
                 </div>
                 
                 <div className="divide-y divide-hairline">
                    {[
                      { id: 'reply', label: 'Auto-reply to inquiries', desc: 'AI handles basic questions about hours, services, and location.', req: null },
                      { id: 'booking', label: 'Smart Booking', desc: 'AI can read your calendar, propose times, and confirm appointments.', req: null },
                      { id: 'marketing', label: 'Marketing Automation', desc: 'AI generates and schedules social media posts based on your availability.', req: null },
                      { id: 'pricing', label: 'Dynamic Pricing', desc: 'AI adjusts prices in real-time based on demand and historical data.', req: 'Growth plan' },
                      { id: 'reputation', label: 'Reputation Monitoring', desc: 'AI detects negative sentiment and drafts review responses.', req: null },
                      { id: 'forecasting', label: 'Demand Forecasting', desc: 'AI predicts busy periods and suggests staffing/inventory changes.', req: 'Growth plan' },
                    ].map(item => (
                      <div key={item.id} className="p-6 flex items-start justify-between gap-4 hover:bg-foreground/[0.02] transition-colors">
                        <div>
                           <div className="flex items-center gap-2">
                             <h4 className="font-semibold">{item.label}</h4>
                             {item.req && <span className="text-[10px] uppercase tracking-wider font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">{item.req} required</span>}
                           </div>
                           <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        
                        {/* Custom toggle switch */}
                        <button 
                          onClick={() => !item.req && setToggles(p => ({ ...p, [item.id]: !(p as any)[item.id] }))}
                          disabled={!!item.req}
                          className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${!!item.req ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${(toggles as any)[item.id] ? 'bg-primary' : 'bg-foreground/20'}`}
                        >
                          <motion.div 
                            className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm"
                            animate={{ x: (toggles as any)[item.id] ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end">
                <Link to="/membership">
                  <button className="bg-foreground text-background px-6 py-3 rounded-full text-sm font-medium hover:scale-105 transition-transform shadow-lg">
                    Upgrade to unlock all features
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'conversations' && (
            <motion.div 
              key="conversations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <div className="surface-card overflow-hidden">
                 <div className="p-6 border-b border-hairline flex justify-between items-center bg-foreground/[0.02]">
                   <div>
                     <h2 className="text-xl font-display font-semibold">AI Conversations</h2>
                     <p className="text-sm text-muted-foreground mt-1">Review chats handled by your AI employee.</p>
                   </div>
                   <div className="flex gap-2">
                     <select className="bg-background border border-hairline rounded-md text-sm px-3 py-1.5 outline-none font-medium">
                       <option>All Outcomes</option>
                       <option>Booked</option>
                       <option>Escalated</option>
                     </select>
                   </div>
                 </div>

                 <div className="divide-y divide-hairline">
                    {[
                      { cust: "Emma S.", text: "Can I get a balayage this weekend?", res: "Booked Sat 10:30am", val: "$220", tag: "success" },
                      { cust: "Michael T.", text: "Is there parking near the studio?", res: "Answered parking details", val: "-", tag: "info" },
                      { cust: "Sarah L.", text: "Do you have any openings right now?", res: "Declined (Fully booked)", val: "-", tag: "warning" },
                      { cust: "Jessica K.", text: "I need to fix a bad color job from another salon.", res: "Escalated to you", val: "Needs review", tag: "error" },
                    ].map((chat, i) => (
                      <div key={i} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-foreground/[0.02] transition-colors cursor-pointer group">
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-semibold text-sm">{chat.cust}</span>
                             <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                               chat.tag === 'success' ? 'bg-green-500/10 text-green-600' :
                               chat.tag === 'error' ? 'bg-red-500/10 text-red-600' :
                               chat.tag === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                               'bg-blue-500/10 text-blue-600'
                             }`}>{chat.res}</span>
                           </div>
                           <p className="text-sm text-muted-foreground truncate">"{chat.text}"</p>
                        </div>
                        <div className="flex items-center gap-6 sm:shrink-0">
                           <div className="text-right">
                             <div className="text-xs text-muted-foreground">Value</div>
                             <div className="font-medium text-sm">{chat.val}</div>
                           </div>
                           <button className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                             Review →
                           </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
