import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MoreHorizontal, Heart, MessageCircle, Send, Bookmark, Copy } from "lucide-react";
import { useState } from "react";
import { MY_POSTS } from "./index";

export const Route = createFileRoute("/profile/post/$id")({
  component: ProfilePostId,
});

function ProfilePostId() {
  const { id } = Route.useParams();
  const post = MY_POSTS.find((p) => p.id === id) || MY_POSTS[0];
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const otherPosts = MY_POSTS.filter((p) => p.id !== post.id);

  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-hairline">
        <button onClick={() => window.history.back()} className="p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
              <path d="M12 1 L14.2 8.4 L21.5 9.5 L16.2 14.6 L17.8 22 L12 18.2 L6.2 22 L7.8 14.6 L2.5 9.5 L9.8 8.4 Z" />
            </svg>
          </div>
          <span className="font-bold text-[14px] truncate">etoil.vd</span>
        </div>
        <button className="p-1 rounded-full hover:bg-surface"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-surface relative">
        {post.isBlank ? (
          <div className="w-full h-full bg-white flex items-center justify-center px-8">
            <span className="text-black text-[16px] font-bold tracking-widest text-center leading-tight">{post.caption}</span>
          </div>
        ) : (
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        )}
        {post.type === "carousel" && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <Copy className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-[11px] font-semibold">1/3</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setLiked((l) => !l)}>
            <Heart className="w-[26px] h-[26px] transition-colors" fill={liked ? "#e11d48" : "none"} color={liked ? "#e11d48" : "currentColor"} />
          </button>
          <button><MessageCircle className="w-[26px] h-[26px]" /></button>
          <button><Send className="w-[26px] h-[26px]" /></button>
        </div>
        <button onClick={() => setSaved((s) => !s)}>
          <Bookmark className="w-[26px] h-[26px] transition-colors" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Meta */}
      <div className="px-4 pt-2 space-y-1">
        <p className="font-bold text-[14px]">{(post.views + (liked ? 43 : 42)).toLocaleString()} likes</p>
        <p className="text-[14px] leading-snug">
          <span className="font-bold">etoil.vd</span> {post.caption}
        </p>
        <button className="text-[13px] text-muted-foreground">View all comments</button>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide pt-1">2 days ago</p>
      </div>

      {/* More posts */}
      <div className="mt-6 border-t border-hairline pt-4">
        <p className="px-4 font-bold text-[14px] mb-2">More from etoil.vd</p>
        <div className="grid grid-cols-3 gap-0.5">
          {otherPosts.map((p) => (
            <Link key={p.id} to={p.type === "video" ? "/profile/reels/$id" : "/profile/post/$id"} params={{ id: p.id }} className="aspect-square bg-surface relative block overflow-hidden">
              {p.isBlank ? (
                <div className="w-full h-full bg-white flex items-center justify-center px-2">
                  <span className="text-black text-[8px] font-bold tracking-widest text-center">{p.caption}</span>
                </div>
              ) : (
                <img src={p.image} alt="" className="w-full h-full object-cover" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
