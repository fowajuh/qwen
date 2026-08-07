import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { Search, Bell } from "lucide-react";

export const Route = createFileRoute("/discover/")(
  {
  head: () => ({
    meta: [
      { title: "Discover — Nexa" },
      { name: "description", content: "Discover ideas, inspiration, and local gems." },
    ],
  }),
  component: DiscoverPage,
});

/* ─────────────────────────── DATA ─────────────────────────── */
export interface Pin {
  id: string;
  image: string;
  title: string;
  author: string;
  authorAvatar: string;
  authorFollowers?: string;
  aspect: number; // height / width ratio (so > 1 = tall portrait)
  tag?: string;
  category: string;
  saves: number;
  comments?: number;
  trending?: boolean;
  price?: string;
  priceUnit?: string;
  description?: string;
}

export const DISCOVER_FEED: Pin[] = [
  { id: "p1",  image: "https://images.unsplash.com/photo-1558171813-6e9e26a8e41e?q=80&w=600&auto=format&fit=crop", title: "Automne doux", author: "Marie L.", authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", authorFollowers: "8.2k", aspect: 1.45, saves: 2847, comments: 12, trending: true, category: "Interior", description: "Warm autumn tones layered with soft textiles for a cozy season transition." },
  { id: "p2",  image: "https://images.unsplash.com/photo-1490750967868-88df5691cc0f?q=80&w=600&auto=format&fit=crop", title: "Bouquet pastels", author: "Studio Fleur", authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", authorFollowers: "3.1k", aspect: 0.85, saves: 1204, comments: 4, category: "Food", description: "A hand-tied pastel bouquet, perfect for spring tablescapes." },
  { id: "p3",  image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=600&auto=format&fit=crop", title: "Casual minimal fit", author: "Alex Creates", authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", authorFollowers: "24.5k", aspect: 1.6, saves: 4412, comments: 38, trending: true, tag: "Style", category: "Style", price: "£49.00", priceUnit: "item", description: "Relaxed silhouette layering — oversized hoodie, straight denim, low-top sneakers." },
  { id: "p4",  image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop", title: "Vintage fits", author: "Karim V.", authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", authorFollowers: "6.7k", aspect: 1.2, saves: 892, comments: 6, category: "Style" },
  { id: "p5",  image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop", title: "Trench coat era", author: "Lena M.", authorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80", authorFollowers: "11.3k", aspect: 0.75, saves: 3301, comments: 21, category: "Style" },
  { id: "p6",  image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=600&auto=format&fit=crop", title: "App UI design", author: "Sheblov Design", authorAvatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80", authorFollowers: "51.2k", aspect: 1.8, saves: 6721, comments: 54, trending: true, tag: "Design", category: "Design" },
  { id: "p7",  image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=600&auto=format&fit=crop", title: "Morning table", author: "Home Edit", authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", authorFollowers: "9.4k", aspect: 1.1, saves: 743, comments: 3, category: "Food" },
  { id: "p8",  image: "https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=600&auto=format&fit=crop", title: "Fitness grind", author: "Coach Ayo", authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", authorFollowers: "14.8k", aspect: 1.35, saves: 2210, comments: 15, category: "Fitness" },
  { id: "p9",  image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=600&auto=format&fit=crop", title: "Street style Seoul", author: "JiHo K.", authorAvatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80", authorFollowers: "32.9k", aspect: 1.55, saves: 5102, comments: 47, trending: true, category: "Style" },
  { id: "p10", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop", title: "Dashboard concept", author: "UI Studio", authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80", authorFollowers: "18.6k", aspect: 0.65, saves: 3890, comments: 29, tag: "Tech", category: "Tech" },
  { id: "p11", image: "https://images.unsplash.com/photo-1543357480-c60d40007a3f?q=80&w=600&auto=format&fit=crop", title: "Biggy pants", author: "Threads", authorAvatar: "https://images.unsplash.com/photo-1546961342-ea5f60b193cb?w=100&q=80", authorFollowers: "5.5k", aspect: 1.4, saves: 1122, comments: 9, category: "Style" },
  { id: "p12", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop", title: "How to roll your sleeves", author: "Style Tips", authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", authorFollowers: "7.8k", aspect: 1.9, saves: 789, comments: 5, tag: "Tutorial", category: "Style" },
  { id: "p13", image: "https://images.unsplash.com/photo-1579869847557-1f67382cc158?q=80&w=600&auto=format&fit=crop", title: "Aura store concept", author: "Sheblov Design", authorAvatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&q=80", authorFollowers: "51.2k", aspect: 0.7, saves: 4580, comments: 33, trending: true, category: "Design" },
  { id: "p14", image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=600&auto=format&fit=crop", title: "Garden brunch", author: "La Maison", authorAvatar: "https://images.unsplash.com/photo-1546961342-ea5f60b193cb?w=100&q=80", authorFollowers: "4.2k", aspect: 1.25, saves: 2045, comments: 11, category: "Food" },
  { id: "p15", image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&auto=format&fit=crop", title: "Cozy interior", author: "Archi Lab", authorAvatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&q=80", authorFollowers: "16.1k", aspect: 1.5, saves: 3312, comments: 19, category: "Interior" },
  { id: "p16", image: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?q=80&w=600&auto=format&fit=crop", title: "Nail art inspo", author: "LUX Nails", authorAvatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80", authorFollowers: "22.3k", aspect: 1.0, saves: 931, comments: 7, category: "Style" },
];

export const CATEGORIES = ["All", "Today", "Style", "Design", "Food", "Interior", "Tech", "Fitness"];

/* ─────────────────────────── MASONRY COLUMN ─────────────────────────── */
function MasonryFeed({ pins }: { pins: Pin[] }) {
  const col0 = pins.filter((_, i) => i % 2 === 0);
  const col1 = pins.filter((_, i) => i % 2 === 1);

  return (
    <div className="flex gap-3 px-3">
      <div className="flex flex-col gap-3 flex-1">
        {col0.map((pin, i) => (
          <PinCard key={pin.id} pin={pin} delay={i * 0.04} />
        ))}
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {col1.map((pin, i) => (
          <PinCard key={pin.id} pin={pin} delay={i * 0.04 + 0.02} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── PIN CARD ─────────────────────────── */
export function PinCard({ pin, delay = 0 }: { pin: Pin; delay?: number }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to="/discover/pin/$id" params={{ id: pin.id }} className="block group">
        {/* Image container with dynamic aspect ratio */}
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-surface"
          style={{ paddingBottom: `${pin.aspect * 100}%` }}
        >
          <img
            src={pin.image}
            alt={pin.title ?? ""}
            onLoad={() => setImgLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} group-hover:scale-105`}
          />
          {/* Hover overlay with Save button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-2xl" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => e.preventDefault()}
              className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              Save
            </button>
          </div>
          {/* Tag badge */}
          {pin.tag && (
            <div className="absolute top-2 left-2">
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                {pin.tag}
              </span>
            </div>
          )}
          {/* More options */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={(e) => e.preventDefault()} className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Below-image metadata */}
        {pin.title && (
          <div className="mt-2 px-0.5 pb-1">
            <p className="text-[13px] font-semibold text-foreground leading-snug line-clamp-2">{pin.title}</p>
            {pin.author && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <img src={pin.authorAvatar} alt={pin.author} className="w-5 h-5 rounded-full object-cover" />
                <span className="text-[11px] text-muted-foreground font-medium">{pin.author}</span>
              </div>
            )}
          </div>
        )}
      </Link>
    </motion.div>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("All");
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Filter pins by tab using a clean category match
  const filteredPins =
    activeTab === "All"
      ? DISCOVER_FEED
      : activeTab === "Today"
        ? DISCOVER_FEED.filter((p) => p.trending)
        : DISCOVER_FEED.filter((p) => p.category === activeTab);

  return (
    <div className="w-full min-h-screen bg-background pt-safe">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-hairline">
        <div className="flex items-center gap-3 px-4 py-3 md:max-w-[680px] md:mx-auto">
          {/* Profile avatar */}
          <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-foreground/10">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
              alt="Me"
              className="w-full h-full object-cover"
            />
          </Link>

          {/* Search bar */}
          <button
            onClick={() => navigate({ to: "/discover/search" })}
            className="flex-1 flex items-center gap-2 h-11 bg-surface rounded-full px-4 border border-hairline active:scale-[0.99] transition-transform"
          >
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[15px] text-muted-foreground font-medium">Search</span>
          </button>

          {/* Notification bell */}
          <button onClick={() => navigate({ to: "/notifications" })} className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0 border border-hairline relative">
            <Bell className="w-4.5 h-4.5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>

        {/* ── Filter Tabs ── */}
        <div
          ref={tabsRef}
          className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar md:max-w-[680px] md:mx-auto"
        >
          {CATEGORIES.map((tab) => {
            const active = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 h-9 rounded-full text-[13px] font-semibold transition-all duration-200 ${
                  active
                    ? "bg-foreground text-background"
                    : "bg-surface text-foreground/80 hover:bg-foreground/10"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Masonry Feed ── */}
      <div className="pb-[calc(var(--bottom-nav-height,80px)+1rem)] pt-3 md:max-w-[680px] md:mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {filteredPins.length ? (
              <MasonryFeed pins={filteredPins} />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="font-bold text-[15px]">Nothing here yet</p>
                <p className="text-[13px] text-muted-foreground mt-1">Try another category or check back soon.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
