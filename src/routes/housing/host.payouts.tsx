import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Landmark, FileText, Calendar, ChevronRight, Info } from "lucide-react";

export const Route = createFileRoute("/housing/host/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Nexa Housing" }] }),
  component: HostPayouts,
});

const HISTORY = [
  { id: "p1", date: "Aug 1, 2026", amount: 1240, method: "Bank •••• 8821", status: "Paid" },
  { id: "p2", date: "Jul 1, 2026", amount: 980, method: "Bank •••• 8821", status: "Paid" },
  { id: "p3", date: "Jun 1, 2026", amount: 1560, method: "Bank •••• 8821", status: "Paid" },
];

function HostPayouts() {
  const [schedule, setSchedule] = useState<"monthly" | "weekly">("monthly");

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Host tools</Kicker>
          <KineticHeading text="Payouts" className="text-4xl md:text-6xl mt-4 mb-10" />
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Bank account */}
            <div className="surface-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Landmark className="w-4 h-4" /> Payout method</h2>
              <div className="flex items-center justify-between border border-hairline rounded-xl p-4">
                <div>
                  <div className="font-semibold text-[14px]">Chase Checking •••• 8821</div>
                  <div className="text-xs text-muted-foreground mt-1">Default payout account</div>
                </div>
                <button className="text-sm font-semibold underline">Edit</button>
              </div>
              <button className="mt-3 text-sm font-semibold underline">+ Add another payout method</button>
            </div>

            {/* Schedule */}
            <div className="surface-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar className="w-4 h-4" /> Payout schedule</h2>
              <div className="flex gap-3">
                {(["monthly", "weekly"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSchedule(s)}
                    className={`flex-1 px-4 py-3 rounded-xl border font-semibold text-sm capitalize transition-colors ${
                      schedule === s ? "border-foreground bg-surface" : "border-hairline"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            <div className="surface-card p-6 rounded-2xl">
              <h2 className="font-bold text-lg mb-4">Payout history</h2>
              <div className="divide-y divide-hairline">
                {HISTORY.map((h) => (
                  <div key={h.id} className="flex items-center justify-between py-3 text-[14px]">
                    <div>
                      <div className="font-semibold">{h.date}</div>
                      <div className="text-xs text-muted-foreground">{h.method}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${h.amount}</div>
                      <div className="text-xs text-green-600">{h.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tax documents */}
          <div className="space-y-6">
            <div className="surface-card p-6 rounded-2xl">
              <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Tax documents</h3>
              <button className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl border border-hairline hover:bg-surface transition-colors">
                <span className="text-sm font-medium">2025 earnings summary</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Tax form generation and jurisdiction handling require legal review before this goes live.
              </p>
            </div>
            <Link
              to="/housing/host/dashboard"
              className="block text-center w-full py-3 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
