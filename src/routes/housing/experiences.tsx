import { createFileRoute, Link } from "@tanstack/react-router";
import { KineticHeading, Kicker, Reveal } from "@/components/app-shell";
import { MapPin, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/housing/experiences")({
  head: () => ({
    meta: [{ title: "Local Experiences — Nexa" }],
  }),
  component: Experiences,
});

const EXPERIENCES = [
  {
    id: "e1",
    title: "Hidden Bars of Williamsburg",
    host: "Alex",
    price: 45,
    rating: 4.95,
    reviews: 128,
    duration: "3 hours",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e2",
    title: "Brooklyn Bridge Sunset Bike Tour",
    host: "Sarah",
    price: 65,
    rating: 4.88,
    reviews: 342,
    duration: "2.5 hours",
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e3",
    title: "Authentic Pasta Making Class",
    host: "Marco",
    price: 85,
    rating: 4.98,
    reviews: 89,
    duration: "4 hours",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "e4",
    title: "Street Art Photography Walk",
    host: "Jay",
    price: 35,
    rating: 4.92,
    reviews: 215,
    duration: "2 hours",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=600&auto=format&fit=crop"
  }
];

function Experiences() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <Reveal>
          <Kicker>Experiences</Kicker>
          <KineticHeading text="Discover local secrets." className="text-4xl md:text-6xl mt-4 mb-2" />
          <p className="text-lg text-muted-foreground max-w-2xl">Hosted by passionate locals. Book unique activities and tours during your stay.</p>
        </Reveal>

        <div className="mt-12 flex gap-3 overflow-x-auto hide-scrollbar pb-4">
           {['All', 'Art & Culture', 'Food & Drink', 'Sports', 'Entertainment', 'Tours', 'Wellness'].map(c => (
             <button key={c} className="whitespace-nowrap px-5 py-2.5 rounded-full border border-hairline font-medium text-sm hover:border-foreground/30 transition-colors bg-surface">
               {c}
             </button>
           ))}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCES.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.1}>
              <Link to="/housing" className="block group cursor-pointer">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-4 relative">
                  <img src={exp.image} alt={exp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-black px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 shadow-sm">
                    <Star size={12} className="fill-black" /> {exp.rating} <span className="text-black/60 font-normal">({exp.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 font-medium">
                  <MapPin size={12} /> Brooklyn • <Clock size={12} className="ml-1" /> {exp.duration}
                </div>
                <h3 className="font-semibold text-base leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">{exp.title}</h3>
                <div className="text-sm font-semibold">
                  From ${exp.price} <span className="font-normal text-muted-foreground">/ person</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
