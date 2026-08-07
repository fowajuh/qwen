// ============================================================
//  app/routes/housing.tsx
//  BILLION-DOLLAR PRODUCTION SCAFFOLD
//  Single-file, full-stack housing domain for TanStack Router
//  Routes: /housing          → List + Map (with loaders)
//  Route:  /housing/$id      → Detail (wire into housing.$id.tsx)
//  Stack:  React 19, TanStack Router, Framer Motion, Tailwind CSS
// ============================================================

import { useQuery } from "@tanstack/react-query";
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



export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6 text-sm">{error.message}</p>
        <Button onClick={reset} variant="outline">
          <RotateCcw className="w-4 h-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

class ListingErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false, error: undefined })} />;
    }
    return this.props.children;
  }
}

export function HousingPage() {
  const router = useRouter();
  const { toasts, add, remove } = useToast();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const [activeSegment, setActiveSegment] = useState<"Homes" | "Experiences" | "Services">("Homes");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: listings = [], isLoading: loading } = useQuery({
    queryKey: ['housingListings', activeSegment, searchParams],
    queryFn: () => api.getListings({ category: activeSegment === "Homes" ? "All" : activeSegment })
  });

  const { isSaved, toggle } = useSavedListings();

  const rails = useMemo(() => {
    if (!listings.length) return [];
    return [
      { id: "1", title: "Popular homes in Douala", subtitle: null, items: listings.slice(0, 4) },
      { id: "2", title: "Great hotels for your next trip", subtitle: "Plus, get Nexa credit when you stay at a featured hotel.", items: listings.slice(1, 5) },
      { id: "3", title: "Available next month in Paris", subtitle: null, items: listings.slice(2, 6) },
      { id: "4", title: "Stay in Dubai", subtitle: null, items: listings.slice(0, 4) },
    ];
  }, [listings]);

  return (
    <ToastContext.Provider value={{ add }}>
      <div className="w-full bg-background min-h-screen pb-[calc(var(--bottom-nav-height)+2rem)] pt-safe">
        {/* Utility nav — links out to the dedicated housing sub-pages */}
        <div className="flex items-center justify-between gap-3 px-4 pt-3 max-w-[900px] mx-auto">
          <Link to="/housing/host" className="text-[13px] font-bold underline underline-offset-2 hover:text-primary transition-colors shrink-0">
            Become a host
          </Link>
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            <Link to="/housing/wishlist" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Wishlists
            </Link>
            <Link to="/housing/trips" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Trips
            </Link>
            <Link to="/housing/experiences" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Experiences
            </Link>
            <Link to="/housing/search" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Map
            </Link>
            <Link to="/housing/safety" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Safety
            </Link>
            <Link to="/housing/help" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Help
            </Link>
            <Link to="/housing/invite" className="text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
              Invite friends
            </Link>
          </div>
        </div>

        {/* Top search bar */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 pt-3 pb-3 border-b border-hairline">
          {/* Search Pill */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center gap-3 h-14 bg-surface rounded-full shadow-lift border border-hairline px-5 mb-4 hover:shadow-drama transition-shadow max-w-[600px] mx-auto"
          >
            <Search className="w-5 h-5 text-foreground shrink-0" strokeWidth={2.5} />
            <span className="flex-1 text-left font-bold text-[14px] text-foreground">
              {searchParams.query ? `${searchParams.query} · ${searchParams.guests || 1} guest${searchParams.guests && searchParams.guests > 1 ? 's' : ''}` : "Start your search"}
            </span>
            <div 
              className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center bg-background shrink-0 hover:bg-muted/50 transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsFiltersOpen(true); }}
            >
              <Sliders className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Category Switcher — Homes / Experiences / Services */}
          <div className="flex gap-8 justify-center max-w-[400px] mx-auto">
            {(["Homes", "Experiences", "Services"] as const).map((seg) => (
              <button
                key={seg}
                onClick={() => setActiveSegment(seg)}
                className="flex flex-col items-center gap-1 relative pb-2"
              >
                <div className={`transition-colors ${activeSegment === seg ? "text-foreground" : "text-muted-foreground"}`}>
                  {seg === "Homes" && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  )}
                  {seg === "Experiences" && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
                    </svg>
                  )}
                  {seg === "Services" && (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
                    </svg>
                  )}
                </div>
                <span className={`text-[11px] font-semibold transition-colors ${activeSegment === seg ? "text-foreground" : "text-muted-foreground"}`}>
                  {seg}
                </span>
                {(seg === "Experiences" || seg === "Services") && (
                  <span className="absolute -top-1.5 -right-4 bg-foreground text-background text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
                )}
                {activeSegment === seg && (
                  <motion.div layoutId="segment-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rails */}
        <div className="pt-6 space-y-10">
          {loading ? (
            <div className="px-4 space-y-10">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                  <div className="flex gap-4 overflow-hidden">
                    <div className="shrink-0 w-[280px]"><SkeletonCard /></div>
                    <div className="shrink-0 w-[280px]"><SkeletonCard /></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            rails.map((rail) => (
              <div key={rail.id} className="w-full">
                <div className="px-4 mb-1 flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-[20px] font-bold tracking-tight">{rail.title}</h2>
                    {rail.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{rail.subtitle}</p>}
                  </div>
                  <button
                    onClick={() => navigate({ to: "/housing/search", search: { query: rail.title } })}
                    className="shrink-0 w-9 h-9 rounded-full border border-hairline flex items-center justify-center hover:bg-surface transition-colors ml-3 mt-0.5"
                    aria-label="See all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar snap-x snap-mandatory pb-2 mt-4">
                  {rail.items.map((item, idx) => (
                    <div key={`${rail.id}-${item.id}-${idx}`} className="shrink-0 w-[260px] snap-start">
                      <HousingCard
                        item={item}
                        idx={idx}
                        saved={isSaved(item.id)}
                        onToggleSave={() => toggle(item.id)}
                        onHover={() => {}}
                        onPrefetch={() => router.preloadRoute({ to: "/housing/$id", params: { id: item.id } })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <ToastContainer toasts={toasts} remove={remove} />
      </div>
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FilterModal 
        open={isFiltersOpen} 
        onClose={() => setIsFiltersOpen(false)}
        value={{
          minPrice: searchParams.minPrice || 0,
          maxPrice: searchParams.maxPrice || 2000,
          instantBook: searchParams.instantBook || false,
          superhost: searchParams.superhost || false,
          amenities: searchParams.amenities || []
        }}
        onApply={(f) => {
          navigate({ search: (prev: any) => ({ ...prev, ...f }) });
          setIsFiltersOpen(false);
        }}
      />
    </ToastContext.Provider>
  );
}



export function HousingLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/housing" || pathname === "/housing/") {
    return <HousingPage />;
  }
  return <Outlet />;
}

export const Route = createFileRoute("/housing/")({
  component: HousingLayout,
  validateSearch: (search: Record<string, unknown>): HousingSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    query: typeof search.query === "string" ? search.query : undefined,
    minPrice: typeof search.minPrice === "number" ? search.minPrice : undefined,
    maxPrice: typeof search.maxPrice === "number" ? search.maxPrice : undefined,
    instantBook: typeof search.instantBook === "boolean" ? search.instantBook : undefined,
    superhost: typeof search.superhost === "boolean" ? search.superhost : undefined,
    amenities: Array.isArray(search.amenities) ? (search.amenities as string[]) : undefined,
    showTotal: typeof search.showTotal === "boolean" ? search.showTotal : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    // Pre-load on route entry
    return api.getListings(deps as HousingSearch);
  },
});

// Wire this component into your `housing.$id.tsx` file:
//   import { HousingDetailPage } from "./housing";
//   export const Route = createFileRoute("/housing/$id")({ component: HousingDetailPage });
