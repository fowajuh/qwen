import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star } from "lucide-react";

export const Route = createFileRoute("/profile/activity")({
  component: ActivityPage,
});

const REVIEWS = [
  { business: "Kori Hair Studio", rating: 5, text: "Best hair salon in Brooklyn, hands down. Jordan is a wizard with balayage!", date: "Jun 28" },
  { business: "Ostro Coffee Bar", rating: 5, text: "Genuinely the best cortado in the borough. The vibe is immaculate.", date: "May 15" },
  { business: "North Fork Meats", rating: 4, text: "Premium quality, every time. The butcher box program is worth every penny.", date: "Apr 2" },
];

function ActivityPage() {
  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center border-b border-hairline">
        <button onClick={() => window.history.back()} className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[17px] font-bold mx-auto pr-8">Activity</h1>
      </div>

      <div className="p-4 max-w-[600px] mx-auto space-y-4 pt-6">
        {REVIEWS.map((r, i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 shadow-sm border border-hairline">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-[15px]">{r.business}</h3>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} size={14} className={s <= r.rating ? "fill-amber-400 text-amber-400" : "text-foreground/10"} />
                ))}
              </div>
            </div>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-3">"{r.text}"</p>
            <div className="text-[12px] text-muted-foreground font-medium">{r.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
