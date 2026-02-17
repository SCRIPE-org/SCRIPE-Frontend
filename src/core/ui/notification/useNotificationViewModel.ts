'use client';

/**
 * useNotificationViewModel — Notification bell ViewModel.
 *
 * THREE layers ensure badge always updates:
 * 1. HTTP fetch on mount → badge shows immediately
 * 2. 10-second polling → guaranteed updates without refresh
 * 3. WebSocket via NotificationSignalRProvider → instant real-time updates (bonus)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationBellContainer } from '@core/notification/di';
import { SecureTokenService } from '@core/common/secure-token-service';
import { useAppStore } from '@core/store/useAppStore';
import { useNotificationHub } from '@core/providers/notification-provider';
import type { NotificationItem } from '@core/notification/entities/NotificationItem';

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

const POLL_INTERVAL = 10_000; // 10 seconds

// ─── Hook ────────────────────────────────────────────────────────────

export function useNotificationViewModel(): NotificationViewModel {
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const [pollCount, setPollCount] = useState(0);

      const isAuthenticated = useAppStore((s) => s.isAuthenticated);

      // WebSocket provider (bonus layer — if it connects, provides instant updates)
      const hub = useNotificationHub();
      const wsCount = hub.unreadCount;
      const latestNotification = hub.latestNotification;

      const repo = notificationBellContainer.notificationBellRepository;
      const mountedRef = useRef(true);

      // ─── HTTP fetch for unread count ───────────────────────────────
      const fetchCount = useCallback(async () => {
            const token = SecureTokenService.getAccessToken();
            if (!token) return;
            try {
                  const res = await repo.getUnreadCount();
                  const count = res.count ?? 0;
                  if (mountedRef.current) setPollCount(count);
            } catch {
                  // silently fail
            }
      }, [repo]);

      // ─── Fetch notification list (on dropdown open) ────────────────
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

      // ─── Main effect: HTTP fetch on mount + 10s polling ────────────
      useEffect(() => {
            mountedRef.current = true;
            if (!isAuthenticated) return;

            // 1. Immediate fetch
            fetchCount();

            // 2. Poll every 10 seconds (guaranteed badge updates)
            const interval = setInterval(fetchCount, POLL_INTERVAL);

            return () => {
                  mountedRef.current = false;
                  clearInterval(interval);
            };
      }, [isAuthenticated, fetchCount]);

      // ─── Handle new notification from WebSocket (bonus) ────────────
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
            // Also bump the poll count immediately
            setPollCount((prev) => prev + 1);
      }, [latestNotification]);

      // ─── Merge: use whichever count is higher ──────────────────────
      // wsCount = from WebSocket provider (instant, if connected)
      // pollCount = from HTTP polling (guaranteed, every 10s)
      const unreadCount = Math.max(wsCount, pollCount);

      // ─── Actions ──────────────────────────────────────────────────
      const markAsRead = useCallback(async (id: string) => {
            try {
                  await repo.markAsRead(id);
                  setNotifications((prev) =>
                        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                  );
                  setPollCount((prev) => Math.max(0, prev - 1));
                  hub.setUnreadCount((prev: number) => Math.max(0, prev - 1));
            } catch { /* silently fail */ }
      }, [repo, hub]);

      const markAllAsRead = useCallback(async () => {
            try {
                  await repo.markAllAsRead();
                  setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setPollCount(0);
                  hub.setUnreadCount(0);
            } catch { /* silently fail */ }
      }, [repo, hub]);

      const toggleOpen = useCallback(() => {
            setIsOpen((prev) => {
                  const next = !prev;
                  if (next) fetchList();
                  return next;
            });
      }, [fetchList]);

      const close = useCallback(() => setIsOpen(false), []);

      const refresh = useCallback(() => {
            fetchCount();
            if (isOpen) fetchList();
      }, [fetchCount, fetchList, isOpen]);

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
