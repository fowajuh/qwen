import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Clock, MapPin, Building, Utensils } from "lucide-react";

export const Route = createFileRoute("/profile/history")({
  component: ProfileHistory,
});

const HISTORY_DATA = [
  { date: "Today", items: [
    { id: 1, title: "Kori Hair Studio", type: "Booking", time: "2:30 PM", icon: Building },
    { id: 2, title: "Ostro Coffee Bar", type: "Order", time: "9:15 AM", icon: Utensils },
  ]},
  { date: "Yesterday", items: [
    { id: 3, title: "Brooklyn Museum", type: "Check-in", time: "4:00 PM", icon: MapPin },
    { id: 4, title: "Sakura Omakase", type: "Viewed", time: "1:20 PM", icon: Utensils },
    { id: 5, title: "Williamsburg Bridge", type: "Check-in", time: "11:30 AM", icon: MapPin },
  ]}
];

export default function ProfileHistory() {
  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">History</h1>
      </div>

      <div className="px-4 py-6 space-y-8">
        {HISTORY_DATA.map((group, idx) => (
          <div key={idx}>
            <h2 className="font-bold text-[16px] mb-4 text-muted-foreground">{group.date}</h2>
            <div className="bg-surface rounded-2xl overflow-hidden border border-hairline">
              {group.items.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 bg-background hover:bg-surface transition-colors cursor-pointer ${
                    i !== group.items.length - 1 ? "border-b border-hairline" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0 border border-hairline">
                    <item.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-[15px]">{item.title}</div>
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground mt-0.5">
                      <span className="font-medium">{item.type}</span>
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
