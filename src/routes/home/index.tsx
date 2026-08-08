import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { Check, MessageCircle, Share2, Bookmark, Heart, Plus, X, Link as LinkIcon, Flag } from "lucide-react";
import { HomeTopTabs } from "@/components/home/home-nav";
import { useFeed } from "@/hooks/use-real-data";
import type { ContentItem } from "@/lib/api";
import { PremiumIllustration, EmotionalIllustrations } from "@/components/ui/premium-illustration";

export const Route = createFileRoute("/home/")({
  head: () => ({
    meta: [
      { title: "Home — Nexa" },
      { name: "description", content: "The living feed of local commerce." },
    ],
  }),
  component: HomePage,
});

const GRADIENTS: Record<ContentItem["tone"], string> = {
  warm: "from-[oklch(0.38_0.1_45)] via-[oklch(0.25_0.07_50)] to-[oklch(0.14_0.03_60)]",
  cool: "from-[oklch(0.28_0.08_230)] via-[oklch(0.2_0.05_225)] to-[oklch(0.13_0.02_240)]",
  ember: "from-[oklch(0.35_0.15_25)] via-[oklch(0.22_0.1_30)] to-[oklch(0.14_0.04_40)]",
  sand: "from-[oklch(0.38_0.05_80)] via-[oklch(0.26_0.04_75)] to-[oklch(0.15_0.02_80)]",
};

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

/* -------------------- PAGE -------------------- */
function HomePage() {
  const { content, loading, error, hasLocation, liked, saved, toggleLike, toggleSave, refresh } = useFeed(20);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSheet, setActiveSheet] = useState<"comments" | "share" | null>(null);
  const [sheetItemIndex, setSheetItemIndex] = useState<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollPosition = el.scrollTop;
    const itemHeight = el.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);
    if (newIndex !== activeIndex) setActiveIndex(newIndex);
  };

  const openComments = (i: number) => { setSheetItemIndex(i); setActiveSheet("comments"); };
  const openShare = (i: number) => { setSheetItemIndex(i); setActiveSheet("share"); };

  if (loading && !hasLocation) {
    return (
      <div className="relative w-full h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="text-center px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="loading" 
              size="xl" 
              animate={true}
              alt="Loading your local feed"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto mb-4" />
            <p className="text-sm opacity-70">Loading your local feed...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="error" 
              size="xl" 
              animate={true}
              alt="Something went wrong"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold mb-2"
          >
            Unable to load feed
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm opacity-70 mb-4"
          >
            {error}
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh} 
            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm"
          >
            Try Again
          </motion.button>
        </div>
      </div>
    );
  }

  if (!hasLocation && content.length === 0) {
    return (
      <div className="relative w-full h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="mobile" 
              size="xl" 
              animate={true}
              alt="Enable location to discover nearby businesses"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold mb-2"
          >
            Enable Location
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm opacity-70 mb-4"
          >
            Allow location access to see businesses near you.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileTap={{ scale: 0.95 }}
            onClick={refresh} 
            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm"
          >
            Enable Location
          </motion.button>
        </div>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="relative w-full h-[100dvh] bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <PremiumIllustration 
              name="community" 
              size="xl" 
              animate={true}
              alt="Be the first to share"
              className="shadow-[0_20px_60px_rgba(99,102,241,0.3)]"
            />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold mb-2"
          >
            No content nearby yet
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm opacity-70"
          >
            Be the first business to share something!
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden">
      <HomeTopTabs />
      <div ref={containerRef} onScroll={handleScroll} className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory no-scrollbar">
        {content.map((item, i) => (
          <FeedItem
            key={item.id}
            item={item}
            index={i}
            isActive={i === activeIndex}
            isLiked={!!liked[item.id]}
            isSaved={!!saved[item.id]}
            onLike={() => toggleLike(item.id)}
            onSave={() => toggleSave(item.id)}
            onComment={() => openComments(i)}
            onShare={() => openShare(i)}
          />
        ))}
      </div>
      <AnimatePresence>
        {activeSheet === "comments" && <CommentsSheet item={content[sheetItemIndex]} onClose={() => setActiveSheet(null)} />}
        {activeSheet === "share" && <ShareSheet item={content[sheetItemIndex]} onClose={() => setActiveSheet(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- FEED ITEM -------------------- */
function FeedItem({ item, index, isActive, isLiked, isSaved, onLike, onSave, onComment, onShare }: {
  item: ContentItem; index: number; isActive: boolean; isLiked: boolean; isSaved: boolean;
  onLike: () => void; onSave: () => void; onComment: () => void; onShare: () => void;
}) {
  const [showBurst, setShowBurst] = useState(false);
  const lastTapRef = useRef(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) onLike();
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
    lastTapRef.current = now;
  };

  return (
    <div onClick={handleTap} className="w-full h-[100dvh] snap-start relative bg-black flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[item.tone]} opacity-80`} />
      <div className="absolute inset-0 bg-black/20" />
      <AnimatePresence>
        {showBurst && (
          <motion.div initial={{ scale: 0, opacity: 0.9, rotate: -15 }} animate={{ scale: 1.15, opacity: 1, rotate: 0 }} exit={{ scale: 1.4, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 15 }} className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <Heart size={120} fill="#EA4335" stroke="#EA4335" strokeWidth={0} className="drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 flex flex-col justify-end pb-[calc(var(--bottom-nav-height)+2rem)] px-4 pointer-events-none">
        <div className="w-full flex items-end justify-between">
          <div className="flex-1 pr-12 pb-2 pointer-events-auto">
            <Link to={`/business/${item.business_slug}`} className="inline-block font-bold text-[17px] mb-2 hover:underline">@{item.business_slug}</Link>
            <p className="text-[15px] leading-snug mb-2 font-medium">{item.title} <span className="font-normal opacity-90">{item.description}</span></p>
            <p className="text-[14px] font-bold mb-3">#localbusiness #{item.type.toLowerCase()}</p>
            <div className="flex items-center gap-2 text-[14px] font-medium opacity-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span>Original sound - {item.business_name}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 pb-4 pointer-events-auto">
            <div className="relative mb-2">
              <Link to={`/business/${item.business_slug}`}>
                <div className="w-[50px] h-[50px] rounded-full border-[1.5px] border-white/50 bg-black overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[item.tone]}`} />
                  <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl mix-blend-overlay text-white">{item.business_name.charAt(0)}</div>
                </div>
              </Link>
            </div>
            <button onClick={onLike} className="flex flex-col items-center gap-1.5 group">
              <motion.div whileTap={{ scale: 0.75 }} transition={{ type: "spring", stiffness: 450, damping: 11 }} className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md">
                <Heart size={26} fill={isLiked ? "#EA4335" : "rgba(0,0,0,0.5)"} stroke={isLiked ? "#EA4335" : "white"} strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.likes + (isLiked ? 1 : 0))}</span>
            </button>
            <button onClick={onComment} className="flex flex-col items-center gap-1.5 group">
              <motion.div whileTap={{ scale: 0.75 }} transition={{ type: "spring", stiffness: 450, damping: 11 }} className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md">
                <MessageCircle size={26} fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.comments)}</span>
            </button>
            <button onClick={onSave} className="flex flex-col items-center gap-1.5 group">
              <motion.div whileTap={{ scale: 0.75 }} transition={{ type: "spring", stiffness: 450, damping: 11 }} className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md">
                <Bookmark size={26} fill={isSaved ? "#FABB05" : "rgba(0,0,0,0.5)"} stroke={isSaved ? "#FABB05" : "white"} strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.saves + (isSaved ? 1 : 0))}</span>
            </button>
            <button onClick={onShare} className="flex flex-col items-center gap-1.5 group">
              <motion.div whileTap={{ scale: 0.75 }} transition={{ type: "spring", stiffness: 450, damping: 11 }} className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md">
                <Share2 size={26} fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- COMMENTS SHEET -------------------- */
function CommentsSheet({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[100]" />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white text-black rounded-t-3xl z-[101] flex flex-col">
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="w-8" />
          <h3 className="font-bold text-[15px]">{formatCount(item.comments)} comments</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full"><X size={18} strokeWidth={2.5} className="text-gray-600" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
          <p className="text-center text-gray-500 py-8">Comments coming soon</p>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 relative">
              <input type="text" placeholder="Add comment..." className="w-full bg-gray-100 rounded-full h-10 px-4 text-[14px] outline-none" />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EA4335] font-bold text-[14px]">Post</button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* -------------------- SHARE SHEET -------------------- */
function ShareSheet({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const actions = [{ icon: Share2, label: "Repost" }, { icon: LinkIcon, label: "Copy link" }, { icon: MessageCircle, label: "SMS" }, { icon: Bookmark, label: "Save" }, { icon: Flag, label: "Report" }];
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[100]" />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 26, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-white text-black rounded-t-3xl z-[101] flex flex-col bottom-safe pb-4">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
        <div className="px-4 mb-6">
          <h3 className="font-bold text-[15px] mb-4 text-center">Share to</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
            {actions.map((a) => (
              <button key={a.label} onClick={onClose} className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center"><a.icon size={24} strokeWidth={1.5} /></div>
                <span className="text-[12px] font-medium text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="px-4"><button onClick={onClose} className="w-full py-4 bg-gray-100 rounded-xl font-bold text-[15px]">Cancel</button></div>
      </motion.div>
    </>
  );
}
