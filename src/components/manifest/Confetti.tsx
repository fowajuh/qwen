import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "var(--beacon-amber)",
  "var(--horizon-teal)",
  "var(--runway-red)",
  "var(--cloud-white)",
  "var(--departure-navy)",
];

type Piece = {
  id: number;
  x: number;
  rot: number;
  delay: number;
  color: string;
  shape: "rect" | "circle";
};

/**
 * A short-lived confetti burst — small paper "boarding pass" chits that
 * fall away. Mount conditionally (e.g. `{show && <Confetti />}`) and unmount
 * after ~1.6s. Origin is the center-top of the nearest positioned ancestor.
 */
export function Confetti({ count = 28, className }: { count?: number; className?: string }) {
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        rot: (Math.random() - 0.5) * 360,
        delay: Math.random() * 0.15,
        color: COLORS[i % COLORS.length],
        shape: Math.random() > 0.5 ? "rect" : "circle",
      })),
    [count],
  );

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[80]",
        className ?? "bottom-28 right-12 md:bottom-14",
      )}
      aria-hidden
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: -(180 + Math.random() * 140), opacity: 0, rotate: p.rot }}
          transition={{
            duration: 0.9 + Math.random() * 0.4,
            delay: p.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute left-0 top-0"
          style={{
            width: p.shape === "rect" ? 7 : 6,
            height: p.shape === "rect" ? 11 : 6,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "1px",
          }}
        />
      ))}
    </div>
  );
}
