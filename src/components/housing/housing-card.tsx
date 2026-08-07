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




export const HousingCard = React.memo(function HousingCard({
  item,
  idx,
  saved,
  onToggleSave,
  onHover,
  onPrefetch,
}: {
  item: HousingListing;
  idx: number;
  saved: boolean;
  onToggleSave: () => void;
  onHover: (id: string | null) => void;
  onPrefetch?: () => void;
}) {
  const [currentImg, setCurrentImg] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const reduced = useReducedMotion();

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -300) {
      setCurrentImg((c) => (c + 1) % item.images.length);
    } else if (info.offset.x > 50 || info.velocity.x > 300) {
      setCurrentImg((c) => (c === 0 ? item.images.length - 1 : c - 1));
    }
  };

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20 }}
      animate={reduced ? {} : { opacity: 1, y: 0 }}
      transition={reduced ? { duration: 0 } : { delay: Math.min(idx * 0.05, 0.3), duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
      onMouseEnter={() => {
        onHover(item.id);
        onPrefetch?.();
      }}
      onMouseLeave={() => onHover(null)}
      className="group"
      layout
    >
      <Link to="/housing/$id" params={{ id: item.id }} className="block" preload={false}>
        {/* Image container */}
        <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-muted">
          {!imageLoaded && <Skeleton className="absolute inset-0" />}
          <AnimatePresence initial={false}>
            <motion.img
              key={currentImg}
              src={item.images[currentImg]}
              initial={reduced ? {} : { opacity: 0 }}
              animate={reduced ? {} : { opacity: 1 }}
              exit={reduced ? {} : { opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.25 }}
              className="absolute inset-0 w-full h-full object-cover"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={onDragEnd}
              onLoad={() => setImageLoaded(true)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setGalleryOpen(true);
              }}
              alt={item.title}
            />
          </AnimatePresence>

          {/* Guest Favorite badge */}
          {item.guestFavorite && (
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
              <Star className="w-3 h-3 fill-foreground" />
              Guest favorite
            </div>
          )}

          {/* Rare find */}
          {item.rareFind && !item.guestFavorite && (
            <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase text-primary shadow-sm">
              Rare find
            </div>
          )}

          {/* Wishlist heart */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
            className="absolute top-3 right-3 z-10"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <motion.div whileTap={{ scale: 0.75 }}>
              <Heart
                className="w-6 h-6 drop-shadow-md transition-colors"
                strokeWidth={1.5}
                color={saved ? "var(--primary)" : "white"}
                fill={saved ? "var(--primary)" : "rgba(0,0,0,0.3)"}
              />
            </motion.div>
          </button>

          {/* Host avatar */}
          <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full border-2 border-background overflow-hidden shadow-md bg-background">
            <img src={item.hostImage} alt={item.host} className="w-full h-full object-cover" loading="lazy" />
          </div>

          {/* Dots */}
          {item.images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {item.images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImg(i);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    currentImg === i ? "bg-white w-4" : "bg-white/50 w-1.5 hover:bg-white/80"
                  )}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={currentImg === i ? "true" : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex justify-between items-start gap-2">
          <div className="font-semibold text-[15px] truncate">{item.city}, {item.country}</div>
          <div className="flex items-center gap-1 text-[14px] shrink-0">
            <Star className="w-3.5 h-3.5" fill="currentColor" stroke="none" />
            {item.rating}
          </div>
        </div>
        <div className="text-muted-foreground text-[14px] mt-0.5 truncate">
          Stay with {item.host} · Hosting for {item.hostYears} years
        </div>
        <div className="text-muted-foreground text-[14px]">{item.dates}</div>
        <div className="mt-1 text-[15px]">
          <span className="font-semibold">${item.price}</span> <span className="text-muted-foreground">night</span>
        </div>
      </Link>

      <ImageGallery images={item.images} open={galleryOpen} onClose={() => setGalleryOpen(false)} startIndex={currentImg} />
    </motion.div>
  );
});


export function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-square lg:aspect-[4/3] rounded-2xl bg-muted mb-3" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted rounded w-1/3" />
    </div>
  );
}

/**
 * Compact horizontal card shown floating above the explore bottom sheet
 * when a map pin is tapped — mirrors Airbnb's pin-preview pattern.
 */
export function MapPreviewCard({
  item,
  saved,
  onToggleSave,
  onClose,
}: {
  item: HousingListing;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}) {
  const nights = 2;
  const freeCancellation = item.cancellationPolicy.toLowerCase().includes("free") || item.cancellationPolicy.toLowerCase().includes("flexible");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
    >
      <Link
        to="/housing/$id"
        params={{ id: item.id }}
        className="relative flex gap-3 items-center bg-background rounded-2xl shadow-drama p-3 pointer-events-auto"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm z-10"
          aria-label="Close preview"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
            className="absolute top-1.5 right-1.5"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart
              className="w-4 h-4 drop-shadow-md"
              strokeWidth={1.5}
              color={saved ? "var(--primary)" : "white"}
              fill={saved ? "var(--primary)" : "rgba(0,0,0,0.3)"}
            />
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2 mb-0.5">
            <span className="font-bold text-[15px] truncate">{item.city}, {item.country}</span>
            <span className="flex items-center gap-1 text-[13px] shrink-0">
              <Star className="w-3 h-3" fill="currentColor" stroke="none" /> {item.rating}
            </span>
          </div>
          <div className="text-muted-foreground text-[13px] truncate mb-1">{item.title}</div>
          <div className="text-[14px] mb-1">
            <span className="font-bold">${item.price * nights}</span>{" "}
            <span className="text-muted-foreground">for {nights} nights</span>
          </div>
          {freeCancellation && (
            <span className="text-[11px] font-semibold text-foreground/80 bg-surface px-2 py-0.5 rounded-full">
              Free cancellation
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

