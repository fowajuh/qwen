import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Heart, MessageCircle, Send, MoreHorizontal, Volume2, Play } from "lucide-react";
import { useState } from "react";
import { MY_POSTS } from "./index";

export const Route = createFileRoute("/profile/reels/$id")({
  component: ProfileReelsId,
});

function ProfileReelsId() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const reels = MY_POSTS.filter((p) => p.type === "video");
  const activeIndex = Math.max(reels.findIndex((r) => r.id === id), 0);
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(true);
  const reel = reels[activeIndex] || reels[0];

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 w-full h-full">
        <img src={reel.image} alt="" className="w-full h-full object-cover" />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white" fill="white" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </button>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 pt-safe pointer-events-none">
        <button onClick={() => navigate({ to: "/profile" })} className="pointer-events-auto p-2 -ml-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white font-bold text-[15px]">Reels</span>
        <button className="pointer-events-auto p-2 -mr-2 rounded-full hover:bg-white/10">
          <Volume2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Right action rail */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-6 z-10">
        <button onClick={() => setLiked((l) => !l)} className="flex flex-col items-center gap-1">
          <Heart className="w-7 h-7 transition-colors" fill={liked ? "#e11d48" : "white"} color={liked ? "#e11d48" : "white"} />
          <span className="text-white text-[11px] font-semibold">{reel.views + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-semibold">12</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Send className="w-7 h-7 text-white" />
          <span className="text-white text-[11px] font-semibold">Share</span>
        </button>
        <button><MoreHorizontal className="w-6 h-6 text-white" /></button>
        <div className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white mt-1 bg-white flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="black">
            <path d="M12 1 L14.2 8.4 L21.5 9.5 L16.2 14.6 L17.8 22 L12 18.2 L6.2 22 L7.8 14.6 L2.5 9.5 L9.8 8.4 Z" />
          </svg>
        </div>
      </div>

      {/* Bottom caption */}
      <div className="absolute left-0 right-16 bottom-6 px-4 z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black">
              <path d="M12 1 L14.2 8.4 L21.5 9.5 L16.2 14.6 L17.8 22 L12 18.2 L6.2 22 L7.8 14.6 L2.5 9.5 L9.8 8.4 Z" />
            </svg>
          </div>
          <span className="text-white font-bold text-[14px]">etoil.vd</span>
          <button className="text-white text-[13px] font-bold border border-white/70 rounded-md px-2.5 py-0.5">Follow</button>
        </div>
        <p className="text-white text-[13px] leading-snug line-clamp-2">{reel.caption}</p>
      </div>
    </div>
  );
}
