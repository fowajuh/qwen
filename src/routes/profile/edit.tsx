import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile/edit")({
  component: ProfileEdit,
});

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [name, setName] = useState("Alex Parker");
  const [username, setUsername] = useState("alexparker");
  const [bio, setBio] = useState("Exploring the best spots in town ✨\nNYC-based.");
  const [link, setLink] = useState("alexparker.co");

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-hairline px-4 py-3 flex items-center justify-between pt-safe">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-surface text-foreground">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-[16px]">Edit profile</h1>
        <button onClick={() => navigate({ to: "/profile" })} className="font-bold text-[15px] text-primary">Save</button>
      </div>

      <div className="px-5 py-8">
        {/* Avatar Edit */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface border-2 border-background shadow-md">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-foreground rounded-full border-2 border-background flex items-center justify-center shadow-sm">
              <Camera className="w-4 h-4 text-background" />
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-muted-foreground ml-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface border-b border-hairline px-4 py-3 text-[15px] focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-muted-foreground ml-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface border-b border-hairline px-4 py-3 text-[15px] focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-muted-foreground ml-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full bg-surface border-b border-hairline px-4 py-3 text-[15px] focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-muted-foreground ml-1">Add link</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-surface border-b border-hairline px-4 py-3 text-[15px] focus:outline-none focus:border-foreground transition-colors text-primary font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
