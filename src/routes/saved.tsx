import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";

export const Route = createFileRoute("/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Nexa" },
      { name: "description", content: "Your saved local businesses and lists." },
    ],
  }),
  component: Saved,
});

const SAVED_BUSINESSES = [
  { slug: "kori", name: "Kori Hair Studio", tag: "Salon", rating: 4.9, dist: "0.3 mi", img: "https://images.unsplash.com/photo-1521590832167-7bfc17484d56?q=80&w=800&auto=format&fit=crop" },
  { slug: "mira", name: "Mira Yoga", tag: "Wellness", rating: 4.8, dist: "0.9 mi", img: "https://images.unsplash.com/photo-1599901860904-17e0868f000c?q=80&w=800&auto=format&fit=crop" },
  { slug: "atelier", name: "Atelier Fleur", tag: "Florist", rating: 5.0, dist: "1.3 mi", img: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?q=80&w=800&auto=format&fit=crop" },
];

function Saved() {
  const [activeTab, setActiveTab] = useState<"favorites" | "lists">("favorites");

  return (
    <div className="pt-28 pb-44 min-h-screen">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <Kicker>Collection</Kicker>
        <div className="mt-5">
          <KineticHeading text="Saved" className="text-5xl md:text-7xl" />
        </div>

        <Reveal delay={0.2} className="mt-8 flex gap-2">
          <button onClick={() => setActiveTab("favorites")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "favorites" ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"}`}>All Favorites</button>
          <button onClick={() => setActiveTab("lists")} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === "lists" ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10"}`}>Custom Lists</button>
        </Reveal>

        <Reveal delay={0.4} className="mt-10">
          {activeTab === "favorites" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAVED_BUSINESSES.map((b, i) => (
                <Link key={b.slug} to={`/business/${b.slug}`} className="group block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="surface-card overflow-hidden rounded-[2rem] relative"
                  >
                    <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/50 backdrop-blur-md flex items-center justify-center text-primary">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div className="aspect-[4/3] relative overflow-hidden bg-foreground/5">
                      <img src={b.img} alt={b.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{b.tag}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          <span>{b.rating}</span>
                        </div>
                      </div>
                      <h3 className="font-display text-xl">{b.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{b.dist} away</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/></svg>
              </div>
              <p>You haven't created any custom lists yet.</p>
              <button className="mt-4 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm transition-colors text-foreground">Create List</button>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
