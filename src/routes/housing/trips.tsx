import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { KineticHeading, Reveal, Kicker } from "@/components/app-shell";
import { MapPin, Calendar, Clock, ChevronRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/housing/trips")({
  head: () => ({
    meta: [{ title: "My Trips — Nexa Housing" }],
  }),
  component: Trips,
});

const TRIPS = [
  {
    id: "t1",
    status: "upcoming",
    title: "Design Loft in Williamsburg",
    host: "Alex",
    dates: "Oct 12 - 15, 2026",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    address: "123 Bedford Ave, Brooklyn, NY",
    confirmation: "HMZ9YX2Q"
  },
  {
    id: "t2",
    status: "past",
    title: "Cozy Studio in DUMBO",
    host: "Sarah",
    dates: "Jul 4 - 8, 2026",
    image: "https://images.unsplash.com/photo-1499916078039-922301b0eb9b?q=80&w=800&auto=format&fit=crop",
    address: "45 Washington St, Brooklyn, NY",
    confirmation: "XYZ123AB"
  }
];

function Trips() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const filteredTrips = TRIPS.filter(t => t.status === activeTab);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-10">
        <Reveal>
          <KineticHeading text="Trips" className="text-4xl md:text-6xl mb-8" />
        </Reveal>

        <div className="flex gap-6 border-b border-hairline mb-8 overflow-x-auto hide-scrollbar">
          {(['upcoming', 'past', 'cancelled'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-base font-medium capitalize relative whitespace-nowrap transition-colors ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tripsTab" className="absolute bottom-0 inset-x-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {filteredTrips.length > 0 ? (
              filteredTrips.map(trip => (
                <div key={trip.id} className="surface-card flex flex-col md:flex-row overflow-hidden hover:border-foreground/20 transition-colors group cursor-pointer">
                   <div className="md:w-1/3 h-48 md:h-auto relative">
                     <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   </div>
                   <div className="p-6 flex-1 flex flex-col justify-between">
                     <div>
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-display text-2xl font-semibold">{trip.title}</h3>
                         <div className="bg-foreground/5 text-foreground px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">{trip.status}</div>
                       </div>
                       <p className="text-muted-foreground font-medium flex items-center gap-2 mb-1">
                         <Calendar size={16} /> {trip.dates}
                       </p>
                       <p className="text-muted-foreground font-medium flex items-center gap-2">
                         <MapPin size={16} /> {trip.address}
                       </p>
                     </div>
                     <div className="mt-6 pt-6 border-t border-hairline flex flex-wrap gap-4 items-center justify-between">
                       <div className="text-sm font-medium">
                         <span className="text-muted-foreground">Confirmation code:</span> <span className="font-mono">{trip.confirmation}</span>
                       </div>
                       <div className="flex gap-2">
                         <Link to="/messages" className="w-10 h-10 rounded-full border border-hairline flex items-center justify-center hover:bg-surface transition-colors">
                           <MessageCircle size={18} />
                         </Link>
                         {trip.status === 'past' && (
                           <Link
                             to="/housing/reviews/write/$bookingId"
                             params={{ bookingId: trip.id }}
                             className="px-5 py-2 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors"
                           >
                             Write a review
                           </Link>
                         )}
                         <Link
                           to="/housing/$id"
                           params={{ id: "1" }}
                           className="px-5 py-2 rounded-full border border-hairline font-semibold text-sm hover:bg-surface transition-colors flex items-center gap-1"
                         >
                           Show details <ChevronRight size={16} />
                         </Link>
                       </div>
                     </div>
                   </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                 <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
                   <MapPin size={32} className="text-muted-foreground" />
                 </div>
                 <h3 className="font-display text-2xl font-semibold mb-2">No {activeTab} trips</h3>
                 <p className="text-muted-foreground mb-8">Time to dust off your bags and start planning your next adventure.</p>
                 <Link to="/housing">
                   <button className="bg-foreground text-background px-8 py-3.5 rounded-full font-semibold transition-transform hover:scale-105">
                     Start searching
                   </button>
                 </Link>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
