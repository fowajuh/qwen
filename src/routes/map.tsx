import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";

function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
import { MapPin, X } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/manifest/AppShell";
import { useRequireAuth } from "@/components/manifest/AppShell";
import { useTrips, useTrip } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Map · GlobeTrotter" },
      {
        name: "description",
        content: "Visualize your trip stops on an interactive map.",
      },
      { property: "og:title", content: "Map · GlobeTrotter" },
      { property: "og:description", content: "See all your trip stops at a glance." },
    ],
  }),
  component: MapPage,
});

const defaultCenter: [number, number] = [20, 0];
const defaultZoom = 2;

const CATEGORY_COLORS: Record<string, string> = {
  flight: "#FF6B6B",
  stay: "#4ECDC4",
  eat: "#FFE66D",
  see: "#95E1D3",
  move: "#A8E6CF",
};

function MapBoundsFitter({ activeStops }: { activeStops: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (!activeStops || activeStops.length === 0) return;
    const validStops = activeStops.filter((s: any) => s.lat && s.lng);
    if (validStops.length === 0) return;
    
    const bounds = L.latLngBounds(validStops.map((s: any) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [activeStops, map]);
  
  return null;
}

const createMarkerIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; color: #0E1626; font-size: 13px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

function MapPage() {
  useRequireAuth();
  const { data: trips } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const { data: currentTrip } = useTrip(selectedTripId || "");

  const activeTrip = useMemo(
    () =>
      trips?.find((t) => t.id === selectedTripId) ??
      trips?.find((t) => t.status === "upcoming") ??
      trips?.[0],
    [trips, selectedTripId],
  );

  const activeStops = useMemo(() => {
    return activeTrip?.days?.flatMap((d: any) => d.stops) || [];
  }, [activeTrip]);

  const polylinePath = useMemo(() => {
    return activeStops
      .filter((s: any) => s.lat && s.lng)
      .sort((a: any, b: any) => (a.dayIndex || 0) - (b.dayIndex || 0) || (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((s: any) => [s.lat as number, s.lng as number] as [number, number]);
  }, [activeStops]);

  const selectedStop = activeStops.find((s: any) => s.id === selectedStopId);

  if (!trips || trips.length === 0) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-5 pt-6">
          <div className="mb-4">
            <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">
              Navigation · v1
            </p>
            <h1 className="font-display text-4xl text-departure-navy leading-[0.95] mt-1">
              Map
            </h1>
            <p className="text-sm text-ink-60 mt-1 max-w-md">
              Create a trip first to visualize your itinerary on a map.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] flex flex-col bg-cloud-white">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-cloud-white/85 backdrop-blur border-b border-ink-90/5">
          <div className="max-w-6xl mx-auto px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">
                  Navigation · v1
                </p>
                <h1 className="font-display text-3xl text-departure-navy leading-[0.95] mt-1">
                  {activeTrip?.name || "Map"}
                </h1>
                <p className="text-sm text-ink-60 mt-1">
                  {activeStops.length} stops · tap a marker for details
                </p>
              </div>
              {trips.length > 1 && (
                <div className="flex-1 md:flex-none md:max-w-xs">
                  <select
                    value={selectedTripId || activeTrip?.id || ""}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-ink-30/40 rounded-sm bg-cloud-white text-ink-90 hover:border-ink-30 transition-colors"
                  >
                    {trips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.destination || "TBD"})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <ClientOnly fallback={
          <div className="flex-1 mt-28 md:mt-32 flex items-center justify-center bg-runway-sand text-ink-60">
            Loading map…
          </div>
        }>
          <div className="flex-1 mt-28 md:mt-32 z-0 relative">
            <MapContainer
              zoom={defaultZoom}
              center={defaultCenter}
              style={{ width: "100%", height: "100%" }}
              zoomControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <MapBoundsFitter activeStops={activeStops} />

              {/* Polyline connecting stops */}
              {polylinePath.length > 1 && (
                <Polyline
                  positions={polylinePath}
                  pathOptions={{
                    color: "#4ECDC4",
                    opacity: 0.6,
                    weight: 3,
                  }}
                />
              )}

              {/* Markers for each stop */}
              {activeStops.map((stop: any, idx: number) => {
                if (!stop.lat || !stop.lng) return null;

                const color = CATEGORY_COLORS[stop.category] || "#95E1D3";

                return (
                  <Marker
                    key={stop.id}
                    position={[stop.lat, stop.lng]}
                    icon={createMarkerIcon(color, String(idx + 1))}
                    eventHandlers={{
                      click: () => setSelectedStopId(stop.id),
                    }}
                  >
                    <Popup
                      className="custom-leaflet-popup"
                    >
                      <div className="p-1 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="num text-[9px] uppercase tracking-[0.16em] text-ink-60 m-0 leading-tight">
                              {stop.category}
                            </p>
                            <h3 className="font-display text-lg text-departure-navy m-0 leading-tight mt-1">
                              {stop.name}
                            </h3>
                          </div>
                        </div>
                        {stop.notes && (
                          <p className="text-xs text-ink-60 mb-2 mt-2">{stop.notes}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-ink-60 mt-3 border-t border-ink-90/5 pt-2">
                          <span>
                            {stop.city && stop.country
                              ? `${stop.city}, ${stop.country}`
                              : "Location"}
                          </span>
                          {stop.cost && (
                            <span className="num font-medium text-departure-navy">
                              {stop.currency} {stop.cost}
                            </span>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </ClientOnly>

        {/* Bottom Panel - Stops List */}
        {activeStops.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-cloud-white/85 backdrop-blur border-t border-ink-90/5 max-h-[200px] overflow-y-auto z-10">
            <div className="max-w-6xl mx-auto px-5 py-4">
              <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-3">
                Stops ({activeStops.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {activeStops.map((stop: any, idx: number) => (
                  <motion.button
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "p-2 rounded-sm border text-left transition-all",
                      selectedStopId === stop.id
                        ? "bg-departure-navy text-cloud-white border-departure-navy"
                        : "border-ink-30/40 text-ink-90 hover:border-ink-30",
                    )}
                  >
                    <p className="num text-[9px] uppercase tracking-[0.12em] opacity-70 mb-0.5">
                      {idx + 1}. {stop.category}
                    </p>
                    <p className="text-xs truncate font-medium">{stop.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
