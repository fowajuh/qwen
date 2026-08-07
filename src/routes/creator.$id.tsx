import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MoreVertical, Link as LinkIcon, Grid, PlaySquare, Bookmark, UserPlus, MessageCircle } from "lucide-react";
import { useState } from "react";
import { DISCOVER_FEED } from "./discover/index"; // just for some mock data

export const Route = createFileRoute("/creator/$id")({
  component: CreatorProfile,
});

function CreatorProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"grid" | "reels" | "saved">("grid");

  return (
    <div className="w-full bg-background min-h-screen pb-safe animate-in slide-in-from-right-full duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-hairline pt-safe">
        <button onClick={() => navigate({ to: "/home" })} className="p-2 -ml-2 rounded-full hover:bg-surface">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">{id}</h1>
        <button className="p-2 -mr-2 rounded-full hover:bg-surface">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-[800px] mx-auto">
        {/* Profile Info */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-6 mb-4">
            <div className="w-20 h-20 rounded-full bg-surface shrink-0 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex justify-around text-center">
              <div>
                <div className="font-bold text-[17px]">29</div>
                <div className="text-[13px] text-muted-foreground">posts</div>
              </div>
              <div>
                <div className="font-bold text-[17px]">156K</div>
                <div className="text-[13px] text-muted-foreground">followers</div>
              </div>
              <div>
                <div className="font-bold text-[17px]">1</div>
                <div className="text-[13px] text-muted-foreground">following</div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h2 className="font-bold text-[14px]">FRIED</h2>
            <p className="text-[14px] leading-tight mt-1 whitespace-pre-wrap">WORLDWIDE SHIPPING</p>
            <a href="#" className="flex items-center gap-1 text-[14px] text-blue-500 font-medium mt-1">
              <LinkIcon className="w-3 h-3" />
              friedskateboarding.com and 1 more
            </a>
          </div>

          <div className="flex gap-2 mb-6">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg text-[14px] transition-colors">
              Follow
            </button>
            <button className="flex-1 bg-surface hover:bg-foreground/5 text-foreground font-semibold py-1.5 rounded-lg text-[14px] transition-colors border border-hairline">
              Message
            </button>
            <button className="px-3 bg-surface hover:bg-foreground/5 text-foreground font-semibold py-1.5 rounded-lg transition-colors border border-hairline">
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Highlights */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {["MAY DROP", "IMPORTANT", "REVIEWS", "WA"].map((h) => (
              <div key={h} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full border border-muted p-1">
                  <div className="w-full h-full rounded-full bg-surface group-active:scale-95 transition-transform overflow-hidden">
                    <div className="w-full h-full bg-foreground/10" />
                  </div>
                </div>
                <span className="text-[11px] font-medium">{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-hairline sticky top-[var(--top-safe)] bg-background z-40">
          <button
            onClick={() => setActiveTab("grid")}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors \${
              activeTab === "grid" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <Grid className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors \${
              activeTab === "reels" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <PlaySquare className="w-6 h-6" />
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3 flex justify-center border-b-2 transition-colors \${
              activeTab === "saved" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground"
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-3 gap-[1px]">
          {DISCOVER_FEED.map((item, i) => (
            <Link key={i} to="/creator/video/$id" params={{ id: id }} className="aspect-[3/4] bg-surface relative group block">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
              {i % 3 === 0 && <PlaySquare className="absolute top-2 right-2 w-4 h-4 text-white" fill="white" />}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
