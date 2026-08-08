import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { Search, Bell, MapPin, Loader2, Sparkles } from "lucide-react";
import { useScoutData, formatDistance } from "@/hooks/use-scout-data";
import { PremiumIllustration, EmotionalIllustrations } from "@/components/ui/premium-illustration";

export const Route = createFileRoute("/discover/")({
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
  aspect: number;
  tag?: string;
  category: string;
  saves: number;
  comments?: number;
  trending?: boolean;
  price?: string;
  priceUnit?: string;
  description?: string;
}

interface BusinessPin extends Pin {
  businessId?: string;
  rating?: number;
  reviewCount?: number;
  distance?: string;
  isVerified?: boolean;
}

const MOCK_PINS: Pin[] = []; // Empty - we'll use real data only

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
      <Link to={pin.businessId ? `/business/${pin.businessId}` : "/discover/pin/$id"} params={{ id: pin.id }} className="block group">
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
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 rounded-2xl" />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => e.preventDefault()}
              className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform"
            >
              Save
            </button>
          </div>
          {pin.tag && (
            <div className="absolute top-2 left-2">
              <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                {pin.tag}
              </span>
            </div>
          )}
          {pin.isVerified && (
            <div className="absolute top-2 right-2">
              <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                ✓ Verified
              </span>
            </div>
          )}
          {pin.rating && (
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              ★ {pin.rating}
              {pin.reviewCount !== undefined && ` (${pin.reviewCount})`}
            </div>
          )}
          {pin.distance && (
            <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full">
              {pin.distance}
            </div>
          )}
        </div>
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
  
  const { businesses, isLoading, error, hasValidLocation } = useScoutData({
    autoScan: true,
    radiusKm: 10,
    enabled: true,
  });
  
  const businessPins: BusinessPin[] = businesses.map((biz, idx) => ({
    id: biz.id,
    businessId: biz.id,
    image: biz.images?.[0] || biz.logo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600",
    title: biz.name,
    author: biz.city,
    authorAvatar: biz.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(biz.name)}&background=random`,
    aspect: 1.2 + (idx % 3) * 0.3,
    tag: biz.category,
    category: mapCategoryToDiscover(biz.category),
    saves: Math.floor(biz.review_count * 1.5),
    comments: Math.floor(biz.review_count * 0.2),
    trending: biz.rating >= 4.5,
    rating: biz.rating,
    reviewCount: biz.review_count,
    distance: biz.distance_km ? formatDistance(biz.distance_km) : undefined,
    isVerified: biz.is_verified,
    description: biz.description || `${biz.rating}★ (${biz.review_count} reviews)`,
  }));
  
  const allPins = businessPins.length > 0 ? businessPins : MOCK_PINS;

  const filteredPins =
    activeTab === "All"
      ? allPins
      : activeTab === "Today"
        ? allPins.filter((p) => p.trending)
        : allPins.filter((p) => p.category === activeTab);

  return (
    <div className="w-full min-h-screen bg-background pt-safe">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-hairline">
        <div className="flex items-center gap-3 px-4 py-3 md:max-w-[680px] md:mx-auto">
          <Link to="/profile" className="w-9 h-9 rounded-full overflow-hidden shrink-0 ring-2 ring-foreground/10">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
              alt="Me"
              className="w-full h-full object-cover"
            />
          </Link>

          <button
            onClick={() => navigate({ to: "/discover/search" })}
            className="flex-1 flex items-center gap-2 h-11 bg-surface rounded-full px-4 border border-hairline active:scale-[0.99] transition-transform"
          >
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[15px] text-muted-foreground font-medium">Search</span>
          </button>

          <button onClick={() => navigate({ to: "/notifications" })} className="w-9 h-9 rounded-full bg-surface flex items-center justify-center shrink-0 border border-hairline relative">
            <Bell className="w-4.5 h-4.5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>

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

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-black/95 backdrop-blur-xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="consumer-journey" 
              size="xl" 
              animate={true}
              alt="Discovering amazing places"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <Loader2 className="w-10 h-10 text-white/80 animate-spin mb-4" />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white font-semibold text-lg"
          >
            Discovering nearby gems...
          </motion.p>
        </div>
      )}

      {error && !hasValidLocation && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-black/95 backdrop-blur-xl p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="location" 
              size="xl" 
              animate={true}
              alt="Enable location access"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white mb-2"
          >
            Location Access Needed
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-white/70 mb-6 max-w-xs"
          >
            Enable location to discover amazing businesses and experiences near you
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-indigo-900 rounded-full font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            Enable Location
          </motion.button>
        </div>
      )}

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
            ) : !isLoading ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-24 px-8 text-center"
              >
                <div className="mb-6">
                  <PremiumIllustration 
                    name="interests" 
                    size="lg" 
                    animate={true}
                    alt="No results found"
                    className="shadow-[0_20px_60px_rgba(99,102,241,0.2)]"
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <p className="font-bold text-[15px] text-foreground">Nothing here yet</p>
                </div>
                <p className="text-[13px] text-muted-foreground mt-1">Try another category or check back soon for new discoveries.</p>
              </motion.div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function mapCategoryToDiscover(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe')) return 'Food';
  if (lower.includes('style') || lower.includes('fashion') || lower.includes('clothing')) return 'Style';
  if (lower.includes('design') || lower.includes('art') || lower.includes('studio')) return 'Design';
  if (lower.includes('interior') || lower.includes('home') || lower.includes('furniture')) return 'Interior';
  if (lower.includes('tech') || lower.includes('electronics') || lower.includes('digital')) return 'Tech';
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('health')) return 'Fitness';
  return 'Today';
}
