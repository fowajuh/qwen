import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Download, Upload, Ban, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/housing/host/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Nexa Housing" }] }),
  component: HostCalendar,
});

function HostCalendar() {
  const [blocked, setBlocked] = useState<Set<number>>(new Set([14, 15, 22]));
  const [minStay, setMinStay] = useState(2);
  const [basePrice, setBasePrice] = useState(150);

  const toggleDay = (day: number) => {
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const days = Array.from({ length: 31 }).map((_, i) => i + 1);
  const startOffset = 4; // arbitrary weekday offset for the mock month

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <Reveal>
            <Kicker>Host tools</Kicker>
            <KineticHeading text="Calendar & pricing" className="text-4xl md:text-6xl mt-4" />
          </Reveal>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors">
              <Upload className="w-4 h-4" /> Import iCal
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors">
              <Download className="w-4 h-4" /> Export iCal
            </button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar grid */}
          <div className="lg:col-span-2">
            <div className="surface-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-1">August 2026</h2>
              <p className="text-xs text-muted-foreground mb-4">Tap a date to block or unblock it for booking.</p>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-[13px]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-muted-foreground font-medium pb-2">{d}</div>
                ))}
                {Array.from({ length: startOffset }).map((_, i) => <div key={`e${i}`} />)}
                {days.map((day) => {
                  const isBlocked = blocked.has(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "aspect-square rounded-full flex flex-col items-center justify-center font-semibold text-[13px] transition-colors",
                        isBlocked ? "bg-destructive/10 text-destructive line-through" : "hover:bg-surface"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-destructive/10 border border-destructive/30" /> Blocked</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-hairline" /> Available</span>
              </div>
            </div>
          </div>

          {/* Pricing & rules panel */}
          <div className="space-y-6">
            <div className="surface-card p-6 rounded-2xl">
              <h3 className="font-bold mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Nightly price</h3>
              <div className="flex items-center gap-2 border border-hairline rounded-lg px-4 py-3">
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full outline-none font-semibold text-[15px]"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Applies to all unblocked dates unless overridden.</p>
            </div>

            <div className="surface-card p-6 rounded-2xl">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Ban className="w-4 h-4" /> Minimum stay</h3>
              <div className="flex items-center gap-3">
                <button onClick={() => setMinStay((m) => Math.max(1, m - 1))} className="w-9 h-9 rounded-full border border-hairline font-bold">-</button>
                <span className="font-bold w-8 text-center">{minStay}</span>
                <button onClick={() => setMinStay((m) => m + 1)} className="w-9 h-9 rounded-full border border-hairline font-bold">+</button>
                <span className="text-sm text-muted-foreground">night{minStay !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <Link
              to="/housing/host/listings"
              className="block text-center w-full py-3 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors"
            >
              Back to listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
