import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, MapPin, Heart, Share2, Award, CheckCircle2, Wifi, Car, 
  Coffee, Tv, Wind, Users, Clock
} from "lucide-react";
import { UrgencyTriggers, MatchScoreBadge, ViewCounter, SavedCountBadge, HostResponseBadge, InstantBookBadge } from "~/components/manifest/UrgencyTriggers";
import { useGamification } from "~/lib/gamification-store";
import { hapticFeedback } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const listing = {
    id: params.listingId || "1",
    title: "Luxury Glass House in Joshua Tree",
    location: "Joshua Tree, California",
    rating: 4.96,
    reviewCount: 128,
    price: 450,
    host: {
      name: "Sarah",
      isSuperhost: true,
      responseRate: 100,
      responseTime: "within an hour",
      joinedYear: 2018,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80"
    ],
    description: "Experience the ultimate desert getaway in this architectural masterpiece. Floor-to-ceiling glass walls offer panoramic views of the Mojave Desert. Perfect for digital nomads and couples seeking solitude.",
    amenities: ["High-Speed WiFi", "Dedicated Workspace", "Free Parking", "Pool", "Hot Tub", "Air Conditioning", "Smart TV", "Coffee Maker"],
    matchScore: 98,
    viewsToday: 42,
    savedCount: 1240,
    bookingsThisWeek: 3
  };
  return json({ listing });
}

export default function ListingDetail() {
  const { listing } = useLoaderData<{ listing: any }>();
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const { awardXP } = useGamification();

  const handleSave = () => {
    hapticFeedback("light");
    setIsSaved(!isSaved);
    if (!isSaved) awardXP("save_listing");
  };

  const handleShare = () => {
    hapticFeedback("light");
    awardXP("share_listing");
    if (navigator.share) {
      navigator.share({ title: listing.title, text: `Check out this amazing stay: ${listing.title}`, url: window.location.href });
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Immersive Hero Gallery */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img key={activeImage} src={listing.images[activeImage]} alt={listing.title}
            initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }} className="h-full w-full object-cover" />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-6 right-6 flex gap-4">
          <MatchScoreBadge score={listing.matchScore} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare}
            className="rounded-full bg-white/90 p-3 backdrop-blur-md shadow-lg hover:bg-white transition-colors">
            <Share2 className="h-5 w-5 text-slate-800" />
          </motion.button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave}
            className={`rounded-full p-3 backdrop-blur-md shadow-lg transition-all ${isSaved ? "bg-rose-500 text-white" : "bg-white/90 text-slate-800 hover:bg-white"}`}>
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </motion.button>
        </div>

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Guest Favorite</span>
              <InstantBookBadge />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 drop-shadow-md">{listing.title}</h1>
            <div className="flex items-center gap-2 text-sm md:text-base font-medium drop-shadow-sm">
              <MapPin className="h-4 w-4" />{listing.location}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Host & Stats Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
              <img src={listing.host.avatar} alt={listing.host.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-indigo-100" />
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">Hosted by {listing.host.name}</h3>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  {listing.host.isSuperhost && (<span className="flex items-center gap-1 text-indigo-600 font-medium"><Award className="h-4 w-4" /> Superhost</span>)}
                  <span>{listing.host.joinedYear} Host</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <ViewCounter count={listing.viewsToday} />
              <SavedCountBadge count={listing.savedCount} />
              <HostResponseBadge time={listing.host.responseTime} rate={listing.host.responseRate} />
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">About this space</h2>
            <p className="text-slate-600 leading-relaxed text-lg">{listing.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-6">What this place offers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listing.amenities.map((amenity: string, idx: number) => (
                <motion.div key={amenity} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  {amenity.includes("WiFi") && <Wifi className="h-5 w-5 text-indigo-600" />}
                  {amenity.includes("Parking") && <Car className="h-5 w-5 text-indigo-600" />}
                  {amenity.includes("Coffee") && <Coffee className="h-5 w-5 text-indigo-600" />}
                  {amenity.includes("TV") && <Tv className="h-5 w-5 text-indigo-600" />}
                  {amenity.includes("AC") && <Wind className="h-5 w-5 text-indigo-600" />}
                  {!amenity.includes("WiFi") && !amenity.includes("Parking") && !amenity.includes("Coffee") && !amenity.includes("TV") && !amenity.includes("AC") && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                  <span className="font-medium text-slate-700">{amenity}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-indigo-900/10">
            <div className="mb-6 flex items-end justify-between">
              <div><span className="text-3xl font-display font-bold text-slate-900">${listing.price}</span><span className="text-slate-500"> / night</span></div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="text-slate-900">{listing.rating}</span><span className="text-slate-400">({listing.reviewCount} reviews)</span>
              </div>
            </div>
            <div className="mb-6 rounded-xl bg-rose-50 p-3 text-center">
              <p className="text-sm font-medium text-rose-700">High demand: {listing.bookingsThisWeek} people booked this week</p>
            </div>
            <div className="mb-6 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 p-3"><label className="text-xs font-bold uppercase text-slate-500">Check-in</label><div className="font-medium text-slate-900">Add date</div></div>
                <div className="rounded-xl border border-slate-200 p-3"><label className="text-xs font-bold uppercase text-slate-500">Checkout</label><div className="font-medium text-slate-900">Add date</div></div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3"><label className="text-xs font-bold uppercase text-slate-500">Guests</label><div className="font-medium text-slate-900">1 guest</div></div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
              onClick={() => { hapticFeedback("medium"); window.location.href = `/booking/${listing.id}`; }}>
              Reserve Now
            </motion.button>
            <p className="mt-4 text-center text-xs text-slate-400">You won't be charged yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
