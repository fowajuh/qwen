import { useState } from "react";
import { motion } from "framer-motion";
import { Mountain, Palmtree, Building2, Car, Compass } from "lucide-react";
import { Sheet } from "@/components/manifest/Sheet";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  {
    key: "beach",
    label: "Beach",
    icon: Palmtree,
    name: "Coastal Getaway",
    subtitle: "Sun, saltwater, slow mornings.",
  },
  {
    key: "city",
    label: "City",
    icon: Building2,
    name: "City Break",
    subtitle: "Museums, markets, good coffee.",
  },
  {
    key: "mountain",
    label: "Mountain",
    icon: Mountain,
    name: "Mountain Escape",
    subtitle: "Trailheads and thin air.",
  },
  {
    key: "roadtrip",
    label: "Road trip",
    icon: Car,
    name: "The Long Way",
    subtitle: "Wherever the road goes.",
  },
  {
    key: "blank",
    label: "Blank",
    icon: Compass,
    name: "Untitled Trip",
    subtitle: "Start from scratch.",
  },
] as const;

const inputClass =
  "w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors";
const labelClass = "num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-1.5 block";

export type NewTripValues = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
};

export function NewTripSheet({
  open,
  onClose,
  onSubmit,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: NewTripValues) => void;
  busy?: boolean;
}) {
  const today = new Date();
  const inWeek = new Date(today.getTime() + 7 * 86_400_000);
  const [template, setTemplate] = useState<(typeof TEMPLATES)[number]["key"]>("blank");
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(today.toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(inWeek.toISOString().slice(0, 10));

  const applyTemplate = (key: (typeof TEMPLATES)[number]["key"]) => {
    setTemplate(key);
    const t = TEMPLATES.find((x) => x.key === key)!;
    if (!name.trim() || TEMPLATES.some((x) => x.name === name)) setName(t.name);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Start a new trip">
      <div className="space-y-5 pt-1">
        <div>
          <label className={labelClass}>Pick a starting point</label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              const active = template === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => applyTemplate(t.key)}
                  className={cn(
                    "relative shrink-0 flex flex-col items-center gap-1.5 w-[76px] py-3 rounded-sm border transition-colors",
                    active
                      ? "border-departure-navy bg-runway-sand"
                      : "border-ink-30/30 hover:border-ink-30",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="templatepick"
                      className="absolute inset-0 rounded-sm border-2 border-beacon-amber"
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <Icon className="w-5 h-5 text-departure-navy" strokeWidth={1.6} />
                  <span className="num text-[9px] uppercase tracking-[0.14em] text-ink-60">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSubmit({ name: name.trim(), destination: destination.trim(), startDate, endDate });
          }}
          className="space-y-4"
        >
          <div>
            <label className={labelClass} htmlFor="newtrip-name">
              Trip name
            </label>
            <input
              id="newtrip-name"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kyoto in Autumn"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="newtrip-dest">
              Destination
            </label>
            <input
              id="newtrip-dest"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Optional — you can add stops later"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="newtrip-start">
                Depart
              </label>
              <input
                id="newtrip-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={cn(inputClass, "num")}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="newtrip-end">
                Return
              </label>
              <input
                id="newtrip-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={cn(inputClass, "num")}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-3 rounded-sm disabled:opacity-60"
          >
            {busy ? "Opening manifest…" : "Create trip"}
          </button>
        </form>
      </div>
    </Sheet>
  );
}
