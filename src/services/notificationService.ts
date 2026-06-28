import { apiClient } from './apiClient';
import type { AppNotification } from '@/types';

// All endpoints here resolve identity from the caller's JWT on the
// backend (NotificationController + AuthenticatedUser) — no userId is
// ever sent from the frontend, matching the same pattern as
// employeeService/managerService.
export const notificationService = {
  async getMyNotifications(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<AppNotification[]>('/notifications/me');
    return data;
  },

  async getMyUnread(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<AppNotification[]>('/notifications/me/unread');
    return data;
  },

  async getMyUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ unreadCount: number }>('/notifications/me/unread/count');
    return data.unreadCount;
  },

  async markAsRead(notificationId: string): Promise<AppNotification> {
    const { data } = await apiClient.patch<AppNotification>(`/notifications/${notificationId}/read`);
    return data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/notifications/me/read-all');
  },
};