import { createFileRoute, Link, useNavigate, Outlet, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Search, Phone, Video, MoreHorizontal, Edit, CheckCircle2, ChevronRight, MessageCircle, Mic, Image as ImageIcon, MapPin, Building2, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";

export const Route = createFileRoute("/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — Nexa" },
      { name: "description", content: "Your unified inbox for local commerce." },
    ],
  }),
  component: MessagesLayout,
});

/* ─── TYPES ─── */
type MessageTab = "messages" | "calls" | "business";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  initials: string;
  gradient: string;
  unread: number;
  isOnline: boolean;
  type: "personal" | "business" | "group";
  pinned?: boolean;
  muted?: boolean;
  mediaPreview?: "image" | "audio" | "video" | "location" | null;
}

interface CallRecord {
  id: string;
  name: string;
  initials: string;
  gradient: string;
  time: string;
  duration?: string;
  type: "incoming" | "outgoing" | "missed" | "video";
  count?: number;
}

interface BusinessMessage {
  id: string;
  business: string;
  category: string;
  lastMessage: string;
  time: string;
  initials: string;
  gradient: string;
  unread: number;
  bookingStatus?: "confirmed" | "pending" | "completed";
}

/* ─── DATA ─── */
const CONVERSATIONS: Conversation[] = [
  { id: "c1", name: "Graham McBride", lastMessage: "See you at 3pm!", time: "9:22 AM", initials: "GM", gradient: "from-blue-500 to-indigo-600", unread: 2, isOnline: true, type: "personal", pinned: true },
  { id: "c2", name: "Puthachad Kuthong", lastMessage: "Can you confirm the catering for Thursday?", time: "8:50 AM", initials: "PK", gradient: "from-orange-400 to-red-500", unread: 1, isOnline: false, type: "personal" },
  { id: "c3", name: "Design Team", lastMessage: "Sara: The new deck is ready", time: "8:15 AM", initials: "DT", gradient: "from-purple-500 to-pink-500", unread: 5, isOnline: false, type: "group" },
  { id: "c4", name: "Elisha St. Denis", lastMessage: "Voice message", time: "Yesterday", initials: "ES", gradient: "from-teal-400 to-cyan-500", unread: 0, isOnline: true, type: "personal", mediaPreview: "audio" },
  { id: "c5", name: "Simla Uner", lastMessage: "Location pin", time: "Yesterday", initials: "SU", gradient: "from-cyan-400 to-blue-500", unread: 0, isOnline: true, type: "personal", mediaPreview: "location" },
];

const CALLS: CallRecord[] = [
  { id: "r1", name: "Graham McBride", initials: "GM", gradient: "from-blue-500 to-indigo-600", time: "9:22 AM", duration: "4m 17s", type: "outgoing" },
  { id: "r2", name: "Puthachad Kuthong", initials: "PK", gradient: "from-orange-400 to-red-500", time: "8:50 AM", type: "missed", count: 3 },
  { id: "r3", name: "Elisha St. Denis", initials: "ES", gradient: "from-teal-400 to-cyan-500", time: "8:15 AM", duration: "12m 3s", type: "video" },
];

const BUSINESS_MESSAGES: BusinessMessage[] = [
  { id: "b1", business: "Kori Hair Studio", category: "Booking Confirmation", lastMessage: "Your appointment is confirmed for Saturday 10:30am", time: "Today", initials: "KH", gradient: "from-amber-400 to-orange-500", unread: 1, bookingStatus: "confirmed" },
  { id: "b2", business: "Ostro Coffee Bar", category: "Receipt", lastMessage: "Thanks for your visit! Your receipt for $18.50", time: "Yesterday", initials: "OC", gradient: "from-amber-700 to-stone-600", unread: 0, bookingStatus: "completed" },
  { id: "b3", business: "North Fork Plumbing", category: "Quote", lastMessage: "We've sent you a quote for the inspection", time: "Monday", initials: "NF", gradient: "from-blue-500 to-indigo-600", unread: 2, bookingStatus: "pending" },
];

/* ─── MAIN COMPONENT (SPLIT VIEW ARCHITECTURE) ─── */
function MessagesLayout() {
  const [activeTab, setActiveTab] = useState<MessageTab>("messages");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Determine if a chat is active based on the URL (simulated here for layout purposes)
  // We use useRouterState to ensure this is reactive on client-side navigation.
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isChatOpen = pathname.includes("/chat/") || pathname.includes("/call/");
  const isCallRoute = pathname.includes("/call/");

  return (
    <div className="flex h-[calc(100vh-var(--bottom-nav-height))] md:h-screen bg-background">
      {/* ─── LEFT SIDEBAR (INBOX) ─── */}
      <div className={`w-full md:w-[400px] lg:w-[450px] flex flex-col border-r border-border shrink-0 transition-transform ${isChatOpen ? "hidden md:flex" : "flex"}`}>
        
        {/* Header */}
        <div className="px-6 pt-4 pb-5 flex justify-between items-center bg-background/80 backdrop-blur-xl z-10 sticky top-0">
          <h1 className="text-3xl font-display font-semibold tracking-tight leading-tight">Messages</h1>
          <div className="flex gap-2">
            <button className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
              <Edit size={18} />
            </button>
            <button className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center hover:bg-foreground/10 transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-foreground/5 border border-transparent rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Tab Selector */}
        <div className="px-6 pb-4">
          <div className="flex bg-foreground/5 p-1 rounded-xl">
            {(["messages", "calls", "business"] as MessageTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="relative flex-1 py-1.5 text-sm font-medium capitalize z-10"
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="messages-tab"
                    className="absolute inset-0 bg-background shadow-sm rounded-lg border border-border"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-20 ${activeTab === tab ? "text-foreground" : "text-muted-foreground"}`}>
                  {tab}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24 md:pb-6 no-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-1">
                {CONVERSATIONS.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => (
                  <ConversationItem key={conv.id} conv={conv} />
                ))}
              </motion.div>
            )}

            {activeTab === "calls" && (
              <motion.div key="calls" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-1">
                {CALLS.map((call) => (
                  <CallItem key={call.id} call={call} />
                ))}
              </motion.div>
            )}

            {activeTab === "business" && (
              <motion.div key="business" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-1">
                {BUSINESS_MESSAGES.map((biz) => (
                  <BusinessItem key={biz.id} biz={biz} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── RIGHT DETAIL VIEW ─── */}
      <div className={`flex-1 flex-col relative bg-muted/30 ${isChatOpen ? "flex fixed inset-0 z-50 md:relative md:z-auto pt-0" : "hidden md:flex"}`}>
        {isChatOpen ? (
          <Outlet />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={32} className="text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-display font-medium tracking-tight mb-2">Nexa Messages</h2>
            <p className="text-muted-foreground max-w-sm">Select a conversation from the sidebar or start a new one to begin messaging.</p>
            <button className="mt-8 bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition-opacity">
              New Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── LIST ITEMS ─── */

function ConversationItem({ conv }: { conv: Conversation }) {
  return (
    <Link to="/messages/chat/$id" params={{ id: conv.id }} className="block">
      <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer group">
        <div className="relative shrink-0">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${conv.gradient} flex items-center justify-center text-white font-display text-lg shadow-inner`}>
            {conv.initials}
          </div>
          {conv.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="font-semibold text-base truncate pr-2 group-hover:text-primary transition-colors">{conv.name}</h3>
            <span className={`text-xs whitespace-nowrap ${conv.unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>{conv.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className={`text-sm truncate pr-2 flex items-center gap-1.5 ${conv.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {conv.mediaPreview === 'audio' && <Mic size={14} className="text-blue-500" />}
              {conv.mediaPreview === 'image' && <ImageIcon size={14} className="text-green-500" />}
              {conv.mediaPreview === 'location' && <MapPin size={14} className="text-red-500" />}
              {conv.mediaPreview === 'video' && <Video size={14} className="text-purple-500" />}
              <span className="truncate">{conv.lastMessage}</span>
            </p>
            {conv.unread > 0 && (
              <div className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                {conv.unread}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function CallItem({ call }: { call: CallRecord }) {
  return (
    <Link to="/messages/call/$id" params={{ id: call.id }} className="block">
      <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${call.gradient} flex items-center justify-center text-white font-display text-lg shrink-0`}>
          {call.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className={`font-semibold text-base truncate ${call.type === 'missed' ? 'text-red-500' : ''}`}>{call.name}</h3>
            <span className="text-xs text-muted-foreground">{call.time}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {call.type === 'missed' && <PhoneMissed size={14} className="text-red-500" />}
            {call.type === 'incoming' && <PhoneIncoming size={14} />}
            {call.type === 'outgoing' && <PhoneOutgoing size={14} />}
            {call.type === 'video' && <Video size={14} />}
            <span className="capitalize">{call.type} {call.type === 'video' ? 'Call' : ''}</span>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
          {call.type === 'video' ? <Video size={20} /> : <Phone size={20} />}
        </button>
      </div>
    </Link>
  );
}

function BusinessItem({ biz }: { biz: BusinessMessage }) {
  return (
    <Link to="/messages/chat/$id" params={{ id: biz.id }} className="block">
      <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-foreground/5 transition-colors cursor-pointer">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${biz.gradient} flex items-center justify-center text-white font-display text-lg shrink-0 shadow-inner`}>
          {biz.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline mb-0.5">
            <h3 className="font-semibold text-base truncate">{biz.business}</h3>
            <span className="text-xs text-muted-foreground">{biz.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 size={12} />
            <span className="truncate text-xs uppercase tracking-wider">{biz.category}</span>
          </div>
          <p className={`text-sm truncate ${biz.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>
            {biz.lastMessage}
          </p>
        </div>
      </div>
    </Link>
  );
}

