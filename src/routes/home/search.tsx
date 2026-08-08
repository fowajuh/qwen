import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, TrendingUp, Hash } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/home/search")({
  component: HomeSearch,
});

const TRENDING_HASHTAGS = [
  { tag: "fyp", views: "182.4B" },
  { tag: "viral", views: "98.2B" },
  { tag: "trending", views: "45.1B" },
  { tag: "design", views: "12.8B" },
  { tag: "travel", views: "89.3B" },
  { tag: "cooking", views: "34.5B" },
  { tag: "music", views: "67.9B" },
  { tag: "dance", views: "52.1B" },
];

const TOP_CREATORS = [
  { id: "c1", user: "mia.travel", name: "Mia Travel", followers: "2.3M", verified: true, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop" },
  { id: "c2", user: "chef_marcus", name: "Chef Marcus", followers: "892K", verified: false, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop" },
  { id: "c3", user: "alex_creates", name: "Alex Creates", followers: "1.1M", verified: true, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop" },
];

const DISCOVER_GRID = [
  { id: "d1", thumb: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop", views: "4.5M" },
  { id: "d2", thumb: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop", views: "2.1M" },
  { id: "d3", thumb: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop", views: "8.9M" },
  { id: "d4", thumb: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop", views: "1.3M" },
  { id: "d5", thumb: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&auto=format&fit=crop", views: "678K" },
  { id: "d6", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop", views: "3.4M" },
];

type SearchTab = "top" | "users" | "sounds" | "hashtags" | "videos";

export default function HomeSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SearchTab>("top");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const isSearching = query.trim().length > 0;

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      {/* Search bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline pt-safe">
        <div className="flex items-center gap-2 px-4 py-3">
          <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-surface rounded-full px-4 py-2.5 border border-hairline">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <motion.div whileTap={{ scale: 0.8 }}>
                  <div className="w-5 h-5 rounded-full bg-muted-foreground/40 flex items-center justify-center">
                    <span className="text-background text-[10px] font-bold leading-none">✕</span>
                  </div>
                </motion.div>
              </button>
            )}
          </div>
          {isSearching && (
            <button onClick={() => setQuery("")} className="text-[14px] font-semibold text-muted-foreground">
              Cancel
            </button>
          )}
        </div>

        {/* Tabs when searching */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex overflow-x-auto no-scrollbar px-4 pb-2 gap-4"
            >
              {(["top", "users", "sounds", "hashtags", "videos"] as SearchTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`shrink-0 pb-2 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
                    activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isSearching ? (
        /* Search results */
        <div className="px-4 pt-4 space-y-4">
          {/* Users section */}
          {(activeTab === "top" || activeTab === "users") && (
            <div>
              {activeTab === "top" && <h3 className="font-bold text-[15px] mb-3">Users</h3>}
              <div className="space-y-4">
                {TOP_CREATORS.filter((c) => c.user.includes(query.toLowerCase()) || c.name.toLowerCase().includes(query.toLowerCase()) || activeTab === "users").map((c) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface shrink-0">
                      <img src={c.avatar} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[14px] flex items-center gap-1">
                        @{c.user}
                        {c.verified && <span className="text-blue-500 text-[12px]">✓</span>}
                      </div>
                      <div className="text-[13px] text-muted-foreground">{c.name} · {c.followers} followers</div>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-foreground text-background text-[13px] font-bold shrink-0">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {(activeTab === "top" || activeTab === "hashtags") && (
            <div>
              {activeTab === "top" && <h3 className="font-bold text-[15px] mb-3 mt-2">Hashtags</h3>}
              <div className="space-y-3">
                {TRENDING_HASHTAGS.filter((h) => h.tag.includes(query.toLowerCase()) || activeTab === "hashtags").map((h) => (
                  <button
                    key={h.tag}
                    onClick={() => navigate({ to: "/home/hashtag/$id", params: { id: h.tag } })}
                    className="flex items-center gap-3 w-full hover:bg-surface rounded-xl p-2 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface border border-hairline flex items-center justify-center">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-[14px]">#{h.tag}</div>
                      <div className="text-[13px] text-muted-foreground">{h.views} views</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Discovery grid (no search) */
        <div>
          {/* Trending section */}
          <div className="px-4 py-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-[17px]">Trending now</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_HASHTAGS.map((h) => (
                <button
                  key={h.tag}
                  onClick={() => navigate({ to: "/home/hashtag/$id", params: { id: h.tag } })}
                  className="px-4 py-2 bg-surface rounded-full text-[13px] font-semibold hover:bg-foreground hover:text-background transition-colors border border-hairline"
                >
                  #{h.tag}
                </button>
              ))}
            </div>
          </div>

          {/* Discovery grid */}
          <div className="grid grid-cols-2 gap-0.5">
            {DISCOVER_GRID.map((v, i) => (
              <div
                key={v.id}
                className={`relative bg-muted group cursor-pointer ${i === 0 ? "row-span-2 aspect-square" : "aspect-video"}`}
              >
                <img src={v.thumb} alt="" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-2 left-2 text-white text-[11px] font-bold drop-shadow-md">
                  ▶ {v.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
