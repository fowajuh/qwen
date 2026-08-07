import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal, MagneticButton } from "@/components/app-shell";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust — Nexa" },
      { name: "description", content: "The Nexa Trust Score is multidimensional. Every point is explained. Stars lie. Numbers explain." },
    ],
  }),
  component: Trust,
});

const DIMS = [
  ["Identity", 100, "Government ID · business registration verified"],
  ["Responsiveness", 96, "Median reply 4 min · 24/7 coverage"],
  ["Consistency", 92, "Prices, hours, availability match reality"],
  ["Completion", 98, "1,412 jobs completed in full"],
  ["Satisfaction", 94, "Post-visit feedback across 60 days"],
  ["Pricing clarity", 89, "No surprises — quotes match invoices"],
  ["Dispute record", 100, "Zero unresolved disputes"],
  ["Photo authenticity", 93, "AI-verified originals, not stock"],
] as const;

const COMPARED = [
  { platform: "Nexa", dimensions: 8, realtime: true, verified: true, escrow: true, warranty: true },
  { platform: "Google", dimensions: 1, realtime: false, verified: false, escrow: false, warranty: false },
  { platform: "Yelp", dimensions: 1, realtime: false, verified: false, escrow: false, warranty: false },
  { platform: "Instagram", dimensions: 0, realtime: false, verified: false, escrow: false, warranty: false },
];

const TIMELINE_EVENTS = [
  { label: "Business registers on Nexa", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> },
  { label: "Identity & license verified (< 24h)", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
  { label: "First booking completed", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg> },
  { label: "Trust Score initialized from job data", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { label: "Client leaves verified feedback", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="9" x2="17" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></svg> },
  { label: "Score updates in real time", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg> },
  { label: "Disputes, refusals, or delays are flagged", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
  { label: "Score reflects true business health", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
];

function Trust() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="pt-28 pb-44">
      <section className="mx-auto max-w-[1440px] px-6 md:px-10">
        <Kicker>Trust</Kicker>
        <div className="mt-6">
          <KineticHeading text="Stars lie." className="text-6xl md:text-[9vw]" />
          <div className="text-6xl md:text-[9vw] font-display text-muted-foreground overflow-hidden">
            <motion.span
              initial={{ y: "110%" }} animate={{ y: 0 }}
              transition={{ delay: 0.5, duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
              className="inline-block"
            >
              Numbers explain.
            </motion.span>
          </div>
        </div>

        <Reveal delay={0.6} className="mt-10 max-w-2xl">
          <p className="text-lg text-muted-foreground leading-relaxed">
            A five-star rating tells you nothing about whether a business will respond in 5 minutes, price honestly, or show up. Nexa's Trust Score measures <em>8 independent dimensions</em> — updated in real time — so you know exactly who you're hiring.
          </p>
        </Reveal>

        {/* ── DIAL + DIMS ── */}
        <div className="mt-24 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Reveal>
              <TrustDial score={98} />
            </Reveal>

            {/* What the score means */}
            <Reveal delay={0.15} className="mt-6">
              <div className="surface-card p-6 space-y-3">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Score bands</div>
                {[
                  { range: "95–100", label: "Exceptional", color: "bg-green-500" },
                  { range: "85–94", label: "Trusted", color: "bg-primary" },
                  { range: "70–84", label: "Established", color: "bg-amber-400" },
                  { range: "< 70", label: "Under review", color: "bg-red-400" },
                ].map((b) => (
                  <div key={b.range} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${b.color}`} />
                    <span className="font-mono text-xs text-muted-foreground w-16">{b.range}</span>
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="md:col-span-7 space-y-5">
            {DIMS.map(([n, v, note], i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: [0.19, 1, 0.22, 1] }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
                className="cursor-default"
              >
                <div className="flex items-baseline justify-between">
                  <div className={`font-display text-2xl md:text-3xl transition-colors ${hovered === i ? "text-primary" : ""}`}>{n}</div>
                  <div className="font-display text-3xl md:text-4xl tabular-nums">{v}</div>
                </div>
                <div className="mt-3 h-[3px] rounded-full bg-foreground/10 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }} whileInView={{ scaleX: v / 100 }} viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.2 + i * 0.06, ease: [0.19, 1, 0.22, 1] }}
                    style={{ transformOrigin: "left" }}
                    className={`h-full transition-colors ${hovered === i ? "bg-primary" : "bg-foreground"}`}
                  />
                </div>
                <AnimatePresence>
                  {hovered === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 text-sm text-primary">{note}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {hovered !== i && <div className="mt-2 text-sm text-muted-foreground">{note}</div>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── COMPARISON TABLE ── */}
        <div className="mt-32">
          <Kicker>Comparison</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl">Nothing else<br />comes close.</h2></Reveal>
          <Reveal delay={0.1} className="mt-14">
            <div className="surface-card overflow-x-auto">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b border-hairline">
                    <th className="text-left px-6 py-5 text-xs uppercase tracking-widest text-muted-foreground font-normal">Feature</th>
                    {COMPARED.map((c) => (
                      <th key={c.platform} className={`px-6 py-5 text-center text-xs uppercase tracking-widest font-normal ${c.platform === "Nexa" ? "text-primary" : "text-muted-foreground"}`}>
                        {c.platform}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Trust dimensions", key: "dimensions" },
                    { label: "Real-time updates", key: "realtime" },
                    { label: "ID verified", key: "verified" },
                    { label: "Escrow payments", key: "escrow" },
                    { label: "Warranty protection", key: "warranty" },
                  ].map((row, ri) => (
                    <motion.tr
                      key={row.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: ri * 0.07 }}
                      className="border-b border-hairline"
                    >
                      <td className="px-6 py-5 text-muted-foreground">{row.label}</td>
                      {COMPARED.map((c) => {
                        const val = c[row.key as keyof typeof c];
                        return (
                          <td key={c.platform} className="px-6 py-5 text-center">
                            {typeof val === "boolean" ? (
                              val ? <span className="text-primary text-lg">✓</span> : <span className="text-muted-foreground/40 text-lg">—</span>
                            ) : (
                              <span className={c.platform === "Nexa" ? "font-display text-xl text-primary" : "text-muted-foreground/50"}>{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>

        {/* ── HOW IT WORKS TIMELINE ── */}
        <div className="mt-32">
          <Kicker>How it works</Kicker>
          <Reveal delay={0.05}><h2 className="font-display mt-5 text-5xl md:text-7xl mb-14">Score lifecycle.</h2></Reveal>
          <div className="grid md:grid-cols-4 gap-4">
            {TIMELINE_EVENTS.map((ev, i) => (
              <motion.div
                key={ev.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="surface-card p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/[0.04] flex items-center justify-center text-foreground mb-4">
                  {ev.icon}
                </div>
                <div className="font-mono text-xs text-muted-foreground mb-2">{String(i + 1).padStart(2, "0")}</div>
                <div className="text-sm leading-relaxed">{ev.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <Reveal className="mt-32 text-center">
          <div className="font-display text-4xl md:text-6xl mb-8">Ready to discover<br />who you can trust?</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <MagneticButton>
              <Link to="/discover" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 h-14 text-sm font-medium hover:opacity-90 transition-opacity">
                Browse businesses
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </MagneticButton>
            <Link to="/search" className="link-underline text-muted-foreground hover:text-foreground text-sm inline-flex items-center h-14">
              Or ask Nexa →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

function TrustDial({ score }: { score: number }) {
  const R = 140, C = 2 * Math.PI * R;
  return (
    <div className="surface-card p-8 md:p-10 relative overflow-hidden">
      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Nexa Trust Score</div>
      <div className="relative mt-6 aspect-square max-w-[360px] mx-auto">
        <svg viewBox="0 0 320 320" className="w-full h-full -rotate-90">
          <circle cx="160" cy="160" r={R} stroke="currentColor" className="text-foreground/10" strokeWidth="10" fill="none" />
          <motion.circle
            cx="160" cy="160" r={R} stroke="currentColor" className="text-primary" strokeWidth="10" fill="none" strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            whileInView={{ strokeDashoffset: C - (C * score) / 100 }}
            viewport={{ once: true }}
            transition={{ duration: 2.2, ease: [0.19, 1, 0.22, 1] }}
          />
          {/* Inner ring */}
          <motion.circle
            cx="160" cy="160" r={R - 18} stroke="currentColor" className="text-foreground/5" strokeWidth="1" fill="none"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.9, type: "spring" }}
              className="font-display text-8xl tabular-nums text-primary"
            >
              {score}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">out of 100</div>
            <div className="text-[10px] text-primary mt-2 uppercase tracking-widest">Exceptional</div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-between text-xs text-muted-foreground font-mono">
        <span>verified · 3 yrs</span><span>1,412 jobs</span>
      </div>
    </div>
  );
}
