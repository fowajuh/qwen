import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2, Copy, Check, Sparkles, Star, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGamificationStore } from '@/lib/gamification-store';
import { hapticFeedback } from '@/lib/utils';

interface BookingCelebrationProps {
  bookingReference: string;
  destination: string;
  checkInDate: string;
  nights: number;
  totalPrice: number;
  isFirstBooking?: boolean;
  onClose?: () => void;
}

export function BookingCelebration({
  bookingReference,
  destination,
  checkInDate,
  nights,
  totalPrice,
  isFirstBooking = false,
  onClose
}: BookingCelebrationProps) {
  const { addXP, unlockBadge } = useGamificationStore();
  const [copied, setCopied] = React.useState(false);
  const [showBadgeAnimation, setShowBadgeAnimation] = React.useState(false);

  useEffect(() => {
    // Trigger confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4F46E5', '#F59E0B', '#10B981', '#EF4444']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4F46E5', '#F59E0B', '#10B981', '#EF4444']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();

    // Award XP with haptic feedback
    const xpReward = isFirstBooking ? 200 : 100;
    addXP(xpReward);
    hapticFeedback('heavy');

    // Unlock First Step badge on first booking
    if (isFirstBooking) {
      setTimeout(() => {
        unlockBadge('first_step');
        setShowBadgeAnimation(true);
        hapticFeedback('heavy');
      }, 1500);
    }
  }, [isFirstBooking, addXP, unlockBadge]);

  const handleShare = () => {
    const shareText = `🎉 Just booked my trip to ${destination}! Checking in ${new Date(checkInDate).toLocaleDateString()}.`;
    
    if (navigator.share) {
      navigator.share({
        title: `Trip to ${destination}`,
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
    }
    
    hapticFeedback('light');
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(bookingReference);
    setCopied(true);
    hapticFeedback('light');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.8, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="overflow-hidden border-0 shadow-2xl bg-white dark:bg-slate-900">
            {/* Gradient Header */}
            <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-amber-300 rounded-full blur-3xl" />
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                  className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl"
                >
                  <Trophy className="w-14 h-14 text-white" strokeWidth={1.5} />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-6 left-0 right-0 text-center"
              >
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {isFirstBooking ? 'First Adventure!' : 'Booking Confirmed'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Your journey begins soon
                </p>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Destination */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <h3 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                  {destination}
                </h3>
                <div className="flex items-center justify-center gap-4 mt-3 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{nights} {nights === 1 ? 'night' : 'nights'}</span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">${totalPrice.toLocaleString()} total</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Arriving {new Date(checkInDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </motion.div>

              {/* Booking Reference */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Confirmation Code
                    </p>
                    <p className="text-xl font-mono font-semibold text-slate-900 dark:text-white mt-1 tracking-wide">
                      {bookingReference}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyReference}
                    className="shrink-0 h-12 w-12 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-6 h-6 text-emerald-500" strokeWidth={2} />
                    ) : (
                      <Copy className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
                    )}
                  </Button>
                </div>
              </motion.div>

              {/* XP Reward */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 py-2"
              >
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-semibold text-lg">+{xpReward} XP earned</span>
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              </motion.div>

              {/* First Booking Badge Animation */}
              <AnimatePresence>
                {showBadgeAnimation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Star className="w-7 h-7 text-white" fill="currentColor" strokeWidth={0} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-amber-900 dark:text-amber-100 text-lg">
                          Achievement Unlocked
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                          First Step Badge • Milestone Reached
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex gap-3 pt-2"
              >
                <Button
                  onClick={handleShare}
                  className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 rounded-2xl font-semibold text-base"
                  size="lg"
                >
                  <Share2 className="w-5 h-5 mr-2" strokeWidth={1.5} />
                  Share Trip
                </Button>
                {onClose && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                    className="h-14 px-8 border-2 rounded-2xl font-semibold text-base"
                  >
                    Done
                  </Button>
                )}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
