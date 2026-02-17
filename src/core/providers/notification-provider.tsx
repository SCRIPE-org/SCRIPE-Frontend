"use client";

/**
 * NotificationSignalRProvider — Dedicated SignalR connection for /hubs/notifications.
 *
 * Carbon-copy of the PROVEN working SignalRProvider (audit hub), with its own context.
 * This ensures the notification WebSocket connection follows the exact same code path
 * that already works for audit events.
 *
 * Also provides:
 * - `unreadCount` from UnreadCountUpdated event (pushed on connect + on each notification)
 * - `latestNotification` from ReceiveNotification event
 */

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
      HubConnectionBuilder,
      HubConnection,
      HubConnectionState,
      LogLevel,
} from "@microsoft/signalr";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import { HUB_EVENTS, HUB_PATHS } from "@core/common/constants/signalr";

// ─── Types ───────────────────────────────────────────────────────────

export interface NotificationPushPayload {
      id: string;
      title: string;
      body: string;
      type: string;
      category: string;
      actionUrl: string | null;
      createdAt: string;
}

interface NotificationHubContextValue {
      connection: HubConnection | null;
      connectionState: "disconnected" | "connecting" | "connected" | "reconnecting";
      unreadCount: number;
      latestNotification: NotificationPushPayload | null;
      setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

// ─── Context ─────────────────────────────────────────────────────────
const NotificationHubContext = createContext<NotificationHubContextValue>({
      connection: null,
      connectionState: "disconnected",
      unreadCount: 0,
      latestNotification: null,
      setUnreadCount: () => { },
});

export function useNotificationHub(): NotificationHubContextValue {
      return useContext(NotificationHubContext);
}

// ─── Hub URL helper (same as working SignalRProvider) ────────────────
function getHubUrl(): string {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const origin = apiUrl.replace(/\/api\/?$/, "");
      return `${origin}${HUB_PATHS.NOTIFICATIONS}`;
}

// ─── Provider Component (SAME PATTERN as working SignalRProvider) ────
export function NotificationSignalRProvider({ children }: { children: React.ReactNode }) {
      // State for the connection (same as working SignalRProvider)
      const [connection, setConnection] = useState<HubConnection | null>(null);
      const [connectionState, setConnectionState] = useState<"disconnected" | "connecting" | "connected" | "reconnecting">("disconnected");
      const [unreadCount, setUnreadCount] = useState(0);
      const [latestNotification, setLatestNotification] = useState<NotificationPushPayload | null>(null);

      const isAuthenticated = useAppStore((s) => s.isAuthenticated);
      const pathname = usePathname();
      const isDocsRoute = pathname?.startsWith("/docs");

      // Ref to track the latest connection for cleanup (same as working SignalRProvider)
      const connectionRef = useRef<HubConnection | null>(null);
      const isConnectingRef = useRef(false);

      const hubUrl = getHubUrl();

      const connect = useCallback(async () => {
            // Guard: same exact guards as working SignalRProvider
            if (
                  isConnectingRef.current ||
                  connectionRef.current?.state === HubConnectionState.Connected ||
                  connectionRef.current?.state === HubConnectionState.Connecting ||
                  connectionRef.current?.state === HubConnectionState.Reconnecting
            ) {
                  return;
            }

            const token = secureTokenService.getAccessToken();
            if (!token) return;

            try {
                  isConnectingRef.current = true;
                  setConnectionState("connecting");

                  // Exact same builder config as working SignalRProvider
                  const conn = new HubConnectionBuilder()
                        .withUrl(hubUrl, {
                              accessTokenFactory: () => secureTokenService.getAccessToken() ?? "",
                        })
                        .withAutomaticReconnect({
                              nextRetryDelayInMilliseconds: (retryContext) => {
                                    return Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30_000);
                              },
                        })
                        .configureLogging(
                              process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning
                        )
                        .build();

                  // ── Notification-specific event handlers ──────────────────
                  conn.on(HUB_EVENTS.UNREAD_COUNT_UPDATED, (count: number) => {
                        console.log("[NotifHub] UnreadCountUpdated →", count);
                        setUnreadCount(count);
                  });

                  conn.on(HUB_EVENTS.RECEIVE_NOTIFICATION, (dto: NotificationPushPayload) => {
                        console.log("[NotifHub] ReceiveNotification →", dto.title);
                        setLatestNotification(dto);
                  });

                  // Lifecycle handlers (same as working SignalRProvider)
                  conn.onreconnecting(() => setConnectionState("reconnecting"));
                  conn.onreconnected(() => setConnectionState("connected"));
                  conn.onclose(() => {
                        setConnectionState("disconnected");
                        setConnection(null);
                        connectionRef.current = null;
                  });

                  await conn.start();

                  // Update BOTH ref and state (same as working SignalRProvider)
                  connectionRef.current = conn;
                  setConnection(conn);
                  setConnectionState("connected");
                  isConnectingRef.current = false;

                  console.log("[NotifHub] ✅ Connected to", hubUrl);
            } catch (err) {
                  console.error("[NotifHub] ❌ Connection failed:", err);
                  setConnectionState("disconnected");
                  setConnection(null);
                  connectionRef.current = null;
                  isConnectingRef.current = false;
            }
      }, [hubUrl]);

      // Auto-connect on auth (SAME EXACT pattern as working SignalRProvider)
      useEffect(() => {
            if (isDocsRoute) return;
            if (isAuthenticated) {
                  connect();
            } else {
                  connectionRef.current?.stop();
                  connectionRef.current = null;
                  setConnection(null);
                  setConnectionState("disconnected");
            }

            return () => {
                  connectionRef.current?.stop();
                  connectionRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isAuthenticated, isDocsRoute]);

      const contextValue = useMemo(() => ({
            connection,
            connectionState,
            unreadCount,
            latestNotification,
            setUnreadCount,
      }), [connection, connectionState, unreadCount, latestNotification]);

      return (
            <NotificationHubContext.Provider value={contextValue}>
                  {children}
            </NotificationHubContext.Provider>
      );
}
