import { useState } from "react";
import { Bed, Eye, Footprints, Plane, UtensilsCrossed } from "lucide-react";
import type { Stop } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type StopFormValues = {
  name: string;
  category: Stop["category"];
  time: string;
  cost: string;
  currency: string;
  city: string;
  notes: string;
};

const CATEGORIES: { value: Stop["category"]; label: string; icon: typeof Plane }[] = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "stay", label: "Stay", icon: Bed },
  { value: "eat", label: "Eat", icon: UtensilsCrossed },
  { value: "see", label: "See", icon: Eye },
  { value: "move", label: "Move", icon: Footprints },
];

const inputClass =
  "w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors";
const labelClass = "num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-1.5 block";

export function StopForm({
  initial,
  dayLabel,
  onSubmit,
  onCancel,
  busy,
  submitLabel = "Add to manifest",
}: {
  initial?: Partial<StopFormValues>;
  dayLabel?: string;
  onSubmit: (values: StopFormValues) => void;
  onCancel: () => void;
  busy?: boolean;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<StopFormValues>({
    name: initial?.name ?? "",
    category: initial?.category ?? "see",
    time: initial?.time ?? "09:00",
    cost: initial?.cost ?? "0",
    currency: initial?.currency ?? "USD",
    city: initial?.city ?? "",
    notes: initial?.notes ?? "",
  });

  const set = <K extends keyof StopFormValues>(key: K, v: StopFormValues[K]) =>
    setValues((s) => ({ ...s, [key]: v }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!values.name.trim()) return;
        onSubmit(values);
      }}
      className="space-y-4 pt-1"
    >
      {dayLabel && (
        <p className="num text-[10px] uppercase tracking-[0.2em] text-beacon-amber">{dayLabel}</p>
      )}

      <div>
        <label className={labelClass}>Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = values.category === c.value;
            const Icon = c.icon;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => set("category", c.value)}
                className={cn(
                  "flex items-center gap-1.5 num text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded-sm border transition-colors",
                  active
                    ? "bg-departure-navy text-cloud-white border-departure-navy"
                    : "border-ink-30/40 text-ink-60 hover:border-ink-30",
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="stop-name">
          Name
        </label>
        <input
          id="stop-name"
          required
          autoFocus
          placeholder="e.g. Sunset boat tour"
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="stop-time">
            Local time
          </label>
          <input
            id="stop-time"
            type="time"
            value={values.time}
            onChange={(e) => set("time", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="stop-city">
            City
          </label>
          <input
            id="stop-city"
            placeholder="Optional"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="stop-cost">
            Cost
          </label>
          <input
            id="stop-cost"
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={values.cost}
            onChange={(e) => set("cost", e.target.value)}
            className={cn(inputClass, "num")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="stop-currency">
            Currency
          </label>
          <input
            id="stop-currency"
            maxLength={3}
            value={values.currency}
            onChange={(e) => set("currency", e.target.value.toUpperCase())}
            className={cn(inputClass, "num uppercase")}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="stop-notes">
          Notes
        </label>
        <textarea
          id="stop-notes"
          rows={2}
          placeholder="Booking ref, reminders, anything future-you needs…"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          className={cn(inputClass, "resize-none")}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="num text-[11px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-sm border border-ink-30/40 text-ink-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex-1 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm disabled:opacity-60"
        >
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
