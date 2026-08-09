import { useNavigate } from "@tanstack/react-router";
import { Command as Cmdk } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import {
  Compass,
  LogOut,
  Map,
  Moon,
  PieChart,
  Plane,
  Plus,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { useUI } from "@/lib/store";
import { useTrips, useCreateTrip } from "@/lib/queries";
import { logout } from "@/lib/auth";

/**
 * Cmd/Ctrl+K palette — the "billion dollar app" muscle-memory shortcut.
 * Jump to any screen or trip, spin up a new trip, or flip the theme
 * without touching the mouse.
 */
export function CommandPalette() {
  const open = useUI((s) => s.commandPaletteOpen);
  const setOpen = useUI((s) => s.setCommandPaletteOpen);
  const toggleTheme = useUI((s) => s.toggleTheme);
  const theme = useUI((s) => s.theme);
  const navigate = useNavigate();
  const { data: trips } = useTrips();
  const createTrip = useCreateTrip();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const go = (to: string) => {
    navigate({ to });
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-departure-navy/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[14vh] z-[91] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2"
          >
            <Cmdk
              label="Command palette"
              className="overflow-hidden rounded-lg bg-cloud-white shadow-[0_30px_80px_-20px_rgba(14,22,38,0.55)] border border-ink-90/10"
            >
              <div className="flex items-center gap-3 px-4 border-b border-ink-90/10">
                <Compass className="w-4 h-4 text-beacon-amber shrink-0" />
                <Cmdk.Input
                  autoFocus
                  placeholder="Jump to a trip, screen, or action…"
                  className="flex-1 bg-transparent py-3.5 text-sm text-ink-90 outline-none placeholder:text-ink-60"
                />
                <kbd className="num text-[10px] text-ink-60 border border-ink-30/40 rounded px-1.5 py-0.5">
                  ESC
                </kbd>
              </div>
              <Cmdk.List className="max-h-[52vh] overflow-y-auto p-2">
                <Cmdk.Empty className="py-8 text-center text-sm text-ink-60">
                  No matches on the manifest.
                </Cmdk.Empty>

                <Cmdk.Group
                  heading="Navigate"
                  className="[&_[cmdk-group-heading]]:num [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-ink-60 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                >
                  <PaletteItem icon={Map} label="Your trips" onSelect={() => go("/")} />
                  <PaletteItem
                    icon={Sparkles}
                    label="Discover"
                    onSelect={() => go("/recommendations")}
                  />
                  <PaletteItem icon={PieChart} label="Budget" onSelect={() => go("/budget")} />
                  <PaletteItem icon={User} label="Profile" onSelect={() => go("/profile")} />
                </Cmdk.Group>

                {!!trips?.length && (
                  <Cmdk.Group
                    heading="Trips"
                    className="[&_[cmdk-group-heading]]:num [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-ink-60 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                  >
                    {trips.slice(0, 6).map((t) => (
                      <PaletteItem
                        key={t.id}
                        icon={Plane}
                        label={t.name}
                        hint={t.destination}
                        onSelect={() => go(`/trips/${t.id}`)}
                      />
                    ))}
                  </Cmdk.Group>
                )}

                <Cmdk.Group
                  heading="Actions"
                  className="[&_[cmdk-group-heading]]:num [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.2em] [&_[cmdk-group-heading]]:text-ink-60 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2"
                >
                  <PaletteItem
                    icon={Plus}
                    label="New trip"
                    onSelect={() => {
                      const now = new Date();
                      const later = new Date(now.getTime() + 7 * 86_400_000);
                      createTrip.mutate(
                        {
                          name: "Untitled Trip",
                          startDate: now.toISOString(),
                          endDate: later.toISOString(),
                        },
                        { onSuccess: (trip) => go(`/trips/${trip.id}`) },
                      );
                    }}
                  />
                  <PaletteItem
                    icon={theme === "light" ? Moon : Sun}
                    label={
                      theme === "light" ? "Switch to dark manifest" : "Switch to light manifest"
                    }
                    onSelect={() => {
                      toggleTheme();
                      setOpen(false);
                    }}
                  />
                  <PaletteItem
                    icon={LogOut}
                    label="Sign out"
                    onSelect={() => {
                      logout();
                      go("/login");
                    }}
                  />
                </Cmdk.Group>
              </Cmdk.List>
            </Cmdk>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PaletteItem({
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  icon: typeof Map;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Cmdk.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-ink-90 cursor-pointer data-[selected=true]:bg-runway-sand"
    >
      <Icon className="w-4 h-4 text-ink-60 shrink-0" strokeWidth={1.75} />
      <span className="flex-1 truncate">{label}</span>
      {hint && (
        <span className="num text-[10px] uppercase tracking-[0.15em] text-ink-60">{hint}</span>
      )}
    </Cmdk.Item>
  );
}
