import { motion } from "framer-motion";
import { Trophy, Star, Crown } from "lucide-react";
import { useCurrentLevel, useNextLevel, useXPProgress, BADGE_LIBRARY, useUnlockedBadges } from "@/lib/gamification-store";
import { cn } from "@/lib/utils";

interface LevelBadgeProps {
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    badge: "w-10 h-10",
    icon: "w-5 h-5",
    text: "text-xs",
  },
  md: {
    badge: "w-14 h-14",
    icon: "w-7 h-7",
    text: "text-sm",
  },
  lg: {
    badge: "w-20 h-20",
    icon: "w-10 h-10",
    text: "text-base",
  },
};

const LEVEL_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
  1: Star,
  2: Star,
  3: Trophy,
  4: Trophy,
  5: Crown,
  6: Crown,
};

export function LevelBadge({ size = "md", showProgress = true, className }: LevelBadgeProps) {
  const currentLevel = useCurrentLevel();
  const nextLevel = useNextLevel();
  const { progress } = useXPProgress();
  
  const sizeClasses = SIZE_CLASSES[size];
  const IconComponent = LEVEL_ICONS[currentLevel.level] ?? Star;
  
  const getLevelColor = (level: number) => {
    if (level >= 6) return "from-amber-400 to-orange-500";
    if (level >= 4) return "from-purple-400 to-indigo-500";
    if (level >= 2) return "from-emerald-400 to-teal-500";
    return "from-gray-400 to-slate-500";
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative flex flex-col items-center", className)}
    >
      {/* Level ring with gradient */}
      <div className="relative">
        {/* Background ring */}
        <div
          className={cn(
            "rounded-full bg-gradient-to-br p-[2px]",
            getLevelColor(currentLevel.level)
          )}
        >
          <div className="bg-departure-navy rounded-full p-[2px]">
            <div
              className={cn(
                "rounded-full flex items-center justify-center bg-gradient-to-br",
                getLevelColor(currentLevel.level),
                sizeClasses.badge
              )}
            >
              <IconComponent className={cn("text-cloud-white", sizeClasses.icon)} />
            </div>
          </div>
        </div>
        
        {/* Level number badge */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-beacon-amber text-departure-navy flex items-center justify-center num text-[10px] font-bold border-2 border-departure-navy">
          {currentLevel.level}
        </div>
      </div>
      
      {/* Level title */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-center"
        >
          <p className={cn("num uppercase tracking-[0.15em] text-cloud-white/70", sizeClasses.text)}>
            {currentLevel.title}
          </p>
          
          {/* Progress bar to next level */}
          {nextLevel && (
            <div className="mt-1.5 w-full max-w-[120px]">
              <div className="h-1.5 bg-runway-sand/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-gradient-to-r from-beacon-amber to-horizon-teal"
                />
              </div>
              <p className="num text-[9px] text-cloud-white/50 mt-0.5">
                {Math.round((1 - progress) * 100)} XP to {nextLevel.title}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

interface XPProgressBarProps {
  compact?: boolean;
  className?: string;
}

export function XPProgressBar({ compact = false, className }: XPProgressBarProps) {
  const currentLevel = useCurrentLevel();
  const nextLevel = useNextLevel();
  const { totalXP, progress } = useXPProgress();
  
  if (!nextLevel) {
    return (
      <div className={className}>
        <p className={cn("num text-[10px] uppercase tracking-[0.18em] text-cloud-white/60", compact && "text-[8px]")}>
          Max Level Reached
        </p>
        <p className={cn("font-display text-xl text-beacon-amber mt-0.5", compact && "text-sm")}>
          {currentLevel.title}
        </p>
      </div>
    );
  }
  
  const xpToNext = Math.max(0, nextLevel.xpRequired - totalXP);
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <p className={cn("num text-[10px] uppercase tracking-[0.18em] text-cloud-white/60", compact && "text-[8px]")}>
          {currentLevel.title}
        </p>
        <p className={cn("num text-[9px] text-cloud-white/50", compact && "text-[8px]")}>
          {xpToNext.toLocaleString()} XP to {nextLevel.title}
        </p>
      </div>
      
      <div className="h-2 bg-runway-sand/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full bg-gradient-to-r from-beacon-amber via-horizon-teal to-indigo-500 relative"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
      
      {/* Milestone markers */}
      <div className="flex justify-between mt-1">
        {[0, 0.25, 0.5, 0.75, 1].map((marker) => (
          <div
            key={marker}
            className={cn(
              "w-1 h-1 rounded-full",
              progress >= marker ? "bg-beacon-amber" : "bg-runway-sand/30"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface BadgeDisplayProps {
  badgeId: string;
  size?: "sm" | "md" | "lg";
  showLocked?: boolean;
  className?: string;
}

export function BadgeDisplay({ badgeId, size = "md", showLocked = true, className }: BadgeDisplayProps) {
  const unlockedBadges = useUnlockedBadges();
  const badgeData = BADGE_LIBRARY.find(b => b.id === badgeId);
  const isUnlocked = unlockedBadges.some(b => b.id === badgeId);
  
  if (!badgeData && !showLocked) return null;
  if (!badgeData) return null;
  
  const sizeClasses = SIZE_CLASSES[size];
  
  if (!isUnlocked && showLocked) {
    return (
      <div className={cn("opacity-40 grayscale", className)}>
        <div className={cn(
          "rounded-full bg-runway-sand/20 flex items-center justify-center",
          sizeClasses.badge
        )}>
          <span className="text-lg">🔒</span>
        </div>
        {!badgeData.unlocked && badgeData.progress !== undefined && (
          <div className="mt-1 text-center">
            <p className="num text-[8px] text-cloud-white/40">
              {badgeData.progress}/{badgeData.target}
            </p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn("relative group cursor-pointer", className)}
    >
      <div className={cn(
        "rounded-full bg-gradient-to-br from-beacon-amber/20 to-horizon-teal/20 flex items-center justify-center border border-beacon-amber/30",
        sizeClasses.badge
      )}>
        <span className={size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg"}>
          {badgeData.icon}
        </span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-departure-navy border border-cloud-white/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        <p className="num text-[10px] uppercase tracking-[0.12em] text-beacon-amber">
          {badgeData.name}
        </p>
        <p className="text-[10px] text-cloud-white/70 mt-0.5">
          {badgeData.description}
        </p>
      </div>
    </motion.div>
  );
}
