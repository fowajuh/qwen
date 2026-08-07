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




export function cn(...c: (string | false | undefined | null)[]) {
  return c.filter(Boolean).join(" ");
}

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [lock]);
}

export function useClickOutside(ref: RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  // NOTE: the initializer must never touch `localStorage` directly — this hook
  // runs during SSR (Node has no `localStorage` global), and doing so throws a
  // ReferenceError that crashes the server render and surfaces to visitors as
  // a hard 500 ("This page didn't load"). Always start from `initial` and
  // hydrate from storage in an effect, which only ever runs in the browser.
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValue(JSON.parse(item) as T);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setValue(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key]);

  return [value, setValue];
}

export function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useKeyPress(targetKey: string, callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === targetKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        callback();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [targetKey, callback, enabled]);
}

export function useScrollPosition() {
  const [scroll, setScroll] = useState({ x: 0, y: 0, direction: "up" as "up" | "down" });
  const lastY = useRef(0);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScroll({
        x: window.scrollX,
        y,
        direction: y > lastY.current ? "down" : "up",
      });
      lastY.current = y;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scroll;
}

export function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function relativeTime(dateStr: string) {
  // Simple relative time for reviews
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return dateStr; // In real app, use date-fns
}



type ToastAction = { type: "ADD"; toast: Toast } | { type: "REMOVE"; id: string };
const toastReducer = (state: Toast[], action: ToastAction) => {
  switch (action.type) {
    case "ADD":
      return [...state, action.toast];
    case "REMOVE":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
};

export function useToast() {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const add = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: "ADD", toast: { id, message, type } });
    setTimeout(() => dispatch({ type: "REMOVE", id }), 3000);
  }, []);
  return { toasts, add, remove: (id: string) => dispatch({ type: "REMOVE", id }) };
}

export function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={cn(
              "pointer-events-auto px-4 py-3 rounded-xl shadow-drama border text-sm font-medium flex items-center gap-2",
              t.type === "success" && "bg-background border-green-200 text-green-800",
              t.type === "error" && "bg-background border-red-200 text-red-800",
              t.type === "info" && "bg-background border-hairline"
            )}
          >
            {t.type === "success" && <Check className="w-4 h-4 text-green-600" />}
            {t.type === "error" && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {t.message}
            <button onClick={() => remove(t.id)} className="ml-2 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useSavedListings() {
  const [savedArray, setSavedArray] = useLocalStorage<string[]>("nexa_wishlist", []);
  // Handle case where savedArray was corrupted by the previous Set bug (which stored "{}")
  const saved = useMemo(() => new Set(Array.isArray(savedArray) ? savedArray : []), [savedArray]);
  const { add } = useToastContext();

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);
  const toggle = useCallback(
    async (id: string) => {
      const next = new Set(saved);
      const willSave = !next.has(id);
      if (willSave) next.add(id);
      else next.delete(id);

      // Optimistic
      setSavedArray(Array.from(next));

      try {
        await api.toggleWishlist(id, willSave);
        add(willSave ? "Saved to wishlist" : "Removed from wishlist", "success");
      } catch {
        // Rollback
        setSavedArray((prev) => {
          const rollback = new Set(prev);
          if (willSave) rollback.delete(id);
          else rollback.add(id);
          return Array.from(rollback);
        });
        add("Something went wrong. Please try again.", "error");
      }
    },
    [saved, setSavedArray, add]
  );

  return { isSaved, toggle, saved };
}

// Context for toast access deep in tree
export const ToastContext = React.createContext<{ add: (m: string, t?: Toast["type"]) => void }>({ add: () => {} });
export function useToastContext() {
  return React.useContext(ToastContext);
}

