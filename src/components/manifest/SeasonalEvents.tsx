import { motion } from "framer-motion";
import { useState } from "react";
import { Trophy, Flame, Gift, Star, Crown, Sparkles, Lock, CheckCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGamification, LEVELS } from "@/lib/gamification-store";

interface Quest {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  creditReward?: number;
  badgeId?: string;
  completed: boolean;
  claimed: boolean;
}

interface SeasonalEvent {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  endDate: string;
  gradient: string;
  icon: string;
  quests: Quest[];
  grandPrize: {
    name: string;
    description: string;
    badgeId: string;
    creditReward: number;
  };
}

const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "summer-2025",
    title: "Summer of Adventure",
    subtitle: "June 1 - August 31, 2025",
    description: "Complete quests to unlock exclusive rewards and the Summer Voyager badge!",
    startDate: "2025-06-01",
    endDate: "2025-08-31",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    icon: "🏖️",
    quests: [
      { id: "q1", title: "Beach Explorer", description: "Book a beachfront property", progress: 1, target: 1, xpReward: 100, completed: true, claimed: false },
      { id: "q2", title: "Storyteller", description: "Leave 3 detailed reviews", progress: 2, target: 3, xpReward: 150, completed: false, claimed: false },
      { id: "q3", title: "Social Butterfly", description: "Refer a friend who books", progress: 0, target: 1, xpReward: 300, completed: false, claimed: false },
      { id: "q4", title: "Weekend Warrior", description: "Complete 2 weekend trips", progress: 1, target: 2, xpReward: 200, completed: false, claimed: false },
    ],
    grandPrize: {
      name: "Summer Voyager",
      description: "Exclusive badge + $50 trip credit",
      badgeId: "summer_voyager",
      creditReward: 50,
    },
  },
  {
    id: "winter-2025",
    title: "Winter Wonderland",
    subtitle: "December 1 - February 28, 2026",
    description: "Cozy stays, holiday magic, and warm rewards await!",
    startDate: "2025-12-01",
    endDate: "2026-02-28",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    icon: "❄️",
    quests: [
      { id: "w1", title: "Cabin Fever", description: "Book a cabin or chalet", progress: 0, target: 1, xpReward: 100, completed: false, claimed: false },
      { id: "w2", title: "Holiday Host", description: "Book during holidays", progress: 0, target: 1, xpReward: 150, completed: false, claimed: false },
      { id: "w3", title: "New Year New Places", description: "Visit a new country", progress: 0, target: 1, xpReward: 250, completed: false, claimed: false },
    ],
    grandPrize: {
      name: "Cozy King",
      description: "Exclusive badge + 2x XP week",
      badgeId: "cozy_king",
      creditReward: 0,
    },
  },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", xpGained: 4250, level: 5, streak: 21, badge: "Legend" },
  { rank: 2, name: "Alex K.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", xpGained: 3890, level: 4, streak: 14, badge: "Nomad" },
  { rank: 3, name: "Jordan T.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", xpGained: 3650, level: 4, streak: 18, badge: "Nomad" },
  { rank: 4, name: "Casey L.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80", xpGained: 3120, level: 4, streak: 9, badge: "Adventurer" },
  { rank: 5, name: "Morgan R.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80", xpGained: 2980, level: 3, streak: 12, badge: "Adventurer" },
  { rank: 6, name: "Taylor B.", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80", xpGained: 2750, level: 3, streak: 7, badge: "Adventurer" },
  { rank: 7, name: "Jamie W.", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&q=80", xpGained: 2540, level: 3, streak: 5, badge: "Adventurer" },
  { rank: 8, name: "Riley P.", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a37b1a9?w=100&q=80", xpGained: 2320, level: 3, streak: 11, badge: "Adventurer" },
  { rank: 9, name: "Avery C.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80", xpGained: 2180, level: 2, streak: 4, badge: "Weekend Warrior" },
  { rank: 10, name: "Quinn D.", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656ec?w=100&q=80", xpGained: 1950, level: 2, streak: 6, badge: "Weekend Warrior" },
];

export function SeasonalQuestBoard() {
  const [activeEvent, setActiveEvent] = useState<SeasonalEvent>(SEASONAL_EVENTS[0]);
  const awardXP = useGamification((state) => state.awardXP);

  const totalProgress = activeEvent.quests.reduce((acc, q) => acc + (q.completed ? 1 : 0), 0);
  const totalQuests = activeEvent.quests.length;
  const percentComplete = Math.round((totalProgress / totalQuests) * 100);

  const handleClaimQuest = (questId: string) => {
    const quest = activeEvent.quests.find(q => q.id === questId);
    if (quest && quest.completed && !quest.claimed) {
      awardXP("complete_seasonal_quest");
      toast.success(`+${quest.xpReward} XP claimed!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-3xl p-6 text-white bg-gradient-to-br",
          activeEvent.gradient
        )}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{activeEvent.icon}</span>
            <div>
              <h2 className="font-display text-2xl font-bold">{activeEvent.title}</h2>
              <p className="text-white/80 text-sm">{activeEvent.subtitle}</p>
            </div>
          </div>
          
          <p className="text-white/90 mb-4">{activeEvent.description}</p>
          
          {/* Progress Bar */}
          <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentComplete}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="font-medium">{totalProgress}/{totalQuests} Quests Complete</span>
            <span className="font-bold">{percentComplete}%</span>
          </div>
        </div>
      </motion.div>

      {/* Grand Prize Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5"
      >
        <div className="flex items-center gap-3 mb-3">
          <Crown className="w-6 h-6 text-amber-600" />
          <h3 className="font-display font-bold text-lg text-slate-900">Grand Prize</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900">{activeEvent.grandPrize.name}</p>
            <p className="text-sm text-slate-600">{activeEvent.grandPrize.description}</p>
          </div>
          {percentComplete === 100 && (
            <button className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors">
              Claim Prize
            </button>
          )}
        </div>
      </motion.div>

      {/* Quest List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Active Quests
        </h3>
        
        {activeEvent.quests.map((quest, idx) => (
          <motion.div
            key={quest.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "rounded-xl p-4 border-2 transition-all",
              quest.completed 
                ? "bg-emerald-50 border-emerald-200" 
                : "bg-white border-slate-200"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {quest.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                  )}
                  <h4 className="font-bold text-slate-900">{quest.title}</h4>
                </div>
                <p className="text-sm text-slate-600 mb-2">{quest.description}</p>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                      className={cn(
                        "h-full rounded-full",
                        quest.completed ? "bg-emerald-500" : "bg-indigo-500"
                      )}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {quest.progress}/{quest.target}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  +{quest.xpReward} XP
                </div>
                {quest.creditReward && (
                  <p className="text-xs text-slate-500 mt-1">+${quest.creditReward}</p>
                )}
                {quest.completed && !quest.claimed && (
                  <button
                    onClick={() => handleClaimQuest(quest.id)}
                    className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Leaderboard() {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "alltime">("weekly");
  
  return (
    <div className="space-y-4">
      {/* Header with Timeframe Selector */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          Top Explorers
        </h2>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(["weekly", "monthly", "alltime"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                timeframe === tf
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="relative mb-2">
            <img src={LEADERBOARD_DATA[1].avatar} alt={LEADERBOARD_DATA[1].name} className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-slate-300" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              2
            </div>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{LEADERBOARD_DATA[1].name}</p>
          <p className="text-xs text-slate-500">{LEADERBOARD_DATA[1].xpGained.toLocaleString()} XP</p>
        </motion.div>

        {/* 1st Place */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="relative mb-2">
            <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-500" />
            <img src={LEADERBOARD_DATA[0].avatar} alt={LEADERBOARD_DATA[0].name} className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-amber-400" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              1
            </div>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{LEADERBOARD_DATA[0].name}</p>
          <p className="text-xs text-slate-500">{LEADERBOARD_DATA[0].xpGained.toLocaleString()} XP</p>
        </motion.div>

        {/* 3rd Place */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="relative mb-2">
            <img src={LEADERBOARD_DATA[2].avatar} alt={LEADERBOARD_DATA[2].name} className="w-16 h-16 rounded-full mx-auto object-cover ring-4 ring-amber-700" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
              3
            </div>
          </div>
          <p className="font-bold text-slate-900 text-sm truncate">{LEADERBOARD_DATA[2].name}</p>
          <p className="text-xs text-slate-500">{LEADERBOARD_DATA[2].xpGained.toLocaleString()} XP</p>
        </motion.div>
      </div>

      {/* Rest of Leaderboard */}
      <div className="space-y-2 mt-6">
        {LEADERBOARD_DATA.slice(3).map((entry, idx) => (
          <motion.div
            key={entry.rank}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
              {entry.rank}
            </div>
            <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">{entry.name}</p>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{entry.level} • {entry.badge}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900">{entry.xpGained.toLocaleString()}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {entry.streak} day streak
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Your Rank */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Your Ranking</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                24
              </div>
              <div>
                <p className="font-bold text-slate-900">You</p>
                <p className="text-xs text-slate-500">1,840 XP this week</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Top 15%</p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +3 spots
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Target icon since it's not in lucide-react by default
function Target({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
