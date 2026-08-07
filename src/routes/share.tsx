import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { KineticHeading, Kicker, MagneticButton, NexaMark } from "@/components/app-shell";

export const Route = createFileRoute("/share")({
  head: () => ({
    meta: [
      { title: "Share to Nexa" },
      { name: "description", content: "Share any business link, screenshot, or post. Nexa extracts everything instantly." },
    ],
  }),
  component: SharePage,
});

const EXTRACTED = {
  name: "Kori Hair Studio",
  tag: "Salon",
  city: "Williamsburg, Brooklyn",
  trust: 98,
  response: "4 min",
  jobs: 1412,
  services: ["Signature cut & finish — $85", "Full color session — $180", "Balayage refresh — $220"],
  hours: "Mon–Sat 9am–7pm",
  phone: "+1 718 ••• ••42",
  social: "@korihair",
  slug: "kori",
};

const NEARBY = [
  { slug: "fold", name: "Fold & Steam", tag: "Laundry", trust: 90, dist: "0.2 mi" },
  { slug: "ostro", name: "Ostro Coffee", tag: "Cafe", trust: 93, dist: "0.5 mi" },
  { slug: "mira", name: "Mira Yoga", tag: "Wellness", trust: 92, dist: "0.9 mi" },
];

const EXTRACT_STEPS = [
  "Reading content...",
  "Identifying business...",
  "Verifying location...",
  "Fetching trust data...",
  "Finding alternatives...",
  "Building profile...",
];

function SharePage() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [url, setUrl] = useState("");
  const [extractStep, setExtractStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const startExtraction = () => {
    setStep(1);
    setExtractStep(0);
    setProgress(0);

    let s = 0;
    let p = 0;
    const stepInterval = setInterval(() => {
      s++;
      setExtractStep(s);
      if (s >= EXTRACT_STEPS.length - 1) clearInterval(stepInterval);
    }, 380);

    const progressInterval = setInterval(() => {
      p += 2.5;
      setProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => setStep(2), 300);
      }
    }, 60);
  };

  return (
    <div className="pt-28 pb-44 min-h-screen">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        {/* Header */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div exit={{ opacity: 0, y: -20, filter: "blur(8px)" }} transition={{ duration: 0.4 }}>
              <Kicker>Signature feature</Kicker>
              <div className="mt-5">
                <KineticHeading text="Share anything." className="text-5xl md:text-8xl" />
                <div className="text-5xl md:text-8xl font-display text-muted-foreground overflow-hidden">
                  <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.4, duration: 1, ease: [0.19, 1, 0.22, 1] }} className="inline-block">
                    Nexa reads it.
                  </motion.span>
                </div>
              </div>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                className="mt-8 text-lg text-muted-foreground max-w-xl">
                Paste a URL, share from Instagram, drop a screenshot. Nexa extracts the full business profile, verifies it, and finds you alternatives — in seconds.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 0: Import area */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-16 max-w-2xl"
            >
              {/* Paste area */}
              <div className="surface-card p-8 md:p-10">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Import from anywhere</div>

                <div className="border-2 border-dashed border-hairline rounded-2xl p-8 text-center mb-6 hover:border-primary/40 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-2xl bg-foreground/5 grid place-items-center mx-auto mb-4 group-hover:bg-primary/10 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  </div>
                  <div className="text-sm text-muted-foreground">Drop a screenshot, link, or file here</div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-hairline" />
                  <span className="text-xs text-muted-foreground">or paste a link</span>
                  <div className="h-px flex-1 bg-hairline" />
                </div>

                <div className="flex gap-3">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && url.trim() && startExtraction()}
                    placeholder="instagram.com/korihair · yelp.com/biz/... · google.com/maps..."
                    className="flex-1 bg-foreground/5 rounded-full px-5 h-12 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 ring-primary/40"
                    id="share-url-input"
                  />
                  <button
                    onClick={() => startExtraction()}
                    className="rounded-full bg-foreground text-background px-6 h-12 text-sm font-medium shrink-0 hover:opacity-90 transition-opacity"
                  >
                    Extract →
                  </button>
                </div>

                {/* Quick source buttons */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {["📸 Instagram", "🔗 URL", "🗺 Google Maps", "⭐ Yelp", "📋 Clipboard"].map((s) => (
                    <button
                      key={s}
                      onClick={() => startExtraction()}
                      className="rounded-full hairline px-3 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Demo CTA */}
                <div className="mt-8 pt-6 border-t border-hairline flex items-center gap-4">
                  <button onClick={() => startExtraction()} className="link-underline text-sm text-primary">
                    Try a demo extraction →
                  </button>
                  <span className="text-xs text-muted-foreground">Uses @korihair as the example</span>
                </div>
              </div>

              {/* Recent extractions */}
              <div className="mt-8">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Recent</div>
                <div className="space-y-3">
                  {[
                    { name: "Ostro Coffee Bar", source: "instagram.com/ostrocoffee", time: "2h ago" },
                    { name: "Atelier Fleur", source: "google.com/maps", time: "Yesterday" },
                  ].map((r) => (
                    <div key={r.name} className="surface-card px-5 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary text-lg shrink-0">⊙</div>
                      <div className="flex-1">
                        <div className="font-display text-base">{r.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{r.source} · {r.time}</div>
                      </div>
                      <Link to="/business/$slug" params={{ slug: "ostro" }} className="text-xs text-primary">View →</Link>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Extracting animation */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <NexaMark size={72} />
              </motion.div>

              <div className="text-center space-y-3 w-full max-w-[360px]">
                <div className="font-display text-4xl mb-6">Analyzing...</div>
                {EXTRACT_STEPS.slice(0, extractStep + 1).map((s, i) => (
                  <motion.div
                    key={s}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: i === extractStep ? 1 : 0.35, x: 0 }}
                    className={`flex items-center gap-2.5 text-sm ${i === extractStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    <span className={i < extractStep ? "text-primary" : i === extractStep ? "text-primary" : "text-muted-foreground"}>
                      {i < extractStep ? "✓" : "○"}
                    </span>
                    {s}
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-[360px]">
                <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground font-mono text-right">{Math.round(progress)}%</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Result */}
        <AnimatePresence>
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            >
              <Kicker>Extracted</Kicker>
              <div className="mt-5">
                <KineticHeading text="Found it." className="text-5xl md:text-8xl" />
              </div>

              <div className="mt-14 grid md:grid-cols-12 gap-8">
                {/* Main extracted card */}
                <div className="md:col-span-7">
                  <div className="surface-card p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-primary mb-2">✦ Verified by Nexa</div>
                        <div className="font-display text-3xl md:text-4xl">{EXTRACTED.name}</div>
                        <div className="text-muted-foreground mt-1">{EXTRACTED.tag} · {EXTRACTED.city}</div>
                      </div>
                      <div className="text-center shrink-0">
                        <div className="font-display text-5xl text-primary">{EXTRACTED.trust}</div>
                        <div className="text-xs text-muted-foreground">Trust score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {[
                        { label: "Response", value: EXTRACTED.response },
                        { label: "Jobs done", value: EXTRACTED.jobs.toLocaleString() },
                        { label: "Hours", value: EXTRACTED.hours },
                        { label: "Phone", value: EXTRACTED.phone },
                        { label: "Social", value: EXTRACTED.social },
                        { label: "Status", value: "Verified ✓" },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-foreground/5 rounded-2xl p-3">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
                          <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Services</div>
                      <div className="space-y-2">
                        {EXTRACTED.services.map((s) => (
                          <div key={s} className="flex items-center gap-2 text-sm">
                            <span className="text-primary">—</span> {s}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MagneticButton>
                        <Link
                          to="/business/$slug"
                          params={{ slug: EXTRACTED.slug }}
                          className="rounded-full bg-foreground text-background px-6 h-11 text-sm font-medium inline-flex items-center gap-2"
                        >
                          Book Now
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        </Link>
                      </MagneticButton>
                      <button className="rounded-full hairline px-6 h-11 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Save to Wallet
                      </button>
                    </div>
                  </div>
                </div>

                {/* Nearby alternatives */}
                <div className="md:col-span-5">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Nearby alternatives</div>
                  <div className="space-y-3">
                    {NEARBY.map((b, i) => (
                      <motion.div
                        key={b.slug}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="surface-card p-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 grid place-items-center text-primary font-display text-lg shrink-0">
                          {b.trust}
                        </div>
                        <div className="flex-1">
                          <div className="font-display text-base">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.tag} · {b.dist}</div>
                        </div>
                        <Link to="/business/$slug" params={{ slug: b.slug }} className="text-xs text-primary hover:underline">
                          View →
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(0)}
                    className="mt-8 link-underline text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Share another
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
