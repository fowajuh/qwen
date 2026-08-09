import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, LogOut, MapPin, Search, Sparkles, User, Wallet, Bell } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { PageTransition } from "./PageTransition";
import { ThemeToggle } from "./ThemeToggle";
import { CommandPalette } from "./CommandPalette";
import { NotificationPanel, createNotification, type Notification } from "./NotificationPanel";
import { auth, logout } from "@/lib/auth";
import { useUI, PLAN_LABEL } from "@/lib/store";
import { useGamification } from "@/lib/gamification-store";
import { toast } from "sonner";

const nav = [
  { to: "/", label: "Trips", icon: Compass },
  { to: "/map", label: "Map", icon: MapPin },
  { to: "/recommendations", label: "Discover", icon: Sparkles },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/profile", label: "You", icon: User },
] as const;

/** Fires a short haptic tick on devices that support it (iOS Safari doesn't;
 * Android Chrome and most WebViews do). Silently no-ops everywhere else. */
function hapticTap() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
}

/** Every screen wrapped in AppShell requires a session — redirects to
 * /login instead of rendering a 401-riddled page if there's no token. */
export function useRequireAuth() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.isAuthenticated()) {
      navigate({ to: "/login" });
    }
  }, [navigate]);
}

/** Icon-only mobile tab item. Tapping it fires a haptic tick and flashes the
 * page name in a small pill above the icon — same pattern as iOS/Android
 * system tab bars, so wayfinding doesn't rely on a permanent text label. */
function NavItem({ to, label, icon: Icon, active }: (typeof nav)[number] & { active: boolean }) {
  const [showLabel, setShowLabel] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  return (
    <Link
      to={to}
      aria-label={label}
      onPointerDown={() => {
        hapticTap();
        setShowLabel(true);
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setShowLabel(false), 1100);
      }}
      className="relative flex items-center justify-center min-h-[56px]"
    >
      <AnimatePresence>
        {showLabel && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -top-10 num text-[10px] uppercase tracking-[0.18em] bg-cloud-white text-departure-navy px-2.5 py-1.5 rounded-sm shadow-[0_10px_24px_-8px_rgba(0,0,0,0.45)] whitespace-nowrap pointer-events-none"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.div
        whileTap={{ scale: 0.82 }}
        transition={{ type: "spring", stiffness: 500, damping: 24 }}
        className="relative flex items-center justify-center w-11 h-11 rounded-full"
      >
        {active && (
          <motion.span
            layoutId="mobilepill"
            className="absolute inset-0 rounded-full bg-cloud-white/10"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        <Icon
          className="relative w-[21px] h-[21px] transition-colors"
          strokeWidth={active ? 2.25 : 1.6}
          style={{ color: active ? "var(--beacon-amber)" : "rgba(250,248,244,0.55)" }}
        />
      </motion.div>

      {active && (
        <motion.span
          layoutId="mobiledot"
          className="absolute bottom-1.5 w-1 h-1 rounded-full bg-beacon-amber"
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const setCommandPaletteOpen = useUI((s) => s.setCommandPaletteOpen);
  const plan = useUI((s) => s.plan);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  useRequireAuth();

  // Demo notifications on mount - in production these would come from a real-time source
  useEffect(() => {
    // Simulate initial notifications
    const demoNotifications: Notification[] = [
      createNotification(
        "achievement",
        "Welcome Aboard!",
        "You've earned your first badge: First Step. Keep exploring!",
        "high"
      ),
      createNotification(
        "reminder",
        "Daily Quest Available",
        "Save 3 listings today to earn +30 XP and unlock progress.",
        "medium",
        "View Quests"
      ),
      createNotification(
        "promotion",
        "Weekend Warrior Challenge",
        "Book 2 stays this month to unlock the Weekend Warrior badge + 5% fee discount.",
        "low"
      ),
    ];
    setNotifications(demoNotifications);
    
    // Show toast for first notification
    setTimeout(() => {
      toast.success("New Achievement Unlocked!", {
        description: "You've earned the First Step badge.",
        duration: 4000,
      });
    }, 1500);
  }, []);

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAction = (notification: Notification) => {
    // Handle notification actions based on type
    switch (notification.type) {
      case "booking":
        navigate({ to: "/trips/$tripId", params: { tripId: "demo" } });
        break;
      case "message":
        toast.info("Opening messages...", { duration: 1500 });
        break;
      case "price_drop":
        navigate({ to: "/recommendations" });
        break;
      case "achievement":
      case "referral":
        navigate({ to: "/profile" });
        break;
      default:
        toast.info("Feature coming soon", { duration: 1500 });
    }
  };

  return (
    <div className="min-h-screen bg-cloud-white flex flex-col">
      <header className="sticky top-0 z-30 bg-cloud-white/85 backdrop-blur border-b border-ink-90/5">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-beacon-amber" strokeWidth={2.25} />
            <span className="font-display text-xl tracking-tight text-departure-navy">
              GlobeTrotter
            </span>
            <span className="num text-[10px] uppercase tracking-[0.22em] text-ink-60 ml-1 hidden sm:inline">
              MNFST · v1
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="relative px-3 py-2 text-sm font-medium text-ink-60 hover:text-ink-90 transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="navpill"
                        className="absolute inset-0 bg-runway-sand rounded-sm -z-10"
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                    <span className={active ? "text-departure-navy" : ""}>{n.label}</span>
                  </Link>
                );
              })}
            </nav>
            <Link
              to="/pricing"
              className="hidden sm:inline-flex items-center gap-1.5 num text-[10px] uppercase tracking-[0.18em] text-departure-navy border border-beacon-amber/50 bg-beacon-amber/10 hover:bg-beacon-amber/20 px-3 py-2 rounded-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-beacon-amber" strokeWidth={2} />
              {plan === "explorer" ? "Upgrade" : PLAN_LABEL[plan]}
            </Link>
            <ThemeToggle />
            {/* Notification Panel */}
            <NotificationPanel
              notifications={notifications}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
              onAction={handleAction}
            />
            <button
              aria-label="Open command palette"
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 px-2.5 py-2 text-ink-60 hover:text-departure-navy border border-ink-90/10 rounded-sm transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <kbd className="num text-[10px] text-ink-60">⌘K</kbd>
            </button>
            <button
              aria-label="Open command palette"
              onClick={() => setCommandPaletteOpen(true)}
              className="md:hidden p-2 text-ink-60 hover:text-departure-navy transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              aria-label="Sign out"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="p-2 text-ink-60 hover:text-runway-red transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24 md:pb-8">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* Mobile tab bar with perforated active-state notch */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-departure-navy text-cloud-white">
        <div
          className="perforation-divider"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(250,248,244,.35) 1px, transparent 1.5px)",
          }}
        />
        <div className="grid grid-cols-5 pb-safe">
          {nav.map((n) => {
            const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
            return <NavItem key={n.to} {...n} active={active} />;
          })}
        </div>
      </nav>
      <CommandPalette />
    </div>
  );
}