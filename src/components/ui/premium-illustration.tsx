import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Billion-Dollar App Illustration System
 * 
 * This component provides premium, emotion-based illustrations
 * similar to those used by companies like Airbnb, Stripe, Notion, and Linear.
 * 
 * The illustrations create emotional connection and guide users through
 * key moments in their journey.
 * 
 * Uses exclusively the curated illustrations from /onboarding_illustrations/
 */

export interface IllustrationProps {
  name: IllustrationName;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  animate?: boolean;
  alt?: string;
}

export type IllustrationName =
  | "welcome-hero"
  | "role-selection"
  | "location"
  | "interests"
  | "success"
  | "notifications"
  | "consumer-journey"
  | "business-growth"
  | "community"
  | "analytics"
  | "empty-state"
  | "loading"
  | "error"
  | "celebration"
  | "discover"
  | "explore"
  | "planning"
  | "collab"
  | "focus"
  | "mobile"
  | "secure"
  | "growth-chart"
  | "premium"
  | "doodle";

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-40 h-40",
  xl: "w-56 h-56",
  full: "w-full h-auto",
};

const illustrationPaths: Record<IllustrationName, string> = {
  // Onboarding flow illustrations
  "welcome-hero": "/onboarding_illustrations/office_welcome.jpg",
  "role-selection": "/onboarding_illustrations/office_planning.jpg",
  location: "/onboarding_illustrations/office_mobile.jpg",
  interests: "/onboarding_illustrations/notion_discover.jpg",
  success: "/onboarding_illustrations/office_success.jpg",
  notifications: "/onboarding_illustrations/office_secure.jpg",
  
  // Business & Growth illustrations
  "consumer-journey": "/onboarding_illustrations/notion_explore.jpg",
  "business-growth": "/onboarding_illustrations/growth_chart.jpg",
  community: "/onboarding_illustrations/community_connect.jpg",
  analytics: "/onboarding_illustrations/office_analytics.jpg",
  
  // State illustrations
  "empty-state": "/onboarding_illustrations/office_focus.jpg",
  loading: "/onboarding_illustrations/office_collab.jpg",
  error: "/onboarding_illustrations/office_secure.jpg",
  celebration: "/onboarding_illustrations/office_celebration.jpg",
  
  // Discover & Explore sections
  discover: "/onboarding_illustrations/notion_discover.jpg",
  explore: "/onboarding_illustrations/notion_explore.jpg",
  
  // Workspace illustrations
  planning: "/onboarding_illustrations/office_planning.jpg",
  collab: "/onboarding_illustrations/office_collab.jpg",
  focus: "/onboarding_illustrations/office_focus.jpg",
  mobile: "/onboarding_illustrations/office_mobile.jpg",
  secure: "/onboarding_illustrations/office_secure.jpg",
  
  // Premium & Growth
  "growth-chart": "/onboarding_illustrations/growth_chart.jpg",
  premium: "/onboarding_illustrations/premium_badge.jpg",
  doodle: "/onboarding_illustrations/doodle_growth.jpg",
};

export function PremiumIllustration({
  name,
  className,
  size = "lg",
  animate = true,
  alt = "",
}: IllustrationProps) {
  const path = illustrationPaths[name];

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        sizeClasses[size],
        className
      )}
      initial={animate ? { opacity: 0, scale: 0.95, y: 10 } : {}}
      animate={animate ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
      <img
        src={path}
        alt={alt || name}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl" />
    </motion.div>
  );
}

/**
 * Illustration Modal/Bottom Sheet Header
 * Used in modals and bottom sheets for billion-dollar app feel
 */
export function IllustrationModalHeader({
  illustration,
  title,
  subtitle,
}: {
  illustration: IllustrationName;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-6">
      <div className="flex justify-center mb-4">
        <PremiumIllustration name={illustration} size="lg" animate={true} />
      </div>
      <h2 className="font-display text-2xl font-bold tracking-tight mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-white/60 text-sm leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}

/**
 * Emotional State Illustrations for different app states
 */
export const EmotionalIllustrations = {
  onboarding: {
    welcome: "welcome-hero",
    role: "role-selection",
    location: "mobile",
    interests: "interests",
    success: "success",
    notifications: "notifications",
  },
  emptyStates: {
    noContent: "empty-state",
    noResults: "focus",
    noNotifications: "success",
    noMessages: "community",
  },
  business: {
    growth: "business-growth",
    analytics: "analytics",
    community: "community",
    consumer: "consumer-journey",
  },
  feedback: {
    success: "success",
    celebration: "celebration",
    error: "error",
    loading: "loading",
  },
  discover: {
    explore: "explore",
    discover: "discover",
    trending: "doodle",
  },
  map: {
    location: "mobile",
    navigation: "planning",
    nearby: "discover",
  },
  housing: {
    home: "welcome-hero",
    travel: "explore",
    booking: "success",
    host: "planning",
  },
  membership: {
    core: "community",
    growth: "growth-chart",
    enterprise: "analytics",
    premium: "premium",
  },
  ai: {
    assistant: "collab",
    insights: "analytics",
    automation: "focus",
    voice: "community",
  },
  profile: {
    settings: "secure",
    activity: "analytics",
    saved: "focus",
    history: "focus",
  },
};

/**
 * Animated Illustration Sequence for onboarding flows
 */
export function IllustrationSequence({
  illustrations,
  currentIndex,
  className,
}: {
  illustrations: IllustrationName[];
  currentIndex: number;
  className?: string;
}) {
  return (
    <div className={cn("relative h-56", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <PremiumIllustration
            name={illustrations[currentIndex]}
            size="xl"
            animate={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
