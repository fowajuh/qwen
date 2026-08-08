import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Lock } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED } from "../discover/index";

export const Route = createFileRoute("/profile/saved")({
  component: ProfileSaved,
});

const COLLECTIONS = [
  { id: "c1", name: "Style Inspo", cover: DISCOVER_FEED[2]?.image, count: 6 },
  { id: "c2", name: "Interior Ideas", cover: DISCOVER_FEED[0]?.image, count: 4 },
  { id: "c3", name: "Design Refs", cover: DISCOVER_FEED[5]?.image, count: 3 },
];

function ProfileSaved() {
  const [view, setView] = useState<"all" | string>("all");
  const savedItems = DISCOVER_FEED.slice(0, 9); // Mock data

  const activeCollection = COLLECTIONS.find((c) => c.id === view);

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-hairline">
        {view === "all" ? (
          <>
            <button onClick={() => window.history.back()} className="p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-[17px]">Saved</h1>
          </>
        ) : (
          <>
            <button onClick={() => setView("all")} className="p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <h1 className="font-bold text-[17px]">{activeCollection?.name}</h1>
            </div>
          </>
        )}
      </div>

      {view === "all" ? (
        <>
          {/* Collections row */}
          <div className="flex gap-3 px-4 pt-4 pb-1 overflow-x-auto no-scrollbar">
            <button className="flex flex-col items-center gap-1.5 shrink-0 w-20">
              <div className="w-20 h-20 rounded-xl bg-surface border border-dashed border-hairline flex items-center justify-center">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-semibold text-center">New collection</span>
            </button>
            {COLLECTIONS.map((c) => (
              <button key={c.id} onClick={() => setView(c.id)} className="flex flex-col items-center gap-1.5 shrink-0 w-20">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface relative">
                  <img src={c.cover} alt={c.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <Lock className="absolute top-1.5 left-1.5 w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-center truncate w-full">{c.name}</span>
              </button>
            ))}
          </div>

          <div className="px-4 pt-4 pb-2">
            <p className="text-[13px] font-semibold text-muted-foreground">All Posts</p>
          </div>

          {/* All saved grid */}
          <div className="grid grid-cols-3 gap-0.5">
            {savedItems.map((item) => (
              <Link key={item.id} to="/discover/pin/$id" params={{ id: item.id }} className="aspect-square bg-surface relative group block overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 pt-0.5">
          {savedItems.slice(0, activeCollection?.count ?? 0).map((item) => (
            <Link key={item.id} to="/discover/pin/$id" params={{ id: item.id }} className="aspect-square bg-surface relative group block overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
