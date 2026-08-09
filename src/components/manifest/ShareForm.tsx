import { useState } from "react";
import { Eye, Pencil, Plane } from "lucide-react";
import type { Collaborator } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const roleMeta: Record<Collaborator["role"], { label: string; icon: typeof Eye; tone: string }> = {
  owner: { label: "Owner", icon: Plane, tone: "text-beacon-amber" },
  editor: { label: "Editor", icon: Pencil, tone: "text-horizon-teal" },
  viewer: { label: "Viewer", icon: Eye, tone: "text-ink-60" },
};

export function ShareForm({
  collaborators,
  onInvite,
  busy,
}: {
  collaborators: Collaborator[];
  onInvite: (email: string, role: "editor" | "viewer") => void;
  busy?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");

  return (
    <div className="space-y-5 pt-1">
      <div>
        <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60 mb-2">
          On this manifest · {collaborators.length}
        </p>
        <ul className="space-y-2">
          {collaborators.map((c) => {
            const meta = roleMeta[c.role];
            const Icon = meta.icon;
            return (
              <li
                key={c.userId}
                className="flex items-center justify-between gap-3 rounded-sm border border-ink-30/20 bg-runway-sand/40 px-3 py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-departure-navy text-cloud-white flex items-center justify-center num text-xs shrink-0">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-ink-90 truncate">{c.name}</span>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-1 num text-[10px] uppercase tracking-[0.18em] shrink-0",
                    meta.tone,
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="perforation-divider" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.trim()) return;
          onInvite(email.trim(), role);
          setEmail("");
        }}
        className="space-y-3"
      >
        <p className="num text-[10px] uppercase tracking-[0.2em] text-ink-60">
          Invite a co-traveler
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="friend@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 rounded-sm border border-ink-30/40 bg-cloud-white px-3 py-2.5 text-sm text-ink-90 outline-none focus:border-beacon-amber"
          />
        </div>
        <div className="flex gap-2">
          {(["editor", "viewer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex-1 num text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded-sm border transition-colors",
                role === r
                  ? "bg-departure-navy text-cloud-white border-departure-navy"
                  : "border-ink-30/40 text-ink-60",
              )}
            >
              {roleMeta[r].label}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full num text-[11px] uppercase tracking-[0.2em] bg-beacon-amber text-departure-navy px-4 py-2.5 rounded-sm disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send invite"}
        </button>
      </form>
    </div>
  );
}
