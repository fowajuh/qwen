import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Haptic feedback helper - works on mobile devices
export function hapticFeedback(intensity: 'light' | 'medium' | 'heavy' = 'light') {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30]
    };
    navigator.vibrate(patterns[intensity]);
  }
}

// Format large numbers with K/M suffixes
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// Generate gradient based on level/type
export function getGradientForLevel(level: number): string {
  const gradients = [
    'from-slate-400 to-slate-600', // Level 1
    'from-emerald-400 to-emerald-600', // Level 2
    'from-blue-400 to-blue-600', // Level 3
    'from-violet-400 to-violet-600', // Level 4
    'from-amber-400 to-amber-600', // Level 5
    'from-rose-400 to-rose-600', // Level 6
  ];
  return gradients[Math.min(level - 1, gradients.length - 1)];
}

// Get badge color by type
export function getBadgeColor(type: 'milestone' | 'category' | 'social' | 'host'): string {
  const colors = {
    milestone: 'from-amber-400 to-orange-500',
    category: 'from-blue-400 to-cyan-500',
    social: 'from-purple-400 to-pink-500',
    host: 'from-emerald-400 to-teal-500'
  };
  return colors[type];
}

// Calculate time ago
export function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

// Skeleton screen delay utility
export function getSkeletonDelay(index: number): string {
  return `delay-[${index * 100}ms]`;
}
