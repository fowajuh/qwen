import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Globe } from "@/components/manifest/Globe";
import { useUI, type TravelStyle } from "@/lib/store";
import { auth } from "@/lib/auth";
import { useGamification, XP_REWARDS } from "@/lib/gamification-store";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome aboard · GlobeTrotter" },
      { name: "description", content: "Four questions and your first manifest is ready to write." },
      { property: "og:title", content: "Welcome aboard · GlobeTrotter" },
      {
        property: "og:description",
        content: "Tell us how you travel and we'll draft the manifest.",
      },
    ],
  }),
  component: Onboarding,
});

const REGIONS = [
  { label: "Japan", lat: 35, lng: 135.8 },
  { label: "Peru", lat: -13.2, lng: -72.5 },
  { label: "Iceland", lat: 64.1, lng: -21.8 },
  { label: "Morocco", lat: 31.6, lng: -8 },
  { label: "Portugal", lat: 38.7, lng: -9.1 },
  { label: "Vietnam", lat: 21, lng: 105.8 },
];

const STEPS = [
  {
    kicker: "Segment 01",
    title: "Where do you dream of going?",
    hint: "Tap a region — the globe will tilt to it.",
  },
  {
    kicker: "Segment 02",
    title: "How do you travel?",
    hint: "Manifest lines get written differently for each.",
  },
  {
    kicker: "Segment 03",
    title: "Budget style",
    hint: "Sets the default fare class on your stubs.",
  },
  {
    kicker: "Segment 04",
    title: "Departure alerts",
    hint: "Boarding reminders, price drops, collaborator notes.",
  },
  {
    kicker: "Segment 05",
    title: "Choose your plan",
    hint: "Start free, or pick a higher fare class for AI and live budgets.",
  },
];

const OPTIONS: string[][] = [
  REGIONS.map((r) => r.label),
  ["Solo", "Partner", "Family", "Friends"],
  ["Shoestring", "Comfort", "Luxury"],
  ["Enable alerts", "Not right now"],
  ["Explorer (Free)", "Voyager ($9/mo)", "Crew ($19/mo)"],
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<(string | null)[]>([null, null, null, null, null]);
  const [tilt, setTilt] = useState<{ lat: number; lng: number } | null>(null);
  const navigate = useNavigate();
  const setOnboarded = useUI((s) => s.setOnboarded);
  const setPreferences = useUI((s) => s.setPreferences);
  const setPlan = useUI((s) => s.setPlan);
  const addXP = useGamification((state) => state.addXP);
  
  // Track which gamification rewards have been given
  const [rewardedSteps, setRewardedSteps] = useState<boolean[]>([false, false, false, false, false]);

  const finish = () => {
    setOnboarded(true);
    const style = picked[2];
    if (style === "Shoestring" || style === "Comfort" || style === "Luxury") {
      setPreferences({ travelStyle: style });
    }
    if (picked[3]) {
      setPreferences({ pushNotifications: picked[3] === "Enable alerts" });
    }
    
    const planChoice = picked[4];
    if (planChoice) {
      const planMap: Record<string, "explorer" | "voyager" | "crew"> = {
        "Explorer (Free)": "explorer",
        "Voyager ($9/mo)": "voyager",
        "Crew ($19/mo)": "crew",
      };
      setPlan(planMap[planChoice] || "explorer");
    }

    toast.success("Manifest drafted", {
      description: "Your preferences are saved — tweak them anytime from Profile.",
    });
    navigate({ to: auth.isAuthenticated() ? "/" : "/login" });
  };

  const choose = (value: string) => {
    setPicked((p) => p.map((v, i) => (i === step ? value : v)));
    
    // Award XP for completing each onboarding step (once per step)
    if (!rewardedSteps[step]) {
      const newRewarded = [...rewardedSteps];
      newRewarded[step] = true;
      setRewardedSteps(newRewarded);
      
      // XP rewards for onboarding steps
      if (step === 0) {
        addXP(25, "Onboarding: Choose destination");
        toast.success("+25 XP", { description: "Dream destination selected!" });
      } else if (step === 1) {
        addXP(15, "Onboarding: Travel style");
        toast.success("+15 XP", { description: "Travel style identified!" });
      } else if (step === 2) {
        addXP(10, "Onboarding: Budget preference");
      } else if (step === 3) {
        addXP(10, "Onboarding: Notification setup");
      } else if (step === 4) {
        addXP(40, "Onboarding: Plan selection");
        toast.success("+40 XP", { description: "Welcome aboard, Explorer!" });
      }
    }
    
    if (step === 0) {
      const r = REGIONS.find((x) => x.label === value);
      if (r) setTilt({ lat: r.lat, lng: r.lng });
    }
  };

  const advance = () => (step < 4 ? setStep((s) => s + 1) : finish());

  return (
    <div className="relative min-h-screen bg-departure-navy text-cloud-white overflow-hidden">
      <Globe tiltTo={tilt} className="absolute inset-0 h-full w-full opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-departure-navy/70 via-departure-navy/40 to-departure-navy" />

      <div className="relative flex min-h-screen flex-col max-w-xl mx-auto px-6 pt-8 pb-10">
        {/* Perforation progress strip — one stub tears off per step */}
          <div
          className="flex gap-2"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={5}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.kicker}
              animate={{
                opacity: i < step ? 0.25 : 1,
                rotate: i < step ? -6 : 0,
                y: i < step ? 6 : 0,
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`flex-1 h-8 rounded-sm border flex items-center justify-center num text-[9px] uppercase tracking-[0.2em] ${
                i === step
                  ? "border-beacon-amber text-beacon-amber"
                  : "border-cloud-white/30 text-cloud-white/50"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </motion.div>
          ))}
        </div>

          <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80 && step < 4) setStep((s) => s + 1);
            if (info.offset.x > 80 && step > 0) setStep((s) => s - 1);
          }}
          className="flex-1 flex flex-col justify-center cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="num text-[11px] uppercase tracking-[0.24em] text-beacon-amber">
                {STEPS[step].kicker}
              </p>
              <h1 className="font-display text-4xl md:text-5xl leading-[0.95] mt-2">
                {STEPS[step].title}
              </h1>
              <p className="text-sm text-cloud-white/70 mt-2">{STEPS[step].hint}</p>

              <div className="flex flex-wrap gap-2 mt-7">
                {OPTIONS[step].map((opt) => {
                  const active = picked[step] === opt;
                  return (
                    <motion.button
                      key={opt}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => choose(opt)}
                      className={`num text-[11px] uppercase tracking-[0.18em] px-4 py-2.5 rounded-sm border transition-colors ${
                        active
                          ? "bg-beacon-amber text-departure-navy border-beacon-amber"
                          : "border-cloud-white/30 text-cloud-white/80 hover:border-cloud-white/70"
                      }`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="flex items-center justify-between">
          <button
            onClick={finish}
            className="text-xs text-cloud-white/45 hover:text-cloud-white/80 transition-colors"
          >
            Skip
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={advance}
            disabled={!picked[step]}
            className="inline-flex items-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-5 py-3 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 4 ? "Board now" : "Next segment"}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
