import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X, Send, Heart, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/profile/story/$id")({
  component: ProfileStoryId,
});

const HIGHLIGHT_STORIES: Record<string, { label: string; image: string }[]> = {
  h1: [
    { label: "Drops", image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop" },
    { label: "Drops", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=800&auto=format&fit=crop" },
  ],
  h2: [
    { label: "Reviews", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
  ],
  h3: [
    { label: "Behind", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop" },
    { label: "Behind", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=800&auto=format&fit=crop" },
    { label: "Behind", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop" },
  ],
};

function ProfileStoryId() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const slides = HIGHLIGHT_STORIES[id] || HIGHLIGHT_STORIES.h1;
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 100 / 40; // ~4s per slide
      });
    }, 100);
    return () => clearInterval(tick);
  }, [index]);

  useEffect(() => {
    if (progress >= 100) {
      if (index < slides.length - 1) setIndex((i) => i + 1);
      else navigate({ to: "/profile" });
    }
  }, [progress, index, slides.length, navigate]);

  const goPrev = () => (index > 0 ? setIndex((i) => i - 1) : navigate({ to: "/profile" }));
  const goNext = () => (index < slides.length - 1 ? setIndex((i) => i + 1) : navigate({ to: "/profile" }));

  const slide = slides[index];

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <img src={slide.image} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/40" />

      {/* Tap zones */}
      <button onClick={goPrev} className="absolute left-0 top-0 w-1/3 h-full z-10" aria-label="Previous" />
      <button onClick={goNext} className="absolute right-0 top-0 w-2/3 h-full z-10" aria-label="Next" />

      {/* Progress bars */}
      <div className="absolute top-0 inset-x-0 pt-safe px-2 pt-2 flex gap-1 z-20">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white"
              style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 inset-x-0 px-4 pt-safe flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="black">
              <path d="M12 1 L14.2 8.4 L21.5 9.5 L16.2 14.6 L17.8 22 L12 18.2 L6.2 22 L7.8 14.6 L2.5 9.5 L9.8 8.4 Z" />
            </svg>
          </div>
          <span className="text-white font-bold text-[13px]">etoil.vd</span>
          <span className="text-white/70 text-[12px]">{slide.label} · 3h</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2"><MoreHorizontal className="w-5 h-5 text-white" /></button>
          <button onClick={() => navigate({ to: "/profile" })} className="p-2">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Reply bar */}
      <div className="absolute bottom-6 inset-x-0 px-4 flex items-center gap-3 z-20 pb-safe">
        <div className="flex-1 h-11 rounded-full border border-white/40 flex items-center px-4">
          <span className="text-white/60 text-[14px]">Send message</span>
        </div>
        <button><Heart className="w-6 h-6 text-white" /></button>
        <button><Send className="w-6 h-6 text-white" /></button>
      </div>
    </div>
  );
}
