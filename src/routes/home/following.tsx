import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Bookmark, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, PanInfo } from "motion/react";
import { HomeTopTabs } from "@/components/home/home-nav";

export const Route = createFileRoute("/home/following")({
  component: HomeFollowing,
});

const FOLLOWING_FEED = [
  {
    id: "f1",
    username: "alex_creates",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
    video: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1080&auto=format&fit=crop",
    caption: "new tutorial out now 🎨 #design #uidesign #creative",
    likes: 2847,
    comments: 134,
    saves: 891,
    shares: 47,
    audioName: "Original audio – alex_creates",
  },
  {
    id: "f2",
    username: "travel_with_mia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    video: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1080&auto=format&fit=crop",
    caption: "Santorini in golden hour 🌅 #travel #greece #wanderlust",
    likes: 18320,
    comments: 892,
    saves: 4210,
    shares: 315,
    audioName: "golden hour vibes – dj.sunset",
  },
  {
    id: "f3",
    username: "chef_marcus",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop",
    video: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&auto=format&fit=crop",
    caption: "5-minute pasta that will change your life 🍝 #cooking #foodtok #recipe",
    likes: 52190,
    comments: 2840,
    saves: 19400,
    shares: 8230,
    audioName: "cooking vibes lo-fi",
  },
];

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function HomeFollowing() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef(0);

  const item = FOLLOWING_FEED[currentIndex];

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
    if (info.offset.y < -60 && currentIndex < FOLLOWING_FEED.length - 1) setCurrentIndex((i) => i + 1);
    if (info.offset.y > 60 && currentIndex > 0) setCurrentIndex((i) => i - 1);
    if (info.offset.x < -60) {
      navigate({ to: "/creator/$id", params: { id: item.username } });
    }
  };

  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden relative">
      <HomeTopTabs />

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Double-tap heart burst */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0.3, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-28 h-28 text-white" fill="white" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right action rail */}
          <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
            <Link to="/creator/$id" params={{ id: item.username }} className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                <img src={item.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                <span className="text-white text-[14px] font-bold leading-none">+</span>
              </div>
            </Link>

            {[
              { icon: Heart, count: item.likes + (likedIds.includes(item.id) ? 1 : 0), filled: likedIds.includes(item.id), color: likedIds.includes(item.id) ? "#e11d48" : "white", action: () => setLikedIds((p) => p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]) },
              { icon: MessageCircle, count: item.comments, filled: false, color: "white", action: () => {} },
              { icon: Bookmark, count: item.saves + (savedIds.includes(item.id) ? 1 : 0), filled: savedIds.includes(item.id), color: savedIds.includes(item.id) ? "#facc15" : "white", action: () => setSavedIds((p) => p.includes(item.id) ? p.filter((x) => x !== item.id) : [...p, item.id]) },
              { icon: Share2, count: item.shares, filled: false, color: "white", action: () => {} },
            ].map(({ icon: Icon, count, filled, color, action }, i) => (
              <button key={i} onClick={action} className="flex flex-col items-center gap-1">
                <motion.div whileTap={{ scale: 0.75 }}>
                  <Icon className="w-8 h-8 drop-shadow-md" color={color} fill={filled ? color : "none"} strokeWidth={filled ? 0 : 2} />
                </motion.div>
                <span className="text-white text-[13px] font-semibold drop-shadow-sm">{formatCount(count)}</span>
              </button>
            ))}
          </div>

          {/* Bottom left info */}
          <div className="absolute bottom-20 left-4 right-20">
            <Link to="/creator/$id" params={{ id: item.username }} className="block">
              <div className="font-bold text-white text-[15px] mb-1">@{item.username}</div>
            </Link>
            <p className="text-white text-[14px] leading-snug line-clamp-2">{item.caption}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-4 h-4 rounded-full bg-white/20 border border-white/40 animate-spin-slow" />
              <span className="text-white text-[13px] truncate max-w-[200px]">{item.audioName}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
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

      {/* Bottom Nav */}
      <div className="absolute bottom-0 inset-x-0 h-16 bg-black/20 backdrop-blur-sm z-20" />
    </div>
  );
}
