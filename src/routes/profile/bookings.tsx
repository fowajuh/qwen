import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/profile/bookings")({
  component: BookingsPage,
});

const RECENT_BOOKINGS = [
  { business: "Kori Hair Studio", service: "Balayage", date: "Jul 12, 2026", status: "upcoming" },
  { business: "Ostro Coffee Bar", service: "Private Event", date: "Jun 28, 2026", status: "completed" },
  { business: "North Fork Meats", service: "Butcher Box", date: "Jun 10, 2026", status: "completed" },
];

function BookingsPage() {
  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-hairline">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold mx-auto pr-8">Bookings</h1>
      </div>

      <div className="p-4 max-w-[600px] mx-auto space-y-4 pt-6">
        {RECENT_BOOKINGS.map((b, i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 flex justify-between items-center group hover:border-foreground/20 border border-transparent transition-colors cursor-pointer shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full shrink-0 ${b.status === "upcoming" ? "bg-primary animate-pulse" : "bg-foreground/20"}`} />
              <div>
                <div className="font-bold text-[15px]">{b.business}</div>
                <div className="text-[13px] text-muted-foreground mt-0.5">{b.service} · {b.date}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                b.status === "upcoming" ? "bg-primary/10 text-primary" : "bg-foreground/5 text-muted-foreground"
              }`}>
                {b.status}
              </span>
              <ChevronRight size={18} className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
