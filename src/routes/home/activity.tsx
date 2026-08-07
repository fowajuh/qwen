import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, X, Bell, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/home/activity")({
  component: HomeActivity,
});

const ACTIVITY = [
  {
    id: "a1", type: "like", user: "mia.travel", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    content: "liked your video", time: "2m", thumb: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&auto=format&fit=crop", unread: true,
  },
  {
    id: "a2", type: "follow", user: "chef_marcus", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop",
    content: "started following you", time: "5m", thumb: null, unread: true,
  },
  {
    id: "a3", type: "comment", user: "street_design", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
    content: "commented: \"this is incredible 🔥\"", time: "12m", thumb: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&auto=format&fit=crop", unread: true,
  },
  {
    id: "a4", type: "like", user: "alex_creates", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop",
    content: "liked your video", time: "34m", thumb: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&auto=format&fit=crop", unread: false,
  },
  {
    id: "a5", type: "mention", user: "foodie.tok", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop",
    content: "mentioned you in a comment", time: "1h", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop", unread: false,
  },
  {
    id: "a6", type: "follow", user: "travel_with_mia", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop",
    content: "started following you", time: "2h", thumb: null, unread: false,
  },
  {
    id: "a7", type: "like", user: "vibe_culture", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop",
    content: "and 47 others liked your video", time: "3h", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&auto=format&fit=crop", unread: false,
  },
];

const TYPE_ICON = {
  like: <Heart className="w-4 h-4 text-rose-500" fill="#e11d48" />,
  follow: <UserPlus className="w-4 h-4 text-blue-500" />,
  comment: <MessageCircle className="w-4 h-4 text-violet-500" />,
  mention: <span className="text-[11px] font-bold text-orange-500">@</span>,
};

export default function HomeActivity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "mentions">("all");
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);

  const filtered = activeTab === "mentions"
    ? ACTIVITY.filter((a) => a.type === "mention")
    : ACTIVITY;

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline pt-safe">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-[17px]">Activity</h1>
        </div>
        <div className="flex px-4 gap-4 pb-2">
          {(["all", "mentions"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-2 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
                activeTab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-hairline">
        {filtered.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 px-4 py-4 ${item.unread ? "bg-primary/5" : ""}`}
          >
            {/* Unread dot */}
            {item.unread && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 -mr-1" />
            )}

            {/* Avatar with type badge */}
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface">
                <img src={item.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background flex items-center justify-center shadow-sm border border-hairline">
                {TYPE_ICON[item.type as keyof typeof TYPE_ICON]}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <span className="font-bold text-[14px]">{item.user}</span>{" "}
              <span className="text-[14px] text-foreground">{item.content}</span>
              <div className="text-[12px] text-muted-foreground mt-0.5">{item.time} ago</div>
            </div>

            {/* Right side */}
            <div className="shrink-0 ml-2">
              {item.type === "follow" ? (
                <button
                  onClick={() => setFollowedUsers((p) => p.includes(item.user) ? p.filter((u) => u !== item.user) : [...p, item.user])}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-bold border transition-colors ${
                    followedUsers.includes(item.user)
                      ? "border-hairline text-foreground bg-surface"
                      : "bg-foreground text-background border-foreground"
                  }`}
                >
                  {followedUsers.includes(item.user) ? "Following" : "Follow"}
                </button>
              ) : item.thumb ? (
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-surface shrink-0">
                  <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                </div>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-[15px]">No mentions yet</p>
        </div>
      )}
    </div>
  );
}
