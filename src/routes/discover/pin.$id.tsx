import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, MoreHorizontal, Share, Heart, MessageCircle, Sparkles, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED, type Pin } from "./index";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/discover/pin/$id")({
  component: PinDetail,
});

function PinDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showBoardSelect, setShowBoardSelect] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shopOpen, setShopOpen] = useState(true);

  const pin = DISCOVER_FEED.find((p) => p.id === id) || DISCOVER_FEED[0];

  // "Shop the look" items — pull a few other pins in as shoppable products tied to this pin
  const shopItems: Pin[] = DISCOVER_FEED.filter((p) => p.id !== pin.id && p.price).length
    ? DISCOVER_FEED.filter((p) => p.id !== pin.id && p.price)
    : DISCOVER_FEED.filter((p) => p.id !== pin.id).slice(0, 3);

  const moreToExplore = DISCOVER_FEED.filter((p) => p.id !== pin.id && p.category === pin.category);
  const explore = moreToExplore.length >= 4 ? moreToExplore : DISCOVER_FEED.filter((p) => p.id !== pin.id);

  const handleSave = () => {
    if (saved) setSaved(false);
    else setShowBoardSelect(true);
  };

  const confirmSave = () => {
    setSaved(true);
    setShowBoardSelect(false);
  };

  return (
    <div className="w-full min-h-screen bg-background pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-surface"><Share className="w-5 h-5 text-foreground" /></button>
          <button className="p-2 rounded-full hover:bg-surface"><MoreHorizontal className="w-6 h-6 text-foreground" /></button>
        </div>
      </div>

      {/* Main Image */}
      <div className="w-full relative bg-surface px-3 md:max-w-[520px] md:mx-auto">
        <div className="w-full relative rounded-3xl overflow-hidden">
          <img src={pin.image} alt={pin.title} className="w-full h-auto object-contain max-h-[70vh] mx-auto" />

          {/* Save button floating top-right on image */}
          <div className="absolute top-3 right-3">
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-full font-bold text-[15px] shadow-lg transition-colors active:scale-95 ${
                saved ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>

          {/* Visual / magic search — routes to related pins */}
          <button
            onClick={() => navigate({ to: "/discover/related/$id", params: { id: pin.id } })}
            className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-background/95 backdrop-blur-md flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            aria-label="Visual search"
          >
            <Sparkles className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 md:max-w-[520px] md:mx-auto">
        {/* Title & description */}
        <div>
          <h1 className="text-[22px] font-bold leading-tight mb-1.5">{pin.title}</h1>
          {pin.description && <p className="text-[14px] text-foreground/70 leading-relaxed">{pin.description}</p>}
        </div>

        {/* Engagement row */}
        <div className="flex items-center gap-4 text-[13px] text-muted-foreground font-medium">
          <span>{pin.saves.toLocaleString()} saves</span>
          {typeof pin.comments === "number" && (
            <>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span>{pin.comments} comments</span>
            </>
          )}
        </div>

        {/* Creator */}
        <div className="flex items-center justify-between py-1">
          <Link to="/discover" className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface shrink-0">
              <img src={pin.authorAvatar} alt={pin.author} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[15px] truncate">{pin.author}</div>
              {pin.authorFollowers && <div className="text-[13px] text-muted-foreground">{pin.authorFollowers} followers</div>}
            </div>
          </Link>
          <button className="px-4 py-2 bg-surface rounded-full font-bold text-[14px] shrink-0">Follow</button>
        </div>

        {/* Action Row */}
        <div className="flex justify-between items-center py-4 border-y border-hairline">
          <button className="flex items-center gap-2" onClick={() => setLiked(!liked)}>
            <Heart className="w-6 h-6 transition-colors" fill={liked ? "#e11d48" : "none"} color={liked ? "#e11d48" : "currentColor"} />
            <span className="font-bold text-[15px]">{liked ? "1.2k" : "1.1k"}</span>
          </button>

          <div className="flex items-center gap-3">
            <button className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 bg-surface rounded-full flex items-center justify-center">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comment preview */}
        <button className="w-full flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface shrink-0">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[14px]">Anything</span>{" "}
            <span className="text-[14px] text-foreground/80">"can I use this for commercial use"</span>
            <div className="text-[13px] text-muted-foreground font-semibold mt-0.5">View comment</div>
          </div>
        </button>
      </div>

      {/* Shop the look */}
      {shopItems.length > 0 && (
        <div className="border-t border-hairline pt-4 md:max-w-[520px] md:mx-auto">
          <button onClick={() => setShopOpen((o) => !o)} className="w-full flex items-center justify-between px-4 mb-3">
            <h3 className="font-bold text-[17px]">Shop the look</h3>
            {shopOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>
          <AnimatePresence initial={false}>
            {shopOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex gap-3 px-4 pb-2 overflow-x-auto no-scrollbar">
                  {shopItems.map((item) => (
                    <Link
                      key={item.id}
                      to="/discover/shop/$id"
                      params={{ id: item.id }}
                      className="shrink-0 w-[132px] group"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface relative">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <p className="text-[12px] font-semibold mt-1.5 truncate">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{item.author}</p>
                      {item.price && <p className="text-[12px] font-bold mt-0.5">{item.price}</p>}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* More to explore */}
      <div className="mt-2 border-t border-hairline pt-6 md:max-w-[900px] md:mx-auto">
        <h3 className="font-bold text-[18px] px-4 mb-4">More to explore</h3>
        <div className="columns-2 md:columns-3 gap-3 px-4" style={{ columnGap: "12px" }}>
          {explore.map((p) => (
            <Link key={p.id} to="/discover/pin/$id" params={{ id: p.id }} className="block mb-3 break-inside-avoid group">
              <div className="relative rounded-2xl overflow-hidden bg-surface" style={{ aspectRatio: 1 / p.aspect }}>
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="font-bold text-[13px] truncate leading-tight px-1 mt-1.5">{p.title}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Board Selection Bottom Sheet */}
      <AnimatePresence>
        {showBoardSelect && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBoardSelect(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 p-6 pb-safe"
            >
              <h2 className="text-[20px] font-bold mb-6 text-center">Save to board</h2>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {["NYC Guide", "Weekend Trips", "Food bucket list", "Design Inspo"].map((board) => (
                  <button
                    key={board}
                    onClick={confirmSave}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-hairline overflow-hidden">
                        <img src={pin.image} alt="" className="w-full h-full object-cover opacity-70" />
                      </div>
                      <span className="font-bold text-[16px]">{board}</span>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => { setShowBoardSelect(false); navigate({ to: "/discover/save-modal/$id", params: { id: pin.id } }); }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors"
                >
                  <div className="w-14 h-14 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-hairline border-dashed">
                    <span className="text-[24px] text-muted-foreground">+</span>
                  </div>
                  <span className="font-bold text-[16px]">Create board</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
