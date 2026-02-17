'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationBellContainer } from '@core/notification/di';
import { secureTokenService } from '@core/common/secure-token-service';
import {
      useNotificationContext,
      type NotificationPushPayload,
} from '@core/providers/notification-provider';
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
 * ViewModel hook for the notification bell.
 *
 * This is now a thin consumer of the NotificationProvider WebSocket context.
 * - Unread count: comes directly from the provider (real-time via WebSocket)
 * - Notification list: fetched via repository when the dropdown opens
 * - New notifications: prepended in real-time when ReceiveNotification fires
 */
export function useNotificationViewModel(): NotificationViewModel {
      const { unreadCount, latestNotification, setUnreadCount } = useNotificationContext();
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);

      const repo = notificationBellContainer.notificationBellRepository;

      const isLoggedIn = useCallback((): boolean => {
            return !!secureTokenService.getAccessToken();
      }, []);

      // ─── React to real-time incoming notifications ────────────────
      useEffect(() => {
            if (!latestNotification) return;

            const item = mapPushToItem(latestNotification);
            setNotifications((prev) => [item, ...prev].slice(0, 20));
      }, [latestNotification]);

      // ─── Fetch notification list (on demand, when dropdown opens) ─
      const fetchNotifications = useCallback(async () => {
            if (!isLoggedIn()) return;
            setIsLoading(true);
            try {
                  const data = await repo.getNotifications({ pageSize: 10 });
                  setNotifications(data.items);
            } catch {
                  // silently fail
            } finally {
                  setIsLoading(false);
            }
      }, [repo, isLoggedIn]);

      // ─── Actions ──────────────────────────────────────────────────
      const markAsRead = useCallback(async (id: string) => {
            if (!isLoggedIn()) return;
            try {
                  await repo.markAsRead(id);
                  setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
                  );
                  setUnreadCount(prev => Math.max(0, prev - 1));
            } catch {
                  // silently fail
            }
      }, [repo, isLoggedIn, setUnreadCount]);

      const markAllAsRead = useCallback(async () => {
            if (!isLoggedIn()) return;
            try {
                  await repo.markAllAsRead();
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
            } catch {
                  // silently fail
            }
      }, [repo, isLoggedIn, setUnreadCount]);

      const toggleOpen = useCallback(() => {
            setIsOpen(prev => {
                  const next = !prev;
                  if (next) fetchNotifications();
                  return next;
            });
      }, [fetchNotifications]);

      const close = useCallback(() => setIsOpen(false), []);
      const refresh = useCallback(() => {
            if (isOpen) fetchNotifications();
      }, [fetchNotifications, isOpen]);

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

// ─── Mapper ─────────────────────────────────────────────────────────
function mapPushToItem(dto: NotificationPushPayload): NotificationItem {
      return {
            id: dto.id,
            title: dto.title,
            body: dto.body,
            type: dto.type,
            category: dto.category,
            actionUrl: dto.actionUrl,
            createdAt: dto.createdAt,
            isRead: false,
            readAt: null,
            metadataJson: null,
      };
}
