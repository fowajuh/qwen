import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { motion } from "framer-motion";
import { 
  Calendar, MapPin, Star, Clock, MessageCircle, 
  CheckCircle2, AlertCircle, Wifi, Coffee, Car
} from "lucide-react";
import { MessageThread } from "~/components/manifest/MessageThread";
import { useGamification } from "~/lib/gamification-store";
import { hapticFeedback } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const trip = {
    id: params.tripId || "1",
    status: "upcoming",
    listing: {
      title: "Luxury Glass House in Joshua Tree",
      location: "Joshua Tree, California",
      image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
      rating: 4.96,
      host: { name: "Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", responseTime: "within an hour" },
      amenities: ["High-Speed WiFi", "Free Parking", "Pool", "Coffee Maker"]
    },
    checkIn: "2025-02-15",
    checkOut: "2025-02-18",
    guests: 2,
    totalPrice: 1350,
    bookingRef: "JBX-2025-A7K9",
    daysUntil: 12,
    checklist: [
      { id: 1, task: "Confirm check-in time with host", completed: false },
      { id: 2, task: "Review house rules", completed: true },
      { id: 3, task: "Pack for desert weather", completed: false },
      { id: 4, task: "Download offline maps", completed: false }
    ]
  };
  return json({ trip });
}

export default function TripDetail() {
  const { trip } = useLoaderData<{ trip: any }>();
  const { awardXP } = useGamification();

  const handleCheckIn = () => {
    hapticFeedback("medium");
    awardXP("check_in");
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "upcoming": return { color: "bg-blue-50 text-blue-700", icon: Calendar, label: "Upcoming" };
      case "active": return { color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2, label: "Checked In" };
      case "completed": return { color: "bg-slate-50 text-slate-700", icon: Star, label: "Completed" };
      default: return { color: "bg-slate-50 text-slate-700", icon: Clock, label: "Pending" };
    }
  };

  const statusConfig = getStatusConfig(trip.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={trip.listing.image} alt={trip.listing.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${statusConfig.color} backdrop-blur-sm`}>
              <StatusIcon className="h-4 w-4" />{statusConfig.label}
            </span>
            {trip.status === "upcoming" && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                In {trip.daysUntil} days
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{trip.listing.title}</h1>
          <div className="flex items-center gap-2 text-sm md:text-base opacity-90">
            <MapPin className="h-4 w-4" />{trip.listing.location}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        
        {/* Trip Details Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Check-in</p>
              <p className="font-display font-bold text-slate-900">{new Date(trip.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Checkout</p>
              <p className="font-display font-bold text-slate-900">{new Date(trip.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Guests</p>
              <p className="font-display font-bold text-slate-900">{trip.guests}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total</p>
              <p className="font-display font-bold text-indigo-600">${trip.totalPrice}</p>
            </div>
          </div>
          
          <div className="rounded-xl bg-slate-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Booking Reference</p>
              <p className="font-mono font-bold text-slate-900">{trip.bookingRef}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(trip.bookingRef); hapticFeedback("light"); }} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Copy</button>
          </div>
        </motion.div>

        {/* Day-of Checklist */}
        {trip.status === "upcoming" && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600" />Trip Checklist
            </h2>
            <div className="space-y-3">
              {trip.checklist.map((item: any, idx: number) => (
                <motion.label key={item.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.05 + 0.2 }}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked={item.completed} className="h-5 w-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  <span className={`font-medium ${item.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.task}</span>
                </motion.label>
              ))}
            </div>
            {trip.status === "active" && (
              <motion.button whileTap={{ scale: 0.98 }} onClick={handleCheckIn}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 font-bold text-white shadow-lg shadow-emerald-500/30">
                ✓ Check In & Earn 100 XP
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Amenities Preview */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-white p-6 shadow-lg">
          <h2 className="font-display text-xl font-bold text-slate-900 mb-4">What's included</h2>
          <div className="grid grid-cols-2 gap-3">
            {trip.listing.amenities.map((amenity: string) => (
              <div key={amenity} className="flex items-center gap-2 rounded-lg bg-slate-50 p-2">
                {amenity.includes("WiFi") && <Wifi className="h-4 w-4 text-indigo-600" />}
                {amenity.includes("Parking") && <Car className="h-4 w-4 text-indigo-600" />}
                {amenity.includes("Coffee") && <Coffee className="h-4 w-4 text-indigo-600" />}
                {!amenity.includes("WiFi") && !amenity.includes("Parking") && !amenity.includes("Coffee") && <CheckCircle2 className="h-4 w-4 text-indigo-600" />}
                <span className="text-sm font-medium text-slate-700">{amenity}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Host Communication */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-indigo-600" />Message Host
            </h2>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />Typically responds {trip.listing.host.responseTime}
            </span>
          </div>
          <MessageThread 
            hostName={trip.listing.host.name} 
            hostAvatar={trip.listing.host.avatar}
            listingTitle={trip.listing.title}
          />
        </motion.div>

        {/* Review Prompt for Completed Trips */}
        {trip.status === "completed" && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 p-6 shadow-lg text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold mb-2">How was your stay?</h2>
                <p className="text-sm opacity-90 mb-4">Leave a review and earn 50 XP. Add photos for +25 XP bonus!</p>
                <button className="rounded-xl bg-white px-6 py-2.5 font-bold text-indigo-600 hover:bg-indigo-50 transition-colors">Write Review</button>
              </div>
              <Star className="h-12 w-12 opacity-30" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
