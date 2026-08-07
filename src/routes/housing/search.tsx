import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useMemo, useState } from "react";
import { ArrowLeft, Sliders, Map as MapIcon, Car, Key, Tv, Wifi, Waves, Snowflake } from "lucide-react";

import { api } from "@/lib/housing-data";
import type { HousingSearch } from "@/lib/housing-data";
import { useSavedListings, useToast, ToastContext, ToastContainer } from "@/hooks/use-housing-utils";
import { HousingCard, SkeletonCard, MapPreviewCard } from "@/components/housing/housing-card";
import { MapView } from "@/components/housing/map-view";
import { SearchModal } from "@/components/housing/search-modal";
import { FilterModal } from "@/components/housing/filter-modal";

export const Route = createFileRoute("/housing/search")({
  validateSearch: (search: Record<string, unknown>): HousingSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    query: typeof search.query === "string" ? search.query : undefined,
    minPrice: typeof search.minPrice === "number" ? search.minPrice : undefined,
    maxPrice: typeof search.maxPrice === "number" ? search.maxPrice : undefined,
    instantBook: typeof search.instantBook === "boolean" ? search.instantBook : undefined,
    superhost: typeof search.superhost === "boolean" ? search.superhost : undefined,
    amenities: Array.isArray(search.amenities) ? (search.amenities as string[]) : undefined,
  }),
  component: HousingSearchResults,
});

// Quick-filter chips — the same axes the full Filters sheet controls, surfaced
// as one-tap pills right under the search bar, the way Airbnb does on its results page.
const QUICK_FILTERS = [
  { key: "parking", label: "Free parking", icon: Car, amenity: "Parking" },
  { key: "self-check-in", label: "Self check-in", icon: Key, instantBook: true },
  { key: "tv", label: "TV", icon: Tv, amenity: "TV" },
  { key: "wifi", label: "Wifi", icon: Wifi, amenity: "Wifi" },
  { key: "pool", label: "Pool", icon: Waves, amenity: "Pool" },
  { key: "ac", label: "Air conditioning", icon: Snowflake, amenity: "Air conditioning" },
] as const;

function HousingSearchResults() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { toasts, add, remove } = useToast();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false); // mobile bottom-sheet snap: peek vs full

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["housingListings", "search", searchParams],
    queryFn: () => api.getListings(searchParams),
  });

  const { isSaved, toggle } = useSavedListings();

  const activeQuickFilters = useMemo(() => {
    const keys = new Set<string>();
    QUICK_FILTERS.forEach((f) => {
      if ("instantBook" in f && f.instantBook && searchParams.instantBook) keys.add(f.key);
      if ("amenity" in f && searchParams.amenities?.includes(f.amenity)) keys.add(f.key);
    });
    return keys;
  }, [searchParams]);

  const toggleQuickFilter = (filter: (typeof QUICK_FILTERS)[number]) => {
    navigate({
      search: (prev: any) => {
        const next = { ...prev };
        if ("instantBook" in filter && filter.instantBook) {
          next.instantBook = !prev.instantBook || undefined;
        }
        if ("amenity" in filter) {
          const current: string[] = prev.amenities || [];
          next.amenities = current.includes(filter.amenity)
            ? current.filter((a) => a !== filter.amenity)
            : [...current, filter.amenity];
          if (next.amenities.length === 0) next.amenities = undefined;
        }
        return next;
      },
    });
  };

  const selectedListing = listings.find((l) => l.id === selectedPinId) ?? null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60 || info.velocity.y < -300) setExpanded(true);
    else if (info.offset.y > 60 || info.velocity.y > 300) setExpanded(false);
  };

  return (
    <ToastContext.Provider value={{ add }}>
      <div className="w-full h-full bg-background flex flex-col">
        {/* Header — matches "Homes in {query} / Any weekend · Add guests" pill */}
        <div className="shrink-0 bg-background/95 backdrop-blur-md border-b border-hairline px-4 pt-3 pb-3 pt-safe">
          <div className="flex items-center gap-2 max-w-[900px] mx-auto">
            <button
              onClick={() => navigate({ to: "/housing" })}
              className="p-2 -ml-1 rounded-full hover:bg-surface shrink-0"
              aria-label="Back to housing"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex-1 flex flex-col items-center justify-center h-14 bg-background rounded-full shadow-lift border border-hairline px-5 hover:shadow-drama transition-shadow"
            >
              <span className="font-bold text-[14px] leading-tight">
                {searchParams.query ? `Homes in ${searchParams.query}` : "All homes"}
              </span>
              <span className="text-[12px] text-muted-foreground leading-tight">
                Any weekend · Add guests
              </span>
            </button>
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="w-11 h-11 rounded-full border border-hairline flex items-center justify-center shrink-0 hover:bg-surface transition-colors"
              aria-label="Filters"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>

          {/* Quick filter chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-3 max-w-[900px] mx-auto">
            {QUICK_FILTERS.map((f) => {
              const active = activeQuickFilters.has(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggleQuickFilter(f)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[13px] font-medium whitespace-nowrap transition-colors shrink-0 ${
                    active ? "bg-foreground text-background border-foreground" : "border-hairline hover:border-foreground/40"
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ MOBILE: map + draggable bottom sheet ============ */}
        <div className="relative flex-1 overflow-hidden lg:hidden">
          <MapView
            listings={listings}
            hoveredId={selectedPinId}
            onHover={() => {}}
            onSelect={(id) => {
              setSelectedPinId(id);
              setExpanded(false);
            }}
            showMap
            onCloseMap={() => {}}
            hideToggle
          />

          {/* Pin-tap preview card, floats just above the sheet's peek edge */}
          <AnimatePresence>
            {selectedListing && !expanded && (
              <div className="absolute inset-x-4 z-20" style={{ bottom: "calc(42vh + 12px)" }}>
                <MapPreviewCard
                  item={selectedListing}
                  saved={isSaved(selectedListing.id)}
                  onToggleSave={() => toggle(selectedListing.id)}
                  onClose={() => setSelectedPinId(null)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Draggable bottom sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
            animate={{ height: expanded ? "90vh" : "42vh" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="absolute bottom-0 inset-x-0 z-30 bg-background rounded-t-3xl shadow-drama flex flex-col"
          >
            <button
              onClick={() => setExpanded((e) => !e)}
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none shrink-0"
              aria-label={expanded ? "Collapse list" : "Expand list"}
            >
              <div className="w-10 h-1.5 rounded-full bg-muted-foreground/30" />
            </button>

            <div className="px-4 pb-2 flex items-center justify-between shrink-0">
              <div>
                <h1 className="font-bold text-[16px] leading-tight">
                  {isLoading ? "Searching…" : `${listings.length} place${listings.length === 1 ? "" : "s"}`}
                </h1>
                <p className="text-[11px] text-muted-foreground">🏷️ Prices include all fees</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-8">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : listings.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {listings.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedPinId(item.id)}
                      className={selectedPinId === item.id ? "ring-2 ring-foreground rounded-2xl" : ""}
                    >
                      <HousingCard
                        item={item}
                        idx={idx}
                        saved={isSaved(item.id)}
                        onToggleSave={() => toggle(item.id)}
                        onHover={() => {}}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  No places match these filters. Try clearing a few.
                </div>
              )}
            </div>
          </motion.div>

          {/* Floating Map/List toggle pill — appears once the sheet is expanded */}
          <AnimatePresence>
            {expanded && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => setExpanded(false)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold shadow-drama hover:scale-105 transition-transform"
              >
                <MapIcon className="w-4 h-4" /> Map
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ============ DESKTOP: scrollable list + sticky map split ============ */}
        <div className="hidden lg:flex flex-1 min-h-0">
          <div className="w-[54%] xl:w-[58%] h-full overflow-y-auto px-6 xl:px-10 py-6">
            <h1 className="text-[20px] font-bold mb-1">
              {isLoading ? "Searching…" : `${listings.length} place${listings.length === 1 ? "" : "s"}${searchParams.query ? ` in ${searchParams.query}` : ""}`}
            </h1>
            <p className="text-[13px] text-muted-foreground mb-6">Prices include all fees</p>

            {isLoading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((item, idx) => (
                  <HousingCard
                    key={item.id}
                    item={item}
                    idx={idx}
                    saved={isSaved(item.id)}
                    onToggleSave={() => toggle(item.id)}
                    onHover={setHoveredId}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center text-muted-foreground">
                No places match these filters. Try clearing a few.
              </div>
            )}
          </div>

          <div className="flex-1 relative h-full">
            <MapView
              listings={listings}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={(id) => navigate({ to: "/housing/$id", params: { id } })}
              showMap
              onCloseMap={() => {}}
              hideToggle
            />
          </div>
        </div>

        <ToastContainer toasts={toasts} remove={remove} />
      </div>

      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <FilterModal
        open={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        value={{
          minPrice: searchParams.minPrice || 0,
          maxPrice: searchParams.maxPrice || 2000,
          instantBook: searchParams.instantBook || false,
          superhost: searchParams.superhost || false,
          amenities: searchParams.amenities || [],
        }}
        onApply={(f) => {
          navigate({ search: (prev: any) => ({ ...prev, ...f }) });
          setIsFiltersOpen(false);
        }}
      />
    </ToastContext.Provider>
  );
}
