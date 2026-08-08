import { Link, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";

/** The LIVE broadcast icon — TV-box glyph with "LIVE" lettering inside, pixel-matched to the real TikTok icon. */
function LiveGlyph() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 1L6.8 4.5H4.2L6.9 1H9.5Z" fill="currentColor" />
      <path d="M16 1L13.3 4.5H10.7L13.4 1H16Z" fill="currentColor" />
      <path d="M22.5 1L19.8 4.5H17.2L19.9 1H22.5Z" fill="currentColor" />
      <rect x="1" y="4.5" width="24" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <text x="13" y="14.5" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="currentColor" letterSpacing="0.3">
        LIVE
      </text>
    </svg>
  );
}

const TOP_TABS = [
  { to: "/home/booked", label: "Booked" },
  { to: "/home/following", label: "Following" },
  { to: "/home", label: "For You" },
] as const;

/**
 * The persistent LIVE · Booked · Following · For You · Search header,
 * shared by every screen in the immersive Home feed so switching tabs
 * always lands you on a real, wired-up destination.
 *
 * `variant="dark"` (default) — a transparent overlay for full-bleed video
 * (For You / Following). `variant="light"` — an opaque sticky bar for
 * browsing screens like Booked, matching TikTok's own light chrome there.
 */
export function HomeTopTabs({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "absolute top-0 left-0 right-0 z-20 pt-safe px-4 pb-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
          : "sticky top-0 z-20 pt-safe px-4 pb-3 bg-background/95 backdrop-blur-md border-b border-hairline"
      }
    >
      <div className={`flex items-center justify-between ${isDark ? "pt-2" : "pt-1"}`}>
        <Link
          to="/home/live"
          className={`w-10 h-10 flex items-center justify-center shrink-0 ${isDark ? "text-white pointer-events-auto" : "text-foreground"}`}
        >
          <LiveGlyph />
        </Link>

        <div className={`flex items-center gap-6 relative ${isDark ? "pointer-events-auto" : ""}`}>
          {TOP_TABS.map((tab) => {
            const active = pathname === tab.to;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`text-[16px] font-bold tracking-tight transition-colors relative ${
                  active ? (isDark ? "text-white" : "text-foreground") : isDark ? "text-white/60" : "text-muted-foreground"
                }`}
              >
                {tab.label}
                {active && (
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full ${isDark ? "bg-white" : "bg-foreground"}`} />
                )}
              </Link>
            );
          })}
        </div>

        <Link
          to="/search"
          className={`w-10 h-10 flex items-center justify-center shrink-0 ${isDark ? "text-white pointer-events-auto" : "text-foreground"}`}
        >
          <Search strokeWidth={2.5} size={24} />
        </Link>
      </div>
    </div>
  );
}
