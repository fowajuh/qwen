import { motion } from "framer-motion";
import { Bell, X, Check, AlertCircle, Info, TrendingDown, Gift, MessageSquare, Calendar, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGamification } from "@/lib/gamification-store";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: "booking" | "message" | "price_drop" | "urgency" | "achievement" | "referral" | "reminder" | "promotion";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

const notificationIcons: Record<Notification["type"], typeof Bell> = {
  booking: Calendar,
  message: MessageSquare,
  price_drop: TrendingDown,
  urgency: AlertCircle,
  achievement: Star,
  referral: Gift,
  reminder: Bell,
  promotion: Gift,
};

const priorityColors: Record<Notification["priority"], string> = {
  low: "border-ink-20",
  medium: "border-beacon-amber/40",
  high: "border-runway-red/50",
};

const bgColors: Record<Notification["priority"], string> = {
  low: "bg-cloud-white",
  medium: "bg-gradient-to-r from-runway-sand/30 to-cloud-white",
  high: "bg-gradient-to-r from-runway-red/10 to-cloud-white",
};

export function NotificationPanel({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onAction,
}: {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onAction: (notification: Notification) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-ink-60 hover:text-departure-navy transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" strokeWidth={1.75} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-beacon-amber text-departure-navy num text-[9px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 z-50 w-80 md:w-96 max-h-[600px] bg-cloud-white rounded-lg shadow-[0_20px_60px_-20px_rgba(14,22,38,0.4)] border border-ink-90/10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-90/5">
              <h3 className="font-display text-lg text-departure-navy">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="num text-[10px] uppercase tracking-[0.15em] text-beacon-amber hover:text-beacon-amber/80 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[480px]">
              {notifications.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Bell className="w-8 h-8 text-ink-30 mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-ink-60">No notifications yet</p>
                  <p className="num text-[9px] uppercase tracking-[0.18em] text-ink-40 mt-1">
                    We'll keep you posted
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-ink-90/5">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => onMarkRead(notification.id)}
                      onDelete={() => onDelete(notification.id)}
                      onAction={() => onAction(notification)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onAction,
}: {
  notification: Notification;
  onMarkRead: () => void;
  onDelete: () => void;
  onAction: () => void;
}) {
  const Icon = notificationIcons[notification.type];
  const addXP = useGamification((state) => state.addXP);

  const handleAction = () => {
    if (!notification.read) {
      onMarkRead();
      // Award XP for engaging with notifications
      addXP(2, "Notification engagement");
    }
    onAction();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "p-4 transition-colors cursor-pointer group",
        bgColors[notification.priority],
        !notification.read && "bg-runway-sand/20",
      )}
      onClick={handleAction}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border",
            priorityColors[notification.priority],
            !notification.read && "bg-beacon-amber/10 border-beacon-amber/30",
          )}
        >
          <Icon
            className={cn(
              "w-4 h-4",
              !notification.read ? "text-beacon-amber" : "text-ink-60",
            )}
            strokeWidth={!notification.read ? 2.25 : 1.75}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-medium truncate",
                !notification.read ? "text-departure-navy" : "text-ink-70",
              )}
            >
              {notification.title}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-ink-90/5 rounded"
              aria-label="Delete notification"
            >
              <X className="w-3 h-3 text-ink-40" />
            </button>
          </div>
          <p className="text-xs text-ink-60 mt-0.5 line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="num text-[8px] uppercase tracking-[0.15em] text-ink-40">
              {timeAgo(notification.timestamp)}
            </span>
            {!notification.read && (
              <span className="num text-[8px] uppercase tracking-[0.15em] text-beacon-amber">
                New
              </span>
            )}
          </div>
          {notification.actionLabel && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction();
              }}
              className="mt-2 num text-[9px] uppercase tracking-[0.15em] text-beacon-amber hover:text-beacon-amber/80 transition-colors flex items-center gap-1"
            >
              {notification.actionLabel}
              <Check className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return date.toLocaleDateString();
}

// Helper to create notifications
export function createNotification(
  type: Notification["type"],
  title: string,
  message: string,
  priority: Notification["priority"] = "medium",
  actionLabel?: string,
  metadata?: Record<string, unknown>,
): Notification {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    priority,
    actionLabel,
    metadata,
  };
}

// Toast helper for XP gains with confetti
export function showXPGainToast(xp: number, reason: string, levelUp = false) {
  if (levelUp) {
    toast.success(`Level Up! 🎉`, {
      description: `You've reached a new traveler level!`,
      duration: 4000,
    });
  }
  
  toast.success(`+${xp} XP`, {
    description: reason,
    duration: 2000,
  });
}
