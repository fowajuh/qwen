import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { Check, MessageCircle, Share2, Bookmark, Heart, Plus, X, Link as LinkIcon, Flag } from "lucide-react";
import { HomeTopTabs } from "@/components/home/home-nav";

export const Route = createFileRoute("/home/")({
  head: () => ({
    meta: [
      { title: "Home — Nexa" },
      { name: "description", content: "The living feed of local commerce." },
    ],
  }),
  component: HomePage,
});

/* -------------------- DATA -------------------- */
type ContentItem = {
  slug: string;
  business: string;
  type: string;
  title: string;
  sub: string;
  tone: "warm" | "sand" | "ember" | "cool";
  likes: number;
  saves: number;
  comments: number;
  trust: number;
  sound: string;
};

const CONTENT: ContentItem[] = [
  { slug: "kori", business: "Kori Hair Studio", type: "Story", title: "New autumn palette just arrived", sub: "Warm tones, editorial cuts, Tuesday mornings.", tone: "warm", likes: 847, saves: 234, comments: 41, trust: 98, sound: "Original sound - Kori Hair Studio" },
  { slug: "ostro", business: "Ostro Coffee Bar", type: "Behind-scenes", title: "Behind the counter at 5am", sub: "Before the city wakes up, we're already working.", tone: "sand", likes: 1203, saves: 445, comments: 96, trust: 93, sound: "Original sound - Ostro Coffee Bar" },
  { slug: "atelier", business: "Atelier Fleur", type: "Tutorial", title: "How to arrange peonies like a pro", sub: "Hudson Valley flowers. No filler. Just petals.", tone: "warm", likes: 2891, saves: 1102, comments: 210, trust: 95, sound: "Original sound - Atelier Fleur" },
  { slug: "mira", business: "Mira Yoga", type: "Live", title: "Sunrise flow — join now", sub: "Roof deck, 6:30am. 4 spots remaining.", tone: "sand", likes: 432, saves: 98, comments: 18, trust: 92, sound: "Live audio - Mira Yoga" },
  { slug: "north-fork", business: "North Fork Plumbing", type: "Video", title: "Tonight's emergency call, documented", sub: "Flatbush. Burst pipe. 6-minute response.", tone: "ember", likes: 3241, saves: 892, comments: 154, trust: 94, sound: "Original sound - North Fork Plumbing" },
  { slug: "union", business: "Union Bike Co.", type: "Story", title: "247 bikes tuned this week — a record", sub: "Carbon, steel, titanium — we do it all.", tone: "cool", likes: 564, saves: 187, comments: 27, trust: 91, sound: "Original sound - Union Bike Co." },
  { slug: "halden", business: "Halden Dental", type: "Tutorial", title: "What your dentist is actually checking for", sub: "23 years of gentle care. Same-day emergencies.", tone: "cool", likes: 1876, saves: 743, comments: 133, trust: 96, sound: "Original sound - Halden Dental" },
  { slug: "sabor", business: "Sabor Bakery", type: "Behind-scenes", title: "5am proofing. No shortcuts.", sub: "Everything baked fresh. The croissant queue forms at 6:45.", tone: "ember", likes: 4210, saves: 1567, comments: 302, trust: 97, sound: "Original sound - Sabor Bakery" },
];

const MOCK_COMMENTS: Record<string, string[]> = {
  kori: ["Love this autumn palette.", "Booking for Tuesday!"],
  ostro: ["5am respect", "Best cortado in the city"],
  atelier: ["Teach me your ways.", "Saved for the wedding"],
  mira: ["On my way!", "Is there a waitlist?"],
  "north-fork": ["6 minutes is wild", "Saved your number"],
  union: ["247 in a week?!", "Bringing my bike in Monday"],
  halden: ["Needed to hear this", "Booking a cleaning"],
  sabor: ["The croissant queue is real", "Worth the wait every time"],
};

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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Global interactions state
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [following, setFollowing] = useState<Record<number, boolean>>({});

  // Sheets state
  const [activeSheet, setActiveSheet] = useState<"comments" | "share" | null>(null);
  const [sheetItemIndex, setSheetItemIndex] = useState<number>(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollPosition = el.scrollTop;
    const itemHeight = el.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const toggleLike = (i: number) => setLiked((l) => ({ ...l, [i]: !l[i] }));
  const toggleSave = (i: number) => setSaved((s) => ({ ...s, [i]: !s[i] }));
  const toggleFollow = (i: number) => setFollowing((f) => ({ ...f, [i]: !f[i] }));

  const openComments = (i: number) => { setSheetItemIndex(i); setActiveSheet("comments"); };
  const openShare = (i: number) => { setSheetItemIndex(i); setActiveSheet("share"); };

  return (
    <div className="relative w-full h-[100dvh] bg-black text-white overflow-hidden">
      <HomeTopTabs />

      {/* Full-bleed snap scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory no-scrollbar"
      >
        {CONTENT.map((item, i) => (
          <FeedItem
            key={item.slug}
            item={item}
            index={i}
            isActive={i === activeIndex}
            isLiked={!!liked[i]}
            isSaved={!!saved[i]}
            isFollowing={!!following[i]}
            onLike={() => toggleLike(i)}
            onSave={() => toggleSave(i)}
            onFollow={() => toggleFollow(i)}
            onComment={() => openComments(i)}
            onShare={() => openShare(i)}
          />
        ))}
      </div>

      {/* Bottom Sheets */}
      <AnimatePresence>
        {activeSheet === "comments" && (
          <CommentsSheet
            item={CONTENT[sheetItemIndex]}
            onClose={() => setActiveSheet(null)}
          />
        )}
        {activeSheet === "share" && (
          <ShareSheet
            item={CONTENT[sheetItemIndex]}
            onClose={() => setActiveSheet(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- FEED ITEM -------------------- */
function FeedItem({
  item,
  index,
  isActive,
  isLiked,
  isSaved,
  isFollowing,
  onLike,
  onSave,
  onFollow,
  onComment,
  onShare,
}: {
  item: ContentItem;
  index: number;
  isActive: boolean;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onComment: () => void;
  onShare: () => void;
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
    <div
      onClick={handleTap}
      className="w-full h-[100dvh] snap-start relative bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Background Gradient / Video mock */}
      <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[item.tone]} opacity-80`} />
      <div className="absolute inset-0 bg-black/20" />

      {/* Double-tap-to-like heart burst */}
      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ scale: 0, opacity: 0.9, rotate: -15 }}
            animate={{ scale: 1.15, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
          >
            <Heart size={120} fill="#EA4335" stroke="#EA4335" strokeWidth={0} className="drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col justify-end pb-[calc(var(--bottom-nav-height)+2rem)] px-4 pointer-events-none">
        
        {/* Play/Pause indicator would go here if it was real video */}

        <div className="w-full flex items-end justify-between">
          {/* Left Info Area */}
          <div className="flex-1 pr-12 pb-2 pointer-events-auto">
            <Link to={`/business/${item.slug}`} className="inline-block font-bold text-[17px] mb-2 hover:underline">
              @{item.slug}
            </Link>
            
            <p className="text-[15px] leading-snug mb-2 font-medium">
              {item.title} <span className="font-normal opacity-90">{item.sub}</span>
            </p>
            
            <p className="text-[14px] font-bold mb-3">
              #localbusiness #brooklyn #{item.type.toLowerCase()}
            </p>
            
            <button onClick={(e) => { e.currentTarget.innerText = e.currentTarget.innerText === "See translation" ? "Original text" : "See translation"; }} className="text-[13px] font-bold opacity-80 mb-4 hover:opacity-100 flex items-center gap-1">
              See translation
            </button>

            <div className="flex items-center gap-2 text-[14px] font-medium opacity-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              <span>{item.sound}</span>
            </div>
          </div>

          {/* Right Action Rail */}
          <div className="flex flex-col items-center gap-5 pb-4 pointer-events-auto">
            {/* Avatar & Follow */}
            <div className="relative mb-2">
              <Link to={`/business/${item.slug}`}>
                <div className="w-[50px] h-[50px] rounded-full border-[1.5px] border-white/50 bg-black overflow-hidden relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[item.tone]}`} />
                  {/* Mock Initial */}
                  <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-xl mix-blend-overlay text-white">{item.business.charAt(0)}</div>
                </div>
              </Link>
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2">
                <AnimatePresence>
                  {!isFollowing && (
                    <motion.button
                      key="follow-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 1.35, rotate: 20 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      onClick={onFollow}
                      className="w-6 h-6 rounded-full bg-[#EA4335] text-white flex items-center justify-center"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Like */}
            <button onClick={onLike} className="flex flex-col items-center gap-1.5 group">
              <motion.div
                whileTap={{ scale: 0.75 }}
                transition={{ type: "spring", stiffness: 450, damping: 11 }}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md"
              >
                <Heart size={26} fill={isLiked ? "#EA4335" : "rgba(0,0,0,0.5)"} stroke={isLiked ? "#EA4335" : "white"} strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.likes + (isLiked ? 1 : 0))}</span>
            </button>

            {/* Comment */}
            <button onClick={onComment} className="flex flex-col items-center gap-1.5 group">
              <motion.div
                whileTap={{ scale: 0.75 }}
                transition={{ type: "spring", stiffness: 450, damping: 11 }}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md"
              >
                <MessageCircle size={26} fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.comments)}</span>
            </button>

            {/* Save */}
            <button onClick={onSave} className="flex flex-col items-center gap-1.5 group">
              <motion.div
                whileTap={{ scale: 0.75 }}
                transition={{ type: "spring", stiffness: 450, damping: 11 }}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md"
              >
                <Bookmark size={26} fill={isSaved ? "#FABB05" : "rgba(0,0,0,0.5)"} stroke={isSaved ? "#FABB05" : "white"} strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">{formatCount(item.saves + (isSaved ? 1 : 0))}</span>
            </button>

            {/* Share */}
            <button onClick={onShare} className="flex flex-col items-center gap-1.5 group">
              <motion.div
                whileTap={{ scale: 0.75 }}
                transition={{ type: "spring", stiffness: 450, damping: 11 }}
                className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md"
              >
                <Share2 size={26} fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth={1.5} />
              </motion.div>
              <span className="text-[13px] font-bold text-white shadow-sm">Share</span>
            </button>
            
            {/* Pill */}
            <button onClick={(e) => { e.currentTarget.innerText = e.currentTarget.innerText === "Full screen" ? "Exit full screen" : "Full screen"; }} className="mt-4 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs font-bold whitespace-nowrap transition-all active:scale-95">
              Full screen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- COMMENTS SHEET -------------------- */
function CommentsSheet({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const comments = MOCK_COMMENTS[item.slug] || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[100]"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white text-black rounded-t-3xl z-[101] flex flex-col"
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="w-8" /> {/* Spacer */}
          <h3 className="font-bold text-[15px]">{formatCount(item.comments)} comments</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
            <X size={18} strokeWidth={2.5} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
          {comments.map((text, i) => (
            <div key={i} className="flex gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-[13px] text-gray-500">user{Math.floor(Math.random() * 10000)}</span>
                  {i === 0 && (
                    <span className="text-[10px] font-bold bg-[#EA4335]/10 text-[#EA4335] px-1.5 py-0.5 rounded">Creator</span>
                  )}
                </div>
                <p className="text-[14px] leading-snug">{text}</p>
                <div className="flex items-center gap-4 mt-2 text-[12px] text-gray-500 font-medium">
                  <span>1d</span>
                  <button onClick={(e) => { const el = e.currentTarget; el.innerText = "Replying..."; setTimeout(() => el.innerText = "Reply", 1000) }}>Reply</button>
                </div>
              </div>
              <button onClick={(e) => { 
                const btn = e.currentTarget; 
                const heart = btn.querySelector('svg');
                const isLiked = heart?.getAttribute('fill') === 'currentColor';
                if (heart) {
                  heart.setAttribute('fill', isLiked ? 'none' : 'currentColor');
                  heart.classList.toggle('text-red-500');
                }
              }} className="flex flex-col items-center gap-1 text-gray-400 self-start active:scale-90 transition-transform">
                <Heart size={16} />
                <span className="text-[11px]">{Math.floor(Math.random() * 50)}</span>
              </button>
            </div>
          ))}
          
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mt-4 mb-4">
             <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-1">
               <Check size={16} strokeWidth={3} />
               Sentiment is positive
             </div>
             <p className="text-xs text-gray-500">Based on recent interactions with this business.</p>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 bg-white bottom-safe">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
            <div className="flex-1 relative">
              <input type="text" placeholder="Add comment..." className="w-full bg-gray-100 rounded-full h-10 px-4 text-[14px] outline-none" onKeyDown={(e) => { if(e.key === 'Enter') e.currentTarget.value = '' }} />
              <button onClick={(e) => { const input = e.currentTarget.previousElementSibling; if(input) input.value = ''; }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EA4335] font-bold text-[14px] active:scale-95 transition-transform">
                Post
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* -------------------- SHARE SHEET -------------------- */
function ShareSheet({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  const contacts = [
    { name: "Sarah", color: "bg-blue-500" },
    { name: "Mike", color: "bg-green-500" },
    { name: "Elena", color: "bg-purple-500" },
    { name: "David", color: "bg-orange-500" },
    { name: "Alex", color: "bg-pink-500" },
  ];

  const actions = [
    { icon: Share2, label: "Repost" },
    { icon: LinkIcon, label: "Copy link" },
    { icon: MessageCircle, label: "SMS" },
    { icon: Bookmark, label: "Save" },
    { icon: Flag, label: "Report" },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-[100]"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-white text-black rounded-t-3xl z-[101] flex flex-col bottom-safe pb-4"
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />
        
        <div className="px-4 mb-6">
          <h3 className="font-bold text-[15px] mb-4 text-center">Share to</h3>
          
          {/* Contacts Row */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 mb-4">
            {contacts.map((c) => (
              <button key={c.name} onClick={onClose} className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform">
                <div className={`w-14 h-14 rounded-full ${c.color} text-white flex items-center justify-center font-bold text-xl`}>
                  {c.name[0]}
                </div>
                <span className="text-[12px] font-medium text-gray-700">{c.name}</span>
              </button>
            ))}
          </div>

          {/* Actions Row */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
            {actions.map((a) => (
              <button key={a.label} onClick={onClose} className="flex flex-col items-center gap-2 min-w-[64px] active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center">
                  <a.icon size={24} strokeWidth={1.5} />
                </div>
                <span className="text-[12px] font-medium text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <button onClick={onClose} className="w-full py-4 bg-gray-100 rounded-xl font-bold text-[15px]">
            Cancel
          </button>
        </div>
      </motion.div>
    </>
  );
}

