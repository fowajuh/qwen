import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, Heart, TrendingDown, Zap, MessageSquare, Star, Eye, Bookmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatCompactNumber } from '@/lib/utils';

interface UrgencyTriggersProps {
  listingId: string;
  viewCount?: number;
  savedCount?: number;
  bookedCount?: number;
  priceDrop?: {
    original: number;
    current: number;
    percentage: number;
  };
  hostResponseTime?: string;
  instantBookAvailable?: boolean;
  datesLeft?: number;
}

// Individual Badge Components for composability
export function MatchScoreBadge({ score }: { score: number }) {
  if (score < 80) return null;
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-500/25"
    >
      <Star className="w-3 h-3 fill-white" />
      {score}% Match
    </motion.div>
  );
}

export function ViewCounter({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700"
    >
      <Eye className="w-3 h-3" strokeWidth={1.5} />
      <span>{formatCompactNumber(count)} viewing</span>
    </motion.div>
  );
}

export function SavedCountBadge({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700"
    >
      <Bookmark className="w-3 h-3" strokeWidth={1.5} />
      <span>{formatCompactNumber(count)}</span>
    </motion.div>
  );
}

export function HostResponseBadge({ time }: { time: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-700"
    >
      <MessageSquare className="w-3 h-3" strokeWidth={1.5} />
      <span>Responds in {time}</span>
    </motion.div>
  );
}

export function InstantBookBadge() {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg shadow-amber-500/25"
    >
      <Zap className="w-3 h-3 fill-white" />
      Instant Book
    </motion.div>
  );
}

export function UrgencyTriggers({
  viewCount = 0,
  savedCount = 0,
  bookedCount = 0,
  priceDrop,
  hostResponseTime,
  instantBookAvailable,
  datesLeft
}: UrgencyTriggersProps) {
  return (
    <div className="space-y-3">
      {/* Price Drop Alert */}
      {priceDrop && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-700"
        >
          <TrendingDown className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Price dropped {priceDrop.percentage}%</p>
            <p className="text-xs opacity-80">
              Was ${priceDrop.original} • Now ${priceDrop.current}
            </p>
          </div>
          <Badge className="bg-emerald-500 text-white">Limited time</Badge>
        </motion.div>
      )}

      {/* Social Proof Row */}
      {(viewCount > 0 || savedCount > 0 || bookedCount > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3"
        >
          {viewCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Users className="w-4 h-4" strokeWidth={1.5} />
              <span>{formatCompactNumber(viewCount)} viewed today</span>
            </div>
          )}
          
          {savedCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Heart className="w-4 h-4" strokeWidth={1.5} />
              <span>Saved by {formatCompactNumber(savedCount)} travelers</span>
            </div>
          )}
          
          {bookedCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              <span>Booked {bookedCount} times this week</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Host Response Time */}
      {hostResponseTime && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 text-sm"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          </div>
          <span className="text-slate-600 dark:text-slate-400">
            Host typically responds in <span className="font-semibold text-slate-900 dark:text-white">{hostResponseTime}</span>
          </span>
        </motion.div>
      )}

      {/* Instant Book Badge */}
      {instantBookAvailable && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg shadow-amber-500/25"
        >
          <Zap className="w-4 h-4" fill="currentColor" />
          Instant Book Available
        </motion.div>
      )}

      {/* Dates Left Urgency */}
      {datesLeft && datesLeft <= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-xl border border-rose-200 dark:border-rose-700"
        >
          <Clock className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Only {datesLeft} dates left</p>
            <p className="text-xs opacity-80">High demand for these dates</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Listing Card Badges Component
interface ListingCardBadgesProps {
  matchScore?: number;
  isSuperhost?: boolean;
  isNewListing?: boolean;
  guestFavorite?: boolean;
}

export function ListingCardBadges({
  matchScore,
  isSuperhost,
  isNewListing,
  guestFavorite
}: ListingCardBadgesProps) {
  return (
    <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
      {matchScore && matchScore >= 85 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg"
        >
          {matchScore}% Match
        </motion.div>
      )}
      
      {isSuperhost && (
        <Badge className="bg-amber-500 text-white shadow-md">
          Superhost
        </Badge>
      )}
      
      {isNewListing && (
        <Badge className="bg-emerald-500 text-white shadow-md">
          New
        </Badge>
      )}
      
      {guestFavorite && (
        <Badge className="bg-rose-500 text-white shadow-md">
          Guest Favorite
        </Badge>
      )}
    </div>
  );
}
