import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, User, Heart, Share2, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/home/live")({
  component: LivePage,
});

function LivePage() {
  const [comments, setComments] = useState<{user: string, text: string}[]>([
    { user: "josh", text: "omg that looks so good" },
    { user: "maya_osei", text: "where is this??" },
    { user: "sarah", text: "🔥" },
  ]);

  return (
    <div className="w-full h-screen bg-black text-white overflow-hidden relative">
      {/* Background stream (simulated) */}
      <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Live Stream" />
      
      {/* Header */}
      <div className="absolute top-0 inset-x-0 p-4 pt-safe flex items-start justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="Host" />
            </div>
            <div className="absolute -bottom-2 inset-x-0 flex justify-center">
              <span className="bg-primary text-[9px] font-bold px-1.5 py-0.5 rounded-sm">LIVE</span>
            </div>
          </div>
          <div>
            <div className="font-bold text-[14px]">ale_snedy</div>
            <div className="text-[12px] opacity-80">1.2K viewers</div>
          </div>
          <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-[12px] font-bold ml-2">
            Follow
          </button>
        </div>
        <button onClick={() => window.history.back()} className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center">
          <X size={20} />
        </button>
      </div>

      {/* Footer area */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="h-48 overflow-y-auto no-scrollbar flex flex-col justify-end space-y-2 mb-4 mask-image-b">
          {comments.map((c, i) => (
            <div key={i} className="text-[13px]">
              <span className="font-bold opacity-80 mr-2">{c.user}</span>
              <span>{c.text}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/20 rounded-full px-4 py-2.5 backdrop-blur-md">
            <input type="text" placeholder="Add comment..." className="bg-transparent w-full text-white placeholder:text-white/60 outline-none text-[14px]" />
          </div>
          <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Share2 size={20} />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Heart size={20} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
