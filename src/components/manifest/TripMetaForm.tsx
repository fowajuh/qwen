import { useState } from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber transition-colors";
const labelClass = "num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-1.5 block";

export type TripMetaValues = {
  name: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  budgetPlanned: string;
};

function toDateInput(iso: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function TripMetaForm({
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  initial: {
    name: string;
    subtitle: string;
    startDate: string;
    endDate: string;
    budgetPlanned: number;
  };
  onSubmit: (values: TripMetaValues) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [values, setValues] = useState<TripMetaValues>({
    name: initial.name,
    subtitle: initial.subtitle,
    startDate: toDateInput(initial.startDate),
    endDate: toDateInput(initial.endDate),
    budgetPlanned: String(initial.budgetPlanned ?? 0),
  });
  const set = <K extends keyof TripMetaValues>(key: K, v: TripMetaValues[K]) =>
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
      <div>
        <label className={labelClass} htmlFor="trip-name">
          Trip name
        </label>
        <input
          id="trip-name"
          required
          autoFocus
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="trip-subtitle">
          Subtitle
        </label>
        <input
          id="trip-subtitle"
          placeholder="One line — sets the tone on the boarding pass"
          value={values.subtitle}
          onChange={(e) => set("subtitle", e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="trip-start">
            Depart
          </label>
          <input
            id="trip-start"
            type="date"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
            className={cn(inputClass, "num")}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="trip-end">
            Return
          </label>
          <input
            id="trip-end"
            type="date"
            value={values.endDate}
            onChange={(e) => set("endDate", e.target.value)}
            className={cn(inputClass, "num")}
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="trip-budget">
          Planned budget (USD)
        </label>
        <input
          id="trip-budget"
          type="number"
          min={0}
          step="1"
          inputMode="decimal"
          value={values.budgetPlanned}
          onChange={(e) => set("budgetPlanned", e.target.value)}
          className={cn(inputClass, "num")}
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
          {busy ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
