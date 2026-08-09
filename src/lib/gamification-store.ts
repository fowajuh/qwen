import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// GAMIFICATION TYPES
// ============================================================================

export type TravelerLevel = 
  | "Rookie Explorer"
  | "Weekend Warrior"
  | "Adventurer"
  | "Nomad"
  | "Globetrotter"
  | "Legend";

export type BadgeCategory = "milestone" | "category" | "social" | "host";

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  creditReward?: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface SeasonalQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  badgeId?: string;
  creditReward?: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  event: string;
}

export interface TravelerStats {
  totalBookings: number;
  nightsBooked: number;
  countriesVisited: number;
  citiesVisited: number;
  reviewsWritten: number;
  moneySaved: number;
  listingsSaved: number;
  referralsCount: number;
  referralEarnings: number;
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string | null;
  totalXP: number;
  level: number;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  title: TravelerLevel;
  perks: string[];
}

export const LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: "Rookie Explorer", perks: ["Standard access"] },
  { level: 2, xpRequired: 500, title: "Weekend Warrior", perks: ["Early access to sales"] },
  { level: 3, xpRequired: 2000, title: "Adventurer", perks: ["5% service fee discount"] },
  { level: 4, xpRequired: 5000, title: "Nomad", perks: ["Free cancellation on select stays"] },
  { level: 5, xpRequired: 12000, title: "Globetrotter", perks: ["Priority customer support"] },
  { level: 6, xpRequired: 25000, title: "Legend", perks: ["Exclusive listings", "Host meetups", "10% fee discount"] },
];

export const BADGE_LIBRARY: Omit<Badge, "unlocked" | "unlockedAt" | "progress">[] = [
  // Milestone Badges
  { id: "first_step", name: "First Step", description: "Complete your first booking", category: "milestone", icon: "sparkles" },
  { id: "weekend_warrior", name: "Weekend Warrior", description: "Book 3 weekend trips in one month", category: "milestone", icon: "sunrise" },
  { id: "century_club", name: "Century Club", description: "Book 100 nights total", category: "milestone", icon: "award" },
  { id: "double_trouble", name: "Double Trouble", description: "Book 2 stays in one month", category: "milestone", icon: "zap" },
  
  // Category Badges
  { id: "beach_bum", name: "Beach Bum", description: "Stay at 3 beachfront properties", category: "category", icon: "waves" },
  { id: "mountain_king", name: "Mountain King", description: "Stay at 3 mountain properties", category: "category", icon: "mountain" },
  { id: "urbanite", name: "Urbanite", description: "Stay at 5 city properties", category: "category", icon: "building-2" },
  { id: "digital_nomad", name: "Digital Nomad", description: "Book 3 remote-work friendly stays", category: "category", icon: "laptop" },
  
  // Social Badges
  { id: "influencer", name: "Influencer", description: "Share 10 listings that get clicks", category: "social", icon: "share-2" },
  { id: "ambassador", name: "Ambassador", description: "Refer 5 friends who book", category: "social", icon: "users" },
  { id: "storyteller", name: "Storyteller", description: "Write 10 detailed reviews", category: "social", icon: "pen-tool" },
  { id: "social_butterfly", name: "Social Butterfly", description: "Refer 5 friends", category: "social", icon: "heart-handshake" },
  
  // Host Badges
  { id: "rising_star", name: "Rising Star", description: "Complete your first 5 bookings as a host", category: "host", icon: "star" },
  { id: "superhost", name: "Superhost", description: "Maintain 4.8+ rating for a year", category: "host", icon: "medal" },
  { id: "elite_host", name: "Elite Host", description: "50+ bookings with 0 cancellations", category: "host", icon: "crown" },
];

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  { id: "save_listings", title: "Save 3 Listings", description: "Add 3 properties to your wishlist", xpReward: 30, creditReward: 5, progress: 0, target: 3, completed: false, claimed: false },
  { id: "explore_city", title: "Explore a City", description: "View 5 listings in a new city", xpReward: 25, progress: 0, target: 5, completed: false, claimed: false },
  { id: "share_listing", title: "Share a Find", description: "Share a listing with a friend", xpReward: 20, progress: 0, target: 1, completed: false, claimed: false },
];

export const SEASONAL_EVENTS = [
  { id: "summer_adventure", name: "Summer of Adventure", startDate: "2025-06-01", endDate: "2025-08-31" },
  { id: "winter_wonderland", name: "Winter Wonderland", startDate: "2025-12-01", endDate: "2026-02-28" },
];

// XP Rewards Table
export const XP_REWARDS = {
  openAppDaily: 10,
  completeProfile: 50,
  saveListing: 5,
  shareListing: 15,
  firstBooking: 200,
  subsequentBooking: 100,
  checkIn: 100,
  leaveReview: 50,
  photoReviewBonus: 25,
  referFriendBooks: 300,
  completeDailyQuest: 30,
  completeSeasonalQuest: 500,
  maintain7DayStreak: 50,
  bookNewCategory: 75,
};

// ============================================================================
// STORE STATE & ACTIONS
// ============================================================================

type GamificationState = {
  // Core progression
  totalXP: number;
  level: number;
  xpHistory: { date: string; amount: number; reason: string }[];
  
  // Stats
  stats: TravelerStats;
  
  // Badges
  badges: Badge[];
  
  // Quests
  dailyQuests: DailyQuest[];
  seasonalQuests: SeasonalQuest[];
  activeEvent: string | null;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  lastOpenDate: string | null;
  streakRecovered: boolean;
  
  // Actions
  addXP: (amount: number, reason: string) => void;
  updateStat: (key: keyof TravelerStats, value: number) => void;
  incrementStat: (key: keyof TravelerStats, amount?: number) => void;
  unlockBadge: (badgeId: string) => void;
  updateDailyQuest: (questId: string, progress: number) => void;
  claimDailyQuest: (questId: string) => void;
  resetDailyQuests: () => void;
  checkDailyLogin: () => { xpEarned: number; streakUpdated: boolean; isNewStreak: boolean };
  getCurrentLevel: () => LevelConfig;
  getNextLevel: () => LevelConfig | null;
  getXPToNextLevel: () => number;
  getProgressToNextLevel: () => number;
  getUnlockedBadges: () => Badge[];
  getLockedBadges: () => Badge[];
  getCompletedQuests: () => DailyQuest[];
  getActiveQuests: () => DailyQuest[];
};

const initialState: Omit<GamificationState, keyof Pick<GamificationState, "addXP" | "updateStat" | "incrementStat" | "unlockBadge" | "updateDailyQuest" | "claimDailyQuest" | "resetDailyQuests" | "checkDailyLogin" | "getCurrentLevel" | "getNextLevel" | "getXPToNextLevel" | "getProgressToNextLevel" | "getUnlockedBadges" | "getLockedBadges" | "getCompletedQuests" | "getActiveQuests"> = {
  totalXP: 0,
  level: 1,
  xpHistory: [],
  stats: {
    totalBookings: 0,
    nightsBooked: 0,
    countriesVisited: 0,
    citiesVisited: 0,
    reviewsWritten: 0,
    moneySaved: 0,
    listingsSaved: 0,
    referralsCount: 0,
    referralEarnings: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastOpenDate: null,
    totalXP: 0,
    level: 1,
  },
  badges: BADGE_LIBRARY.map(b => ({ ...b, unlocked: false })),
  dailyQuests: DEFAULT_DAILY_QUESTS,
  seasonalQuests: [],
  activeEvent: null,
  currentStreak: 0,
  longestStreak: 0,
  lastOpenDate: null,
  streakRecovered: false,
};

function calculateLevel(totalXP: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].xpRequired) {
      return LEVELS[i].level;
    }
  }
  return 1;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

function isYesterday(date1: Date, date2: Date): boolean {
  const yesterday = new Date(date2);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(date1, yesterday);
}

export const useGamification = create<GamificationState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      addXP: (amount: number, reason: string) => {
        set((state) => {
          const newTotalXP = state.totalXP + amount;
          const newLevel = calculateLevel(newTotalXP);
          
          // Check for badge unlocks based on XP milestones
          const updatedBadges = [...state.badges];
          if (newLevel > state.level) {
            // Level up badge could be unlocked here
          }
          
          return {
            totalXP: newTotalXP,
            level: newLevel,
            xpHistory: [...state.xpHistory, { 
              date: new Date().toISOString(), 
              amount, 
              reason 
            }],
            stats: {
              ...state.stats,
              totalXP: newTotalXP,
              level: newLevel,
            },
            badges: updatedBadges,
          };
        });
      },
      
      updateStat: (key: keyof TravelerStats, value: number) => {
        set((state) => ({
          stats: { ...state.stats, [key]: value },
        }));
      },
      
      incrementStat: (key: keyof TravelerStats, amount: number = 1) => {
        set((state) => ({
          stats: { 
            ...state.stats, 
            [key]: (state.stats[key] as number) + amount,
          },
        }));
      },
      
      unlockBadge: (badgeId: string) => {
        set((state) => ({
          badges: state.badges.map((badge) =>
            badge.id === badgeId
              ? { ...badge, unlocked: true, unlockedAt: new Date().toISOString() }
              : badge
          ),
        }));
      },
      
      updateDailyQuest: (questId: string, progress: number) => {
        set((state) => ({
          dailyQuests: state.dailyQuests.map((quest) =>
            quest.id === questId
              ? { 
                  ...quest, 
                  progress: Math.min(progress, quest.target),
                  completed: progress >= quest.target,
                }
              : quest
          ),
        }));
      },
      
      claimDailyQuest: (questId: string) => {
        set((state) => {
          const quest = state.dailyQuests.find(q => q.id === questId);
          if (!quest || !quest.completed || quest.claimed) return state;
          
          // Award rewards
          get().addXP(quest.xpReward, `Quest: ${quest.title}`);
          
          return {
            dailyQuests: state.dailyQuests.map((q) =>
              q.id === questId ? { ...q, claimed: true } : q
            ),
          };
        });
      },
      
      resetDailyQuests: () => {
        set(() => ({
          dailyQuests: DEFAULT_DAILY_QUESTS.map(q => ({ ...q, progress: 0, completed: false, claimed: false })),
        }));
      },
      
      checkDailyLogin: () => {
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];
        
        let xpEarned = 0;
        let streakUpdated = false;
        let isNewStreak = false;
        
        set((state) => {
          if (!state.lastOpenDate) {
            // First login ever
            xpEarned = XP_REWARDS.openAppDaily;
            streakUpdated = true;
            isNewStreak = true;
            return {
              currentStreak: 1,
              longestStreak: 1,
              lastOpenDate: todayStr,
              streakRecovered: false,
            };
          }
          
          const lastDate = new Date(state.lastOpenDate);
          
          if (isSameDay(today, lastDate)) {
            // Already logged in today
            return state;
          }
          
          if (isYesterday(today, lastDate)) {
            // Consecutive day
            const newStreak = state.currentStreak + 1;
            xpEarned = XP_REWARDS.openAppDaily;
            
            // Bonus for 7-day streak
            if (newStreak % 7 === 0) {
              xpEarned += XP_REWARDS.maintain7DayStreak;
            }
            
            streakUpdated = true;
            return {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, state.longestStreak),
              lastOpenDate: todayStr,
              streakRecovered: false,
            };
          }
          
          // Streak broken - but offer recovery
          if (!state.streakRecovered) {
            // Give them a chance to recover within 48 hours
            return {
              streakRecovered: true,
              lastOpenDate: todayStr,
            };
          }
          
          // Streak truly broken, reset
          return {
            currentStreak: 1,
            lastOpenDate: todayStr,
            streakRecovered: false,
          };
        });
        
        if (xpEarned > 0) {
          get().addXP(xpEarned, "Daily Login");
        }
        
        return { xpEarned, streakUpdated, isNewStreak };
      },
      
      getCurrentLevel: () => {
        const state = get();
        return LEVELS.find(l => l.level === state.level) ?? LEVELS[0];
      },
      
      getNextLevel: () => {
        const state = get();
        return LEVELS.find(l => l.level === state.level + 1) ?? null;
      },
      
      getXPToNextLevel: () => {
        const state = get();
        const nextLevel = LEVELS.find(l => l.level === state.level + 1);
        if (!nextLevel) return Infinity;
        return Math.max(0, nextLevel.xpRequired - state.totalXP);
      },
      
      getProgressToNextLevel: () => {
        const state = get();
        const currentLevelConfig = LEVELS.find(l => l.level === state.level);
        const nextLevelConfig = LEVELS.find(l => l.level === state.level + 1);
        
        if (!currentLevelConfig || !nextLevelConfig) return 1;
        
        const xpInCurrentLevel = state.totalXP - currentLevelConfig.xpRequired;
        const xpNeededForNext = nextLevelConfig.xpRequired - currentLevelConfig.xpRequired;
        
        return xpInCurrentLevel / xpNeededForNext;
      },
      
      getUnlockedBadges: () => {
        return get().badges.filter(b => b.unlocked);
      },
      
      getLockedBadges: () => {
        return get().badges.filter(b => !b.unlocked);
      },
      
      getCompletedQuests: () => {
        return get().dailyQuests.filter(q => q.completed);
      },
      
      getActiveQuests: () => {
        return get().dailyQuests.filter(q => !q.completed && !q.claimed);
      },
    }),
    {
      name: "globetrotter-gamification",
      partialize: (state) => ({
        totalXP: state.totalXP,
        level: state.level,
        xpHistory: state.xpHistory.slice(-100), // Keep last 100 entries
        stats: state.stats,
        badges: state.badges,
        dailyQuests: state.dailyQuests,
        seasonalQuests: state.seasonalQuests,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastOpenDate: state.lastOpenDate,
        streakRecovered: state.streakRecovered,
      }),
    }
  )
);

// ============================================================================
// HELPER HOOKS
// ============================================================================

export function useCurrentLevel() {
  return useGamification((state) => state.getCurrentLevel());
}

export function useNextLevel() {
  return useGamification((state) => state.getNextLevel());
}

export function useXPProgress() {
  return useGamification((state) => ({
    totalXP: state.totalXP,
    progress: state.getProgressToNextLevel(),
    xpToNext: state.getXPToNextLevel(),
  }));
}

export function useUnlockedBadges() {
  return useGamification((state) => state.getUnlockedBadges());
}

export function useActiveQuests() {
  return useGamification((state) => state.getActiveQuests());
}
