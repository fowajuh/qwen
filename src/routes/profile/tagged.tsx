import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, UserSquare2 } from "lucide-react";

export const Route = createFileRoute("/profile/tagged")({
  component: ProfileTagged,
});

function ProfileTagged() {
  return (
    <div className="w-full min-h-screen bg-background pt-safe pb-[calc(var(--bottom-nav-height)+2rem)]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-center relative border-b border-hairline">
        <button onClick={() => window.history.back()} className="absolute left-4 p-1 -ml-1 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">Photos of you</h1>
      </div>

      <div className="flex flex-col items-center justify-center text-center px-8 py-24">
        <div className="w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-4">
          <UserSquare2 className="w-7 h-7" />
        </div>
        <p className="font-bold text-[17px]">No tagged posts</p>
        <p className="text-[13px] text-muted-foreground mt-1 max-w-[260px]">
          Photos and videos you're tagged in will appear here, even if you didn't post them.
        </p>
      </div>
    </div>
  );
}
