import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { notificationService } from '@/services/notificationService';
import { useNotifications } from '@/context/NotificationContext';
import type { AppNotification, NotificationCategory } from '@/types';
import { Icons } from '@/components/Icons';

function getNotificationsPath(pathname: string): string {
  if (pathname.startsWith('/hr')) return '/hr/notifications';
  if (pathname.startsWith('/manager')) return '/manager/notifications';
  return '/employee/notifications';
}

const TYPE_DOT_COLOR: Record<NotificationCategory, string> = {
  INFO: 'bg-sky-500',
  WARNING: 'bg-amber-500',
  SUCCESS: 'bg-emerald-500',
  APPRAISAL: 'bg-violet-500',
  REVIEW: 'bg-brand-500',
  GOAL: 'bg-pink-500',
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function NotificationBell() {
  const location = useLocation();
  const notificationsPath = getNotificationsPath(location.pathname);
  const { unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function openPanel() {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    notificationService
      .getMyUnread()
      .then(setNotifications)
      .catch((err) => {
        const backendMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
        setError(backendMessage ?? 'Could not load notifications.');
      })
      .finally(() => setIsLoading(false));
  }

  function togglePanel() {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openPanel();
    }
  }

  async function handleNotificationClick(notification: AppNotification) {
    try {
      await markAsRead(notification);
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    } catch {
      // If marking-as-read fails, leave it in the list rather than show
      // a disruptive error for what's a minor, non-blocking action.
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications([]);
    } catch {
      // Same reasoning as above — non-critical, fail quietly.
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={togglePanel}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[rgb(var(--text-secondary))] hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-surface-800"
      >
        <Icons.Bell />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
          <div className="flex items-center justify-between border-b border-[rgb(var(--border-subtle))] px-4 py-3">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Mark all read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-sm text-[rgb(var(--text-muted))]">Loading…</div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-red-600 dark:text-red-400">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-[rgb(var(--text-muted))]">
              You're all caught up.
            </div>
          ) : (
            <ul className="divide-y divide-[rgb(var(--border-subtle))]">
              {notifications.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className="flex w-full items-start gap-2.5 bg-brand-50/30 px-4 py-3 text-left transition-colors hover:bg-brand-50/60 dark:bg-brand-900/10 dark:hover:bg-brand-900/20"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT_COLOR[n.type]}`} />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-[rgb(var(--text-primary))]">
                        {n.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-[rgb(var(--text-secondary))]">
                        {n.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-[rgb(var(--text-muted))]">
                        {timeAgo(n.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            to={notificationsPath}
            onClick={() => setIsOpen(false)}
            className="block border-t border-[rgb(var(--border-subtle))] px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-brand-50/50 dark:text-brand-400 dark:hover:bg-surface-800/50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}