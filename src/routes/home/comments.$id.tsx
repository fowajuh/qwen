import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, X, Send, Heart, ThumbsDown, MessageCircle, Link as LinkIcon, Share2, ChevronDown, Image as ImageIcon, Smile, AtSign, Gift } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/home/comments/$id")({
  component: CommentsSheet,
});

interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  disliked?: boolean;
  isCreator?: boolean;
  replies?: Comment[];
}

const MOCK_COMMENTS: Comment[] = [
  { id: "c1", user: "mia.travel", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop", text: "This is absolutely incredible 🔥🔥🔥", time: "2m", likes: 847, liked: false },
  { id: "c2", user: "chef_marcus", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop", text: "How did you get that shot? The lighting is perfect ✨", time: "5m", likes: 234, liked: true, isCreator: true, replies: [
    { id: "c2r1", user: "alex_creates", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop", text: "@chef_marcus golden hour + a good lens 🙏", time: "4m", likes: 42, liked: false },
    { id: "c2r2", user: "mia.travel", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop", text: "wait this is so helpful thank you", time: "3m", likes: 11, liked: false },
    { id: "c2r3", user: "vibe_culture", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop", text: "saving this comment fr", time: "2m", likes: 6, liked: false },
  ]},
  { id: "c3", user: "street_design", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop", text: "Following for more content like this 💯", time: "8m", likes: 128, liked: false },
  { id: "c4", user: "foodie.tok", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop", text: "Need this in my life omg 😭", time: "12m", likes: 391, liked: false },
  { id: "c5", user: "travel_with_mia", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&auto=format&fit=crop", text: "Where is this?? I must go!! 🌍", time: "18m", likes: 567, liked: false },
  { id: "c6", user: "vibe_culture", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop", text: "Saving this forever 📌", time: "25m", likes: 89, liked: false },
];

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

export default function CommentsSheet() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<"top" | "recent">("top");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  const toggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1, disliked: false }
          : c
      )
    );
  };

  const toggleDislike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, disliked: !c.disliked, liked: false, likes: c.liked ? c.likes - 1 : c.likes }
          : c
      )
    );
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  const postComment = () => {
    if (!input.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      user: "me",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop",
      text: input.trim(),
      time: "now",
      likes: 0,
      liked: false,
    };
    setComments((prev) => [newComment, ...prev]);
    setInput("");
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-background/95 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="font-bold text-[15px]">{totalComments.toLocaleString()} comments</span>
        </div>
        <div className="flex gap-1">
          <button className="p-2 rounded-full hover:bg-surface">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-hairline px-4">
        {(["top", "recent"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-3 mr-6 text-[14px] font-semibold capitalize border-b-2 transition-colors ${
              tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {(tab === "top"
            ? [...comments].sort((a, b) => b.likes - a.likes)
            : [...comments]
          ).map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 border-b border-hairline/50"
            >
              <div className="flex gap-3">
                <Link to="/creator/$id" params={{ id: comment.user }} className="shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-surface">
                    <img src={comment.avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Link to="/creator/$id" params={{ id: comment.user }} className="inline-flex items-center gap-1.5">
                        <span className="font-bold text-[13px]">{comment.user}</span>
                        {comment.isCreator && (
                          <span className="text-[10px] font-bold text-white bg-[#20d5ec] px-1.5 py-[1px] rounded">Creator</span>
                        )}
                      </Link>{" "}
                      <span className="text-[14px]">{comment.text}</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 shrink-0 ml-2">
                      <motion.button whileTap={{ scale: 1.4 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} onClick={() => toggleLike(comment.id)} className="flex flex-col items-center gap-0.5">
                        <Heart
                          className="w-4 h-4"
                          fill={comment.liked ? "#e11d48" : "none"}
                          color={comment.liked ? "#e11d48" : "currentColor"}
                          strokeWidth={1.5}
                        />
                        <span className="text-[10px] text-muted-foreground">{formatCount(comment.likes)}</span>
                      </motion.button>
                      <motion.button whileTap={{ scale: 1.4 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} onClick={() => toggleDislike(comment.id)}>
                        <ThumbsDown
                          className="w-3.5 h-3.5"
                          fill={comment.disliked ? "currentColor" : "none"}
                          color={comment.disliked ? "var(--foreground)" : "currentColor"}
                          strokeWidth={1.5}
                        />
                      </motion.button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[11px] text-muted-foreground">{comment.time}</span>
                    <button className="text-[11px] text-muted-foreground font-semibold hover:text-foreground">Reply</button>
                  </div>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground hover:text-foreground mb-2"
                      >
                        <span className="w-6 h-px bg-hairline" />
                        View {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.has(comment.id) ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedReplies.has(comment.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-3 overflow-hidden"
                          >
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full overflow-hidden bg-surface shrink-0">
                                  <img src={reply.avatar} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <span className="font-bold text-[12px]">{reply.user} </span>
                                  <span className="text-[13px]">{reply.text}</span>
                                  <div className="text-[11px] text-muted-foreground mt-1">{reply.time}</div>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Comment input */}
      <div className="sticky bottom-0 px-4 py-3 border-t border-hairline bg-background flex items-center gap-2 bottom-safe">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface shrink-0">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex items-center gap-2 bg-surface rounded-full pl-4 pr-2 py-2 border border-hairline">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && postComment()}
            placeholder="Add comment..."
            className="flex-1 bg-transparent text-[14px] outline-none min-w-0"
          />
          <button className="p-1.5 text-muted-foreground hover:text-foreground shrink-0" aria-label="Add image">
            <ImageIcon className="w-[18px] h-[18px]" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground shrink-0" aria-label="Add emoji">
            <Smile className="w-[18px] h-[18px]" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground shrink-0" aria-label="Mention someone">
            <AtSign className="w-[18px] h-[18px]" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground shrink-0" aria-label="Send a gift">
            <Gift className="w-[18px] h-[18px]" />
          </button>
        </div>
        <AnimatePresence>
          {input.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              onClick={postComment}
              className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
