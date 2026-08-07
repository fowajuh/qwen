import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Reveal } from "@/components/app-shell";
import {
  Search, MapPin, Star, Clock, SlidersHorizontal, Map as MapIcon,
  Grid3x3, ChevronDown, X, Zap, ArrowRight
} from "lucide-react";

export const Route = createFileRoute("/search/results")({
  head: () => ({
    meta: [
      { title: "Search Results — Nexa" },
      { name: "description", content: "AI-ranked results for your search. Find, compare, and book the best local businesses." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) ?? "",
    category: (search.category as string) ?? "All",
  }),
  component: SearchResults,
});

const ALL_RESULTS = [
  { slug: "kori", name: "Kori Hair Studio", tag: "Hair Salon", trust: 98, meta: "Available 2:30pm", dist: "0.3 mi", rating: 4.9, reviews: 412, aiReason: "Responds in 4 min · 1,412 jobs completed · 72% repeat clients", price: "$85+", img: "https://images.unsplash.com/photo-1521590832167-7bfc17454f51?q=80&w=400&auto=format&fit=crop" },
  { slug: "ostro", name: "Ostro Coffee Bar", tag: "Cafe", trust: 93, meta: "Open now", dist: "0.6 mi", rating: 4.8, reviews: 624, aiReason: "Small batch roasting · neighbourhood favourite · 5 min wait", price: "$5+", img: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=400&auto=format&fit=crop" },
  { slug: "north-fork", name: "North Fork Meats", tag: "Butcher", trust: 97, meta: "Closes 7pm", dist: "0.7 mi", rating: 4.9, reviews: 198, aiReason: "Dry-aged on-site · pasture-raised · custom cuts", price: "$12+", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=400&auto=format&fit=crop" },
  { slug: "atelier", name: "Atelier Fleur", tag: "Florist", trust: 95, meta: "Same-day delivery", dist: "1.3 mi", rating: 4.9, reviews: 341, aiReason: "Same-day cut-off 2pm · Hudson Valley sourced · 1,893 orders", price: "$45+", img: "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?q=80&w=400&auto=format&fit=crop" },
  { slug: "mira", name: "Mira Yoga", tag: "Wellness", trust: 92, meta: "4 spots left 6:30am", dist: "0.9 mi", rating: 4.8, reviews: 289, aiReason: "Intimate class · 81% rebook rate · rooftop access", price: "$22", img: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b?q=80&w=400&auto=format&fit=crop" },
  { slug: "halden", name: "Halden Dental", tag: "Dental", trust: 96, meta: "In-network · today", dist: "1.1 mi", rating: 4.9, reviews: 156, aiReason: "In-network insurance · same-day emergency · 23 years experience", price: "$0 exam", img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=400&auto=format&fit=crop" },
];

const SORT_OPTIONS = ["Best Match", "Highest Trust", "Nearest", "Price: Low", "Price: High"];
const CATEGORIES = ["All", "Beauty", "Food & Drink", "Wellness", "Home", "Medical", "Retail"];

function SearchResults() {
  const { q, category: initialCategory } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeSort, setActiveSort] = useState("Best Match");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [maxDist, setMaxDist] = useState(5);
  const [minTrust, setMinTrust] = useState(80);
  const [loading, setLoading] = useState(true);

  // Simulate AI search loading
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, [query, activeCategory]);

  const filtered = ALL_RESULTS.filter((r) => {
    if (activeCategory !== "All") {
      const catMap: Record<string, string[]> = {
        Beauty: ["Hair Salon", "Barbershop"],
        "Food & Drink": ["Cafe", "Restaurant", "Butcher"],
        Wellness: ["Wellness", "Fitness", "Spa"],
        Medical: ["Dental", "Health"],
        Retail: ["Florist", "Gifts"],
      };
      if (!catMap[activeCategory]?.includes(r.tag)) return false;
    }
    if (r.trust < minTrust) return false;
    if (parseFloat(r.dist) > maxDist) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-32">
      {/* ── STICKY SEARCH BAR ── */}
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-xl border-b border-hairline py-3 px-4 md:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface border border-hairline rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Describe what you need..."
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors ${showFilters ? "bg-primary text-white border-primary" : "border-hairline hover:border-foreground/30"}`}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
          <div className="hidden md:flex bg-surface-2 p-1 rounded-2xl">
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-xl transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-xl transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}>
              <Grid3x3 size={16} />
            </button>
          </div>
          <button
            onClick={() => setShowMap(!showMap)}
            className={`hidden md:flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition-colors ${showMap ? "bg-foreground text-background border-foreground" : "border-hairline hover:border-foreground/30"}`}
          >
            <MapIcon size={16} /> Map
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="max-w-[1440px] mx-auto overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-sm">
                  <label className="font-medium text-muted-foreground whitespace-nowrap">Min Trust:</label>
                  <input type="range" min="70" max="99" value={minTrust} onChange={(e) => setMinTrust(Number(e.target.value))} className="w-28 accent-primary" />
                  <span className="font-bold tabular-nums w-8">{minTrust}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label className="font-medium text-muted-foreground whitespace-nowrap">Max Distance:</label>
                  <input type="range" min="0.5" max="10" step="0.5" value={maxDist} onChange={(e) => setMaxDist(Number(e.target.value))} className="w-28 accent-primary" />
                  <span className="font-bold tabular-nums w-12">{maxDist} mi</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <label className="font-medium text-muted-foreground">Sort:</label>
                  <div className="flex gap-1">
                    {SORT_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => setActiveSort(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${activeSort === s ? "bg-foreground text-background" : "bg-surface hover:bg-surface-2"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 pt-6">
        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-foreground text-background scale-105"
                  : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Header row */}
        <div className="flex justify-between items-center mb-5">
          <div className="text-sm text-muted-foreground">
            {loading ? "Searching..." : <><span className="font-bold text-foreground">{filtered.length}</span> results{query ? ` for "${query}"` : ""}</>}
          </div>
          {q && (
            <div className="flex items-center gap-2 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold">
              <Zap size={12} /> AI-ranked by trust, distance & availability
            </div>
          )}
        </div>

        {/* ── RESULTS ── */}
        <div className={`${viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}`}>
          <AnimatePresence>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`surface-card animate-pulse ${viewMode === "list" ? "flex gap-4 p-5 h-28" : "h-64"}`}
                >
                  <div className={`bg-foreground/5 rounded-xl ${viewMode === "list" ? "w-20 h-20 shrink-0" : "w-full h-40 mb-4"}`} />
                  {viewMode === "list" && (
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-foreground/5 rounded w-1/2" />
                      <div className="h-3 bg-foreground/5 rounded w-1/3" />
                      <div className="h-3 bg-foreground/5 rounded w-2/3" />
                    </div>
                  )}
                </motion.div>
              ))
            ) : filtered.map((result, i) => (
              <Reveal key={result.slug} delay={i * 0.06}>
                <Link to="/business/$slug" params={{ slug: result.slug }}>
                  {viewMode === "list" ? (
                    <div className="surface-card flex gap-4 md:gap-6 p-4 md:p-5 group hover:border-foreground/20 hover:shadow-lift transition-all cursor-pointer overflow-hidden">
                      <div className="w-20 md:w-28 h-20 md:h-28 rounded-xl overflow-hidden shrink-0">
                        <img src={result.img} alt={result.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="min-w-0">
                            <div className="font-display text-lg md:text-xl font-semibold truncate">{result.name}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                              <span className="bg-foreground/5 px-2 py-0.5 rounded-full font-medium">{result.tag}</span>
                              <span className="flex items-center gap-1"><MapPin size={11} />{result.dist}</span>
                              <span className="flex items-center gap-1"><Star size={11} className="fill-amber-400 text-amber-400" />{result.rating} ({result.reviews})</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="font-display text-2xl font-bold text-primary">{result.trust}</div>
                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trust</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground bg-foreground/[0.03] rounded-lg px-3 py-2 leading-relaxed flex items-center gap-2">
                          <Zap size={11} className="text-primary shrink-0" /> {result.aiReason}
                        </div>
                        <div className="mt-2 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1 text-green-600 font-semibold"><Clock size={11} />{result.meta}</span>
                            <span className="font-semibold">{result.price}</span>
                          </div>
                          <button className="text-primary text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Book now <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="surface-card group hover:border-foreground/20 hover:shadow-lift transition-all cursor-pointer overflow-hidden">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={result.img} alt={result.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-semibold text-sm">{result.name}</div>
                          <div className="font-display text-lg font-bold text-primary">{result.trust}</div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <span>{result.tag}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1"><MapPin size={10} />{result.dist}</span>
                          <span>·</span>
                          <span>{result.price}</span>
                        </div>
                        <div className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
                          <Clock size={10} /> {result.meta}
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-display text-2xl font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your filters or search for something else.</p>
            <button onClick={() => { setActiveCategory("All"); setMinTrust(80); setMaxDist(5); }} className="text-primary font-semibold hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
