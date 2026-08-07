import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, Hash } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/home/hashtag/$id")({
  component: HashtagDetailPage,
});

const HASHTAG_VIDEOS = [
  { id: "h1", user: "creator_1", thumb: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop", plays: 892000 },
  { id: "h2", user: "creator_2", thumb: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop", plays: 2300000 },
  { id: "h3", user: "creator_3", thumb: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop", plays: 4520000 },
  { id: "h4", user: "creator_4", thumb: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop", plays: 1280000 },
  { id: "h5", user: "creator_5", thumb: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&auto=format&fit=crop", plays: 671000 },
  { id: "h6", user: "creator_6", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop", plays: 3340000 },
  { id: "h7", user: "creator_7", thumb: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&auto=format&fit=crop", plays: 1890000 },
  { id: "h8", user: "creator_8", thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop", plays: 9200000 },
  { id: "h9", user: "creator_9", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop", plays: 5560000 },
  { id: "h10", user: "creator_10", thumb: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=600&auto=format&fit=crop", plays: 4100000 },
  { id: "h11", user: "creator_11", thumb: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600&auto=format&fit=crop", plays: 770000 },
  { id: "h12", user: "creator_12", thumb: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop", plays: 2900000 },
];

function formatCount(n: number) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function HashtagDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"top" | "recent">("top");
  const tag = id.replace(/-/g, "");
  const totalViews = HASHTAG_VIDEOS.reduce((sum, v) => sum + v.plays, 0);

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[17px] flex-1">#{tag}</h1>
          <button onClick={() => navigate({ to: "/search" })} className="p-2 rounded-full hover:bg-surface">
            <Search className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hashtag info */}
      <div className="px-4 py-6 flex items-center gap-5 border-b border-hairline">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shrink-0">
          <Hash className="w-10 h-10 text-white" />
        </div>
        <div>
          <div className="font-bold text-[22px]">#{tag}</div>
          <div className="text-muted-foreground text-[14px] mt-1">{formatCount(totalViews)} views</div>
          <div className="text-muted-foreground text-[13px]">{HASHTAG_VIDEOS.length}+ videos</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline">
        {(["top", "recent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-3 gap-0.5 mt-0.5">
        {(tab === "top"
          ? [...HASHTAG_VIDEOS].sort((a, b) => b.plays - a.plays)
          : [...HASHTAG_VIDEOS].reverse()
        ).map((v) => (
          <motion.div
            key={v.id}
            className="relative aspect-[9/16] bg-muted group cursor-pointer"
            whileTap={{ opacity: 0.8 }}
          >
            <img src={v.thumb} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-2 left-2 text-white text-[11px] font-semibold">
              ▶ {formatCount(v.plays)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
