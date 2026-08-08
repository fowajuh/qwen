import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Search, Heart, MessageCircle, Play, Music } from "lucide-react";
import { useState } from "react";
import { motion } from "motion/react";

export const Route = createFileRoute("/home/sound/$id")({
  component: SoundDetailPage,
});

const SOUND_VIDEOS = [
  { id: "s1", user: "julian_sk8", thumb: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&auto=format&fit=crop", likes: 8920 },
  { id: "s2", user: "dance.moves", thumb: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop", likes: 23100 },
  { id: "s3", user: "vibe_culture", thumb: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop", likes: 45200 },
  { id: "s4", user: "streetart.tv", thumb: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop", likes: 12800 },
  { id: "s5", user: "daily.vlogs", thumb: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=600&auto=format&fit=crop", likes: 6710 },
  { id: "s6", user: "travel_tok", thumb: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop", likes: 33400 },
  { id: "s7", user: "art_daily", thumb: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&auto=format&fit=crop", likes: 18900 },
  { id: "s8", user: "comedy_clips", thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop", likes: 92000 },
  { id: "s9", user: "food.life", thumb: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop", likes: 55600 },
];

function formatCount(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function SoundDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const soundName = id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+1rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center gap-3 pt-safe">
        <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[17px] flex-1 truncate">{soundName}</h1>
        <button onClick={() => navigate({ to: "/search" })} className="p-2 rounded-full hover:bg-surface">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Sound card */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4">
          {/* Spinning disc */}
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            className="relative w-20 h-20 shrink-0"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-foreground/10">
              <img
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-background border-2 border-foreground/10" />
            </div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-[17px] truncate">{soundName}</div>
            <div className="text-sm text-muted-foreground mt-0.5">Original audio</div>
            <div className="text-sm text-muted-foreground">{formatCount(SOUND_VIDEOS.length * 28400)} videos</div>
          </div>
        </div>

        {/* Action row */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background py-3 rounded-full font-bold text-[15px]"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-[15px] border transition-colors ${
              saved ? "bg-foreground text-background border-foreground" : "bg-background text-foreground border-hairline"
            }`}
          >
            <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        {/* Waveform placeholder */}
        <div className="mt-5 flex items-end gap-0.5 h-10">
          {Array.from({ length: 60 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-foreground/20 rounded-full"
              animate={{ height: isPlaying ? `${Math.random() * 100}%` : `${20 + Math.sin(i * 0.3) * 15}%` }}
              transition={{ duration: 0.3, repeat: isPlaying ? Infinity : 0, repeatType: "reverse", delay: i * 0.02 }}
            />
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="px-4">
        <h2 className="font-bold text-[16px] mb-4">{formatCount(SOUND_VIDEOS.length * 28400)} videos</h2>
        <div className="grid grid-cols-3 gap-0.5">
          {SOUND_VIDEOS.map((v) => (
            <div key={v.id} className="relative aspect-[9/16] bg-muted group">
              <img src={v.thumb} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[11px] font-semibold">
                <Play className="w-3 h-3" fill="white" />
                {formatCount(v.likes)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
