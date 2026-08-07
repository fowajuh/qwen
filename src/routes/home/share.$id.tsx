import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Search,
  X,
  Check,
  RotateCw,
  Link as LinkIcon,
  MessageCircle,
  CirclePlus,
  Send,
  Flag,
  HeartCrack,
  Download,
  PlusSquare,
  Repeat2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/home/share/$id")({
  component: SharePage,
});

const FRIENDS = [
  { id: "f1", user: "zack.films", name: "Zack D. Films", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop" },
  { id: "f2", user: "medix5124", name: "@Medix5124", avatar: "", initial: "D" },
  { id: "f3", user: "princess", name: "Princess", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop" },
  { id: "f4", user: "espn", name: "ESPN", avatar: "", verified: true },
  { id: "f5", user: "zico.boy", name: "Zico boy", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop" },
  { id: "f6", user: "priya.tok", name: "Priya", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop" },
];

// Row 1: platform / action shares (colorful, matches real TikTok's send sheet)
const SHARE_ACTIONS_PRIMARY = [
  { label: "Repost", icon: RotateCw, bg: "bg-amber-400", action: "repost" },
  { label: "Copy link", icon: LinkIcon, bg: "bg-blue-500", action: "copy" },
  { label: "WhatsApp", icon: MessageCircle, bg: "bg-green-500", action: "whatsapp" },
  { label: "Status", icon: CirclePlus, bg: "bg-green-500", action: "status" },
  { label: "Messenger", icon: Send, bg: "bg-blue-500", action: "messenger" },
];

// Row 2: utility actions (plain gray, matches real TikTok)
const SHARE_ACTIONS_SECONDARY = [
  { label: "Report", icon: Flag, action: "report" },
  { label: "Not interested", icon: HeartCrack, action: "not-interested" },
  { label: "Download", icon: Download, action: "download" },
  { label: "Add to Story", icon: PlusSquare, action: "add-to-story" },
  { label: "Duet", icon: Repeat2, action: "duet" },
];

export default function SharePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const [pressedAction, setPressedAction] = useState<string | null>(null);

  const send = (userId: string) => {
    setSentTo((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://nexa.app/v/${id}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAction = (action: string) => {
    setPressedAction(action);
    setTimeout(() => setPressedAction(null), 220);
    if (action === "copy") copyLink();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2">
        <div className="w-10 h-1 rounded-full bg-foreground/20" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-4">
        <button className="p-2 -ml-2 rounded-full hover:bg-surface">
          <Search className="w-5 h-5" />
        </button>
        <span className="font-bold text-[17px]">Send to</span>
        <button onClick={() => navigate({ to: "/home" })} className="p-2 -mr-2 rounded-full hover:bg-surface">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Friend row */}
      <div className="px-4 pb-4">
        <div className="flex gap-5 overflow-x-auto no-scrollbar pb-1">
          {FRIENDS.map((f) => {
            const sent = sentTo.includes(f.id);
            return (
              <button key={f.id} onClick={() => send(f.id)} className="flex flex-col items-center gap-2 shrink-0">
                <motion.div whileTap={{ scale: 0.88 }} className="relative">
                  <div
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all flex items-center justify-center font-bold text-white text-lg ${
                      sent ? "border-primary scale-105" : "border-transparent"
                    } ${!f.avatar ? (f.verified ? "bg-sky-500" : "bg-[#fe2c55]") : ""}`}
                  >
                    {f.avatar ? (
                      <img src={f.avatar} alt="" className="w-full h-full object-cover" />
                    ) : f.verified ? (
                      "E"
                    ) : (
                      f.initial ?? f.name[0]
                    )}
                  </div>
                  <AnimatePresence>
                    {sent && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background"
                      >
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <span className="text-[11px] font-medium text-center max-w-[64px] truncate">
                  {sent ? "Sent" : f.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Share options grid — row 1: colorful platform shares */}
      <div className="px-4 pb-2 grid grid-cols-5 gap-y-4">
        {SHARE_ACTIONS_PRIMARY.map((opt) => (
          <button key={opt.action} onClick={() => handleAction(opt.action)} className="flex flex-col items-center gap-2">
            <motion.div
              animate={pressedAction === opt.action ? { scale: [1, 0.85, 1] } : {}}
              transition={{ duration: 0.22 }}
              className={`w-14 h-14 rounded-full ${opt.bg} flex items-center justify-center shadow-sm`}
            >
              {opt.action === "copy" && copied ? (
                <Check className="w-6 h-6 text-white" strokeWidth={3} />
              ) : (
                <opt.icon className="w-6 h-6 text-white" />
              )}
            </motion.div>
            <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
              {opt.action === "copy" && copied ? "Copied!" : opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Row 2: plain utility actions */}
      <div className="px-4 pb-4 grid grid-cols-5 gap-y-4">
        {SHARE_ACTIONS_SECONDARY.map((opt) => (
          <button key={opt.action} onClick={() => handleAction(opt.action)} className="flex flex-col items-center gap-2">
            <motion.div
              animate={pressedAction === opt.action ? { scale: [1, 0.85, 1] } : {}}
              transition={{ duration: 0.22 }}
              className="w-14 h-14 rounded-full bg-surface-2 flex items-center justify-center"
            >
              <opt.icon className="w-6 h-6 text-foreground" strokeWidth={1.75} />
            </motion.div>
            <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Tip banner */}
      <AnimatePresence>
        {!tipDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mx-4 mb-safe mt-auto rounded-xl bg-surface px-4 py-3 flex items-start gap-3"
          >
            <p className="flex-1 text-[12px] text-muted-foreground leading-snug">
              Press and hold a post to find playback speed and other controls.{" "}
              <span className="text-blue-500 font-medium">See what's moved</span>
            </p>
            <button onClick={() => setTipDismissed(true)} className="text-muted-foreground shrink-0">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send confirmation button */}
      {sentTo.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-4 pb-safe pt-2">
          <button
            onClick={() => navigate({ to: "/home" })}
            className="w-full py-3.5 bg-[#fe2c55] text-white rounded-lg font-bold text-[15px] hover:opacity-90 transition-opacity"
          >
            Send to {sentTo.length} {sentTo.length === 1 ? "person" : "people"}
          </button>
        </motion.div>
      )}
    </div>
  );
}
