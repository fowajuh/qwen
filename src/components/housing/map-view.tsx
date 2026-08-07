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




export function MapView({
  listings,
  hoveredId,
  onHover,
  onSelect,
  showMap,
  onCloseMap,
  hideToggle = false,
}: {
  listings: HousingListing[];
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  showMap: boolean;
  onCloseMap: () => void;
  hideToggle?: boolean;
}) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });
  const reduced = useReducedMotion();

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(Math.max(s - e.deltaY * 0.001, 0.6), 4));
  };

  const onMouseDown = (e: ReactMouseEvent) => {
    isDragging.current = true;
    startPan.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  };

  const onMouseMove = (e: ReactMouseEvent) => {
    if (!isDragging.current) return;
    setPan({ x: e.clientX - startPan.current.x, y: e.clientY - startPan.current.y });
  };

  const onMouseUp = () => {
    isDragging.current = false;
    if (containerRef.current) containerRef.current.style.cursor = "grab";
  };

  // Reset view when listings change
  const prevListings = usePrevious(listings);
  useEffect(() => {
    if (prevListings && prevListings.length !== listings.length) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    }
  }, [listings.length, prevListings]);

  return (
    <div
      className={cn(
        "absolute lg:relative inset-0 lg:inset-auto flex-1 h-full bg-[#e8e6e1] dark:bg-[#1a1a1a] overflow-hidden select-none",
        !showMap ? "hidden lg:block" : "block z-50"
      )}
    >
      {showMap && !hideToggle && (
        <button
          onClick={onCloseMap}
          className="lg:hidden absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-medium shadow-drama hover:scale-105 transition-transform"
        >
          <List className="w-4 h-4" />
          List View
        </button>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-8 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.4, 4))}
          className="w-10 h-10 bg-background rounded-full shadow-lift flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.4, 0.6))}
          className="w-10 h-10 bg-background rounded-full shadow-lift flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className="w-10 h-10 bg-background rounded-full shadow-lift flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          aria-label="Reset map"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map canvas */}
      <div
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <motion.div
          className="absolute inset-0 origin-center"
          animate={reduced ? {} : { x: pan.x, y: pan.y, scale }}
          transition={reduced ? { duration: 0 } : { type: "tween", duration: 0.15, ease: "linear" }}
          style={reduced ? { transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})` } : undefined}
        >
          {/* Base texture */}
          <div
            className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Real Google Map Embed as background */}
          <div className="absolute inset-0 w-full h-full pointer-events-none opacity-90 dark:opacity-70 saturate-50 contrast-125">
            <iframe
              title="Google Map"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0, width: "100%", height: "100%" }}
              src="https://maps.google.com/maps?q=brooklyn&t=&z=13&ie=UTF8&iwloc=&output=embed"
              allowFullScreen
            />
          </div>
          <div className="absolute inset-0 bg-background/10 pointer-events-none mix-blend-overlay" />

          {/* Pins */}
          {listings.map((item) => {
            const isHovered = hoveredId === item.id;
            return (
              <motion.button
                key={item.id}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full font-bold text-xs shadow-lift z-10 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                  isHovered ? "bg-foreground text-background z-30 scale-110" : "bg-background text-foreground hover:scale-105"
                )}
                style={{ top: item.coordinates.top, left: item.coordinates.left }}
                onMouseEnter={() => onHover(item.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(item.id)}
                whileTap={{ scale: 0.9 }}
                aria-label={`${item.title}, $${item.price} per night`}
              >
                ${item.price}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 bg-background text-foreground text-[10px] px-2 py-1 rounded-md shadow-lift whitespace-nowrap pointer-events-none"
                  >
                    {item.city}
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

