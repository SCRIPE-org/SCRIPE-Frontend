'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationBellContainer } from '@core/notification/di';
import { secureTokenService } from '@core/common/secure-token-service';
import type { NotificationItem } from '@core/notification/entities/NotificationItem';

export interface NotificationViewModel {
      /** Notifications list */
      notifications: NotificationItem[];
      /** Total unread count for badge */
      unreadCount: number;
      /** Loading state */
      isLoading: boolean;
      /** Whether the dropdown is open */
      isOpen: boolean;
      /** Toggle dropdown */
      toggleOpen: () => void;
      /** Close dropdown */
      close: () => void;
      /** Mark a single notification as read */
      markAsRead: (id: string) => void;
      /** Mark all as read */
      markAllAsRead: () => void;
      /** Refresh notifications */
      refresh: () => void;
}

/**
 * ViewModel hook for notification bell.
 * Handles polling for unread count and fetching notification list.
 * Uses the proper data layer: Repository → Service → IApiService.
 * Future: replace polling with SignalR real-time connection.
 */
export function useNotificationViewModel(): NotificationViewModel {
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [unreadCount, setUnreadCount] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

      const repo = notificationBellContainer.notificationBellRepository;

      const isAuthenticated = useCallback((): boolean => {
            return !!secureTokenService.getAccessToken();
      }, []);

      // Fetch unread count via repository
      const fetchUnreadCount = useCallback(async () => {
            if (!isAuthenticated()) return;
            try {
                  const data = await repo.getUnreadCount();
                  setUnreadCount(data.count ?? 0);
            } catch {
                  // silently fail — will retry on next poll
            }
      }, [repo, isAuthenticated]);

      // Fetch notifications list via repository
      const fetchNotifications = useCallback(async () => {
            if (!isAuthenticated()) return;
            setIsLoading(true);
            try {
                  const data = await repo.getNotifications({ pageSize: 10 });
                  setNotifications(data.items);
            } catch {
                  // silently fail
            } finally {
                  setIsLoading(false);
            }
      }, [repo, isAuthenticated]);

      // Mark single as read via repository
      const markAsRead = useCallback(async (id: string) => {
            if (!isAuthenticated()) return;
            try {
                  await repo.markAsRead(id);
                  setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
                  );
                  setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {
                  // silently fail
            }
      }, [repo, isAuthenticated]);

      // Mark all as read via repository
      const markAllAsRead = useCallback(async () => {
            if (!isAuthenticated()) return;
            try {
                  await repo.markAllAsRead();
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
            } catch {
                  // silently fail
            }
      }, [repo, isAuthenticated]);

      // Toggle open — fetch on open
      const toggleOpen = useCallback(() => {
            setIsOpen(prev => {
                  const next = !prev;
                  if (next) fetchNotifications();
                  return next;
            });
      }, [fetchNotifications]);

      const close = useCallback(() => setIsOpen(false), []);
      const refresh = useCallback(() => {
            fetchUnreadCount();
            if (isOpen) fetchNotifications();
      }, [fetchUnreadCount, fetchNotifications, isOpen]);

      // Poll unread count every 30 seconds
      useEffect(() => {
            if (!isAuthenticated()) return;
            fetchUnreadCount();
            intervalRef.current = setInterval(fetchUnreadCount, 30_000);
            return () => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
            };
      }, [fetchUnreadCount, isAuthenticated]);

      return {
            notifications,
            unreadCount,
            isLoading,
            isOpen,
            toggleOpen,
            close,
            markAsRead,
            markAllAsRead,
            refresh,
      };
}
