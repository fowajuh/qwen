import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/profile/followers")({
  component: ProfileFollowers,
});

const FOLLOWERS = [
  { id: "u1", username: "mia.travel", name: "Mia Chen", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop", followsYou: true },
  { id: "u2", username: "karim.v", name: "Karim Vasquez", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop", followsYou: true },
  { id: "u3", username: "lena.m", name: "Lena Marchetti", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop", followsYou: false },
  { id: "u4", username: "sheblov.design", name: "Sheblov Design", avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&auto=format&fit=crop", followsYou: true },
  { id: "u5", username: "jiho.k", name: "Ji-ho Kang", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop", followsYou: false },
  { id: "u6", username: "coach.ayo", name: "Coach Ayo", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop", followsYou: true },
  { id: "u7", username: "home.edit", name: "Home Edit", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop", followsYou: true },
  { id: "u8", username: "archi.lab", name: "Archi Lab", avatar: "https://images.unsplash.com/photo-1546961342-ea5f60b193cb?w=150&auto=format&fit=crop", followsYou: false },
];

function ProfileFollowers() {
  const [query, setQuery] = useState("");
  const [removed, setRemoved] = useState<string[]>([]);

  const results = useMemo(
    () =>
      FOLLOWERS.filter(
        (u) => !removed.includes(u.id) && (u.username.toLowerCase().includes(query.toLowerCase()) || u.name.toLowerCase().includes(query.toLowerCase()))
      ),
    [query, removed]
  );

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-center relative border-b border-hairline">
        <button onClick={() => window.history.back()} className="absolute left-4 p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">Followers</h1>
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
        {results.map((u) => (
          <div key={u.id} className="flex items-center gap-3 px-2 py-2.5">
            <Link to="/profile/user/$id" params={{ id: u.username }} className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-surface">
              <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
            </Link>
            <Link to="/profile/user/$id" params={{ id: u.username }} className="flex-1 min-w-0">
              <p className="font-bold text-[14px] truncate">{u.username}</p>
              <p className="text-[13px] text-muted-foreground truncate">{u.name}{u.followsYou ? " · Follows you" : ""}</p>
            </Link>
            <button
              onClick={() => setRemoved((r) => [...r, u.id])}
              className="px-4 py-1.5 rounded-lg bg-surface border border-hairline font-semibold text-[13px] shrink-0"
            >
              Remove
            </button>
          </div>
        ))}
        {results.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-12">No followers match "{query}"</p>
        )}
      </div>
    </div>
  );
}
