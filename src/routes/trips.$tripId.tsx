import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Bed,
  Eye,
  Footprints,
  GripVertical,
  MapPin,
  MessageSquare,
  Pencil,
  Plane,
  Plus,
  Share2,
  Trash2,
  UsersRound,
  Users,
  UtensilsCrossed,
  Map as MapIcon,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Guard react-leaflet from SSR: Leaflet requires `window` which doesn't exist
// during TanStack Start's server-side render pass. Rendering inside this
// component ensures Leaflet code only ever runs in the browser.
function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
import { toast } from "sonner";
import { ManifestStub } from "@/components/manifest/ManifestStub";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { Sheet } from "@/components/manifest/Sheet";
import { Skeleton, StubSkeleton } from "@/components/manifest/Skeleton";
import { AppShell, useRequireAuth } from "@/components/manifest/AppShell";
import { ConfirmDialog } from "@/components/manifest/ConfirmDialog";
import { StopForm, type StopFormValues } from "@/components/manifest/StopForm";
import { TripMetaForm, type TripMetaValues } from "@/components/manifest/TripMetaForm";
import { ShareForm } from "@/components/manifest/ShareForm";
import type { Stop } from "@/lib/mock-data";
import {
  useTrip,
  useBudgetSummary,
  useComments,
  useAddComment,
  useCreateStop,
  usePatchStop,
  useDeleteStop,
  useReorderStops,
  useUpdateTrip,
  useAddCollaborator,
} from "@/lib/queries";
import { useTripRealtime } from "@/lib/realtime";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/trips/$tripId")({
  validateSearch: (search: Record<string, unknown>): { share?: boolean } => ({
    share: search.share === true || search.share === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [{ title: "Trip · GlobeTrotter" }, { name: "description", content: "Trip itinerary" }],
  }),
  component: TripDetail,
});

const iconFor: Record<Stop["category"], typeof Plane> = {
  flight: Plane,
  stay: Bed,
  eat: UtensilsCrossed,
  see: Eye,
  move: Footprints,
};

function MapBoundsFitter({ stops }: { stops: Stop[] }) {
  const map = useMap();
  useEffect(() => {
    const validStops = stops.filter((s) => s.lat && s.lng);
    if (validStops.length === 0) return;
    const bounds = L.latLngBounds(validStops.map((s) => [s.lat!, s.lng!]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [stops, map]);
  return null;
}

const createMarkerIcon = (label: string) => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="background-color: #f2a03d; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-family: monospace; color: #0E1626; font-size: 11px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

function StopRow({
  stop,
  expanded,
  onToggle,
  onOpenComments,
  onEdit,
  onDelete,
}: {
  stop: Stop;
  expanded: boolean;
  onToggle: () => void;
  onOpenComments: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const Icon = iconFor[stop.category];
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={stop}
      dragListener={false}
      dragControls={controls}
      className="ticket-stub relative text-ink-90 [--stub-bg:var(--cloud-white)] cursor-pointer"
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 40px -12px rgba(14,22,38,0.3)", zIndex: 5 }}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            controls.start(e);
          }}
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
          className="mt-1 shrink-0 text-ink-30 hover:text-ink-60 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="text-center shrink-0 min-w-[50px]">
          <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">Local</p>
          <p className="num text-lg text-departure-navy leading-tight">{stop.time}</p>
          <p className="num text-[10px] text-ink-60 mt-1">{stop.duration}</p>
        </div>
        <div className="w-px self-stretch bg-ink-30/40 relative">
          <span className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-beacon-amber ring-2 ring-cloud-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-ink-60" strokeWidth={1.75} />
                <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">
                  {stop.category}
                </p>
                {stop.booked && (
                  <span className="num text-[9px] tracking-[0.15em] text-horizon-teal uppercase">
                    ● Booked
                  </span>
                )}
              </div>
              <h3 className="font-display text-lg text-departure-navy leading-snug mt-0.5 truncate">
                {stop.name}
              </h3>
            </div>
            <div className="text-right shrink-0">
              <p className="num text-sm text-departure-navy">${stop.cost}</p>
              <p className="num text-[10px] text-ink-60">{stop.currency}</p>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-ink-30/50 space-y-3">
                  {stop.notes && <p className="text-sm text-ink-60 italic">{stop.notes}</p>}
                  {(stop.city || stop.country) && (
                    <div className="flex items-center gap-2 text-xs text-ink-60">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{[stop.city, stop.country].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenComments();
                      }}
                      className="num text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border border-ink-90/20 rounded-sm hover:bg-runway-sand flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" /> Comment
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="num text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border border-ink-90/20 rounded-sm hover:bg-runway-sand flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="num text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 border border-runway-red/30 text-runway-red rounded-sm hover:bg-runway-red/10 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

function CommentsPanel({ stopId }: { stopId: string }) {
  const { data: comments, isPending } = useComments(stopId);
  const addComment = useAddComment(stopId);
  const [body, setBody] = useState("");

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-3 max-h-[40vh] overflow-y-auto">
        {isPending && <StubSkeleton />}
        {comments?.length === 0 && (
          <p className="text-sm text-ink-60">
            No comments yet — be the first to leave a note for your co-travelers.
          </p>
        )}
        {comments?.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-runway-sand flex items-center justify-center shrink-0 num text-xs text-departure-navy">
              {c.user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-ink-90">{c.body}</p>
              <p className="num text-[10px] text-ink-60 mt-0.5">
                {c.user.name} · {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!body.trim()) return;
          addComment.mutate(body, {
            onSuccess: () => setBody(""),
            onError: () => toast.error("Couldn't post that comment"),
          });
        }}
        className="flex gap-2"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Leave a note for your co-travelers…"
          className="flex-1 rounded-sm border border-ink-30/40 px-3 py-2 text-sm outline-none focus:border-beacon-amber"
        />
        <button
          type="submit"
          disabled={addComment.isPending}
          className="num text-[10px] uppercase tracking-[0.18em] bg-beacon-amber text-departure-navy px-3 py-2 rounded-sm disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function TripDetailSkeleton() {
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-5 pt-6 space-y-4">
        <Skeleton className="h-[240px] w-full rounded-lg" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-2/3" />
        <StubSkeleton />
        <StubSkeleton />
        <StubSkeleton />
      </div>
    </AppShell>
  );
}

function EdgeSwipeBack() {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 90], [0, 1]);
  const chevronX = useTransform(x, [0, 90], [-6, 4]);

  return (
    <>
      <motion.div
        style={{ opacity }}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none w-10 h-10 rounded-full bg-cloud-white/90 backdrop-blur flex items-center justify-center shadow-lg"
      >
        <motion.span style={{ x: chevronX }}>
          <ArrowLeft className="w-4 h-4 text-departure-navy" />
        </motion.span>
      </motion.div>
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragEnd={(_, info) => {
          if (info.offset.x > 90) navigate({ to: "/" });
          else x.set(0);
        }}
        className="fixed left-0 top-0 h-full w-5 z-30 touch-none"
        aria-hidden
      />
    </>
  );
}

function TripDetail() {
  const { tripId } = Route.useParams();
  const search = Route.useSearch();
  useRequireAuth();
  const queryClient = useQueryClient();
  const { data: trip, isPending, isError, refetch } = useTrip(tripId);
  const { data: budget } = useBudgetSummary(tripId);

  const createStop = useCreateStop(tripId);
  const patchStop = usePatchStop(tripId);
  const deleteStop = useDeleteStop(tripId);
  const reorderStops = useReorderStops(tripId);
  const updateTrip = useUpdateTrip();
  const addCollaborator = useAddCollaborator(tripId);

  const [dayIdx, setDayIdx] = useState(0);
  const [expandedStop, setExpandedStop] = useState<string | null>(null);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [commentsStopId, setCommentsStopId] = useState<string | null>(null);
  const [stopSheet, setStopSheet] = useState<{ mode: "add" | "edit"; stop?: Stop } | null>(null);
  const [deleteStopTarget, setDeleteStopTarget] = useState<Stop | null>(null);
  const [metaOpen, setMetaOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(!!search.share);
  const [orderedStops, setOrderedStops] = useState<Stop[]>([]);
  const [showMap, setShowMap] = useState(false);

  const { presence } = useTripRealtime(tripId, () => {
    // A live comment arrived — invalidate so the comments panel (if open) refetches.
    queryClient.invalidateQueries({ queryKey: ["comments"] });
  });

  const activeDay = trip?.days[dayIdx];

  // Keep local drag order in sync with server data whenever the active day changes.
  // (Deliberately not depending on the stops array itself — it's a fresh
  // reference every render and would fight the in-flight drag reorder.)
  useEffect(() => {
    setOrderedStops(activeDay?.stops ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDay?.index, activeDay?.stops.length, tripId]);

  if (isPending) return <TripDetailSkeleton />;

  if (isError || !trip) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-5 pt-16 text-center">
          <span className="customs-stamp text-runway-red">Manifest unavailable</span>
          <p className="font-display text-2xl text-departure-navy mt-4">
            We couldn't pull this trip.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => refetch()}
              className="num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm"
            >
              Retry
            </button>
            <Link
              to="/"
              className="num text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm border border-ink-30/40"
            >
              Back to trips
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const planned = budget?.planned ?? trip.budgetPlanned;
  const spent = budget?.spent ?? trip.budgetSpent;
  const pct = Math.min(100, (spent / (planned || 1)) * 100);
  const over = budget?.overBudget ?? spent > planned;

  const closeStopSheet = () => setStopSheet(null);

  const submitStop = (values: StopFormValues) => {
    const [h, m] = values.time.split(":").map(Number);
    const startTime = new Date(trip.startDate);
    startTime.setUTCDate(startTime.getUTCDate() + (activeDay?.index ?? 0));
    startTime.setUTCHours(h || 0, m || 0, 0, 0);

    if (stopSheet?.mode === "edit" && stopSheet.stop) {
      patchStop.mutate(
        {
          id: stopSheet.stop.id,
          input: {
            name: values.name,
            category: values.category,
            city: values.city || null,
            cost: Number(values.cost) || 0,
            currency: values.currency || "USD",
            notes: values.notes || null,
            startTime: startTime.toISOString(),
          },
        },
        {
          onSuccess: () => {
            toast.success("Stop updated", { description: values.name });
            closeStopSheet();
          },
          onError: () => toast.error("Couldn't save that stop"),
        },
      );
    } else {
      createStop.mutate(
        {
          dayIndex: activeDay?.index ?? 0,
          orderIndex: (activeDay?.stops.length ?? 0) + 1,
          name: values.name,
          category: values.category,
          city: values.city || undefined,
          cost: Number(values.cost) || 0,
          currency: values.currency || "USD",
          notes: values.notes || undefined,
          startTime: startTime.toISOString(),
        },
        {
          onSuccess: () => {
            toast.success("Added to the manifest", { description: values.name });
            closeStopSheet();
          },
          onError: () => toast.error("Couldn't add that stop"),
        },
      );
    }
  };

  const handleReorder = (next: Stop[]) => {
    setOrderedStops(next);
    reorderStops.mutate({
      stopId: next[0]?.id ?? "",
      order: next.map((s, i) => ({ id: s.id, orderIndex: i })),
    });
  };

  const polylinePath = useMemo(() => {
    if (!trip?.days) return [];
    return trip.days.flatMap(d => d.stops)
      .filter((s) => s.lat && s.lng)
      .sort((a, b) => (a.dayIndex || 0) - (b.dayIndex || 0) || (a.orderIndex || 0) - (b.orderIndex || 0))
      .map((s) => [s.lat as number, s.lng as number] as [number, number]);
  }, [trip]);

  return (
    <div className="min-h-screen bg-cloud-white pb-32">
      <EdgeSwipeBack />
      {/* Parallax cover */}
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${trip.cover})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cloud-white via-cloud-white/10 to-departure-navy/40" />
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="w-10 h-10 rounded-full bg-cloud-white/90 backdrop-blur flex items-center justify-center text-departure-navy hover:bg-cloud-white transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            {presence.length > 0 && (
              <div className="h-10 pl-3 pr-4 rounded-full bg-cloud-white/90 backdrop-blur flex items-center gap-1.5 text-departure-navy text-xs num">
                <Users className="w-3.5 h-3.5" />
                {presence.length} here now
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareOpen(true)}
              aria-label="Share trip"
              className="w-10 h-10 rounded-full bg-cloud-white/90 backdrop-blur flex items-center justify-center text-departure-navy hover:bg-cloud-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMetaOpen(true)}
              aria-label="Edit trip details"
              className="w-10 h-10 rounded-full bg-cloud-white/90 backdrop-blur flex items-center justify-center text-departure-navy hover:bg-cloud-white transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              aria-label="Toggle map"
              className="w-10 h-10 rounded-full bg-cloud-white/90 backdrop-blur flex items-center justify-center text-departure-navy hover:bg-cloud-white transition-colors"
            >
              <MapIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-6 left-5 right-5 text-cloud-white">
          <p className="num text-[10px] uppercase tracking-[0.24em] opacity-80">{trip.code}</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[0.95] mt-1">{trip.name}</h1>
          <p className="mt-2 text-sm opacity-90">{trip.subtitle}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 -mt-4">
        {/* Trip meta stub */}
        <ManifestStub tone="sand" className="mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">Depart</p>
              <p className="num text-lg text-departure-navy">
                {new Date(trip.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="border-x border-ink-30/60">
              <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60">Return</p>
              <p className="num text-lg text-departure-navy">
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => setShareOpen(true)} className="group">
              <p className="num text-[10px] uppercase tracking-[0.18em] text-ink-60 flex items-center justify-center gap-1">
                Pax{" "}
                <UsersRound className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
              <p className="num text-lg text-departure-navy">
                {trip.travelers.toString().padStart(2, "0")}
              </p>
            </button>
          </div>
        </ManifestStub>

        {/* Embedded Map */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 320, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 rounded-lg overflow-hidden border border-ink-30/40 relative bg-runway-sand"
            >
              <ClientOnly fallback={<div className="w-full h-full flex items-center justify-center text-ink-60 text-sm">Loading map…</div>}>
                <MapContainer
                  zoom={2}
                  center={[20, 0]}
                  style={{ width: "100%", height: "320px", zIndex: 0 }}
                  zoomControl={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  />
                  <MapBoundsFitter stops={trip.days.flatMap(d => d.stops)} />

                  {polylinePath.length > 1 && (
                    <Polyline
                      positions={polylinePath}
                      pathOptions={{ color: "#4ECDC4", opacity: 0.8, weight: 3 }}
                    />
                  )}
                  {trip.days.flatMap(d => d.stops).filter(s => s.lat && s.lng).map((s, idx) => (
                    <Marker
                      key={s.id}
                      position={[s.lat!, s.lng!]}
                      icon={createMarkerIcon(String(idx + 1))}
                    />
                  ))}
                </MapContainer>
              </ClientOnly>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day tabs */}
        {trip.days.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-5 px-5">
            {trip.days.map((d, i) => {
              const active = i === dayIdx;
              return (
                <button
                  key={d.index}
                  onClick={() => {
                    setDayIdx(i);
                    setExpandedStop(null);
                  }}
                  className={`relative shrink-0 px-4 py-2 rounded-sm transition-colors ${
                    active
                      ? "bg-departure-navy text-cloud-white"
                      : "bg-runway-sand text-ink-90 hover:bg-ink-30/30"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dayactive"
                      className="absolute inset-0 bg-departure-navy rounded-sm -z-10"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span className="relative num text-[10px] uppercase tracking-[0.18em] block">
                    Day {(d.index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="relative num text-xs block mt-0.5">{d.date}</span>
                </button>
              );
            })}
          </div>
        )}

        {activeDay ? (
          <>
            <PerforatedDivider label={activeDay.city} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDay.index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4"
              >
                <Reorder.Group
                  axis="y"
                  values={orderedStops}
                  onReorder={handleReorder}
                  className="space-y-3"
                >
                  {orderedStops.map((s) => (
                    <StopRow
                      key={s.id}
                      stop={s}
                      expanded={expandedStop === s.id}
                      onToggle={() => setExpandedStop((x) => (x === s.id ? null : s.id))}
                      onOpenComments={() => setCommentsStopId(s.id)}
                      onEdit={() => setStopSheet({ mode: "edit", stop: s })}
                      onDelete={() => setDeleteStopTarget(s)}
                    />
                  ))}
                </Reorder.Group>

                <button
                  onClick={() => setStopSheet({ mode: "add" })}
                  className="mt-3 w-full flex items-center justify-center gap-2 num text-[11px] uppercase tracking-[0.2em] text-ink-60 hover:text-departure-navy border border-ink-30/50 hover:border-ink-30 rounded-sm py-3 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add a stop to Day{" "}
                  {(activeDay.index + 1).toString().padStart(2, "0")}
                </button>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="mt-10 text-center py-12">
            <p className="customs-stamp text-ink-60">No stops yet</p>
            <p className="font-display text-2xl text-departure-navy mt-4">Empty manifest</p>
            <p className="text-sm text-ink-60 mt-1">Add your first stop to start the itinerary.</p>
            <button
              onClick={() => setStopSheet({ mode: "add" })}
              className="mt-5 inline-flex items-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add first stop
            </button>
          </div>
        )}
      </div>

      {/* Peek budget bar */}
      <button
        onClick={() => setBudgetOpen(true)}
        className="fixed bottom-16 md:bottom-4 left-5 right-5 md:left-1/2 md:-translate-x-1/2 md:right-auto md:w-[480px] z-20 bg-departure-navy text-cloud-white rounded-lg p-4 shadow-[0_20px_50px_-15px_rgba(14,22,38,0.5)] text-left hover:translate-y-[-2px] transition-transform"
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/70">
            Running budget
          </span>
          <span className={`num text-sm ${over ? "text-runway-red" : "text-beacon-amber"}`}>
            ${spent.toFixed(0)} / ${planned.toFixed(0)}
          </span>
        </div>
        <div className="h-1.5 bg-cloud-white/15 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full ${over ? "bg-runway-red" : "bg-horizon-teal"}`}
          />
        </div>
      </button>

      <Sheet open={budgetOpen} onClose={() => setBudgetOpen(false)} title="Budget breakdown">
        <div className="space-y-4 pt-2">
          {budget?.byCategory.length ? (
            budget.byCategory.map((c) => {
              const p = planned ? (c.total / planned) * 100 : 0;
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-90 capitalize">{c.category}</span>
                    <span className="num text-ink-60">${c.total.toFixed(0)}</span>
                  </div>
                  <div className="h-1 bg-runway-sand rounded-full overflow-hidden">
                    <div
                      className="h-full bg-horizon-teal"
                      style={{ width: `${Math.min(100, p)}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-ink-60">No spend recorded yet.</p>
          )}
        </div>
      </Sheet>

      <Sheet open={!!commentsStopId} onClose={() => setCommentsStopId(null)} title="Comments">
        {commentsStopId && <CommentsPanel stopId={commentsStopId} />}
      </Sheet>

      <Sheet
        open={!!stopSheet}
        onClose={closeStopSheet}
        title={stopSheet?.mode === "edit" ? "Edit stop" : "Add stop"}
      >
        <StopForm
          key={stopSheet?.stop?.id ?? "new"}
          dayLabel={
            activeDay
              ? `Day ${(activeDay.index + 1).toString().padStart(2, "0")} · ${activeDay.city}`
              : undefined
          }
          initial={
            stopSheet?.stop
              ? {
                  name: stopSheet.stop.name,
                  category: stopSheet.stop.category,
                  time: stopSheet.stop.time !== "—" ? stopSheet.stop.time : "09:00",
                  cost: String(stopSheet.stop.cost),
                  currency: stopSheet.stop.currency,
                  city: stopSheet.stop.city,
                  notes: stopSheet.stop.notes ?? "",
                }
              : undefined
          }
          submitLabel={stopSheet?.mode === "edit" ? "Save changes" : "Add to manifest"}
          busy={createStop.isPending || patchStop.isPending}
          onCancel={closeStopSheet}
          onSubmit={submitStop}
        />
      </Sheet>

      <Sheet open={metaOpen} onClose={() => setMetaOpen(false)} title="Edit trip">
        <TripMetaForm
          initial={{
            name: trip.name,
            subtitle: trip.subtitle,
            startDate: trip.startDate,
            endDate: trip.endDate,
            budgetPlanned: trip.budgetPlanned,
          }}
          busy={updateTrip.isPending}
          onCancel={() => setMetaOpen(false)}
          onSubmit={(values: TripMetaValues) => {
            updateTrip.mutate(
              {
                id: trip.id,
                input: {
                  name: values.name,
                  subtitle: values.subtitle || null,
                  startDate: new Date(values.startDate).toISOString(),
                  endDate: new Date(values.endDate).toISOString(),
                  budgetPlanned: Number(values.budgetPlanned) || 0,
                },
              },
              {
                onSuccess: () => {
                  toast.success("Trip details updated");
                  setMetaOpen(false);
                },
                onError: () => toast.error("Couldn't save trip details"),
              },
            );
          }}
        />
      </Sheet>

      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} title="Share this manifest">
        <ShareForm
          collaborators={trip.collaborators}
          busy={addCollaborator.isPending}
          onInvite={(email, role) =>
            addCollaborator.mutate(
              { email, role },
              {
                onSuccess: () =>
                  toast.success("Invite sent", { description: `${email} · ${role}` }),
                onError: () =>
                  toast.error("Couldn't send that invite", {
                    description: "Check the email and try again.",
                  }),
              },
            )
          }
        />
      </Sheet>

      <ConfirmDialog
        open={!!deleteStopTarget}
        onOpenChange={(open) => !open && setDeleteStopTarget(null)}
        title={`Remove "${deleteStopTarget?.name}"?`}
        description="This takes it off the manifest for everyone on this trip."
        confirmLabel="Remove stop"
        tone="danger"
        busy={deleteStop.isPending}
        onConfirm={() => {
          if (!deleteStopTarget) return;
          deleteStop.mutate(deleteStopTarget.id, {
            onSuccess: () => {
              toast.success("Stop removed");
              setDeleteStopTarget(null);
              setExpandedStop(null);
            },
            onError: () => toast.error("Couldn't remove that stop"),
          });
        }}
      />
    </div>
  );
}
