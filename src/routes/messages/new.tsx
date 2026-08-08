import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/messages/new")({
  component: MessagesNew,
});

function MessagesNew() {
  const navigate = useNavigate();
  return (
    <div className="w-full min-h-screen bg-background p-4 pt-safe animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate({ to: '..' })} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight">MessagesNew</h1>
      </div>
      
      <div className="text-muted-foreground text-sm">
        This is a generated sub-route. Replace with actual implementation.
      </div>
    </div>
  );
}
