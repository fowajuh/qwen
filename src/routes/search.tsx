import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { MagneticButton, NexaMark } from "@/components/app-shell";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Nexa" },
      { name: "description", content: "Describe what you need. Nexa understands, compares, and ranks the best local businesses for you." },
    ],
  }),
  component: SearchPage,
});

const SUGGESTIONS = [
  "Fix a leaking sink tonight",
  "Best sushi omakase under $120",
  "Emergency electrician in 15 min",
  "Pilates studio open at 6am",
  "Florist for same-day delivery",
  "Dog groomer this weekend",
  "Dentist for emergency today",
  "Coffee shop quiet with outlets",
];

const RESULTS = [
  { slug: "kori", name: "Kori Hair Studio", tag: "Salon", trust: 98, meta: "Available 2:30pm", dist: "0.3 mi", aiReason: "Responds in 4 min · 1,412 completed jobs · 72% repeat clients", tone: "warm", price: "$85+" },
  { slug: "north-fork", name: "North Fork Plumbing", tag: "Emergency", trust: 94, meta: "Responds in 6 min", dist: "0.7 mi", aiReason: "24/7 available · transparent pricing · 3,108 completed jobs", tone: "ember", price: "$95+" },
  { slug: "mira", name: "Mira Yoga", tag: "Wellness", trust: 92, meta: "4 spots left 6:30am", dist: "0.9 mi", aiReason: "Intimate class · 81% rebook rate · rooftop access", tone: "sand", price: "$22" },
  { slug: "atelier", name: "Atelier Fleur", tag: "Florist", trust: 95, meta: "Same-day delivery", dist: "1.3 mi", aiReason: "Same-day cut-off 2pm · Hudson Valley sourced · 1,893 orders", tone: "warm", price: "$45+" },
  { slug: "halden", name: "Halden Dental", tag: "Dental", trust: 96, meta: "In-network · today", dist: "1.1 mi", aiReason: "In-network insurance · same-day emergency · 23 years experience", tone: "cool", price: "$0 exam" },
];

const GRADIENTS: Record<string, string> = {
  warm: "from-[oklch(0.75_0.08_50)] to-[oklch(0.9_0.03_70)]",
  cool: "from-[oklch(0.72_0.07_225)] to-[oklch(0.9_0.02_230)]",
  ember: "from-[oklch(0.65_0.14_30)] to-[oklch(0.82_0.06_45)]",
  sand: "from-[oklch(0.82_0.04_80)] to-[oklch(0.94_0.01_80)]",
};

const THINKING_STEPS = ["Understanding your request...", "Analyzing 12 businesses nearby...", "Checking availability...", "Ranking by trust & response time...", "Ready."];

function SearchPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"text" | "voice" | "image">("text");
  const [focused, setFocused] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [thinkStep, setThinkStep] = useState(0);
  const [results, setResults] = useState<typeof RESULTS>([]);
  const [showMap, setShowMap] = useState(false);
  const [recentSearches, setRecentSearches] = useState(["Emergency plumber", "Yoga classes"]);
  const inputRef = useRef<HTMLInputElement>(null);

  // / shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setFocused(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const runSearch = (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setThinking(true);
    setResults([]);
    setThinkStep(0);
    setRecentSearches(prev => [q, ...prev.filter(item => item !== q)].slice(0, 5));

    const matched = RESULTS.filter(r => 
      r.name.toLowerCase().includes(q.toLowerCase()) || 
      r.tag.toLowerCase().includes(q.toLowerCase()) || 
      r.meta.toLowerCase().includes(q.toLowerCase())
    );

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setThinkStep(step);
      if (step >= THINKING_STEPS.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setThinking(false);
          setResults(matched.length > 0 ? matched : RESULTS.slice(0, 2));
          setShowMap(true);
        }, 400);
      }
    }, 500);
  };

  const hasContent = thinking || results.length > 0;

  return (
    <div className="pt-24 pb-44 min-h-screen">
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">
        {/* Headline (hides when searching) */}
        <AnimatePresence>
          {!hasContent && !focused && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="text-center mb-14 mt-8 md:mt-16"
            >
              <div className="font-display text-6xl md:text-9xl leading-none mb-4">
                What do you need?
              </div>
              <p className="text-muted-foreground text-lg">Type it. Speak it. Show it.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search bar */}
        <motion.div
          layout
          className={`${hasContent || focused ? "sticky top-20 z-30 mb-8" : "max-w-[700px] mx-auto mb-10"}`}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
        >
          <div className={`relative glass rounded-full shadow-drama overflow-hidden transition-all ${focused ? "shadow-glow" : ""}`}>
            {/* Mode tabs */}
            <div className="flex items-center px-5 pt-3 pb-0 gap-1 border-b border-hairline">
              {(["text", "voice", "image"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 h-7 text-xs rounded-full transition-all ${mode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {m === "text" ? "⌨ Type" : m === "voice" ? "🎙 Voice" : "📷 Image"}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="flex items-center gap-3 px-5 h-16">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-muted-foreground shrink-0">
                <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
              </svg>
              {mode === "text" && (
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
                  placeholder="Describe what you need..."
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  id="nexa-search-input"
                />
              )}
              {mode === "voice" && <VoiceMode onTranscript={(t) => { setQuery(t); runSearch(t); setMode("text"); }} />}
              {mode === "image" && <ImageMode />}
              {query && (
                <button
                  onClick={() => { setQuery(""); setResults([]); setThinking(false); setShowMap(false); }}
                  className="text-muted-foreground hover:text-foreground text-lg"
                >×</button>
              )}
              <button
                onClick={() => runSearch(query)}
                className="rounded-full bg-foreground text-background px-5 h-10 text-sm font-medium shrink-0 hover:opacity-90 transition-opacity"
              >
                Ask Nexa
              </button>
            </div>
          </div>

          {/* Keyboard hint */}
          {!focused && !hasContent && (
            <div className="mt-3 text-center text-xs text-muted-foreground font-mono">Press / to focus · Enter to search</div>
          )}
        </motion.div>

        {/* Suggestion pills and Recent */}
        <AnimatePresence>
          {!hasContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex flex-col items-center mb-16"
            >
              {recentSearches.length > 0 && (
                <div className="mb-6 w-full max-w-[600px]">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">Recent Searches</div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => runSearch(s)}
                        className="rounded-full bg-foreground/5 px-4 h-9 text-sm hover:bg-foreground/10 transition-colors flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="w-full max-w-[600px]">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-2">Suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => runSearch(s)}
                      className="rounded-full hairline bg-card px-4 h-9 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thinking state */}
        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center py-20 gap-8"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <NexaMark size={56} />
              </motion.div>
              <div className="text-center space-y-2">
                {THINKING_STEPS.slice(0, thinkStep + 1).map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: i === thinkStep ? 1 : 0.3, y: 0 }}
                    className={`text-sm font-mono ${i === thinkStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {i < thinkStep ? "✓" : "○"} {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-6"
            >
              {/* Result cards */}
              <div className="flex-1 space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-6"
                >
                  <span className="text-sm text-muted-foreground">{results.length} results for</span>
                  <span className="font-display text-lg">"{query}"</span>
                  <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">AI ranked</span>
                </motion.div>

                {results.map((r, i) => (
                  <motion.div
                    key={r.slug}
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    className="surface-card p-5 md:p-6 flex gap-4 group hover:shadow-lift transition-shadow"
                  >
                    {/* Color swatch */}
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl shrink-0 bg-gradient-to-br ${GRADIENTS[r.tone]} flex items-center justify-center`}>
                      <span className="font-display text-2xl text-white/80">{r.trust}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{r.tag}</span>
                            <span className="text-[10px] text-muted-foreground">·</span>
                            <span className="text-[10px] text-muted-foreground">{r.dist}</span>
                          </div>
                          <div className="font-display text-2xl">{r.name}</div>
                          <div className="text-sm text-muted-foreground mt-0.5">{r.meta}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display text-2xl">{r.price}</div>
                          <div className="text-xs text-muted-foreground">from</div>
                        </div>
                      </div>

                      {/* AI reason */}
                      <div className="mt-3 flex items-start gap-2 bg-primary/5 rounded-2xl px-3 py-2.5">
                        <span className="text-primary text-sm shrink-0">✦</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="text-primary font-medium">I chose this because: </span>
                          {r.aiReason}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <MagneticButton>
                          <Link
                            to="/business/$slug"
                            params={{ slug: r.slug }}
                            className="rounded-full bg-foreground text-background px-5 h-9 text-sm font-medium inline-flex items-center gap-1.5"
                          >
                            Book
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                          </Link>
                        </MagneticButton>
                        <Link to="/map" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                          On map →
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mini map panel (desktop) */}
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 60, opacity: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
                    className="hidden xl:block w-[340px] shrink-0"
                  >
                    <div className="sticky top-28 surface-card overflow-hidden" style={{ height: 480 }}>
                      {/* Mini map */}
                      <div className="relative w-full h-full" style={{
                        background: "oklch(0.12 0.006 60)",
                        backgroundImage: `
                          linear-gradient(oklch(0.22 0.005 60 / 0.9) 1px, transparent 1px),
                          linear-gradient(90deg, oklch(0.22 0.005 60 / 0.9) 1px, transparent 1px)
                        `,
                        backgroundSize: "60px 60px"
                      }}>
                        {/* Park */}
                        <div className="absolute rounded-2xl" style={{ left: "5%", top: "8%", width: "20%", height: "28%", background: "oklch(0.26 0.08 145 / 0.6)" }} />
                        {/* Roads */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="oklch(0.32 0.005 60)" strokeWidth="2.5" />
                          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="oklch(0.32 0.005 60)" strokeWidth="2.5" />
                          <line x1="0" y1="30%" x2="100%" y2="38%" stroke="oklch(0.27 0.004 60)" strokeWidth="1.5" />
                        </svg>
                        {/* User dot */}
                        <div className="absolute" style={{ left: "50%", top: "60%", transform: "translate(-50%, -50%)" }}>
                          <div className="w-3 h-3 rounded-full" style={{ background: "oklch(0.62 0.22 250)", border: "2px solid white" }} />
                        </div>
                        {/* Result pins */}
                        {[{ x: 52, y: 38 }, { x: 68, y: 44 }, { x: 45, y: 22 }, { x: 25, y: 70 }, { x: 76, y: 62 }].map((pos, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
                            className="absolute w-6 h-6 rounded-full bg-primary text-white grid place-items-center text-[9px] font-bold"
                            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)" }}
                          >
                            {i + 1}
                          </motion.div>
                        ))}
                        {/* Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-card to-transparent">
                          <Link to="/map" className="block w-full rounded-full bg-foreground text-background h-9 text-sm font-medium grid place-items-center hover:opacity-90 transition-opacity">
                            Open full map →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VoiceMode({ onTranscript }: { onTranscript: (t: string) => void }) {
  const bars = [0.3, 0.8, 0.5, 1, 0.6, 0.9, 0.4, 0.7, 0.5, 0.8];
  
  useEffect(() => {
    const t = setTimeout(() => {
      onTranscript("Emergency plumber in 15 min");
    }, 3000);
    return () => clearTimeout(t);
  }, [onTranscript]);

  return (
    <div className="flex-1 flex items-center gap-1 h-8">
      <span className="text-sm text-primary font-medium mr-2 animate-pulse">Listening...</span>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-primary"
          animate={{ scaleY: [h, Math.random() * 0.7 + 0.3, h] }}
          transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.06 }}
          style={{ height: 24, transformOrigin: "center" }}
        />
      ))}
    </div>
  );
}

function ImageMode() {
  return (
    <div className="flex-1 flex items-center gap-3">
      <div className="flex-1 border border-dashed border-hairline rounded-2xl h-8 flex items-center justify-center text-sm text-muted-foreground px-4">
        Drop image, screenshot, or URL...
      </div>
    </div>
  );
}
