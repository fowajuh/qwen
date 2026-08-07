import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { X, Search, Plus, Check, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { DISCOVER_FEED } from "./index";

export const Route = createFileRoute("/discover/save-modal/$id")({
  component: DiscoverSaveModalId,
});

const BOARDS = [
  { id: "b1", name: "NYC Guide", pins: 34, secret: false },
  { id: "b2", name: "Weekend Trips", pins: 12, secret: false },
  { id: "b3", name: "Food bucket list", pins: 58, secret: false },
  { id: "b4", name: "Design Inspo", pins: 121, secret: true },
  { id: "b5", name: "Wishlist", pins: 9, secret: true },
];

function DiscoverSaveModalId() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const pin = DISCOVER_FEED.find((p) => p.id === id) || DISCOVER_FEED[0];

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const filtered = useMemo(
    () => BOARDS.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const close = () => navigate({ to: "/discover/pin/$id", params: { id: pin.id } });

  const saveToBoard = (name: string) => {
    setSelected(name);
    setTimeout(close, 350);
  };

  return (
    <div className="w-full min-h-screen bg-background pt-safe animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline md:max-w-[480px] md:mx-auto">
        <button onClick={close} className="p-2 -ml-2 rounded-full hover:bg-surface transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-[16px] font-bold">Save to board</h1>
        <div className="w-10" />
      </div>

      {/* Pin preview */}
      <div className="flex items-center gap-3 px-4 py-4 md:max-w-[480px] md:mx-auto">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface shrink-0">
          <img src={pin.image} alt={pin.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[14px] truncate">{pin.title}</p>
          <p className="text-[12px] text-muted-foreground truncate">by {pin.author}</p>
        </div>
      </div>

      {/* Search boards */}
      <div className="px-4 pb-3 md:max-w-[480px] md:mx-auto">
        <div className="flex items-center gap-2 bg-surface rounded-full px-4 h-11 border border-hairline">
          <Search className="w-4.5 h-4.5 text-muted-foreground shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Create board row */}
      <div className="px-4 pb-2 md:max-w-[480px] md:mx-auto">
        {creating ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface">
            <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center shrink-0 border border-hairline border-dashed">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <input
              autoFocus
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && newBoardName.trim() && saveToBoard(newBoardName.trim())}
              placeholder="Name your board"
              className="flex-1 bg-transparent text-[16px] font-bold outline-none placeholder:text-muted-foreground placeholder:font-medium"
            />
            <button
              disabled={!newBoardName.trim()}
              onClick={() => newBoardName.trim() && saveToBoard(newBoardName.trim())}
              className="px-4 py-2 rounded-full font-bold text-[13px] bg-foreground text-background disabled:opacity-40 shrink-0"
            >
              Create
            </button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors">
            <div className="w-14 h-14 rounded-lg bg-surface flex items-center justify-center shrink-0 border border-hairline border-dashed">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="font-bold text-[16px]">Create board</span>
          </button>
        )}
      </div>

      {/* Board list */}
      <div className="px-4 pb-8 space-y-1 md:max-w-[480px] md:mx-auto">
        <p className="text-[12px] font-semibold text-muted-foreground px-3 pt-2 pb-1">Your boards</p>
        {filtered.map((board) => {
          const isSelected = selected === board.name;
          return (
            <button
              key={board.id}
              onClick={() => saveToBoard(board.name)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-lg bg-muted shrink-0 border border-hairline overflow-hidden">
                  <img src={pin.image} alt="" className="w-full h-full object-cover opacity-60" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] truncate">{board.name}</span>
                    {board.secret && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                  </div>
                  <span className="text-[12px] text-muted-foreground">{board.pins} pins</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isSelected ? "bg-primary" : "bg-surface border border-hairline"}`}>
                {isSelected && <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-8">No boards match "{query}"</p>
        )}
      </div>
    </div>
  );
}
