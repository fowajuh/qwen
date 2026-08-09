import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Download, Repeat, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/manifest/AppShell";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { ManifestStub } from "@/components/manifest/ManifestStub";
import { Skeleton, StubSkeleton } from "@/components/manifest/Skeleton";
import { Sheet } from "@/components/manifest/Sheet";
import { useTrips, useBudgetSummary, useTrip } from "@/lib/queries";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget · GlobeTrotter" },
      {
        name: "description",
        content: "Track every dollar across every trip, by day or by category.",
      },
      { property: "og:title", content: "Budget · GlobeTrotter" },
      { property: "og:description", content: "Planned vs spent across every trip." },
    ],
  }),
  component: Budget,
});

const CATEGORY_COLOR: Record<string, string> = {
  flight: "var(--departure-navy)",
  stay: "var(--horizon-teal)",
  eat: "var(--beacon-amber)",
  see: "var(--runway-red)",
  move: "var(--ink-60)",
};

// Approximate, static — for the in-app converter only, not a live feed.
const FX_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  AUD: 0.66,
  CAD: 0.74,
};

function convert(amountUsd: number, currency: string) {
  const rate = FX_TO_USD[currency] ?? 1;
  return amountUsd / rate;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Budget() {
  const { data: trips, isPending: tripsPending } = useTrips();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"category" | "day">("category");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [categorySheet, setCategorySheet] = useState<string | null>(null);
  const [converterOpen, setConverterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const { preferences } = useUI();

  const selected = useMemo(
    () =>
      trips?.find((t) => t.id === selectedId) ??
      trips?.find((t) => t.status === "upcoming") ??
      trips?.[0],
    [trips, selectedId],
  );
  const { data: summary, isPending: summaryPending } = useBudgetSummary(selected?.id ?? "");
  const { data: fullTrip } = useTrip(selected?.id ?? "");

  const totalPlanned = trips?.reduce((s, t) => s + t.budgetPlanned, 0) ?? 0;
  const totalSpent = trips?.reduce((s, t) => s + t.budgetSpent, 0) ?? 0;
  const catTotal = summary?.byCategory.reduce((s, c) => s + c.total, 0) ?? 0;
  const dayMax = Math.max(1, ...(summary?.byDay.map((d) => d.total) ?? [1]));

  const stopsForCategory = useMemo(() => {
    if (!categorySheet || !fullTrip) return [];
    return fullTrip.days.flatMap((d) =>
      d.stops.filter((s) => s.category === categorySheet).map((s) => ({ ...s, dayIndex: d.index })),
    );
  }, [categorySheet, fullTrip]);

  if (tripsPending) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto px-5 pt-6 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <StubSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">Ledger</p>
            <h1 className="font-display text-4xl md:text-5xl text-departure-navy leading-[0.95] mt-1">
              Budget
            </h1>
          </div>
          <button
            onClick={() => setConverterOpen(true)}
            aria-label="Currency converter"
            className="mt-1 w-10 h-10 rounded-full border border-ink-30/30 flex items-center justify-center text-ink-60 hover:text-departure-navy hover:border-ink-30 transition-colors shrink-0"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {[
            { l: "Planned", v: `$${totalPlanned.toFixed(0)}` },
            { l: "Spent", v: `$${totalSpent.toFixed(0)}`, tone: "text-beacon-amber" },
            {
              l: "Remaining",
              v: `$${(totalPlanned - totalSpent).toFixed(0)}`,
              tone: "text-horizon-teal",
            },
            { l: "Trips", v: (trips?.length ?? 0).toString().padStart(2, "0") },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <ManifestStub tone="sand">
                <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60">{s.l}</p>
                <p className={`num text-2xl mt-1 ${s.tone ?? "text-departure-navy"}`}>{s.v}</p>
              </ManifestStub>
            </motion.div>
          ))}
        </div>

        {!trips?.length ? (
          <div className="mt-10 text-center py-12">
            <p className="customs-stamp text-ink-60">No trips yet</p>
            <p className="font-display text-2xl text-departure-navy mt-4">Nothing to track</p>
            <p className="text-sm text-ink-60 mt-1">Create a trip to start a running ledger.</p>
          </div>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setPickerOpen(true)}
                className="flex items-center gap-2 num text-[11px] uppercase tracking-[0.18em] border border-ink-30/40 rounded-sm px-3 py-2 hover:border-ink-30 transition-colors"
              >
                {selected?.name ?? "Choose trip"}
                <ChevronRight className="w-3.5 h-3.5 text-ink-60" />
              </button>
              <button
                onClick={() => setExportOpen(true)}
                className="flex items-center gap-1.5 num text-[10px] uppercase tracking-[0.18em] text-ink-60 hover:text-departure-navy px-2.5 py-2 border border-ink-30/30 rounded-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>

            <div className="mt-2">
              <PerforatedDivider label={`${selected?.name ?? ""} · running total`} />
            </div>

            <div className="mt-4 flex gap-2">
              {(["category", "day"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative num text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-sm ${
                    mode === m ? "text-cloud-white" : "text-ink-60"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="modepill"
                      className="absolute inset-0 bg-departure-navy rounded-sm -z-10"
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  By {m}
                </button>
              ))}
            </div>

            <ManifestStub tone="white" className="mt-4">
              {summaryPending ? (
                <StubSkeleton />
              ) : mode === "category" ? (
                summary?.byCategory.length ? (
                  <div className="space-y-4">
                    <div className="flex h-8 rounded-sm overflow-hidden">
                      {summary.byCategory.map((c) => (
                        <motion.div
                          key={c.category}
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.total / (catTotal || 1)) * 100}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          style={{ background: CATEGORY_COLOR[c.category] ?? "var(--ink-60)" }}
                          title={`${c.category}: $${c.total.toFixed(0)}`}
                        />
                      ))}
                    </div>
                    <ul className="space-y-1 mt-3">
                      {summary.byCategory.map((c) => (
                        <li key={c.category}>
                          <button
                            onClick={() => setCategorySheet(c.category)}
                            className="w-full flex items-center justify-between text-sm py-1.5 px-1 -mx-1 rounded-sm hover:bg-runway-sand transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                  background: CATEGORY_COLOR[c.category] ?? "var(--ink-60)",
                                }}
                              />
                              <span className="capitalize">{c.category}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="num text-ink-60">${c.total.toFixed(0)}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-ink-30" />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-ink-60 py-6 text-center">
                    No spend recorded for this trip yet.
                  </p>
                )
              ) : summary?.byDay.length ? (
                <div className="space-y-3">
                  {summary.byDay.map((d) => (
                    <div key={d.dayIndex}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="num text-[11px] uppercase tracking-[0.18em] text-ink-60">
                          Day {(d.dayIndex + 1).toString().padStart(2, "0")}
                        </span>
                        <span className="num text-ink-90">${d.total.toFixed(0)}</span>
                      </div>
                      <div className="h-2 bg-runway-sand rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(d.total / dayMax) * 100}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full bg-horizon-teal"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-60 py-6 text-center">
                  No spend recorded for this trip yet.
                </p>
              )}
            </ManifestStub>
          </>
        )}
      </div>

      {/* Trip picker */}
      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Choose a trip">
        <div className="space-y-2 pt-1">
          {trips?.map((t) => {
            const pct = Math.min(100, (t.budgetSpent / (t.budgetPlanned || 1)) * 100);
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedId(t.id);
                  setPickerOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-sm border transition-colors",
                  active
                    ? "border-departure-navy bg-runway-sand"
                    : "border-ink-30/30 hover:border-ink-30",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-ink-90 truncate">{t.name}</span>
                  <span className="num text-[10px] text-ink-60 shrink-0">
                    ${t.budgetSpent.toFixed(0)} / ${t.budgetPlanned.toFixed(0)}
                  </span>
                </div>
                <div className="h-1 bg-ink-30/20 rounded-full overflow-hidden mt-2">
                  <div
                    className={cn("h-full", pct > 100 ? "bg-runway-red" : "bg-horizon-teal")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* Category drill-down */}
      <Sheet
        open={!!categorySheet}
        onClose={() => setCategorySheet(null)}
        title={categorySheet ? `${categorySheet} spend` : undefined}
      >
        <div className="space-y-2 pt-1">
          {stopsForCategory.length === 0 && (
            <p className="text-sm text-ink-60">No stops in this category yet.</p>
          )}
          {stopsForCategory.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm border border-ink-30/20"
            >
              <div className="min-w-0">
                <p className="text-sm text-ink-90 truncate">{s.name}</p>
                <p className="num text-[10px] uppercase tracking-[0.16em] text-ink-60 mt-0.5">
                  Day {(s.dayIndex + 1).toString().padStart(2, "0")}
                </p>
              </div>
              <span className="num text-sm text-departure-navy shrink-0">${s.cost}</span>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Currency converter */}
      <Sheet
        open={converterOpen}
        onClose={() => setConverterOpen(false)}
        title="Currency converter"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-ink-60">
            Approximate rates against USD. Your home currency is{" "}
            <span className="num text-departure-navy">{preferences.homeCurrency}</span> — change it
            from Profile.
          </p>
          <div className="space-y-2">
            {[
              { label: "Total planned", usd: totalPlanned },
              { label: "Total spent", usd: totalSpent },
              { label: "Remaining", usd: totalPlanned - totalSpent },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-3 py-2.5 rounded-sm bg-runway-sand/50"
              >
                <span className="text-sm text-ink-90">{row.label}</span>
                <div className="text-right">
                  <p className="num text-sm text-departure-navy">
                    {preferences.homeCurrency}{" "}
                    {convert(row.usd, preferences.homeCurrency).toFixed(0)}
                  </p>
                  <p className="num text-[10px] text-ink-60">${row.usd.toFixed(0)} USD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Export */}
      <Sheet open={exportOpen} onClose={() => setExportOpen(false)} title="Export ledger">
        <div className="space-y-3 pt-1">
          <button
            onClick={() => {
              if (!fullTrip) return;
              const rows: (string | number)[][] = [["Day", "Category", "Name", "Cost", "Currency"]];
              fullTrip.days.forEach((d) =>
                d.stops.forEach((s) =>
                  rows.push([d.index + 1, s.category, s.name, s.cost, s.currency]),
                ),
              );
              downloadCsv(`${fullTrip.name.replace(/\s+/g, "-").toLowerCase()}-ledger.csv`, rows);
              toast.success("Ledger exported", { description: `${fullTrip.name}.csv` });
              setExportOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border border-ink-30/25 hover:bg-runway-sand transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-runway-sand flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-departure-navy" />
            </div>
            <div>
              <p className="text-sm text-ink-90">Download as CSV</p>
              <p className="text-xs text-ink-60 mt-0.5">
                Every stop, cost, and category for {selected?.name}
              </p>
            </div>
          </button>
          <button
            onClick={() => {
              const rows: (string | number)[][] = [["Trip", "Planned", "Spent", "Remaining"]];
              trips?.forEach((t) =>
                rows.push([
                  t.name,
                  t.budgetPlanned,
                  t.budgetSpent,
                  t.budgetPlanned - t.budgetSpent,
                ]),
              );
              downloadCsv("globetrotter-all-trips.csv", rows);
              toast.success("All-trips summary exported");
              setExportOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border border-ink-30/25 hover:bg-runway-sand transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-runway-sand flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-departure-navy" />
            </div>
            <div>
              <p className="text-sm text-ink-90">Export all trips summary</p>
              <p className="text-xs text-ink-60 mt-0.5">
                Planned vs spent across your whole manifest
              </p>
            </div>
          </button>
        </div>
      </Sheet>
    </AppShell>
  );
}
