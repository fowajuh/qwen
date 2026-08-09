import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Check, CheckCheck, Clock, Sparkles } from "lucide-react";
import { cn, hapticTap } from "@/lib/utils";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: "text" | "image" | "system";
  metadata?: Record<string, unknown>;
}

export interface HostProfile {
  id: string;
  name: string;
  avatar?: string;
  responseTimeMinutes: number;
  responseRate: number;
  isSuperhost: boolean;
  verified: boolean;
  online: boolean;
  typing?: boolean;
}

const quickReplies = [
  "Is early check-in available?",
  "Do you have a crib?",
  "What is the WiFi password?",
  "Is parking included?",
  "Are pets allowed?",
  "What's the checkout time?",
];

export function MessageThread({
  messages,
  host,
  onSendMessage,
  canSend = true,
}: {
  messages: Message[];
  host: HostProfile;
  onSendMessage: (content: string) => void;
  canSend?: boolean;
}) {
  const [inputValue, setInputValue] = useState("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || !canSend) return;
    
    hapticTap();
    onSendMessage(inputValue.trim());
    setInputValue("");
    setShowQuickReplies(false);
    
    // Focus back on input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full bg-cloud-white">
      {/* Host Header */}
      <div className="px-4 py-3 border-b border-ink-90/5 bg-cloud-white/85 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-cloud-white font-display text-sm">
              {host.avatar ? (
                <img src={host.avatar} alt={host.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                host.name.slice(0, 2).toUpperCase()
              )}
            </div>
            {host.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-cloud-white" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base text-departure-navy truncate">{host.name}</h3>
              {host.verified && (
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
                </span>
              )}
              {host.isSuperhost && (
                <span className="num text-[7px] uppercase tracking-[0.15em] text-beacon-amber bg-beacon-amber/10 px-1.5 py-0.5 rounded-full">
                  Superhost
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {host.typing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  <span className="num text-[9px] uppercase tracking-[0.15em] text-beacon-amber">
                    Typing
                  </span>
                  <TypingIndicator />
                </motion.div>
              ) : (
                <>
                  <ResponseTimeBadge minutes={host.responseTimeMinutes} />
                  <span className="num text-[8px] uppercase tracking-[0.15em] text-ink-40">
                    {host.responseRate}% response rate
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} isOwn={message.senderId === "me"} />
          ))}
        </AnimatePresence>
        
        {/* System messages */}
        {messages.filter(m => m.type === "system").map((message) => (
          <div key={message.id} className="flex justify-center">
            <span className="num text-[9px] uppercase tracking-[0.15em] text-ink-40 bg-ink-90/5 px-3 py-1.5 rounded-full">
              {message.content}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="px-4 pb-2"
          >
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="num text-[9px] uppercase tracking-[0.12em] text-ink-70 bg-cloud-white border border-ink-90/10 hover:border-beacon-amber/40 hover:text-beacon-amber px-3 py-1.5 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 py-3 border-t border-ink-90/5 bg-cloud-white">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={cn(
              "p-2 rounded-full transition-colors",
              showQuickReplies ? "bg-beacon-amber/10 text-beacon-amber" : "text-ink-40 hover:text-ink-60",
            )}
            aria-label="Quick replies"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
          </button>
          
          <button
            className="p-2 text-ink-40 hover:text-ink-60 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-4 h-4" strokeWidth={1.75} />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your host..."
              rows={1}
              disabled={!canSend}
              className="w-full px-4 py-2.5 bg-ink-90/5 rounded-2xl text-sm text-ink-90 placeholder:text-ink-40 focus:outline-none focus:ring-2 focus:ring-beacon-amber/20 resize-none disabled:opacity-50"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !canSend}
            className="p-2.5 rounded-full bg-beacon-amber text-departure-navy disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
            style={{ transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (message.type === "system") return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
    >
      {!isOwn && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-cloud-white num text-[9px] shrink-0">
          {message.senderAvatar ? (
            <img src={message.senderAvatar} alt={message.senderName} className="w-full h-full rounded-full object-cover" />
          ) : (
            message.senderName.slice(0, 2).toUpperCase()
          )}
        </div>
      )}
      
      <div className={cn("max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-2xl text-sm",
            isOwn
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-cloud-white rounded-br-md"
              : "bg-ink-90/5 text-ink-90 rounded-bl-md",
          )}
        >
          <p className="leading-relaxed">{message.content}</p>
        </div>
        
        <div className={cn("flex items-center gap-1.5 mt-1", isOwn ? "justify-end" : "justify-start")}>
          <span className="num text-[8px] uppercase tracking-[0.12em] text-ink-40">
            {formatTime(message.timestamp)}
          </span>
          {isOwn && (
            <span className={cn("num text-[8px]", message.read ? "text-beacon-amber" : "text-ink-30")}>
              {message.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="w-1.5 h-1.5 rounded-full bg-beacon-amber"
        />
      ))}
    </div>
  );
}

function ResponseTimeBadge({ minutes }: { minutes: number }) {
  let colorClass = "text-emerald-600";
  let label = "Responds instantly";
  
  if (minutes > 60) {
    colorClass = "text-amber-600";
    label = `Responds in ~${Math.round(minutes / 60)}h`;
  } else if (minutes > 15) {
    colorClass = "text-amber-600";
    label = `Responds in ${minutes}m`;
  } else if (minutes > 5) {
    label = `Responds in ${minutes}m`;
  }
  
  return (
    <div className="flex items-center gap-1">
      <Clock className={cn("w-3 h-3", colorClass)} strokeWidth={2} />
      <span className={cn("num text-[8px] uppercase tracking-[0.12em]", colorClass)}>
        {label}
      </span>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Mock host data for demo
export const mockHost: HostProfile = {
  id: "host_1",
  name: "Sarah Chen",
  responseTimeMinutes: 12,
  responseRate: 98,
  isSuperhost: true,
  verified: true,
  online: true,
};

export const mockMessages: Message[] = [
  {
    id: "msg_1",
    senderId: "host",
    senderName: "Sarah Chen",
    content: "Hi! Welcome to Tokyo. Let me know if you need any recommendations!",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
    type: "text",
  },
  {
    id: "msg_2",
    senderId: "me",
    senderName: "You",
    content: "Thanks Sarah! Is early check-in available?",
    timestamp: new Date(Date.now() - 1800000),
    read: true,
    type: "text",
  },
  {
    id: "msg_3",
    senderId: "host",
    senderName: "Sarah Chen",
    content: "Yes! Early check-in is available from 11 AM. Just let me know your arrival time.",
    timestamp: new Date(Date.now() - 900000),
    read: false,
    type: "text",
  },
];
