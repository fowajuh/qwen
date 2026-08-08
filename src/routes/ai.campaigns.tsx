import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Kicker, KineticHeading, Reveal } from "@/components/app-shell";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { TrendingUp, Zap, Plus, Play, Pause, MoreHorizontal, CheckCircle2, Clock, Target, Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai/campaigns")({
  head: () => ({
    meta: [
      { title: "AI Campaigns — Nexa" },
      { name: "description", content: "AI-powered marketing campaigns for your local business." },
    ],
  }),
  component: AICampaigns,
});

const CAMPAIGNS = [
  {
    id: "c1",
    name: "Saturday Openings Blitz",
    status: "active",
    channel: ["Instagram", "SMS"],
    reach: 4200,
    conversions: 38,
    revenue: "$1,140",
    budget: "$0", // AI generated
    startDate: "Jul 5",
    endDate: "Jul 12",
    description: "AI detected 3 open slots Saturday morning and auto-drafted & published promotional content offering 10% off.",
    progress: 68,
  },
  {
    id: "c2",
    name: "Post-Summer Loyalty Drive",
    status: "scheduled",
    channel: ["Email", "Instagram"],
    reach: 0,
    conversions: 0,
    revenue: "$0",
    budget: "$0",
    startDate: "Aug 1",
    endDate: "Aug 15",
    description: "Re-engagement campaign targeting customers who haven't booked in 60+ days. AI-written email series.",
    progress: 0,
  },
  {
    id: "c3",
    name: "New Service Announcement",
    status: "completed",
    channel: ["Instagram", "TikTok", "SMS"],
    reach: 12800,
    conversions: 142,
    revenue: "$6,250",
    budget: "$0",
    startDate: "Jun 15",
    endDate: "Jun 30",
    description: "Announced new Balayage service with AI-crafted content that went viral on local accounts.",
    progress: 100,
  },
];

const PERFORMANCE_DATA = [
  { name: "Week 1", reach: 3200, bookings: 18 },
  { name: "Week 2", reach: 4800, bookings: 28 },
  { name: "Week 3", reach: 6200, bookings: 42 },
  { name: "Week 4", reach: 5400, bookings: 35 },
  { name: "Week 5", reach: 8900, bookings: 64 },
  { name: "Week 6", reach: 12800, bookings: 89 },
];

const CHANNEL_DATA = [
  { name: "Instagram", bookings: 64, fill: "#E1306C" },
  { name: "TikTok", bookings: 42, fill: "#00f2ea" },
  { name: "SMS", bookings: 28, fill: "#25D366" },
  { name: "Email", bookings: 12, fill: "#EA4335" },
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/15 text-green-500",
  scheduled: "bg-amber-500/15 text-amber-500",
  completed: "bg-foreground/10 text-muted-foreground",
};

function AICampaigns() {
  const [activeCampaign, setActiveCampaign] = useState<string | null>("c1");
  const [creating, setCreating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const selectedCampaign = CAMPAIGNS.find((c) => c.id === activeCampaign);

  const handleGenerate = () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiResult(null);
    setTimeout(() => {
      setAiGenerating(false);
      setAiResult(
        `📣 Big news, ${aiPrompt.includes("sale") ? "deal-seekers" : "locals"}! We've just opened up a few exclusive slots this week.\n\nFor a limited time, treat yourself to our signature service — and enjoy 15% off when you mention this post.\n\n📍 Find us in Williamsburg, Brooklyn\n🔗 Book now in bio\n\n#Brooklyn #LocalBusiness #NexaBooking #${aiPrompt.split(" ").slice(-1)[0].replace(/[^a-zA-Z]/g, "")}`,
      );
    }, 2800);
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      {/* ── HEADER ── */}
      <div className="bg-foreground text-background pt-24 pb-12 mb-0">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <Kicker><span className="text-background/60">AI Marketing</span></Kicker>
            <KineticHeading text="Campaigns." className="text-5xl md:text-7xl mt-4" />
          </div>
          <div className="flex gap-3">
            <Link to="/ai/studio">
              <button className="bg-background/10 hover:bg-background/20 text-background px-5 py-3 rounded-full text-sm font-medium transition-colors">
                ← Studio
              </button>
            </Link>
            <button
              onClick={() => setCreating(true)}
              className="bg-primary text-white px-5 py-3 rounded-full text-sm font-medium hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-primary/30"
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-10 space-y-10">
        {/* ── STATS STRIP ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reach", value: "21K", delta: "+34%" },
            { label: "Bookings Generated", value: "180", delta: "+22%" },
            { label: "Revenue Attributed", value: "$7,390", delta: "+41%" },
            { label: "Ad Spend", value: "$0", delta: "100% organic" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="surface-card p-5">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground mb-3">{s.label}</div>
                <div className="font-display text-4xl mb-1">{s.value}</div>
                <div className="text-xs text-primary font-medium">{s.delta}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="grid md:grid-cols-12 gap-8">
          {/* Campaign List */}
          <div className="md:col-span-4 space-y-3">
            <h2 className="font-display text-2xl mb-5">All Campaigns</h2>
            {CAMPAIGNS.map((camp) => (
              <motion.div
                key={camp.id}
                onClick={() => setActiveCampaign(camp.id)}
                whileHover={{ x: 4 }}
                className={`surface-card p-4 cursor-pointer transition-all ${
                  activeCampaign === camp.id
                    ? "border-primary/30 shadow-glow"
                    : "hover:border-foreground/20"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-sm leading-tight pr-3">{camp.name}</h3>
                  <span className={`shrink-0 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[camp.status]}`}>
                    {camp.status}
                  </span>
                </div>
                <div className="flex gap-1 mb-3 flex-wrap">
                  {camp.channel.map((ch) => (
                    <span key={ch} className="text-[10px] font-semibold bg-foreground/5 px-2 py-0.5 rounded-full">
                      {ch}
                    </span>
                  ))}
                </div>
                {camp.status !== "scheduled" && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{camp.reach.toLocaleString()} reach</span>
                    <span className="font-semibold text-primary">{camp.revenue}</span>
                  </div>
                )}
                {camp.progress > 0 && (
                  <div className="mt-3 h-1 bg-foreground/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${camp.progress}%` }}
                      transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Campaign Detail */}
          <div className="md:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {selectedCampaign && (
                <motion.div
                  key={selectedCampaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="surface-card p-6 md:p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedCampaign.status]}`}>
                          {selectedCampaign.status}
                        </span>
                        <h2 className="font-display text-3xl mt-3 mb-2">{selectedCampaign.name}</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
                          {selectedCampaign.description}
                        </p>
                      </div>
                      <button className="w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:bg-surface transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-6 border-y border-hairline">
                      {[
                        { label: "Reach", value: selectedCampaign.reach.toLocaleString() || "—" },
                        { label: "Conversions", value: selectedCampaign.conversions || "—" },
                        { label: "Revenue", value: selectedCampaign.revenue || "—" },
                      ].map((m) => (
                        <div key={m.label} className="text-center">
                          <div className="font-display text-3xl mb-1">{m.value}</div>
                          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock size={14} /> {selectedCampaign.startDate} → {selectedCampaign.endDate}
                      </div>
                      <div className="flex gap-2">
                        {selectedCampaign.status === "active" && (
                          <button className="bg-foreground/5 hover:bg-foreground/10 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors">
                            <Pause size={14} /> Pause
                          </button>
                        )}
                        {selectedCampaign.status === "scheduled" && (
                          <button className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform">
                            <Play size={14} /> Launch Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Performance chart */}
                  {selectedCampaign.status !== "scheduled" && (
                    <div className="surface-card p-6">
                      <h3 className="font-semibold mb-6">Campaign Performance</h3>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={PERFORMANCE_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                            <Tooltip
                              contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.15)", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }}
                            />
                            <Area type="monotone" dataKey="reach" name="Reach" stroke="var(--color-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#perfGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── AI COPY GENERATOR ── */}
        <div className="surface-card p-6 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display text-2xl">AI Content Generator</h2>
              <p className="text-sm text-muted-foreground">Describe your promotion and AI writes the perfect campaign post.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='e.g. "Summer sale, 20% off haircuts this weekend"'
              className="flex-1 bg-foreground/[0.04] border border-hairline rounded-xl px-5 py-3.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <button
              onClick={handleGenerate}
              disabled={aiGenerating}
              className="bg-primary text-white px-7 py-3.5 rounded-xl text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-wait"
            >
              {aiGenerating ? "Writing..." : "Generate"}
            </button>
          </div>
          <AnimatePresence>
            {aiGenerating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 flex items-center gap-3 text-muted-foreground text-sm">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-primary" animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }} />
                ))}
                AI is writing your campaign...
              </motion.div>
            )}
            {aiResult && !aiGenerating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-5 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5"><CheckCircle2 size={14} /> Caption generated</span>
                  <div className="flex gap-2">
                    <button className="text-xs font-semibold text-primary hover:underline">Regenerate</button>
                    <button className="text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-full hover:scale-105 transition-transform">Publish</button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiResult}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── CHANNEL BREAKDOWN ── */}
        <div className="surface-card p-6 md:p-8">
          <h2 className="font-display text-2xl mb-6">Bookings by Channel</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHANNEL_DATA} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "var(--color-card)", color: "var(--color-foreground)" }} />
                <Bar dataKey="bookings" name="Bookings" radius={[8, 8, 0, 0]}>
                  {CHANNEL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
