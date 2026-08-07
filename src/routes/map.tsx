import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Nexa Maps" },
      { name: "description", content: "The world's most detailed local discovery engine. Real-time traffic, immersive Street View, and trusted business intelligence." },
    ],
  }),
  component: MapPage,
});

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES & INTERFACES
   ═══════════════════════════════════════════════════════════════════════════════ */
interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  photos?: string[];
  helpful: number;
  ownerReply?: string;
}

interface BusinessHours {
  day: string;
  open: string;
  close: string;
  is24h?: boolean;
}

interface BusinessPhoto {
  id: string;
  color: string;
  caption: string;
  by: string;
}

interface Business {
  id: string;
  name: string;
  tag: string;
  trust: number;
  meta: string;
  x: number;
  y: number;
  color: string;
  open: boolean;
  address: string;
  phone: string;
  website: string;
  priceLevel: number; // 1-4
  rating: number;
  reviewCount: number;
  hours: BusinessHours[];
  popularTimes: number[]; // 0-100 for each hour 6am-10pm
  description: string;
  amenities: string[];
  services: string[];
  photos: BusinessPhoto[];
  reviews: Review[];
  coordinates: { lat: string; lng: string };
  attributes: Record<string, boolean>;
  menuUrl?: string;
  reservationUrl?: string;
  orderUrl?: string;
  parkingInfo: string;
  accessibility: string[];
  healthSafety: string[];
  updates: string[];
  questions: { q: string; a: string; votes: number }[];
  similar: string[];
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MEGA DATASET — 20+ Businesses with full intelligence
   ═══════════════════════════════════════════════════════════════════════════════ */
const generateReviews = (bizName: string, count: number): Review[] => {
  const pool = [
    { author: "Sarah J.", text: "Absolutely incredible experience. The staff was attentive and the quality exceeded expectations. Will definitely return next week." },
    { author: "Marcus T.", text: "Hidden gem in the neighborhood. Found this through Nexa and it did not disappoint. Highly recommend the premium package." },
    { author: "Elena R.", text: "Good service but the wait was slightly longer than expected. The ambiance makes up for it though." },
    { author: "David K.", text: "Best in class. I've tried competitors across the city and this remains my top choice for 3 years running." },
    { author: "Priya M.", text: "Clean, professional, and fairly priced. The online booking system through Nexa was seamless." },
    { author: "James L.", text: "Decent experience. Nothing extraordinary but solid quality. Parking was a bit challenging during rush hour." },
    { author: "Olivia W.", text: "Five stars isn't enough. This place transformed my routine. The team knows exactly what they're doing." },
    { author: "Chen W.", text: "Great location and even better service. The trust score on Nexa is well-deserved." },
  ];
  return Array.from({ length: count }).map((_, i) => {
    const base = pool[i % pool.length];
    return {
      id: `rev-${bizName}-${i}`,
      author: base.author,
      avatar: `https://ui-avatars.com/api/?name=${base.author.replace(/ /g, "+")}&background=random`,
      rating: [5, 5, 4, 5, 5, 4, 5, 5][i % 8],
      date: ["2 days ago", "1 week ago", "2 weeks ago", "1 month ago", "3 months ago"][i % 5],
      text: base.text,
      helpful: [12, 8, 3, 24, 1, 5, 18, 9][i % 8],
      ...(i === 0 ? { ownerReply: "Thank you so much for the kind words! We look forward to welcoming you back. — Owner" } : {}),
    };
  });
};

const HOURS_STANDARD: BusinessHours[] = [
  { day: "Monday", open: "09:00", close: "18:00" },
  { day: "Tuesday", open: "09:00", close: "18:00" },
  { day: "Wednesday", open: "09:00", close: "18:00" },
  { day: "Thursday", open: "09:00", close: "18:00" },
  { day: "Friday", open: "09:00", close: "20:00" },
  { day: "Saturday", open: "10:00", close: "16:00" },
  { day: "Sunday", open: "Closed", close: "Closed" },
];

const HOURS_CAFE: BusinessHours[] = [
  { day: "Monday", open: "06:00", close: "22:00" },
  { day: "Tuesday", open: "06:00", close: "22:00" },
  { day: "Wednesday", open: "06:00", close: "22:00" },
  { day: "Thursday", open: "06:00", close: "22:00" },
  { day: "Friday", open: "06:00", close: "23:00" },
  { day: "Saturday", open: "07:00", close: "23:00" },
  { day: "Sunday", open: "07:00", close: "21:00" },
];

const HOURS_EMERGENCY: BusinessHours[] = [
  { day: "Monday", open: "00:00", close: "23:59", is24h: true },
  { day: "Tuesday", open: "00:00", close: "23:59", is24h: true },
  { day: "Wednesday", open: "00:00", close: "23:59", is24h: true },
  { day: "Thursday", open: "00:00", close: "23:59", is24h: true },
  { day: "Friday", open: "00:00", close: "23:59", is24h: true },
  { day: "Saturday", open: "00:00", close: "23:59", is24h: true },
  { day: "Sunday", open: "00:00", close: "23:59", is24h: true },
];

const BUSINESSES: Business[] = [
  {
    id: "kori", name: "Kori Hair Studio", tag: "Salon", trust: 98, meta: "2:30pm today", x: 52, y: 38, color: "oklch(0.7 0.12 45)", open: true,
    address: "428 Atlantic Ave, Brooklyn, NY 11217", phone: "(718) 555-0142", website: "korihair.studio", priceLevel: 3, rating: 4.8, reviewCount: 342,
    hours: HOURS_STANDARD, popularTimes: [20, 15, 10, 25, 45, 70, 85, 60, 40, 30, 35, 50, 65, 55, 40, 25],
    description: "Premium hair studio specializing in precision cuts, balayage, and keratin treatments. Our award-winning stylists bring runway techniques to your everyday look.",
    amenities: ["Wi-Fi", "Wheelchair accessible", "Gender-neutral restrooms", "Accepts credit cards", "Appointments recommended"],
    services: ["Haircuts", "Coloring", "Styling", "Extensions", "Treatments"],
    photos: [{ id: "p1", color: "from-rose-100 to-rose-300", caption: "Interior", by: "Nexa User" }, { id: "p2", color: "from-amber-100 to-amber-300", caption: "Styling", by: "Sarah J." }],
    reviews: generateReviews("kori", 6), coordinates: { lat: "40.6845", lng: "-73.9824" },
    attributes: { "Outdoor seating": false, "Wi-Fi": true, "Parking": false, "Delivery": false, "Takeout": false },
    parkingInfo: "Street parking available; metered until 7pm. Garage at 450 Atlantic Ave.",
    accessibility: ["Wheelchair accessible entrance", "Wheelchair accessible restroom", "Gender-neutral restroom"],
    healthSafety: ["Staff wears masks", "Temperature checks", "Sanitation between customers"],
    updates: ["Now offering bridal party packages — book 3+ stylists and receive 15% off."],
    questions: [{ q: "Do they take walk-ins?", a: "Appointments are strongly recommended, but walk-ins are accepted before 2pm on weekdays.", votes: 14 }],
    similar: ["atelier", "mira"],
  },
  {
    id: "halden", name: "Halden Dental", tag: "Dental", trust: 96, meta: "In-network · today", x: 31, y: 55, color: "oklch(0.55 0.1 230)", open: true,
    address: "189 Bedford Ave, Brooklyn, NY 11211", phone: "(718) 555-0298", website: "haldendental.com", priceLevel: 2, rating: 4.9, reviewCount: 512,
    hours: [{ day: "Monday", open: "08:00", close: "17:00" }, { day: "Tuesday", open: "08:00", close: "17:00" }, { day: "Wednesday", open: "08:00", close: "17:00" }, { day: "Thursday", open: "08:00", close: "17:00" }, { day: "Friday", open: "08:00", close: "16:00" }, { day: "Saturday", open: "09:00", close: "14:00" }, { day: "Sunday", open: "Closed", close: "Closed" }],
    popularTimes: [10, 10, 15, 30, 60, 80, 90, 70, 50, 40, 30, 25, 20, 15, 10, 5],
    description: "State-of-the-art dental practice offering general, cosmetic, and emergency dentistry. Digital X-rays, same-day crowns, and sedation options available.",
    amenities: ["Free Wi-Fi", "TV in waiting room", "Wheelchair accessible", "Accepts insurance"],
    services: ["Cleanings", "Fillings", "Crowns", "Whitening", "Invisalign", "Emergency"],
    photos: [{ id: "p1", color: "from-blue-100 to-blue-300", caption: "Reception", by: "Halden Team" }],
    reviews: generateReviews("halden", 5), coordinates: { lat: "40.7173", lng: "-73.9576" },
    attributes: { "By appointment only": true, "Accepts insurance": true },
    parkingInfo: "Municipal lot behind building. Validated for 2 hours.",
    accessibility: ["Wheelchair accessible entrance", "Wheelchair accessible restroom", "Accessible parking"],
    healthSafety: ["Enhanced COVID protocols", "HEPA filtration", "Contactless check-in"],
    updates: ["Now accepting new patients with Delta Dental PPO."],
    questions: [{ q: "Do they do payment plans?", a: "Yes, CareCredit and in-house payment plans available for procedures over $500.", votes: 22 }],
    similar: ["paws"],
  },
  {
    id: "north-fork", name: "North Fork Plumbing", tag: "Emergency", trust: 94, meta: "Responds in 6 min", x: 68, y: 62, color: "oklch(0.6 0.15 25)", open: true,
    address: "550 Washington Ave, Brooklyn, NY 11238", phone: "(718) 555-0199", website: "northforkplumbing.com", priceLevel: 2, rating: 4.7, reviewCount: 198,
    hours: HOURS_EMERGENCY, popularTimes: [30, 25, 20, 20, 25, 35, 50, 60, 55, 45, 40, 35, 30, 25, 20, 15],
    description: "24/7 emergency plumbing and HVAC services. Licensed master plumbers. No overtime charges. Serving Brooklyn and Queens for over 20 years.",
    amenities: ["24/7 dispatch", "Licensed & insured", "Free estimates", "Military discount"],
    services: ["Emergency repair", "Drain cleaning", "Water heaters", "Boilers", "Gas lines", "Bathroom remodels"],
    photos: [{ id: "p1", color: "from-red-100 to-red-300", caption: "Fleet", by: "North Fork" }],
    reviews: generateReviews("northfork", 4), coordinates: { lat: "40.6779", lng: "-73.9634" },
    attributes: { "Open 24 hours": true },
    parkingInfo: "Service vehicles park curbside during calls.",
    accessibility: ["Accessible service van available upon request"],
    healthSafety: ["Boot covers and mats used", "Background-checked technicians"],
    updates: ["Winter special: Boiler tune-up $129 through February."],
    questions: [{ q: "Do they service Queens?", a: "Yes, all of Brooklyn and western Queens.", votes: 8 }],
    similar: ["swift"],
  },
  {
    id: "mira", name: "Mira Yoga", tag: "Wellness", trust: 92, meta: "6:30am · 4 spots", x: 42, y: 72, color: "oklch(0.65 0.06 80)", open: true,
    address: "301 Flatbush Ave, Brooklyn, NY 11217", phone: "(718) 555-0333", website: "mirayoga.nyc", priceLevel: 2, rating: 4.6, reviewCount: 276,
    hours: [{ day: "Monday", open: "06:00", close: "21:00" }, { day: "Tuesday", open: "06:00", close: "21:00" }, { day: "Wednesday", open: "06:00", close: "21:00" }, { day: "Thursday", open: "06:00", close: "21:00" }, { day: "Friday", open: "06:00", close: "20:00" }, { day: "Saturday", open: "08:00", close: "18:00" }, { day: "Sunday", open: "08:00", close: "18:00" }],
    popularTimes: [45, 60, 40, 30, 25, 35, 55, 80, 90, 70, 50, 40, 35, 30, 25, 20],
    description: "Boutique yoga studio offering Vinyasa, Hot Yoga, and Meditation classes. Infrared heating, premium mats, and small class sizes for personalized attention.",
    amenities: ["Showers", "Lockers", "Mat rental", "Towel service", "Retail boutique"],
    services: ["Vinyasa", "Hot Yoga", "Meditation", "Private sessions", "Corporate wellness"],
    photos: [{ id: "p1", color: "from-yellow-100 to-yellow-300", caption: "Studio", by: "Mira Team" }],
    reviews: generateReviews("mira", 5), coordinates: { lat: "40.6782", lng: "-73.9721" },
    attributes: { "Good for kids": false, "Good for groups": true },
    parkingInfo: "Street parking; garage at 295 Flatbush Ave.",
    accessibility: ["Wheelchair accessible entrance", "Accessible restroom"],
    healthSafety: ["Max 12 students per class", "Mandated air purification"],
    updates: ["New 5:30am Sunrise Flow class starting Monday."],
    questions: [{ q: "Do I need to bring my own mat?", a: "Mats are provided, but you're welcome to bring your own.", votes: 31 }],
    similar: ["kori"],
  },
  {
    id: "atelier", name: "Atelier Fleur", tag: "Florist", trust: 95, meta: "Same-day delivery", x: 72, y: 28, color: "oklch(0.7 0.1 340)", open: true,
    address: "892 Nostrand Ave, Brooklyn, NY 11225", phone: "(718) 555-0412", website: "atelierfleur.com", priceLevel: 3, rating: 4.9, reviewCount: 189,
    hours: HOURS_STANDARD, popularTimes: [10, 15, 25, 40, 55, 45, 35, 40, 50, 60, 45, 30, 20, 15, 10, 5],
    description: "Artisan florist crafting bespoke arrangements for weddings, events, and daily luxury. Sourced directly from Dutch auctions and local growers.",
    amenities: ["Custom arrangements", "Subscription service", "Workshop classes", "Corporate accounts"],
    services: ["Weddings", "Events", "Subscriptions", "Workshops", "Delivery"],
    photos: [{ id: "p1", color: "from-pink-100 to-pink-300", caption: "Arrangement", by: "Atelier" }],
    reviews: generateReviews("atelier", 4), coordinates: { lat: "40.6701", lng: "-73.9503" },
    attributes: { "Delivery": true, "Same-day delivery": true },
    parkingInfo: "Loading zone in front; 30 min max.",
    accessibility: ["Step-free entrance"],
    healthSafety: ["Contactless delivery available", "Sanitized workspace"],
    updates: ["Valentine's pre-orders now open. Limited availability."],
    questions: [{ q: "How far do they deliver?", a: "Same-day within 5 miles. Next-day within 15 miles.", votes: 19 }],
    similar: ["kori"],
  },
  {
    id: "ostro", name: "Ostro Coffee", tag: "Cafe", trust: 93, meta: "Open · quiet", x: 23, y: 35, color: "oklch(0.6 0.08 70)", open: true,
    address: "77 Bedford Ave, Brooklyn, NY 11211", phone: "(718) 555-0555", website: "ostrocoffee.com", priceLevel: 1, rating: 4.5, reviewCount: 624,
    hours: HOURS_CAFE, popularTimes: [15, 20, 30, 50, 70, 60, 45, 55, 80, 90, 75, 60, 50, 40, 35, 25],
    description: "Specialty coffee roaster with direct-trade beans. Minimalist Scandinavian interior, ample laptop-friendly seating, and a seasonal pastry program.",
    amenities: ["Free Wi-Fi", "Power outlets", "Outdoor seating", "Dog friendly", "Plant-based milk"],
    services: ["Espresso bar", "Pour-over", "Cold brew", "Pastries", "Retail beans"],
    photos: [{ id: "p1", color: "from-orange-100 to-orange-300", caption: "Latte Art", by: "Ostro" }],
    reviews: generateReviews("ostro", 7), coordinates: { lat: "40.7178", lng: "-73.9571" },
    attributes: { "Outdoor seating": true, "Wi-Fi": true, "Dog friendly": true, "Vegan options": true },
    parkingInfo: "Street parking; bike rack available.",
    accessibility: ["Wheelchair accessible entrance", "Accessible restroom"],
    healthSafety: ["Reusable cup discount", "Composting program"],
    updates: ["New Ethiopian Yirgacheffe single origin now on bar."],
    questions: [{ q: "Is there Wi-Fi?", a: "Yes, password-free. 200 Mbps fiber.", votes: 45 }],
    similar: ["union"],
  },
  {
    id: "union", name: "Union Bike Co.", tag: "Repair", trust: 91, meta: "Tune-up in 45 min", x: 59, y: 48, color: "oklch(0.55 0.12 220)", open: false,
    address: "410 Fulton St, Brooklyn, NY 11201", phone: "(718) 555-0666", website: "unionbike.co", priceLevel: 2, rating: 4.7, reviewCount: 210,
    hours: [{ day: "Monday", open: "10:00", close: "19:00" }, { day: "Tuesday", open: "10:00", close: "19:00" }, { day: "Wednesday", open: "10:00", close: "19:00" }, { day: "Thursday", open: "10:00", close: "19:00" }, { day: "Friday", open: "10:00", close: "20:00" }, { day: "Saturday", open: "10:00", close: "18:00" }, { day: "Sunday", open: "11:00", close: "17:00" }],
    popularTimes: [5, 5, 10, 15, 25, 35, 40, 30, 20, 15, 10, 10, 15, 20, 15, 10],
    description: "Full-service bike shop specializing in urban commuters and e-bikes. Same-day tune-ups, custom builds, and a curated selection of accessories.",
    amenities: ["Test ride area", "E-bike charging", "Rental fleet", "Workshop classes"],
    services: ["Tune-ups", "Flat repair", "Wheel builds", "E-bike service", "Custom builds"],
    photos: [{ id: "p1", color: "from-sky-100 to-sky-300", caption: "Showroom", by: "Union" }],
    reviews: generateReviews("union", 4), coordinates: { lat: "40.6904", lng: "-73.9865" },
    attributes: { "Bike parking": true },
    parkingInfo: "Bike valet. Street parking for cars.",
    accessibility: ["Step-free entrance"],
    healthSafety: ["Tool sanitization between uses"],
    updates: ["Closed for inventory Jan 15-16. Online orders ship as normal."],
    questions: [{ q: "Do they sell e-bikes?", a: "Yes, Specialized, RadPower, and Cannondale authorized dealer.", votes: 11 }],
    similar: ["ostro"],
  },
  {
    id: "swift", name: "Swift Lock & Key", tag: "Locksmith", trust: 99, meta: "12 min ETA", x: 38, y: 22, color: "oklch(0.6 0.14 25)", open: true,
    address: "215 Nostrand Ave, Brooklyn, NY 11205", phone: "(718) 555-0777", website: "swiftlock.com", priceLevel: 2, rating: 4.9, reviewCount: 445,
    hours: HOURS_EMERGENCY, popularTimes: [20, 15, 15, 20, 30, 40, 50, 55, 50, 45, 40, 35, 30, 25, 20, 15],
    description: "24/7 emergency locksmith. Residential, commercial, and automotive. High-security locks, smart lock installation, and access control systems.",
    amenities: ["24/7 mobile service", "Licensed & bonded", "90-day warranty", "Smart lock specialist"],
    services: ["Lockouts", "Rekeying", "Smart locks", "Access control", "Safe opening"],
    photos: [{ id: "p1", color: "from-stone-100 to-stone-300", caption: "Van", by: "Swift" }],
    reviews: generateReviews("swift", 5), coordinates: { lat: "40.6934", lng: "-73.9523" },
    attributes: { "Open 24 hours": true },
    parkingInfo: "Mobile service — we come to you.",
    accessibility: ["ASL-fluent technician available"],
    healthSafety: ["ID verification required", "GPS-tracked vans"],
    updates: ["Now installing Matter-compatible smart locks."],
    questions: [{ q: "How much for a car lockout?", a: "$89 flat rate for standard vehicles. $129 for luxury/sophisticated systems.", votes: 67 }],
    similar: ["north-fork"],
  },
  {
    id: "paws", name: "Paws & Claws Vet", tag: "Vet", trust: 96, meta: "Walk-ins welcome", x: 80, y: 55, color: "oklch(0.65 0.08 150)", open: true,
    address: "780 Washington Ave, Brooklyn, NY 11238", phone: "(718) 555-0888", website: "pawsandclaws.vet", priceLevel: 2, rating: 4.8, reviewCount: 398,
    hours: [{ day: "Monday", open: "08:00", close: "20:00" }, { day: "Tuesday", open: "08:00", close: "20:00" }, { day: "Wednesday", open: "08:00", close: "20:00" }, { day: "Thursday", open: "08:00", close: "20:00" }, { day: "Friday", open: "08:00", close: "20:00" }, { day: "Saturday", open: "09:00", close: "17:00" }, { day: "Sunday", open: "10:00", close: "16:00" }],
    popularTimes: [10, 10, 15, 25, 40, 55, 70, 60, 45, 35, 30, 25, 20, 15, 10, 5],
    description: "Full-service animal hospital with emergency capacity. Digital radiology, in-house lab, surgery suite, and fear-free certified staff.",
    amenities: ["Separate cat/dog wards", "Fear Free certified", "Online pharmacy", "Pet boarding"],
    services: ["Wellness exams", "Vaccinations", "Surgery", "Dental", "Emergency", "Boarding"],
    photos: [{ id: "p1", color: "from-green-100 to-green-300", caption: "Lobby", by: "Paws" }],
    reviews: generateReviews("paws", 6), coordinates: { lat: "40.6734", lng: "-73.9631" },
    attributes: { "Good for kids": true },
    parkingInfo: "Dedicated client lot with 8 spaces.",
    accessibility: ["Wheelchair accessible", "Low-stress handling for anxious pets"],
    healthSafety: ["Separate isolation ward", "UV sanitization"],
    updates: ["Rabies vaccine clinic every third Saturday. $25."],
    questions: [{ q: "Do they see exotic pets?", a: "Yes, rabbits, guinea pigs, and reptiles. No avian at this time.", votes: 23 }],
    similar: ["halden"],
  },
  {
    id: "sakura", name: "Sakura Sushi Bar", tag: "Restaurant", trust: 97, meta: "Table in 15 min", x: 45, y: 45, color: "oklch(0.6 0.15 30)", open: true,
    address: "512 Fulton St, Brooklyn, NY 11201", phone: "(718) 555-0999", website: "sakurasushi.nyc", priceLevel: 3, rating: 4.7, reviewCount: 890,
    hours: [{ day: "Monday", open: "11:30", close: "22:30" }, { day: "Tuesday", open: "11:30", close: "22:30" }, { day: "Wednesday", open: "11:30", close: "22:30" }, { day: "Thursday", open: "11:30", close: "23:00" }, { day: "Friday", open: "11:30", close: "23:30" }, { day: "Saturday", open: "12:00", close: "23:30" }, { day: "Sunday", open: "12:00", close: "22:00" }],
    popularTimes: [5, 5, 10, 20, 35, 55, 80, 95, 90, 70, 50, 40, 45, 60, 75, 60],
    description: "Omakase-focused sushi bar with fish flown in daily from Toyosu Market. Intimate 12-seat counter and a full dining room.",
    amenities: ["Omakase counter", "Sake pairings", "Private dining", "Valet parking"],
    services: ["Dine-in", "Takeout", "Delivery", "Catering", "Private events"],
    photos: [{ id: "p1", color: "from-red-50 to-red-200", caption: "Sashimi", by: "Sakura" }],
    reviews: generateReviews("sakura", 8), coordinates: { lat: "40.6891", lng: "-73.9845" },
    attributes: { "Reservations": true, "Outdoor seating": false, "Good for groups": true },
    menuUrl: "https://sakurasushi.nyc/menu",
    reservationUrl: "https://resy.com/sakura",
    parkingInfo: "Valet available Fri-Sun. Garage at 520 Fulton St.",
    accessibility: ["Wheelchair accessible"],
    healthSafety: ["Sustainably sourced seafood", "Open kitchen"],
    updates: ["Winter omakase menu now features Hokkaido sea urchin."],
    questions: [{ q: "Do they have vegetarian options?", a: "Yes, a full vegetarian omakase is available with 48hr notice.", votes: 34 }],
    similar: ["ostro"],
  },
  {
    id: "metro", name: "Metro Fitness", tag: "Gym", trust: 94, meta: "Open 24h", x: 55, y: 60, color: "oklch(0.55 0.18 250)", open: true,
    address: "330 Atlantic Ave, Brooklyn, NY 11201", phone: "(718) 555-1010", website: "metrofitness.com", priceLevel: 2, rating: 4.4, reviewCount: 560,
    hours: HOURS_EMERGENCY, popularTimes: [30, 25, 20, 25, 40, 60, 80, 70, 50, 40, 35, 40, 50, 55, 45, 35],
    description: "Premium 24-hour fitness center with Olympic lifting platforms, a functional turf zone, and a dedicated recovery spa with sauna and cryo.",
    amenities: ["24/7 access", "Sauna", "Cryotherapy", "Pool", "Basketball court", "Childcare"],
    services: ["Personal training", "Group classes", "Swim lessons", "Physical therapy", "Nutrition coaching"],
    photos: [{ id: "p1", color: "from-indigo-100 to-indigo-300", caption: "Floor", by: "Metro" }],
    reviews: generateReviews("metro", 5), coordinates: { lat: "40.6872", lng: "-73.9801" },
    attributes: { "Pool": true, "Good for kids": true },
    parkingInfo: "Free parking lot. 50 spaces.",
    accessibility: ["Wheelchair accessible", "Adaptive equipment available"],
    healthSafety: ["Daily deep clean at 2am", "Air quality monitoring"],
    updates: ["New Peloton rowers installed in Cardio Zone B."],
    questions: [{ q: "Is there a contract?", a: "Month-to-month and annual options. No initiation fee in January.", votes: 41 }],
    similar: ["mira"],
  },
  {
    id: "liberty", name: "Liberty Gas", tag: "Gas", trust: 89, meta: "Price: $3.45", x: 15, y: 65, color: "oklch(0.65 0.2 85)", open: true,
    address: "100 Flatbush Ave, Brooklyn, NY 11217", phone: "(718) 555-1111", website: "", priceLevel: 1, rating: 4.1, reviewCount: 120,
    hours: [{ day: "Monday", open: "05:00", close: "23:00" }, { day: "Tuesday", open: "05:00", close: "23:00" }, { day: "Wednesday", open: "05:00", close: "23:00" }, { day: "Thursday", open: "05:00", close: "23:00" }, { day: "Friday", open: "05:00", close: "23:00" }, { day: "Saturday", open: "05:00", close: "23:00" }, { day: "Sunday", open: "06:00", close: "22:00" }],
    popularTimes: [20, 15, 15, 20, 30, 40, 35, 30, 25, 20, 20, 25, 30, 35, 30, 20],
    description: "Full-service gas station with convenience store, car wash, and air pump. Accepts fleet cards and Nexa Pay.",
    amenities: ["Car wash", "Convenience store", "Air pump", "Vacuum", "Propane exchange"],
    services: ["Fuel", "Car wash", "Propane", "Lottery", "ATM"],
    photos: [{ id: "p1", color: "from-yellow-50 to-yellow-200", caption: "Pumps", by: "Liberty" }],
    reviews: generateReviews("liberty", 3), coordinates: { lat: "40.6801", lng: "-73.9756" },
    attributes: { "Open 24 hours": false },
    parkingInfo: "Pay-at-pump. No extended parking.",
    accessibility: ["Wheelchair accessible pump"],
    healthSafety: ["Contactless payment available"],
    updates: ["Diesel price dropped to $3.89/gal."],
    questions: [{ q: "Do they have a bathroom?", a: "Yes, key required. Clean and maintained.", votes: 7 }],
    similar: ["union"],
  },
  {
    id: "brooklyn", name: "Brooklyn Heights Hotel", tag: "Hotel", trust: 95, meta: "Rooms from $189", x: 35, y: 80, color: "oklch(0.6 0.08 260)", open: true,
    address: "120 Atlantic Ave, Brooklyn, NY 11201", phone: "(718) 555-1212", website: "brooklynheights.hotel", priceLevel: 3, rating: 4.6, reviewCount: 780,
    hours: [{ day: "Monday", open: "00:00", close: "23:59", is24h: true }, { day: "Tuesday", open: "00:00", close: "23:59", is24h: true }, { day: "Wednesday", open: "00:00", close: "23:59", is24h: true }, { day: "Thursday", open: "00:00", close: "23:59", is24h: true }, { day: "Friday", open: "00:00", close: "23:59", is24h: true }, { day: "Saturday", open: "00:00", close: "23:59", is24h: true }, { day: "Sunday", open: "00:00", close: "23:59", is24h: true }],
    popularTimes: [40, 30, 25, 20, 25, 35, 45, 50, 45, 40, 35, 30, 25, 20, 15, 10],
    description: "Boutique hotel in a converted 1890s brownstone. Rooftop bar with Manhattan views, complimentary wine hour, and Nespresso in every room.",
    amenities: ["Rooftop bar", "Free Wi-Fi", "Fitness center", "Business center", "Pet friendly", "Valet parking"],
    services: ["Room service", "Concierge", "Laundry", "Airport shuttle", "Event space"],
    photos: [{ id: "p1", color: "from-violet-100 to-violet-300", caption: "Lobby", by: "BHH" }],
    reviews: generateReviews("brooklyn", 6), coordinates: { lat: "40.6931", lng: "-73.9934" },
    attributes: { "Pet friendly": true, "Pool": false, "Wi-Fi": true },
    parkingInfo: "Valet $45/night. Self-park garage adjacent.",
    accessibility: ["Wheelchair accessible rooms", "ADA compliant bathrooms"],
    healthSafety: ["Enhanced cleaning protocols", "Digital key entry"],
    updates: ["Rooftop winter igloos now open for reservations."],
    questions: [{ q: "Is breakfast included?", a: "Continental breakfast included. Full breakfast available for $18.", votes: 28 }],
    similar: ["sakura"],
  },
  {
    id: "greenwood", name: "Greenwood Park", tag: "Park", trust: 90, meta: "Open · 85 acres", x: 85, y: 35, color: "oklch(0.65 0.14 140)", open: true,
    address: "500 25th St, Brooklyn, NY 11232", phone: "(718) 555-1313", website: "nycgovparks.org", priceLevel: 0, rating: 4.8, reviewCount: 1200,
    hours: [{ day: "Monday", open: "06:00", close: "22:00" }, { day: "Tuesday", open: "06:00", close: "22:00" }, { day: "Wednesday", open: "06:00", close: "22:00" }, { day: "Thursday", open: "06:00", close: "22:00" }, { day: "Friday", open: "06:00", close: "22:00" }, { day: "Saturday", open: "06:00", close: "22:00" }, { day: "Sunday", open: "06:00", close: "22:00" }],
    popularTimes: [5, 5, 10, 20, 30, 35, 40, 35, 30, 25, 30, 40, 50, 45, 35, 25],
    description: "Historic 19th-century cemetery turned public park. National Historic Landmark with ornate mausoleums, rolling hills, and guided tours.",
    amenities: ["Public restrooms", "Guided tours", "Bird watching", "Historic monuments", "Greenmarket"],
    services: ["Tours", "Events", "Photography permits", "Nature walks"],
    photos: [{ id: "p1", color: "from-emerald-100 to-emerald-300", caption: "Mausoleum", by: "NYC Parks" }],
    reviews: generateReviews("greenwood", 4), coordinates: { lat: "40.6584", lng: "-73.9942" },
    attributes: { "Good for kids": true, "Dog friendly": true, "Free entry": true },
    parkingInfo: "Free street parking along perimeter.",
    accessibility: ["Paved paths", "Accessible restroom"],
    healthSafety: ["Tick awareness signs", "Water fountains sanitized daily"],
    updates: ["Free guided bird walk every Saturday at 9am."],
    questions: [{ q: "Can I bring my dog?", a: "Yes, on-leash in designated areas. Off-leash before 9am.", votes: 56 }],
    similar: ["mira"],
  },
  {
    id: "techhub", name: "Brooklyn Tech Hub", tag: "Coworking", trust: 93, meta: "Day pass $35", x: 48, y: 50, color: "oklch(0.55 0.1 280)", open: true,
    address: "55 Willoughby St, Brooklyn, NY 11201", phone: "(718) 555-1414", website: "brooklyntechhub.io", priceLevel: 2, rating: 4.5, reviewCount: 310,
    hours: [{ day: "Monday", open: "07:00", close: "22:00" }, { day: "Tuesday", open: "07:00", close: "22:00" }, { day: "Wednesday", open: "07:00", close: "22:00" }, { day: "Thursday", open: "07:00", close: "22:00" }, { day: "Friday", open: "07:00", close: "22:00" }, { day: "Saturday", open: "09:00", close: "18:00" }, { day: "Sunday", open: "10:00", close: "18:00" }],
    popularTimes: [10, 10, 15, 30, 60, 85, 90, 80, 70, 60, 50, 45, 40, 35, 25, 15],
    description: "Developer-focused coworking space with standing desks, 10Gbps internet, private phone booths, and a hardware lab with 3D printers.",
    amenities: ["10Gbps internet", "Standing desks", "Phone booths", "Hardware lab", "Shower", "Nap room"],
    services: ["Hot desks", "Dedicated desks", "Private offices", "Event space", "Mentorship"],
    photos: [{ id: "p1", color: "from-slate-100 to-slate-300", caption: "Main floor", by: "BTH" }],
    reviews: generateReviews("techhub", 5), coordinates: { lat: "40.6912", lng: "-73.9856" },
    attributes: { "Wi-Fi": true, "Good for groups": true },
    parkingInfo: "Garage discount with validation.",
    accessibility: ["Wheelchair accessible", "Adjustable height desks"],
    healthSafety: ["UV-C air sanitization", "Touchless entry"],
    updates: ["New GPU cluster available for ML training sessions."],
    questions: [{ q: "Is there a kitchen?", a: "Full kitchen with espresso machine, kombucha on tap, and snacks.", votes: 19 }],
    similar: ["ostro"],
  },
  {
    id: "pharma", name: "City Pharmacy", tag: "Pharmacy", trust: 97, meta: "Drive-thru open", x: 62, y: 40, color: "oklch(0.6 0.12 200)", open: true,
    address: "680 Fulton St, Brooklyn, NY 11217", phone: "(718) 555-1515", website: "citypharmacy.com", priceLevel: 1, rating: 4.3, reviewCount: 450,
    hours: [{ day: "Monday", open: "07:00", close: "22:00" }, { day: "Tuesday", open: "07:00", close: "22:00" }, { day: "Wednesday", open: "07:00", close: "22:00" }, { day: "Thursday", open: "07:00", close: "22:00" }, { day: "Friday", open: "07:00", close: "22:00" }, { day: "Saturday", open: "08:00", close: "20:00" }, { day: "Sunday", open: "09:00", close: "18:00" }],
    popularTimes: [15, 15, 20, 30, 45, 55, 50, 40, 35, 30, 25, 25, 30, 35, 30, 20],
    description: "Full-service pharmacy with drive-thru, compounding lab, and travel clinic. Flu shots available without appointment.",
    amenities: ["Drive-thru", "Compounding", "Travel clinic", "Auto-refill", "Delivery"],
    services: ["Prescriptions", "Vaccinations", "Health screenings", "Compounding", "Delivery"],
    photos: [{ id: "p1", color: "from-cyan-100 to-cyan-300", caption: "Counter", by: "CityRx" }],
    reviews: generateReviews("pharma", 4), coordinates: { lat: "40.6849", lng: "-73.9789" },
    attributes: { "Drive-thru": true, "Delivery": true },
    parkingInfo: "Drive-thru lane + 10 min parking spots.",
    accessibility: ["Wheelchair accessible", "Drive-thru for mobility-impaired"],
    healthSafety: ["Pharmacist consultation private room", "Sterile compounding suite"],
    updates: ["COVID boosters and flu shots available walk-in."],
    questions: [{ q: "Do they accept my insurance?", a: "We accept all major plans. Verify online in 30 seconds.", votes: 33 }],
    similar: ["halden"],
  },
  {
    id: "cinema", name: "Alamo Drafthouse", tag: "Cinema", trust: 94, meta: "Dune: Part Two · 7pm", x: 28, y: 50, color: "oklch(0.55 0.18 300)", open: true,
    address: "445 Albee Square, Brooklyn, NY 11201", phone: "(718) 555-1616", website: "drafthouse.com", priceLevel: 2, rating: 4.6, reviewCount: 670,
    hours: [{ day: "Monday", open: "11:00", close: "23:00" }, { day: "Tuesday", open: "11:00", close: "23:00" }, { day: "Wednesday", open: "11:00", close: "23:00" }, { day: "Thursday", open: "11:00", close: "23:00" }, { day: "Friday", open: "11:00", close: "00:00" }, { day: "Saturday", open: "10:00", close: "00:00" }, { day: "Sunday", open: "10:00", close: "23:00" }],
    popularTimes: [5, 5, 5, 10, 15, 25, 40, 60, 80, 90, 85, 70, 55, 45, 35, 25],
    description: " dine-in cinema with strict no-talking/no-texting policy. Full bar, craft cocktails, and a seasonal menu delivered to your seat.",
    amenities: ["Reclining seats", "In-seat service", "Full bar", "Event rentals", "Parking validation"],
    services: ["New releases", "Retro screenings", "Private events", "Film parties"],
    photos: [{ id: "p1", color: "from-purple-100 to-purple-300", caption: "Auditorium", by: "Alamo" }],
    reviews: generateReviews("cinema", 6), coordinates: { lat: "40.6901", lng: "-73.9812" },
    attributes: { "Reservations": true, "Good for groups": true },
    parkingInfo: "Validated at Fulton Mall garage.",
    accessibility: ["Wheelchair accessible", "Closed captioning devices", "Audio description"],
    healthSafety: ["Contactless ordering via app", "Enhanced HVAC filtration"],
    updates: ["Dune: Part Two in 70mm starting Friday."],
    questions: [{ q: "Can you order food during the movie?", a: "Yes, write your order on the card and staff collect silently.", votes: 89 }],
    similar: ["sakura"],
  },
];

const CAT_ICONS: Record<string, JSX.Element> = {
  Salon: <path d="M6 2l2 6-2 2 8 10M18 2l-2 6 2 2-8 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Dental: <path d="M12 3c-1.5 0-4 1.5-4 5s1 5 4 5 4-2 4-5-2.5-5-4-5zM8 13l-1 6M16 13l1 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Emergency: <path d="M12 2L2 19h20L12 2zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Wellness: <path d="M12 22V12M12 12C12 7 7 4 4 7s1 9 8 15M12 12c0-5 5-8 8-5s-1 9-8 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Florist: <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" fill="none" />,
  Cafe: <path d="M6 2h12l2 4H4L6 2zM4 6v12a2 2 0 002 2h12a2 2 0 002-2V6M9 11a3 3 0 106 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Repair: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3-3a8 8 0 01-11 11l-4 4a2 2 0 01-3-3l4-4a8 8 0 0111-11z" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
  Locksmith: <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" fill="none" />,
  Vet: <path d="M3 9a1 1 0 011-1h1a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V9zM19 9a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 01-1-1V9a1 1 0 011-1h1zM9 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM8 20v-4a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />,
  Restaurant: <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  Gym: <path d="M6 4h12M6 20h12M6 4v16M18 4v16M3 8h3M3 16h3M18 8h3M18 16h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Gas: <path d="M3 22V8a2 2 0 012-2h8a2 2 0 012 2v14M17 22V4a2 2 0 012-2h2a2 2 0 012 2v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Hotel: <path d="M2 22h20M4 22V10l8-6 8 6v12M9 22v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Park: <path d="M12 22V8M12 8c0-4-4-6-6-3s2 7 6 10M12 8c0-4 4-6 6-3s-2 7-6 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Coworking: <path d="M4 22V10l4-2 4 2 4-2 4 2v12M4 22h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  Pharmacy: <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  Cinema: <path d="M4 4h16v14H4zM8 22l2-4M16 22l-2-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />,
};

/* ═══════════════════════════════════════════════════════════════════════════════
   THEME ENGINE — Google Maps palette system
   ═══════════════════════════════════════════════════════════════════════════════ */
const THEMES = {
  light: {
    bg: "#f1f3f4",
    water: "#aadaff",
    waterDeep: "#8ecae6",
    park: "#c8e6c9",
    parkDark: "#a5d6a7",
    roadMain: "#ffffff",
    roadSecond: "#fbfaf7",
    roadTertiary: "#f5f5f5",
    alley: "#e8e8e8",
    highway: "#f5e1a4",
    highwayStroke: "#e8c97b",
    highwayText: "#5c4a36",
    trafficLow: "#4caf50",
    trafficMed: "#ff9800",
    trafficHigh: "#f44336",
    building: "#e9e5dc",
    buildingStroke: "#dfdbd2",
    buildingShadow: "rgba(180,175,165,0.4)",
    label: "#8c8273",
    labelMain: "#5f5f5f",
    neighborhood: "rgba(0,0,0,0.12)",
    poi: "#9e9e9e",
    poiBg: "#ffffff",
    transit: "#1E88E5",
    transitLight: "#64b5f6",
    construction: "#f0dca8",
    constructionStroke: "#d49a37",
    boundary: "#bdbdbd",
    rail: "#9e9e9e",
    railTie: "#e0e0e0",
    tunnel: "#d7ccc8",
    bridge: "#ffffff",
    airport: "#cfd8dc",
    runway: "#eceff1",
    hospital: "#ef9a9a",
    school: "#ffcc80",
    shopping: "#ce93d8",
    industrial: "#bcaaa4",
    residential: "#efebe9",
    cemetery: "#c8e6c9",
    stadium: "#b0bec5",
    commercial: "rgba(255,200,150,0.1)",
    education: "rgba(200,220,240,0.3)",
    overlay: "rgba(255,255,255,0.05)",
    grid: "#eeeeee",
  },
  dark: {
    bg: "#1a1b1e",
    water: "#112330",
    waterDeep: "#0d1b26",
    park: "#1b2a21",
    parkDark: "#22352a",
    roadMain: "#2c2c2c",
    roadSecond: "#242424",
    roadTertiary: "#1f1f1f",
    alley: "#202020",
    highway: "#4a3c2c",
    highwayStroke: "#5c4a36",
    highwayText: "#f0dca8",
    trafficLow: "#2e7d32",
    trafficMed: "#ef6c00",
    trafficHigh: "#c62828",
    building: "#262626",
    buildingStroke: "#1f1f1f",
    buildingShadow: "rgba(0,0,0,0.5)",
    label: "#888888",
    labelMain: "#aaaaaa",
    neighborhood: "rgba(255,255,255,0.15)",
    poi: "#555555",
    poiBg: "#1a1b1e",
    transit: "#42a5f5",
    transitLight: "#1e88e5",
    construction: "#3a3020",
    constructionStroke: "#d49a37",
    boundary: "#424242",
    rail: "#444444",
    railTie: "#222222",
    tunnel: "#3e2723",
    bridge: "#2c2c2c",
    airport: "#263238",
    runway: "#37474f",
    hospital: "#702222",
    school: "#704822",
    shopping: "#4a2358",
    industrial: "#3e2723",
    residential: "#212121",
    cemetery: "#1b2a21",
    stadium: "#263238",
    commercial: "rgba(255,150,100,0.03)",
    education: "rgba(150,200,255,0.03)",
    overlay: "rgba(0,0,0,0.2)",
    grid: "#2c2c2c",
  },
  satellite: {
    bg: "#d4cbb8",
    water: "#3b6e8f",
    waterDeep: "#2a4d66",
    park: "#2d4a2d",
    parkDark: "#1e331e",
    roadMain: "rgba(255,255,255,0.85)",
    roadSecond: "rgba(255,255,255,0.7)",
    roadTertiary: "rgba(255,255,255,0.5)",
    alley: "rgba(255,255,255,0.2)",
    highway: "#f5e1a4",
    highwayStroke: "#e8c97b",
    highwayText: "#5c4a36",
    trafficLow: "#4caf50",
    trafficMed: "#ff9800",
    trafficHigh: "#f44336",
    building: "#c4b9a8",
    buildingStroke: "#b0a594",
    buildingShadow: "rgba(0,0,0,0.3)",
    label: "#ffffff",
    labelMain: "#ffffff",
    neighborhood: "rgba(255,255,255,0.3)",
    poi: "#ffffff",
    poiBg: "rgba(0,0,0,0.6)",
    transit: "#42a5f5",
    transitLight: "#64b5f6",
    construction: "#d49a37",
    constructionStroke: "#b07d1e",
    boundary: "#ffffff",
    rail: "#ffffff",
    railTie: "transparent",
    tunnel: "rgba(0,0,0,0.3)",
    bridge: "#ffffff",
    airport: "#4a5d6e",
    runway: "#6b7f91",
    hospital: "#c62828",
    school: "#f9a825",
    shopping: "#8e24aa",
    industrial: "#6d4c41",
    residential: "#a1887f",
    cemetery: "#2e7d32",
    stadium: "#546e7a",
    commercial: "rgba(255,200,150,0.15)",
    education: "rgba(200,220,240,0.2)",
    overlay: "rgba(0,0,0,0.1)",
    grid: "transparent",
  },
  terrain: {
    bg: "#e8e0d0",
    water: "#8ecae6",
    waterDeep: "#6baed6",
    park: "#a8d5a2",
    parkDark: "#8bc34a",
    roadMain: "#ffffff",
    roadSecond: "#fafafa",
    roadTertiary: "#f5f5f5",
    alley: "#e0e0e0",
    highway: "#f5e1a4",
    highwayStroke: "#e8c97b",
    highwayText: "#5c4a36",
    trafficLow: "#4caf50",
    trafficMed: "#ff9800",
    trafficHigh: "#f44336",
    building: "#d7ccc8",
    buildingStroke: "#bcaaa4",
    buildingShadow: "rgba(0,0,0,0.2)",
    label: "#5d4037",
    labelMain: "#3e2723",
    neighborhood: "rgba(93,64,55,0.2)",
    poi: "#5d4037",
    poiBg: "#ffffff",
    transit: "#1E88E5",
    transitLight: "#64b5f6",
    construction: "#f0dca8",
    constructionStroke: "#d49a37",
    boundary: "#8d6e63",
    rail: "#795548",
    railTie: "#d7ccc8",
    tunnel: "#a1887f",
    bridge: "#ffffff",
    airport: "#bcaaa4",
    runway: "#d7ccc8",
    hospital: "#e57373",
    school: "#ffb74d",
    shopping: "#ba68c8",
    industrial: "#8d6e63",
    residential: "#d7ccc8",
    cemetery: "#a5d6a7",
    stadium: "#b0bec5",
    commercial: "rgba(255,200,150,0.15)",
    education: "rgba(200,220,240,0.3)",
    overlay: "rgba(0,0,0,0.02)",
    grid: "#d7ccc8",
  },
};

type MapTheme = "light" | "dark" | "satellite" | "terrain";

/* ═══════════════════════════════════════════════════════════════════════════════
   ULTRA-DETAILED SVG MAP TILES — Full city simulation
   ═══════════════════════════════════════════════════════════════════════════════ */
function MapTiles({ theme, showTraffic, showTransit, showBiking, show3D, showStreetView }: {
  theme: MapTheme;
  showTraffic: boolean;
  showTransit: boolean;
  showBiking: boolean;
  show3D: boolean;
  showStreetView: boolean;
}) {
  const t = THEMES[theme];
  const is3D = show3D && theme !== "satellite";

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: is3D ? "drop-shadow(0 20px 30px rgba(0,0,0,0.3))" : "none" }}
    >
      <defs>
        <pattern id="const-pattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#f0dca8" />
          <rect x="5" width="5" height="10" fill="#e9e5dc" />
        </pattern>
        <pattern id="const-pattern-dark" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#3a3020" />
          <rect x="5" width="5" height="10" fill="#262626" />
        </pattern>
        <pattern id="grid-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke={t.grid} strokeWidth="0.5" opacity="0.3" />
        </pattern>
        <pattern id="trees" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="3" fill={theme === "dark" ? "#2e4a33" : "#81c784"} opacity="0.6" />
          <circle cx="4" cy="4" r="2" fill={theme === "dark" ? "#1b2a21" : "#a5d6a7"} opacity="0.4" />
        </pattern>
        <pattern id="waves" width="40" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 5 Q10 0 20 5 T40 5" fill="none" stroke={theme === "dark" ? "#172d3e" : "#9bcbf5"} strokeWidth="1" opacity="0.5" />
        </pattern>
        <pattern id="satellite-residential" width="30" height="30" patternUnits="userSpaceOnUse">
          <rect width="30" height="30" fill={theme === "satellite" ? "#a1887f" : "transparent"} opacity="0.3" />
          <rect x="5" y="5" width="20" height="20" fill={theme === "satellite" ? "#8d6e63" : "transparent"} opacity="0.2" rx="2" />
        </pattern>
        <pattern id="satellite-industrial" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill={theme === "satellite" ? "#6d4c41" : "transparent"} opacity="0.3" />
          <circle cx="20" cy="20" r="8" fill={theme === "satellite" ? "#5d4037" : "transparent"} opacity="0.2" />
        </pattern>
        <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={t.water} />
          <stop offset="100%" stopColor={t.waterDeep} />
        </linearGradient>
        <linearGradient id="park-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={t.park} />
          <stop offset="100%" stopColor={t.parkDark} />
        </linearGradient>
        <filter id="building-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Base */}
      <rect width="1000" height="700" fill={t.bg} />
      {theme !== "satellite" && <rect width="1000" height="700" fill="url(#grid-pattern)" />}

      {/* Zoning */}
      <rect x="200" y="150" width="250" height="300" fill={t.commercial} />
      <rect x="650" y="450" width="350" height="250" fill={t.commercial} />
      <path d="M 50 400 L 200 400 L 200 600 L 50 600 Z" fill={t.education} />
      <rect x="800" y="100" width="200" height="200" fill={theme === "satellite" ? "url(#satellite-industrial)" : t.industrial} opacity="0.4" />
      <rect x="100" y="500" width="300" height="200" fill={theme === "satellite" ? "url(#satellite-residential)" : t.residential} opacity="0.3" />

      {/* Water Bodies */}
      <path d="M 600 700 Q 650 600 750 550 T 1000 450 L 1000 700 Z" fill="url(#water-grad)" opacity="0.95" />
      <path d="M 0 0 L 250 0 Q 300 50 250 150 T 150 250 Q 50 280 0 200 Z" fill="url(#water-grad)" opacity="0.95" />
      <path d="M 850 0 L 1000 0 L 1000 150 Q 900 100 850 0 Z" fill="url(#water-grad)" opacity="0.95" />
      <path d="M 350 300 Q 400 320 420 380 T 480 420 Q 520 400 500 350 T 450 300 Z" fill="url(#water-grad)" opacity="0.8" />

      {/* Coastlines & Waves */}
      <path d="M 590 700 Q 640 590 740 540 T 990 440" fill="none" stroke={theme === "dark" ? "#172d3e" : "#9bcbf5"} strokeWidth="4" />
      <path d="M 580 700 Q 630 580 730 530 T 980 430" fill="none" stroke={theme === "dark" ? "#172d3e" : "#9bcbf5"} strokeWidth="2" opacity="0.5" />
      <path d="M 10 205 Q 60 285 160 255 T 260 150 Q 310 50 260 0" fill="none" stroke={theme === "dark" ? "#172d3e" : "#9bcbf5"} strokeWidth="4" />
      <rect x="600" y="450" width="400" height="250" fill="url(#waves)" opacity="0.3" pointerEvents="none" />

      {/* River */}
      <path d="M 0 350 Q 150 330 250 380 T 400 360 Q 500 340 550 380 T 650 350" fill="none" stroke="url(#water-grad)" strokeWidth="18" opacity="0.8" />
      <path d="M 0 350 Q 150 330 250 380 T 400 360 Q 500 340 550 380 T 650 350" fill="none" stroke={theme === "dark" ? "#1a3a4a" : "#81d4fa"} strokeWidth="8" opacity="0.6" />
      {/* River flow animation */}
      <motion.path d="M 0 350 Q 150 330 250 380 T 400 360 Q 500 340 550 380 T 650 350" fill="none" stroke={theme === "dark" ? "#42a5f5" : "#e1f5fe"} strokeWidth="2" strokeDasharray="10 20" opacity="0.6"
        animate={{ strokeDashoffset: [0, -30] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />

      {/* Parks & Forests */}
      <path d="M 80 300 Q 120 280 180 320 T 200 400 Q 150 420 100 380 Z" fill="url(#park-grad)" />
      <path d="M 80 300 Q 120 280 180 320 T 200 400 Q 150 420 100 380 Z" fill="url(#trees)" opacity="0.6" />
      <path d="M 380 60 Q 450 40 500 80 T 520 150 Q 420 180 380 120 Z" fill="url(#park-grad)" />
      <path d="M 380 60 Q 450 40 500 80 T 520 150 Q 420 180 380 120 Z" fill="url(#trees)" opacity="0.6" />
      <path d="M 680 200 Q 750 180 800 240 T 780 350 Q 650 320 680 200 Z" fill="url(#park-grad)" />
      <path d="M 450 450 Q 550 400 620 480 T 580 600 Q 450 580 450 450 Z" fill="url(#park-grad)" />
      <path d="M 850 350 Q 950 300 980 400 T 900 480 Z" fill="url(#park-grad)" />
      <path d="M 450 450 Q 550 400 620 480 T 580 600 Q 450 580 450 450 Z" fill="url(#trees)" opacity="0.5" />

      {/* Park Trails */}
      <path d="M 90 310 Q 140 330 180 360 T 150 400" fill="none" stroke={theme === "dark" ? "#22352a" : "#b5ccae"} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 400 80 Q 480 100 450 150" fill="none" stroke={theme === "dark" ? "#22352a" : "#b5ccae"} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 700 220 Q 750 280 700 320" fill="none" stroke={theme === "dark" ? "#22352a" : "#b5ccae"} strokeWidth="2" strokeDasharray="4 4" />
      <path d="M 480 480 Q 550 500 580 560" fill="none" stroke={theme === "dark" ? "#22352a" : "#b5ccae"} strokeWidth="2" strokeDasharray="4 4" />

      {/* Bike Lanes */}
      {showBiking && (
        <g>
          <path d="M 0 145 L 1000 145" stroke="#4caf50" strokeWidth="3" strokeDasharray="8 4" opacity="0.7" />
          <path d="M 0 305 L 1000 305" stroke="#4caf50" strokeWidth="3" strokeDasharray="8 4" opacity="0.7" />
          <path d="M 225 0 L 225 700" stroke="#4caf50" strokeWidth="3" strokeDasharray="8 4" opacity="0.7" />
          <path d="M 0 500 Q 300 450 600 500 T 1000 480" stroke="#4caf50" strokeWidth="3" strokeDasharray="8 4" opacity="0.7" fill="none" />
        </g>
      )}

      {/* Tertiary / Alley Grid */}
      {[20, 70, 115, 170, 220, 270, 315, 365, 415, 465, 515, 565, 615, 665, 715, 765, 815, 865, 915, 965].map((y) => (
        <rect key={`a_h${y}`} x="0" y={y} width="1000" height="2" fill={t.alley} />
      ))}
      {[20, 70, 115, 170, 220, 270, 315, 365, 415, 465, 515, 565, 615, 665, 715, 765, 815, 865, 915, 965].map((x) => (
        <rect key={`a_v${x}`} x={x} y="0" width="2" height="700" fill={t.alley} />
      ))}

      {/* Secondary Streets */}
      {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 690, 740, 790, 840, 890, 940, 990].map((y) => (
        <rect key={`h${y}`} x="0" y={y} width="1000" height="5" fill={t.roadSecond} />
      ))}
      {[40, 90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640, 690, 740, 790, 840, 890, 940, 990].map((x) => (
        <rect key={`v${x}`} x={x} y="0" width="5" height="700" fill={t.roadSecond} />
      ))}

      {/* Diagonal Avenues */}
      <line x1="0" y1="100" x2="1000" y2="400" stroke={t.roadMain} strokeWidth="16" strokeLinecap="round" />
      <line x1="200" y1="700" x2="700" y2="0" stroke={t.roadMain} strokeWidth="14" strokeLinecap="round" />
      <line x1="0" y1="600" x2="600" y2="0" stroke={t.roadSecond} strokeWidth="8" strokeLinecap="round" />
      <line x1="1000" y1="100" x2="700" y2="700" stroke={t.roadSecond} strokeWidth="8" strokeLinecap="round" />

      {/* Major Arterial Grid */}
      {[136, 296, 456, 596].map(y => <rect key={`Mh${y}`} x="0" y={y} width="1000" height="20" fill={t.roadMain} />)}
      {[216, 436, 656, 856].map(x => <rect key={`Mv${x}`} x={x} y="0" width="20" height="700" fill={t.roadMain} />)}

      {/* Highway / Expressway */}
      <path d="M 0 650 Q 300 650 500 500 T 800 0" fill="none" stroke={t.highwayStroke} strokeWidth="24" strokeLinecap="round" />
      <path d="M 0 650 Q 300 650 500 500 T 800 0" fill="none" stroke={t.highway} strokeWidth="18" strokeLinecap="round" />

      {/* Highway Overpasses */}
      <path d="M 200 480 Q 400 350 1000 250" fill="none" stroke={t.highwayStroke} strokeWidth="20" strokeLinecap="round" opacity="0.95" />
      <path d="M 200 480 Q 400 350 1000 250" fill="none" stroke={t.highway} strokeWidth="14" strokeLinecap="round" opacity="0.95" />

      {/* Highway Shields */}
      <g transform="translate(620, 200)">
        <path d="M 0 0 L 20 0 L 24 10 L 10 24 L -4 10 Z" fill="#2563EB" stroke="#FFF" strokeWidth="1" />
        <path d="M 0 0 L 20 0 L 24 10 L 10 24 L -4 10 Z" fill="none" stroke="#E11D48" strokeWidth="3" transform="scale(0.8) translate(2.5, 2)" />
        <text x="10" y="14" fontSize="8" fill="#FFF" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">95</text>
      </g>
      <g transform="translate(320, 580)">
        <path d="M 0 0 L 20 0 L 24 10 L 10 24 L -4 10 Z" fill="#2563EB" stroke="#FFF" strokeWidth="1" />
        <path d="M 0 0 L 20 0 L 24 10 L 10 24 L -4 10 Z" fill="none" stroke="#E11D48" strokeWidth="3" transform="scale(0.8) translate(2.5, 2)" />
        <text x="10" y="14" fontSize="8" fill="#FFF" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">95</text>
      </g>
      <g transform="translate(450, 350)">
        <rect x="-10" y="-8" width="20" height="16" rx="3" fill="#FFF" stroke="#333" strokeWidth="1" />
        <text x="0" y="4" fontSize="8" fill="#333" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">27</text>
      </g>

      {/* Roundabouts */}
      <circle cx="500" cy="350" r="25" fill={t.roadMain} stroke={t.roadSecond} strokeWidth="2" />
      <circle cx="500" cy="350" r="8" fill={t.park} />
      <circle cx="300" cy="200" r="20" fill={t.roadMain} stroke={t.roadSecond} strokeWidth="2" />
      <circle cx="300" cy="200" r="6" fill={t.park} />

      {/* Tunnels (dashed) */}
      <path d="M 100 136 L 200 136" stroke={t.tunnel} strokeWidth="18" strokeDasharray="8 4" opacity="0.8" />
      <path d="M 800 456 L 950 456" stroke={t.tunnel} strokeWidth="18" strokeDasharray="8 4" opacity="0.8" />
      <text x="150" y="132" fontSize="7" fill={t.label} opacity="0.6">TUNNEL</text>

      {/* Bridges */}
      <path d="M 400 350 Q 500 330 600 350" fill="none" stroke={t.bridge} strokeWidth="12" opacity="0.9" />
      <path d="M 400 350 Q 500 330 600 350" fill="none" stroke={t.roadMain} strokeWidth="8" opacity="0.9" />

      {/* Live Traffic */}
      {showTraffic && (
        <g>
          <path d="M 350 575 Q 500 500 600 300" fill="none" stroke={t.trafficMed} strokeWidth="6" strokeLinecap="round" opacity="0.8" />
          <path d="M 450 520 Q 500 500 520 460" fill="none" stroke={t.trafficHigh} strokeWidth="6" strokeLinecap="round" opacity="0.9" />
          <path d="M 400 350 Q 600 300 800 280" fill="none" stroke={t.trafficMed} strokeWidth="4" strokeLinecap="round" opacity="0.8" />
          <path d="M 500 330 Q 600 300 650 295" fill="none" stroke={t.trafficHigh} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
          <path d="M 0 145 Q 200 145 400 145" fill="none" stroke={t.trafficLow} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          <path d="M 600 145 Q 800 145 1000 145" fill="none" stroke={t.trafficMed} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
          {/* Animated traffic particles */}
          <motion.circle r="3" fill={t.trafficHigh} opacity="0.8">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 450 520 Q 500 500 520 460" />
          </motion.circle>
          <motion.circle r="3" fill={t.trafficMed} opacity="0.8">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 350 575 Q 500 500 600 300" />
          </motion.circle>
        </g>
      )}

      {/* Transit Lines */}
      {showTransit && (
        <g>
          <path d="M 0 250 Q 300 200 500 300 T 1000 250" fill="none" stroke={t.transit} strokeWidth="4" opacity="0.8" />
          <path d="M 0 250 Q 300 200 500 300 T 1000 250" fill="none" stroke="#FFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
          <path d="M 300 0 L 300 700" fill="none" stroke="#9c27b0" strokeWidth="4" opacity="0.7" />
          <path d="M 300 0 L 300 700" fill="none" stroke="#FFF" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <path d="M 0 500 Q 400 450 700 550 T 1000 500" fill="none" stroke="#ff9800" strokeWidth="4" opacity="0.7" />
          {/* Subway stations */}
          {[[225, 145], [445, 305], [665, 465], [865, 145], [320, 250], [300, 400], [500, 300], [700, 550]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x-6},${y-6})`}>
              <circle cx="6" cy="6" r="7" fill={t.poiBg} stroke={t.transit} strokeWidth="2" />
              <text x="6" y="9" fontSize="7" fill={t.transit} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">M</text>
            </g>
          ))}
        </g>
      )}

      {/* Street View Coverage */}
      {showStreetView && (
        <g opacity="0.15">
          <path d="M 0 145 L 1000 145" stroke="#ffeb3b" strokeWidth="8" />
          <path d="M 0 305 L 1000 305" stroke="#ffeb3b" strokeWidth="8" />
          <path d="M 225 0 L 225 700" stroke="#ffeb3b" strokeWidth="8" />
          <path d="M 0 650 Q 300 650 500 500 T 800 0" stroke="#ffeb3b" strokeWidth="8" fill="none" />
        </g>
      )}

      {/* 3D Buildings */}
      <g>
        {[
          [240, 20, 180, 100], [450, 20, 100, 100], [570, 20, 70, 100], [680, 20, 160, 100],
          [240, 160, 90, 120], [350, 160, 70, 120], [460, 160, 80, 120], [560, 160, 80, 120],
          [20, 160, 180, 120], [20, 320, 180, 120], [240, 320, 80, 120], [340, 320, 80, 120],
          [460, 320, 180, 120], [680, 320, 160, 120], [20, 480, 180, 100], [240, 480, 180, 100],
          [460, 480, 180, 100], [680, 480, 120, 100], [20, 620, 180, 60], [240, 620, 180, 60],
          [460, 620, 180, 60], [680, 620, 80, 60],
          [880, 20, 100, 100], [880, 160, 100, 120], [880, 320, 100, 120],
          [100, 40, 30, 40], [150, 40, 30, 40], [350, 40, 30, 40], [390, 40, 30, 40],
          [680, 160, 50, 50], [740, 160, 50, 50], [680, 230, 50, 50], [740, 230, 50, 50],
          [240, 440, 40, 30], [300, 440, 40, 30], [360, 440, 40, 30], [460, 440, 60, 30],
          [500, 200, 40, 60], [550, 250, 50, 70], [600, 180, 40, 50],
          [750, 500, 80, 80], [850, 550, 60, 60], [920, 500, 50, 50],
          [150, 550, 60, 40], [220, 580, 40, 30], [300, 550, 50, 40],
        ].map(([x, y, w, h], i) => (
          <g key={`b${i}`}>
            <rect x={x + (is3D ? 4 : 3)} y={y + (is3D ? 6 : 4)} width={w} height={h} rx="3" fill={t.buildingShadow} />
            {is3D && (
              <path d={`M ${x} ${y} L ${x+4} ${y-6} L ${x+w+4} ${y-6} L ${x+w} ${y} Z`} fill={theme === "dark" ? "#333" : "#f5f5f5"} opacity="0.8" />
            )}
            <rect x={x} y={y} width={w} height={h} rx="3" fill={t.building} stroke={t.buildingStroke} strokeWidth="1" />
            <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} rx="1" fill={theme === "dark" ? "#202020" : "#dfdbd2"} opacity="0.4" />
            {/* Windows */}
            {Array.from({ length: Math.floor(h / 15) }).map((_, ri) => (
              <g key={ri}>
                {Array.from({ length: Math.floor((w - 12) / 12) }).map((_, ci) => (
                  <rect key={ci} x={x + 8 + ci * 12} y={y + 8 + ri * 15} width="6" height="8" rx="1"
                    fill={theme === "dark" ? (Math.random() > 0.7 ? "#fbbf24" : "#2a2a2a") : "#d0ccc4"} opacity="0.6" />
                ))}
              </g>
            ))}
          </g>
        ))}
        {/* Construction Zone */}
        <g>
          <rect x={880} y={480} width={100} height={100} rx="3" fill={theme === "dark" ? "url(#const-pattern-dark)" : "url(#const-pattern)"} stroke={t.constructionStroke} strokeWidth="2" strokeDasharray="4 4" />
          <text x={930} y={535} fontSize="9" fill={theme === "dark" ? "#f0dca8" : "#805c1f"} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">UNDER CONSTRUCTION</text>
          {/* Crane */}
          <line x1="900" y1="480" x2="900" y2="440" stroke={t.constructionStroke} strokeWidth="2" />
          <line x1="900" y1="450" x2="940" y2="450" stroke={t.constructionStroke} strokeWidth="2" />
          <line x1="940" y1="450" x2="940" y2="470" stroke={t.constructionStroke} strokeWidth="1" strokeDasharray="2 2" />
        </g>
      </g>

      {/* Airport */}
      <g transform="translate(850, 80)">
        <rect x="0" y="0" width="120" height="80" fill={t.airport} rx="4" opacity="0.6" />
        <rect x="10" y="30" width="100" height="8" fill={t.runway} rx="2" />
        <rect x="10" y="50" width="100" height="8" fill={t.runway} rx="2" />
        <line x1="20" y1="34" x2="100" y2="34" stroke="#FFF" strokeWidth="1" strokeDasharray="6 6" opacity="0.7" />
        <line x1="20" y1="54" x2="100" y2="54" stroke="#FFF" strokeWidth="1" strokeDasharray="6 6" opacity="0.7" />
        <text x="60" y="20" fontSize="8" fill={t.label} textAnchor="middle" fontFamily="sans-serif">BROOKLYN AIRPORT</text>
      </g>

      {/* Stadium */}
      <g transform="translate(150, 280)">
        <ellipse cx="40" cy="30" rx="50" ry="30" fill={t.stadium} opacity="0.5" />
        <ellipse cx="40" cy="30" rx="35" ry="20" fill={t.roadSecond} opacity="0.3" />
        <text x="40" y="35" fontSize="8" fill={t.label} textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">STADIUM</text>
      </g>

      {/* Cemetery */}
      <g transform="translate(700, 120)">
        <rect x="0" y="0" width="80" height="60" fill={t.cemetery} opacity="0.4" rx="2" />
        {[10, 25, 40, 55, 70].map((cx, i) => (
          <g key={i} transform={`translate(${cx}, 15)`}>
            <rect x="-2" y="0" width="4" height="12" fill={theme === "dark" ? "#555" : "#9e9e9e"} />
            <rect x="-6" y="-2" width="12" height="4" fill={theme === "dark" ? "#555" : "#9e9e9e"} />
          </g>
        ))}
      </g>

      {/* Shopping Mall */}
      <g transform="translate(320, 120)">
        <rect x="0" y="0" width="100" height="60" fill={t.shopping} opacity="0.3" rx="4" />
        <text x="50" y="35" fontSize="8" fill={t.label} textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">MALL</text>
      </g>

      {/* Industrial Smokestacks */}
      <g transform="translate(900, 50)">
        <rect x="0" y="0" width="8" height="30" fill={theme === "dark" ? "#555" : "#9e9e9e"} />
        <rect x="20" y="-10" width="8" height="40" fill={theme === "dark" ? "#555" : "#9e9e9e"} />
        <motion.circle cx="4" cy="-5" r="4" fill="#9e9e9e" opacity="0.3" animate={{ cy: [-5, -20], opacity: [0.3, 0] }} transition={{ duration: 3, repeat: Infinity }} />
        <motion.circle cx="24" cy="-15" r="5" fill="#9e9e9e" opacity="0.3" animate={{ cy: [-15, -35], opacity: [0.3, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }} />
      </g>

      {/* Train Tracks */}
      <path d="M 0 580 Q 200 580 400 480 T 1000 380" fill="none" stroke={t.rail} strokeWidth="4" />
      <path d="M 0 580 Q 200 580 400 480 T 1000 380" fill="none" stroke={t.railTie} strokeWidth="2" strokeDasharray="6 4" />

      {/* Road Center Lines */}
      <line x1="0" y1="145" x2="1000" y2="145" stroke={theme === "dark" ? "#444" : "#e0e0e0"} strokeWidth="1" strokeDasharray="12 12" />
      <line x1="0" y1="305" x2="1000" y2="305" stroke={theme === "dark" ? "#444" : "#e0e0e0"} strokeWidth="1" strokeDasharray="12 12" />
      <line x1="225" y1="0" x2="225" y2="700" stroke={theme === "dark" ? "#444" : "#e0e0e0"} strokeWidth="1" strokeDasharray="12 12" />
      <line x1="445" y1="0" x2="445" y2="700" stroke={theme === "dark" ? "#444" : "#e0e0e0"} strokeWidth="1" strokeDasharray="12 12" />
      <line x1="665" y1="0" x2="665" y2="700" stroke={theme === "dark" ? "#444" : "#e0e0e0"} strokeWidth="1" strokeDasharray="12 12" />

      {/* One-way arrows */}
      <g fill={theme === "dark" ? "#555" : "#bdbdbd"} opacity="0.6">
        <polygon points="500,140 505,135 505,145" />
        <polygon points="700,140 705,135 705,145" />
        <polygon points="300,300 305,295 305,305" />
        <polygon points="500,300 505,295 505,305" />
      </g>

      {/* Pedestrian crossings */}
      {[[300, 136], [500, 136], [400, 296], [600, 296]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x-15},${y-8})`}>
          {Array.from({ length: 5 }).map((_, j) => (
            <rect key={j} x={j * 6} y="0" width="3" height="16" fill={theme === "dark" ? "#444" : "#fff"} opacity="0.7" />
          ))}
        </g>
      ))}

      {/* Traffic lights */}
      {[[220, 130], [440, 290], [660, 450]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <rect x="-3" y="-8" width="6" height="16" rx="2" fill={theme === "dark" ? "#333" : "#424242"} />
          <circle cx="0" cy="-5" r="2" fill="#f44336" />
          <circle cx="0" cy="0" r="2" fill="#ffeb3b" />
          <circle cx="0" cy="5" r="2" fill="#4caf50" />
        </g>
      ))}

      {/* Generic POIs */}
      <g fill={t.poi}>
        {[
          [260, 50], [310, 80], [480, 40], [700, 50], [750, 90], [50, 180], [120, 220],
          [280, 200], [400, 240], [500, 180], [600, 250], [720, 180], [800, 260],
          [90, 350], [180, 380], [300, 340], [500, 380], [580, 400], [700, 360],
          [80, 500], [160, 550], [300, 520], [400, 560], [520, 510], [600, 540], [750, 490],
          [890, 60], [920, 200], [950, 350], [250, 650], [480, 650], [850, 650],
          [350, 150], [450, 280], [550, 320], [650, 200], [750, 300], [850, 400],
          [150, 450], [250, 500], [350, 550], [650, 550], [750, 600], [950, 600],
        ].map(([x, y], i) => (
          <path key={i} transform={`translate(${x},${y}) scale(0.5)`} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" />
        ))}
      </g>

      {/* Special POIs */}
      <g>
        <g transform="translate(100, 420)">
          <rect x="-8" y="-8" width="16" height="16" rx="4" fill={t.hospital} />
          <path d="M-2 -5 L2 -5 L2 -2 L5 -2 L5 2 L2 2 L2 5 L-2 5 L-2 2 L-5 2 L-5 -2 L-2 -2 Z" fill="#FFF" />
        </g>
        <g transform="translate(120, 500)">
          <rect x="-8" y="-8" width="16" height="16" rx="4" fill={t.school} />
          <path d="M-4 3 L-4 -2 L0 -5 L4 -2 L4 3 Z" fill="#FFF" />
        </g>
        <g transform="translate(850, 650)">
          <rect x="-8" y="-8" width="16" height="16" rx="4" fill={t.gas} opacity="0.8" />
          <path d="M-3 3 L-3 -3 L3 -3 L3 3 Z" fill="#FFF" />
        </g>
      </g>

      {/* Bus stops */}
      {showTransit && [
        [150, 145], [350, 145], [550, 145], [750, 145],
        [225, 220], [225, 380], [225, 520],
        [445, 380], [445, 520],
        [665, 200], [665, 380],
      ].map(([x, y], i) => (
        <g key={`bus-${i}`} transform={`translate(${x},${y})`}>
          <rect x="-4" y="-8" width="8" height="16" rx="2" fill={t.transit} opacity="0.8" />
          <text x="0" y="2" fontSize="6" fill="#FFF" textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">B</text>
        </g>
      ))}

      {/* Topographic contour lines (terrain only) */}
      {theme === "terrain" && (
        <g fill="none" stroke="#8d6e63" strokeWidth="0.5" opacity="0.2">
          <path d="M 0 100 Q 200 80 400 120 T 800 100 T 1000 150" />
          <path d="M 0 200 Q 200 180 400 220 T 800 200 T 1000 250" />
          <path d="M 0 400 Q 200 380 400 420 T 800 400 T 1000 450" />
          <path d="M 0 600 Q 200 580 400 620 T 800 600 T 1000 650" />
        </g>
      )}

      {/* Neighborhood Labels */}
      <text x="120" y="240" fontSize="18" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="700" letterSpacing="4" textAnchor="middle" style={{ pointerEvents: 'none' }}>DOWNTOWN</text>
      <text x="750" y="100" fontSize="18" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="700" letterSpacing="4" textAnchor="middle" style={{ pointerEvents: 'none' }}>NORTH HILLS</text>
      <text x="350" y="550" fontSize="18" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="700" letterSpacing="4" textAnchor="middle" style={{ pointerEvents: 'none' }}>WEST END</text>
      <text x="800" y="550" fontSize="18" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="700" letterSpacing="4" textAnchor="middle" style={{ pointerEvents: 'none' }}>SOUTH BAY</text>
      <text x="900" y="250" fontSize="14" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="600" letterSpacing="2" textAnchor="middle" style={{ pointerEvents: 'none' }}>INDUSTRIAL ZONE</text>
      <text x="200" y="600" fontSize="14" fill={t.neighborhood} fontFamily="sans-serif" fontWeight="600" letterSpacing="2" textAnchor="middle" style={{ pointerEvents: 'none' }}>RESIDENTIAL</text>

      {/* Street Labels */}
      <text x="30" y="142" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">ATLANTIC AVE</text>
      <text x="30" y="302" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">FULTON ST</text>
      <text x="30" y="462" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">FLATBUSH AVE</text>
      <text x="680" y="462" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">WASHINGTON AVE</text>
      <text x="228" y="40" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5" transform="rotate(90 228 40)">BEDFORD AVE</text>
      <text x="448" y="40" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5" transform="rotate(90 448 40)">NOSTRAND AVE</text>
      <text x="668" y="40" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5" transform="rotate(90 668 40)">VANDERBILT AVE</text>
      <text x="30" y="582" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">PACIFIC ST</text>
      <text x="856" y="40" fontSize="9" fill={t.label} fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5" transform="rotate(90 856 40)">CLASSON AVE</text>

      {/* Atmospheric overlay */}
      <rect width="1000" height="700" fill={t.overlay} style={{ pointerEvents: 'none' }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   USER LOCATION DOT
   ═══════════════════════════════════════════════════════════════════════════════ */
function UserDot({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}>
      <motion.div
        className="absolute rounded-full border-2 border-blue-400/30 bg-blue-400/10"
        style={{ width: 80, height: 80, top: -40, left: -40 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.2, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-blue-400/20"
        style={{ width: 36, height: 36, top: -18, left: -18 }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      />
      <div className="relative w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg shadow-blue-500/50" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BUSINESS PIN
   ═══════════════════════════════════════════════════════════════════════════════ */
function BusinessPin({
  b, selected, hovered, onClick, onHover
}: {
  b: Business;
  selected: boolean;
  hovered: boolean;
  onClick: () => void;
  onHover: (v: boolean) => void;
}) {
  return (
    <motion.button
      className="absolute z-10 flex flex-col items-center cursor-pointer"
      style={{ left: `${b.x}%`, top: `${b.y}%`, transform: "translate(-50%, -100%)" }}
      onClick={onClick}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
      animate={{ scale: selected ? 1.2 : hovered ? 1.1 : 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <AnimatePresence>
        {hovered && !selected && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 bg-white dark:bg-zinc-900 shadow-xl rounded-2xl px-3 py-2 text-left min-w-[180px] border border-black/5 z-50"
          >
            <div className="text-[11px] font-semibold text-zinc-900 dark:text-white">{b.name}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{b.tag} · {b.meta}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-emerald-500 font-medium">{b.rating}★</span>
              <span className="text-[10px] text-zinc-400">({b.reviewCount})</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`relative flex items-center justify-center rounded-full shadow-lg transition-shadow ${
          selected ? "shadow-xl ring-2 ring-white" : ""
        } ${b.open ? "" : "opacity-60"}`}
        style={{
          width: selected ? 46 : 38,
          height: selected ? 46 : 38,
          background: b.color,
          transition: "width 0.2s, height 0.2s",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          {CAT_ICONS[b.tag] ?? <circle cx="12" cy="12" r="5" stroke="currentColor" fill="none" />}
        </svg>
        {b.trust >= 95 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" className="text-emerald-500">
              <path d="M12 2l3 6.5H22l-5.5 4 2 7L12 16l-6.5 3.5 2-7L2 8.5h7L12 2z" fill="currentColor"/>
            </svg>
          </div>
        )}
      </div>
      <div className="w-0.5 h-2 mt-[-1px]" style={{ background: b.color }} />
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: b.color, marginTop: -2 }} />
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   ROUTE LINE
   ═══════════════════════════════════════════════════════════════════════════════ */
function RouteLine({ from, to, theme }: { from: [number, number]; to: [number, number]; theme: MapTheme }) {
  const mx = (from[0] + to[0]) / 2;
  const my = Math.min(from[1], to[1]) - 10;
  const stroke = theme === "dark" ? "#90caf9" : "#1e88e5";

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <motion.path
        d={`M ${from[0]}% ${from[1]}% Q ${mx}% ${my}% ${to[0]}% ${to[1]}%`}
        stroke={stroke}
        strokeWidth="3"
        fill="none"
        strokeDasharray="8 5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
      />
      <motion.circle r="5" fill={stroke} opacity="0.8">
        <animateMotion dur="2s" repeatCount="indefinite" path={`M ${from[0]}% ${from[1]}% Q ${mx}% ${my}% ${to[0]}% ${to[1]}%`} />
      </motion.circle>
      <circle cx={`${to[0]}%`} cy={`${to[1]}%`} r="6" fill={stroke} opacity="0.3" />
      <circle cx={`${to[0]}%`} cy={`${to[1]}%`} r="3" fill={stroke} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   DISTANCE BADGE
   ═══════════════════════════════════════════════════════════════════════════════ */
function DistanceBadge({ b }: { b: Business }) {
  const userX = 50, userY = 50;
  const dx = b.x - userX, dy = b.y - userY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const km = (dist * 0.045).toFixed(1);
  const minWalk = Math.round(dist * 0.45);
  const minDrive = Math.round(dist * 0.12);
  return { km, minWalk, minDrive };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   POPULAR TIMES BAR CHART
   ═══════════════════════════════════════════════════════════════════════════════ */
function PopularTimesChart({ data, dark }: { data: number[]; dark: boolean }) {
  const hours = ["6am", "7am", "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"];
  const now = new Date().getHours() - 6;
  return (
    <div className="flex items-end gap-1 h-16 mt-2">
      {data.map((val, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
          <div className="w-full relative" style={{ height: `${val}%` }}>
            <div className={`absolute inset-0 rounded-sm ${i === now ? "bg-emerald-400" : dark ? "bg-zinc-700" : "bg-zinc-200"}`} />
          </div>
          <span className="text-[8px] text-zinc-400">{hours[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   STAR RATING
   ═══════════════════════════════════════════════════════════════════════════════ */
function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "#fbbf24" : "#e4e4e7"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 ml-1">{rating}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PRICE LEVEL
   ═══════════════════════════════════════════════════════════════════════════════ */
function PriceLevel({ level }: { level: number }) {
  return (
    <span className="text-[11px] text-zinc-400">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className={i < level ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-300 dark:text-zinc-600"}>$</span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN MAP PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */
function MapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapTheme, setMapTheme] = useState<MapTheme>("light");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showList, setShowList] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showTransit, setShowTransit] = useState(false);
  const [showBiking, setShowBiking] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews" | "photos" | "services" | "updates">("overview");
  const [directionsMode, setDirectionsMode] = useState(false);
  const [directionsFrom, setDirectionsFrom] = useState("My location");
  const [directionsTo, setDirectionsTo] = useState("");
  const [travelMode, setTravelMode] = useState<"drive" | "walk" | "transit" | "bike">("drive");
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const [recentSearches, setRecentSearches] = useState<string[]>(["coffee near me", "24h pharmacy", "yoga studio"]);
  const [searchFocused, setSearchFocused] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedBiz = BUSINESSES.find((b) => b.id === selected);

  const filters = ["All", "Salon", "Dental", "Emergency", "Wellness", "Cafe", "Vet", "Restaurant", "Gym", "Gas", "Hotel", "Park", "Coworking", "Pharmacy", "Cinema"];
  const filtered = useMemo(() => BUSINESSES.filter((b) => {
    const matchFilter = filter === "All" || b.tag === filter;
    const matchSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.tag.toLowerCase().includes(searchQuery.toLowerCase()) || b.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  }), [filter, searchQuery]);

  const { km, minWalk, minDrive } = selectedBiz ? DistanceBadge({ b: selectedBiz }) : { km: "—", minWalk: 0, minDrive: 0 };

  const isDark = mapTheme === "dark" || (mapTheme === "satellite" && false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setDirectionsMode(false);
        setContextMenu(v => ({ ...v, visible: false }));
        setShowShare(false);
      }
      if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 0.2, 3));
      if (e.key === "-" || e.key === "_") setZoom(z => Math.max(z - 0.2, 0.5));
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "?") setShowShortcuts(v => !v);
      if (e.key === "ArrowUp") setPan(p => ({ ...p, y: p.y + 30 }));
      if (e.key === "ArrowDown") setPan(p => ({ ...p, y: p.y - 30 }));
      if (e.key === "ArrowLeft") setPan(p => ({ ...p, x: p.x + 30 }));
      if (e.key === "ArrowRight") setPan(p => ({ ...p, x: p.x - 30 }));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Map drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(Math.max(z + delta, 0.5), 3));
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const toggleSave = (id: string) => {
    setSavedPlaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev].slice(0, 5));
    }
  };

  return (
    <div className="fixed inset-0 lg:left-[76px] flex bg-background overflow-hidden select-none" onContextMenu={handleContextMenu}>
      {/* ═══════ MAP AREA ═══════ */}
      <div
        ref={mapRef}
        className="relative flex-1 overflow-hidden"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: zoom, x: pan.x, y: pan.y }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ transformOrigin: "center center" }}
        >
          <MapTiles theme={mapTheme} showTraffic={showTraffic} showTransit={showTransit} showBiking={showBiking} show3D={show3D} showStreetView={showStreetView} />
        </motion.div>

        {/* Route line */}
        {selected && selectedBiz && !directionsMode && (
          <RouteLine from={[50, 50]} to={[selectedBiz.x, selectedBiz.y]} theme={mapTheme} />
        )}

        {/* Directions route mock */}
        {directionsMode && selectedBiz && (
          <RouteLine from={[50, 50]} to={[selectedBiz.x, selectedBiz.y]} theme={mapTheme} />
        )}

        {/* Business pins */}
        {filtered.map((b) => (
          <BusinessPin
            key={b.id}
            b={b}
            selected={selected === b.id}
            hovered={hovered === b.id}
            onClick={() => {
              setSelected(selected === b.id ? null : b.id);
              if (directionsMode) setDirectionsTo(b.address);
            }}
            onHover={(v) => setHovered(v ? b.id : null)}
          />
        ))}

        {/* User location */}
        <UserDot x={50} y={50} />

        {/* ═══════ TOP SEARCH BAR ═══════ */}
        <div className="absolute top-4 left-0 right-0 z-30 p-3 md:p-6 flex items-start gap-3 pointer-events-none">
          <div className="pointer-events-auto flex-1 max-w-[480px]">
            {/* Search box */}
            <div className="bg-white dark:bg-zinc-900 rounded-full shadow-xl flex items-center gap-3 px-4 h-13 border border-black/5">
              <button onClick={() => setShowList(v => !v)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <input
                ref={searchRef}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                placeholder={directionsMode ? "Choose destination, or click on the map..." : "Search Nexa Maps"}
                className="flex-1 text-sm bg-transparent outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600 shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
              <button className="shrink-0 text-zinc-500 hover:text-primary transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              <button className="shrink-0 text-zinc-500 hover:text-primary transition-colors border-l border-zinc-200 dark:border-zinc-700 pl-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
            </div>

            {/* Search dropdown */}
            <AnimatePresence>
              {searchFocused && !searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-black/5 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Recent searches</div>
                    {recentSearches.map((s, i) => (
                      <button key={i} onClick={() => handleSearch(s)} className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/><path d="M3 3v9h9"/></svg>
                        <span className="text-sm text-zinc-700 dark:text-zinc-200">{s}</span>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-2">Trending near you</div>
                    <div className="flex gap-2 flex-wrap">
                      {["Brunch spots", "Live music", "Bookstores", "Dog parks", "Rooftop bars"].map(t => (
                        <button key={t} onClick={() => handleSearch(t)} className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors">{t}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Directions toggle */}
            {!directionsMode && (
              <button
                onClick={() => setDirectionsMode(true)}
                className="mt-2 ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-zinc-800/90 shadow-sm border border-black/5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s-8-6-8-13a8 8 0 0 1 16 0c0 7-8 13-8 13z"/><circle cx="12" cy="9" r="2.5"/></svg>
                Directions
              </button>
            )}

            {/* Filter chips */}
            {!directionsMode && (
              <div className="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar pr-6 pb-1 -mr-3 md:-mr-6">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 h-9 px-4 rounded-full text-xs font-medium shadow-sm border border-black/5 transition-all ${
                      filter === f
                        ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md"
                        : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Floating action buttons */}
          <div className="pointer-events-auto flex flex-col gap-2 ml-auto">
            <button
              onClick={() => setShowTraffic(v => !v)}
              className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center border border-black/5 transition-colors ${showTraffic ? "bg-blue-500 text-white" : "bg-white dark:bg-zinc-900 text-zinc-600 hover:text-primary"}`}
              title="Traffic"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 17a2 2 0 1 1-4 0"/><path d="M15 17a2 2 0 1 1-4 0"/><path d="M12 2v4"/><path d="M4.22 4.22l2.83 2.83"/><path d="M19.78 4.22l-2.83 2.83"/></svg>
            </button>
            <button
              onClick={() => setShowTransit(v => !v)}
              className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center border border-black/5 transition-colors ${showTransit ? "bg-blue-500 text-white" : "bg-white dark:bg-zinc-900 text-zinc-600 hover:text-primary"}`}
              title="Transit"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/></svg>
            </button>
            <button
              onClick={() => setShowBiking(v => !v)}
              className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center border border-black/5 transition-colors ${showBiking ? "bg-blue-500 text-white" : "bg-white dark:bg-zinc-900 text-zinc-600 hover:text-primary"}`}
              title="Biking"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/><path d="M8 14.5v-3"/><path d="M13 11.5l-2-3"/></svg>
            </button>
            <button
              onClick={() => setMapTheme(s => s === "light" ? "dark" : s === "dark" ? "satellite" : s === "satellite" ? "terrain" : "light")}
              className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl shadow-xl flex items-center justify-center text-zinc-600 hover:text-primary border border-black/5 transition-colors"
              title="Map style"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
            </button>
            <button
              onClick={() => setShow3D(v => !v)}
              className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center border border-black/5 transition-colors ${show3D ? "bg-blue-500 text-white" : "bg-white dark:bg-zinc-900 text-zinc-600 hover:text-primary"}`}
              title="3D View"
            >
              <span className="text-xs font-bold">3D</span>
            </button>
          </div>
        </div>

        {/* ═══════ DIRECTIONS PANEL ═══════ */}
        <AnimatePresence>
          {directionsMode && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-20 left-3 md:left-6 z-30 pointer-events-none"
            >
              <div className="pointer-events-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-black/5 p-4 w-[360px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDirectionsMode(false)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    </button>
                    <span className="font-semibold text-sm text-zinc-900 dark:text-white">Directions</span>
                  </div>
                  <button onClick={() => { setDirectionsFrom("My location"); setDirectionsTo(""); }} className="text-xs text-blue-500 hover:underline">Clear</button>
                </div>
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 h-10">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <input value={directionsFrom} onChange={e => setDirectionsFrom(e.target.value)} className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-white" />
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-3 h-10">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <input value={directionsTo} onChange={e => setDirectionsTo(e.target.value)} placeholder="Choose destination..." className="flex-1 bg-transparent text-sm outline-none text-zinc-900 dark:text-white placeholder:text-zinc-400" />
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {(["drive", "walk", "transit", "bike"] as const).map(m => (
                    <button key={m} onClick={() => setTravelMode(m)} className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-colors ${travelMode === m ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        {m === "drive" && <><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></>}
                        {m === "walk" && <><path d="M13 4v6.792l-3.106 1.553"/><path d="M16 20l-2.5-5.5L11 14l-2-2"/><path d="M8 20l2-5"/><circle cx="12" cy="4" r="2"/></>}
                        {m === "transit" && <><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="M8 19l-2 3"/><path d="M16 19l2 3"/></>}
                        {m === "bike" && <><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></>}
                      </svg>
                      {m === "drive" ? "12 min" : m === "walk" ? "45 min" : m === "transit" ? "28 min" : "22 min"}
                    </button>
                  ))}
                </div>
                {selectedBiz && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">A</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">Fastest route</div>
                        <div className="text-xs text-zinc-500">{minDrive} min · {km} km · via Atlantic Ave</div>
                      </div>
                      <div className="text-xs text-green-600 font-medium">{Math.round(minDrive * 0.9)} min</div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                      <div className="w-8 h-8 rounded-full bg-zinc-400 text-white flex items-center justify-center text-xs font-bold">B</div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white">Alternative</div>
                        <div className="text-xs text-zinc-500">{minDrive + 4} min · {Number(km) + 0.8} km · via Fulton St</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ BOTTOM SELECTED CARD ═══════ */}
        <AnimatePresence>
          {selected && selectedBiz && !directionsMode && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 z-30 p-3 pointer-events-none"
            >
              <div className="pointer-events-auto max-w-[600px] mx-auto bg-white dark:bg-zinc-900 rounded-[28px] shadow-2xl overflow-hidden border border-black/5 max-h-[70vh] overflow-y-auto">
                {/* Mobile swipe pill */}
                <div className="w-full flex justify-center pt-2.5 pb-1 md:hidden">
                  <div className="w-10 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                </div>

                {/* Hero photo */}
                <div className="relative h-40 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700">
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedBiz.photos[0]?.color || "from-zinc-200 to-zinc-300"} opacity-60`} />
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="font-semibold text-white text-lg drop-shadow-md">{selectedBiz.name}</div>
                      <div className="text-white/80 text-sm drop-shadow-md">{selectedBiz.tag}</div>
                    </div>
                    <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-black/20 backdrop-blur flex items-center justify-center text-white hover:bg-black/40">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                </div>

                {/* Card header */}
                <div className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StarRating rating={selectedBiz.rating} />
                      <span className="text-xs text-zinc-500">({selectedBiz.reviewCount} reviews)</span>
                      <PriceLevel level={selectedBiz.priceLevel} />
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${selectedBiz.open ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {selectedBiz.open ? "Open now" : "Closed"}
                      </span>
                    </div>
                    <div className="text-[13px] text-zinc-500 mt-1">{selectedBiz.address}</div>
                    <div className="text-[13px] text-zinc-500">{selectedBiz.phone}</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 px-4 pb-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-blue-500 text-white hover:opacity-90 transition-opacity text-[13px] font-medium shadow-lg shadow-blue-500/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Directions
                  </button>
                  <button onClick={() => toggleSave(selectedBiz.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-[13px] font-medium transition-colors ${savedPlaces.has(selectedBiz.id) ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200"}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={savedPlaces.has(selectedBiz.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                    {savedPlaces.has(selectedBiz.id) ? "Saved" : "Save"}
                  </button>
                  <button onClick={() => setShowShare(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-200 transition-colors text-[13px] font-medium">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                  </button>
                </div>

                {/* Info tabs */}
                <div className="flex items-center gap-1 px-4 border-b border-zinc-100 dark:border-zinc-800 text-[13px] font-medium">
                  {(["overview", "reviews", "photos", "services", "updates"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2.5 capitalize transition-colors ${activeTab === tab ? "text-blue-500 border-b-2 border-blue-500" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-4">
                  {activeTab === "overview" && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white mb-1">About</div>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{selectedBiz.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                          <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Hours</div>
                          <div className="space-y-1">
                            {selectedBiz.hours.map(h => (
                              <div key={h.day} className="flex justify-between text-xs">
                                <span className={h.day === "Monday" ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300"}>{h.day.slice(0, 3)}</span>
                                <span className={h.day === "Monday" ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-zinc-300"}>{h.is24h ? "24 hours" : h.open === "Closed" ? "Closed" : `${h.open}–${h.close}`}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                          <div className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">Contact</div>
                          <div className="space-y-1.5 text-xs">
                            <div className="text-blue-500 hover:underline cursor-pointer">{selectedBiz.website}</div>
                            <div className="text-zinc-600 dark:text-zinc-300">{selectedBiz.phone}</div>
                            {selectedBiz.menuUrl && <div className="text-blue-500 hover:underline cursor-pointer">View menu</div>}
                            {selectedBiz.reservationUrl && <div className="text-blue-500 hover:underline cursor-pointer">Reservations</div>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Popular times</div>
                        <PopularTimesChart data={selectedBiz.popularTimes} dark={isDark} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedBiz.amenities.map(a => (
                            <span key={a} className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">{a}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Accessibility</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedBiz.accessibility.map(a => (
                            <span key={a} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-xs text-blue-700 dark:text-blue-300">{a}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">{selectedBiz.rating}</div>
                        <div className="flex-1">
                          <StarRating rating={selectedBiz.rating} size={14} />
                          <div className="text-xs text-zinc-500 mt-0.5">{selectedBiz.reviewCount} reviews</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {selectedBiz.reviews.map(r => (
                          <div key={r.id} className="border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">{r.author[0]}</div>
                              <div>
                                <div className="text-xs font-semibold text-zinc-900 dark:text-white">{r.author}</div>
                                <div className="text-[10px] text-zinc-400">{r.date}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-1"><StarRating rating={r.rating} size={10} /></div>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{r.text}</p>
                            {r.ownerReply && (
                              <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-zinc-900 dark:text-white">Owner response:</span> {r.ownerReply}
                              </div>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Helpful ({r.helpful})</button>
                              <button className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Report</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-medium text-zinc-900 dark:text-white hover:bg-zinc-200 transition-colors">Write a review</button>
                    </div>
                  )}

                  {activeTab === "photos" && (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedBiz.photos.map(p => (
                        <div key={p.id} className={`aspect-square rounded-xl bg-gradient-to-br ${p.color} flex items-end p-2`}>
                          <span className="text-[10px] text-white font-medium drop-shadow-md">{p.caption}</span>
                        </div>
                      ))}
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700 flex items-center justify-center`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "services" && (
                    <div className="space-y-3">
                      {selectedBiz.services.map(s => (
                        <div key={s} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <span className="text-sm text-zinc-900 dark:text-white font-medium">{s}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      ))}
                      {selectedBiz.orderUrl && (
                        <a href={selectedBiz.orderUrl} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:opacity-90">Order online</a>
                      )}
                      {selectedBiz.reservationUrl && (
                        <a href={selectedBiz.reservationUrl} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500 text-white text-sm font-medium hover:opacity-90">Reserve a table</a>
                      )}
                    </div>
                  )}

                  {activeTab === "updates" && (
                    <div className="space-y-3">
                      {selectedBiz.updates.map((u, i) => (
                        <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border-l-4 border-blue-500">
                          <div className="text-xs text-zinc-500 mb-0.5">Update</div>
                          <div className="text-sm text-zinc-900 dark:text-white">{u}</div>
                        </div>
                      ))}
                      {selectedBiz.questions.map((q, i) => (
                        <div key={i} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                          <div className="text-sm font-medium text-zinc-900 dark:text-white mb-1">Q: {q.q}</div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-300">A: {q.a}</div>
                          <div className="text-[10px] text-zinc-400 mt-1">{q.votes} people found this helpful</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Route info strip */}
                <div className="flex items-center gap-px bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
                  {[{
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                    label: `${minWalk} min walk`,
                  }, {
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    label: `${km} km`,
                  }, {
                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8l5 3-5 3V8z"/></svg>,
                    label: "Live",
                  }].map((item, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center gap-1.5 py-3 text-zinc-500 text-[12px]">
                      {item.icon}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ RIGHT CONTROLS ═══════ */}
        <div className={`absolute right-3 md:right-6 z-20 flex flex-col gap-2 transition-all duration-300 ${selected ? "bottom-[320px] md:bottom-48" : "bottom-[120px] md:bottom-12"}`}>
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="w-11 h-11 bg-white dark:bg-zinc-900 rounded-full shadow-lg flex items-center justify-center text-zinc-700 hover:text-blue-500 border border-black/5 transition-colors mb-2"
            title="Recenter"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-black/5 overflow-hidden flex flex-col">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xl font-light transition-colors">+</button>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 mx-2" />
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-11 h-11 flex items-center justify-center text-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xl font-light transition-colors">−</button>
          </div>
        </div>

        {/* Compass */}
        <div className={`absolute right-3 z-20 flex flex-col gap-2 transition-all duration-300 ${selected ? "bottom-[420px] md:bottom-72" : "bottom-[200px] md:bottom-36"}`}>
          <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg flex items-center justify-center border border-black/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <polygon points="12 2 9 9 12 11 15 9" fill="#e63946"/>
              <polygon points="12 22 9 15 12 13 15 15" fill="#888"/>
            </svg>
          </div>
          <button className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg flex items-center justify-center text-blue-500 border border-black/5 hover:bg-blue-50 transition-colors" title="My location">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Scale bar */}
        <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 z-20 flex flex-col items-start md:items-center gap-1 pointer-events-none transition-all duration-300 ${selected ? "bottom-[300px] md:bottom-4" : "bottom-[80px] md:bottom-4"}`}>
          <div className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">{zoom > 1.5 ? "100 m" : zoom < 0.8 ? "2 km" : "500 m"}</div>
          <div className="h-[3px] bg-zinc-600 dark:bg-zinc-400 rounded-full" style={{ width: zoom > 1.5 ? 40 : zoom < 0.8 ? 120 : 80, borderLeft: "2px solid", borderRight: "2px solid" }} />
        </div>

        {/* Attribution */}
        <div className="absolute bottom-1 right-1 z-20 text-[9px] text-zinc-400/60 font-mono">
          © Nexa Maps · Map data © OpenStreetMap
        </div>

        {/* Map type indicator */}
        <div className="absolute bottom-1 left-1 z-20 text-[9px] text-zinc-400/60 font-mono uppercase tracking-wider">
          {mapTheme} · {show3D ? "3D" : "2D"} · {zoom.toFixed(1)}x
        </div>
      </div>

      {/* ═══════ LEFT SIDE PANEL ═══════ */}
      <AnimatePresence>
        {showList && (
          <motion.aside
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="hidden md:flex flex-col w-[380px] shrink-0 bg-white dark:bg-zinc-900 shadow-2xl z-20 overflow-hidden"
          >
            {/* Panel header */}
            <div className="px-5 pt-20 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs uppercase tracking-[0.14em] text-zinc-400 font-semibold">Nearby results</div>
                <span className="text-xs text-zinc-400 font-mono">{filtered.length} shown</span>
              </div>
              <div className="flex gap-2">
                <select className="flex-1 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-2 outline-none">
                  <option>Sort by relevance</option>
                  <option>Distance</option>
                  <option>Rating</option>
                  <option>Open now</option>
                </select>
                <button className="h-8 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 transition-colors">Filters</button>
              </div>
            </div>

            {/* Business list */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {filtered.map((b, i) => {
                const { km, minWalk } = DistanceBadge({ b });
                const isSelected = selected === b.id;
                return (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelected(isSelected ? null : b.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: b.color }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white" strokeWidth="1.6" strokeLinecap="round">
                        {CAT_ICONS[b.tag] ?? <circle cx="12" cy="12" r="5" stroke="currentColor" fill="none"/>}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[14px] font-semibold text-zinc-900 dark:text-white truncate">{b.name}</div>
                        {b.trust >= 95 && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500 shrink-0">
                            <path d="M12 2l3 6.5H22l-5.5 4 2 7L12 16l-6.5 3.5 2-7L2 8.5h7L12 2z"/>
                          </svg>
                        )}
                      </div>
                      <div className="text-[12px] text-zinc-500 mt-0.5">{b.tag} · {b.meta}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={b.rating} size={10} />
                        <PriceLevel level={b.priceLevel} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-semibold text-zinc-900 dark:text-white">{km} km</div>
                      <div className="text-[11px] text-zinc-400">{minWalk} min</div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
              <Link to="/discover" className="w-full flex items-center justify-center gap-2 h-11 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Browse all businesses
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══════ CONTEXT MENU ═══════ */}
      <AnimatePresence>
        {contextMenu.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-black/5 py-1 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {["Directions from here", "Directions to here", "Measure distance", "What's here?", "Add a missing place", "Report a data problem"].map((item, i) => (
              <button key={i} onClick={() => setContextMenu(v => ({ ...v, visible: false }))} className="w-full text-left px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ SHARE MODAL ═══════ */}
      <AnimatePresence>
        {showShare && selectedBiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowShare(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-5"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold text-zinc-900 dark:text-white">Share {selectedBiz.name}</div>
                <button onClick={() => setShowShare(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors text-sm text-zinc-900 dark:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Copy link
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors text-sm text-zinc-900 dark:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  Embed map
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors text-sm text-zinc-900 dark:text-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Send to your phone
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ KEYBOARD SHORTCUTS MODAL ═══════ */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="font-semibold text-lg text-zinc-900 dark:text-white mb-4">Keyboard shortcuts</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[["/", "Search"], ["+", "Zoom in"], ["-", "Zoom out"], ["↑↓←→", "Pan map"], ["Esc", "Close panel"], ["?", "This help"], ["D", "Directions"], ["S", "Save place"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-600 dark:text-zinc-300">{v}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs font-mono">{k}</kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}