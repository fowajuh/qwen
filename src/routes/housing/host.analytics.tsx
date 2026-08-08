import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { TrendingUp, Eye, Percent, Info } from "lucide-react";

export const Route = createFileRoute("/housing/host/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Nexa Housing" }] }),
  component: HostAnalytics,
});

const REVENUE = [1200, 1450, 1100, 1800, 2100, 1950, 2400, 2200];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const maxRevenue = Math.max(...REVENUE);

function HostAnalytics() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Host tools</Kicker>
          <KineticHeading text="Performance" className="text-4xl md:text-6xl mt-4 mb-10" />
        </Reveal>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="surface-card p-5 rounded-2xl">
            <Eye className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-bold font-display">3,842</div>
            <div className="text-xs text-muted-foreground mt-1">Listing views (30d)</div>
          </div>
          <div className="surface-card p-5 rounded-2xl">
            <Percent className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-bold font-display">4.1%</div>
            <div className="text-xs text-muted-foreground mt-1">View → booking conversion</div>
          </div>
          <div className="surface-card p-5 rounded-2xl">
            <TrendingUp className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-2xl font-bold font-display">$2,400</div>
            <div className="text-xs text-muted-foreground mt-1">Revenue this month</div>
          </div>
        </div>

        {/* Revenue chart */}
        <div className="surface-card p-6 rounded-2xl mb-8">
          <h2 className="font-bold text-lg mb-6">Revenue, last 8 months</h2>
          <div className="flex items-end gap-3 h-48">
            {REVENUE.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-primary/70 hover:bg-primary transition-colors"
                  style={{ height: `${(v / maxRevenue) * 100}%` }}
                  title={`$${v}`}
                />
                <span className="text-xs text-muted-foreground">{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor pricing */}
        <div className="surface-card p-6 rounded-2xl">
          <h2 className="font-bold text-lg mb-4">Competitor-aware pricing</h2>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your nightly rate</span>
            <span className="font-bold">$150</span>
          </div>
          <div className="h-2 bg-hairline rounded-full overflow-hidden relative mb-2">
            <div className="absolute inset-y-0 left-0 bg-primary/50 rounded-full" style={{ width: "45%" }} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
            <span>$90</span>
            <span>Similar places nearby: $120–$180</span>
            <span>$220</span>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Automated, event-aware pricing recommendations need a pricing model from engineering before this can suggest live rate changes.
          </p>
        </div>

        <Link to="/housing/host/dashboard" className="inline-block mt-8 text-sm font-semibold underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
