import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { notificationService } from '@/services/notificationService';
import { useNotifications } from '@/context/NotificationContext';
import type { AppNotification } from '@/types';
import { Icons } from '@/components/Icons';

type ReadFilter = 'ALL' | 'UNREAD' | 'READ';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Full notification history — every notification the user has ever
 * received, read or unread, unlike NotificationBell's dropdown which
 * only shows a quick unread-focused glance. Shared across HR, Manager,
 * and Employee sidebars since the underlying data and behavior are
 * identical for every role (each user only ever sees their own
 * notifications, scoped server-side via AuthenticatedUser).
 *
 * Mark-read actions go through NotificationContext (markAsRead /
 * markAllAsRead) rather than calling notificationService directly, so
 * the bell's badge count updates immediately — both components read
 * the same shared count instead of each holding their own stale copy.
 *
 * No type filter or color-coded dots — with only a handful of
 * notification categories in practice, a dedicated filter for them
 * adds noise without enough variety to be useful yet.
 */
export function NotificationsPage() {
  const { markAsRead, markAllAsRead } = useNotifications();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReadFilter>('ALL');

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    setIsLoading(true);
    setError(null);
    notificationService
      .getMyNotifications()
      .then(setNotifications)
      .catch((err) => {
        const backendMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
        setError(backendMessage ?? 'Could not load notifications. Please try again.');
      })
      .finally(() => setIsLoading(false));
  }

  async function handleMarkRead(notification: AppNotification) {
    if (notification.isRead) return;
    try {
      await markAsRead(notification);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      const backendMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? 'Could not mark this notification as read.');
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      const backendMessage = isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(backendMessage ?? 'Could not mark all notifications as read.');
    }
  }

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD' && n.isRead) return false;
    if (filter === 'READ' && !n.isRead) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-[rgb(var(--text-muted))]">
        Loading notifications…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[rgb(var(--text-primary))]">Notifications</h1>
          <p className="mt-1 text-sm text-[rgb(var(--text-secondary))]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 rounded-lg border border-[rgb(var(--border-subtle))] px-3.5 py-2 text-sm font-medium text-[rgb(var(--text-primary))] hover:border-brand-400 hover:text-brand-600"
          >
            <Icons.Check className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ReadFilter)}
          className="rounded-lg border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] px-3 py-1.5 text-sm text-[rgb(var(--text-primary))] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="ALL">All</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </div>

      <div className="rounded-xl border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))] shadow-card">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-[rgb(var(--text-muted))]">
            {notifications.length === 0
              ? 'No notifications yet.'
              : 'No notifications match your filter.'}
          </div>
        ) : (
          <ul className="divide-y divide-[rgb(var(--border-subtle))]">
            {filtered.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => handleMarkRead(n)}
                  disabled={n.isRead}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition-colors ${
                    n.isRead
                      ? 'cursor-default'
                      : 'cursor-pointer bg-brand-50/30 hover:bg-brand-50/60 dark:bg-brand-900/10 dark:hover:bg-brand-900/20'
                  }`}
                >
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                          New
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-[rgb(var(--text-secondary))]">
                      {n.message}
                    </span>
                    <span className="mt-1.5 block text-xs text-[rgb(var(--text-muted))]">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </span>
                  {!n.isRead && (
                    <span className="shrink-0 text-xs font-medium text-brand-600 dark:text-brand-400">
                      Mark read
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}