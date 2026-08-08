import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthModal, UserButton, useAuth } from "@/components/auth";

/* -------------------- ALL PAGES (command palette index) -------------------- */

const ALL_PAGES = [
  { to: "/home", label: "Home", desc: "The living feed" },
  { to: "/discover", label: "Discover", desc: "Browse all businesses" },
  { to: "/housing", label: "Housing", desc: "Local apartments & hotels" },
  { to: "/profile/bookings", label: "My Trips", desc: "Booked housing trips" },
  { to: "/profile/saved", label: "Saved", desc: "Your saved content" },
  { to: "/map", label: "Map", desc: "Real-time distance tracking" },
  { to: "/messages", label: "Messages", desc: "Unified inbox" },
  { to: "/search", label: "AI Search", desc: "AI-powered search" },
  { to: "/search/results", label: "Search Results", desc: "AI-ranked results" },
  { to: "/profile", label: "My Profile", desc: "Consumer profile" },
  { to: "/profile/activity", label: "Activity", desc: "Likes, comments, follows" },
  { to: "/profile/settings", label: "Settings", desc: "Account preferences" },
  { to: "/housing/reservation", label: "Reservation", desc: "Review your booking" },
  { to: "/housing/booking", label: "Payment", desc: "Complete your payment" },
  { to: "/membership", label: "Membership", desc: "Growth plans" },
  { to: "/notifications", label: "Notifications", desc: "Activity center" },
];

const MOBILE_NAV_ITEMS = [
  { to: "/home" as const, label: "Home", icon: HomeIcon },
  { to: "/discover" as const, label: "Discover", icon: DiscoverIcon },
  { to: "/housing" as const, label: "Housing", icon: HousingIcon },
  { to: "/messages" as const, label: "Messages", icon: MessageIcon },
  { to: "/profile" as const, label: "Profile", icon: ProfileIcon },
];

/* Desktop vertical icon rail — top cluster (primary destinations) */
const RAIL_PRIMARY = [
  { to: "/home" as const, label: "Home", icon: HomeIcon },
  { to: "/discover" as const, label: "Discover", icon: DiscoverIcon },
  { to: "/housing" as const, label: "Housing", icon: HousingIcon },
  { to: "/map" as const, label: "Map", icon: MapRailIcon },
  { to: "/search" as const, label: "AI Search", icon: SearchRailIcon },
];

/* Desktop vertical icon rail — bottom cluster (account & utility) */
const RAIL_SECONDARY = [
  { to: "/membership" as const, label: "Membership", icon: MembershipRailIcon },
  { to: "/messages" as const, label: "Messages", icon: MessageIcon },
  { to: "/notifications" as const, label: "Notifications", icon: BellRailIcon, dot: true },
  { to: "/profile/settings" as const, label: "Settings", icon: SettingsRailIcon },
];

/* -------------------- APP SHELL -------------------- */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isDark, setIsDark] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const saved = localStorage.getItem("nexa-theme") ?? "dark";
    const dark = saved === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
      if (e.key === "Escape") { setPaletteOpen(false); setAuthOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("nexa-theme", next ? "dark" : "light");
  };

  // The Home (TikTok-style) vertical manages its own header/tabs, so it hides
  // the generic site top nav — but it deliberately keeps the app's core mobile
  // bottom nav (Home / Discover / Housing / Messages / Profile), since this
  // feed is one section of the app, not a standalone app with its own nav.
  const isHome = pathname === "/home" || pathname.startsWith("/home/");
  const isMapPage = pathname === "/map" || pathname.startsWith("/housing/search");
  const hideTopNav = isHome; // Home has its own top bar
  const hideCommandDock = isHome; // Home is full-screen feed

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <DesktopSideNav pathname={pathname} />
      {!hideTopNav && (
        <TopNav
          pathname={pathname}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onPaletteOpen={() => setPaletteOpen(true)}
          onSignIn={() => { setAuthMode("signin"); setAuthOpen(true); }}
        />
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} pathname={pathname} />
      <RouteChoreographer pathname={pathname} hideTopNav={hideTopNav}>
        {children}
      </RouteChoreographer>
      {!isMapPage && !hideCommandDock && <CommandDock />}
      <MobileBottomNav pathname={pathname} />
    </div>
  );
}

/* -------------------- DESKTOP SIDE NAV (Pinterest-style icon rail) -------------------- */
function DesktopSideNav({ pathname }: { pathname: string }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { user } = useAuth();

  function isActive(to: string) {
    if (to === "/home") return pathname === "/home" || pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  }

  const tap = () => {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* no-op — vibration unsupported */
    }
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[76px] z-50 flex-col items-center py-4 bg-background border-r border-hairline">
      {/* Logo — occupies the exact slot the Pinterest "P" mark sits in */}
      <div className="relative" onMouseEnter={() => setHovered("brand")} onMouseLeave={() => setHovered(null)}>
        <Link
          to="/home"
          onClick={tap}
          className="mb-4 w-11 h-11 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
        >
          <NexaMark size={30} />
        </Link>
        <AnimatePresence>{hovered === "brand" && <RailTooltip label="Nexa Home" />}</AnimatePresence>
      </div>

      {/* Primary destinations */}
      <nav className="flex flex-col items-center gap-1">
        {RAIL_PRIMARY.map((item) => (
          <RailIcon
            key={item.to}
            to={item.to}
            label={item.label}
            Icon={item.icon}
            active={isActive(item.to)}
            hovered={hovered}
            setHovered={setHovered}
            onClick={tap}
          />
        ))}
      </nav>

      <div className="flex-1" />

      {/* Secondary / account destinations */}
      <nav className="flex flex-col items-center gap-1 mb-3">
        {RAIL_SECONDARY.map((item) => (
          <RailIcon
            key={item.to}
            to={item.to}
            label={item.label}
            Icon={item.icon}
            active={isActive(item.to)}
            hovered={hovered}
            setHovered={setHovered}
            onClick={tap}
            dot={"dot" in item ? item.dot : false}
          />
        ))}
      </nav>

      {/* Profile avatar — always the final item, mirroring the reference */}
      <div className="relative" onMouseEnter={() => setHovered("profile-avatar")} onMouseLeave={() => setHovered(null)}>
        <Link to="/profile" onClick={tap} className="block">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            className={`w-10 h-10 rounded-full grid place-items-center text-[13px] font-bold overflow-hidden transition-shadow ${
              isActive("/profile") ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "ring-1 ring-hairline"
            } bg-primary text-primary-foreground`}
          >
            {user?.avatar ?? <ProfileIcon active={isActive("/profile")} />}
          </motion.div>
        </Link>
        <AnimatePresence>{hovered === "profile-avatar" && <RailTooltip label="Profile" />}</AnimatePresence>
      </div>
    </aside>
  );
}

/* -------------------- RAIL ICON + TOOLTIP -------------------- */
function RailIcon({
  to,
  label,
  Icon,
  active,
  hovered,
  setHovered,
  onClick,
  dot,
}: {
  to: string;
  label: string;
  Icon: (props: { active: boolean }) => ReactNode;
  active: boolean;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  onClick: () => void;
  dot?: boolean;
}) {
  const isHovered = hovered === to;
  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(to)}
      onMouseLeave={() => setHovered(null)}
    >
      <Link to={to} onClick={onClick} aria-label={label}>
        <motion.div
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
            active ? "bg-foreground/[0.08] text-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"
          }`}
        >
          <Icon active={active} />
          {dot && <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />}
        </motion.div>
      </Link>
      <AnimatePresence>{isHovered && <RailTooltip label={label} />}</AnimatePresence>
    </div>
  );
}

function RailTooltip({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -6, scale: 0.96 }}
      transition={{ duration: 0.14, ease: [0.19, 1, 0.22, 1] }}
      className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-foreground text-background text-[12px] font-semibold px-3 py-1.5 rounded-lg shadow-lg pointer-events-none z-[70]"
    >
      {label}
      <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-foreground" />
    </motion.div>
  );
}

/* -------------------- TOP NAV -------------------- */
function TopNav({
  pathname,
  isDark,
  toggleTheme,
  onPaletteOpen,
  onSignIn,
}: {
  pathname: string;
  isDark: boolean;
  toggleTheme: () => void;
  onPaletteOpen: () => void;
  onSignIn: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ${scrolled ? "pt-3" : "pt-5"} ${pathname === "/map" ? "hidden md:block" : ""}`}
    >
      <div className="mx-auto max-w-[1440px] px-4 md:px-10 lg:pl-24">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className={`flex items-center justify-between rounded-full pl-4 pr-2 py-2 ${scrolled ? "glass shadow-float" : "bg-transparent"}`}
        >
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 lg:hidden">
            <NexaMark />
            <span className="font-display text-[20px] tracking-tight">Nexa</span>
          </Link>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-1.5 md:gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                aria-label="Toggle theme"
              >
                <motion.span
                  key={isDark ? "moon" : "sun"}
                  initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </motion.span>
              </button>
              <button
                onClick={onPaletteOpen}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground bg-foreground/5 hover:bg-foreground/8 rounded-full px-3 h-9 transition-colors"
                aria-label="Open command palette"
              >
                <SearchSvg />
                <span className="font-mono">⌘K</span>
              </button>
            </div>
            <UserButton onSignIn={onSignIn} />
            <MagneticButton>
              <Link
                to="/membership"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 h-9 text-sm font-medium"
              >
                Get Nexa
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}

/* -------------------- NEXA MARK -------------------- */
export function NexaMark({ size = 28 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full bg-foreground"
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-[15%] rounded-full bg-background" />
      <motion.div
        className="absolute inset-[36%] rounded-full bg-primary"
        animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* -------------------- COMMAND PALETTE -------------------- */
function CommandPalette({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filtered = query
    ? ALL_PAGES.filter(
        (p) =>
          p.label.toLowerCase().includes(query.toLowerCase()) ||
          p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_PAGES;

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.22, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[90] w-[min(560px,calc(100vw-2rem))] surface-card overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 h-14 border-b border-hairline">
              <SearchSvg />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages, businesses..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] font-mono text-muted-foreground bg-foreground/5 px-2 py-1 rounded-md">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-2">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results for "{query}"</div>
              )}
              {!query && (
                <div className="px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">All pages</div>
              )}
              {filtered.map((page, i) => {
                const active = pathname === page.to || (page.to !== "/home" && pathname.startsWith(page.to));
                return (
                  <motion.div
                    key={page.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <Link
                      to={page.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-foreground/5 transition-colors ${active ? "bg-primary/10" : ""}`}
                    >
                      <div className="flex-1 text-left">
                        <div className="font-medium text-[15px]">{page.label}</div>
                        <div className="text-xs text-muted-foreground">{page.desc}</div>
                      </div>
                      {active && <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Current</span>}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <div className="border-t border-hairline px-4 py-3 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span>↑↓ navigate · ↵ open · ESC close</span>
              <span>⌘K</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------- MOBILE BOTTOM NAV -------------------- */
function MobileBottomNav({ pathname }: { pathname: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastY.current + 10) setIsVisible(false);
      else if (currentY < lastY.current - 10) setIsVisible(true);
      lastY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHiddenByPath =
    pathname.includes("/chat/") ||
    pathname.includes("/call/") ||
    pathname.includes("/home/comments") ||
    pathname.includes("/home/following") ||
    pathname.includes("/creator/video/") ||
    pathname.includes("/discover/pin/") ||
    pathname.includes("/discover/board/") ||
    pathname.includes("/discover/shop/") ||
    pathname.includes("/housing/book/") ||
    pathname.includes("/housing/dates/") ||
    pathname.includes("/housing/search") ||
    pathname === "/housing/map" ||
    pathname === "/map";

  const showNav = isVisible && !isHiddenByPath;

  // Determine active tab — /home matches home, everything else by prefix
  function isActive(to: string) {
    if (to === "/home") return pathname === "/home" || pathname === "/";
    return pathname === to || pathname.startsWith(to + "/");
  }

  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {showNav && (
        <motion.nav
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="fixed bottom-0 inset-x-0 z-[70] lg:hidden glass border-t border-hairline bottom-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
        >
          <div className="flex items-center justify-around px-2 h-16">
            {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <button
                  key={to}
                  onClick={() => {
                    if (active) {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      navigate({ to });
                    }
                  }}
                  className="flex flex-col items-center gap-1 flex-1 h-full justify-center relative"
                  aria-label={label}
                >
                  <motion.div
                    whileTap={{ scale: 0.82 }}
                    className={`relative flex flex-col items-center gap-[3px] transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                  >
                    <Icon active={active} />
                    {active && (
                      <motion.span
                        layoutId="mobile-nav-dot"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.div>
                  <span className={`text-[10px] font-medium tracking-wide ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

/* -------------------- SITE FOOTER -------------------- */
export function SiteFooter() {
  return (
    <footer className="relative border-t border-hairline mt-0">
      <div className="md:hidden flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <NexaMark size={18} />
          <span className="text-xs text-muted-foreground">© 2026 Nexa</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/manifesto" className="text-xs text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/home" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/home" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>

      <div className="hidden md:block mx-auto max-w-[1440px] px-10 py-20">
        <div className="grid md:grid-cols-5 gap-10 md:gap-8">
          <div className="md:col-span-2">
            <Link to="/home" className="flex items-center gap-2.5">
              <NexaMark size={24} />
              <span className="font-display text-xl tracking-tight">Nexa</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-[260px] leading-relaxed">
              The AI operating system for local commerce. Describe it. We'll handle the rest.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {["X", "IG", "in"].map((s) => (
                <a key={s} href="#" aria-label={s} className="w-9 h-9 rounded-full hairline grid place-items-center text-muted-foreground hover:text-foreground transition-colors text-xs font-mono">
                  {s}
                </a>
              ))}
            </div>
          </div>
          {[
            {
              title: "Product",
              links: [
                { to: "/home", label: "Home Feed" },
                { to: "/discover", label: "Discover" },
                { to: "/housing", label: "Housing" },
                { to: "/search", label: "AI Search" },
                { to: "/map", label: "Map" },
              ],
            },
            {
              title: "Account",
              links: [
                { to: "/profile", label: "Profile" },
                { to: "/profile/bookings", label: "Bookings" },
                { to: "/profile/saved", label: "Saved" },
                { to: "/profile/activity", label: "Activity" },
                { to: "/profile/settings", label: "Settings" },
              ],
            },
            {
              title: "Company",
              links: [
                { to: "/manifesto", label: "Manifesto" },
                { to: "/home", label: "About" },
                { to: "/home", label: "Privacy" },
                { to: "/home", label: "Terms" },
                { to: "/home", label: "Contact" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-5">{col.title}</div>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-hairline flex items-center justify-between gap-4">
          <span className="text-xs text-muted-foreground">© 2026 Nexa Technologies, Inc. All rights reserved.</span>
          <span className="text-xs text-muted-foreground font-mono">Made with intelligence · v0.1 private beta</span>
        </div>
      </div>
    </footer>
  );
}

/* -------------------- MAGNETIC BUTTON -------------------- */
export function MagneticButton({ children, strength = 22 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18 });
  const sy = useSpring(y, { stiffness: 220, damping: 18 });
  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        x.set(((e.clientX - r.left) / r.width - 0.5) * strength);
        y.set(((e.clientY - r.top) / r.height - 0.5) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/* -------------------- ROUTE TRANSITIONS -------------------- */
const CHOREO: Record<string, { initial: any; animate: any; exit: any; transition: any }> = {
  "/home": {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.4, ease: [0.19, 1, 0.22, 1] },
  },
  "/discover": {
    initial: { clipPath: "inset(0 0 100% 0)" },
    animate: { clipPath: "inset(0 0 0% 0)" },
    exit:    { clipPath: "inset(100% 0 0 0)" },
    transition: { duration: 1.05, ease: [0.76, 0, 0.24, 1] },
  },
  "/map": {
    initial: { opacity: 0, scale: 1.06, filter: "blur(12px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit:    { opacity: 0, scale: 0.97 },
    transition: { duration: 0.85, ease: [0.19, 1, 0.22, 1] },
  },
  "/housing": {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -20 },
    transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
  },
  "/messages": {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -30 },
    transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] },
  },
  "/profile": {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -30 },
    transition: { duration: 0.55, ease: [0.19, 1, 0.22, 1] },
  },
  "/search": {
    initial: { clipPath: "inset(0 0 100% 0)" },
    animate: { clipPath: "inset(0 0 0% 0)" },
    exit:    { clipPath: "inset(100% 0 0 0)" },
    transition: { duration: 1.0, ease: [0.76, 0, 0.24, 1] },
  },
  "/trust": {
    initial: { opacity: 0, y: 80, rotateX: -8, transformPerspective: 1200 },
    animate: { opacity: 1, y: 0, rotateX: 0 },
    exit:    { opacity: 0, y: -80, rotateX: 8 },
    transition: { duration: 0.95, ease: [0.19, 1, 0.22, 1] },
  },
  "/ai": {
    initial: { clipPath: "circle(0% at 90% 8%)" },
    animate: { clipPath: "circle(150% at 90% 8%)" },
    exit:    { clipPath: "circle(0% at 10% 92%)" },
    transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] },
  },
  "/membership": {
    initial: { opacity: 0, scale: 1.15, filter: "blur(24px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit:    { opacity: 0, scale: 0.9, filter: "blur(24px)" },
    transition: { duration: 1, ease: [0.19, 1, 0.22, 1] },
  },
  "/manifesto": {
    initial: { opacity: 0, letterSpacing: "0.4em" },
    animate: { opacity: 1, letterSpacing: "0em" },
    exit:    { opacity: 0, letterSpacing: "-0.05em" },
    transition: { duration: 1.05, ease: [0.19, 1, 0.22, 1] },
  },
  business: {
    initial: { clipPath: "inset(50% 0 50% 0)", opacity: 0.4 },
    animate: { clipPath: "inset(0% 0 0% 0)", opacity: 1 },
    exit:    { clipPath: "inset(50% 0 50% 0)", opacity: 0 },
    transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
  },
};

function pickChoreo(pathname: string) {
  if (pathname.startsWith("/business/")) return CHOREO.business;
  if (pathname.startsWith("/housing")) return CHOREO["/housing"] ?? CHOREO["/home"];
  if (pathname.startsWith("/profile")) return CHOREO["/profile"] ?? CHOREO["/home"];
  if (pathname.startsWith("/messages")) return CHOREO["/messages"] ?? CHOREO["/home"];
  if (pathname.startsWith("/discover")) return CHOREO["/discover"] ?? CHOREO["/home"];
  return CHOREO[pathname] ?? CHOREO["/home"];
}

function RouteChoreographer({ pathname, children, hideTopNav }: { pathname: string; children: ReactNode; hideTopNav: boolean }) {
  const c = pickChoreo(pathname);
  const isMap = pathname === "/map";
  const isFullScreenApp =
    isMap ||
    pathname.startsWith("/messages/call") ||
    pathname.startsWith("/housing/search") ||
    pathname === "/home" ||
    pathname === "/home/following" ||
    pathname === "/home/live" ||
    pathname.startsWith("/home/comments/") ||
    pathname.startsWith("/home/share/");

  return (
    <>
      {/* Ambient curtain */}
      <AnimatePresence>
        <motion.div
          key={"curtain-" + pathname}
          initial={{ scaleX: 0, transformOrigin: "left" }}
          animate={{ scaleX: [0, 1, 1, 0], transformOrigin: ["left", "left", "right", "right"] }}
          transition={{ duration: 1.1, times: [0, 0.45, 0.55, 1], ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[60] pointer-events-none bg-foreground origin-left"
          style={{ mixBlendMode: "difference" }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={c.initial}
          animate={c.animate}
          exit={c.exit}
          transition={c.transition}
          className={
            isFullScreenApp
              ? "h-[100dvh] overflow-hidden lg:pl-[76px]"
              : hideTopNav
              ? "min-h-screen pb-[calc(var(--bottom-nav-height)+1.5rem)] lg:pb-[calc(var(--dock-height)+2rem)] lg:pl-[76px]"
              : "min-h-screen pt-20 pb-[calc(var(--bottom-nav-height)+1.5rem)] lg:pb-[calc(var(--dock-height)+2rem)] lg:pl-[76px]"
          }
          style={{ willChange: "transform, opacity, filter, clip-path" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </>
  );
}

/* -------------------- COMMAND DOCK -------------------- */
const PROMPTS = [
  "Fix a leaking sink tonight in Brooklyn",
  "Best sushi omakase near me under $120",
  "A pilates studio open at 7am with parking",
  "Emergency electrician, response under 15 min",
  "A florist that delivers before noon tomorrow",
  "Find me a locksmith right now",
  "Dog groomer available this weekend",
];

function CommandDock() {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMPTS.length), 3400);
    return () => clearInterval(t);
  }, [open]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 1, ease: [0.19, 1, 0.22, 1] }}
      className="hidden lg:block fixed bottom-20 lg:bottom-5 left-1/2 lg:left-[calc(50%+38px)] -translate-x-1/2 z-40 w-[min(720px,calc(100vw-2rem))]"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative glass rounded-full shadow-drama overflow-hidden"
      >
        <div className="absolute inset-0 opacity-60 pointer-events-none">
          <div className="absolute -inset-x-20 -top-24 h-40 bg-gradient-to-r from-primary/40 via-transparent to-primary/40 blur-3xl animate-aurora" />
        </div>
        <div className="relative flex items-center gap-2 pl-5 pr-2 h-14">
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
            <SearchSvg />
          </motion.div>

          <div className="flex-1 relative h-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                initial={{ y: 22, opacity: 0, filter: "blur(6px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -22, opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
                className="absolute inset-0 flex items-center text-[15px] text-foreground/90"
              >
                {PROMPTS[idx]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            {[MicSvg, ImgSvg, ShareSvg].map((S, i) => (
              <button key={i} onClick={() => setOpen((o) => !o)} className="w-9 h-9 grid place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                <S />
              </button>
            ))}
          </div>
          <Link to="/search" className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 h-10 text-sm font-medium">
            Ask Nexa
          </Link>
        </div>
      </motion.div>
      <div className="mt-2 flex justify-center">
        <div className="text-[11px] text-muted-foreground font-mono px-3 py-1 rounded-full glass">⌘ K anywhere</div>
      </div>
    </motion.div>
  );
}

/* -------------------- SVG ICONS -------------------- */
function MicSvg() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>; }
function ImgSvg() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>; }
function ShareSvg() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M8 7l4-4 4 4"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>; }
function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>; }

/* -------------------- NAV ICONS (active-aware) -------------------- */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? "0" : "1.7"} strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22" fill={active ? "currentColor" : "none"} stroke={active ? "var(--color-background)" : "currentColor"} strokeWidth={active ? "1.5" : "1.7"}/>
    </svg>
  );
}

function DiscoverIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        fill={active ? "var(--color-background)" : "currentColor"}
        stroke="none"
      />
    </svg>
  );
}

function HousingIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function MessageIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}

function MapRailIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z" fill={active ? "currentColor" : "none"} />
      <circle cx="12" cy="9.5" r="2.4" fill={active ? "var(--color-background)" : "none"} stroke="currentColor" />
    </svg>
  );
}

function SearchRailIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.4L18 9l-4.2 1.6L12 15l-1.8-4.4L6 9l4.2-1.6L12 3z" fill={active ? "currentColor" : "none"} />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" fill={active ? "currentColor" : "none"} />
    </svg>
  );
}

function MembershipRailIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8 4 3 5-7 5 7 4-3-1.6 10.5a1 1 0 0 1-1 .85H5.6a1 1 0 0 1-1-.85L3 8z"/>
    </svg>
  );
}

function BellRailIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z"/>
      <path d="M9.5 18.5a2.5 2.5 0 0 0 5 0" fill="none"/>
    </svg>
  );
}

function SettingsRailIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none"/>
    </svg>
  );
}

/* -------------------- KINETIC HEADING -------------------- */
export function KineticHeading({ text, className = "", delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <h1 className={`font-display ${className}`}>
      {words.map((w, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap mr-[0.25em]">
          {w.split("").map((ch, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={{ y: "110%", opacity: 0, rotate: 8 }}
              animate={{ y: "0%", opacity: 1, rotate: 0 }}
              transition={{
                duration: 1.05,
                delay: delay + wi * 0.05 + ci * 0.018,
                ease: [0.19, 1, 0.22, 1],
              }}
              style={{ display: "inline-block" }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}

/* -------------------- SCROLL REVEAL -------------------- */
export function Reveal({ children, delay = 0, y = 40, className = "" }: { children: ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.19, 1, 0.22, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------- PARALLAX BAND -------------------- */
export function ParallaxY({ children, strength = 80, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      y.set(-p * strength);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [strength, y]);
  const sy = useSpring(y, { stiffness: 100, damping: 20 });
  return (
    <motion.div ref={ref} style={{ y: sy }} className={className}>{children}</motion.div>
  );
}

/* -------------------- SECTION KICKER -------------------- */
export function Kicker({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground"
    >
      <span className="w-6 h-px bg-primary" />
      {children}
    </motion.div>
  );
}

/* re-export useTransform */
export { useTransform };
