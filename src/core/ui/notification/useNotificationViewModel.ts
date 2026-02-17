'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { notificationBellContainer } from '@core/notification/di';
import { secureTokenService } from '@core/common/secure-token-service';
import { HUB_EVENTS, HUB_PATHS } from '@core/common/constants/signalr';
import { useAppStore } from '@core/store/useAppStore';
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
 *
 * Uses a DEDICATED SignalR connection to `/hubs/notifications` for real-time updates:
 * - `UnreadCountUpdated(count)` → instantly updates badge
 * - `ReceiveNotification(dto)` → prepends to list + increments badge
 *
 * Falls back to polling every 30s if SignalR connection fails.
 */
export function useNotificationViewModel(): NotificationViewModel {
      const [notifications, setNotifications] = useState<NotificationItem[]>([]);
      const [unreadCount, setUnreadCount] = useState(0);
      const [isLoading, setIsLoading] = useState(false);
      const [isOpen, setIsOpen] = useState(false);
      const isAuthenticated = useAppStore((s) => s.isAuthenticated);

      const connectionRef = useRef<HubConnection | null>(null);
      const isConnectingRef = useRef(false);
      const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

      const repo = notificationBellContainer.notificationBellRepository;

      const isLoggedIn = useCallback((): boolean => {
            return !!secureTokenService.getAccessToken();
      }, []);

      // ─── Fetch helpers ────────────────────────────────────────────
      const fetchUnreadCount = useCallback(async () => {
            if (!isLoggedIn()) return;
            try {
                  const data = await repo.getUnreadCount();
                  setUnreadCount(data.count ?? 0);
            } catch {
                  // silently fail — will retry on next poll or SignalR event
            }
      }, [repo, isLoggedIn]);

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

      // ─── SignalR Connection ───────────────────────────────────────
      useEffect(() => {
            if (!isAuthenticated || !isLoggedIn()) return;

            const connectSignalR = async () => {
                  if (
                        isConnectingRef.current ||
                        connectionRef.current?.state === HubConnectionState.Connected ||
                        connectionRef.current?.state === HubConnectionState.Connecting
                  ) {
                        return;
                  }

                  const token = secureTokenService.getAccessToken();
                  if (!token) return;

                  try {
                        isConnectingRef.current = true;

                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                        const origin = apiUrl.replace(/\/api\/?$/, '');
                        const hubUrl = `${origin}${HUB_PATHS.NOTIFICATIONS}`;

                        const conn = new HubConnectionBuilder()
                              .withUrl(hubUrl, {
                                    accessTokenFactory: () => secureTokenService.getAccessToken() ?? '',
                              })
                              .withAutomaticReconnect({
                                    nextRetryDelayInMilliseconds: (ctx) =>
                                          Math.min(Math.pow(2, ctx.previousRetryCount) * 1000, 30_000),
                              })
                              .configureLogging(
                                    process.env.NODE_ENV === 'development' ? LogLevel.Information : LogLevel.Warning
                              )
                              .build();

                        // ─── Real-time event handlers ─────────────────────
                        conn.on(HUB_EVENTS.UNREAD_COUNT_UPDATED, (count: number) => {
                              setUnreadCount(count);
                        });

                        conn.on(HUB_EVENTS.RECEIVE_NOTIFICATION, (dto: NotificationItem) => {
                              // Prepend new notification to the list
                              setNotifications((prev) => [dto, ...prev].slice(0, 20));
                              // Also bump unread count
                              setUnreadCount((prev) => prev + 1);
                        });

                        conn.onreconnected(() => {
                              // After reconnect, re-fetch to sync state
                              fetchUnreadCount();
                        });

                        await conn.start();
                        connectionRef.current = conn;
                        isConnectingRef.current = false;

                        // SignalR connected — clear polling fallback
                        if (pollingRef.current) {
                              clearInterval(pollingRef.current);
                              pollingRef.current = null;
                        }
                  } catch {
                        isConnectingRef.current = false;
                        // SignalR failed — fall back to polling
                        if (!pollingRef.current) {
                              pollingRef.current = setInterval(fetchUnreadCount, 30_000);
                        }
                  }
            };

            // Initial fetch + connect
            fetchUnreadCount();
            connectSignalR();

            // Start polling as immediate fallback (cleared once SignalR connects)
            pollingRef.current = setInterval(fetchUnreadCount, 30_000);

            return () => {
                  // Cleanup
                  connectionRef.current?.stop();
                  connectionRef.current = null;
                  isConnectingRef.current = false;
                  if (pollingRef.current) {
                        clearInterval(pollingRef.current);
                        pollingRef.current = null;
                  }
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isAuthenticated]);

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
      }, [repo, isLoggedIn]);

      const markAllAsRead = useCallback(async () => {
            if (!isLoggedIn()) return;
            try {
                  await repo.markAllAsRead();
                  setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
                  setUnreadCount(0);
            } catch {
                  // silently fail
            }
      }, [repo, isLoggedIn]);

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
