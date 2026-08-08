// ============================================================
//  app/routes/housing.tsx
//  BILLION-DOLLAR PRODUCTION SCAFFOLD
//  Single-file, full-stack housing domain for TanStack Router
//  Routes: /housing          → List + Map (with loaders)
//  Route:  /housing/$id      → Detail (wire into housing.$id.tsx)
//  Stack:  React 19, TanStack Router, Framer Motion, Tailwind CSS
// ============================================================

import { cn } from "@/lib/utils";

import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouter,
  useRouterState,
  useSearch,
  useParams,
  type RegisteredRouter,
} from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useSpring,
  type PanInfo,
  type MotionValue,
} from "motion/react";
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useReducer,
  type ReactNode,
  type RefObject,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  Search,
  Sliders,
  Heart,
  Star,
  MapPin,
  Building2,
  BedDouble,
  Sparkles,
  PawPrint,
  Gem,
  Palette,
  LayoutGrid,
  ChevronLeft,
  Share,
  X,
  Plus,
  Minus,
  Check,
  Wifi,
  Car,
  Snowflake,
  Waves,
  Dumbbell,
  WashingMachine,
  Wind,
  DoorOpen,
  Key,
  Calendar,
  Shield,
  Award,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Home,
  Coffee,
  Clock,
  Ban,
  Cigarette,
  PartyPopper,
  VolumeX,
  Shirt,
  Dog,
  TreePine,
  UtensilsCrossed,
  Tv,
  Bath,
  Flame,
  Sun,
  Umbrella,
  Lock,
  Bell,
  Monitor,
  Briefcase,
  Map as MapIcon,
  List,
  RotateCcw,
  AlertTriangle,
  ThumbsUp,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Loader2,
  Eye,
  EyeOff,
  Filter,
} from "lucide-react";

import {
  HousingListing,
  HousingSearch,
  Review,
  Amenity,
  HOUSING_DATA,
  api
} from '@/lib/housing-data';
import {
  usePrevious,
  useMediaQuery,
  useScrollPosition,
  useReducedMotion,
  useToast,
  ToastContext,
  useToastContext,
  useSavedListings
} from '@/hooks/use-housing-utils';
import { Skeleton, Button, ToastContainer } from '@/components/housing/primitives';
import { SearchModal } from '@/components/housing/search-modal';
import { FilterModal } from '@/components/housing/filter-modal';
import { ImageGallery } from '@/components/housing/image-gallery';
import { MapView } from '@/components/housing/map-view';
import { BottomSheet } from '@/components/housing/bottom-sheet';
import { HousingCard, SkeletonCard } from '@/components/housing/housing-card';




export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"where" | "when" | "who">("where");
  const [location, setLocation] = useState("");
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("nexa_recent_searches", []);
  const [guests, setGuests] = useState({ adults: 1, children: 0, infants: 0, pets: 0 });
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as HousingSearch;
  const debouncedLocation = useDebounce(location, 200);

  // Pre-fill from URL
  useEffect(() => {
    if (open && search.query) setLocation(search.query);
  }, [open, search.query]);

  const apply = () => {
    const params: Record<string, unknown> = {};
    if (location) {
      params.query = location;
      if (!recentSearches.includes(location)) {
        setRecentSearches((prev) => [location, ...prev].slice(0, 5));
      }
    }
    const total = guests.adults + guests.children;
    if (total > 1) params.guests = total;
    navigate({ to: "/housing/search", search: params });
    onClose();
  };

  const suggestions = useMemo(() => {
    if (!debouncedLocation) return [];
    const q = debouncedLocation.toLowerCase();
    return HOUSING_DATA.filter(
      (h) => h.city.toLowerCase().includes(q) || h.country.toLowerCase().includes(q)
    )
      .map((h) => `${h.city}, ${h.country}`)
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);
  }, [debouncedLocation]);

  return (
    <Modal open={open} onClose={onClose} className="max-w-[720px]" title="Search">
      <div className="p-6 pt-2">
        <div className="flex gap-2 mb-6 bg-surface p-1 rounded-full">
          {(["where", "when", "who"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-full transition-colors",
                tab === t ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "where" ? "Where" : t === "when" ? "When" : "Who"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[280px]"
          >
            {tab === "where" && (
              <div className="space-y-4">
                <label className="text-sm font-medium">Where to?</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Search destinations"
                    className="w-full pl-12 pr-4 py-4 bg-surface rounded-xl border border-hairline text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>

                {suggestions.length > 0 && (
                  <div className="border border-hairline rounded-xl overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => setLocation(s)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface text-left transition-colors border-b border-hairline last:border-0"
                      >
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{s}</span>
                      </button>
                    ))}
                  </div>
                )}

                {recentSearches.length > 0 && !location && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">Recent</span>
                      <button onClick={() => setRecentSearches([])} className="text-xs underline">
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => setLocation(s)}
                          className="px-3 py-1.5 rounded-full bg-surface text-sm border border-hairline hover:border-foreground transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!location && (
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase mb-3 block">Popular</span>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { city: "Paris", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=200&auto=format&fit=crop" },
                        { city: "London", img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=200&auto=format&fit=crop" },
                        { city: "New York", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=200&auto=format&fit=crop" },
                        { city: "Tokyo", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200&auto=format&fit=crop" },
                      ].map((c) => (
                        <button
                          key={c.city}
                          onClick={() => setLocation(c.city)}
                          className="relative h-24 rounded-xl overflow-hidden group"
                        >
                          <img src={c.img} alt={c.city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/30" />
                          <span className="absolute bottom-2 left-2 text-white font-semibold text-sm">{c.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "when" && (
              <div className="space-y-4">
                <label className="text-sm font-medium">When is your trip?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 rounded-xl border border-hairline hover:border-foreground/30 transition-colors text-left">
                    <div className="text-xs text-muted-foreground mb-1">Check in</div>
                    <div className="font-medium">Add date</div>
                  </button>
                  <button className="p-4 rounded-xl border border-hairline hover:border-foreground/30 transition-colors text-left">
                    <div className="text-xs text-muted-foreground mb-1">Check out</div>
                    <div className="font-medium">Add date</div>
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {["Flexible", "Weekend", "Week", "Month"].map((f) => (
                    <button key={f} className="px-4 py-2 rounded-full border border-hairline text-sm whitespace-nowrap hover:bg-surface transition-colors">
                      {f}
                    </button>
                  ))}
                </div>
                {/* Mock calendar grid */}
                <div className="border border-hairline rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <ChevronLeft className="w-4 h-4" />
                    <span className="font-medium">July 2026</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => (
                      <button
                        key={i}
                        className={cn(
                          "aspect-square rounded-full text-sm flex items-center justify-center hover:bg-surface transition-colors",
                          i === 14 && "bg-foreground text-background"
                        )}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "who" && (
              <div className="space-y-5">
                {[
                  { key: "adults", label: "Adults", sub: "Ages 13+" },
                  { key: "children", label: "Children", sub: "Ages 2–12" },
                  { key: "infants", label: "Infants", sub: "Under 2" },
                  { key: "pets", label: "Pets", sub: "Bringing a service animal?" },
                ].map(({ key, label, sub }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted-foreground">{sub}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests((g) => ({ ...g, [key]: Math.max(0, (g as any)[key] - 1) }))}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface disabled:opacity-30 transition-colors"
                        disabled={(guests as any)[key] === 0}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{(guests as any)[key]}</span>
                      <button
                        onClick={() => setGuests((g) => ({ ...g, [key]: (g as any)[key] + 1 }))}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center hover:bg-surface transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-hairline flex justify-between items-center">
          <button onClick={() => { setLocation(""); setGuests({ adults: 1, children: 0, infants: 0, pets: 0 }); }} className="text-sm font-medium underline">
            Clear all
          </button>
          <Button onClick={apply} variant="secondary">
            <Search className="w-4 h-4" />
            Search
          </Button>
        </div>
      </div>
    </Modal>
  );
}

