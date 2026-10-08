"use client";

/**
 * useNotificationViewModel — Notification bell ViewModel.
 *
 * PURE WEBSOCKET — zero polling, zero periodic HTTP requests.
 * Reads real-time unread count from NotificationSignalRProvider context.
 *
 * Data flow:
 * 1. NotificationSignalRProvider connects to /hubs/notifications
 * 2. Backend OnConnectedAsync() pushes initial UnreadCountUpdated(count)
 * 3. When a notification is sent, backend pushes ReceiveNotification + UnreadCountUpdated
 * 4. This viewmodel reads those values from the provider context
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationBellContainer } from "@core/notification/di";
import { SecureTokenService } from "@core/common/secure-token-service";
import { useNotificationHub } from "@core/providers/notification-provider";
import type { NotificationItem } from "@core/notification/entities/NotificationItem";

// ─── Types ───────────────────────────────────────────────────────────

export interface NotificationViewModel {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  /** True when the last list fetch failed — lets the UI distinguish "no notifications yet" from "couldn't load". */
  isError: boolean;
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
  const [isError, setIsError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Pure WebSocket — all data comes from the provider
  const hub = useNotificationHub();
  const unreadCount = hub.unreadCount;
  const latestNotification = hub.latestNotification;

  const repo = notificationBellContainer.notificationBellRepository;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
    queueMicrotask(() => {
      setNotifications((prev) => [item, ...prev].slice(0, 20));
    });
  }, [latestNotification]);

  // ─── Fetch notification list (only when dropdown opens) ────────
  const fetchList = useCallback(async () => {
    const token = SecureTokenService.getAccessToken();
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await repo.getNotifications({ pageSize: 10 });
      if (mountedRef.current) {
        setNotifications(data.items);
        setIsError(false);
      }
    } catch {
      // Distinguish "failed to load" from "genuinely no notifications" — the panel
      // must not silently render an empty state when the fetch itself failed.
      if (mountedRef.current) setIsError(true);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [repo]);

  // ─── Actions ──────────────────────────────────────────────────
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await repo.markAsRead(id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
          )
        );
        hub.setUnreadCount((prev: number) => Math.max(0, prev - 1));
      } catch {
        /* silently fail */
      }
    },
    [repo, hub]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await repo.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      hub.setUnreadCount(0);
    } catch {
      /* silently fail */
    }
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
    if (isOpen) fetchList();
  }, [fetchList, isOpen]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    isOpen,
    toggleOpen,
    close,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
