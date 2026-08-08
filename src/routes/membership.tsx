import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal, MagneticButton } from "@/components/app-shell";
import { PremiumIllustration, EmotionalIllustrations } from "@/components/ui/premium-illustration";
import { Sparkles, Zap, Shield, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — Nexa" },
      { name: "description", content: "We don't sell visibility. We sell growth." },
    ],
  }),
  component: Membership,
});

const TIERS = [
  {
    name: "Core", price: "$0", cadence: "forever",
    blurb: "Everything a business needs to be discoverable, bookable, and payable.",
    features: ["Professional profile","Bookings","Payments","Basic analytics","Reviews & responses","Trust score"],
  },
  {
    name: "Growth", price: "$79", cadence: "per month", featured: true,
    blurb: "The AI employee that replaces five apps, plus the tools to compound growth.",
    features: ["Everything in Core","AI assistant (24/7)","Marketing automation","CRM & customer memory","Video portfolio","Advanced analytics","Performance insights"],
  },
  {
    name: "Enterprise", price: "$249", cadence: "per month",
    blurb: "Multi-location operators, agencies, and franchises.",
    features: ["Everything in Growth","Multiple locations","Staff management","API access","Advanced automations","Dedicated support","Custom branding","Priority integrations"],
  },
];

function Membership() {
  const [annual, setAnnual] = useState(true);
  return (
    <div className="pt-28 pb-40 relative overflow-hidden">
      {/* Premium background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-transparent dark:from-indigo-950/20 dark:via-purple-950/10 pointer-events-none" />
      
      <section className="mx-auto max-w-[1440px] px-6 md:px-10 relative">
        <Kicker>Membership</Kicker>
        <div className="mt-6 max-w-5xl">
          <KineticHeading text="We don't sell" className="text-6xl md:text-[9rem]" />
          <div className="text-6xl md:text-[9rem] font-display overflow-hidden">
            <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.5, duration: 1.1, ease: [0.19, 1, 0.22, 1] }} className="inline-block">
              visibility.
            </motion.span>
          </div>
          <div className="text-6xl md:text-[9rem] font-display text-muted-foreground overflow-hidden">
            <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.65, duration: 1.1, ease: [0.19, 1, 0.22, 1] }} className="inline-block">
              We sell growth.
            </motion.span>
          </div>
        </div>
        
        {/* Hero illustration - Billion dollar touch */}
        <Reveal delay={0.3}>
          <div className="mt-12 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <PremiumIllustration 
                name="business-growth" 
                size="xl" 
                animate={true}
                alt="Grow your business with Nexa"
                className="shadow-[0_30px_80px_rgba(99,102,241,0.25)]"
              />
            </motion.div>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mt-14 inline-flex items-center gap-2 rounded-full glass p-1.5">
            {["Monthly","Annual — save 20%"].map((l, i) => (
              <button key={l} onClick={() => setAnnual(i === 1)} className="relative px-5 h-10 text-sm rounded-full">
                {(annual === (i === 1)) && (
                  <motion.span layoutId="bill-pill" transition={{ type: "spring", stiffness: 400, damping: 34 }} className="absolute inset-0 rounded-full bg-foreground" />
                )}
                <span className={`relative ${annual === (i === 1) ? "text-background" : "text-muted-foreground"}`}>{l}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {TIERS.map((t, i) => {
            const illustrationMap: Record<string, keyof typeof EmotionalIllustrations.business> = {
              Core: "community",
              Growth: "growth",
              Enterprise: "analytics",
            };
            const illName = illustrationMap[t.name] || "community";
            
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: i * 0.1, ease: [0.19, 1, 0.22, 1] }}
                whileHover={{ y: -10 }}
                className={`relative rounded-[32px] p-8 md:p-10 flex flex-col overflow-hidden ${t.featured ? "bg-foreground text-background shadow-drama" : "surface-card"}`}
              >
                {/* Tier-specific mini illustration */}
                <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
                  <PremiumIllustration 
                    name={EmotionalIllustrations.business[illName]} 
                    size="sm" 
                    animate={false}
                  />
                </div>
                
                {t.featured && (
                  <motion.div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] uppercase tracking-[0.14em] px-3 h-6 inline-flex items-center gap-1"
                    animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </motion.div>
                )}
                <div className="font-display text-3xl">{t.name}</div>
                <div className="mt-6 flex items-baseline gap-2">
                  <div className="font-display text-6xl tabular-nums">{annual && t.price !== "$0" ? `$${Math.round(parseInt(t.price.slice(1)) * 0.8)}` : t.price}</div>
                  <div className={`text-sm ${t.featured ? "text-background/60" : "text-muted-foreground"}`}>{t.cadence}</div>
                </div>
                <p className={`mt-4 text-sm ${t.featured ? "text-background/70" : "text-muted-foreground"}`}>{t.blurb}</p>
                <ul className="mt-8 space-y-3 flex-1">
                  {t.features.map((f, idx) => {
                    const icons = [<Zap key={idx} className="w-4 h-4" />, <TrendingUp key={idx} className="w-4 h-4" />, <Shield key={idx} className="w-4 h-4" />];
                    return (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 shrink-0 ${t.featured ? "text-primary" : "text-primary"}`}>
                          {icons[idx % icons.length]}
                        </span>
                        {f}
                      </li>
                    );
                  })}
                </ul>
                <MagneticButton>
                  <button className={`mt-10 w-full rounded-full h-12 text-sm font-medium ${t.featured ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>
                    {t.name === "Core" ? "Start free" : "Choose " + t.name}
                  </button>
                </MagneticButton>
              </motion.div>
            );
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-16 text-center text-sm text-muted-foreground max-w-xl mx-auto">
            Ranking always prioritizes relevance and trust over payment level. Premium members receive richer tools and presentation — never inflated rankings.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
