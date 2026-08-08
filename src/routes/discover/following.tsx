import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, UserPlus } from "lucide-react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/following")({
  component: DiscoverFollowing,
});

// Creators the user already follows — a subset of authors from the feed
const FOLLOWED_AUTHORS = ["Sheblov Design", "Alex Creates", "Home Edit"];

function DiscoverFollowing() {
  const navigate = useNavigate();
  const pins = DISCOVER_FEED.filter((p) => FOLLOWED_AUTHORS.includes(p.author));
  const col0 = pins.filter((_, i) => i % 2 === 0);
  const col1 = pins.filter((_, i) => i % 2 === 1);

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)] animate-in fade-in duration-300">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-4 border-b border-hairline">
        <button onClick={() => navigate({ to: "/discover" })} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-[18px] font-bold tracking-tight">Following</h1>
      </div>

      {pins.length > 0 ? (
        <>
          {/* Followed creators row */}
          <div className="flex gap-4 px-4 py-4 overflow-x-auto no-scrollbar border-b border-hairline md:max-w-[680px] md:mx-auto">
            {FOLLOWED_AUTHORS.map((name) => {
              const pin = DISCOVER_FEED.find((p) => p.author === name);
              if (!pin) return null;
              return (
                <div key={name} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <img src={pin.authorAvatar} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-semibold text-center truncate w-full">{name.split(" ")[0]}</span>
                </div>
              );
            })}
            <Link to="/discover/search" className="flex flex-col items-center gap-1.5 shrink-0 w-16">
              <div className="w-14 h-14 rounded-full bg-surface border border-dashed border-hairline flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-semibold text-center text-muted-foreground">Find more</span>
            </Link>
          </div>

          {/* Feed */}
          <div className="flex gap-3 px-3 pt-3 md:max-w-[680px] md:mx-auto">
            <div className="flex flex-col gap-3 flex-1">
              {col0.map((pin) => (
                <Link key={pin.id} to="/discover/pin/$id" params={{ id: pin.id }} className="block group">
                  <div className="relative rounded-2xl overflow-hidden bg-surface" style={{ aspectRatio: 1 / pin.aspect }}>
                    <img src={pin.image} alt={pin.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-[13px] font-semibold mt-1.5 px-0.5 line-clamp-2">{pin.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 px-0.5">
                    <img src={pin.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-[11px] text-muted-foreground font-medium">{pin.author}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {col1.map((pin) => (
                <Link key={pin.id} to="/discover/pin/$id" params={{ id: pin.id }} className="block group">
                  <div className="relative rounded-2xl overflow-hidden bg-surface" style={{ aspectRatio: 1 / pin.aspect }}>
                    <img src={pin.image} alt={pin.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-[13px] font-semibold mt-1.5 px-0.5 line-clamp-2">{pin.title}</p>
                  <div className="flex items-center gap-1.5 mt-1 px-0.5">
                    <img src={pin.authorAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-[11px] text-muted-foreground font-medium">{pin.author}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center px-8 py-24">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
            <UserPlus className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-bold text-[16px]">Nobody to show yet</p>
          <p className="text-[13px] text-muted-foreground mt-1 max-w-[240px]">Follow creators to see their latest pins here.</p>
          <button
            onClick={() => navigate({ to: "/discover/search" })}
            className="mt-5 px-5 py-2.5 rounded-full font-bold text-[14px] bg-foreground text-background"
          >
            Find creators
          </button>
        </div>
      )}
    </div>
  );
}
