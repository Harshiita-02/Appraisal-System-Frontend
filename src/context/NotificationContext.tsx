import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/context/AuthContext';
import type { AppNotification } from '@/types';

interface NotificationContextValue {
  unreadCount: number;
  /** Refetches just the unread count from the backend. */
  refreshUnreadCount: () => void;
  /** Marks one notification read everywhere it's displayed (bell panel
   *  and the full NotificationsPage), and decrements the shared count
   *  immediately — no waiting on the next poll. */
  markAsRead: (notification: AppNotification) => Promise<void>;
  /** Marks every notification read everywhere, and zeroes the shared
   *  count immediately. */
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

/**
 * Single shared source of truth for the unread notification count.
 * Previously NotificationBell and NotificationsPage each held their
 * own separate local state — marking something read on one had no
 * effect on the other until the bell's next 60s background poll fired,
 * so the badge could sit stale and inconsistent with what the page
 * showed. Wrapping both in this provider means a mark-read action from
 * EITHER component updates the count everywhere immediately, the same
 * way AuthContext/ThemeContext are the one shared source for their
 * respective concerns.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(() => {
    if (!user) return;
    notificationService
      .getMyUnreadCount()
      .then(setUnreadCount)
      .catch(() => {
        // Silent on purpose — a failed background poll shouldn't
        // interrupt the user with an error toast every minute.
      });
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [user, refreshUnreadCount]);

  async function markAsRead(notification: AppNotification) {
    if (notification.isRead) return;
    await notificationService.markAsRead(notification.id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function markAllAsRead() {
    await notificationService.markAllAsRead();
    setUnreadCount(0);
  }

  return (
    <NotificationContext.Provider
      value={{ unreadCount, refreshUnreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}