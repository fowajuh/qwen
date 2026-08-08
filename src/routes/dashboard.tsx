import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal, NexaMark } from "@/components/app-shell";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nexa for Business" },
      { name: "description", content: "Your business AI dashboard. Insights, scheduling, revenue, and your AI employee — all in one place." },
    ],
  }),
  component: DashboardPage,
});

const REVENUE_DATA = [48, 62, 55, 78, 65, 82, 74, 91, 84, 105, 98, 118];
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];

const CRM = [
  { name: "Emma K.", last: "3 days ago", spend: "$680", status: "Loyal" },
  { name: "Marco L.", last: "1 week ago", spend: "$340", status: "Regular" },
  { name: "Sophia T.", last: "2 weeks ago", spend: "$180", status: "New" },
  { name: "James R.", last: "1 month ago", spend: "$450", status: "At risk" },
  { name: "Aria M.", last: "6 weeks ago", spend: "$90", status: "Churned" },
];

const CRM_STYLE: Record<string, string> = {
  Loyal: "bg-primary/15 text-primary",
  Regular: "bg-green-500/15 text-green-400",
  New: "bg-blue-500/15 text-blue-300",
  "At risk": "bg-amber-500/15 text-amber-400",
  Churned: "bg-red-500/15 text-red-400",
};

const AI_SUGGESTIONS = [
  { icon: "📣", title: "Post a flash offer", desc: "Tuesday bookings are 40% below average. A limited-time offer could fill 6 empty slots.", action: "Create offer" },
  { icon: "📸", title: "New portfolio photos needed", desc: "Your last upload was 6 weeks ago. Profiles with recent photos get 28% more views.", action: "Upload photos" },
  { icon: "💰", title: "Price optimization", desc: "Comparable services in your area charge 12% more. You could earn an extra $840/month.", action: "Adjust pricing" },
];

const CALENDAR: Record<string, { slots: string[]; label: string }> = {
  Mon: { slots: ["09:00", "10:30", "14:00"], label: "Mon" },
  Tue: { slots: ["09:00", "11:00"], label: "Tue" },
  Wed: { slots: ["10:30", "13:00", "15:30"], label: "Wed" },
  Thu: { slots: ["09:00", "14:00", "16:00"], label: "Thu" },
  Fri: { slots: ["09:00", "10:30", "12:00", "14:30"], label: "Fri" },
  Sat: { slots: ["10:00", "12:30"], label: "Sat" },
  Sun: { slots: [], label: "Sun" },
};

function DashboardPage() {
  const [authed, setAuthed] = useState(false);
  const [dismissed, setDismissed] = useState<number[]>([]);

  if (!authed) {
    return <OnboardingGate onEnter={() => setAuthed(true)} />;
  }

  const maxRevenue = Math.max(...REVENUE_DATA);
  const chartH = 140;

  return (
    <div className="pt-28 pb-44">
      <div className="mx-auto max-w-[1440px] px-4 md:px-10">

        {/* Header row */}
        <Reveal>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 glass rounded-full px-4 h-10 text-sm">
                <div className="w-5 h-5 rounded-full bg-primary/20 grid place-items-center text-primary text-xs">K</div>
                Kori Hair Studio ▾
              </button>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-ring" />
                <span className="text-primary">AI Employee: Active</span>
              </div>
            </div>
            <button className="glass rounded-full w-10 h-10 grid place-items-center text-muted-foreground hover:text-foreground relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-white text-[8px] grid place-items-center">3</span>
            </button>
          </div>
        </Reveal>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Bookings this week", value: "47", delta: "+12", up: true },
            { label: "Revenue (MTD)", value: "$8,240", delta: "+18%", up: true },
            { label: "Avg response time", value: "2m 14s", delta: "−38s", up: true },
            { label: "Repeat rate", value: "72%", delta: "+4pt", up: true },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.07}>
              <div className="surface-card p-5 md:p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{s.label}</div>
                <div className="font-display text-3xl md:text-4xl">{s.value}</div>
                <div className={`text-sm mt-2 ${s.up ? "text-primary" : "text-red-400"}`}>{s.delta}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* AI Assistant */}
        <Reveal className="mb-10">
          <div className="surface-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <NexaMark size={32} />
              <div>
                <div className="font-display text-xl">Your AI Employee</div>
                <div className="text-xs text-muted-foreground">3 suggestions ready for you</div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {AI_SUGGESTIONS.filter((_, i) => !dismissed.includes(i)).map((s, i) => (
                <motion.div
                  key={s.title}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-foreground/[0.04] rounded-2xl p-5 border border-hairline"
                >
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <div className="font-display text-lg mb-2">{s.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex items-center gap-3">
                    <button className="rounded-full bg-primary/10 text-primary px-3 h-8 text-xs hover:bg-primary/20 transition-colors">
                      {s.action}
                    </button>
                    <button onClick={() => setDismissed((d) => [...d, i])} className="text-xs text-muted-foreground hover:text-foreground">
                      Dismiss
                    </button>
                  </div>
                </motion.div>
              ))}
              {dismissed.length === 3 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-3 text-center py-8 text-muted-foreground text-sm">
                  All caught up. New suggestions will arrive based on your next week of bookings.
                </motion.div>
              )}
            </div>
          </div>
        </Reveal>

        {/* Revenue chart + Calendar */}
        <div className="grid md:grid-cols-12 gap-8 mb-10">
          {/* SVG Revenue Chart */}
          <Reveal className="md:col-span-7">
            <div className="surface-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display text-xl">Revenue</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-6 h-0.5 bg-primary inline-block" /> Last 12 weeks
                </div>
              </div>
              <div className="relative" style={{ height: chartH + 40 }}>
                <svg width="100%" height={chartH + 20} viewBox={`0 0 ${WEEKS.length * 60} ${chartH + 20}`} preserveAspectRatio="none" className="overflow-visible">
                  {/* Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
                    <line
                      key={pct}
                      x1="0" y1={chartH * (1 - pct)}
                      x2={WEEKS.length * 60} y2={chartH * (1 - pct)}
                      stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
                    />
                  ))}

                  {/* Area fill */}
                  <defs>
                    <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.19 45)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="oklch(0.62 0.19 45)" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Line path */}
                  <motion.path
                    d={REVENUE_DATA.map((v, i) => {
                      const x = i * 60 + 30;
                      const y = chartH - (v / maxRevenue) * chartH;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    }).join(" ")}
                    fill="none"
                    stroke="oklch(0.62 0.19 45)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, ease: [0.19, 1, 0.22, 1], delay: 0.3 }}
                  />

                  {/* Dots */}
                  {REVENUE_DATA.map((v, i) => {
                    const x = i * 60 + 30;
                    const y = chartH - (v / maxRevenue) * chartH;
                    const isLast = i === REVENUE_DATA.length - 1;
                    return (
                      <motion.circle
                        key={i}
                        cx={x} cy={y} r={isLast ? 5 : 3}
                        fill={isLast ? "oklch(0.62 0.19 45)" : "oklch(0.62 0.19 45 / 0.5)"}
                        initial={{ r: 0 }}
                        whileInView={{ r: isLast ? 5 : 3 }}
                        viewport={{ once: true }}
                        transition={{ delay: 2 + i * 0.05 }}
                      />
                    );
                  })}
                </svg>

                {/* X axis labels */}
                <div className="flex absolute bottom-0 left-0 right-0">
                  {WEEKS.map((w) => (
                    <div key={w} className="flex-1 text-center text-[10px] text-muted-foreground font-mono">{w}</div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Calendar */}
          <Reveal className="md:col-span-5" delay={0.15}>
            <div className="surface-card p-6">
              <div className="font-display text-xl mb-5">This Week</div>
              <div className="grid grid-cols-7 gap-1">
                {Object.entries(CALENDAR).map(([day, { slots, label }]) => (
                  <div key={day}>
                    <div className="text-center text-[10px] text-muted-foreground mb-2">{label}</div>
                    <div className="space-y-1">
                      {["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"].map((t) => (
                        <div
                          key={t}
                          className={`h-5 rounded-md ${slots.includes(t) ? "bg-primary/80" : "bg-foreground/5"}`}
                          title={slots.includes(t) ? `Booked ${t}` : "Available"}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-primary/80 inline-block" /> Booked</div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-foreground/5 inline-block" /> Available</div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* CRM Table */}
        <Reveal className="mb-10">
          <div className="surface-card overflow-hidden">
            <div className="p-6 border-b border-hairline flex items-center justify-between">
              <div className="font-display text-xl">Customers</div>
              <span className="text-xs text-muted-foreground">5 contacts</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-hairline">
                    {["Name", "Last visit", "Total spend", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-6 py-4 text-xs uppercase tracking-widest text-muted-foreground font-normal">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CRM.map((c, i) => (
                    <motion.tr
                      key={c.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="border-b border-hairline hover:bg-foreground/[0.025] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{c.name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.last}</td>
                      <td className="px-6 py-4 font-display text-lg">{c.spend}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${CRM_STYLE[c.status]}`}>{c.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-xs text-primary hover:underline">Send offer</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* Campaign creator */}
        <Reveal className="mb-10">
          <div className="surface-card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs bg-primary/15 text-primary px-2.5 py-1 rounded-full">AI Generated</span>
              <div className="font-display text-xl">Campaign Creator</div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Generated caption</div>
                <div className="bg-foreground/5 rounded-2xl p-5 text-sm leading-relaxed text-muted-foreground">
                  ✂️ Autumn is here and so are our new seasonal tones — warm coppers, deep chestnuts, and soft tawny golds.<br /><br />
                  Book your Signature Cut & Finish this week and step into the season with a look that turns heads. Limited slots available 🍂<br /><br />
                  <span className="text-primary">#KoriHairStudio #BrooklynHair #AutumnVibes #BookNow #WilliamsburgNYC</span>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Schedule</div>
                <div className="space-y-3">
                  {["📸 Instagram Post", "📱 Instagram Story", "💬 WhatsApp Broadcast"].map((p) => (
                    <div key={p} className="flex items-center justify-between bg-foreground/5 rounded-2xl px-4 h-12">
                      <span className="text-sm">{p}</span>
                      <button className="text-xs text-primary hover:underline">Schedule</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="flex-1 rounded-full bg-primary text-white h-10 text-sm font-medium hover:opacity-90 transition-opacity">
                    Post now
                  </button>
                  <button className="flex-1 rounded-full hairline h-10 text-sm text-muted-foreground hover:text-foreground">
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Upgrade nudge */}
        <Reveal>
          <div className="surface-card p-6 md:p-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display text-2xl">Ready for more?</div>
              <p className="text-muted-foreground mt-2 text-sm">Unlock Growth analytics, multi-staff scheduling, and priority support with Nexa Business+.</p>
            </div>
            <Link
              to="/membership"
              className="shrink-0 rounded-full bg-primary text-white px-8 h-12 text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              Upgrade to Growth
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function OnboardingGate({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-ink grain-overlay relative overflow-hidden">
      <div className="relative z-10 text-center px-4 max-w-[600px]">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
          className="mx-auto mb-10"
        >
          <NexaMark size={80} />
        </motion.div>

        <KineticHeading text="Your business dashboard." className="text-4xl md:text-7xl" />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-muted-foreground text-lg"
        >
          Everything in one place. Your AI employee included. Revenue insights, smart scheduling, and customer intelligence — all ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onEnter}
            className="rounded-full bg-foreground text-background px-8 h-14 text-base font-medium hover:opacity-90 transition-opacity"
          >
            Sign in with Nexa
          </button>
          <button
            onClick={onEnter}
            className="rounded-full hairline px-8 h-14 text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            Try the demo →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-10 flex items-center justify-center gap-3"
        >
          {["AI Replies", "Revenue Insights", "Smart Scheduling"].map((f) => (
            <span key={f} className="text-xs text-muted-foreground glass px-3 h-7 rounded-full inline-flex items-center">
              {f}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
