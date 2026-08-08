import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/related/$id")({
  component: DiscoverRelatedId,
});

function DiscoverRelatedId() {
  const { id } = Route.useParams();
  const source = DISCOVER_FEED.find((p) => p.id === id) || DISCOVER_FEED[0];

  // Visually related pins — same category first, then everything else
  const related = [
    ...DISCOVER_FEED.filter((p) => p.id !== source.id && p.category === source.category),
    ...DISCOVER_FEED.filter((p) => p.id !== source.id && p.category !== source.category),
  ];

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)] animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-hairline">
        <div className="flex-1 flex items-center gap-3 md:max-w-[900px] md:mx-auto">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors shrink-0">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-hairline">
              <img src={source.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[12px] font-semibold text-muted-foreground">Visually similar</span>
              </div>
              <p className="text-[14px] font-bold truncate">{source.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related grid */}
      <div className="px-3 py-4 md:max-w-[900px] md:mx-auto">
        <div style={{ columns: "2 160px", columnGap: "12px" }}>
          {related.map((p, i) => (
            <div key={p.id} className="mb-3 break-inside-avoid">
              <Link to="/discover/pin/$id" params={{ id: p.id }} className="block group">
                <div className="w-full rounded-2xl overflow-hidden bg-surface relative" style={{ aspectRatio: 1 / p.aspect }}>
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {i < 2 && (
                    <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      Close match
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-semibold mt-1.5 px-1 line-clamp-2 leading-snug">{p.title}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
