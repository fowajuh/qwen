import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { Bookmark, Check, MapPin, SlidersHorizontal, X, Flame, Eye, Clock, Zap, Star } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
import { AppShell } from "@/components/manifest/AppShell";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { Skeleton } from "@/components/manifest/Skeleton";
import { Sheet } from "@/components/manifest/Sheet";
import { UrgencyBadge, SavedCountBadge, ViewCounter, HostResponseBadge, InstantBookBadge, MatchScoreBadge, ListingCardBadges } from "@/components/manifest/UrgencyTriggers";
import { useTrips, useRecommendations, useCreateStop } from "@/lib/queries";
import { api, type ApiRecommendation } from "@/lib/api-client";
import { cn, hapticFeedback, formatCompactNumber } from "@/lib/utils";
import { useGamification, XP_REWARDS } from "@/lib/gamification-store";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Discover · GlobeTrotter" },
      {
        name: "description",
        content: "AI-picked stops for your next trip. Swipe right to add, left to dismiss.",
      },
      { property: "og:title", content: "Discover · GlobeTrotter" },
      { property: "og:description", content: "Swipe through stops tuned to your travel style." },
    ],
  }),
  component: Recs,
});

const ALL_INTERESTS = ["food", "culture", "outdoors", "nightlife", "art", "shopping"];
const STYLES = ["shoestring", "comfort", "luxury"] as const;

/** Prefer the real Google Place ID as identity; title is only a fallback for
 * recommendations that somehow don't carry one. */
const recKey = (rec: ApiRecommendation) => rec.googlePlaceId ?? rec.title;

const createMiniMarkerIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background-color: #f2a03d; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

function Card({
  rec,
  onSwipe,
  onOpenDetail,
  stackIndex,
}: {
  rec: ApiRecommendation;
  onSwipe: (dir: "left" | "right" | "up") => void;
  onOpenDetail: () => void;
  stackIndex: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rot = useTransform(x, [-200, 200], [-14, 14]);
  const opacity = useTransform(x, [-220, -80, 0, 80, 220], [0, 0.6, 1, 0.6, 0]);
  const yesOp = useTransform(x, [40, 140], [0, 1]);
  const noOp = useTransform(x, [-140, -40], [1, 0]);
  const saveOp = useTransform(y, [-140, -40], [1, 0]);
  
  // Gamification hook for XP rewards
  const awardXP = useGamification((state) => state.awardXP);
  
  // Simulated urgency data for billion-dollar feel
  const viewers = Math.floor(Math.random() * 15) + 3;
  const savedCount = Math.floor(Math.random() * 500) + 50;
  const matchScore = Math.floor(Math.random() * 20) + 80;
  const bookedThisWeek = Math.floor(Math.random() * 8) + 1;

  return (
    <motion.div
      drag={stackIndex === 0}
      style={{ x, y, rotate: rot, opacity, zIndex: 10 - stackIndex }}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) {
          hapticFeedback("medium");
          onSwipe("right");
        } else if (info.offset.x < -120) {
          hapticFeedback("light");
          onSwipe("left");
        } else if (info.offset.y < -120) {
          hapticFeedback("light");
          onSwipe("up");
        }
      }}
      onTap={() => {
        if (stackIndex === 0) {
          hapticFeedback("light");
          onOpenDetail();
        }
      }}
      whileTap={{ scale: 0.97 }}
      initial={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 12, opacity: 0 }}
      animate={{ scale: 1 - stackIndex * 0.04, y: stackIndex * 12, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 rounded-2xl overflow-hidden bg-departure-navy text-cloud-white cursor-grab active:cursor-grabbing shadow-[0_30px_60px_-20px_rgba(14,22,38,0.55)]"
    >
      {/* Background image from real place data, or fallback map */}
      {rec.photoUrl ? (
        <>
          <img
            src={rec.photoUrl}
            alt={rec.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            loading="lazy"
          />
          {/* Subtle gradient ONLY at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-departure-navy/95 via-departure-navy/30 to-departure-navy/10" />
        </>
      ) : rec.lat && rec.lng ? (
        <ClientOnly>
          <div className="absolute inset-0 w-full h-full opacity-60 pointer-events-none">
            <MapContainer
              center={[rec.lat, rec.lng]}
              zoom={13}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              />
              <Marker position={[rec.lat, rec.lng]} icon={createMiniMarkerIcon()} />
            </MapContainer>
          </div>
          {/* Bottom gradient for text legibility when map shows */}
          <div className="absolute inset-0 bg-gradient-to-t from-departure-navy/95 via-departure-navy/40 to-transparent" />
        </ClientOnly>
      ) : (
        /* No image or map: use a rich gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-departure-navy via-[#1a3058] to-horizon-teal/60" />
      )}

      {/* When no image: add a fallback gradient background */}
      {!rec.photoUrl && !rec.lat && !rec.lng && (
        <div className="absolute inset-0 bg-gradient-to-br from-departure-navy via-[#1a3058] to-horizon-teal/60" />
      )}
      
      {/* Billion-dollar urgency triggers overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
        <div className="flex flex-col gap-2">
          <MatchScoreBadge score={matchScore} />
          <ViewCounter count={viewers} />
        </div>
        <SavedCountBadge count={savedCount} />
      </div>
      
      <MapPin className="absolute top-8 right-8 w-16 h-16 text-cloud-white/10" strokeWidth={1} />

      <motion.div
        style={{ opacity: yesOp }}
        className="absolute top-20 left-6 customs-stamp text-horizon-teal border-horizon-teal bg-cloud-white/95 rotate-[-8deg] shadow-lg"
      >
        Add to trip
      </motion.div>
      <motion.div
        style={{ opacity: noOp }}
        className="absolute top-20 right-6 customs-stamp text-runway-red border-runway-red bg-cloud-white/95 rotate-[8deg] shadow-lg"
      >
        Dismissed
      </motion.div>
      <motion.div
        style={{ opacity: saveOp }}
        className="absolute top-20 left-1/2 -translate-x-1/2 customs-stamp text-beacon-amber border-beacon-amber bg-cloud-white/95 rotate-0 shadow-lg"
      >
        Saved
      </motion.div>

      <div className="relative flex flex-col h-full p-6 z-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="num text-[10px] uppercase tracking-[0.24em] opacity-80">
              {rec.category}
            </span>
            {rec.city && rec.country && (
              <span className="num text-[9px] uppercase tracking-[0.16em] opacity-70">
                {rec.city} · {rec.country}
              </span>
            )}
          </div>
          {stackIndex === 0 && (
            <span className="num text-[9px] uppercase tracking-[0.18em] text-cloud-white/40">
              Tap for details
            </span>
          )}
        </div>
        <div className="mt-auto">
          <h3 className="font-display text-4xl leading-[0.95] mt-2 drop-shadow-lg">{rec.title}</h3>
          <p className="mt-3 text-sm text-cloud-white/90 max-w-md line-clamp-3 drop-shadow-md">{rec.blurb}</p>

          {/* Billion-dollar rating display with Lucide icons */}
          {rec.rating && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-beacon-amber fill-beacon-amber" />
                <span className="font-display text-lg text-cloud-white">{rec.rating}</span>
              </div>
              {rec.reviewCount && (
                <span className="text-xs text-cloud-white/70">
                  ({formatCompactNumber(rec.reviewCount)} reviews)
                </span>
              )}
              <InstantBookBadge />
            </div>
          )}
          
          {/* Urgency trigger - social proof */}
          <div className="mt-2 flex items-center gap-2 text-xs text-cloud-white/75">
            <Clock className="w-3 h-3" />
            <span>{bookedThisWeek} booked this week</span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-cloud-white/20 pt-3">
            <span className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/70">
              Est. cost
            </span>
            <span className="num text-sm text-beacon-amber font-medium">
              {rec.currency} {rec.estCost}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Recs() {
  const { data: trips } = useTrips();
  const [tripId, setTripId] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([
    "food",
    "culture",
    "outdoors",
    "nightlife",
  ]);
  const [style, setStyle] = useState<(typeof STYLES)[number]>("comfort");

  const activeTrip = useMemo(
    () =>
      trips?.find((t) => t.id === tripId) ??
      trips?.find((t) => t.status === "upcoming") ??
      trips?.[0],
    [trips, tripId],
  );
  const { data: recommendations, isPending } = useRecommendations(
    activeTrip?.id ?? "",
    interests,
    style,
  );
  const createStop = useCreateStop(activeTrip?.id ?? "");

  const [idx, setIdx] = useState(0);
  const [log, setLog] = useState<{ rec: ApiRecommendation; dir: string }[]>([]);
  const [saved, setSaved] = useState<ApiRecommendation[]>([]);
  const [tuneOpen, setTuneOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [detailRec, setDetailRec] = useState<ApiRecommendation | null>(null);

  const remaining = (recommendations ?? []).slice(idx);

  const addToTrip = (rec: ApiRecommendation) => {
    if (!activeTrip) return;
    createStop.mutate({
      dayIndex: 0,
      orderIndex: 999,
      name: rec.title,
      category: rec.category === "restaurant" || rec.category === "food" ? "eat" : "see",
      cost: rec.estCost,
      currency: rec.currency,
      notes: rec.blurb,
      city: rec.city,
      country: rec.country,
      lat: rec.lat,
      lng: rec.lng,
    });
  };

  const handle = (dir: "left" | "right" | "up") => {
    const rec = (recommendations ?? [])[idx];
    if (!rec) return;
    setLog((l) => [{ rec, dir }, ...l].slice(0, 8));

    if (dir === "right") {
      addToTrip(rec);
      toast.success("Added to the manifest", {
        description: rec.title,
        action: { label: "Undo", onClick: () => undoLast() },
      });
    }
    if (dir === "left") {
      api.dismissRecommendation(rec.googlePlaceId ?? encodeURIComponent(rec.title)).catch(() => undefined);
      toast("Dismissed", {
        description: rec.title,
        action: { label: "Undo", onClick: () => undoLast() },
      });
    }
    if (dir === "up") {
      setSaved((s) => [rec, ...s]);
      toast("Saved for later", {
        description: rec.title,
        action: { label: "Undo", onClick: () => undoLast() },
      });
    }
    setIdx((i) => i + 1);
    setDetailRec(null);
  };

  const undoLast = () => {
    setLog((l) => {
      if (l.length === 0) return l;
      const [last] = l;
      if (last.dir === "up") setSaved((s) => s.filter((r) => recKey(r) !== recKey(last.rec)));
      setIdx((i) => Math.max(0, i - 1));
      return l.slice(1);
    });
  };

  const toggleInterest = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 pt-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">
              Manifest augment · v1
            </p>
            <h1 className="font-display text-4xl text-departure-navy leading-[0.95] mt-1">
              Discover
            </h1>
            <p className="text-sm text-ink-60 mt-1 max-w-md">
              {activeTrip
                ? `AI picks tuned to "${activeTrip.name}". Swipe right to add, left to dismiss, up to save.`
                : "Create a trip first to get tuned recommendations."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {saved.length > 0 && (
              <button
                onClick={() => setSavedOpen(true)}
                aria-label="Saved recommendations"
                className="relative w-10 h-10 rounded-full border border-ink-30/30 flex items-center justify-center text-ink-60 hover:text-departure-navy hover:border-ink-30 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 num text-[9px] w-4 h-4 rounded-full bg-beacon-amber text-departure-navy flex items-center justify-center">
                  {saved.length}
                </span>
              </button>
            )}
            <button
              onClick={() => setTuneOpen(true)}
              aria-label="Tune recommendations"
              className="w-10 h-10 rounded-full border border-ink-30/30 flex items-center justify-center text-ink-60 hover:text-departure-navy hover:border-ink-30 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PerforatedDivider label={`${remaining.length} in queue`} />

        <div className="relative h-[520px] max-w-md mx-auto mt-6">
          {isPending && activeTrip ? (
            <Skeleton className="absolute inset-0 rounded-lg" />
          ) : (
            <AnimatePresence>
              {remaining.length > 0 ? (
                remaining
                  .slice(0, 3)
                  .reverse()
                  .map((rec, i, arr) => (
                    <Card
                      key={recKey(rec)}
                      rec={rec}
                      stackIndex={arr.length - 1 - i}
                      onSwipe={handle}
                      onOpenDetail={() => setDetailRec(rec)}
                    />
                  ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
                >
                  <span className="customs-stamp text-ink-60">End of queue</span>
                  <p className="font-display text-2xl text-departure-navy mt-4">
                    You're all caught up.
                  </p>
                  <p className="text-sm text-ink-60 mt-1">
                    New recommendations refresh every few hours.
                  </p>
                  <button
                    onClick={() => setTuneOpen(true)}
                    className="mt-5 num text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm border border-ink-30/40 text-ink-60 hover:text-departure-navy"
                  >
                    Tune preferences
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Action buttons */}
        {remaining.length > 0 && (
          <div className="flex items-center justify-center gap-5 mt-6">
            <button
              onClick={() => handle("left")}
              aria-label="Dismiss"
              className="w-14 h-14 rounded-full border-2 border-runway-red text-runway-red hover:bg-runway-red hover:text-cloud-white active:scale-95 transition-all flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
            <button
              onClick={() => handle("up")}
              aria-label="Save"
              className="w-12 h-12 rounded-full border-2 border-beacon-amber text-beacon-amber hover:bg-beacon-amber hover:text-departure-navy active:scale-95 transition-all flex items-center justify-center"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => handle("right")}
              aria-label="Add"
              className="w-14 h-14 rounded-full border-2 border-horizon-teal text-horizon-teal hover:bg-horizon-teal hover:text-cloud-white active:scale-95 transition-all flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        )}

        {log.length > 0 && (
          <div className="mt-8 max-w-md mx-auto">
            <PerforatedDivider label="Recent decisions" />
            <ul className="mt-3 space-y-1">
              {log.slice(0, 5).map((entry, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between num text-[11px] uppercase tracking-[0.18em] text-ink-60"
                >
                  <span className="truncate max-w-[200px]">{entry.rec.title}</span>
                  <span
                    className={
                      entry.dir === "right"
                        ? "text-horizon-teal"
                        : entry.dir === "left"
                          ? "text-runway-red"
                          : "text-beacon-amber"
                    }
                  >
                    {entry.dir === "right" ? "Added" : entry.dir === "left" ? "Dismissed" : "Saved"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tune sheet */}
      <Sheet open={tuneOpen} onClose={() => setTuneOpen(false)} title="Tune recommendations">
        <div className="space-y-5 pt-1">
          {trips && trips.length > 0 && (
            <div>
              <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-2">
                For which trip
              </p>
              <div className="space-y-2">
                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTripId(t.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-sm border text-left transition-colors",
                      (activeTrip?.id ?? "") === t.id
                        ? "bg-departure-navy text-cloud-white border-departure-navy"
                        : "border-ink-30/40 text-ink-90 hover:border-ink-30",
                    )}
                  >
                    <span className="text-sm truncate">{t.name}</span>
                    <span className="num text-[10px] uppercase tracking-[0.15em] opacity-70 shrink-0 ml-2">
                      {t.destination}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((i) => (
                <button
                  key={i}
                  onClick={() => toggleInterest(i)}
                  className={cn(
                    "num text-[10px] uppercase tracking-[0.16em] px-3 py-2 rounded-sm border transition-colors capitalize",
                    interests.includes(i)
                      ? "bg-beacon-amber text-departure-navy border-beacon-amber"
                      : "border-ink-30/40 text-ink-60 hover:border-ink-30",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-2">
              Budget style
            </p>
            <div className="flex gap-2">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={cn(
                    "flex-1 num text-[10px] uppercase tracking-[0.16em] px-3 py-2.5 rounded-sm border transition-colors capitalize",
                    style === s
                      ? "bg-departure-navy text-cloud-white border-departure-navy"
                      : "border-ink-30/40 text-ink-60 hover:border-ink-30",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setIdx(0);
              setTuneOpen(false);
              toast.success("Queue refreshed to match your tuning");
            }}
            className="w-full num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-3 rounded-sm"
          >
            Apply & refresh queue
          </button>
        </div>
      </Sheet>

      {/* Saved sheet */}
      <Sheet open={savedOpen} onClose={() => setSavedOpen(false)} title={`Saved · ${saved.length}`}>
        <div className="space-y-3 pt-1">
          {saved.length === 0 && (
            <p className="text-sm text-ink-60">
              Nothing saved yet — swipe up on a card to keep it for later.
            </p>
          )}
          {saved.map((rec) => (
            <div key={recKey(rec)} className="ticket-stub rounded-sm overflow-hidden">
              <div className="flex items-start gap-3">
                {rec.photoUrl && (
                  <img
                    src={rec.photoUrl}
                    alt={rec.title}
                    className="w-20 h-20 object-cover rounded-sm shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">
                    {rec.category}
                  </p>
                  <h4 className="font-display text-lg text-departure-navy truncate">{rec.title}</h4>
                  {rec.rating && (
                    <p className="text-xs text-ink-60 mt-0.5">
                      ⭐ {rec.rating} · {rec.reviewCount} reviews
                    </p>
                  )}
                  <p className="text-xs text-ink-60 mt-0.5 num">
                    {rec.currency} {rec.estCost}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={() => {
                      addToTrip(rec);
                      setSaved((s) => s.filter((r) => recKey(r) !== recKey(rec)));
                      toast.success("Added to the manifest", { description: rec.title });
                    }}
                    className="num text-[10px] uppercase tracking-[0.16em] bg-beacon-amber text-departure-navy px-2.5 py-1.5 rounded-sm whitespace-nowrap"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setSaved((s) => s.filter((r) => recKey(r) !== recKey(rec)))}
                    className="num text-[10px] uppercase tracking-[0.16em] border border-ink-30/40 text-ink-60 px-2.5 py-1.5 rounded-sm whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Detail sheet */}
      <Sheet open={!!detailRec} onClose={() => setDetailRec(null)} title={detailRec?.category}>
        {detailRec && (
          <div className="space-y-4 pt-1">
            {/* Photo from real place */}
            {detailRec.photoUrl && (
              <img
                src={detailRec.photoUrl}
                alt={detailRec.title}
                className="w-full h-48 object-cover rounded-sm"
              />
            )}

            <h3 className="font-display text-3xl text-departure-navy leading-[0.98]">
              {detailRec.title}
            </h3>

            {/* Location info */}
            {(detailRec.city || detailRec.country) && (
              <p className="text-sm text-ink-60">
                📍 {detailRec.city && detailRec.country
                  ? `${detailRec.city}, ${detailRec.country}`
                  : detailRec.city || detailRec.country}
              </p>
            )}

            {detailRec.lat && detailRec.lng && (
              <ClientOnly>
                <div className="w-full h-40 rounded-sm overflow-hidden relative z-0">
                  <MapContainer
                    center={[detailRec.lat, detailRec.lng]}
                    zoom={14}
                    zoomControl={false}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    <Marker position={[detailRec.lat, detailRec.lng]} icon={createMiniMarkerIcon()} />
                  </MapContainer>
                </div>
              </ClientOnly>
            )}

            {/* Rating */}
            {detailRec.rating && (
              <div className="flex items-center gap-2 p-3 bg-runway-sand rounded-sm">
                <span className="text-lg">⭐ {detailRec.rating}</span>
                {detailRec.reviewCount && (
                  <span className="text-sm text-ink-60">
                    Based on {detailRec.reviewCount} reviews
                  </span>
                )}
              </div>
            )}

            <p className="text-sm text-ink-60">{detailRec.blurb}</p>

            <div className="flex items-center justify-between border-t border-ink-30/40 pt-3">
              <span className="num text-[10px] uppercase tracking-[0.2em] text-ink-60">
                Est. cost
              </span>
              <span className="num text-sm text-departure-navy">
                {detailRec.currency} {detailRec.estCost}
              </span>
            </div>

            {/* Google Maps link */}
            {detailRec.googleMapsUrl && (
              <a
                href={detailRec.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-runway-sand text-departure-navy px-4 py-2.5 rounded-sm hover:bg-runway-sand/80 transition-colors"
              >
                📍 View on Google Maps
              </a>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handle("left")}
                className="flex-1 num text-[11px] uppercase tracking-[0.2em] border border-runway-red/40 text-runway-red px-4 py-2.5 rounded-sm"
              >
                Dismiss
              </button>
              <button
                onClick={() => handle("up")}
                className="flex-1 num text-[11px] uppercase tracking-[0.2em] border border-beacon-amber text-beacon-amber px-4 py-2.5 rounded-sm"
              >
                Save
              </button>
              <button
                onClick={() => handle("right")}
                className="flex-1 num text-[11px] uppercase tracking-[0.2em] bg-horizon-teal text-cloud-white px-4 py-2.5 rounded-sm"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </AppShell>
  );
}
