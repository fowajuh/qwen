// ============================================================
//  app/routes/housing.tsx
//  BILLION-DOLLAR PRODUCTION SCAFFOLD
//  Single-file, full-stack housing domain for TanStack Router
//  Routes: /housing          → List + Map (with loaders)
//  Route:  /housing/$id      → Detail (wire into housing.$id.tsx)
//  Stack:  React 19, TanStack Router, Framer Motion, Tailwind CSS
// ============================================================

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




export interface Review {
  id: string;
  author: string;
  avatar: string;
  date: string;
  text: string;
  rating: number;
}

export interface Amenity {
  icon: string;
  label: string;
  description?: string;
  category?: "essentials" | "features" | "location" | "safety";
}

export interface HousingListing {
  id: string;
  title: string;
  images: string[];
  price: number;
  rating: number;
  reviewCount: number;
  city: string;
  country: string;
  coordinates: { top: string; left: string };
  host: string;
  hostImage: string;
  hostYears: number;
  superhost: boolean;
  responseRate: number;
  responseTime: string;
  dates: string;
  categories: string[];
  guestFavorite: boolean;
  guests: number;
  bedrooms: number;
  beds: number;
  baths: number;
  amenities: Amenity[];
  description: string;
  about: string[];
  houseRules: string[];
  cancellationPolicy: string;
  cancellationDeadline: number; // days
  selfCheckIn: boolean;
  instantBook: boolean;
  location: string;
  neighborhood: string;
  reviews: Review[];
  rareFind?: boolean;
}

export interface HousingSearch {
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  instantBook?: boolean;
  superhost?: boolean;
  amenities?: string[];
  showTotal?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}



const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class HousingAPI {
  private cache = new Map<string, unknown>();

  async getListings(filters?: HousingSearch): Promise<HousingListing[]> {
    const key = JSON.stringify(filters);
    if (this.cache.has(key)) return this.cache.get(key) as HousingListing[];

    await sleep(400); // Simulate network latency

    let data = [...HOUSING_DATA];

    if (filters?.category && filters.category !== "All") {
      data = data.filter((h) => h.categories.includes(filters.category!));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      data = data.filter(
        (h) =>
          h.city.toLowerCase().includes(q) ||
          h.country.toLowerCase().includes(q) ||
          h.title.toLowerCase().includes(q) ||
          h.neighborhood.toLowerCase().includes(q)
      );
    }
    if (filters?.minPrice) data = data.filter((h) => h.price >= filters.minPrice!);
    if (filters?.maxPrice) data = data.filter((h) => h.price <= filters.maxPrice!);
    if (filters?.instantBook) data = data.filter((h) => h.instantBook);
    if (filters?.superhost) data = data.filter((h) => h.superhost);
    if (filters?.amenities?.length) {
      data = data.filter((h) =>
        filters.amenities!.every((a) =>
          h.amenities.some((ha) => ha.label.toLowerCase().includes(a.toLowerCase()))
        )
      );
    }

    this.cache.set(key, data);
    return data;
  }

  async getListing(id: string): Promise<HousingListing | undefined> {
    if (this.cache.has(`listing:${id}`)) {
      return this.cache.get(`listing:${id}`) as HousingListing;
    }
    await sleep(300);
    const item = HOUSING_DATA.find((h) => h.id === id);
    if (item) this.cache.set(`listing:${id}`, item);
    return item;
  }

  async toggleWishlist(id: string, saved: boolean): Promise<boolean> {
    await sleep(200);
    // Simulate 5% failure rate for optimistic rollback demo
    if (Math.random() < 0.05) throw new Error("Network error");
    return saved;
  }

  async createBooking(listingId: string, _dates: unknown): Promise<{ id: string }> {
    await sleep(800);
    return { id: `book_${Math.random().toString(36).slice(2)}` };
  }

  invalidate() {
    this.cache.clear();
  }
}

export const api = new HousingAPI();



const AMENITY_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  kitchen: UtensilsCrossed,
  washer: WashingMachine,
  dryer: Wind,
  ac: Snowflake,
  heating: Flame,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  "self-check-in": DoorOpen,
  "smart-lock": Lock,
  tv: Tv,
  bath: Bath,
  workspace: Briefcase,
  patio: Sun,
  bbq: Flame,
  "beach-access": Umbrella,
  "fire-pit": Flame,
  "hot-tub": Bath,
  "ev-charger": Car,
  "hair-dryer": Wind,
  iron: Shirt,
  "smoke-alarm": Bell,
  "carbon-monoxide": Wind,
  "first-aid": Shield,
  crib: Home,
  breakfast: Coffee,
};

export const CATEGORY_TABS = [
  { label: "All", icon: LayoutGrid },
  { label: "Apartments", icon: Building2 },
  { label: "Hotels", icon: BedDouble },
  { label: "Design", icon: Palette },
  { label: "Luxe", icon: Gem },
  { label: "Boutique", icon: Sparkles },
  { label: "Pet Friendly", icon: PawPrint },
] as const;

export const HOUSING_DATA: HousingListing[] = [
  {
    id: "1",
    title: "Desert dream oasis with spa",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    ],
    price: 782,
    rating: 4.97,
    reviewCount: 156,
    city: "Yucca Valley",
    country: "California",
    coordinates: { top: "35%", left: "22%" },
    host: "Jessica",
    hostImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    hostYears: 2,
    superhost: true,
    responseRate: 100,
    responseTime: "within an hour",
    dates: "Dec 11 – 14",
    categories: ["Luxe", "Design"],
    guestFavorite: true,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: [
      { icon: "self-check-in", label: "Self check-in", description: "Check yourself in with the smart lock.", category: "essentials" },
      { icon: "wifi", label: "Fast wifi", description: "Verified 300 Mbps.", category: "essentials" },
      { icon: "pool", label: "Private pool", category: "features" },
      { icon: "parking", label: "Free parking", category: "location" },
      { icon: "ac", label: "Air conditioning", category: "essentials" },
      { icon: "kitchen", label: "Full kitchen", category: "essentials" },
      { icon: "hot-tub", label: "Hot tub", category: "features" },
      { icon: "fire-pit", label: "Fire pit", category: "features" },
      { icon: "workspace", label: "Dedicated workspace", category: "essentials" },
      { icon: "patio", label: "Private patio", category: "features" },
      { icon: "tv", label: "65\" HDTV", category: "features" },
      { icon: "hair-dryer", label: "Hair dryer", category: "essentials" },
    ],
    description: "A stunning mid-century modern retreat surrounded by boulders and endless desert views. Unwind in the heated pool, stargaze from the hot tub, and wake up to golden sunrises.",
    about: [
      "The space is a renovated 1962 homestead with floor-to-ceiling glass, polished concrete floors, and a chef's kitchen.",
      "The outdoor area includes a fire pit, outdoor shower, and covered dining patio.",
      "Perfect for remote work with gigabit ethernet and a dedicated office nook.",
    ],
    houseRules: ["No smoking", "No parties or events", "Check-in after 3:00 PM", "Check-out before 11:00 AM", "Pets allowed"],
    cancellationPolicy: "Free cancellation for 48 hours after booking. Full refund up to 5 days before check-in.",
    cancellationDeadline: 5,
    selfCheckIn: true,
    instantBook: true,
    location: "Yucca Valley, California, United States",
    neighborhood: "Near Joshua Tree National Park",
    reviews: [
      { id: "r1", author: "Sarah", avatar: "https://i.pravatar.cc/150?u=1", date: "Nov 2024", text: "Absolutely magical. The photos don't do justice to the sunset views. Jessica was incredibly responsive and the house was spotless. Best Airbnb I've ever stayed at. The pool alone is worth it.", rating: 5 },
      { id: "r2", author: "Mike", avatar: "https://i.pravatar.cc/150?u=2", date: "Oct 2024", text: "Jessica was incredibly responsive and the house was spotless. We loved the outdoor shower and the stargazing deck.", rating: 5 },
      { id: "r3", author: "Elena", avatar: "https://i.pravatar.cc/150?u=3", date: "Sep 2024", text: "Best Airbnb I've ever stayed at. The pool alone is worth it. Already planning our return trip.", rating: 5 },
      { id: "r4", author: "David", avatar: "https://i.pravatar.cc/150?u=11", date: "Aug 2024", text: "A bit pricey but you absolutely get what you pay for. Every detail is perfect.", rating: 4 },
    ],
    rareFind: true,
  },
  {
    id: "2",
    title: "Room in the Marais",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
    ],
    price: 99,
    rating: 5.0,
    reviewCount: 14,
    city: "Paris",
    country: "France",
    coordinates: { top: "28%", left: "52%" },
    host: "Sophie",
    hostImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
    hostYears: 5,
    superhost: true,
    responseRate: 100,
    responseTime: "within a few hours",
    dates: "May 5 – 7",
    categories: ["Rooms", "Design"],
    guestFavorite: false,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [
      { icon: "wifi", label: "Wifi", category: "essentials" },
      { icon: "kitchen", label: "Kitchen access", category: "essentials" },
      { icon: "washer", label: "Washer", category: "essentials" },
      { icon: "heating", label: "Heating", category: "essentials" },
      { icon: "tv", label: "HDTV", category: "features" },
      { icon: "hair-dryer", label: "Hair dryer", category: "essentials" },
    ],
    description: "A charming room in a classic Haussmannian building in the heart of Le Marais. Steps from galleries, cafés, and the Seine.",
    about: [
      "The room overlooks a quiet courtyard with morning light.",
      "Shared bathroom with rain shower and heated floors.",
      "Fresh croissants provided every morning.",
    ],
    houseRules: ["No smoking", "Quiet hours after 10:00 PM", "No parties"],
    cancellationPolicy: "Free cancellation up to 24 hours before check-in.",
    cancellationDeadline: 1,
    selfCheckIn: false,
    instantBook: false,
    location: "Paris, Île-de-France, France",
    neighborhood: "Le Marais",
    reviews: [
      { id: "r5", author: "James", avatar: "https://i.pravatar.cc/150?u=4", date: "Apr 2024", text: "Perfect location and Sophie is a wonderful host. The croissants were a lovely touch.", rating: 5 },
      { id: "r6", author: "Yuki", avatar: "https://i.pravatar.cc/150?u=5", date: "Mar 2024", text: "The Marais is unbeatable. Room was cozy and clean. Would definitely stay again.", rating: 5 },
    ],
  },
  {
    id: "3",
    title: "Loft with spiral staircase",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
    ],
    price: 102,
    rating: 4.94,
    reviewCount: 82,
    city: "London",
    country: "United Kingdom",
    coordinates: { top: "24%", left: "48%" },
    host: "Lena",
    hostImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop",
    hostYears: 8,
    superhost: true,
    responseRate: 98,
    responseTime: "within an hour",
    dates: "May 8 – 13",
    categories: ["Apartments", "Design"],
    guestFavorite: true,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [
      { icon: "wifi", label: "Wifi", category: "essentials" },
      { icon: "kitchen", label: "Kitchen", category: "essentials" },
      { icon: "heating", label: "Heating", category: "essentials" },
      { icon: "washer", label: "Washer", category: "essentials" },
      { icon: "tv", label: "HDTV with Netflix", category: "features" },
      { icon: "workspace", label: "Dedicated workspace", category: "essentials" },
    ],
    description: "A light-filled loft in East London with a dramatic spiral staircase, tropical plants, and designer furniture.",
    about: [
      "Double-height ceilings with skylights.",
      "Walking distance to Shoreditch and Brick Lane.",
      "Bike storage available.",
    ],
    houseRules: ["No pets", "No smoking", "No parties"],
    cancellationPolicy: "Moderate: Full refund 5 days prior.",
    cancellationDeadline: 5,
    selfCheckIn: true,
    instantBook: true,
    location: "London, United Kingdom",
    neighborhood: "Shoreditch",
    reviews: [
      { id: "r7", author: "Tom", avatar: "https://i.pravatar.cc/150?u=6", date: "Jun 2024", text: "The loft is even better in person. Great design taste. Lena was super helpful and the location is perfect.", rating: 5 },
      { id: "r8", author: "Aisha", avatar: "https://i.pravatar.cc/150?u=7", date: "May 2024", text: "Lena was super helpful and the location is perfect. Loved the plants!", rating: 4 },
      { id: "r9", author: "Marco", avatar: "https://i.pravatar.cc/150?u=12", date: "Apr 2024", text: "Stylish space, great host, amazing location. What more could you want?", rating: 5 },
    ],
  },
  {
    id: "4",
    title: "Oceanfront villa with infinity pool",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1571896349842-68c75681ea19?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
    ],
    price: 450,
    rating: 4.92,
    reviewCount: 64,
    city: "Tulum",
    country: "Mexico",
    coordinates: { top: "45%", left: "18%" },
    host: "Carlos",
    hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop",
    hostYears: 4,
    superhost: false,
    responseRate: 90,
    responseTime: "within a day",
    dates: "Jun 1 – 6",
    categories: ["Luxe", "Boutique"],
    guestFavorite: true,
    guests: 6,
    bedrooms: 3,
    beds: 3,
    baths: 3,
    amenities: [
      { icon: "pool", label: "Infinity pool", category: "features" },
      { icon: "wifi", label: "Wifi", category: "essentials" },
      { icon: "parking", label: "Parking", category: "location" },
      { icon: "ac", label: "Air conditioning", category: "essentials" },
      { icon: "kitchen", label: "Kitchen", category: "essentials" },
      { icon: "beach-access", label: "Beach access", category: "location" },
      { icon: "patio", label: "Rooftop terrace", category: "features" },
      { icon: "bbq", label: "Grill", category: "features" },
    ],
    description: "Wake up to Caribbean waves. This eco-chic villa features an infinity pool, rooftop terrace, and direct beach access.",
    about: [
      "Built with sustainable materials and powered by solar.",
      "Private chef available upon request.",
      "Yoga deck on the roof with 360° views.",
    ],
    houseRules: ["No smoking", "No parties", "Eco-friendly toiletries only", "Check-in after 2:00 PM"],
    cancellationPolicy: "Strict: 50% refund up to 1 week prior.",
    cancellationDeadline: 7,
    selfCheckIn: true,
    instantBook: true,
    location: "Tulum, Quintana Roo, Mexico",
    neighborhood: "Beach Zone",
    reviews: [
      { id: "r10", author: "Lisa", avatar: "https://i.pravatar.cc/150?u=8", date: "Jul 2024", text: "Paradise on earth. The pool at sunset is unforgettable. Carlos arranged everything perfectly.", rating: 5 },
      { id: "r11", author: "Raj", avatar: "https://i.pravatar.cc/150?u=13", date: "Jun 2024", text: "Beautiful villa but a bit warm in the afternoons. The beach makes up for it.", rating: 4 },
    ],
    rareFind: true,
  },
  {
    id: "5",
    title: "Minimalist cabin in the woods",
    images: [
      "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542718610-a1d4d9f2e6b1?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop",
    ],
    price: 185,
    rating: 4.88,
    reviewCount: 120,
    city: "Portland",
    country: "Oregon",
    coordinates: { top: "30%", left: "15%" },
    host: "Mark",
    hostImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop",
    hostYears: 6,
    superhost: true,
    responseRate: 100,
    responseTime: "within an hour",
    dates: "Jul 10 – 15",
    categories: ["Boutique", "Pet Friendly"],
    guestFavorite: false,
    guests: 4,
    bedrooms: 2,
    beds: 2,
    baths: 1,
    amenities: [
      { icon: "wifi", label: "Wifi", category: "essentials" },
      { icon: "kitchen", label: "Kitchen", category: "essentials" },
      { icon: "heating", label: "Fireplace", category: "features" },
      { icon: "parking", label: "Parking", category: "location" },
      { icon: "hot-tub", label: "Hot tub", category: "features" },
      { icon: "patio", label: "Outdoor dining", category: "features" },
    ],
    description: "A Japanese-inspired cabin surrounded by old-growth forest. Soak in the cedar hot tub and disconnect.",
    about: [
      "Floor-to-ceiling windows bring the forest inside.",
      "Outdoor cedar soaking tub.",
      "5 miles from downtown Portland.",
    ],
    houseRules: ["No smoking", "Pets welcome", "Shoes off inside", "Quiet hours after 9:00 PM"],
    cancellationPolicy: "Flexible: Full refund 1 day prior.",
    cancellationDeadline: 1,
    selfCheckIn: true,
    instantBook: true,
    location: "Portland, Oregon, United States",
    neighborhood: "Forest Park",
    reviews: [
      { id: "r12", author: "Dave", avatar: "https://i.pravatar.cc/150?u=9", date: "Aug 2024", text: "The most peaceful place I've ever stayed. Mark is an incredible host.", rating: 5 },
      { id: "r13", author: "Sophie", avatar: "https://i.pravatar.cc/150?u=14", date: "Jul 2024", text: "Brought our dog and he had the time of his life. The forest is magical.", rating: 5 },
    ],
  },
  {
    id: "6",
    title: "Penthouse with skyline views",
    images: [
      "https://images.unsplash.com/photo-1512918760513-95f1926319db?w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop",
    ],
    price: 320,
    rating: 4.95,
    reviewCount: 43,
    city: "New York",
    country: "United States",
    coordinates: { top: "32%", left: "75%" },
    host: "Amanda",
    hostImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop",
    hostYears: 3,
    superhost: true,
    responseRate: 100,
    responseTime: "within an hour",
    dates: "Aug 1 – 5",
    categories: ["Apartments", "Luxe"],
    guestFavorite: true,
    guests: 2,
    bedrooms: 1,
    beds: 1,
    baths: 1,
    amenities: [
      { icon: "wifi", label: "Wifi", category: "essentials" },
      { icon: "gym", label: "Gym access", category: "features" },
      { icon: "ac", label: "AC", category: "essentials" },
      { icon: "kitchen", label: "Kitchen", category: "essentials" },
      { icon: "workspace", label: "Dedicated workspace", category: "essentials" },
      { icon: "tv", label: "HDTV", category: "features" },
      { icon: "dryer", label: "Dryer", category: "essentials" },
    ],
    description: "A sleek penthouse in Tribeca with 14-foot ceilings, designer furnishings, and a private terrace overlooking the Hudson.",
    about: [
      "Doorman building with elevator.",
      "Private terrace with outdoor seating.",
      "Walk to SoHo and the West Village.",
    ],
    houseRules: ["No smoking", "No parties", "No pets"],
    cancellationPolicy: "Moderate: Full refund 5 days prior.",
    cancellationDeadline: 5,
    selfCheckIn: true,
    instantBook: false,
    location: "New York, NY, United States",
    neighborhood: "Tribeca",
    reviews: [
      { id: "r14", author: "Chris", avatar: "https://i.pravatar.cc/150?u=10", date: "Sep 2024", text: "The view is insane. Amanda is the perfect host. The terrace is everything.", rating: 5 },
      { id: "r15", author: "Priya", avatar: "https://i.pravatar.cc/150?u=15", date: "Aug 2024", text: "Location cannot be beat. Clean, stylish, and Amanda's recommendations were spot on.", rating: 5 },
    ],
    rareFind: true,
  },
];

