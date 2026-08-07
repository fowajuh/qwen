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




export function FilterModal({
  open,
  onClose,
  value,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  value: Required<Pick<HousingSearch, "minPrice" | "maxPrice" | "instantBook" | "superhost" | "amenities">>;
  onApply: (f: typeof value) => void;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => {
    if (open) setLocal(value);
  }, [open, value]);

  const toggleAmenity = (a: string) => {
    setLocal((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a) ? prev.amenities.filter((x) => x !== a) : [...prev.amenities, a],
    }));
  };

  const prices = useMemo(() => HOUSING_DATA.map((h) => h.price), []);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);

  // Simple histogram buckets
  const buckets = useMemo(() => {
    const count = 10;
    const step = (maxP - minP) / count;
    const bins = Array(count).fill(0);
    prices.forEach((p) => {
      const idx = Math.min(Math.floor((p - minP) / step), count - 1);
      bins[idx]++;
    });
    const maxBin = Math.max(...bins);
    return bins.map((b) => (b / maxBin) * 100);
  }, [prices, minP, maxP]);

  const activeCount = (local.instantBook ? 1 : 0) + (local.superhost ? 1 : 0) + local.amenities.length + (local.minPrice > minP || local.maxPrice < maxP ? 1 : 0);

  return (
    <Modal open={open} onClose={onClose} className="max-w-[640px]" title="Filters">
      <div className="p-6 pt-2 space-y-8 max-h-[60vh] overflow-y-auto pr-2">
        {/* Price */}
        <div>
          <h3 className="font-semibold mb-1">Price range</h3>
          <p className="text-sm text-muted-foreground mb-4">Nightly prices including fees and taxes</p>

          {/* Histogram */}
          <div className="flex items-end gap-1 h-16 mb-4 px-2">
            {buckets.map((h, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm transition-colors",
                  local.minPrice <= minP + (i * (maxP - minP)) / 10 && local.maxPrice >= minP + ((i + 1) * (maxP - minP)) / 10
                    ? "bg-foreground"
                    : "bg-muted"
                )}
                style={{ height: `${Math.max(h, 8)}%` }}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Minimum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={local.minPrice}
                  onChange={(e) => setLocal((l) => ({ ...l, minPrice: Number(e.target.value) }))}
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Maximum</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={local.maxPrice}
                  onChange={(e) => setLocal((l) => ({ ...l, maxPrice: Number(e.target.value) }))}
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-hairline bg-surface focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Booking options */}
        <div>
          <h3 className="font-semibold mb-4">Booking options</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  <Key className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Self check-in</div>
                  <div className="text-sm text-muted-foreground">Easy access to the property</div>
                </div>
              </div>
              <button
                onClick={() => setLocal((l) => ({ ...l, instantBook: !l.instantBook }))}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative",
                  local.instantBook ? "bg-foreground" : "bg-muted"
                )}
                aria-pressed={local.instantBook}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-background rounded-full shadow-sm"
                  animate={{ x: local.instantBook ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">Superhost</div>
                  <div className="text-sm text-muted-foreground">Stay with recognized hosts</div>
                </div>
              </div>
              <button
                onClick={() => setLocal((l) => ({ ...l, superhost: !l.superhost }))}
                className={cn(
                  "w-12 h-7 rounded-full transition-colors relative",
                  local.superhost ? "bg-foreground" : "bg-muted"
                )}
                aria-pressed={local.superhost}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-6 h-6 bg-background rounded-full shadow-sm"
                  animate={{ x: local.superhost ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="font-semibold mb-4">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {["Wifi", "Kitchen", "Washer", "Dryer", "AC", "Heating", "Pool", "Gym", "Parking"].map((a) => (
              <button
                key={a}
                onClick={() => toggleAmenity(a)}
                className={cn(
                  "px-4 py-2.5 rounded-full border text-sm font-medium transition-colors",
                  local.amenities.includes(a)
                    ? "bg-foreground text-background border-foreground"
                    : "border-hairline hover:border-foreground"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 pt-4 border-t border-hairline flex justify-between items-center bg-background rounded-b-2xl">
        <button
          onClick={() => setLocal({ minPrice: minP, maxPrice: maxP, instantBook: false, superhost: false, amenities: [] })}
          className="text-sm font-medium underline"
        >
          Clear all
        </button>
        <Button onClick={() => { onApply(local); onClose(); }}>
          {activeCount > 0 ? `Show ${activeCount} filter${activeCount !== 1 ? "s" : ""}` : "Show results"}
        </Button>
      </div>
    </Modal>
  );
}

