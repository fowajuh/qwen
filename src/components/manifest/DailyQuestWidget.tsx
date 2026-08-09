import { motion, AnimatePresence } from "framer-motion";
import { Check, Gift, Flame } from "lucide-react";
import { useActiveQuests, useGamification, XP_REWARDS } from "@/lib/gamification-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function DailyQuestWidget({ className }: { className?: string }) {
  const activeQuests = useActiveQuests();
  const completedQuests = useGamification((state) => state.getCompletedQuests());
  const claimDailyQuest = useGamification((state) => state.claimDailyQuest);
  const currentStreak = useGamification((state) => state.currentStreak);
  
  const handleClaim = (questId: string) => {
    claimDailyQuest(questId);
    toast.success("Quest Completed!", {
      description: "+30 XP awarded",
    });
  };

  if (activeQuests.length === 0 && completedQuests.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("bg-departure-navy/50 border border-cloud-white/10 rounded-lg p-4", className)}
    >
      {/* Header with streak */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-beacon-amber" />
          <p className="num text-[10px] uppercase tracking-[0.18em] text-cloud-white">
            Today's Quests
          </p>
        </div>
        
        {/* Streak indicator */}
        {currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-runway-sand/10 rounded-full">
            <Flame className="w-3 h-3 text-beacon-amber" />
            <span className="num text-[9px] text-cloud-white/70">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
      
      {/* Quest list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {/* Active quests */}
          {activeQuests.map((quest) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="flex items-center justify-between p-2.5 bg-cloud-white/5 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <p className="num text-[9px] uppercase tracking-[0.12em] text-cloud-white/80 truncate">
                  {quest.title}
                </p>
                <p className="text-[11px] text-cloud-white/60 truncate mt-0.5">
                  {quest.description}
                </p>
                
                {/* Progress bar */}
                <div className="mt-1.5 h-1 bg-runway-sand/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(quest.progress / quest.target) * 100}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-beacon-amber to-horizon-teal"
                  />
                </div>
                
                {/* Progress text */}
                <p className="num text-[8px] text-cloud-white/50 mt-0.5">
                  {quest.progress} / {quest.target} · +{quest.xpReward} XP
                  {quest.creditReward && ` · +$${quest.creditReward}`}
                </p>
              </div>
            </motion.div>
          ))}
          
          {/* Completed but unclaimed quests */}
          {completedQuests.filter(q => !q.claimed).map((quest) => (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-2.5 bg-horizon-teal/20 border border-horizon-teal/30 rounded-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-horizon-teal" />
                  <p className="num text-[9px] uppercase tracking-[0.12em] text-cloud-white">
                    {quest.title}
                  </p>
                </div>
                <p className="num text-[8px] text-horizon-teal mt-0.5">
                  Ready to claim · +{quest.xpReward} XP
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClaim(quest.id)}
                className="num text-[9px] uppercase tracking-[0.12em] bg-horizon-teal text-cloud-white px-3 py-1.5 rounded-sm"
              >
                Claim
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface StreakCounterProps {
  compact?: boolean;
  className?: string;
}

export function StreakCounter({ compact = false, className }: StreakCounterProps) {
  const currentStreak = useGamification((state) => state.currentStreak);
  const longestStreak = useGamification((state) => state.longestStreak);
  const streakRecovered = useGamification((state) => state.streakRecovered);
  
  if (currentStreak === 0 && !streakRecovered) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <div className={cn(
        "rounded-full flex items-center justify-center",
        currentStreak >= 7 ? "bg-beacon-amber/20" : "bg-runway-sand/10"
      )}>
        <Flame
          className={cn(
            currentStreak >= 7 ? "text-beacon-amber" : "text-runway-sand",
            compact ? "w-4 h-4" : "w-5 h-5"
          )}
        />
      </div>
      
      <div>
        <p className={cn("num text-cloud-white", compact ? "text-[10px]" : "text-sm")}>
          <span className="text-beacon-amber font-bold">{currentStreak}</span> day streak
        </p>
        {longestStreak > currentStreak && (
          <p className={cn("num text-cloud-white/50", compact ? "text-[8px]" : "text-[9px]")}>
            Best: {longestStreak} days
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface XPGainToastProps {
  amount: number;
  reason: string;
}

export function showXPGainToast({ amount, reason }: XPGainToastProps) {
  toast.success(`+${amount} XP`, {
    description: reason,
    icon: "✨",
  });
}
