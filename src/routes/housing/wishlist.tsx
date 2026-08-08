import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { Heart, MapPin, Share2, MoreHorizontal, Map as MapIcon, Grid } from "lucide-react";

export const Route = createFileRoute("/housing/wishlist")({
  head: () => ({
    meta: [{ title: "Wishlists — Nexa Housing" }],
  }),
  component: Wishlists,
});

const WISHLISTS = [
  {
    id: "w1",
    name: "Summer in Brooklyn",
    saved: 12,
    cover: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    lastUpdated: "2 days ago"
  },
  {
    id: "w2",
    name: "Weekend Getaways",
    saved: 5,
    cover: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?q=80&w=800&auto=format&fit=crop",
    lastUpdated: "1 week ago"
  },
  {
    id: "w3",
    name: "Dream Lofts",
    saved: 24,
    cover: "https://images.unsplash.com/photo-1502672260266-1c1c24240f38?q=80&w=800&auto=format&fit=crop",
    lastUpdated: "1 month ago"
  }
];

function Wishlists() {
  const [view, setView] = useState<'grid' | 'map'>('grid');

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <Reveal>
            <KineticHeading text="Wishlists" className="text-4xl md:text-6xl" />
          </Reveal>
          
          <Reveal delay={0.1}>
            <div className="flex bg-surface-2 p-1 rounded-full">
               <button 
                 onClick={() => setView('grid')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'grid' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
               >
                 <Grid size={16} /> Grid
               </button>
               <button 
                 onClick={() => setView('map')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'map' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
               >
                 <MapIcon size={16} /> Map
               </button>
            </div>
          </Reveal>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {WISHLISTS.map((list, i) => (
              <Reveal key={list.id} delay={i * 0.1}>
                <Link to="/housing" className="block group">
                  <div className="aspect-square rounded-2xl overflow-hidden mb-4 relative bg-surface">
                    <img 
                      src={list.cover} 
                      alt={list.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-1 group-hover:text-primary transition-colors">{list.name}</h3>
                  <div className="text-sm text-muted-foreground font-medium">{list.saved} saved properties • Updated {list.lastUpdated}</div>
                </Link>
              </Reveal>
            ))}
            
            <Reveal delay={0.3}>
              <button className="w-full aspect-square rounded-2xl border-2 border-dashed border-hairline flex flex-col items-center justify-center text-muted-foreground hover:bg-surface hover:text-foreground hover:border-foreground/20 transition-all group">
                 <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5v14"/></svg>
                 </div>
                 <h3 className="font-semibold">Create new wishlist</h3>
              </button>
            </Reveal>
          </div>
        ) : (
          <div className="h-[600px] rounded-3xl overflow-hidden relative border border-hairline bg-surface flex items-center justify-center">
             <div className="absolute inset-0 opacity-50 saturate-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, black 1px, transparent 0)", backgroundSize: "20px 20px" }} />
             <div className="relative z-10 text-center">
               <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
               <h3 className="font-display text-2xl font-semibold mb-2">Map view coming soon</h3>
               <p className="text-muted-foreground">Interactive map of all your saved properties.</p>
               <button onClick={() => setView('grid')} className="mt-6 font-semibold text-primary underline">Return to Grid</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
