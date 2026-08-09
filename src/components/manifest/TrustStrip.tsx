import { ShieldCheck, Lock, Star, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Trust / risk-reversal strip for conversion surfaces (pricing, signup).
 * Keeps claims honest and specific rather than generic enterprise badges —
 * this is a consumer travel product, not a compliance-heavy B2B platform.
 */
export function TrustStrip({ className, dark }: { className?: string; dark?: boolean }) {
  const items = [
    { icon: Lock, label: "Bank-grade encryption in transit & at rest" },
    { icon: XCircle, label: "No card required to start" },
    { icon: ShieldCheck, label: "Cancel anytime, no phone call needed" },
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-3 justify-center",
        dark ? "text-cloud-white/60" : "text-ink-60",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5 text-xs">
          <item.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function RatingBadge({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-3.5 h-3.5 fill-beacon-amber text-beacon-amber" />
        ))}
      </div>
      <span className={cn("num text-xs", dark ? "text-cloud-white/70" : "text-ink-60")}>
        4.8/5 · from 2,300+ travelers
      </span>
    </div>
  );
}
