import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MoreHorizontal, Share, Plus, Grid, LayoutList } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/board/$id")({
  component: BoardDetail,
});

function BoardDetail() {
  const { id } = Route.useParams();
  const [view, setView] = useState<"grid" | "masonry">("masonry");

  const boardName = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const pins = DISCOVER_FEED; // Mock data

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-surface"><Share className="w-5 h-5 text-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-surface"><MoreHorizontal className="w-6 h-6 text-foreground" /></button>
        </div>
      </div>

      {/* Board Info */}
      <div className="px-4 py-6 text-center">
        <h1 className="text-[30px] font-bold mb-2 leading-tight">{boardName}</h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface">
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold text-[14px]">2 collaborators · {pins.length} pins</span>
        </div>

        <div className="flex justify-center gap-3">
          <button className="px-6 py-3 bg-surface rounded-full font-bold text-[15px] flex items-center gap-2">
            <Plus className="w-5 h-5" /> Add
          </button>
          <button className="px-6 py-3 bg-surface rounded-full font-bold text-[15px] flex items-center gap-2">
            Organize
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center px-4 py-4 sticky top-[60px] z-30 bg-background/95 backdrop-blur-md border-y border-hairline">
        <span className="font-bold text-[16px]">{pins.length} Pins</span>
        <button
          onClick={() => setView((v) => (v === "masonry" ? "grid" : "masonry"))}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center"
        >
          {view === "masonry" ? <LayoutList className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
        </button>
      </div>

      {/* Grid */}
      <div className={`md:max-w-[900px] md:mx-auto ${view === "masonry" ? "columns-2 md:columns-3 gap-4 px-4 py-6" : "grid grid-cols-2 md:grid-cols-3 gap-4 px-4 py-6"}`}>
        {pins.map((p) => (
          <Link key={p.id} to="/discover/pin/$id" params={{ id: p.id }} className="block mb-4 break-inside-avoid group">
            <div className="relative rounded-2xl overflow-hidden bg-surface mb-2">
              <img
                src={p.image}
                alt={p.title}
                className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${view === "grid" ? "aspect-square" : "h-auto"}`}
              />
            </div>
            <div className="font-bold text-[14px] truncate leading-tight px-1">{p.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
