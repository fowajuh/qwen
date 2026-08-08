import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Kicker, KineticHeading, Reveal } from "@/components/app-shell";
import { Bell, BellOff, Calendar, MessageCircle, Star, Zap, Heart, BadgeCheck, Trash2, CheckCircle2, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Nexa" },
      { name: "description", content: "Stay up to date with your Nexa activity." },
    ],
  }),
  component: Notifications,
});

type NotifType = "booking" | "message" | "review" | "ai" | "social" | "system";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
}

const ALL_NOTIFICATIONS: Notif[] = [
  { id: "n1", type: "booking", title: "New booking confirmed", body: "Emma S. booked Balayage for Saturday 10:30am · $220", time: "Just now", read: false, href: "/ai/studio" },
  { id: "n2", type: "ai", title: "AI handled 12 requests while you slept", body: "Your AI employee replied to 12 inquiries and confirmed 4 bookings overnight.", time: "7 hours ago", read: false, href: "/ai/studio" },
  { id: "n3", type: "message", title: "New message from Michael T.", body: "\"Is there parking near the studio?\"", time: "1 hour ago", read: false, href: "/messages/chat/c2" },
  { id: "n4", type: "review", title: "New 5-star review", body: "Sarah L. left you a review: \"Absolutely incredible, best in Brooklyn!\"", time: "3 hours ago", read: false, href: "/trust" },
  { id: "n5", type: "social", title: "Your video hit 100K views", body: "Your Saturday tutorial just crossed 100,000 views. A new milestone.", time: "5 hours ago", read: true, href: "/social/analytics" },
  { id: "n6", type: "system", title: "Weekly Report Ready", body: "Your AI-generated business insights for the week of Jul 1–7 are ready to view.", time: "Yesterday", read: true, href: "/ai/insights" },
  { id: "n7", type: "booking", title: "Booking cancelled", body: "David W. cancelled his appointment on Friday 2pm.", time: "Yesterday", read: true, href: "/ai/studio" },
  { id: "n8", type: "ai", title: "AI Campaign live", body: "Your 'Saturday Openings Blitz' campaign is now live across Instagram and SMS.", time: "2 days ago", read: true, href: "/ai/campaigns" },
  { id: "n9", type: "social", title: "3 new followers", body: "kaifitness, luna_park_, and 1 other followed your business.", time: "2 days ago", read: true, href: "/social/profile/kori" },
  { id: "n10", type: "system", title: "Trust Score updated", body: "Your Trust Score increased to 98. You're in the top 2% of Nexa businesses!", time: "3 days ago", read: true, href: "/trust" },
];

const TYPE_CONFIG: Record<NotifType, { icon: React.ReactNode; color: string; bg: string }> = {
  booking: { icon: <Calendar size={18} />, color: "text-green-600", bg: "bg-green-500/10" },
  message: { icon: <MessageCircle size={18} />, color: "text-blue-600", bg: "bg-blue-500/10" },
  review: { icon: <Star size={18} />, color: "text-amber-600", bg: "bg-amber-500/10" },
  ai: { icon: <Zap size={18} />, color: "text-primary", bg: "bg-primary/10" },
  social: { icon: <Heart size={18} />, color: "text-pink-600", bg: "bg-pink-500/10" },
  system: { icon: <Bell size={18} />, color: "text-muted-foreground", bg: "bg-foreground/10" },
};

const FILTER_TABS = ["All", "Bookings", "AI", "Messages", "Reviews", "Social"] as const;
type FilterTab = (typeof FILTER_TABS)[number];

function Notifications() {
  const [notifications, setNotifications] = useState<Notif[]>(ALL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Bookings") return n.type === "booking";
    if (activeFilter === "AI") return n.type === "ai";
    if (activeFilter === "Messages") return n.type === "message";
    if (activeFilter === "Reviews") return n.type === "review";
    if (activeFilter === "Social") return n.type === "social";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-2xl mx-auto px-4 md:px-6">
        {/* ── HEADER ── */}
        <div className="flex justify-between items-start mb-8">
          <Reveal>
            <div>
              <Kicker>Activity</Kicker>
              <KineticHeading text="Notifications" className="text-4xl md:text-5xl mt-3" />
            </div>
          </Reveal>
          {unreadCount > 0 && (
            <Reveal delay={0.1}>
              <button
                onClick={markAllRead}
                className="mt-6 text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Mark all read
              </button>
            </Reveal>
          )}
        </div>

        {/* ── FILTER TABS ── */}
        <Reveal delay={0.05}>
          <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeFilter === tab
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </Reveal>

        {/* ── NOTIFICATIONS LIST ── */}
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellOff className="text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">All clear</h3>
                <p className="text-muted-foreground text-sm">No notifications in this category.</p>
              </motion.div>
            )}

            {filtered.map((notif, i) => {
              const conf = TYPE_CONFIG[notif.type];
              return (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                  className={`surface-card group relative transition-all ${!notif.read ? "border-primary/20 bg-primary/[0.02]" : ""}`}
                >
                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  )}

                  <Link to={notif.href} onClick={() => markRead(notif.id)}>
                    <div className={`flex items-start gap-4 p-5 ${!notif.read ? "pl-8" : ""}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${conf.bg} ${conf.color}`}>
                        {conf.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className={`text-sm font-semibold leading-tight ${!notif.read ? "text-foreground" : "text-foreground/80"}`}>
                            {notif.title}
                          </h3>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{notif.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{notif.body}</p>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => dismiss(notif.id)}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
