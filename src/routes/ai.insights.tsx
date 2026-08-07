import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Kicker, KineticHeading, Reveal } from "@/components/app-shell";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Users, DollarSign, Star, Calendar, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/ai/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — Nexa" },
      { name: "description", content: "Deep revenue analytics and performance insights for your business." },
    ],
  }),
  component: AIInsights,
});

/* ── DATA ── */
const REVENUE_12W = [
  { week: "W1", revenue: 1800, bookings: 12, aov: 150 },
  { week: "W2", revenue: 2200, bookings: 15, aov: 147 },
  { week: "W3", revenue: 1950, bookings: 13, aov: 150 },
  { week: "W4", revenue: 2800, bookings: 18, aov: 156 },
  { week: "W5", revenue: 3100, bookings: 21, aov: 148 },
  { week: "W6", revenue: 2700, bookings: 17, aov: 159 },
  { week: "W7", revenue: 3400, bookings: 23, aov: 148 },
  { week: "W8", revenue: 3900, bookings: 26, aov: 150 },
  { week: "W9", revenue: 4200, bookings: 28, aov: 150 },
  { week: "W10", revenue: 3800, bookings: 25, aov: 152 },
  { week: "W11", revenue: 4800, bookings: 31, aov: 155 },
  { week: "W12", revenue: 5200, bookings: 34, aov: 153 },
];

const SERVICE_DATA = [
  { name: "Balayage", value: 38 },
  { name: "Haircut", value: 29 },
  { name: "Coloring", value: 18 },
  { name: "Styling", value: 10 },
  { name: "Other", value: 5 },
];
const SERVICE_COLORS = ["var(--color-primary)", "#a78bfa", "#34d399", "#fb923c", "#94a3b8"];

const HOURLY_DATA = [
  { hour: "9am", bookings: 3 }, { hour: "10am", bookings: 7 }, { hour: "11am", bookings: 9 },
  { hour: "12pm", bookings: 6 }, { hour: "1pm", bookings: 4 }, { hour: "2pm", bookings: 8 },
  { hour: "3pm", bookings: 11 }, { hour: "4pm", bookings: 12 }, { hour: "5pm", bookings: 7 },
  { hour: "6pm", bookings: 4 }, { hour: "7pm", bookings: 2 },
];

const INSIGHTS = [
  {
    type: "opportunity",
    icon: <TrendingUp size={20} />,
    title: "Price Tuesday mornings +15%",
    desc: "Your Tuesday 10–12am slots fill up 3× faster than average. You're leaving ~$280/week on the table.",
    cta: "Adjust Pricing",
    ctaHref: "/ai/studio"
  },
  {
    type: "risk",
    icon: <TrendingDown size={20} />,
    title: "Thursday evenings are underperforming",
    desc: "Thursday 5–7pm has 62% fill rate vs. your 84% average. Consider promoting these slots.",
    cta: "Create Campaign",
    ctaHref: "/ai/campaigns"
  },
  {
    type: "growth",
    icon: <Users size={20} />,
    title: "28 customers are lapsing",
    desc: "28 customers haven't booked in 60 days. AI-drafted a win-back SMS ready to send.",
    cta: "Review & Send",
    ctaHref: "/ai/campaigns"
  },
];

function StatCard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div className="surface-card p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-3">{label}</div>
      <div className="font-display text-4xl mb-2">{value}</div>
      <div className={`text-xs font-semibold flex items-center gap-1 ${positive ? "text-green-500" : "text-red-500"}`}>
        {positive ? <ArrowUpRight size={12} /> : <ArrowUpRight size={12} className="rotate-180" />}
        {delta}
      </div>
    </div>
  );
}

function AIInsights() {
  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* ── HEADER ── */}
      <div className="bg-foreground text-background pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Kicker><span className="text-background/60">AI Intelligence</span></Kicker>
            <KineticHeading text="Insights." className="text-5xl md:text-7xl mt-4" />
            <p className="text-background/60 mt-3 text-lg max-w-xl">
              Your business in full detail. AI-surfaced intelligence updated daily.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <select className="bg-background/10 border border-background/20 text-background rounded-full px-4 py-2.5 text-sm outline-none">
              <option>Last 12 Weeks</option>
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
            <Link to="/ai/studio">
              <button className="bg-background/10 hover:bg-background/20 text-background px-5 py-2.5 rounded-full text-sm font-medium">
                ← Studio
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 space-y-10">
        {/* ── KPI GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Reveal delay={0}><StatCard label="Total Revenue" value="$37,850" delta="+28% vs last period" positive /></Reveal>
          <Reveal delay={0.08}><StatCard label="Total Bookings" value="247" delta="+19% vs last period" positive /></Reveal>
          <Reveal delay={0.16}><StatCard label="Avg Order Value" value="$153" delta="+6% vs last period" positive /></Reveal>
          <Reveal delay={0.24}><StatCard label="Repeat Clients" value="72%" delta="+4pt vs last period" positive /></Reveal>
        </div>

        {/* ── REVENUE CHART ── */}
        <Reveal delay={0.1}>
          <div className="surface-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-2xl">Revenue over time</h2>
              <div className="text-sm text-primary font-semibold bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <TrendingUp size={14} /> +28% trend
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_12W} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={50} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.12)", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }}
                    formatter={(value, name) => [name === "revenue" ? `$${value.toLocaleString()}` : value, name === "revenue" ? "Revenue" : "Bookings"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        {/* ── TWO-COL ── */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Service Mix */}
          <Reveal delay={0.1}>
            <div className="surface-card p-6 md:p-8">
              <h2 className="font-display text-2xl mb-6">Revenue by Service</h2>
              <div className="flex items-center justify-center gap-6 flex-col md:flex-row">
                <div className="h-[200px] w-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={SERVICE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {SERVICE_DATA.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={SERVICE_COLORS[index % SERVICE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }}
                        formatter={(v) => [`${v}%`, ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 w-full">
                  {SERVICE_DATA.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: SERVICE_COLORS[i] }} />
                        <span className="text-sm font-medium">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.value}%`, backgroundColor: SERVICE_COLORS[i] }} />
                        </div>
                        <span className="text-sm font-bold tabular-nums w-8 text-right">{s.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Peak Hours */}
          <Reveal delay={0.2}>
            <div className="surface-card p-6 md:p-8">
              <h2 className="font-display text-2xl mb-6">Peak Hours</h2>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={HOURLY_DATA} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "none", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }} />
                    <Bar dataKey="bookings" name="Bookings" fill="var(--color-primary)" radius={[6, 6, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                Peak: <strong className="text-foreground">3–5pm</strong> · Consider raising prices by 10–15% during this window.
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── AI INSIGHTS ── */}
        <div>
          <Reveal>
            <h2 className="font-display text-3xl mb-6">AI-Surfaced Insights</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {INSIGHTS.map((ins, i) => (
              <Reveal key={ins.title} delay={i * 0.1}>
                <div className={`surface-card p-6 flex flex-col h-full border-l-4 ${
                  ins.type === "opportunity" ? "border-l-primary" : ins.type === "risk" ? "border-l-red-500" : "border-l-purple-500"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                    ins.type === "opportunity" ? "bg-primary/10 text-primary" : ins.type === "risk" ? "bg-red-500/10 text-red-500" : "bg-purple-500/10 text-purple-500"
                  }`}>
                    {ins.icon}
                  </div>
                  <h3 className="font-semibold text-base mb-2 leading-snug">{ins.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{ins.desc}</p>
                  <Link to={ins.ctaHref} className="mt-5">
                    <button className={`w-full py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105 ${
                      ins.type === "opportunity" ? "bg-primary text-white" : ins.type === "risk" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"
                    }`}>
                      {ins.cta}
                    </button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <Reveal delay={0.1}>
          <div className="surface-card p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl">Reputation Score</h2>
              <div className="flex items-center gap-2 text-amber-500 font-bold text-2xl">
                <Star size={20} className="fill-amber-500" /> 4.9
              </div>
            </div>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const counts = [82, 12, 4, 1, 1];
                const count = counts[5 - star];
                const pct = count;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-3 text-right shrink-0">{star}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-amber-400 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay: (5 - star) * 0.07 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 shrink-0">{count}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
