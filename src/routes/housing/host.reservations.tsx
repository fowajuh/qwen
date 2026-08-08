import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Calendar, MessageCircle, Check, X, Key } from "lucide-react";

export const Route = createFileRoute("/housing/host/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Nexa Housing" }] }),
  component: HostReservations,
});

const RESERVATIONS = [
  { id: "r1", guest: "Maria K.", avatar: "https://i.pravatar.cc/100?img=32", dates: "Aug 12 – 16, 2026", guests: 2, amount: 720, status: "pending" as const },
  { id: "r2", guest: "Tom B.", avatar: "https://i.pravatar.cc/100?img=12", dates: "Aug 20 – 22, 2026", guests: 1, amount: 320, status: "confirmed" as const },
  { id: "r3", guest: "Yuki S.", avatar: "https://i.pravatar.cc/100?img=45", dates: "Sep 2 – 5, 2026", guests: 3, amount: 540, status: "confirmed" as const },
  { id: "r4", guest: "Alex P.", avatar: "https://i.pravatar.cc/100?img=8", dates: "Jul 4 – 8, 2026", guests: 2, amount: 480, status: "past" as const },
];

const TABS = ["pending", "confirmed", "past"] as const;

function HostReservations() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [items, setItems] = useState(RESERVATIONS);

  const decide = (id: string, accept: boolean) => {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, status: accept ? "confirmed" : "past" } : r)));
  };

  const filtered = items.filter((r) => r.status === tab);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[900px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Host tools</Kicker>
          <KineticHeading text="Reservations" className="text-4xl md:text-6xl mt-4 mb-8" />
        </Reveal>

        <div className="flex gap-6 border-b border-hairline mb-8">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-base font-medium capitalize relative transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground"}`}
            >
              {t}
              {tab === t && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-foreground" />}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">No {tab} reservations.</div>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="surface-card rounded-2xl p-5 flex items-center gap-4 flex-wrap">
              <img src={r.avatar} alt={r.guest} className="w-14 h-14 rounded-full object-cover shrink-0" />
              <div className="flex-1 min-w-[160px]">
                <div className="font-semibold text-[15px]">{r.guest}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" /> {r.dates} · {r.guests} guest{r.guests !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="font-bold text-[15px] shrink-0">${r.amount}</div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/messages" className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center hover:bg-surface transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </Link>
                {r.status === "pending" ? (
                  <>
                    <button
                      onClick={() => decide(r.id, true)}
                      className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                      aria-label="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => decide(r.id, false)}
                      className="w-10 h-10 rounded-full border border-destructive text-destructive flex items-center justify-center hover:bg-destructive/10 transition-colors"
                      aria-label="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : r.status === "confirmed" ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 px-3 py-2 rounded-full bg-green-50">
                    <Key className="w-3.5 h-3.5" /> Confirmed
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground px-3 py-2">Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
