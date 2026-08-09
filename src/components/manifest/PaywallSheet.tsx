import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Sheet } from "./Sheet";
import { PLAN_LABEL, type Plan } from "@/lib/store";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Plan required to unlock this — drives the headline and CTA copy. */
  requires: Exclude<Plan, "explorer">;
  /** What the person was trying to do, in plain language — e.g. "Start a second trip". */
  action: string;
  /** One or two concrete reasons this plan is worth it, specific to this gate. */
  reasons: string[];
};

const PLAN_PRICE: Record<Plan, string> = {
  explorer: "Free",
  voyager: "$9/mo",
  crew: "$19/mo",
};

export function PaywallSheet({ open, onClose, requires, action, reasons }: Props) {
  return (
    <Sheet open={open} onClose={onClose} title="Upgrade to continue">
      <div className="pt-1">
        <div className="w-12 h-12 rounded-full bg-runway-sand flex items-center justify-center mb-4">
          <Lock className="w-5 h-5 text-beacon-amber" strokeWidth={1.75} />
        </div>
        <p className="text-sm text-ink-60">{action} is part of</p>
        <h2 className="font-display text-3xl text-departure-navy mt-0.5">
          {PLAN_LABEL[requires]}
        </h2>
        <ul className="space-y-2 mt-4">
          {reasons.map((reason) => (
            <li key={reason} className="flex items-start gap-2.5 text-sm text-ink-90">
              <span className="w-1 h-1 rounded-full bg-beacon-amber mt-2 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
        <Link
          to="/pricing"
          onClick={onClose}
          className="mt-6 w-full flex items-center justify-center gap-2 num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-3 rounded-sm hover:bg-beacon-amber/90 transition-colors"
        >
          Upgrade — {PLAN_PRICE[requires]}
        </Link>
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-ink-60 hover:text-departure-navy transition-colors mt-3"
        >
          Not now
        </button>
      </div>
    </Sheet>
  );
}
