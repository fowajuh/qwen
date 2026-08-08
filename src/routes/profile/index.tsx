import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import {
  Plus, Menu, ChevronDown, Grid3x3, Clapperboard, Repeat2, UserSquare2,
  Play, Eye, Copy, Gem, Globe, ArrowDown, X, Check, Loader2,
} from "lucide-react";
import { useMyProfile, useFollowers, useFollowing, useToggleFollow } from "@/hooks/use-profile";

export const Route = createFileRoute("/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — Nexa" },
      { name: "description", content: "Your profile, posts, and creator tools." },
    ],
  }),
  component: Profile,
});

/* ─────────────────────────── DATA ─────────────────────────── */
export interface ProfilePost {
  id: string;
  image: string;
  type: "photo" | "video" | "carousel";
  views: number;
  caption?: string;
  isBlank?: boolean; // stylized text-only post, like the reference "ÉTOILE PRESENTS" tile
}

export const MY_POSTS: ProfilePost[] = [
  { id: "post1", image: "https://images.unsplash.com/photo-1594736797933-d0c6e4f4b8d5?q=80&w=500&auto=format&fit=crop", type: "video", views: 5, caption: "my mum explaining how she already knows how to do it even though this is the first time she's mentioned it" },
  { id: "post2", image: "", type: "carousel", views: 0, isBlank: true, caption: "ÉTOILE PRESENTS" },
  { id: "post3", image: "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?q=80&w=500&auto=format&fit=crop", type: "video", views: 21, caption: "arguing about absolutely nothing for 87 minutes and suddenly the debate starts again 😭" },
  { id: "post4", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=500&auto=format&fit=crop", type: "carousel", views: 0, caption: "new drop teaser" },
  { id: "post5", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=500&auto=format&fit=crop", type: "photo", views: 12, caption: "Studio session" },
  { id: "post6", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=500&auto=format&fit=crop", type: "video", views: 9, caption: "Behind the seams" },
];

const HIGHLIGHTS = [
  { id: "h1", label: "Drops", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=200&auto=format&fit=crop" },
  { id: "h2", label: "Reviews", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop" },
  { id: "h3", label: "Behind", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=200&auto=format&fit=crop" },
];

const MY_ACCOUNT = {
  username: "etoil.vd",
  name: "ÉTOILE",
  category: "Clothing (Brand)",
  bio: ["Limited releases.", "Worldwide shipping"],
  link: "Launching Soon",
  posts: MY_POSTS.length,
  followers: 8,
  following: 38,
};

const SWITCHABLE_ACCOUNTS = [
  { username: "etoil.vd", name: "ÉTOILE", avatarStar: true, active: true },
  { username: "alex.parker", name: "Alex Parker", avatarStar: false, active: false },
];

/* ─────────────────────────── STAR AVATAR (brand mark placeholder) ─────────────────────────── */
function StarAvatar({ size = 80 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-white flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 1 L14.2 8.4 L21.5 9.5 L16.2 14.6 L17.8 22 L12 18.2 L6.2 22 L7.8 14.6 L2.5 9.5 L9.8 8.4 Z"
          fill="black"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────── THREADS ICON ─────────────────────────── */
function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 2c-5 0-8 3.2-8 8.4 0 4.6 2.6 7.9 6.4 9.6.7.3 1.2-.1 1.1-.8-.4-2.6-.2-4.9 1.5-6.3 1.3-1.1 3-1.1 4-.1.9.9.9 2.4-.1 3.5-.8.9-2.1 1.1-3 .5" />
      <circle cx="12" cy="10.4" r="7.6" />
    </svg>
  );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "reposts" | "tagged">("posts");
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Fetch real user profile from backend
  const { data: profile, isLoading, error } = useMyProfile();
  const toggleFollow = useToggleFollow();

  const visiblePosts = useMemo(() => {
    if (activeTab === "posts") return MY_POSTS;
    if (activeTab === "reels") return MY_POSTS.filter((p) => p.type === "video");
    return []; // reposts / tagged: empty for a fresh brand account
  }, [activeTab]);

  const handleTabClick = (tab: typeof activeTab) => {
    if (tab === "tagged") {
      navigate({ to: "/profile/tagged" });
      return;
    }
    setActiveTab(tab);
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-safe">
        <Loader2 className="w-8 h-8 text-foreground animate-spin" />
      </div>
    );
  }
  
  // Error state - show fallback profile
  const displayProfile = profile || {
    username: "etoil.vd",
    name: "ÉTOILE",
    category: "Clothing (Brand)",
    bio: ["Limited releases.", "Worldwide shipping"],
    website: "Launching Soon",
    avatar_url: null,
    followers_count: 8,
    following_count: 38,
    posts_count: MY_POSTS.length,
  };

  return (
    <div className="min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)] pt-safe">
      {/* ── TOP BAR ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate({ to: "/profile/edit" })} className="relative w-9 h-9 flex items-center justify-center -ml-1 rounded-full hover:bg-surface transition-colors">
          <Plus className="w-6 h-6 text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
        </button>

        <button
          onClick={() => setAccountSwitcherOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-surface transition-colors"
        >
          <span className="text-[17px] font-bold text-foreground">{displayProfile.username}</span>
          <ChevronDown className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
            <ThreadsIcon className="w-6 h-6 text-foreground" />
          </button>
          <Link to="/profile/settings" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
            <Menu className="w-6 h-6 text-foreground" />
          </Link>
        </div>
      </div>

      {/* ── PROFILE INFO ── */}
      <div className="px-4 pt-2">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            {displayProfile.avatar_url ? (
              <img src={displayProfile.avatar_url} alt={displayProfile.name} className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <StarAvatar size={80} />
            )}
            <button onClick={() => navigate({ to: "/profile/edit" })} className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
              <Plus size={14} />
            </button>
          </div>

          <div className="flex flex-1 justify-around ml-4 text-center">
            <div className="flex flex-col items-center">
              <span className="font-bold text-[17px]">{displayProfile.posts_count || MY_POSTS.length}</span>
              <span className="text-[13px] text-muted-foreground">posts</span>
            </div>
            <Link to="/profile/followers" className="flex flex-col items-center">
              <span className="font-bold text-[17px]">{displayProfile.followers_count || 0}</span>
              <span className="text-[13px] text-muted-foreground">followers</span>
            </Link>
            <Link to="/profile/following" className="flex flex-col items-center">
              <span className="font-bold text-[17px]">{displayProfile.following_count || 0}</span>
              <span className="text-[13px] text-muted-foreground">following</span>
            </Link>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-1.5">
            <h2 className="font-bold text-[15px]">{displayProfile.name}</h2>
            {displayProfile.is_verified && <Gem className="w-3.5 h-3.5 text-foreground" fill="currentColor" />}
          </div>
          <p className="text-[14px] text-muted-foreground mt-0.5">{displayProfile.category}</p>
          <div className="text-[14px] leading-snug mt-1.5">
            {(Array.isArray(displayProfile.bio) ? displayProfile.bio : [displayProfile.bio]).map((line, i) => (
              <p key={i} className="flex items-center gap-1.5">
                {line}
                {i === 0 && displayProfile.website && <Globe className="w-3.5 h-3.5 text-muted-foreground" />}
              </p>
            ))}
            {displayProfile.website && (
              <p className="flex items-center gap-1 font-semibold mt-0.5">
                {displayProfile.website} <ArrowDown className="w-3.5 h-3.5" />
              </p>
            )}
          </div>
        </div>

        {/* Add banners */}
        {!bannerDismissed && (
          <button
            onClick={() => setBannerDismissed(true)}
            className="mb-4 px-4 h-9 rounded-full border border-hairline text-[14px] font-semibold text-foreground/90 flex items-center gap-1.5 hover:bg-surface transition-colors"
          >
            <Plus className="w-4 h-4" /> Add banners
          </button>
        )}

        {/* Professional dashboard */}
        <button
          onClick={() => navigate({ to: "/profile/analytics" })}
          className="w-full text-left bg-surface rounded-2xl p-4 mb-4 hover:bg-surface-2 transition-colors"
        >
          <p className="font-bold text-[15px]">Professional dashboard</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">18 views in the last 30 days.</p>
        </button>

        {/* Edit / Share */}
        <div className="flex gap-2 mb-5">
          <Link to="/profile/edit" className="flex-1 bg-surface border border-hairline py-2 rounded-lg font-semibold text-[13px] text-center active:scale-95 transition-transform">
            Edit profile
          </Link>
          <Link to="/profile/qrcode" className="flex-1 bg-surface border border-hairline py-2 rounded-lg font-semibold text-[13px] text-center active:scale-95 transition-transform">
            Share profile
          </Link>
        </div>

        {/* Highlights */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          <button onClick={() => navigate({ to: "/profile/edit" })} className="flex flex-col items-center gap-1 shrink-0 group">
            <div className="w-16 h-16 rounded-full border border-hairline p-1 flex items-center justify-center bg-surface group-active:scale-95 transition-transform">
              <Plus size={22} className="text-muted-foreground" />
            </div>
            <span className="text-[11px] font-medium">New</span>
          </button>
          {HIGHLIGHTS.map((h) => (
            <Link key={h.id} to="/profile/story/$id" params={{ id: h.id }} className="flex flex-col items-center gap-1 shrink-0 group">
              <div className="w-16 h-16 rounded-full border border-hairline p-1 group-active:scale-95 transition-transform">
                <div className="w-full h-full rounded-full bg-muted overflow-hidden">
                  <img src={h.image} className="w-full h-full object-cover" alt="" />
                </div>
              </div>
              <span className="text-[11px] font-medium">{h.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-t border-hairline sticky top-[57px] z-30 bg-background">
        {([
          { id: "posts", icon: Grid3x3 },
          { id: "reels", icon: Clapperboard },
          { id: "reposts", icon: Repeat2 },
          { id: "tagged", icon: UserSquare2 },
        ] as const).map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabClick(id)}
            className={`flex-1 py-3 flex justify-center items-center relative transition-colors ${
              activeTab === id ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-6 h-6" strokeWidth={activeTab === id ? 2.2 : 1.8} />
            {activeTab === id && <motion.div layoutId="profileTab" className="absolute bottom-0 inset-x-0 h-[1.5px] bg-foreground" />}
          </button>
        ))}
      </div>

      {/* ── GRID ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {visiblePosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-0.5">
              {visiblePosts.map((post) => (
                <Link
                  key={post.id}
                  to={post.type === "video" ? "/profile/reels/$id" : "/profile/post/$id"}
                  params={{ id: post.id }}
                  className="aspect-square bg-surface relative group block overflow-hidden"
                >
                  {post.isBlank ? (
                    <div className="w-full h-full bg-white flex items-center justify-center px-2">
                      <span className="text-black text-[9px] font-bold tracking-widest text-center leading-tight">{post.caption}</span>
                    </div>
                  ) : (
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  )}

                  {post.type === "video" && (
                    <Play className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" fill="white" />
                  )}
                  {post.type === "carousel" && (
                    <Copy className="absolute top-2 right-2 w-4 h-4 text-white drop-shadow" strokeWidth={2.4} />
                  )}
                  {post.views > 0 && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-white drop-shadow" fill="white" />
                      <span className="text-white text-[12px] font-semibold drop-shadow">{post.views}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-8 py-20">
              <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
                {activeTab === "reposts" ? <Repeat2 className="w-7 h-7" /> : <UserSquare2 className="w-7 h-7" />}
              </div>
              <p className="font-bold text-[17px]">
                {activeTab === "reposts" ? "No reposts yet" : "No tagged posts"}
              </p>
              <p className="text-[13px] text-muted-foreground mt-1 max-w-[240px]">
                {activeTab === "reposts"
                  ? "When you repost something, it'll show up here."
                  : "Photos and videos you're tagged in will appear here."}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Account switcher */}
      <AnimatePresence>
        {accountSwitcherOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setAccountSwitcherOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-[101] pb-safe"
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mt-3 mb-2" />
              <div className="flex items-center justify-between px-5 py-3">
                <h3 className="font-bold text-[16px]">Switch accounts</h3>
                <button onClick={() => setAccountSwitcherOpen(false)} className="p-1 text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="px-2 pb-6">
                {SWITCHABLE_ACCOUNTS.map((acc) => (
                  <button key={acc.username} className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-surface transition-colors">
                    <div className="flex items-center gap-3">
                      {acc.avatarStar ? <StarAvatar size={40} /> : (
                        <div className="w-10 h-10 rounded-full bg-surface overflow-hidden border border-hairline" />
                      )}
                      <div className="text-left">
                        <p className="font-bold text-[14px]">{acc.username}</p>
                        <p className="text-[12px] text-muted-foreground">{acc.name}</p>
                      </div>
                    </div>
                    {acc.active && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
                <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-surface transition-colors font-semibold text-[14px] text-primary">
                  Add account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
