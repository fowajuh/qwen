import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/profile/following")({
  component: ProfileFollowing,
});

const FOLLOWING = [
  { id: "u1", username: "alex.creates", name: "Alex Creates", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop" },
  { id: "u2", username: "studio.fleur", name: "Studio Fleur", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop" },
  { id: "u3", username: "sheblov.design", name: "Sheblov Design", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop" },
  { id: "u4", username: "la.maison", name: "La Maison", avatar: "https://images.unsplash.com/photo-1546961342-ea5f60b193cb?w=150&auto=format&fit=crop" },
  { id: "u5", username: "ui.studio", name: "UI Studio", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop" },
  { id: "u6", username: "threads.official", name: "Threads", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop" },
];

function ProfileFollowing() {
  const [query, setQuery] = useState("");
  const [unfollowed, setUnfollowed] = useState<string[]>([]);

  const results = useMemo(
    () => FOLLOWING.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-center relative border-b border-hairline">
        <button onClick={() => window.history.back()} className="absolute left-4 p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">Following</h1>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
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

      {/* List */}
      <div className="px-2 pt-2">
        {results.map((u) => {
          const isFollowing = !unfollowed.includes(u.id);
          return (
            <div key={u.id} className="flex items-center gap-3 px-2 py-2.5">
              <Link to="/profile/user/$id" params={{ id: u.username }} className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface">
                <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
              </Link>
              <Link to="/profile/user/$id" params={{ id: u.username }} className="flex-1 min-w-0">
                <p className="font-bold text-[14px] truncate">{u.username}</p>
                <p className="text-[13px] text-muted-foreground truncate">{u.name}</p>
              </Link>
              <button
                onClick={() => setUnfollowed((r) => (isFollowing ? [...r, u.id] : r.filter((id) => id !== u.id)))}
                className={`px-4 py-1.5 rounded-lg font-semibold text-[13px] shrink-0 transition-colors ${
                  isFollowing ? "bg-surface border border-hairline text-foreground" : "bg-foreground text-background"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
        {results.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-12">No one matches "{query}"</p>
        )}
      </div>
    </div>
  );
}
