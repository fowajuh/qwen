import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Users, DollarSign, CheckCircle2, Shield, 
  CreditCard, Smartphone, Wallet, Lock
} from "lucide-react";
import { BookingCelebration } from "~/components/manifest/BookingCelebration";
import { useGamification, XP_REWARDS } from "~/lib/gamification-store";
import { hapticFeedback } from "~/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const listing = {
    id: params.listingId || "1",
    title: "Luxury Glass House in Joshua Tree",
    location: "Joshua Tree, California",
    price: 450,
    cleaningFee: 75,
    serviceFee: 62,
    taxes: 48,
    host: { name: "Sarah", responseRate: 100 },
    cancellationPolicy: "Flexible",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80"
  };
  return json({ listing });
}

export default function BookingFlow() {
  const { listing } = useLoaderData<{ listing: any }>();
  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  
  const { awardXP, stats } = useGamification();
  
  const totalNights = checkIn && checkOut 
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  const subtotal = totalNights * listing.price;
  const total = subtotal + listing.cleaningFee + listing.serviceFee + listing.taxes;
  
  const handleBookNow = () => {
    hapticFeedback("medium");
    setIsProcessing(true);
    
    // Award XP for reaching payment step
    awardXP("book_listing" as keyof typeof XP_REWARDS);
    
    // Simulate booking processing
    setTimeout(() => {
      setIsProcessing(false);
      setBookingComplete(true);
      setBookingRef(`JBX-${Date.now().toString(36).toUpperCase()}`);
      
      // First booking bonus
      if (stats.totalBookings === 0) {
        awardXP("first_booking");
      }
    }, 2000);
  };
  
  const steps = [
    { num: 1, label: "Dates", icon: Calendar },
    { num: 2, label: "Guests", icon: Users },
    { num: 3, label: "Confirm", icon: CheckCircle2 },
  ];

  if (bookingComplete) {
    return (
      <BookingCelebration
        bookingRef={bookingRef}
        destination={listing.location}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        totalPrice={total}
        isOpen={true}
        onClose={() => window.location.href = "/trips"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Progress Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display text-xl font-bold text-slate-900">Reserve your stay</h1>
            <p className="text-sm text-slate-500">{listing.title}</p>
          </div>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -z-10" />
            <div 
              className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 -z-10 transition-all duration-500"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, idx) => {
              const isComplete = step > s.num;
              const isCurrent = step === s.num;
              const Icon = s.icon;
              
              return (
                <motion.div
                  key={s.num}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2 bg-slate-50 px-2"
                >
                  <motion.div
                    animate={isComplete || isCurrent ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete 
                        ? "bg-emerald-500 text-white" 
                        : isCurrent 
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                          : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span className={`text-xs font-medium ${isCurrent ? "text-indigo-600" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Step 1: Select Dates */}
        {step === 1 && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="rounded-2xl bg-white p-6 shadow-lg"
          >
            <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Choose your dates</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    hapticFeedback("light");
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-slate-200 p-4 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Checkout
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    hapticFeedback("light");
                  }}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-slate-200 p-4 font-medium text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>
            
            {totalNights > 0 && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="rounded-xl bg-indigo-50 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-indigo-900">{totalNights} night{totalNights > 1 ? "s" : ""}</p>
                  <p className="text-xs text-indigo-600">${listing.price} × {totalNights} = ${subtotal}</p>
                </div>
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    awardXP("save_listing");
                    setStep(2);
                  }}
                  disabled={!checkIn || !checkOut}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-indigo-500/50"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Step 2: Guest Count */}
        {step === 2 && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="rounded-2xl bg-white p-6 shadow-lg"
          >
            <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Who's coming?</h2>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-6 mb-6">
              <div>
                <p className="font-medium text-slate-900">Total guests</p>
                <p className="text-sm text-slate-500">Max 6 guests</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setGuests(Math.max(1, guests - 1));
                  }}
                  className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <span className="text-xl font-bold text-slate-600">−</span>
                </button>
                <span className="text-2xl font-display font-bold text-slate-900 w-8 text-center">{guests}</span>
                <button
                  onClick={() => {
                    hapticFeedback("light");
                    setGuests(Math.min(6, guests + 1));
                  }}
                  className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <span className="text-xl font-bold text-slate-600">+</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  hapticFeedback("light");
                  setStep(3);
                }}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation & Payment */}
        {step === 3 && (
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            {/* Price Breakdown */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Price details</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>${listing.price} × {totalNights} nights</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Cleaning fee</span>
                  <span>${listing.cleaningFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service fee</span>
                  <span>${listing.serviceFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Taxes</span>
                  <span>${listing.taxes}</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between font-bold text-lg">
                  <span>Total (USD)</span>
                  <span className="text-indigo-600">${total}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-emerald-500 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900">{listing.cancellationPolicy} cancellation</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Free cancellation until 48 hours before check-in. After that, cancel before check-in for a 50% refund.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Payment method</h2>
              <div className="space-y-3">
                {[
                  { icon: CreditCard, label: "Credit Card", desc: "•••• 4242" },
                  { icon: Smartphone, label: "Apple Pay", desc: "Fast & secure" },
                  { icon: Wallet, label: "Google Pay", desc: "Fast & secure" },
                ].map((method, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.01 }}
                    className="w-full flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all"
                  >
                    <method.icon className="w-6 h-6 text-indigo-600" />
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{method.label}</p>
                      <p className="text-xs text-slate-500">{method.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleBookNow}
              disabled={isProcessing || !checkIn || !checkOut}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 py-5 font-bold text-white text-lg shadow-xl shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-indigo-500/50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Confirm Booking · ${total}
                </span>
              )}
            </motion.button>
            
            <p className="text-center text-xs text-slate-400">
              You won't be charged yet. This is a reservation request.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
