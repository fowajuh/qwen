import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { 
  MapPin, Heart, Star, Users, Clock, TrendingUp, 
  Mountain, Waves, Castle, Tent, Building, Trees,
  Sparkles, Gift, Flame, ChevronRight, Search
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/manifest/AppShell";
import { DailyQuestWidget, StreakCounter } from "@/components/manifest/DailyQuestWidget";
import { LevelBadge, XPProgressBar } from "@/components/manifest/LevelBadge";
import { Confetti } from "@/components/manifest/Confetti";
import { useGamification, XP_REWARDS } from "@/lib/gamification-store";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { LISTINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/discovery")({
  head: () => ({
    meta: [
      { title: "Discover · GlobeTrotter" },
      { name: "description", content: "Find your next adventure with curated stays and experiences." },
    ],
  }),
  component: DiscoveryPage,
});

// Category configuration with icons
const CATEGORIES = [
  { id: "trending", label: "Trending", icon: TrendingUp, color: "from-rose-500 to-pink-600" },
  { id: "beachfront", label: "Beachfront", icon: Waves, color: "from-cyan-500 to-blue-600" },
  { id: "mountain", label: "Mountain", icon: Mountain, color: "from-emerald-500 to-teal-600" },
  { id: "urban", label: "Urban", icon: Building, color: "from-indigo-500 to-purple-600" },
  { id: "cabins", label: "Cabins", icon: Tent, color: "from-amber-500 to-orange-600" },
  { id: "castles", label: "Castles", icon: Castle, color: "from-violet-500 to-fuchsia-600" },
  { id: "forest", label: "Forest", icon: Trees, color: "from-green-500 to-emerald-600" },
];

// Mock listings with billion-dollar metadata
const PREMIUM_LISTINGS = [
  {
    id: "1",
    title: "Oceanfront Villa with Infinity Pool",
    location: "Malibu, California",
    price: 450,
    rating: 4.92,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    matchScore: 98,
    isInstantBook: true,
    viewsToday: 47,
    savedCount: 2400,
    category: "beachfront",
    urgency: "3 people booked this week",
  },
  {
    id: "2",
    title: "Alpine Chalet with Mountain Views",
    location: "Aspen, Colorado",
    price: 380,
    rating: 4.89,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80",
    matchScore: 95,
    isInstantBook: true,
    viewsToday: 32,
    savedCount: 1800,
    category: "mountain",
    urgency: "Only 2 dates left in March",
  },
  {
    id: "3",
    title: "Historic Castle Estate",
    location: "Loire Valley, France",
    price: 850,
    rating: 4.96,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800&q=80",
    matchScore: 92,
    isInstantBook: false,
    viewsToday: 89,
    savedCount: 5200,
    category: "castles",
    urgency: "12 people viewed this today",
  },
  {
    id: "4",
    title: "Modern Loft in Arts District",
    location: "Brooklyn, New York",
    price: 275,
    rating: 4.85,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    matchScore: 94,
    isInstantBook: true,
    viewsToday: 56,
    savedCount: 3100,
    category: "urban",
    urgency: "Hot! 8 bookings this month",
  },
  {
    id: "5",
    title: "Secluded Forest Cabin",
    location: "Portland, Oregon",
    price: 195,
    rating: 4.91,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?w=800&q=80",
    matchScore: 96,
    isInstantBook: true,
    viewsToday: 28,
    savedCount: 1600,
    category: "forest",
    urgency: "Price dropped 15% — 6 hours left",
  },
  {
    id: "6",
    title: "Luxury Beachfront Resort Suite",
    location: "Tulum, Mexico",
    price: 520,
    rating: 4.94,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    matchScore: 97,
    isInstantBook: true,
    viewsToday: 73,
    savedCount: 4100,
    category: "beachfront",
    urgency: "Last room at this price!",
  },
];

const COLLECTIONS = [
  {
    title: "Summer of Adventure",
    subtitle: "Book 3 beach stays, unlock exclusive badge",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d9e?w=1200&q=80",
    gradient: "from-amber-500/90 to-rose-500/90",
    cta: "Start Quest",
    xpReward: 500,
  },
  {
    title: "Hidden Gems",
    subtitle: "Unique stays off the beaten path",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&q=80",
    gradient: "from-emerald-500/90 to-teal-500/90",
    cta: "Explore",
    xpReward: 200,
  },
  {
    title: "Work From Anywhere",
    subtitle: "Remote-ready spaces with high-speed WiFi",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80",
    gradient: "from-indigo-500/90 to-purple-500/90",
    cta: "Find Workspace",
    xpReward: 150,
  },
];

function ListingCard({ listing, index }: { listing: typeof PREMIUM_LISTINGS[0]; index: number }) {
  const [isSaved, setIsSaved] = useState(false);
  const awardXP = useGamification((state) => state.awardXP);
  
  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSaved) {
      setIsSaved(true);
      awardXP("save_listing");
      toast.success("+5 XP", { description: "Added to wishlist" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Match Score Badge */}
        <div className="absolute top-3 left-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            {listing.matchScore}% Match
          </div>
        </div>

        {/* Instant Book Badge */}
        {listing.isInstantBook && (
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
              Instant Book
            </div>
          </div>
        )}

        {/* Save Button with Heart Explosion */}
        <button
          onClick={handleSave}
          className={cn(
            "absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isSaved 
              ? "bg-rose-500 text-white scale-110" 
              : "bg-white/90 text-gray-700 hover:bg-rose-50 hover:text-rose-500"
          )}
        >
          <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
        </button>

        {/* Urgency Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5 text-white/90 text-xs">
            <Clock className="w-3 h-3" />
            <span>{listing.urgency}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-gray-900 line-clamp-1">
          {listing.title}
        </h3>
        
        <div className="flex items-center gap-1.5 mt-1 text-gray-600 text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Social Proof */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{listing.viewsToday} viewed today</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{listing.savedCount.toLocaleString()} saved</span>
          </div>
        </div>

        {/* Rating & Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-gray-900">{listing.rating}</span>
            <span className="text-gray-500 text-sm">({listing.reviews})</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">${listing.price}</span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CollectionCard({ collection, index }: { collection: typeof COLLECTIONS[0]; index: number }) {
  const awardXP = useGamification((state) => state.awardXP);
  
  const handleClick = () => {
    awardXP("share_listing");
    toast.success(`+${XP_REWARDS.shareListing} XP`, { description: "Quest started!" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ scale: 1.03, rotate: -1 }}
      onClick={handleClick}
      className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      <img
        src={collection.image}
        alt={collection.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className={cn("absolute inset-0 bg-gradient-to-br", collection.gradient)} />
      
      <div className="absolute inset-0 p-8 flex flex-col justify-end">
        <div className="transform transition-transform duration-300 group-hover:translate-y-[-8px]">
          <h3 className="font-display text-3xl font-bold text-white mb-2">
            {collection.title}
          </h3>
          <p className="text-white/90 text-sm mb-4">{collection.subtitle}</p>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-semibold hover:bg-white/30 transition-colors">
              {collection.cta}
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/90 text-amber-900 rounded-full text-xs font-bold">
              <Gift className="w-3 h-3" />
              +{collection.xpReward} XP
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState("trending");
  const [burstAt, setBurstAt] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  
  const me = auth.currentUser();
  const level = useGamification((state) => state.level);
  const currentStreak = useGamification((state) => state.currentStreak);
  
  const filteredListings = useMemo(() => {
    if (activeCategory === "trending") return PREMIUM_LISTINGS;
    return PREMIUM_LISTINGS.filter(l => l.category === activeCategory);
  }, [activeCategory]);

  const handleBookingCTA = () => {
    setBurstAt(Date.now());
    toast.success("Adventure awaits!", { description: "Start exploring listings below" });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        {/* Confetti Burst */}
        {burstAt && <Confetti key={burstAt} />}

        {/* Hero Section with Parallax */}
        <motion.section 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative h-[70vh] min-h-[600px] overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-slate-50" />
          
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm mb-6">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Welcome back, {me?.email?.split('@')[0] || 'Traveler'}</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Discover Your Next
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-200 to-pink-200">
                  Great Adventure
                </span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-2xl mb-10">
                Curated stays, exclusive experiences, and rewards for every journey.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl w-full">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                  <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                    <Search className="w-6 h-6 text-gray-400 ml-4" />
                    <input
                      type="text"
                      placeholder="Where do you want to go?"
                      className="flex-1 px-4 py-4 text-lg bg-transparent outline-none text-gray-900 placeholder-gray-400"
                    />
                    <button 
                      onClick={handleBookingCTA}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Gamification Header */}
        <section className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Badge Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card-premium p-6 bg-white/90 backdrop-blur-xl"
            >
              <LevelBadge level={level} compact />
              <XPProgressBar className="mt-4" />
            </motion.div>

            {/* Streak Counter Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card-premium p-6 bg-white/90 backdrop-blur-xl"
            >
              <StreakCounter streak={currentStreak} />
            </motion.div>

            {/* Daily Quest Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <DailyQuestWidget />
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-3xl font-bold text-gray-900 mb-8"
          >
            Explore by Category
          </motion.h2>
          
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((cat, index) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3.5 rounded-full whitespace-nowrap transition-all duration-300",
                    isActive
                      ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                      : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Listings Grid */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <h2 className="font-display text-3xl font-bold text-gray-900">
              {CATEGORIES.find(c => c.id === activeCategory)?.label} Stays
            </h2>
            <div className="text-sm text-gray-500">
              Showing {filteredListings.length} of {PREMIUM_LISTINGS.length} properties
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing, index) => (
              <ListingCard key={listing.id} listing={listing} index={index} />
            ))}
          </div>
        </section>

        {/* Curated Collections */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-3xl font-bold text-gray-900 mb-8"
          >
            Featured Quests
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COLLECTIONS.map((collection, index) => (
              <CollectionCard key={collection.title} collection={collection} index={index} />
            ))}
          </div>
        </section>

        {/* Conversion CTA */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Join thousands of travelers earning rewards on every booking. Your first adventure earns you 200 XP!
              </p>
              <Link to="/search">
                <button className="btn-gradient text-lg px-10 py-5 shadow-2xl">
                  <Sparkles className="w-5 h-5" />
                  Find Your Perfect Stay
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
