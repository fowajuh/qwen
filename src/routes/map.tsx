import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useScoutData } from "@/hooks/use-scout-data";
import { useMembership } from "@/hooks/use-membership";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, List, Layers, Navigation, Star, Phone, Globe, 
  ChevronRight, X, Plus, Share2, Bookmark, BookmarkCheck, 
  AlertCircle, Loader2, Search, Filter, Maximize2, Menu,
  ChevronDown, Zap, Shield, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Map, { Marker, Popup, NavigationControl, ScaleControl, FullscreenControl, GeolocateControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Supercluster from "supercluster";

// Mapbox style URLs - Professional cartography
const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  streets: "mapbox://styles/mapbox/streets-v12",
  satellite: "mapbox://styles/mapbox/satellite-v9",
};

// Get Mapbox token from environment or use placeholder
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "pk.placeholder_token_replace_in_env";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "NEXA Maps - Real-Time Local Discovery" },
      { name: "description", content: "Discover real nearby businesses powered by AI scouting agents." },
    ],
  }),
  component: MapPage,
});

interface ScoutBusiness {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  address?: string;
  phone?: string;
  website?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  isOpen?: boolean;
  priceLevel?: number;
  distance?: number;
  verified?: boolean;
  trustScore?: number;
  type?: 'business' | 'housing';
}

interface ClusterPopupProps {
  clusterId: number;
  pointCount: number;
  zoom: number;
  onClose: () => void;
}

// Billion-dollar UI: Custom marker component with rating badge
const BusinessMarker = ({ 
  business, 
  isSelected, 
  onClick 
}: { 
  business: ScoutBusiness; 
  isSelected: boolean; 
  onClick: () => void;
}) => {
  return (
    <Marker
      longitude={business.longitude}
      latitude={business.latitude}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div className={cn(
        "relative cursor-pointer transition-all duration-300 ease-out transform hover:scale-110",
        isSelected ? "scale-125 z-50" : "scale-100 z-10"
      )}>
        {/* Rating badge */}
        {business.rating && (
          <div className={cn(
            "absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full shadow-lg text-xs font-bold whitespace-nowrap z-20",
            "backdrop-blur-md border border-white/20",
            isSelected ? "bg-indigo-600 text-white" : "bg-white/95 dark:bg-gray-900/95 text-gray-900 dark:text-white"
          )}>
            <div className="flex items-center gap-1">
              <Star className={cn("w-3 h-3", business.rating >= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-400 text-gray-400")} />
              <span>{business.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
        
        {/* Verification badge for Pro users */}
        {business.verified && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-md z-20">
            <Shield className="w-3 h-3 text-white" />
          </div>
        )}
        
        {/* Pin body */}
        <div className={cn(
          "w-10 h-10 rounded-full shadow-xl flex items-center justify-center border-2 transition-all",
          isSelected 
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-white scale-110" 
            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-400"
        )}>
          <MapPin className={cn("w-5 h-5", isSelected ? "text-white" : "text-indigo-600")} />
        </div>
        
        {/* Pulse animation for selected */}
        {isSelected && (
          <div className="absolute inset-0 rounded-full bg-indigo-500 animate-ping opacity-20" />
        )}
      </div>
    </Marker>
  );
};

// Cluster marker for performance with 1000+ businesses
const ClusterMarker = ({ 
  cluster, 
  supercluster, 
  zoom, 
  onClick 
}: { 
  cluster: any; 
  supercluster: Supercluster; 
  zoom: number;
  onClick: (bbox: [number, number, number, number], zoomTo: number) => void;
}) => {
  const pointCount = cluster.properties.point_count;
  const clusterId = cluster.properties.cluster_id;
  
  // Dynamic sizing based on cluster size
  const size = pointCount < 10 ? 40 : pointCount < 100 ? 50 : 60;
  const color = pointCount < 10 ? '#4f46e5' : pointCount < 100 ? '#7c3aed' : '#dc2626';
  
  return (
    <Marker
      longitude={cluster.geometry.coordinates[0]}
      latitude={cluster.geometry.coordinates[1]}
      anchor="center"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          const expansionZoom = Math.min(supercluster.getClusterExpansionZoom(clusterId), 20);
          onClick(cluster.bbox || [-180, -90, 180, 90], expansionZoom);
        }}
        className={cn(
          "rounded-full shadow-xl flex items-center justify-center font-bold text-white transition-all duration-300 hover:scale-110 active:scale-95",
          "backdrop-blur-md border-2 border-white/30"
        )}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
        }}
      >
        {pointCount}
      </button>
    </Marker>
  );
};

function MapPage() {
  // FIX: useGeolocation() actually returns a flat object —
  // { latitude, longitude, accuracy, error, loading, permission,
  //   getCurrentLocation, checkPermission } — not { location, isLoading,
  //   requestPermission }. Destructuring keys that don't exist silently
  // produces `undefined` for every one of them (no TypeScript error,
  // because this hook's return type wasn't being checked against actual
  // usage). The practical effect: `location` was ALWAYS undefined, so the
  // `if (locError || !location)` guard below was permanently true — this
  // page could never render the actual map, for any user, ever, even with
  // location permission granted — and the "Enable Location Services"
  // button called `requestPermission`, which was also undefined, so
  // clicking it silently did nothing. This was a fully dead feature.
  const {
    latitude,
    longitude,
    error: locError,
    loading: locLoading,
    getCurrentLocation: requestPermission,
  } = useGeolocation();
  const location = latitude != null && longitude != null ? { lat: latitude, lng: longitude } : null;
  const { businesses, housing, isLoading: scoutLoading, refetch, agents: status } = useScoutData({ radiusKm: 5 });
  const { tier } = useMembership();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showList, setShowList] = useState(true);
  const [mapZoom, setMapZoom] = useState(14);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());
  const [mapStyle, setMapStyle] = useState<"light" | "dark" | "streets" | "satellite">("streets");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewState, setViewState] = useState({
    longitude: location?.lng || -74.0060,
    latitude: location?.lat || 40.7128,
    zoom: 14
  });
  const [clusters, setClusters] = useState<any[]>([]);
  const [superclusterIndex, setSuperclusterIndex] = useState<Supercluster | null>(null);

  // Update view state when location changes
  useEffect(() => {
    if (location) {
      setViewState(prev => ({
        ...prev,
        longitude: location.lng,
        latitude: location.lat
      }));
    }
  }, [location]);

  const allPlaces = useMemo(() => {
    const combined = [...businesses, ...housing.map(h => ({ ...h, category: 'Housing' as const, type: 'housing' as const }))];
    return combined.filter((b): b is ScoutBusiness => b != null);
  }, [businesses, housing]);

  const filtered = useMemo(() => {
    return allPlaces.filter((b) => {
      const matchFilter = filter === "All" || b.category === filter;
      const matchSearch = !searchQuery || 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [allPlaces, filter, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set(allPlaces.map(b => b.category));
    return ["All", ...Array.from(cats).slice(0, 8)];
  }, [allPlaces]);

  const selectedPlace = allPlaces.find(b => b.id === selectedId);

  const toggleSave = (id: string) => {
    setSavedPlaces(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Build supercluster index for performance
  useEffect(() => {
    if (filtered.length > 0) {
      const index = new Supercluster({
        radius: 60,
        extent: 512,
        minZoom: 0,
        maxZoom: 20,
      });
      
      const points = filtered.map(place => ({
        type: 'Feature' as const,
        properties: { 
          cluster: false,
          placeId: place.id,
          placeData: place
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [place.longitude, place.latitude]
        }
      }));
      
      index.load(points);
      setSuperclusterIndex(index);
    }
  }, [filtered]);

  // Get clusters based on current viewport
  const getClusters = useCallback(() => {
    if (!superclusterIndex) return [];
    
    const bounds: [number, number, number, number] = [
      viewState.longitude - 0.1,
      viewState.latitude - 0.1,
      viewState.longitude + 0.1,
      viewState.latitude + 0.1,
    ];
    
    return superclusterIndex.getClusters(bounds, Math.round(viewState.zoom));
  }, [superclusterIndex, viewState]);

  const handleClusterClick = useCallback((bbox: [number, number, number, number], zoomTo: number) => {
    setViewState(prev => ({
      longitude: (bbox[0] + bbox[2]) / 2,
      latitude: (bbox[1] + bbox[3]) / 2,
      zoom: zoomTo
    }));
  }, []);

  if (locError || !location) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Location Required</h2>
            <p className="text-gray-500 mb-4">Enable location to see nearby businesses on the map.</p>
            <Button onClick={requestPermission} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              Enable Location Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-0 flex bg-background overflow-hidden", isFullscreen ? "left-0" : "lg:left-[76px]")}>
      {/* Interactive Map - Billion Dollar Quality */}
      <div className="relative flex-1">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLES[mapStyle]}
          mapboxAccessToken={MAPBOX_TOKEN}
          scrollZoom={true}
          dragRotate={false}
          touchZoomRotate={true}
          doubleClickZoom={true}
          keyboard={true}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Professional controls */}
          <NavigationControl position="top-right" showCompass={false} visualizePitch={true} />
          <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
          <FullscreenControl position="top-right" />
          <GeolocateControl 
            position="top-right" 
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation={true}
            showUserHeading={true}
          />

          {/* Render clusters or individual markers based on zoom */}
          {viewState.zoom < 15 && superclusterIndex ? (
            getClusters().map((cluster) => {
              if (cluster.properties.cluster) {
                return (
                  <ClusterMarker
                    key={`cluster-${cluster.properties.cluster_id}`}
                    cluster={cluster}
                    supercluster={superclusterIndex!}
                    zoom={viewState.zoom}
                    onClick={handleClusterClick}
                  />
                );
              } else {
                const place = cluster.properties.placeData as ScoutBusiness;
                return (
                  <BusinessMarker
                    key={place.id}
                    business={place}
                    isSelected={selectedId === place.id}
                    onClick={() => setSelectedId(place.id === selectedId ? null : place.id)}
                  />
                );
              }
            })
          ) : (
            /* Show all individual markers at high zoom */
            filtered.map((place) => (
              <BusinessMarker
                key={place.id}
                business={place}
                isSelected={selectedId === place.id}
                onClick={() => setSelectedId(place.id === selectedId ? null : place.id)}
              />
            ))
          )}

          {/* Selected place popup */}
          {selectedPlace && (
            <Popup
              longitude={selectedPlace.longitude}
              latitude={selectedPlace.latitude}
              anchor="bottom"
              offset={[0, -40]}
              onClose={() => setSelectedId(null)}
              closeOnClick={false}
              className="nexa-popup"
            >
              <div className="w-64">
                {selectedPlace.imageUrl && (
                  <img 
                    src={selectedPlace.imageUrl} 
                    alt={selectedPlace.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-bold text-base mb-1">{selectedPlace.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">{selectedPlace.category}</Badge>
                  {selectedPlace.verified && (
                    <Badge className="bg-blue-500 text-xs">
                      <Shield className="w-3 h-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
                {selectedPlace.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{selectedPlace.rating.toFixed(1)}</span>
                    {selectedPlace.reviewCount && (
                      <span className="text-sm text-gray-500">({selectedPlace.reviewCount} reviews)</span>
                    )}
                  </div>
                )}
                {selectedPlace.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{selectedPlace.address}</p>
                )}
                <div className="flex gap-2">
                  {selectedPlace.phone && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={`tel:${selectedPlace.phone}`}>
                        <Phone className="w-4 h-4 mr-1" /> Call
                      </a>
                    </Button>
                  )}
                  {selectedPlace.website && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-1" /> Website
                      </a>
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => toggleSave(selectedPlace.id)}
                  >
                    {savedPlaces.has(selectedPlace.id) ? (
                      <><BookmarkCheck className="w-4 h-4 mr-1" /> Saved</>
                    ) : (
                      <><Bookmark className="w-4 h-4 mr-1" /> Save</>
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" /> Share
                  </Button>
                </div>
                {tier !== 'free' && selectedPlace.trustScore && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trust Score: <span className="font-semibold text-green-600">{selectedPlace.trustScore}/100</span></span>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* Floating Search Bar - Billion Dollar UI */}
        <div className="absolute top-4 left-4 right-4 md:right-auto md:max-w-xl z-[400]">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center gap-3 px-4 h-14 border border-gray-200/50 dark:border-gray-700/50">
            <button 
              onClick={() => setShowList(v => !v)} 
              className={cn("p-2 rounded-xl transition-all duration-200", showList ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800")}
            >
              <List className="w-5 h-5" />
            </button>
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="Search restaurants, shops, services..." 
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-gray-400" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMapStyle(s => s === "light" ? "dark" : s === "dark" ? "streets" : s === "streets" ? "satellite" : "light")}
              title={`Map style: ${mapStyle}`}
            >
              <Layers className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Search dropdown suggestions with smooth animation */}
          {searchQuery && filtered.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 max-h-96 overflow-y-auto"
            >
              {filtered.slice(0, 6).map((place, idx) => (
                <motion.button 
                  key={place.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 last:border-0 text-left transition-all group" 
                  onClick={() => { setSelectedId(place.id); setSearchQuery(""); setViewState(prev => ({ ...prev, longitude: place.longitude, latitude: place.latitude, zoom: 16 })); }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{place.name}</p>
                    <p className="text-xs text-gray-500 truncate">{place.address || place.category}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Category Filter Pills - Enhanced UX */}
        <div className="absolute top-24 left-4 z-[400] hidden md:flex flex-col gap-2 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {categories.map((cat, idx) => (
            <motion.button 
              key={cat}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.05, x: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)} 
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all backdrop-blur-md border whitespace-nowrap",
                filter === cat 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-indigo-500/25" 
                  : "bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md"
              )}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Mobile Category Bar */}
        <div className="absolute bottom-4 left-4 right-4 md:hidden z-[400]">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-gray-200/50 overflow-x-auto scrollbar-hide">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <motion.button 
                  key={cat}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(cat)} 
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
                    filter === cat 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  )}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State - Enhanced */}
        {(scoutLoading || locLoading) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500]"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-200/50">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm font-semibold">AI Scouts scanning area...</span>
            </div>
          </motion.div>
        )}

        {/* Empty State - Actionable */}
        {!scoutLoading && filtered.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] text-center"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border border-gray-200/50 max-w-sm">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-semibold mb-1">No places found</p>
              <p className="text-sm text-gray-500 mb-3">Try adjusting your search or filters</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setFilter("All"); setSearchQuery(""); }}
                >
                  Clear Filters
                </Button>
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600"
                  onClick={() => refetch()}
                >
                  <Zap className="w-4 h-4 mr-1" /> Rescan
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Map Style Indicator */}
        <div className="absolute top-4 right-4 z-[400]">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-gray-200/50 text-xs font-medium capitalize">
            {mapStyle} mode
          </div>
        </div>

        {/* Stats Badge */}
        {filtered.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 md:bottom-4 right-4 z-[400]"
          >
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200/50 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold">{filtered.length} places</span>
              {selectedPlace && (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">Selected: {selectedPlace.name}</span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Zoom Controls - Integrated with Mapbox */}
        <div className="absolute bottom-32 right-4 z-[400] flex flex-col gap-2 md:hidden">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-xl shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
              onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 1, 20) }))}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-xl shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
              onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 1, 3) }))}
            >
              <span className="text-lg leading-none">−</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              size="icon" 
              variant="secondary" 
              className="rounded-xl shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
              onClick={() => setViewState(prev => ({ ...prev, zoom: 14 }))}
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Fullscreen Toggle */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-20 right-4 z-[400] rounded-xl shadow-lg backdrop-blur-md bg-white/90 dark:bg-gray-900/90"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </Button>

        {/* Selected Place Bottom Sheet / Floating Card */}
        <AnimatePresence>
          {selectedPlace && (
            <motion.div 
              initial={{ y: 400, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-[500] lg:left-auto lg:right-4 lg:bottom-24 lg:w-96"
            >
              <Card className="rounded-t-3xl lg:rounded-3xl shadow-2xl border-0 overflow-hidden bg-white/98 dark:bg-gray-900/98 backdrop-blur-md">
                <div className="relative h-56 bg-gray-200 dark:bg-gray-700 group">
                  {selectedPlace.imageUrl ? (
                    <img 
                      src={selectedPlace.imageUrl} 
                      alt={selectedPlace.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRmNDZlNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iYXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <MapPin className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button 
                    onClick={() => setSelectedId(null)} 
                    className="absolute top-4 right-4 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => toggleSave(selectedPlace.id)} 
                    className="absolute top-4 left-4 p-2.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors"
                  >
                    {savedPlaces.has(selectedPlace.id) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedPlace.verified && (
                        <Badge className="bg-green-500/90 text-white border-0">
                          ✓ Verified
                        </Badge>
                      )}
                      {selectedPlace.isOpen !== undefined && (
                        <Badge variant={selectedPlace.isOpen ? "default" : "secondary"} className={selectedPlace.isOpen ? "bg-green-600" : "bg-red-500"}>
                          {selectedPlace.isOpen ? "Open Now" : "Closed"}
                        </Badge>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedPlace.name}</h2>
                    <p className="text-white/80 text-sm">{selectedPlace.category}</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {selectedPlace.rating && (
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">{selectedPlace.rating.toFixed(1)}</span>
                          {selectedPlace.reviewCount && (
                            <span className="text-gray-500 font-normal">({selectedPlace.reviewCount} reviews)</span>
                          )}
                        </Badge>
                      )}
                      {selectedPlace.priceLevel && (
                        <span className="text-sm text-gray-500">
                          {"$".repeat(selectedPlace.priceLevel)}
                        </span>
                      )}
                    </div>
                    {selectedPlace.distance && (
                      <span className="text-sm text-gray-500 font-medium">
                        {selectedPlace.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  
                  {selectedPlace.address && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedPlace.address}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedPlace.phone && (
                      <Button size="sm" variant="outline" className="gap-2 justify-center" asChild>
                        <a href={`tel:${selectedPlace.phone}`}>
                          <Phone className="w-4 h-4" />
                          Call
                        </a>
                      </Button>
                    )}
                    {selectedPlace.website && (
                      <Button size="sm" variant="outline" className="gap-2 justify-center" asChild>
                        <a href={selectedPlace.website} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-2 justify-center">
                      <Navigation className="w-4 h-4" />
                      Directions
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 justify-center">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                  
                  {tier !== 'free' && selectedPlace.trustScore && (
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Premium Insights</p>
                        <Badge variant="outline" className="text-xs">Pro Feature</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Trust Score</p>
                          <p className={cn("text-lg font-bold", selectedPlace.trustScore >= 80 ? "text-green-600" : selectedPlace.trustScore >= 60 ? "text-yellow-600" : "text-red-600")}>
                            {selectedPlace.trustScore}/100
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 mb-1">Popularity</p>
                          <p className="text-lg font-bold text-indigo-600">
                            {selectedPlace.reviewCount && selectedPlace.reviewCount > 100 ? "High" : selectedPlace.reviewCount && selectedPlace.reviewCount > 20 ? "Moderate" : "Low"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel List */}
      {showList && (
        <motion.div 
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="hidden lg:block w-96 border-l border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md overflow-y-auto"
        >
          <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-5 border-b border-gray-200/50 dark:border-gray-700/50 z-10">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-bold">Nearby Places</h2>
              <Badge variant="secondary" className="text-xs">{filtered.length} results</Badge>
            </div>
            <p className="text-sm text-gray-500">Powered by AI Scout Agents</p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {filtered.map((place) => (
              <motion.button 
                key={place.id} 
                whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.5)" }}
                className="w-full p-4 flex gap-4 transition-colors text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50" 
                onClick={() => setSelectedId(place.id)}
              >
                <div className="w-20 h-20 rounded-xl bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden shadow-md">
                  {place.imageUrl ? (
                    <img 
                      src={place.imageUrl} 
                      alt={place.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjNGY0NmU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJhcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OTyBJTUc8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{place.name}</h3>
                    {place.verified && (
                      <span className="text-green-500" title="Verified">✓</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate mb-2">{place.category}</p>
                  <div className="flex items-center gap-2">
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{place.rating.toFixed(1)}</span>
                        {place.reviewCount && (
                          <span className="text-xs text-gray-400">({place.reviewCount})</span>
                        )}
                      </div>
                    )}
                  </div>
                  {place.distance && (
                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
            {filtered.length === 0 && !scoutLoading && (
              <div className="p-8 text-center text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results match your filters</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
