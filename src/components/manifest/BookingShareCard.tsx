import { motion } from "framer-motion";
import { Share, Copy, Download, Camera, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookingShareCardProps {
  bookingRef: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  listingTitle: string;
  listingImage: string;
  totalPrice: number;
  guestCount: number;
  level?: number;
  levelTitle?: string;
}

export function BookingShareCard({
  bookingRef,
  destination,
  checkIn,
  checkOut,
  listingTitle,
  listingImage,
  totalPrice,
  guestCount,
  level = 1,
  levelTitle = "Explorer",
}: BookingShareCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🌍 Just booked my next adventure!\n\n📍 ${listingTitle}\n🏠 ${destination}\n📅 ${new Date(checkIn).toLocaleDateString()} - ${new Date(checkOut).toLocaleDateString()}\n💰 $${totalPrice} total\n\nBooked with GlobeTrotter — earn travel rewards!`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Trip to ${destination}`,
          text: `Just booked ${listingTitle} in ${destination}!`,
          url: window.location.href,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 20 }}
      className="max-w-md mx-auto"
    >
      {/* Shareable Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Content */}
        <div className="relative p-6 text-white">
          {/* Header Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
              <span className="text-xs font-bold uppercase tracking-wider">Booking Confirmed</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/90 text-amber-900 rounded-full">
              <span className="text-xs font-bold">Level {level}</span>
              <span className="text-[10px] uppercase">{levelTitle}</span>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 ring-4 ring-white/20">
            <img src={listingImage} alt={listingTitle} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <p className="font-display text-lg font-bold drop-shadow-lg">{listingTitle}</p>
              <p className="text-sm text-white/80 flex items-center gap-1">
                📍 {destination}
              </p>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Check-in</p>
              <p className="font-bold text-sm">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Checkout</p>
              <p className="font-bold text-sm">{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Guests</p>
              <p className="font-bold text-sm">{guestCount}</p>
            </div>
          </div>

          {/* Total Price */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/70">Total Paid</p>
              <p className="font-display text-3xl font-bold">${totalPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-white/70">Booking Ref</p>
              <p className="font-mono font-bold">{bookingRef}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg">🌍</span>
              </div>
              <div>
                <p className="text-sm font-bold">GlobeTrotter</p>
                <p className="text-[10px] text-white/70">Travel Rewards Platform</p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm hover:bg-white/90 transition-colors flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
        >
          <Copy className="w-4 h-4" />
          {copied ? "Copied!" : "Copy Details"}
        </button>
        <button
          onClick={() => {
            toast.success("Download started!", { description: "Your trip card is being saved" });
          }}
          className="px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Social Share Options */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 text-center">Share on</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              window.open(`https://instagram.com/stories/create`, '_blank');
              toast.success("Opening Instagram Stories...");
            }}
            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-shadow"
          >
            <Camera className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              const text = encodeURIComponent(`🌍 Just booked my next adventure to ${destination}!`);
              window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
              toast.success("Opening Twitter...");
            }}
            className="p-3 bg-sky-500 text-white rounded-full hover:shadow-lg transition-shadow"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
          <button
            onClick={handleShare}
            className="p-3 bg-slate-800 text-white rounded-full hover:shadow-lg transition-shadow"
          >
            <Share className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Booking celebration modal wrapper
interface BookingCelebrationModalProps extends BookingShareCardProps {
  isOpen: boolean;
  onClose: () => void;
  xpEarned: number;
  badgeUnlocked?: { name: string; icon: string };
}

export function BookingCelebrationModal({
  isOpen,
  onClose,
  xpEarned,
  badgeUnlocked,
  ...shareProps
}: BookingCelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* XP Celebration */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 rounded-full font-bold mb-4"
          >
            <span className="text-xl">🎉</span>
            <span>+{xpEarned} XP Earned!</span>
          </motion.div>
          
          <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
            Adventure Confirmed!
          </h2>
          <p className="text-slate-500">
            You're going to {shareProps.destination}!
          </p>
        </div>

        {/* Badge Unlock */}
        {badgeUnlocked && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.4, damping: 15 }}
            className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Achievement Unlocked
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">{badgeUnlocked.icon}</span>
              <div className="text-left">
                <p className="font-bold text-slate-900">{badgeUnlocked.name}</p>
                <p className="text-xs text-slate-500">First Booking Milestone</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Share Card */}
        <BookingShareCard {...shareProps} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
        >
          Continue to Trip Details
        </button>
      </motion.div>
    </motion.div>
  );
}
