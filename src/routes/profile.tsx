import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, ChevronRight, CreditCard, Download, Globe2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/manifest/AppShell";
import { ManifestStub } from "@/components/manifest/ManifestStub";
import { PerforatedDivider } from "@/components/manifest/PerforatedDivider";
import { Sheet } from "@/components/manifest/Sheet";
import { auth } from "@/lib/auth";
import { useTrips } from "@/lib/queries";
import { useUI, type TravelStyle } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile · GlobeTrotter" },
      { name: "description", content: "Your travel identity: style, preferences, home currency." },
      { property: "og:title", content: "Profile · GlobeTrotter" },
      { property: "og:description", content: "Your travel identity, at a glance." },
    ],
  }),
  component: Profile,
});

const TRAVEL_STYLES: TravelStyle[] = ["Shoestring", "Comfort", "Luxury"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD"];
const LANGUAGES = ["English (US)", "English (UK)", "Español", "Français", "日本語", "Português"];

type PanelKey = "style" | "currency" | "notifications" | "language" | "export" | null;

function Profile() {
  const me = auth.currentUser();
  const { data: trips } = useTrips();
  const { preferences, setPreferences } = useUI();
  const [panel, setPanel] = useState<PanelKey>(null);

  const countries = new Set(
    (trips ?? []).flatMap((t) => t.days.flatMap((d) => d.stops.map((s) => s.country))),
  ).size;
  const initials = me?.email ? me.email.slice(0, 2).toUpperCase() : "??";

  const rows: { key: Exclude<PanelKey, null>; icon: typeof Wallet; k: string; v: string }[] = [
    {
      key: "style",
      icon: Wallet,
      k: "Travel style",
      v: `${preferences.travelStyle} · solo & partner`,
    },
    { key: "currency", icon: Wallet, k: "Home currency", v: preferences.homeCurrency },
    {
      key: "notifications",
      icon: Bell,
      k: "Notifications",
      v:
        [preferences.pushNotifications && "Push", preferences.emailNotifications && "Email"]
          .filter(Boolean)
          .join(" + ") || "Off",
    },
    { key: "language", icon: Globe2, k: "Language", v: preferences.language },
  ];

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-5 pt-6">
        <p className="num text-[11px] uppercase tracking-[0.24em] text-ink-60">Passport</p>
        <h1 className="font-display text-4xl text-departure-navy leading-[0.95] mt-1">You</h1>

        <ManifestStub tone="navy" className="mt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-beacon-amber text-departure-navy flex items-center justify-center font-display text-2xl">
              {initials}
            </div>
            <div className="flex-1">
              <p className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/70">
                Name of holder
              </p>
              <p className="font-display text-2xl leading-tight">
                {me?.email?.split("@")[0] ?? "Guest"}
              </p>
              <p className="num text-xs text-cloud-white/70 mt-1">{me?.email ?? ""}</p>
            </div>
            <span className="customs-stamp text-beacon-amber border-beacon-amber">Pro</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-cloud-white/20 text-center">
            <div>
              <p className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/60">
                Trips
              </p>
              <p className="num text-xl">{(trips?.length ?? 0).toString().padStart(2, "0")}</p>
            </div>
            <div className="border-x border-cloud-white/20">
              <p className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/60">
                Countries
              </p>
              <p className="num text-xl">{countries}</p>
            </div>
            <div>
              <p className="num text-[10px] uppercase tracking-[0.2em] text-cloud-white/60">
                Stops
              </p>
              <p className="num text-xl">
                {(trips ?? []).reduce(
                  (s, t) => s + t.days.reduce((a, d) => a + d.stops.length, 0),
                  0,
                )}
              </p>
            </div>
          </div>
        </ManifestStub>

        <PerforatedDivider label="Preferences" />

        <div className="space-y-3 mt-4">
          {rows.map((row) => {
            const Icon = row.icon;
            return (
              <ManifestStub
                key={row.key}
                tone="white"
                interactive
                onClick={() => setPanel(row.key)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-ink-60 shrink-0" strokeWidth={1.75} />
                    <span className="num text-[11px] uppercase tracking-[0.18em] text-ink-60 shrink-0">
                      {row.k}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-ink-90 truncate">{row.v}</span>
                    <ChevronRight className="w-4 h-4 text-ink-30 shrink-0" />
                  </div>
                </div>
              </ManifestStub>
            );
          })}

          <Link to="/onboarding" className="block">
            <ManifestStub tone="sand" interactive>
              <div className="flex items-center justify-between">
                <span className="num text-[11px] uppercase tracking-[0.18em] text-ink-60">
                  Replay onboarding
                </span>
                <span className="num text-[11px] uppercase tracking-[0.18em] text-beacon-amber">
                  Open →
                </span>
              </div>
            </ManifestStub>
          </Link>

          <ManifestStub tone="white" interactive onClick={() => setPanel("export")}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Download className="w-4 h-4 text-ink-60 shrink-0" strokeWidth={1.75} />
                <span className="num text-[11px] uppercase tracking-[0.18em] text-ink-60">
                  Export your data
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-ink-30 shrink-0" />
            </div>
          </ManifestStub>
        </div>

        <PerforatedDivider label="Membership" />

        <Link to="/pricing" className="block mt-4">
          <ManifestStub tone="navy" interactive>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CreditCard className="w-4 h-4 text-beacon-amber shrink-0" strokeWidth={1.75} />
                <div>
                  <p className="text-sm text-cloud-white">
                    On the <span className="text-beacon-amber">Voyager</span> plan
                  </p>
                  <p className="num text-[11px] text-cloud-white/60 mt-0.5">
                    Unlimited trips · renews monthly
                  </p>
                </div>
              </div>
              <span className="num text-[10px] uppercase tracking-[0.18em] text-cloud-white/70 shrink-0 flex items-center gap-1">
                Manage <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </ManifestStub>
        </Link>
      </div>

      {/* Travel style */}
      <Sheet open={panel === "style"} onClose={() => setPanel(null)} title="Travel style">
        <div className="space-y-2 pt-1">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style}
              onClick={() => {
                setPreferences({ travelStyle: style });
                toast.success("Travel style updated", { description: style });
                setPanel(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-sm border text-left transition-colors",
                preferences.travelStyle === style
                  ? "bg-departure-navy text-cloud-white border-departure-navy"
                  : "border-ink-30/40 text-ink-90 hover:border-ink-30",
              )}
            >
              <span className="font-display text-lg">{style}</span>
              {preferences.travelStyle === style && (
                <span className="num text-[10px] uppercase tracking-[0.18em] text-beacon-amber">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Home currency */}
      <Sheet open={panel === "currency"} onClose={() => setPanel(null)} title="Home currency">
        <div className="grid grid-cols-3 gap-2 pt-1">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setPreferences({ homeCurrency: c });
                toast.success("Home currency updated", { description: c });
                setPanel(null);
              }}
              className={cn(
                "num text-sm px-3 py-3 rounded-sm border transition-colors",
                preferences.homeCurrency === c
                  ? "bg-beacon-amber text-departure-navy border-beacon-amber"
                  : "border-ink-30/40 text-ink-90 hover:border-ink-30",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </Sheet>

      {/* Notifications */}
      <Sheet open={panel === "notifications"} onClose={() => setPanel(null)} title="Notifications">
        <div className="space-y-3 pt-1">
          {[
            {
              key: "pushNotifications" as const,
              label: "Push notifications",
              hint: "Boarding reminders, price drops",
            },
            {
              key: "emailNotifications" as const,
              label: "Email notifications",
              hint: "Weekly manifest digest",
            },
          ].map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-sm border border-ink-30/30"
            >
              <div>
                <p className="text-sm text-ink-90">{row.label}</p>
                <p className="text-xs text-ink-60 mt-0.5">{row.hint}</p>
              </div>
              <button
                role="switch"
                aria-checked={preferences[row.key]}
                onClick={() => {
                  const next = !preferences[row.key];
                  setPreferences({ [row.key]: next });
                  toast(next ? `${row.label} on` : `${row.label} off`);
                }}
                className={cn(
                  "relative h-6 w-11 rounded-full shrink-0 transition-colors",
                  preferences[row.key] ? "bg-beacon-amber" : "bg-ink-30/40",
                )}
              >
                <motion.span
                  layout
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-1 left-1 h-4 w-4 rounded-full bg-cloud-white shadow"
                  style={{ x: preferences[row.key] ? 20 : 0 }}
                />
              </button>
            </div>
          ))}
        </div>
      </Sheet>

      {/* Language */}
      <Sheet open={panel === "language"} onClose={() => setPanel(null)} title="Language">
        <div className="space-y-2 pt-1">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setPreferences({ language: lang });
                toast.success("Language updated", { description: lang });
                setPanel(null);
              }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-sm border text-left transition-colors",
                preferences.language === lang
                  ? "bg-departure-navy text-cloud-white border-departure-navy"
                  : "border-ink-30/40 text-ink-90 hover:border-ink-30",
              )}
            >
              <span className="text-sm">{lang}</span>
              {preferences.language === lang && (
                <span className="num text-[10px] uppercase tracking-[0.18em] text-beacon-amber">
                  Active
                </span>
              )}
            </button>
          ))}
        </div>
      </Sheet>
      {/* Export data */}
      <Sheet open={panel === "export"} onClose={() => setPanel(null)} title="Export your data">
        <div className="space-y-4 pt-1">
          <p className="text-sm text-ink-60">
            Download every trip, stop, and preference as a single JSON file — useful for backups or
            moving your manifest elsewhere.
          </p>
          <button
            onClick={() => {
              const payload = {
                exportedAt: new Date().toISOString(),
                account: { email: me?.email ?? null },
                preferences,
                trips: trips ?? [],
              };
              const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "globetrotter-export.json";
              document.body.appendChild(a);
              a.click();
              a.remove();
              URL.revokeObjectURL(url);
              toast.success("Export downloaded", { description: "globetrotter-export.json" });
              setPanel(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-sm border border-ink-30/25 hover:bg-runway-sand transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-runway-sand flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-departure-navy" />
            </div>
            <div>
              <p className="text-sm text-ink-90">Download JSON</p>
              <p className="text-xs text-ink-60 mt-0.5">{trips?.length ?? 0} trips included</p>
            </div>
          </button>
        </div>
      </Sheet>
    </AppShell>
  );
}
