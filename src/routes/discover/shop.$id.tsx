import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Share, Heart, MoreHorizontal, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/shop/$id")({
  component: ShopDetail,
});

function ShopDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);

  const item = DISCOVER_FEED.find((p) => p.id === id) || DISCOVER_FEED[0];
  const more = DISCOVER_FEED.filter((p) => p.id !== item.id && p.category === item.category).slice(0, 4);

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="absolute top-0 z-40 w-full px-4 py-3 flex items-center justify-between pt-safe bg-gradient-to-b from-black/50 to-transparent">
        <div className="w-full flex items-center justify-between md:max-w-[480px] md:mx-auto">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-full hover:bg-white/20 transition-colors"><Share className="w-5 h-5 text-white" /></button>
            <button className="p-2 rounded-full hover:bg-white/20 transition-colors"><MoreHorizontal className="w-6 h-6 text-white" /></button>
          </div>
        </div>
      </div>

      {/* Image */}
      <div className="w-full relative bg-surface aspect-[4/5] md:max-w-[480px] md:mx-auto md:aspect-[4/5]">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
      </div>

      <div className="px-4 py-6 space-y-6 md:max-w-[480px] md:mx-auto">
        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-[22px] font-bold leading-tight">{item.title}</h1>
          </div>
          {item.price && (
            <div className="font-semibold text-[20px] mb-2">
              {item.price}
              {item.priceUnit && <span className="text-[14px] text-muted-foreground font-normal"> / {item.priceUnit}</span>}
            </div>
          )}
          {item.description && <p className="text-[15px] text-foreground/80">{item.description}</p>}
        </div>

        {/* Brand */}
        <div className="flex items-center justify-between py-4 border-y border-hairline">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface">
              <img src={item.authorAvatar} alt={item.author} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-[15px]">{item.author}</div>
              <div className="text-[13px] text-muted-foreground">Official Store</div>
            </div>
          </div>
          <button className="px-4 py-2 bg-surface rounded-full font-bold text-[14px]">Visit</button>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-[18px] mb-2">Description</h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Experience the finest quality with our signature collection. Meticulously crafted using sustainable materials and thoughtful details. Perfect for those who appreciate the finer things.
          </p>
        </div>

        {/* You may also like */}
        {more.length > 0 && (
          <div>
            <h3 className="font-bold text-[18px] mb-3">You may also like</h3>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {more.map((p) => (
                <Link key={p.id} to="/discover/shop/$id" params={{ id: p.id }} className="shrink-0 w-[110px] group">
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="text-[12px] font-semibold mt-1.5 truncate">{p.title}</p>
                  {p.price && <p className="text-[12px] font-bold">{p.price}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-hairline bg-background pb-safe flex items-center gap-4 z-40">
        <div className="flex-1 flex items-center gap-4 md:max-w-[480px] md:mx-auto">
          <button
            onClick={() => setSaved(!saved)}
            className="w-12 h-12 rounded-full bg-surface flex items-center justify-center shrink-0"
          >
            <Heart className="w-6 h-6 transition-colors" fill={saved ? "#e11d48" : "none"} color={saved ? "#e11d48" : "currentColor"} />
          </button>
          <button
            onClick={() => navigate({ to: "/discover" })}
            className="flex-1 bg-foreground text-background py-4 rounded-xl font-bold text-[16px] shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
