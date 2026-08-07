import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/housing/dates/$id")({
  component: HousingDates,
});

export default function HousingDates() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-hairline px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button className="font-semibold text-[15px] underline">Clear</button>
      </div>

      <div className="px-5 py-6">
        <h1 className="text-[26px] font-bold mb-6">Select dates</h1>

        {/* Mock Calendar */}
        <div className="space-y-8">
          {[
            { month: "December 2026", days: 31, startDay: 2 },
            { month: "January 2027", days: 31, startDay: 5 },
          ].map((cal, idx) => (
            <div key={idx}>
              <h2 className="font-bold text-[18px] mb-4 text-center">{cal.month}</h2>
              <div className="grid grid-cols-7 gap-y-2 gap-x-1 text-center text-[13px]">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-muted-foreground font-medium pb-2">{d}</div>
                ))}
                {Array.from({ length: cal.startDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: cal.days }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = idx === 0 && (day >= 11 && day <= 14);
                  const isStart = idx === 0 && day === 11;
                  const isEnd = idx === 0 && day === 14;
                  const isBetween = idx === 0 && (day > 11 && day < 14);
                  
                  return (
                    <div
                      key={day}
                      className={cn(
                        "relative aspect-square flex items-center justify-center font-semibold",
                        isBetween && "bg-surface",
                        isStart && "bg-foreground text-background rounded-l-full",
                        isEnd && "bg-foreground text-background rounded-r-full",
                        isSelected && !isStart && !isEnd && "text-foreground",
                        !isSelected && "hover:border border-foreground rounded-full cursor-pointer"
                      )}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-hairline bg-background pb-safe flex justify-between items-center z-40">
        <div>
          <div className="font-semibold underline">Dec 11 - 14</div>
          <div className="text-muted-foreground text-[14px]">3 nights</div>
        </div>
        <button
          onClick={() => navigate({ to: "/housing/book/$id", params: { id } })}
          className="bg-foreground text-background px-8 py-3.5 rounded-xl font-bold text-[15px] shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Save
        </button>
      </div>
    </div>
  );
}
