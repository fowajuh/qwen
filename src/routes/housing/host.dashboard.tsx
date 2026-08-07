import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  MessageCircle,
  ListChecks,
  Wallet,
  BarChart3,
  ChevronRight,
  Star,
} from "lucide-react";

export const Route = createFileRoute("/housing/host/dashboard")({
  head: () => ({ meta: [{ title: "Host Dashboard — Nexa Housing" }] }),
  component: HostDashboard,
});

const QUICK_ACTIONS = [
  { to: "/housing/host/listings", label: "Manage listings", desc: "Edit, pause, or remove", icon: ListChecks },
  { to: "/housing/host/calendar", label: "Calendar & pricing", desc: "Block dates, adjust rates", icon: Calendar },
  { to: "/housing/host/reservations", label: "Reservations", desc: "Approve & message guests", icon: MessageCircle },
  { to: "/housing/host/payouts", label: "Payouts", desc: "Bank account & history", icon: Wallet },
  { to: "/housing/host/analytics", label: "Analytics", desc: "Views, conversion, revenue", icon: BarChart3 },
] as const;

const RECENT_RESERVATIONS = [
  { id: "r1", guest: "Maria K.", dates: "Aug 12 – 16", status: "Confirmed", amount: 720 },
  { id: "r2", guest: "Tom B.", dates: "Aug 20 – 22", status: "Pending", amount: 320 },
  { id: "r3", guest: "Yuki S.", dates: "Sep 2 – 5", status: "Confirmed", amount: 540 },
];

function HostDashboard() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div>
              <Kicker>Host tools</Kicker>
              <KineticHeading text="Your dashboard" className="text-4xl md:text-6xl mt-4" />
            </div>
            <Link
              to="/housing/host"
              className="px-5 py-3 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors shrink-0"
            >
              + Add another listing
            </Link>
          </div>
        </Reveal>

        {/* Summary stats */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "This month's earnings", value: "$3,240", icon: DollarSign, trend: "+18%" },
            { label: "Occupancy rate", value: "72%", icon: TrendingUp, trend: "+5%" },
            { label: "Avg. rating", value: "4.92", icon: Star, trend: "156 reviews" },
            { label: "Upcoming stays", value: "6", icon: Calendar, trend: "Next: Aug 12" },
          ].map((stat) => (
            <div key={stat.label} className="surface-card p-5 rounded-2xl">
              <stat.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="text-2xl font-bold font-display">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              <div className="text-xs font-semibold text-green-600 mt-2">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="surface-card p-5 rounded-2xl flex items-center gap-4 hover:border-foreground/30 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[15px]">{action.label}</div>
                  <div className="text-xs text-muted-foreground">{action.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent reservations */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recent reservations</h2>
            <Link to="/housing/host/reservations" className="text-sm font-semibold underline">View all</Link>
          </div>
          <div className="surface-card rounded-2xl overflow-hidden divide-y divide-hairline">
            {RECENT_RESERVATIONS.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[14px]">{r.guest}</div>
                  <div className="text-xs text-muted-foreground">{r.dates}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      r.status === "Confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                  <span className="font-semibold text-[14px] w-16 text-right">${r.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
