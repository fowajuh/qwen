import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { api } from "@/lib/housing-data";
import { MoreHorizontal, Eye, EyeOff, Pencil, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/housing/host/listings")({
  head: () => ({ meta: [{ title: "Your Listings — Nexa Housing" }] }),
  component: HostListings,
});

function HostListings() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["housingListings", "host-mine"],
    queryFn: () => api.getListings(),
  });
  // Mock "my listings" — first 3 of the catalog, each with a host-facing status.
  const mine = listings.slice(0, 3).map((l, i) => ({
    ...l,
    status: (["active", "active", "paused"] as const)[i],
    views: [412, 289, 96][i],
    bookings: [8, 5, 1][i],
  }));

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
          <Reveal>
            <Kicker>Host tools</Kicker>
            <KineticHeading text="Your listings" className="text-4xl md:text-6xl mt-4" />
          </Reveal>
          <Link
            to="/housing/host"
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" /> New listing
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-[4/5] rounded-2xl bg-surface animate-pulse" />)
            : mine.map((item) => (
                <div key={item.id} className="surface-card rounded-2xl overflow-hidden group">
                  <div className="aspect-[4/3] relative">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    <span
                      className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "active" ? "bg-green-500 text-white" : "bg-foreground/80 text-background"
                      }`}
                    >
                      {item.status === "active" ? "Active" : "Paused"}
                    </span>
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                        className="w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center shadow-sm"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {openMenu === item.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-background border border-hairline rounded-xl shadow-drama overflow-hidden z-10">
                          <Link
                            to="/housing/host/listings/$id/edit"
                            params={{ id: item.id }}
                            className="flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-surface transition-colors"
                          >
                            <Pencil className="w-4 h-4" /> Edit listing
                          </Link>
                          <button className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-surface transition-colors text-left">
                            {item.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {item.status === "active" ? "Pause listing" : "Reactivate"}
                          </button>
                          <button className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:bg-surface transition-colors text-left text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[15px] leading-tight mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{item.city}, {item.country} · ${item.price}/night</p>
                    <div className="flex items-center justify-between text-xs font-medium border-t border-hairline pt-3">
                      <span>{item.views} views</span>
                      <span>{item.bookings} bookings</span>
                      <Link
                        to="/housing/host/listings/$id/edit"
                        params={{ id: item.id }}
                        className="underline font-semibold"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
