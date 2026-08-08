// ============================================================
//  app/routes/housing.tsx
//  BILLION-DOLLAR PRODUCTION SCAFFOLD
//  Single-file, full-stack housing domain for TanStack Router
//  Routes: /housing          → List + Map (with loaders)
//  Route:  /housing/$id      → Detail (wire into housing.$id.tsx)
//  Stack:  React 19, TanStack Router, Framer Motion, Tailwind CSS
// ============================================================

import { cn } from "@/lib/utils";

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



export function ReviewBreakdown({ reviews }: { reviews: Review[] }) {
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      c[5 - r.rating]++;
    });
    return c;
  }, [reviews]);

  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((star, i) => (
        <div key={star} className="flex items-center gap-3 text-sm">
          <span className="w-3">{star}</span>
          <Star className="w-3 h-3 fill-foreground" strokeWidth={0} />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full"
              style={{ width: `${reviews.length ? (counts[i] / reviews.length) * 100 : 0}%` }}
            />
          </div>
          <span className="w-6 text-right text-muted-foreground">{counts[i]}</span>
        </div>
      ))}
    </div>
  );
}

export function SimilarListings({ excludeId }: { excludeId: string }) {
  const similar = useMemo(() => HOUSING_DATA.filter((h) => h.id !== excludeId).slice(0, 4), [excludeId]);
  const { isSaved, toggle } = useSavedListings();
  const router = useRouter();

  return (
    <div className="mt-12 pt-8 border-t border-hairline">
      <h3 className="text-xl font-semibold mb-6">More places to stay</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {similar.map((item, idx) => (
          <HousingCard
            key={item.id}
            item={item}
            idx={idx}
            saved={isSaved(item.id)}
            onToggleSave={() => toggle(item.id)}
            onHover={() => {}}
            onPrefetch={() => {
              // Prefetch detail route instead of navigating immediately
              router.preloadRoute({ to: "/housing/$id", params: { id: item.id } });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function HousingDetailPage() {
  const { id } = useParams({ strict: false });
  const { data: item, isLoading: loading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.getListing(id)
  });
  const [imgIdx, setImgIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [nights, setNights] = useState(3);
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "safety" | "cancellation">("rules");
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const scroll = useScrollPosition();
  const reduced = useReducedMotion();
  const { add: toast } = useToastContext();

  // Preload all images
  useEffect(() => {
    if (!item) return;
    item.images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [item]);

  // Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-20 pb-32">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 rounded-2xl overflow-hidden h-[300px] lg:h-[400px] mb-8">
            <Skeleton className="h-full" />
            <div className="hidden lg:grid grid-cols-2 gap-2">
              <Skeleton className="h-full" />
              <Skeleton className="h-full" />
              <Skeleton className="h-full" />
              <Skeleton className="h-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center px-4 flex flex-col items-center">
          <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
            <Home size={32} className="text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted-foreground mb-6">This place may have been removed or the link is incorrect.</p>
          <Button onClick={() => navigate({ to: "/housing" })}>Back to listings</Button>
        </div>
      </div>
    );
  }

  const total = item.price * nights;
  const serviceFee = Math.round(total * 0.12);
  const cleaningFee = Math.round(item.price * 0.3);
  const grandTotal = total + serviceFee + cleaningFee;

  const visibleAmenities = showAllAmenities ? item.amenities : item.amenities.slice(0, 6);
  const visibleReviews = showAllReviews ? item.reviews : item.reviews.slice(0, 4);

  const handleReserve = () => {
    // Hand off to the dedicated dates → book → checkout flow instead of
    // silently booking in place, so the reservation can be reviewed and paid for.
    navigate({ to: "/housing/dates/$id", params: { id: item.id } });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: `Check out ${item.title} on Nexa`, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast("Link copied to clipboard", "success");
      }
    } catch {
      // ignore
    }
  };

  // JSON-LD for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingReservation",
    name: item.title,
    description: item.description,
    image: item.images[0],
    address: { "@type": "PostalAddress", addressLocality: item.city, addressRegion: item.country },
    host: { "@type": "Person", name: item.host },
    priceRange: `$${item.price}`,
    aggregateRating: { "@type": "AggregateRating", ratingValue: item.rating, reviewCount: item.reviewCount },
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Sticky header on scroll (desktop) */}
      <motion.header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-hairline hidden lg:flex items-center justify-between px-6 py-3 transition-shadow",
          scroll.y > 400 ? "shadow-sm" : ""
        )}
        initial={{ y: -100 }}
        animate={{ y: scroll.y > 300 ? 0 : -100 }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => navigate({ to: "/housing" })} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium truncate max-w-md">{item.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 hover:bg-surface rounded-full transition-colors" aria-label="Share">
            <Share className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className="p-2 hover:bg-surface rounded-full transition-colors"
            aria-label={saved ? "Remove from saved" : "Save listing"}
          >
            <Heart className={cn("w-5 h-5", saved && "fill-primary text-primary")} />
          </button>
        </div>
      </motion.header>

      <div className="max-w-6xl mx-auto px-4 lg:px-6 pt-4 lg:pt-20 pb-32">
        {/* Mobile actions */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <button onClick={() => navigate({ to: "/housing" })} className="p-2 -ml-2 hover:bg-surface rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={handleShare} className="p-2 hover:bg-surface rounded-full transition-colors">
              <Share className="w-5 h-5" />
            </button>
            <button onClick={() => setSaved((s) => !s)} className="p-2 hover:bg-surface rounded-full transition-colors">
              <Heart className={cn("w-5 h-5", saved && "fill-primary text-primary")} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-semibold mb-1">{item.title}</h1>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="flex items-center gap-1 font-medium">
            <Star className="w-4 h-4 fill-foreground" strokeWidth={0} />
            {item.rating}
          </span>
          <button
            className="underline cursor-pointer hover:text-foreground"
            onClick={() => navigate({ to: "/housing/listing/$id/reviews", params: { id: item.id } })}
          >
            {item.reviewCount} reviews
          </button>
          <span>·</span>
          <span className="underline cursor-pointer">{item.superhost ? "Superhost" : "Host"}</span>
          <span>·</span>
          <button className="underline cursor-pointer hover:text-foreground">{item.city}, {item.country}</button>
        </div>

        {/* Image Grid — Airbnb 5-image layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-2 rounded-2xl overflow-hidden h-[300px] lg:h-[400px]">
          <div className="lg:col-span-2 relative h-full cursor-pointer group" onClick={() => setGalleryOpen(true)}>
            <img
              src={item.images[0]}
              alt="Main view"
              className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-500"
            />
            <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-medium">
              1 / {item.images.length}
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-2 lg:col-span-2">
            {item.images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className={cn("relative h-full cursor-pointer group overflow-hidden", i === 2 && "rounded-bl-2xl", i === 3 && "rounded-br-2xl")}
                onClick={() => {
                  setImgIdx(i + 1);
                  setGalleryOpen(true);
                }}
              >
                <img src={img} alt={`View ${i + 2}`} className="w-full h-full object-cover group-hover:brightness-95 transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/housing/listing/$id/photos", params: { id: item.id } })}
          className="hidden lg:flex mt-4 ml-auto items-center gap-2 px-4 py-2 rounded-lg border border-foreground text-sm font-medium hover:bg-surface transition-colors"
        >
          <LayoutGrid className="w-4 h-4" />
          Show all photos
        </button>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Quick info */}
            <div className="pb-6 border-b border-hairline">
              <h2 className="text-xl lg:text-2xl font-semibold mb-1">
                {item.guests} guests · {item.bedrooms} bedroom{item.bedrooms !== 1 ? "s" : ""} · {item.beds} bed
                {item.beds !== 1 ? "s" : ""} · {item.baths} bath{item.baths !== 1 ? "s" : ""}
              </h2>
              <p className="text-muted-foreground">{item.location}</p>
              {item.rareFind && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  <Gem className="w-4 h-4" />
                  Rare find — usually booked out
                </div>
              )}
            </div>

            {/* Rating bar */}
            <div className="py-6 border-b border-hairline">
              <div className="flex items-center gap-6 flex-wrap">
                <div className="text-center">
                  <div className="text-3xl font-bold">{item.rating}</div>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-foreground" strokeWidth={0} />
                    ))}
                  </div>
                </div>
                <div className="w-px h-12 bg-hairline hidden sm:block" />
                {item.guestFavorite && (
                  <>
                    <div className="text-center">
                      <Award className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-sm font-medium">
                        Guest
                        <br />
                        favorite
                      </div>
                    </div>
                    <div className="w-px h-12 bg-hairline hidden sm:block" />
                  </>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold">{item.reviewCount}</div>
                  <button className="text-sm underline cursor-pointer hover:text-foreground">Reviews</button>
                </div>
                <div className="w-px h-12 bg-hairline hidden sm:block" />
                <div>
                  <ReviewBreakdown reviews={item.reviews} />
                </div>
              </div>
            </div>

            {/* Host */}
            <div className="py-6 border-b border-hairline flex items-start gap-4">
              <div className="relative shrink-0">
                <img src={item.hostImage} alt={item.host} className="w-14 h-14 rounded-full object-cover" />
                {item.superhost && (
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold">Hosted by {item.host}</div>
                <div className="text-muted-foreground text-sm">
                  {item.superhost ? "Superhost · " : ""}
                  {item.hostYears} years hosting
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {item.responseRate}% response rate
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {item.responseTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Key amenities */}
            <div className="py-6 border-b border-hairline space-y-4">
              {item.selfCheckIn && (
                <div className="flex items-start gap-4">
                  <DoorOpen className="w-6 h-6 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Self check-in</div>
                    <div className="text-sm text-muted-foreground">Check yourself in with the smart lock.</div>
                  </div>
                </div>
              )}
              {item.instantBook && (
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 shrink-0 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Instant book</div>
                    <div className="text-sm text-muted-foreground">Reserve now without waiting for host approval.</div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 shrink-0 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-semibold">Cancellation policy</div>
                  <div className="text-sm text-muted-foreground">{item.cancellationPolicy}</div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="py-6 border-b border-hairline">
              <p className="text-muted-foreground leading-relaxed mb-4 text-lg">{item.description}</p>
              <div className="space-y-3">
                {item.about.map((line, i) => (
                  <div key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities grid */}
            <div className="py-6 border-b border-hairline">
              <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visibleAmenities.map((amenity) => {
                  const Icon = AMENITY_ICON_MAP[amenity.icon] || Home;
                  return (
                    <div key={amenity.label} className="flex items-center gap-3 text-muted-foreground">
                      <Icon className="w-5 h-5" />
                      <span>{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
              {item.amenities.length > 6 && (
                <button
                  onClick={() => setShowAllAmenities((s) => !s)}
                  className="mt-4 px-6 py-3 rounded-xl border border-foreground font-medium text-sm hover:bg-surface transition-colors"
                >
                  {showAllAmenities ? "Show less" : `Show all ${item.amenities.length} amenities`}
                </button>
              )}
            </div>

            {/* Reviews */}
            <div className="py-6 border-b border-hairline">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-foreground" strokeWidth={0} />
                <span className="text-xl font-semibold">
                  {item.rating} · {item.reviewCount} reviews
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {visibleReviews.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                      <div>
                        <div className="font-semibold text-sm">{review.author}</div>
                        <div className="text-xs text-muted-foreground">{relativeTime(review.date)}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-foreground" : "fill-muted")} strokeWidth={0} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
              {item.reviews.length > 4 && (
                <button
                  onClick={() => setShowAllReviews((s) => !s)}
                  className="mt-4 px-6 py-3 rounded-xl border border-foreground font-medium text-sm hover:bg-surface transition-colors"
                >
                  {showAllReviews ? "Show less" : `Show all ${item.reviewCount} reviews`}
                </button>
              )}
            </div>

            {/* Things to know */}
            <div className="py-6">
              <h3 className="text-xl font-semibold mb-4">Things to know</h3>
              <div className="flex gap-4 mb-4 border-b border-hairline">
                {(["rules", "safety", "cancellation"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={cn(
                      "pb-3 text-sm font-medium border-b-2 transition-colors",
                      activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t === "rules" ? "House rules" : t === "safety" ? "Safety & property" : "Cancellation policy"}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={reduced ? {} : { opacity: 0, y: 10 }}
                  animate={reduced ? {} : { opacity: 1, y: 0 }}
                  exit={reduced ? {} : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === "rules" && (
                    <div className="space-y-3">
                      {item.houseRules.map((rule) => (
                        <div key={rule} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 shrink-0" />
                          {rule}
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTab === "safety" && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4 shrink-0" />
                        Carbon monoxide alarm
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Bell className="w-4 h-4 shrink-0" />
                        Smoke alarm
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Ban className="w-4 h-4 shrink-0" />
                        Security deposit may apply
                      </div>
                    </div>
                  )}
                  {activeTab === "cancellation" && (
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>{item.cancellationPolicy}</p>
                      <div className="flex items-center gap-2 text-foreground font-medium">
                        <Clock className="w-4 h-4" />
                        Free cancellation before {item.cancellationDeadline} days
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Similar listings */}
            <SimilarListings excludeId={item.id} />
          </div>

          {/* Right column — Booking card */}
          <div className="hidden lg:block">
            <div className="sticky top-24 border border-hairline rounded-2xl p-6 shadow-lift bg-background">
              <div className="flex items-end gap-1 mb-6">
                <span className="text-2xl font-semibold">${item.price}</span>
                <span className="text-muted-foreground mb-1">night</span>
              </div>

              <div className="border border-hairline rounded-xl overflow-hidden mb-4">
                <div className="grid grid-cols-2 border-b border-hairline">
                  <div className="p-3 border-r border-hairline cursor-pointer hover:bg-surface/50 transition-colors">
                    <div className="text-[10px] font-bold uppercase">Check in</div>
                    <div className="text-sm mt-1 text-muted-foreground">Add date</div>
                  </div>
                  <div className="p-3 cursor-pointer hover:bg-surface/50 transition-colors">
                    <div className="text-[10px] font-bold uppercase">Check out</div>
                    <div className="text-sm mt-1 text-muted-foreground">Add date</div>
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-surface/50 transition-colors">
                  <div>
                    <div className="text-[10px] font-bold uppercase">Guests</div>
                    <div className="text-sm mt-1 text-muted-foreground">{guests} guest{guests !== 1 ? "s" : ""}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <Button onClick={handleReserve} variant="secondary" size="lg" loading={bookingLoading} className="w-full mb-4">
                Reserve
              </Button>
              <div className="text-center text-sm text-muted-foreground mb-4">You won't be charged yet</div>

              <div className="space-y-3 text-sm border-b border-hairline pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="underline cursor-pointer">
                    ${item.price} x {nights} nights
                  </span>
                  <span>${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline cursor-pointer">Cleaning fee</span>
                  <span>${cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="underline cursor-pointer">Service fee</span>
                  <span>${serviceFee}</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total before taxes</span>
                <span>${grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-hairline px-4 py-3 flex items-center justify-between z-30">
        <div>
          <div className="flex items-end gap-1">
            <span className="text-lg font-semibold">${item.price}</span>
            <span className="text-sm text-muted-foreground">night</span>
          </div>
          <div className="text-sm text-muted-foreground">{item.dates}</div>
        </div>
        <Button onClick={handleReserve} loading={bookingLoading}>
          Reserve
        </Button>
      </div>

      <ImageGallery images={item.images} open={galleryOpen} onClose={() => setGalleryOpen(false)} startIndex={imgIdx} />
    </div>
  );
}


export const Route = createFileRoute("/housing/$id")({
  component: HousingDetailPage,
});
