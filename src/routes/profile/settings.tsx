import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, Search, ChevronRight, UserCircle2, Bookmark, History, ActivitySquare,
  Bell, Clock3, Tablet, BarChart3, SlidersHorizontal, CreditCard, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/profile/settings")({
  component: ProfileSettings,
});

interface SettingsItem { icon: any; label: string; sublabel?: string; to?: string; external?: boolean }
interface SettingsSection { title: string; badge?: "meta"; items: SettingsItem[] }

const SECTIONS: SettingsSection[] = [
  {
    title: "Your account",
    badge: "meta",
    items: [
      { icon: UserCircle2, label: "Accounts Center", sublabel: "Password, security, personal details, connected experiences, ad preferences", to: "/profile/settings" },
    ],
  },
  {
    title: "How you use Instagram",
    items: [
      { icon: Bookmark, label: "Saved", to: "/profile/saved" },
      { icon: History, label: "Archive", to: "/profile/history" },
      { icon: ActivitySquare, label: "Your activity", to: "/profile/activity" },
      { icon: Bell, label: "Notifications", to: "/notifications" },
      { icon: Clock3, label: "Time management", to: "/profile/settings" },
      { icon: Tablet, label: "Instagram for tablets", to: "/profile/settings" },
    ],
  },
  {
    title: "For professionals",
    items: [
      { icon: BarChart3, label: "Insights", to: "/profile/analytics" },
      { icon: SlidersHorizontal, label: "Account type and tools", to: "/profile/settings" },
      { icon: CreditCard, label: "Ads payments", to: "/profile/wallet" },
    ],
  },
];

function SettingsRow({ item }: { item: SettingsItem }) {
  return (
    <Link to={item.to || "/profile/settings"} className="w-full flex items-center gap-4 py-3 group">
      <item.icon className="w-6 h-6 text-foreground shrink-0" strokeWidth={1.7} />
      <div className="flex-1 min-w-0">
        <p className="text-[16px] text-foreground leading-tight">{item.label}</p>
        {item.sublabel && (
          <p className="text-[13px] text-muted-foreground leading-snug mt-0.5">{item.sublabel}</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
    </Link>
  );
}

function MetaGlyph() {
  return (
    <svg viewBox="0 0 32 20" className="w-8 h-5" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round">
      <path d="M9 4c-4.5 0-7 4.4-7 8s2 6 5 6c3.4 0 5.2-4.4 6.6-8.4C15 5.6 16.8 4 18.4 4c3 0 5 2.7 5 8s-2.5 8-5 8c-3.2 0-5.2-4.4-6.6-8.4" />
    </svg>
  );
}

function ProfileSettings() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((i) => i.label.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0);
  }, [query]);

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-4 pt-safe">
        <button onClick={() => window.history.back()} className="p-1 -ml-1 rounded-full hover:bg-surface text-foreground shrink-0">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[19px]">Settings and activity</h1>
      </div>

      {/* Search */}
      <div className="px-4 pt-1 pb-2">
        <div className="flex items-center gap-2 bg-surface rounded-xl px-4 h-11">
          <Search className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="px-4">
        {filteredSections.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? "pt-5 border-t border-hairline mt-5" : "pt-3"}>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-[14px] font-medium text-muted-foreground">{section.title}</h2>
              {section.badge === "meta" && <MetaGlyph />}
            </div>
            <div>
              {section.items.map((item, i) => (
                <SettingsRow key={i} item={item} />
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-12">No settings match "{query}"</p>
        )}
      </div>

      {/* Log out */}
      <div className="px-4 pt-8 pb-4">
        <button
          onClick={() => navigate({ to: "/onboarding" })}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-surface font-bold text-[15px] text-[#e11d48] hover:bg-[#e11d48]/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
        <p className="text-center mt-5 text-[12px] text-muted-foreground">App Version 24.5.1</p>
      </div>
    </div>
  );
}
