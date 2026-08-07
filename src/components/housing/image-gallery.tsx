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




export function ImageGallery({
  images,
  open,
  onClose,
  startIndex = 0,
}: {
  images: string[];
  open: boolean;
  onClose: () => void;
  startIndex?: number;
}) {
  const [idx, setIdx] = useState(startIndex);
  const x = useMotionValue(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);
  const reduced = useReducedMotion();

  // Preload adjacent images
  useEffect(() => {
    if (!open) return;
    [idx - 1, idx + 1].forEach((i) => {
      if (i >= 0 && i < images.length) {
        const img = new Image();
        img.src = images[i];
      }
    });
  }, [idx, open, images]);

  useEffect(() => {
    setIdx(startIndex);
  }, [startIndex, open]);

  useKeyPress(
    "Escape",
    () => {
      onClose();
    },
    open
  );
  useKeyPress(
    "ArrowRight",
    () => {
      setIdx((i) => Math.min(images.length - 1, i + 1));
    },
    open
  );
  useKeyPress(
    "ArrowLeft",
    () => {
      setIdx((i) => Math.max(0, i - 1));
    },
    open
  );

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -80 && idx < images.length - 1) setIdx((i) => i + 1);
    else if (info.offset.x > 80 && idx > 0) setIdx((i) => i - 1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery"
        >
          <FocusTrap active={open}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 text-white">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                aria-label="Close gallery"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-sm font-medium bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                {idx + 1} / {images.length}
              </div>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: "Check this out", url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors"
                aria-label="Share"
              >
                <Share className="w-5 h-5" />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center overflow-hidden" ref={constraintsRef}>
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={onDragEnd}
                style={{ x }}
                className="w-full h-full relative cursor-grab active:cursor-grabbing"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.img
                    key={idx}
                    src={images[idx]}
                    initial={reduced ? {} : { opacity: 0, scale: 0.98 }}
                    animate={reduced ? {} : { opacity: 1, scale: 1 }}
                    exit={reduced ? {} : { opacity: 0, scale: 1.02 }}
                    transition={reduced ? { duration: 0 } : { duration: 0.2 }}
                    className="absolute inset-0 w-full h-full object-contain"
                    alt={`Property image ${idx + 1}`}
                    draggable={false}
                  />
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Thumbnails */}
            <div className="shrink-0 p-4 flex gap-2 overflow-x-auto hide-scrollbar">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                    i === idx ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  )}
                  aria-label={`Go to image ${i + 1}`}
                  aria-current={i === idx ? "true" : undefined}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </FocusTrap>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

