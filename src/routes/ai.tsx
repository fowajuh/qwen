import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { KineticHeading, Kicker, Reveal, MagneticButton, NexaMark } from "@/components/app-shell";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "For Business — Nexa AI" },
      { name: "description", content: "Every business gets an AI employee. Replies, marketing, pricing, forecasting — all in one." },
    ],
  }),
  component: AI,
});

const CAP_SVG = [
  <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 10h8M8 14h5"/></svg>,
  <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  <svg key="3" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  <svg key="4" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  <svg key="5" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
  <svg key="6" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
];

const CAPS = [
  { icon: 0, key: "Replies", desc: "Books, quotes, follow-ups. 24/7. On your tone of voice. Never misses a lead.", highlight: "4-min average response" },
  { icon: 1, key: "Marketing", desc: "Reels, ads, captions — generated, scheduled, measured. One click to publish.", highlight: "3× more engagement" },
  { icon: 2, key: "Pricing", desc: "Adjusted for demand in real time. Never leaves money on the table.", highlight: "+12% avg revenue" },
  { icon: 3, key: "Insights", desc: "Where you're growing. Where you're leaking. What to do next — with exact numbers.", highlight: "Weekly reports" },
  { icon: 4, key: "Reputation", desc: "Detects negative sentiment before reviews go live. Suggests responses instantly.", highlight: "4.9 avg maintained" },
  { icon: 5, key: "Forecasting", desc: "Predicts busy weeks. Staffs, orders, prepares in advance — automatically.", highlight: "2 weeks ahead" },
];

const TESTIMONIALS = [
  { quote: "I used to spend 3 hours a day replying to messages. Nexa handles all of it — and books better than I could.", name: "Jordan K.", business: "Kori Hair Studio", city: "Williamsburg", trust: 98 },
  { quote: "The pricing AI paid for itself in the first week. We raised prices 15% and bookings didn't drop at all.", name: "Elena M.", business: "Atelier Fleur", city: "DUMBO", trust: 95 },
  { quote: "My AI employee replied to 47 customers last night while I was asleep. Every single one was answered correctly.", name: "Kai S.", business: "Ostro Coffee Bar", city: "Carroll Gardens", trust: 93 },
];

const PRICING_TIERS = [
  { name: "Starter", price: "$0", period: "free forever", features: ["Nexa profile", "Up to 20 bookings/mo", "Basic trust score", "Manual replies"], cta: "Get started", highlight: false },
  { name: "Growth", price: "$49", period: "per month", features: ["Unlimited bookings", "AI replies & follow-ups", "Smart scheduling", "Revenue insights", "Marketing tools", "Priority support"], cta: "Start free trial", highlight: true },
  { name: "Enterprise", price: "Custom", period: "contact us", features: ["Everything in Growth", "Multi-location", "API access", "Dedicated success manager", "Custom integrations"], cta: "Talk to us", highlight: false },
];

function VoiceModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, setState] = useState<"idle" | "listening" | "thinking" | "responding">("idle");
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (isOpen) {
      setState("idle");
      setResponse("");
    }
  }, [isOpen]);

  const handleMicClick = () => {
    if (state === "idle") {
      setState("listening");
      setTimeout(() => setState("thinking"), 3000);
      setTimeout(() => {
        setState("responding");
        setResponse("I've checked the schedule for next week. You have 3 open slots on Tuesday and Thursday morning. I've drafted a social media post to promote these openings with a 10% discount. Would you like me to publish it?");
      }, 5500);
    } else if (state === "responding") {
       setState("idle");
       setResponse("");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
           {state === "listening" || state === "idle" ? (
             <motion.div 
               className="flex items-center justify-center gap-1.5 h-32"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
             >
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 rounded-full bg-white"
                    animate={{ 
                       height: state === "listening" ? ["10px", "60px", "20px", "80px", "10px"][i % 5] : "10px" 
                    }}
                    transition={{
                       repeat: Infinity,
                       repeatType: "mirror",
                       duration: state === "listening" ? 0.4 + (i * 0.1) : 1,
                       ease: "easeInOut"
                    }}
                  />
                ))}
             </motion.div>
           ) : state === "thinking" ? (
             <motion.div 
               className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-orange-400 blur-md"
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.7, 1, 0.7],
                 rotate: [0, 90, 180, 270, 360]
               }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             />
           ) : (
             <motion.div 
               className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-orange-400 blur-sm flex items-center justify-center"
               animate={{ scale: [1, 1.05, 1] }}
               transition={{ duration: 1.5, repeat: Infinity }}
             >
                <NexaMark size={48} className="text-white drop-shadow-md" />
             </motion.div>
           )}

           <div className="mt-12">
             <button 
               onClick={handleMicClick}
               className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                 state === "idle" ? "bg-white text-black hover:scale-105" : 
                 state === "listening" ? "bg-red-500 text-white animate-pulse" : 
                 state === "thinking" ? "bg-white/20 text-white cursor-wait" : 
                 "bg-white/10 text-white backdrop-blur-md"
               }`}
             >
                {state === "idle" || state === "listening" ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                ) : state === "thinking" ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>
                )}
             </button>
           </div>
           
           <div className="mt-6 text-white/70 font-medium text-lg">
             {state === "idle" && "Tap to speak"}
             {state === "listening" && "Listening..."}
             {state === "thinking" && "Thinking..."}
             {state === "responding" && "Tap to stop"}
           </div>
        </div>

        <AnimatePresence>
          {state === "responding" && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 h-1/2 bg-white rounded-t-[40px] p-8 md:p-12 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col"
            >
               <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8" />
               <h3 className="text-3xl font-display font-semibold text-black mb-6">AI Assistant</h3>
               <div className="flex-1 overflow-y-auto">
                 <p className="text-xl leading-relaxed text-black/80">{response}</p>
                 <div className="mt-8 flex gap-3">
                   <button className="flex-1 bg-black text-white rounded-full py-4 font-semibold text-lg hover:bg-black/80 transition-colors">Publish Post</button>
                   <button className="flex-1 bg-black/5 text-black rounded-full py-4 font-semibold text-lg hover:bg-black/10 transition-colors">Edit manually</button>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

function AI() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  return (
    <div className="pb-0 overflow-hidden">
      <VoiceModal isOpen={voiceModalOpen} onClose={() => setVoiceModalOpen(false)} />

      {/* Hero — dark ink section */}
      <div className="pt-28 pb-32 mesh-ink text-white grain-overlay relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 relative">
          <Kicker><span className="text-white/70">For business</span></Kicker>
          <div className="mt-6">
            <KineticHeading text="Your AI employee." className="text-5xl md:text-[8vw]" />
            <div className="text-5xl md:text-[8vw] font-display text-primary overflow-hidden">
              <motion.span
                initial={{ y: "110%" }} animate={{ y: 0 }}
                transition={{ delay: 0.55, duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
                className="inline-block"
              >
                Always on.
              </motion.span>
            </div>
          </div>

          <Reveal delay={0.5}>
            <p className="mt-10 max-w-xl text-lg text-white/70 leading-relaxed">
              Replaces the five apps you already pay for — then does the work you never had time for. Works while you sleep. Never calls in sick.
            </p>
          </Reveal>

          <Reveal delay={0.7} className="mt-10 flex flex-wrap gap-4">
            <MagneticButton>
              <Link to="/ai/studio" className="inline-flex items-center gap-2 rounded-full bg-white text-black px-7 h-14 font-medium text-sm hover:scale-105 transition-transform">
                Open AI Studio
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </MagneticButton>
            <MagneticButton>
              <button onClick={() => setVoiceModalOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-7 h-14 font-medium text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,100,0,0.3)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                Try Voice Mode
              </button>
            </MagneticButton>
          </Reveal>

          {/* Floating stat cards */}
          <div className="mt-24 grid md:grid-cols-4 gap-4">
            {[
              { label: "Avg response time", value: "2m 14s", delta: "↓ 38s" },
              { label: "Revenue uplift", value: "+18%", delta: "vs. manual" },
              { label: "Bookings/week", value: "47", delta: "↑ 12 new" },
              { label: "Repeat rate", value: "72%", delta: "+4pt this month" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
              >
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/50 mb-3">{s.label}</div>
                <div className="font-display text-4xl tabular-nums">{s.value}</div>
                <div className="text-xs text-primary mt-2">{s.delta}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CAPABILITIES ── */}
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-6">
           <div>
             <Kicker>Capabilities</Kicker>
             <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">What your AI employee does.</h2></Reveal>
           </div>
           <Reveal delay={0.2}>
             <Link to="/ai/campaigns" className="inline-flex items-center gap-2 text-primary font-medium text-lg link-underline">
               Explore Campaigns <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
             </Link>
           </Reveal>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {CAPS.map((cap, i) => (
            <motion.div
              key={cap.key}
              initial={{ opacity: 0, y: 40, rotateX: -10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.19, 1, 0.22, 1] }}
              whileHover={{ y: -8, transition: { type: "spring", stiffness: 260, damping: 22 } }}
              className="surface-card p-6 md:p-8 group"
              style={{ transformPerspective: 1200 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-foreground/[0.06] flex items-center justify-center text-foreground mb-5">
                {CAP_SVG[cap.icon]}
              </div>
              <div className="font-display text-3xl mb-3">{cap.key}</div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{cap.desc}</p>
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-3 h-7 text-xs font-medium">
                {cap.highlight}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── AI DEMO MOCKUP ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Live demo</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Your AI, in action.</h2></Reveal>

          <div className="grid md:grid-cols-12 gap-8">
            {/* Chat mockup */}
            <Reveal className="md:col-span-7">
              <div className="surface-card overflow-hidden">
                <div className="px-5 py-4 border-b border-hairline flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 text-xs text-muted-foreground font-mono">Nexa AI · Kori Hair Studio</div>
                </div>
                <div className="p-6 space-y-4 min-h-[360px]">
                  {[
                    { from: "client", msg: "Hi! Do you have anything available for a balayage this Saturday?" },
                    { from: "ai", msg: "Hi! Great timing — we have a 10:30am and 2pm slot open this Saturday for balayage. That's a 3-hour session with Jordan, priced at $220. Shall I hold one of those for you?" },
                    { from: "client", msg: "Yes! 10:30 please. What do I need to prepare?" },
                    { from: "ai", msg: "Perfect — Saturday 10:30am is confirmed. Come with dry, unwashed hair if possible (last wash 1–2 days before). No other prep needed! I'll send your Nexa booking confirmation with the QR code now. 🎉" },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.25 }}
                      className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"}`}
                    >
                      {m.from === "ai" && (
                        <div className="w-7 h-7 rounded-full bg-primary/10 grid place-items-center mr-2 shrink-0 mt-0.5">
                          <NexaMark size={14} />
                        </div>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.from === "ai"
                          ? "bg-foreground/[0.06] text-foreground rounded-tl-sm"
                          : "bg-primary text-primary-foreground rounded-tr-sm"
                      }`}>
                        {m.msg}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="flex items-center gap-2 ml-9"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: [-2, 2, -2] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">AI is typing...</span>
                  </motion.div>
                </div>
              </div>
            </Reveal>

            {/* Side panel */}
            <div className="md:col-span-5 space-y-4">
              <Reveal delay={0.1}>
                <div className="surface-card p-5">
                  <div className="flex justify-between items-center mb-4">
                     <div className="text-xs uppercase tracking-widest text-muted-foreground">AI handled today</div>
                     <Link to="/ai/insights" className="text-xs text-primary font-medium hover:underline">View Insights</Link>
                  </div>
                  {[
                    { action: "Replied to inquiry", time: "3 min ago", icon: "💬" },
                    { action: "Confirmed booking", time: "12 min ago", icon: "✅" },
                    { action: "Sent follow-up after visit", time: "2h ago", icon: "📩" },
                    { action: "Declined fully-booked request", time: "3h ago", icon: "❌" },
                    { action: "Posted Instagram caption", time: "5h ago", icon: "📸" },
                  ].map((a) => (
                    <div key={a.action} className="flex items-center gap-3 py-2.5 border-b border-hairline last:border-0">
                      <span className="text-base shrink-0">{a.icon}</span>
                      <span className="text-sm flex-1">{a.action}</span>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.2}>
                <div className="surface-card p-5 bg-primary/5 border-primary/20">
                  <div className="font-display text-2xl mb-2">47 bookings</div>
                  <div className="text-sm text-muted-foreground">handled this week without any manual intervention</div>
                  <div className="mt-3 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "78%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">78% fully automated · 22% escalated to you</div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-t border-hairline">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Business owners say</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Real results.</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                onClick={() => setActiveTestimonial(i)}
                className={`surface-card p-7 cursor-pointer transition-all ${activeTestimonial === i ? "border-primary/30 shadow-glow scale-[1.02]" : "hover:border-primary/20"}`}
              >
                <div className="font-display text-xl md:text-2xl leading-snug mb-6">"{t.quote}"</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 grid place-items-center text-primary font-display shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.business} · {t.city}</div>
                  </div>
                  <div className="ml-auto font-display text-2xl text-primary">{t.trust}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="border-t border-hairline bg-surface">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 py-24 md:py-32">
          <Kicker>Pricing</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Simple, honest pricing.</h2></Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 0.1}>
                <div className={`surface-card p-7 md:p-8 h-full flex flex-col ${tier.highlight ? "border-primary/30 shadow-glow" : ""}`}>
                  {tier.highlight && (
                    <div className="text-[10px] uppercase tracking-[0.18em] text-primary bg-primary/10 px-3 h-6 rounded-full inline-flex items-center self-start mb-4">
                      Most popular
                    </div>
                  )}
                  <div className="font-display text-2xl">{tier.name}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-display text-5xl">{tier.price}</span>
                    <span className="text-xs text-muted-foreground">{tier.period}</span>
                  </div>
                  <div className="my-6 h-px bg-hairline" />
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span className="text-primary shrink-0">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/membership"
                    className={`mt-8 rounded-full h-12 text-sm font-medium inline-flex items-center justify-center transition-opacity hover:opacity-90 ${
                      tier.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-foreground text-background"
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-foreground text-background">
         <Reveal className="mx-auto max-w-[1440px] px-6 md:px-10 py-32 md:py-48 text-center relative overflow-hidden">
           {/* Abstract glowing shapes in background */}
           <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
           <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
           
           <div className="relative z-10">
             <div className="font-display text-6xl md:text-9xl tracking-tight mb-8">Your business.<br /><span className="text-background/50">Amplified by AI.</span></div>
             <p className="text-xl md:text-2xl text-background/70 max-w-2xl mx-auto mb-12">Stop doing the busywork. Start doing the work that matters.</p>
             <div className="flex flex-wrap gap-4 justify-center">
               <MagneticButton>
                 <Link to="/ai/studio" className="inline-flex items-center gap-2 rounded-full bg-primary text-white px-9 h-16 text-lg font-medium hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,100,0,0.4)]">
                   Launch AI Studio
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                 </Link>
               </MagneticButton>
               <MagneticButton>
                 <Link to="/membership" className="inline-flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md px-9 h-16 text-lg font-medium hover:bg-white/20 transition-colors">
                   View Pricing
                 </Link>
               </MagneticButton>
             </div>
           </div>
         </Reveal>
      </section>
    </div>
  );
}
