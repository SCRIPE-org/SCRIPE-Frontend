'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { secureTokenService } from '@core/common/secure-token-service';

/**
 * Notification types matching backend DTOs.
 */
interface NotificationItem {
      id: string;
      title: string;
      body: string;
      type: string;
      category: string;
      isRead: boolean;
      readAt: string | null;
      actionUrl: string | null;
      metadataJson: string | null;
      createdAt: string;
}

interface NotificationListResponse {
      items: NotificationItem[];
      totalCount: number;
      page: number;
      pageSize: number;
}

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
 * Future: replace polling with SignalR real-time connection.
 */
export function useNotificationViewModel(): NotificationViewModel {
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [unreadCount, setUnreadCount] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

      const apiBase = process.env.NEXT_PUBLIC_API_URL || '';

      const getHeaders = useCallback((): HeadersInit => {
            const token = secureTokenService.getAccessToken();
            return {
                  'Content-Type': 'application/json',
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
            };
      }, []);

      const isAuthenticated = useCallback((): boolean => {
            return !!secureTokenService.getAccessToken();
      }, []);

      // Fetch unread count
      const fetchUnreadCount = useCallback(async () => {
            if (!isAuthenticated()) return;
            try {
                  const res = await fetch(`${apiBase}/api/v1/notifications/unread-count`, {
                        headers: getHeaders(),
                  });
                  if (res.ok) {
                        const data = await res.json();
                        setUnreadCount(data.count ?? data.unreadCount ?? 0);
                  }
            } catch {
                  // silently fail — will retry on next poll
            }
      }, [apiBase, getHeaders, isAuthenticated]);

      // Fetch notifications list
      const fetchNotifications = useCallback(async () => {
            if (!isAuthenticated()) return;
            setIsLoading(true);
            try {
                  const res = await fetch(`${apiBase}/api/v1/notifications?pageSize=10`, {
                        headers: getHeaders(),
                  });
                  if (res.ok) {
                        const data: NotificationListResponse = await res.json();
                        setNotifications(data.items);
                  }
            } catch {
                  // silently fail
            } finally {
                  setIsLoading(false);
            }
      }, [apiBase, getHeaders, isAuthenticated]);

      // Mark single as read
      const markAsRead = useCallback(async (id: string) => {
            if (!isAuthenticated()) return;
            try {
                  await fetch(`${apiBase}/api/v1/notifications/${id}/read`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                  });
                  setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
                  );
                  setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {
                  // silently fail
            }
      }, [apiBase, getHeaders, isAuthenticated]);

      // Mark all as read
      const markAllAsRead = useCallback(async () => {
            if (!isAuthenticated()) return;
            try {
                  await fetch(`${apiBase}/api/v1/notifications/read-all`, {
                        method: 'PATCH',
                        headers: getHeaders(),
                  });
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
            } catch {
                  // silently fail
            }
      }, [apiBase, getHeaders, isAuthenticated]);

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
