import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, Mic, Camera, X, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/search")({
  component: DiscoverSearch,
});

/* ─────────────────────────── DATA ─────────────────────────── */
const INITIAL_RECENTS = ["clothing mockup", "plane logo", "plan logo", "premuim app fonts", "billion dollar app fonts", "app ui design"];

const TRENDING_SUGGESTIONS = [
  "dapper men outfits", "pinterest ui ux design", "apple ui", "notion ui", "uber ui",
];

// Editorial hero slides — matches the full-bleed banner carousel with dot indicators
const HERO_SLIDES = [
  { id: "h1", title: "Effet cinéma", subtitle: "Idées de projecteurs pour chaque espace", image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=900&auto=format&fit=crop", to: "Interior" },
  { id: "h2", title: "Palette d'automne", subtitle: "Des looks chauds pour la saison", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop", to: "Style" },
  { id: "h3", title: "Studio minimal", subtitle: "Concepts UI épurés pour vos apps", image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=900&auto=format&fit=crop", to: "Design" },
];

// Collage-style "Ideas for you" rows — each with a 4-photo grid teaser like Pinterest's explore shelves
interface IdeaShelf { id: string; title: string; images: string[]; topic: string }
const IDEA_SHELVES: IdeaShelf[] = [
  {
    id: "s1",
    title: "Streetwear men outfits",
    topic: "Style",
    images: [
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=300&auto=format&fit=crop",
    ],
  },
  {
    id: "s2",
    title: "Clothing mockup",
    topic: "Design",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=300&auto=format&fit=crop",
    ],
  },
  {
    id: "s3",
    title: "App UI design",
    topic: "Tech",
    images: [
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=300&auto=format&fit=crop",
    ],
  },
  {
    id: "s4",
    title: "Web design",
    topic: "Design",
    images: [
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1559028006-448665bd7c7f?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581276879432-15e50529f34b?q=80&w=300&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=300&auto=format&fit=crop",
    ],
  },
];

/* ─────────────────────────── HERO CAROUSEL ─────────────────────────── */
function HeroCarousel() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden">
      <AnimatePresence mode="sync">
        {HERO_SLIDES.map((slide, i) =>
          i === active ? (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />
              <div className="absolute inset-x-0 bottom-6 px-5 text-center text-white">
                <p className="text-[13px] font-semibold tracking-wide opacity-90 mb-1">{slide.title}</p>
                <p className="text-[20px] font-bold leading-snug drop-shadow-sm max-w-[280px] mx-auto">{slide.subtitle}</p>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* dot indicators */}
      <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-1.5">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── IDEA SHELF (collage row) ─────────────────────────── */
function IdeaShelfRow({ shelf }: { shelf: IdeaShelf }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate({ to: "/discover/category", search: { topic: shelf.topic } })}
      className="w-full text-left"
    >
      <div className="flex items-center justify-between mb-2 px-4">
        <div>
          <p className="text-[11px] text-muted-foreground font-semibold">Ideas for you</p>
          <h3 className="text-[17px] font-bold leading-tight">{shelf.title}</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
      </div>
      <div className="flex gap-1 px-4">
        {shelf.images.map((src, i) => (
          <div
            key={i}
            className={`overflow-hidden bg-surface shrink-0 ${
              i === 0 ? "w-[38%] aspect-[3/4] rounded-l-2xl" : i === shelf.images.length - 1 ? "w-[22%] aspect-[3/4] rounded-r-2xl" : "w-[22%] aspect-[3/4]"
            }`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </button>
  );
}

/* ─────────────────────────── SUGGESTION ROW (native-style) ─────────────────────────── */
function SuggestionRow({ text, onSelect, onRemove }: { text: string; onSelect: () => void; onRemove?: () => void }) {
  return (
    <button onClick={onSelect} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface transition-colors">
      <Search className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
      <span className="flex-1 text-left text-[15px] font-semibold text-foreground truncate">{text}</span>
      {onRemove && (
        <span
          role="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 text-muted-foreground/70 hover:text-foreground shrink-0"
        >
          <X className="w-4 h-4" />
        </span>
      )}
    </button>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
export default function DiscoverSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState(INITIAL_RECENTS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecents((r) => [trimmed, ...r.filter((x) => x.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8));
    navigate({ to: "/discover/category", search: { topic: trimmed } });
  };

  // Live suggestions while typing — native-style dropdown (image 1 reference)
  const liveSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const fromRecents = recents.filter((r) => r.toLowerCase().includes(q));
    const fromTrending = TRENDING_SUGGESTIONS.filter((t) => t.toLowerCase().includes(q));
    const fromPins = DISCOVER_FEED.map((p) => p.title).filter((t) => t.toLowerCase().includes(q));
    return Array.from(new Set([...fromRecents, ...fromTrending, ...fromPins])).slice(0, 8);
  }, [query, recents]);

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      {/* Search Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md pt-safe border-b border-hairline">
        <div className="flex items-center gap-2 px-4 py-3 md:max-w-[640px] md:mx-auto">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-surface rounded-full px-4 py-2.5 border border-hairline focus-within:ring-2 focus-within:ring-primary/40 transition-shadow">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(query); }}
              placeholder="Search for ideas"
              className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button onClick={() => setQuery("")} className="shrink-0">
                <div className="w-5 h-5 rounded-full bg-muted-foreground/40 flex items-center justify-center">
                  <X className="w-3 h-3 text-background" strokeWidth={3} />
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Mic className="w-5 h-5" /></button>
                <button className="p-1 text-muted-foreground hover:text-foreground transition-colors"><Camera className="w-5 h-5" /></button>
              </div>
            )}
          </div>
          {query && (
            <button onClick={() => runSearch(query)} className="shrink-0 text-[14px] font-bold text-primary px-1">
              Go
            </button>
          )}
        </div>
      </div>

      {/* ── Live suggestion dropdown while typing ── */}
      {query ? (
        <div className="py-1 md:max-w-[640px] md:mx-auto">
          {liveSuggestions.length > 0 ? (
            liveSuggestions.map((s, i) => (
              <SuggestionRow key={i} text={s} onSelect={() => runSearch(s)} />
            ))
          ) : (
            <div className="px-4 py-3">
              <SuggestionRow text={query} onSelect={() => runSearch(query)} />
            </div>
          )}
        </div>
      ) : (
        <div className="pb-8 md:max-w-[640px] md:mx-auto">
          {/* Hero editorial carousel */}
          <HeroCarousel />

          {/* Recent searches — native suggestion-list style */}
          {recents.length > 0 && (
            <div className="pt-2 pb-2 border-b border-hairline">
              <div className="flex items-center justify-between px-4 py-2">
                <h2 className="font-bold text-[15px] text-foreground">Recent searches</h2>
                <button onClick={() => setRecents([])} className="text-[13px] font-semibold text-primary">Clear all</button>
              </div>
              {recents.map((s, i) => (
                <SuggestionRow
                  key={i}
                  text={s}
                  onSelect={() => runSearch(s)}
                  onRemove={() => setRecents((r) => r.filter((_, idx) => idx !== i))}
                />
              ))}
            </div>
          )}

          {/* Ideas for you shelves */}
          <div className="pt-5 space-y-6">
            {IDEA_SHELVES.map((shelf) => (
              <IdeaShelfRow key={shelf.id} shelf={shelf} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
