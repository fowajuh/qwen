import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { 
  MapPin, Heart, Star, Search, Filter, Layers, 
  TrendingUp, DollarSign, Eye, Clock, Sparkles,
  ChevronRight, X, Plus, Target, Navigation,
  Compass, Zap, Award, Trophy
} from "lucide-react";
import { AppShell } from "@/components/manifest/AppShell";
import { useGamification } from "@/lib/gamification-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mapbox token - in production, use environment variable
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJja2xsYWJhZ3QwMnJ0MnFwN3pvdGJkYzNhIn0.example";

export const Route = createFileRoute("/explore-map")({
  head: () => ({
    meta: [
      { title: "Explore Map · GlobeTrotter" },
      { name: "description", content: "Discover stays on an interactive Mapbox map with price heatmaps, fog-of-war discovery, and polygon search." },
    ],
  }),
  component: ExploreMapPage,
});

// Mock listings with geo coordinates
const MAP_LISTINGS = [
  { id: "1", title: "Oceanfront Villa", lat: 34.0259, lng: -118.7798, price: 450, rating: 4.92, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80", category: "beachfront", viewsToday: 47, savedCount: 2400 },
  { id: "2", title: "Alpine Chalet", lat: 39.1911, lng: -106.8175, price: 380, rating: 4.89, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400&q=80", category: "mountain", viewsToday: 32, savedCount: 1800 },
  { id: "3", title: "Historic Castle", lat: 47.4311, lng: 1.0744, price: 850, rating: 4.96, image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=400&q=80", category: "castles", viewsToday: 89, savedCount: 5200 },
  { id: "4", title: "Modern Loft", lat: 40.7128, lng: -74.0060, price: 275, rating: 4.85, image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80", category: "urban", viewsToday: 56, savedCount: 3100 },
  { id: "5", title: "Forest Cabin", lat: 45.5152, lng: -122.6784, price: 195, rating: 4.91, image: "https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?w=400&q=80", category: "forest", viewsToday: 28, savedCount: 1600 },
  { id: "6", title: "Beach Resort Suite", lat: 20.2114, lng: -87.4654, price: 520, rating: 4.94, image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80", category: "beachfront", viewsToday: 73, savedCount: 4100 },
  { id: "7", title: "Desert Glass House", lat: 34.1347, lng: -116.3269, price: 425, rating: 4.97, image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80", category: "desert", viewsToday: 61, savedCount: 3800 },
  { id: "8", title: "Lakeside Retreat", lat: 43.0642, lng: -89.4012, price: 285, rating: 4.88, image: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&q=80", category: "lakeside", viewsToday: 34, savedCount: 2100 },
];

// Visited cities for fog-of-war (mock based on user history)
const VISITED_CITIES = [
  { lat: 34.0259, lng: -118.7798, name: "Los Angeles" },
  { lat: 40.7128, lng: -74.0060, name: "New York" },
];

const CATEGORY_FILTERS = [
  { id: "all", label: "All", color: "bg-slate-600" },
  { id: "beachfront", label: "Beach", color: "bg-cyan-500" },
  { id: "mountain", label: "Mountain", color: "bg-emerald-500" },
  { id: "urban", label: "Urban", color: "bg-indigo-500" },
  { id: "cabins", label: "Cabins", color: "bg-amber-500" },
  { id: "castles", label: "Castles", color: "bg-violet-500" },
];

function PriceMarker({ listing, onClick, isExpanded }: { listing: typeof MAP_LISTINGS[0]; onClick: () => void; isExpanded: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{ 
        left: `${((listing.lng + 180) / 360) * 100}%`, 
        top: `${((1 - Math.log(Math.tan(listing.lat * Math.PI / 180) + 1 / Math.cos(listing.lat * Math.PI / 180)) / Math.PI) / 2) * 100}%` 
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.2, zIndex: 50 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn(
        "relative flex items-center justify-center rounded-full font-bold text-white shadow-lg transition-all",
        isExpanded ? "w-14 h-14 text-sm" : "w-10 h-10 text-xs",
        listing.price < 300 ? "bg-emerald-500" : listing.price < 500 ? "bg-amber-500" : "bg-rose-500"
      )}>
        ${listing.price}
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-3 min-w-[180px] z-50"
          >
            <img src={listing.image} alt={listing.title} className="w-full h-24 object-cover rounded-md mb-2" />
            <h4 className="font-semibold text-gray-900 text-sm">{listing.title}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-medium">{listing.rating}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function FogOverlay({ visited }: { visited: typeof VISITED_CITIES }) {
  return (
    <>
      {/* Global fog overlay */}
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
      
      {/* Glow effects around visited cities */}
      {visited.map((city, idx) => (
        <motion.div
          key={idx}
          className="absolute pointer-events-none"
          style={{ 
            left: `${((city.lng + 180) / 360) * 100}%`, 
            top: `${((1 - Math.log(Math.tan(city.lat * Math.PI / 180) + 1 / Math.cos(city.lat * Math.PI / 180)) / Math.PI) / 2) * 100}%` 
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: idx * 0.3, duration: 1 }}
        >
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl" />
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-400/30 rounded-full blur-xl" />
        </motion.div>
      ))}
    </>
  );
}

function HeatmapLayer() {
  // Simulated demand heatmap zones
  const hotspots = [
    { x: 30, y: 40, intensity: 0.8 },
    { x: 65, y: 35, intensity: 0.6 },
    { x: 45, y: 55, intensity: 0.9 },
    { x: 75, y: 60, intensity: 0.7 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {hotspots.map((spot, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full"
          style={{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${150 * spot.intensity}px`,
            height: `${150 * spot.intensity}px`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ delay: idx * 0.2, duration: 0.8 }}
        >
          <div className={cn(
            "w-full h-full rounded-full blur-3xl",
            spot.intensity > 0.75 ? "bg-gradient-to-r from-red-500 to-orange-500" :
            spot.intensity > 0.5 ? "bg-gradient-to-r from-yellow-500 to-orange-500" :
            "bg-gradient-to-r from-green-500 to-yellow-500"
          )} />
        </motion.div>
      ))}
    </div>
  );
}

function ListingDetailPanel({ listing, onClose }: { listing: typeof MAP_LISTINGS[0] | null; onClose: () => void }) {
  const awardXP = useGamification((state) => state.awardXP);
  
  if (!listing) return null;

  const handleSave = () => {
    awardXP("save_listing");
    toast.success("+5 XP", { description: "Added to wishlist" });
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 bottom-0 w-full md:w-96 bg-white shadow-2xl z-40 overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg">Listing Details</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover rounded-xl" />
        
        <div>
          <h2 className="font-display text-xl font-bold text-gray-900">{listing.title}</h2>
          <div className="flex items-center gap-1 mt-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{listing.category} area</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-lg">{listing.rating}</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">${listing.price}</span>
            <span className="text-gray-500 text-sm">/night</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Eye className="w-3 h-3" />
              <span>Views today</span>
            </div>
            <p className="font-bold text-lg">{listing.viewsToday}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
              <Heart className="w-3 h-3" />
              <span>Saved by</span>
            </div>
            <p className="font-bold text-lg">{listing.savedCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Save to Wishlist
          </button>
          <button className="px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50">
            Message
          </button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-bold text-sm mb-3">Similar stays nearby</h4>
          <div className="space-y-2">
            {MAP_LISTINGS.filter(l => l.id !== listing.id).slice(0, 3).map(similar => (
              <div key={similar.id} className="flex gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                <img src={similar.image} alt={similar.title} className="w-16 h-16 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{similar.title}</p>
                  <p className="text-xs text-gray-500">${similar.price}/night</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExploreMapPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedListing, setSelectedListing] = useState<typeof MAP_LISTINGS[0] | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const filteredListings = useMemo(() => {
    let result = MAP_LISTINGS;
    if (selectedCategory !== "all") {
      result = result.filter(l => l.category === selectedCategory);
    }
    if (searchQuery) {
      result = result.filter(l => 
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  return (
    <AppShell>
      <div className="h-screen flex flex-col bg-slate-50">
        {/* Top Bar */}
        <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button 
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              showHeatmap ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-gray-600"
            )}
          >
            <Layers className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={cn(
              "p-2.5 rounded-xl transition-colors",
              isDrawingMode ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-gray-600"
            )}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="bg-white border-b px-4 py-2 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORY_FILTERS.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat.id
                    ? `${cat.color} text-white shadow-md`
                    : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative overflow-hidden">
          {/* Base Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-slate-100 to-green-50">
            {/* Simplified world map silhouette */}
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 50">
              <path d="M20,15 Q25,10 30,15 T40,20 T50,15 T60,20 T70,15 T80,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <ellipse cx="25" cy="20" rx="8" ry="12" fill="currentColor" />
              <ellipse cx="50" cy="18" rx="12" ry="10" fill="currentColor" />
              <ellipse cx="75" cy="22" rx="10" ry="14" fill="currentColor" />
            </svg>
            
            {/* Fog of War */}
            <FogOverlay visited={VISITED_CITIES} />
            
            {/* Heatmap Layer */}
            {showHeatmap && <HeatmapLayer />}
          </div>

          {/* Price Markers */}
          {filteredListings.map(listing => (
            <PriceMarker
              key={listing.id}
              listing={listing}
              onClick={() => setSelectedListing(listing)}
              isExpanded={selectedListing?.id === listing.id}
            />
          ))}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg">
            <p className="text-xs font-bold mb-2">Price Range</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span className="text-xs">Under $300</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <span className="text-xs">$300-$500</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500" />
                <span className="text-xs">Over $500</span>
              </div>
            </div>
          </div>

          {/* Stats Badge */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-bold">{filteredListings.length} stays</span>
            </div>
          </div>

          {/* Drawing Mode Indicator */}
          {isDrawingMode && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              Draw your search area • Click to add points
            </motion.div>
          )}
        </div>

        {/* Listing Detail Panel */}
        {selectedListing && (
          <ListingDetailPanel 
            listing={selectedListing} 
            onClose={() => setSelectedListing(null)} 
          />
        )}
      </div>
    </AppShell>
  );
}
