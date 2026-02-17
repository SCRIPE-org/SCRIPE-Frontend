'use client';

/**
 * useNotificationViewModel — Notification bell ViewModel.
 *
 * Reads real-time unread count from NotificationSignalRProvider context.
 * Also does an HTTP fetch on mount as safety net.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationBellContainer } from '@core/notification/di';
import { SecureTokenService } from '@core/common/secure-token-service';
import { useAppStore } from '@core/store/useAppStore';
import { useNotificationHub } from '@core/providers/notification-provider';
import type { NotificationItem } from '@core/notification/entities/NotificationItem';
import type { NotificationPushPayload } from '@core/providers/notification-provider';

// ─── Types ───────────────────────────────────────────────────────────

export interface NotificationViewModel {
      notifications: NotificationItem[];
      unreadCount: number;
      isLoading: boolean;
      isOpen: boolean;
      toggleOpen: () => void;
      close: () => void;
      markAsRead: (id: string) => void;
      markAllAsRead: () => void;
      refresh: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useNotificationViewModel(): NotificationViewModel {
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const [httpCount, setHttpCount] = useState(0);

      const isAuthenticated = useAppStore((s) => s.isAuthenticated);

      // Read from the PROVEN working provider (same pattern as audit SignalR)
      const { unreadCount: wsCount, latestNotification, setUnreadCount } = useNotificationHub();

      const repo = notificationBellContainer.notificationBellRepository;
      const mountedRef = useRef(true);

      // ─── HTTP fetch for initial badge (safety net) ─────────────────
      useEffect(() => {
            mountedRef.current = true;
            if (!isAuthenticated) return;

            const token = SecureTokenService.getAccessToken();
            if (!token) return;

            console.log('[NotifBell] Fetching initial count via HTTP...');
            repo.getUnreadCount()
                  .then((res) => {
                        const count = res.count ?? 0;
                        console.log('[NotifBell] HTTP count =', count);
                        if (mountedRef.current) setHttpCount(count);
                  })
                  .catch((err) => console.warn('[NotifBell] HTTP fetch failed:', err));

            return () => { mountedRef.current = false; };
      }, [isAuthenticated, repo]);

      // ─── Merge counts: use max of both (HTTP shows immediately, WS overrides) ──
      // httpCount is set on mount via HTTP fetch.
      // wsCount is set by the WebSocket provider when connected.
      // Use the higher of the two — ensures badge is visible ASAP.
      const unreadCount = Math.max(wsCount, httpCount);

      // ─── Handle new notification from WebSocket ────────────────────
      useEffect(() => {
            if (!latestNotification) return;
            const item: NotificationItem = {
                  id: latestNotification.id,
                  title: latestNotification.title,
                  body: latestNotification.body,
                  type: latestNotification.type,
                  category: latestNotification.category,
                  actionUrl: latestNotification.actionUrl,
                  createdAt: latestNotification.createdAt,
                  isRead: false,
                  readAt: null,
                  metadataJson: null,
            };
            setNotifications((prev) => [item, ...prev].slice(0, 20));
      }, [latestNotification]);

      // ─── Fetch notification list ──────────────────────────────────
      const fetchList = useCallback(async () => {
            const token = SecureTokenService.getAccessToken();
            if (!token) return;
            setIsLoading(true);
            try {
                  const data = await repo.getNotifications({ pageSize: 10 });
                  if (mountedRef.current) setNotifications(data.items);
            } catch { /* silently fail */ } finally {
                  if (mountedRef.current) setIsLoading(false);
            }
      }, [repo]);

      // ─── Actions ──────────────────────────────────────────────────
      const markAsRead = useCallback(async (id: string) => {
            try {
                  await repo.markAsRead(id);
                  setNotifications((prev) =>
                        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                  );
                  setUnreadCount((prev) => Math.max(0, prev - 1));
                  setHttpCount((prev) => Math.max(0, prev - 1));
            } catch { /* silently fail */ }
      }, [repo, setUnreadCount]);

      const markAllAsRead = useCallback(async () => {
            try {
                  await repo.markAllAsRead();
                  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
                  setHttpCount(0);
            } catch { /* silently fail */ }
      }, [repo, setUnreadCount]);

      const toggleOpen = useCallback(() => {
            setIsOpen((prev) => {
                  const next = !prev;
                  if (next) fetchList();
                  return next;
            });
      }, [fetchList]);

      const close = useCallback(() => setIsOpen(false), []);

      const refresh = useCallback(() => {
            repo.getUnreadCount()
                  .then((res) => {
                        setHttpCount(res.count ?? 0);
                        setUnreadCount(res.count ?? 0);
                  })
                  .catch(() => { });
            if (isOpen) fetchList();
      }, [repo, setUnreadCount, fetchList, isOpen]);

      // Debug log
      console.log('[NotifBell] render → wsCount=' + wsCount, 'httpCount=' + httpCount, 'final=' + unreadCount);

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
