import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Search, Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "motion/react";

export const Route = createFileRoute("/creator/video/$id")({
  component: CreatorVideoPlayer,
});

const FEED = [
  {
    id: "v1",
    username: "alex_creates",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
    video: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1080&auto=format&fit=crop",
    caption: "Just dropped a new tutorial 🎨 #design #creative",
    likes: 2847,
    comments: 134,
    saves: 891,
    shares: 47,
    audioName: "Original audio – alex_creates",
  },
  {
    id: "v2",
    username: "alex_creates",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
    video: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1080&auto=format&fit=crop",
    caption: "Behind the scenes of my latest project 🎬",
    likes: 5210,
    comments: 420,
    saves: 1200,
    shares: 89,
    audioName: "lofi hip hop - beats to relax/study to",
  }
];

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function CreatorVideoPlayer() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const item = FEED[currentIndex];

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!likedIds.includes(item.id)) {
        setLikedIds((p) => [...p, item.id]);
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 900);
      }
    }
    lastTap.current = now;
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -60 && currentIndex < FEED.length - 1) setCurrentIndex((i) => i + 1);
    if (info.offset.y > 60 && currentIndex > 0) setCurrentIndex((i) => i - 1);
    // Swipe right to go back to profile
    if (info.offset.x > 60) {
      window.history.back();
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative">
      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe pb-2 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={() => window.history.back()} className="p-2 text-white hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-white text-[15px] font-bold">Videos</div>
        <button onClick={() => navigate({ to: "/search" })} className="p-2 text-white hover:bg-white/10 rounded-full">
          <Search className="w-6 h-6" />
        </button>
      </div>

      {/* Feed */}
      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          drag
          dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          onClick={handleDoubleTap}
        >
          {/* Video BG */}
          <img src={item.video} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Double-tap heart burst */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-28 h-28 text-white" fill="white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right action rail */}
          <div className="absolute right-3 bottom-10 flex flex-col items-center gap-6 z-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                <img src={item.avatar} alt="" className="w-full h-full object-cover" />
              </div>
            </div>

            {[
              { icon: Heart, count: item.likes + (likedIds.includes(item.id) ? 1 : 0), filled: likedIds.includes(item.id), color: likedIds.includes(item.id) ? "#e11d48" : "white", action: () => setLikedIds((p) => p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]) },
              { icon: MessageCircle, count: item.comments, filled: false, color: "white", action: () => navigate({ to: "/home/comments/$id", params: { id: item.id } }) },
              { icon: Bookmark, count: item.saves + (savedIds.includes(item.id) ? 1 : 0), filled: savedIds.includes(item.id), color: savedIds.includes(item.id) ? "#facc15" : "white", action: () => setSavedIds((p) => p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]) },
              { icon: Share2, count: item.shares, filled: false, color: "white", action: () => {} },
            ].map(({ icon: Icon, count, filled, color, action }, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); action(); }} className="flex flex-col items-center gap-1">
                <motion.div whileTap={{ scale: 0.75 }}>
                  <Icon className="w-8 h-8 drop-shadow-md" color={color} fill={filled ? color : "none"} strokeWidth={filled ? 0 : 2} />
                </motion.div>
                <span className="text-white text-[13px] font-semibold drop-shadow-sm">{formatCount(count)}</span>
              </button>
            ))}
          </div>

          {/* Bottom left info */}
          <div className="absolute bottom-10 left-4 right-20 z-20">
            <div className="font-bold text-white text-[15px] mb-1">@{item.username}</div>
            <p className="text-white text-[14px] leading-snug line-clamp-2">{item.caption}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40 animate-spin-slow" />
              <span className="text-white text-[13px] truncate max-w-[200px]">{item.audioName}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <motion.div
              className="h-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 15, ease: "linear" }}
              key={item.id}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
