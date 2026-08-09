import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, Check, Mail, Users, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGamificationStore } from '@/lib/gamification-store';
import { hapticFeedback } from '@/lib/utils';

interface ReferralCardProps {
  userId?: string;
}

export function ReferralCard({ userId }: ReferralCardProps) {
  const { stats, addXP, unlockBadge } = useGamificationStore();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  // Generate referral code from user ID or name
  const referralCode = userId ? `${userId.toUpperCase()}25` : 'TRAVEL25';
  const referralLink = `https://wanderly.com/ref/${referralCode}`;
  
  const referralsCount = stats.referrals || 0;
  const earnings = referralsCount * 25;
  const progressToAmbassador = Math.min(referralsCount / 5, 1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    hapticFeedback('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    hapticFeedback('light');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join me on Wanderly',
      text: `Use my code ${referralCode} to get $25 off your first trip!`,
      url: referralLink
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        hapticFeedback('light');
      } catch (err) {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate sending email
    setSent(true);
    hapticFeedback('light');
    
    // In production, this would call an API
    setTimeout(() => {
      setEmail('');
      setSent(false);
    }, 2000);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-600" strokeWidth={1.5} />
              Refer Friends
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Give $25, Get $25 for each friend
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Award className="w-6 h-6 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
            Your Code
          </p>
          <div className="flex items-center gap-3">
            <code className="text-2xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
              {referralCode}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="shrink-0 h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5 text-slate-400" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{referralsCount}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Friends referred</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${earnings}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Earned</p>
          </div>
          <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{Math.min(5 - referralsCount, 5)}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">To Ambassador</p>
          </div>
        </div>
      </div>

      {/* Ambassador Progress */}
      <div className="px-6 pb-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Ambassador Badge Progress</span>
            <span className="text-xs text-slate-500">{referralsCount}/5</span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToAmbassador * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
          {referralsCount >= 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <Award className="w-3 h-3" /> Ambassador badge unlocked!
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold"
          >
            <Share2 className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Share Link
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="rounded-xl font-semibold border-2"
          >
            <Copy className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Email Invite */}
      <div className="px-6 py-4 bg-white/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleEmailInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-11 rounded-xl"
            disabled={sent}
          />
          <Button
            type="submit"
            disabled={!email || sent}
            className="h-11 px-4 rounded-xl font-semibold"
          >
            {sent ? (
              <Check className="w-5 h-5 text-emerald-500" />
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Invite
              </>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
