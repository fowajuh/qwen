import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, MoreHorizontal, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { DISCOVER_FEED, type Pin } from "./index";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/discover/category")({
  validateSearch: (search: Record<string, unknown>): { topic?: string } => ({
    topic: typeof search.topic === "string" ? search.topic : undefined,
  }),
  component: CategoryPage,
});

const REFINEMENTS = ["Templates", "Design", "Free", "Ideas", "Tutorials"];

function CategoryPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const topic = search.topic || "Discover";
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetItem, setSheetItem] = useState<Pin | null>(null);

  const topicLower = topic.toLowerCase();

  const results = useMemo(() => {
    // Rank pins by relevance to the searched topic, falling back to the full feed
    // so every search always renders a believable, populated grid.
    const scored = DISCOVER_FEED.map((p) => {
      let score = 0;
      if (p.title.toLowerCase().includes(topicLower)) score += 3;
      if (p.category.toLowerCase().includes(topicLower)) score += 2;
      if (p.tag?.toLowerCase().includes(topicLower)) score += 2;
      if (p.author.toLowerCase().includes(topicLower)) score += 1;
      return { pin: p, score };
    });
    const matched = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => s.pin);
    const base = matched.length ? matched : DISCOVER_FEED;
    if (!activeFilter) return base;
    return base.filter((p) => p.category === activeFilter || p.tag === activeFilter);
  }, [topicLower, activeFilter]);

  return (
    <div className="w-full bg-background min-h-screen pt-safe">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md pb-3 border-b border-hairline">
        <div className="flex items-center gap-3 px-4 pt-3 mb-3 max-w-[800px] mx-auto">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate({ to: "/discover/search" })}
            className="flex-1 relative text-left"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <div className="w-full h-12 bg-surface rounded-full pl-12 pr-4 flex items-center text-[16px] font-medium truncate">
              {topic}
            </div>
          </button>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto gap-2 px-4 no-scrollbar max-w-[800px] mx-auto">
          <button
            onClick={() => setFiltersOpen(true)}
            className="shrink-0 w-9 h-9 rounded-full bg-surface border border-hairline flex items-center justify-center"
            aria-label="Filters"
          >
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
          </button>
          {REFINEMENTS.map((f) => {
            const active = activeFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(active ? null : f)}
                className={`whitespace-nowrap px-4 h-9 rounded-full text-sm font-bold transition-colors shrink-0 ${
                  active ? "bg-foreground text-background" : "bg-surface text-foreground hover:bg-foreground/10"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result count */}
      <div className="px-4 pt-3 pb-1 max-w-[1000px] mx-auto">
        <p className="text-[12px] font-semibold text-muted-foreground">{results.length} results for "{topic}"</p>
      </div>

      {/* Masonry Grid */}
      <div className="px-3 py-3 max-w-[1000px] mx-auto pb-[calc(var(--bottom-nav-height)+2rem)]">
        <div style={{ columns: "2 160px", columnGap: "12px" }}>
          {results.map((item) => (
            <div key={item.id} className="mb-3 break-inside-avoid">
              <Link to="/discover/pin/$id" params={{ id: item.id }} className="block group relative">
                <div
                  className="w-full rounded-2xl overflow-hidden bg-surface relative"
                  style={{ aspectRatio: 1 / item.aspect }}
                >
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">Save</span>
                  </div>
                </div>
                <div className="flex items-start justify-between mt-1.5 px-1">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-[13px] leading-tight line-clamp-2">{item.title}</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); setSheetItem(item); setSheetOpen(true); }}
                    className="p-1 -mr-1 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Filters bottom sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-[101] pb-safe max-h-[80vh] flex flex-col"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-2" />
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-bold text-[17px]">Refine your search</h3>
                <button onClick={() => setFiltersOpen(false)} className="p-1 text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-5 pb-6 flex flex-wrap gap-2 overflow-y-auto">
                {REFINEMENTS.map((f) => {
                  const active = activeFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(active ? null : f)}
                      className={`px-4 h-10 rounded-full text-sm font-bold border transition-colors ${
                        active ? "bg-foreground text-background border-foreground" : "bg-surface text-foreground border-hairline"
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
              <div className="px-5 pb-6 flex gap-3">
                <button
                  onClick={() => { setActiveFilter(null); setFiltersOpen(false); }}
                  className="flex-1 py-3 rounded-xl font-bold text-[15px] bg-surface"
                >
                  Clear
                </button>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-[15px] bg-foreground text-background"
                >
                  Show {results.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Action Sheet */}
      <AnimatePresence>
        {sheetOpen && sheetItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-surface rounded-t-3xl z-[101] flex flex-col pb-safe pb-4"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-4" />
              <div className="px-4 mb-2">
                <h3 className="font-bold text-[15px] mb-4 text-center truncate">Options for {sheetItem.title}</h3>
                <div className="space-y-2">
                  <button onClick={() => setSheetOpen(false)} className="w-full text-left px-4 py-3 bg-background rounded-xl font-medium">Hide Pin</button>
                  <button onClick={() => setSheetOpen(false)} className="w-full text-left px-4 py-3 bg-background rounded-xl font-medium text-red-500">Report Pin</button>
                  <button onClick={() => setSheetOpen(false)} className="w-full text-left px-4 py-3 bg-background rounded-xl font-medium">Download Image</button>
                </div>
              </div>
              <div className="px-4 mt-2">
                <button onClick={() => setSheetOpen(false)} className="w-full py-4 bg-muted rounded-xl font-bold text-[15px]">Cancel</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
