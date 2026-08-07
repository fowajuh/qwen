import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, TrendingUp, Users, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/profile/analytics")({
  component: ProfileAnalytics,
});

export default function ProfileAnalytics() {
  return (
    <div className="w-full min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[18px] ml-2">Analytics</h1>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-[14px] text-muted-foreground font-medium mb-1">Last 30 days</h2>
            <div className="text-[32px] font-bold tracking-tight">Overview</div>
          </div>
          <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2.5 py-1 rounded-full text-[13px] font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> +12.5%
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface rounded-2xl p-5 border border-hairline">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Eye className="w-4 h-4" /> <span className="text-[13px] font-semibold">Views</span>
            </div>
            <div className="text-[24px] font-bold">14.2k</div>
            <div className="text-[12px] text-green-600 font-medium mt-1">+2.4k vs last month</div>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-hairline">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Users className="w-4 h-4" /> <span className="text-[13px] font-semibold">Followers</span>
            </div>
            <div className="text-[24px] font-bold">24.5k</div>
            <div className="text-[12px] text-green-600 font-medium mt-1">+840 vs last month</div>
          </div>
          <div className="bg-surface rounded-2xl p-5 border border-hairline">
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Heart className="w-4 h-4" /> <span className="text-[13px] font-semibold">Engagements</span>
            </div>
            <div className="text-[24px] font-bold">8.1k</div>
            <div className="text-[12px] text-red-500 font-medium mt-1">-120 vs last month</div>
          </div>
        </div>

        {/* Chart Mock */}
        <div className="pt-4">
          <h3 className="font-bold text-[16px] mb-4">Audience Growth</h3>
          <div className="h-[200px] bg-surface rounded-2xl border border-hairline flex items-end justify-between p-4 gap-2">
            {[40, 30, 60, 45, 80, 65, 100].map((h, i) => (
              <div key={i} className="w-full bg-foreground/20 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 w-full bg-foreground rounded-t-sm transition-all duration-500" 
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[12px] text-muted-foreground px-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
}
