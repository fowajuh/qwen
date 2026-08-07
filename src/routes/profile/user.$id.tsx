import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MoreHorizontal, Grid3x3, Clapperboard, UserSquare2, Play, Eye } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED } from "../discover/index";

export const Route = createFileRoute("/profile/user/$id")({
  component: ProfileUserId,
});

function ProfileUserId() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");

  const displayName = id.replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const posts = DISCOVER_FEED.filter((_, i) => i % 3 !== 0).slice(0, 9);

  return (
    <div className="w-full bg-background min-h-screen pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-hairline">
        <button onClick={() => window.history.back()} className="p-1 -ml-1 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="font-bold text-[16px] truncate">{id}</span>
        <button className="p-1 rounded-full hover:bg-surface"><MoreHorizontal className="w-6 h-6" /></button>
      </div>

      <div className="max-w-[800px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-20 h-20 rounded-full bg-surface shrink-0 overflow-hidden">
            <img src={DISCOVER_FEED[0]?.authorAvatar} className="w-full h-full object-cover" alt="" />
          </div>
          <div className="flex-1 flex justify-around text-center">
            <div>
              <div className="font-bold text-[17px]">{posts.length}</div>
              <div className="text-[13px] text-muted-foreground">posts</div>
            </div>
            <Link to="/profile/followers" className="block">
              <div className="font-bold text-[17px]">12.4k</div>
              <div className="text-[13px] text-muted-foreground">followers</div>
            </Link>
            <Link to="/profile/following" className="block">
              <div className="font-bold text-[17px]">312</div>
              <div className="text-[13px] text-muted-foreground">following</div>
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-[14px]">{displayName}</h2>
          <p className="text-[14px] leading-tight mt-1 text-muted-foreground">Creator · Sharing daily inspiration</p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFollowing((f) => !f)}
            className={`flex-1 font-semibold py-1.5 rounded-lg text-[14px] transition-colors ${
              following ? "bg-surface border border-hairline text-foreground" : "bg-primary text-primary-foreground"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
          <button className="flex-1 bg-surface hover:bg-foreground/5 text-foreground font-semibold py-1.5 rounded-lg text-[14px] transition-colors border border-hairline">
            Message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-hairline sticky top-[57px] bg-background z-30 max-w-[800px] mx-auto">
        {([
          { id: "posts", icon: Grid3x3 },
          { id: "reels", icon: Clapperboard },
          { id: "tagged", icon: UserSquare2 },
        ] as const).map(({ id: tabId, icon: Icon }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors ${
              activeTab === tabId ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={activeTab === tabId ? 2.2 : 1.8} />
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="max-w-[800px] mx-auto">
        {activeTab !== "tagged" ? (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((p, i) => (
              <Link key={p.id} to="/discover/pin/$id" params={{ id: p.id }} className="aspect-square bg-surface relative group block overflow-hidden">
                <img src={p.image} alt="" className="w-full h-full object-cover" />
                {i % 4 === 0 && <Play className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" fill="white" />}
                <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-white drop-shadow" fill="white" />
                  <span className="text-white text-[12px] font-semibold drop-shadow">{p.saves % 90}</span>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center px-8 py-20">
            <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
              <UserSquare2 className="w-7 h-7" />
            </div>
            <p className="font-bold text-[17px]">No tagged posts</p>
          </div>
        )}
      </div>
    </div>
  );
}
