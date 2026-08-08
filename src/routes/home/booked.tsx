import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, MessageSquare, Play } from "lucide-react";
import { HomeTopTabs } from "@/components/home/home-nav";

export const Route = createFileRoute("/home/booked")({
  head: () => ({ meta: [{ title: "Booked — Nexa" }] }),
  component: CommunityGrid,
});

type CommunityItem = {
  id: string;
  image: string;
  ratio: "tall" | "square";
  caption: string;
  username: string;
  avatar: string;
  likes: number;
  isVideo: boolean;
  hasComments: boolean;
  watchId: "v1" | "v2";
};

const COMMUNITY: CommunityItem[] = [
  {
    id: "c1", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop",
    ratio: "tall", caption: "Second trial 🧢😍", username: "Iradat",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop",
    likes: 7333, isVideo: true, hasComments: false, watchId: "v1",
  },
  {
    id: "c2", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=500&auto=format&fit=crop",
    ratio: "square", caption: "Eat this, 7 days — small changes, big impact", username: "Madoyi Joseph",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop",
    likes: 808, isVideo: false, hasComments: true, watchId: "v2",
  },
  {
    id: "c3", image: "https://images.unsplash.com/photo-1592179900476-ca0c5f0f0f0f?w=500&auto=format&fit=crop",
    ratio: "square", caption: "Hoop dreams in clean 8K style 🏀✨ Minimal wallpapers", username: "8k wallpaper",
    avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&auto=format&fit=crop",
    likes: 4432, isVideo: false, hasComments: true, watchId: "v1",
  },
  {
    id: "c4", image: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=500&auto=format&fit=crop",
    ratio: "tall", caption: "The minute you were born, it got risky 🎲", username: "RiseUp",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
    likes: 40, isVideo: true, hasComments: false, watchId: "v2",
  },
  {
    id: "c5", image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop",
    ratio: "square", caption: "Golden hour with the girls ✨", username: "twins.daily",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=100&auto=format&fit=crop",
    likes: 2190, isVideo: false, hasComments: true, watchId: "v1",
  },
  {
    id: "c6", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=500&auto=format&fit=crop",
    ratio: "tall", caption: "Training day — one more rep", username: "the.grind",
    avatar: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=100&auto=format&fit=crop",
    likes: 15300, isVideo: true, hasComments: false, watchId: "v2",
  },
  {
    id: "c7", image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop",
    ratio: "square", caption: "POV: it's finally Friday", username: "weekend.mood",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&auto=format&fit=crop",
    likes: 963, isVideo: false, hasComments: true, watchId: "v1",
  },
  {
    id: "c8", image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop",
    ratio: "tall", caption: "Studio session, take 3 🎙️", username: "lo.fi.sessions",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop",
    likes: 5821, isVideo: true, hasComments: false, watchId: "v2",
  },
];

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function CommunityGrid() {
  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      <HomeTopTabs variant="light" />

      <div className="grid grid-cols-2 gap-1 p-1">
        {COMMUNITY.map((item) => (
          <Link
            key={item.id}
            to="/creator/video/$id"
            params={{ id: item.watchId }}
            className="block break-inside-avoid"
          >
            <div className={`relative w-full rounded-lg overflow-hidden bg-surface ${item.ratio === "tall" ? "aspect-[3/4]" : "aspect-square"}`}>
              <img src={item.image} alt={item.caption} className="w-full h-full object-cover" loading="lazy" />

              {item.isVideo && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white" fill="white" strokeWidth={0} />
                </div>
              )}
              {item.hasComments && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>
              )}
            </div>

            <div className="px-1 pt-2 pb-3">
              <p className="text-[13px] font-medium leading-snug line-clamp-2 mb-1.5">{item.caption}</p>
              <div className="flex items-center gap-1.5">
                <img src={item.avatar} alt={item.username} className="w-4 h-4 rounded-full object-cover shrink-0" />
                <span className="text-[11px] text-muted-foreground truncate flex-1">{item.username}</span>
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground shrink-0">
                  <Heart className="w-3 h-3" /> {formatCount(item.likes)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
