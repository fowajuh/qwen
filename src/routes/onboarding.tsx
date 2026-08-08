import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { NexaMark } from "@/components/app-shell";
import { PremiumIllustration, EmotionalIllustrations, type IllustrationName } from "@/components/ui/premium-illustration";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import {
  ChevronRight, MapPin, Star, Zap, Users, Coffee, Scissors,
  ShoppingBag, Store, Dumbbell, Utensils, Heart, Home as HomeIcon,
  Gift, Music, Camera, Wrench, Car, Shield, Check, ArrowRight,
  Navigation, Sparkles, Play, Bell, X
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get Started — Nexa" },
      { name: "description", content: "Set up your Nexa account and discover the world around you." },
    ],
  }),
  component: Onboarding,
});

/* ─── STEPS ─── */
const TOTAL_STEPS = 5;

/* ─── ROLES ─── */
const ROLES = [
  {
    id: "consumer",
    title: "Discover & Book",
    subtitle: "Find and trust extraordinary local businesses.",
    icon: ShoppingBag,
    gradient: "from-[oklch(0.6_0.2_260)] to-[oklch(0.45_0.25_280)]",
    accent: "oklch(0.6_0.2_260)",
  },
  {
    id: "business",
    title: "Grow My Business",
    subtitle: "Reach thousands of customers with AI-powered tools.",
    icon: Store,
    gradient: "from-[oklch(0.65_0.22_35)] to-[oklch(0.5_0.2_20)]",
    accent: "oklch(0.65_0.22_35)",
  },
];

/* ─── INTERESTS ─── */
const INTERESTS = [
  { id: "hair", icon: Scissors, label: "Hair & Beauty", color: "from-rose-500/20 to-pink-500/20" },
  { id: "coffee", icon: Coffee, label: "Cafes & Coffee", color: "from-amber-500/20 to-orange-500/20" },
  { id: "fitness", icon: Dumbbell, label: "Fitness", color: "from-blue-500/20 to-cyan-500/20" },
  { id: "food", icon: Utensils, label: "Food & Dining", color: "from-orange-500/20 to-red-500/20" },
  { id: "wellness", icon: Heart, label: "Wellness & Spa", color: "from-purple-500/20 to-violet-500/20" },
  { id: "home", icon: HomeIcon, label: "Home Services", color: "from-teal-500/20 to-green-500/20" },
  { id: "gifts", icon: Gift, label: "Gifts & Shopping", color: "from-yellow-500/20 to-amber-500/20" },
  { id: "music", icon: Music, label: "Events & Live", color: "from-indigo-500/20 to-purple-500/20" },
  { id: "photo", icon: Camera, label: "Photography", color: "from-sky-500/20 to-blue-500/20" },
  { id: "repair", icon: Wrench, label: "Auto & Repair", color: "from-zinc-500/20 to-slate-500/20" },
  { id: "transport", icon: Car, label: "Transport", color: "from-emerald-500/20 to-teal-500/20" },
  { id: "trust", icon: Shield, label: "Trusted Services", color: "from-green-500/20 to-emerald-500/20" },
];

/* ─── NEIGHBORHOODS ─── */
const NEIGHBORHOODS = [
  "Williamsburg", "DUMBO", "Park Slope", "Bushwick",
  "Carroll Gardens", "Crown Heights", "Greenpoint", "Flatbush",
];

/* ─── FEATURES (step 1 showcase) ─── */
const FEATURES = [
  { icon: Star, label: "Verified businesses", color: "text-amber-400" },
  { icon: Zap, label: "Instant AI booking", color: "text-primary" },
  { icon: Users, label: "Trusted by 50K+ locals", color: "text-purple-400" },
  { icon: Shield, label: "Secure & encrypted", color: "text-green-400" },
];

/* ─── ANIMATED BACKGROUND ─── */
function AnimatedOrb({ x, y, size, color, duration }: { x: string; y: string; size: number; color: string; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, background: color, filter: "blur(80px)" }}
      animate={{ scale: [1, 1.15, 0.95, 1], opacity: [0.35, 0.55, 0.35], x: [0, 20, -15, 0], y: [0, -20, 10, 0] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ─── PROGRESS BAR ─── */
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1 rounded-full overflow-hidden bg-white/10"
          style={{ flex: i === step - 1 ? 2 : 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: i < step ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [notificationsGranted, setNotificationsGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [showIllustrationSheet, setShowIllustrationSheet] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState<IllustrationName>("welcome-hero");

  const next = () => { 
    setDirection(1); 
    if (step < TOTAL_STEPS) {
      // Show illustration transition for key steps
      if (step === 1 || step === 2 || step === 3) {
        const nextIllustration: Record<number, IllustrationName> = {
          1: "role-selection",
          2: "mobile",
          3: "interests",
        };
        setCurrentIllustration(nextIllustration[step]);
        setShowIllustrationSheet(true);
      } else {
        setStep((s) => Math.min(s + 1, TOTAL_STEPS));
      }
    }
  };
  
  const back = () => { 
    setDirection(-1); 
    setStep((s) => Math.max(s - 1, 1)); 
  };
  
  const toggleInterest = (id: string) =>
    setInterests((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id]);

  const canProceed = step === 2 ? !!role : step === 4 ? interests.length >= 1 : true;

  const handleSheetDismiss = () => {
    setShowIllustrationSheet(false);
    setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL_STEPS)), 300);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0 }),
  };

  const transition = { type: "spring", stiffness: 280, damping: 32 };

  return (
    <div className="fixed inset-0 bg-[oklch(0.08_0.02_260)] text-white overflow-hidden flex flex-col">
      {/* ── ANIMATED BACKGROUND ORBS ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatedOrb x="5%" y="10%" size={500} color="oklch(0.55 0.25 280 / 0.2)" duration={8} />
        <AnimatedOrb x="60%" y="60%" size={400} color="oklch(0.65 0.22 35 / 0.15)" duration={11} />
        <AnimatedOrb x="40%" y="-10%" size={300} color="oklch(0.6 0.2 200 / 0.12)" duration={9} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.55_0.2_280/0.08)_0%,transparent_60%)]" />
      </div>

      {/* ── ILLUSTRATION TRANSITION SHEET ── */}
      <AnimatePresence>
        {showIllustrationSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <Sheet open={true} onOpenChange={(open) => !open && handleSheetDismiss()}>
              <SheetContent 
                side="bottom" 
                variant="illustrated"
                illustration={currentIllustration}
                dragToExpand={true}
                className="h-[85vh] rounded-t-[2.5rem]"
              >
                <div className="relative h-full flex flex-col items-center justify-center px-8 pb-12">
                  {/* Large centered illustration */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
                  >
                    <PremiumIllustration 
                      name={currentIllustration} 
                      size="xl" 
                      animate={true}
                      className="shadow-[0_30px_80px_rgba(0,0,0,0.5)] w-72 h-72"
                    />
                  </motion.div>

                  {/* Dynamic content based on current illustration */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-center max-w-sm"
                  >
                    {currentIllustration === "role-selection" && (
                      <>
                        <h3 className="font-display text-3xl font-bold mb-3">Choose Your Path</h3>
                        <p className="text-white/60 text-base leading-relaxed">
                          Are you here to discover amazing local businesses or grow your own?
                        </p>
                      </>
                    )}
                    {currentIllustration === "mobile" && (
                      <>
                        <h3 className="font-display text-3xl font-bold mb-3">Your Neighborhood Awaits</h3>
                        <p className="text-white/60 text-base leading-relaxed">
                          Let's find the best spots within walking distance of you.
                        </p>
                      </>
                    )}
                    {currentIllustration === "interests" && (
                      <>
                        <h3 className="font-display text-3xl font-bold mb-3">What Moves You?</h3>
                        <p className="text-white/60 text-base leading-relaxed">
                          Select your passions and we'll curate experiences just for you.
                        </p>
                      </>
                    )}
                  </motion.div>

                  {/* Continue button */}
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSheetDismiss}
                    className="mt-10 h-14 bg-primary text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(var(--primary-rgb),0.35)] min-w-[200px]"
                  >
                    Continue
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </motion.button>

                  {/* Drag hint */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="absolute bottom-6 text-white/30 text-xs uppercase tracking-widest"
                  >
                    Drag to explore
                  </motion.p>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTENT ── */}
      <div className="relative z-10 flex flex-col flex-1 max-w-lg mx-auto w-full px-6 pt-16 pb-10">
        
        {/* TOP: Logo + Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <NexaMark size={28} />
              <span className="font-display text-xl font-semibold tracking-tight">Nexa</span>
            </div>
            {step > 1 && (
              <button onClick={back} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                Back
              </button>
            )}
          </div>
          <ProgressBar step={step} />
        </div>

        {/* STEP CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {/* ── STEP 1: WELCOME ── */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} className="flex flex-col flex-1">
                
                {/* Premium illustration hero */}
                <div className="relative mb-8 flex justify-center">
                  <PremiumIllustration 
                    name="welcome-hero" 
                    size="xl" 
                    animate={true}
                    alt="Welcome to Nexa - Your local world unlocked"
                    className="shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                  />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h1 className="font-display text-5xl font-bold tracking-tight leading-[1.05] mb-4">
                    Your local world,<br />
                    <span className="text-primary">unlocked.</span>
                  </h1>
                  <p className="text-white/60 text-lg leading-relaxed mb-10">
                    Discover, book, and trust the best local businesses — powered by AI that knows your neighborhood.
                  </p>
                </motion.div>

                <div className="space-y-3 mt-auto">
                  {FEATURES.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="flex items-center gap-4 bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl px-5 py-4"
                    >
                      <div className={`${f.color} shrink-0`}>
                        <f.icon size={20} />
                      </div>
                      <span className="text-base font-medium">{f.label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: ROLE ── */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} className="flex flex-col flex-1">
                {/* Premium illustration header */}
                <div className="relative mb-6 flex justify-center">
                  <PremiumIllustration 
                    name="role-selection" 
                    size="lg" 
                    animate={true}
                    alt="Choose your path on Nexa"
                    className="shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                  />
                </div>
                
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">Step 2 of {TOTAL_STEPS}</span>
                  <h2 className="font-display text-4xl font-bold tracking-tight mt-2 leading-tight">What brings<br />you here?</h2>
                  <p className="text-white/50 mt-2">We'll personalize everything for you.</p>
                </div>
                <div className="space-y-4 flex-1">
                  {ROLES.map((r) => (
                    <motion.button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full text-left p-6 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden ${
                        role === r.id
                          ? "border-primary bg-primary/10 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]"
                          : "border-white/10 bg-white/5 hover:border-white/25"
                      }`}
                    >
                      {role === r.id && (
                        <motion.div layoutId="role-glow" className={`absolute inset-0 bg-gradient-to-br ${r.gradient} opacity-15`} />
                      )}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${r.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                          <r.icon size={24} className="text-white" />
                        </div>
                        <div className="font-display text-xl font-bold mb-1">{r.title}</div>
                        <div className="text-white/60 text-sm leading-relaxed">{r.subtitle}</div>
                        {role === r.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: LOCATION ── */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} className="flex flex-col flex-1">
                {/* Premium illustration header */}
                <div className="relative mb-6 flex justify-center">
                  <PremiumIllustration 
                    name="location" 
                    size="lg" 
                    animate={true}
                    alt="Discover your neighborhood"
                    className="shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                  />
                </div>

                <div className="mb-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">Step 3 of {TOTAL_STEPS}</span>
                  <h2 className="font-display text-4xl font-bold tracking-tight mt-2 leading-tight">Where are<br />you based?</h2>
                  <p className="text-white/50 mt-2">Discover businesses within walking distance.</p>
                </div>

                {/* Location detect button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setLocationGranted(true);
                    setLocation("Williamsburg, Brooklyn");
                  }}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 mb-5 transition-all ${
                    locationGranted
                      ? "border-green-500/50 bg-green-500/10"
                      : "border-white/15 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${locationGranted ? "bg-green-500/20" : "bg-blue-500/20"}`}>
                    {locationGranted ? <Check size={22} className="text-green-400" /> : <Navigation size={22} className="text-blue-400" />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base">
                      {locationGranted ? "Location detected" : "Use my location"}
                    </div>
                    <div className="text-white/50 text-sm">
                      {locationGranted ? location : "Tap to allow precise location"}
                    </div>
                  </div>
                </motion.button>

                {/* Manual input */}
                <div className="relative mb-5">
                  <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Or type your neighborhood..."
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-primary text-white placeholder:text-white/30 transition-all text-base"
                  />
                </div>

                {/* Quick pick chips */}
                <div className="flex flex-wrap gap-2">
                  {NEIGHBORHOODS.map((area) => (
                    <button
                      key={area}
                      onClick={() => setLocation(area + ", Brooklyn")}
                      className={`text-sm font-medium px-4 py-2 rounded-full border transition-all ${
                        location.includes(area)
                          ? "bg-primary border-primary text-white"
                          : "border-white/15 bg-white/5 hover:bg-white/10 text-white/70"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: INTERESTS ── */}
            {step === 4 && (
              <motion.div key="s4" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} className="flex flex-col flex-1">
                {/* Premium illustration header */}
                <div className="relative mb-5 flex justify-center">
                  <PremiumIllustration 
                    name="interests" 
                    size="md" 
                    animate={true}
                    alt="Choose what you love"
                    className="shadow-[0_16px_40px_rgba(0,0,0,0.3)]"
                  />
                </div>

                <div className="mb-6">
                  <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">Step 4 of {TOTAL_STEPS}</span>
                  <h2 className="font-display text-4xl font-bold tracking-tight mt-2 leading-tight">What do<br />you love?</h2>
                  <p className="text-white/50 mt-2">Pick {interests.length}/3+ to personalize your feed.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 flex-1 content-start overflow-y-auto no-scrollbar pb-4">
                  {INTERESTS.map((int, idx) => {
                    const selected = interests.includes(int.id);
                    return (
                      <motion.button
                        key={int.id}
                        onClick={() => toggleInterest(int.id)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        whileTap={{ scale: 0.92 }}
                        className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-3xl border-2 transition-all ${
                          selected
                            ? "border-primary bg-primary/15 shadow-[0_0_20px_rgba(var(--primary-rgb),0.25)]"
                            : "border-white/10 bg-white/5 hover:border-white/25"
                        }`}
                      >
                        <div className={`${selected ? "text-primary" : "text-white/60"} transition-colors`}>
                          <int.icon size={22} />
                        </div>
                        <span className={`text-[11px] font-semibold leading-tight text-center px-1 ${selected ? "text-white" : "text-white/50"}`}>
                          {int.label}
                        </span>
                        {selected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check size={9} className="text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: NOTIFICATIONS ── */}
            {step === 5 && (
              <motion.div key="s5" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={transition} className="flex flex-col flex-1 items-center justify-center text-center">
                
                {/* Premium success illustration */}
                <div className="relative mb-8">
                  <PremiumIllustration 
                    name="success" 
                    size="xl" 
                    animate={true}
                    alt="You're all set!"
                    className="shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
                  />
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="font-display text-5xl font-bold tracking-tight mb-3">You're in.</h2>
                  <p className="text-white/60 text-lg max-w-xs mx-auto leading-relaxed mb-10">
                    Your personalized local world is ready.{location && ` Discovering ${location}.`}
                  </p>
                </motion.div>

                {/* Summary chips */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-2 justify-center mb-10">
                  {location && (
                    <div className="flex items-center gap-1.5 text-xs bg-white/8 border border-white/10 rounded-full px-4 py-2">
                      <MapPin size={12} className="text-primary" />
                      <span>{location}</span>
                    </div>
                  )}
                  {interests.slice(0, 4).map((id) => {
                    const int = INTERESTS.find((i) => i.id === id);
                    return int ? (
                      <div key={id} className="flex items-center gap-1.5 text-xs bg-white/8 border border-white/10 rounded-full px-4 py-2">
                        <int.icon size={12} className="text-primary" />
                        <span>{int.label}</span>
                      </div>
                    ) : null;
                  })}
                </motion.div>

                {/* Notifications CTA */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => setNotificationsGranted(true)}
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 mb-6 transition-all ${
                    notificationsGranted
                      ? "border-green-500/40 bg-green-500/8"
                      : "border-white/15 bg-white/5 hover:border-primary/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notificationsGranted ? "bg-green-500/20" : "bg-primary/15"}`}>
                    {notificationsGranted ? <Check size={22} className="text-green-400" /> : <Bell size={22} className="text-primary" />}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-base">
                      {notificationsGranted ? "Notifications on" : "Stay in the loop"}
                    </div>
                    <div className="text-white/50 text-sm">
                      {notificationsGranted ? "You'll never miss a deal" : "Exclusive deals, booking alerts, AI insights"}
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── BOTTOM CTA ── */}
        <div className="mt-8">
          {step < TOTAL_STEPS ? (
            <motion.button
              onClick={next}
              disabled={!canProceed}
              whileTap={{ scale: 0.97 }}
              className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(var(--primary-rgb),0.35)] disabled:opacity-40 disabled:shadow-none transition-all"
            >
              Continue
              <ChevronRight size={18} strokeWidth={2.5} />
            </motion.button>
          ) : (
            <div className="space-y-3">
              <Link to="/">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(var(--primary-rgb),0.35)]"
                >
                  Explore Nexa
                  <ArrowRight size={18} />
                </motion.button>
              </Link>
              {role === "business" && (
                <Link to="/dashboard">
                  <button className="w-full h-12 border border-white/20 bg-white/5 text-white rounded-2xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
                    <Store size={16} />
                    Set up my business
                  </button>
                </Link>
              )}
            </div>
          )}

          {step === 1 && (
            <p className="text-center text-white/30 text-xs mt-5">
              By continuing, you agree to Nexa's{" "}
              <span className="underline cursor-pointer hover:text-white/60 transition-colors">Terms</span>{" "}
              and{" "}
              <span className="underline cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
