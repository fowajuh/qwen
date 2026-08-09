import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Compass, MoreVertical, Plane as PlaneIcon, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/manifest/AppShell";
import { ManifestStub } from "@/components/manifest/ManifestStub";
import { FlipCountdown } from "@/components/manifest/FlipCountdown";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { PullToRefresh } from "@/components/manifest/PullToRefresh";
import { SwipeRow } from "@/components/manifest/SwipeRow";
import { StubSkeleton, Skeleton } from "@/components/manifest/Skeleton";
import { ConfirmDialog } from "@/components/manifest/ConfirmDialog";
import { Confetti } from "@/components/manifest/Confetti";
import { NewTripSheet, type NewTripValues } from "@/components/manifest/NewTripSheet";
import { TripActionsSheet } from "@/components/manifest/TripActionsSheet";
import { PaywallSheet } from "@/components/manifest/PaywallSheet";
import { Sheet } from "@/components/manifest/Sheet";
import {
  useTrips,
  useDuplicateTrip,
  useDeleteTrip,
  useCreateTrip,
  useUpdateTrip,
} from "@/lib/queries";
import { auth } from "@/lib/auth";
import { useUI, FREE_TRIP_LIMIT, PLAN_LABEL } from "@/lib/store";
import type { Trip } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Trips · GlobeTrotter" },
      {
        name: "description",
        content: "Every trip you're planning, laid out like a stack of boarding passes.",
      },
      { property: "og:title", content: "Your Trips · GlobeTrotter" },
      { property: "og:description", content: "The trip planner that reads like a boarding pass." },
    ],
  }),
  component: Dashboard,
});

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    upcoming: "text-horizon-teal border-horizon-teal",
    past: "text-ink-60 border-ink-60",
    draft: "text-beacon-amber border-beacon-amber",
  };
  return <span className={`customs-stamp ${map[status] ?? ""}`}>{status}</span>;
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-5 pt-6 space-y-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-12 w-2/3" />
      <div className="flex gap-4">
        <Skeleton className="h-[380px] w-[85%] md:w-[420px] rounded-lg" />
        <Skeleton className="hidden md:block h-[380px] w-[420px] rounded-lg" />
      </div>
      <div className="space-y-3">
        <StubSkeleton />
        <StubSkeleton />
      </div>
    </div>
  );
}

function Dashboard() {
  const { data, isPending, isError, refetch } = useTrips();
  const duplicateTrip = useDuplicateTrip();
  const deleteTrip = useDeleteTrip();
  const updateTrip = useUpdateTrip();
  const createTrip = useCreateTrip();
  const navigate = useNavigate();
  const trips = useMemo(() => data ?? [], [data]);
  const upcoming = trips.filter((t) => t.status === "upcoming");
  const me = auth.currentUser();
  const plan = useUI((s) => s.plan);

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [burstAt, setBurstAt] = useState<number | null>(null);
  const [newTripOpen, setNewTripOpen] = useState(false);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [actionsTarget, setActionsTarget] = useState<Trip | null>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<"recent" | "name" | "status">("recent");

  const tripLimitReached = plan === "explorer" && trips.length >= FREE_TRIP_LIMIT;
  const requestNewTrip = () => (tripLimitReached ? setPaywallOpen(true) : setNewTripOpen(true));

  const rest = useMemo(() => {
    const filtered = trips.filter((t) => t.status !== "upcoming");
    const sorted = [...filtered];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "status") sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  }, [trips, sort]);

  const openTrip = (trip: { id: string }) =>
    navigate({ to: "/trips/$tripId", params: { tripId: trip.id } });

  const handleNewTrip = (values: NewTripValues) => {
    createTrip.mutate(
      {
        name: values.name,
        destinationCode: values.destination || undefined,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      },
      {
        onSuccess: (trip) => {
          setNewTripOpen(false);
          setBurstAt(Date.now());
          toast.success("New manifest opened", { description: trip.name });
          setTimeout(() => openTrip(trip), 550);
        },
        onError: () =>
          toast.error("Couldn't start a new trip", { description: "Try again in a moment." }),
      },
    );
  };

  if (isPending) {
    return (
      <AppShell>
        <DashboardSkeleton />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell>
        <div className="max-w-md mx-auto px-5 pt-16 text-center">
          <span className="customs-stamp text-runway-red">Manifest unavailable</span>
          <p className="font-display text-2xl text-departure-navy mt-4">
            We couldn't pull your trips.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm"
          >
            Retry
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PullToRefresh onRefresh={() => refetch().then(() => undefined)}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto px-5 pt-6"
        >
          {/* Manifest header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">
                Passenger · {me?.email ?? "Guest"}
              </p>
              <h1 className="font-display text-4xl md:text-5xl text-departure-navy mt-1 leading-[0.95]">
                Your Manifest
              </h1>
            </div>
            <div className="hidden md:block text-right">
              <p className="num text-[10px] uppercase tracking-[0.22em] text-ink-60">
                {PLAN_LABEL[plan]} plan
              </p>
              {plan === "explorer" ? (
                <Link
                  to="/pricing"
                  className="num text-sm text-beacon-amber hover:text-beacon-amber/80 transition-colors"
                >
                  {trips.length}/{FREE_TRIP_LIMIT} trip used · upgrade
                </Link>
              ) : (
                <p className="num text-sm text-ink-90">Unlimited trips</p>
              )}
            </div>
          </div>

          <PerforatedDivider label={`${upcoming.length} upcoming · ${rest.length} archived`} />

          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="mt-10 mb-10 flex flex-col items-center text-center py-16 px-6 rounded-lg border border-ink-30/40"
            >
              <div className="w-14 h-14 rounded-full bg-runway-sand flex items-center justify-center mb-5">
                <Compass className="w-6 h-6 text-beacon-amber" strokeWidth={1.75} />
              </div>
              <span className="customs-stamp text-ink-60">Manifest empty</span>
              <h2 className="font-display text-3xl md:text-4xl text-departure-navy mt-4 max-w-sm leading-[1.05]">
                Your first trip is one tap away.
              </h2>
              <p className="text-sm text-ink-60 mt-2 max-w-sm">
                Open a manifest, drop in a destination, and we'll help you fill the rest — stops,
                budget, and all.
              </p>
              <button
                onClick={requestNewTrip}
                className="mt-6 inline-flex items-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-5 py-3 rounded-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2.25} />
                Start a trip
              </button>
            </motion.div>
          ) : (
            <>
              {/* Upcoming carousel */}
              <section className="mt-6">
                <h2 className="font-display text-2xl text-departure-navy mb-3">Next departures</h2>
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 scrollbar-hide">
                  {upcoming.map((trip) => (
                    <Link
                      key={trip.id}
                      to="/trips/$tripId"
                      params={{ tripId: trip.id }}
                      className="snap-center shrink-0 w-[85%] md:w-[420px]"
                    >
                      <motion.article
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="relative rounded-lg overflow-hidden bg-departure-navy text-cloud-white h-[380px] flex flex-col shadow-[0_20px_50px_-20px_rgba(14,22,38,0.5)]"
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: `url(${trip.cover})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        {/* Two-zone scrim: just enough contrast for the header/footer
                            text, photo reads at full strength through the middle. */}
                        <div className="absolute inset-0 bg-gradient-to-b from-departure-navy/75 via-transparent to-transparent h-28" />
                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-departure-navy via-departure-navy/70 to-transparent" />

                        <div className="relative p-5 flex flex-col h-full">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="num text-[10px] uppercase tracking-[0.22em] text-cloud-white/70">
                                {trip.code}
                              </p>
                              <div className="flex items-baseline gap-3 mt-2">
                                <span className="num text-3xl font-medium">{trip.origin}</span>
                                <div className="flex-1 h-px bg-cloud-white/40 relative">
                                  <PlaneIcon className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 text-beacon-amber rotate-45" strokeWidth={2} />
                                </div>
                                <span className="num text-3xl font-medium text-beacon-amber">
                                  {trip.destination}
                                </span>
                              </div>
                            </div>
                            <button
                              aria-label="Trip actions"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActionsTarget(trip);
                              }}
                              className="shrink-0 w-8 h-8 -mr-1 -mt-1 rounded-full flex items-center justify-center text-cloud-white/70 hover:text-cloud-white hover:bg-cloud-white/10 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-auto">
                            <h3 className="font-display text-3xl leading-tight">{trip.name}</h3>
                            <p className="text-sm text-cloud-white/70 mt-1">{trip.subtitle}</p>

                            <div className="mt-5 pt-4 border-t border-cloud-white/15 flex items-end justify-between">
                              <div>
                                <p className="num text-[9px] uppercase tracking-[0.22em] text-cloud-white/60 mb-1">
                                  Boarding in
                                </p>
                                <FlipCountdown target={trip.startDate} />
                              </div>
                              <div className="text-right">
                                <p className="num text-[9px] uppercase tracking-[0.22em] text-cloud-white/60">
                                  Budget
                                </p>
                                <p className="num text-sm">
                                  <span className="text-beacon-amber">${trip.budgetSpent}</span>
                                  <span className="text-cloud-white/50">
                                    {" "}
                                    / ${trip.budgetPlanned}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Past / draft as stubs */}
              <section className="mt-10 mb-10">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-2xl text-departure-navy">Archive & drafts</h2>
                  {rest.length > 1 && (
                    <button
                      onClick={() => setSortOpen(true)}
                      className="flex items-center gap-1.5 num text-[10px] uppercase tracking-[0.18em] text-ink-60 hover:text-departure-navy px-2.5 py-1.5 border border-ink-30/30 rounded-sm"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      Sort
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {rest.length === 0 && (
                    <div className="ticket-stub rounded-sm text-center">
                      <span className="customs-stamp text-ink-60">Empty archive</span>
                      <p className="font-display text-xl text-departure-navy mt-3">
                        No past trips yet.
                      </p>
                      <p className="text-sm text-ink-60">
                        Your finished manifests will file themselves here.
                      </p>
                    </div>
                  )}
                  {rest.map((trip) => (
                    <SwipeRow
                      key={trip.id}
                      onDuplicate={() =>
                        duplicateTrip.mutate(trip.id, {
                          onSuccess: () =>
                            toast.success("Trip duplicated", {
                              description: `"${trip.name}" copied to drafts.`,
                            }),
                          onError: () => toast.error("Couldn't duplicate that trip"),
                        })
                      }
                      onArchive={() =>
                        updateTrip.mutate(
                          { id: trip.id, input: { status: "past" } },
                          {
                            onSuccess: () => toast("Filed to archive", { description: trip.name }),
                            onError: () => toast.error("Couldn't archive that trip"),
                          },
                        )
                      }
                      onDelete={() => setDeleteTarget({ id: trip.id, name: trip.name })}
                    >
                      <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
                        <ManifestStub tone="sand" interactive className="group">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="hidden sm:block">
                                <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60">
                                  {trip.code.split(" · ")[0]}
                                </p>
                                <p className="num text-2xl text-departure-navy leading-none">
                                  {trip.destination}
                                </p>
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-display text-xl text-departure-navy truncate">
                                  {trip.name}
                                </h3>
                                <p className="text-sm text-ink-60 truncate">{trip.subtitle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <StatusChip status={trip.status} />
                              <button
                                aria-label="Trip actions"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActionsTarget(trip);
                                }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-ink-60 hover:text-departure-navy hover:bg-ink-30/10 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </ManifestStub>
                      </Link>
                    </SwipeRow>
                  ))}
                </div>
              </section>
            </>
          )}
        </motion.div>
      </PullToRefresh>

      {/* FAB */}
      {burstAt && <Confetti key={burstAt} />}
      <button
        aria-label="New trip"
        onClick={requestNewTrip}
        className="fixed bottom-24 md:bottom-8 right-5 z-20 h-14 w-14 rounded-full bg-beacon-amber text-departure-navy flex items-center justify-center shadow-[0_10px_30px_-8px_rgba(242,160,61,0.6)] hover:scale-105 active:scale-95 transition-transform"
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >
        <Plus className="w-6 h-6" strokeWidth={2.25} />
      </button>

      <NewTripSheet
        open={newTripOpen}
        onClose={() => setNewTripOpen(false)}
        busy={createTrip.isPending}
        onSubmit={handleNewTrip}
      />

      <TripActionsSheet
        trip={actionsTarget}
        onClose={() => setActionsTarget(null)}
        onDuplicate={(trip) =>
          duplicateTrip.mutate(trip.id, {
            onSuccess: () =>
              toast.success("Trip duplicated", { description: `"${trip.name}" copied to drafts.` }),
            onError: () => toast.error("Couldn't duplicate that trip"),
          })
        }
        onArchive={(trip) =>
          updateTrip.mutate(
            { id: trip.id, input: { status: trip.status === "past" ? "upcoming" : "past" } },
            {
              onSuccess: () =>
                toast(trip.status === "past" ? "Restored to upcoming" : "Filed to archive", {
                  description: trip.name,
                }),
              onError: () => toast.error("Couldn't update that trip"),
            },
          )
        }
        onDelete={(trip) => setDeleteTarget({ id: trip.id, name: trip.name })}
      />

      <Sheet open={sortOpen} onClose={() => setSortOpen(false)} title="Sort archive">
        <div className="space-y-2 pt-1">
          {[
            { key: "recent" as const, label: "Most recent" },
            { key: "name" as const, label: "Trip name" },
            { key: "status" as const, label: "Status" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                setSort(opt.key);
                setSortOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-sm border text-left transition-colors",
                sort === opt.key
                  ? "bg-departure-navy text-cloud-white border-departure-navy"
                  : "border-ink-30/40 text-ink-90 hover:border-ink-30",
              )}
            >
              <span className="text-sm">{opt.label}</span>
              {sort === opt.key && (
                <span className="num text-[10px] uppercase tracking-[0.18em] text-beacon-amber">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This removes the trip and every stop on it. This can't be undone."
        confirmLabel="Delete trip"
        tone="danger"
        busy={deleteTrip.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteTrip.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success("Trip deleted");
              setDeleteTarget(null);
            },
            onError: () => toast.error("Couldn't delete that trip"),
          });
        }}
      />

      <PaywallSheet
        open={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        requires="voyager"
        action="A second active trip"
        reasons={[
          "Unlimited trip manifests, planned side by side",
          "Live budget sync across every trip",
          "Offline access when you're actually traveling",
        ]}
      />
    </AppShell>
  );
}