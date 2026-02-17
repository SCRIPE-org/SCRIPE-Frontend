"use client";

/**
 * NotificationProvider — Dedicated SignalR WebSocket for notification bell.
 *
 * Maintains a persistent WebSocket connection to /hubs/notifications.
 * Auto-connects when authenticated, auto-joins user group on the backend.
 * Pushes real-time updates: ReceiveNotification + UnreadCountUpdated.
 *
 * Place inside AppProvider AFTER auth-related providers.
 */

import React, {
      createContext,
      useContext,
      useEffect,
      useRef,
      useState,
      useCallback,
      useMemo,
} from "react";
import {
      HubConnectionBuilder,
      HubConnection,
      HubConnectionState,
      LogLevel,
} from "@microsoft/signalr";
import { secureTokenService } from "@core/common/secure-token-service";
import { useAppStore } from "@core/store/useAppStore";
import { HUB_EVENTS, HUB_PATHS } from "@core/common/constants/signalr";

const LOG_PREFIX = "[Notifications]";

// ─── Types ───────────────────────────────────────────────────────────

/** Push DTO from backend NotificationPushDto (camelCase via JSON) */
export interface NotificationPushPayload {
      id: string;
      title: string;
      body: string;
      type: string;
      category: string;
      actionUrl: string | null;
      createdAt: string;
}

export type NotificationConnectionState =
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting";

interface NotificationContextValue {
      /** Current unread count (pushed from backend on every change) */
      unreadCount: number;
      /** Latest incoming notification (consumers can react to changes) */
      latestNotification: NotificationPushPayload | null;
      /** WebSocket connection state */
      connectionState: NotificationConnectionState;
      /** Force-refresh the unread count (for local optimistic updates after markAsRead) */
      setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

// ─── Context ─────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextValue>({
      unreadCount: 0,
      latestNotification: null,
      connectionState: "disconnected",
      setUnreadCount: () => { },
});

/** Access real-time notification data from any component */
export function useNotificationContext(): NotificationContextValue {
      return useContext(NotificationContext);
}

// ─── Hub URL helper ──────────────────────────────────────────────────
function getHubUrl(): string {
      const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const origin = apiUrl.replace(/\/api\/?$/, "");
      return `${origin}${HUB_PATHS.NOTIFICATIONS}`;
}

// ─── Provider Component ──────────────────────────────────────────────
interface NotificationProviderProps {
      children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
      const [unreadCount, setUnreadCount] = useState(0);
      const [latestNotification, setLatestNotification] =
            useState<NotificationPushPayload | null>(null);
      const [connectionState, setConnectionState] =
            useState<NotificationConnectionState>("disconnected");

      const isAuthenticated = useAppStore((s) => s.isAuthenticated);

      // Ref to track connection for cleanup (avoids stale closures)
      const connectionRef = useRef<HubConnection | null>(null);
      // Mutex — prevents double-negotiate in React Strict Mode
      const isConnectingRef = useRef(false);

      const hubUrl = getHubUrl();

      const connect = useCallback(async () => {
            // Guard: skip if already connected/connecting
            if (
                  isConnectingRef.current ||
                  connectionRef.current?.state === HubConnectionState.Connected ||
                  connectionRef.current?.state === HubConnectionState.Connecting ||
                  connectionRef.current?.state === HubConnectionState.Reconnecting
            ) {
                  return;
            }

            const token = secureTokenService.getAccessToken();
            if (!token) {
                  console.debug(LOG_PREFIX, "No token, skipping connect");
                  return;
            }

            try {
                  isConnectingRef.current = true;
                  setConnectionState("connecting");

                  console.debug(LOG_PREFIX, "Connecting to", hubUrl);

                  const conn = new HubConnectionBuilder()
                        .withUrl(hubUrl, {
                              accessTokenFactory: () =>
                                    secureTokenService.getAccessToken() ?? "",
                        })
                        .withAutomaticReconnect({
                              nextRetryDelayInMilliseconds: (retryContext) => {
                                    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, cap at 30s
                                    return Math.min(
                                          Math.pow(2, retryContext.previousRetryCount) * 1000,
                                          30_000
                                    );
                              },
                        })
                        .configureLogging(
                              process.env.NODE_ENV === "development"
                                    ? LogLevel.Information
                                    : LogLevel.Warning
                        )
                        .build();

                  // ─── Event Handlers (Server → Client) ────────────────────

                  // Authoritative unread count — backend sends this after every notification
                  conn.on(HUB_EVENTS.UNREAD_COUNT_UPDATED, (count: number) => {
                        console.debug(LOG_PREFIX, "UnreadCountUpdated →", count);
                        setUnreadCount(count);
                  });

                  // New notification pushed from backend
                  conn.on(
                        HUB_EVENTS.RECEIVE_NOTIFICATION,
                        (dto: NotificationPushPayload) => {
                              console.debug(LOG_PREFIX, "ReceiveNotification →", dto.title);
                              setLatestNotification(dto);
                              // Don't manually increment — UnreadCountUpdated follows immediately
                        }
                  );

                  // Lifecycle
                  conn.onreconnecting(() => {
                        console.debug(LOG_PREFIX, "Reconnecting...");
                        setConnectionState("reconnecting");
                  });
                  conn.onreconnected(() => {
                        console.debug(LOG_PREFIX, "Reconnected");
                        setConnectionState("connected");
                  });
                  conn.onclose(() => {
                        console.debug(LOG_PREFIX, "Connection closed");
                        setConnectionState("disconnected");
                        connectionRef.current = null;
                  });

                  // Start the WebSocket connection
                  await conn.start();

                  connectionRef.current = conn;
                  setConnectionState("connected");
                  isConnectingRef.current = false;

                  console.debug(LOG_PREFIX, "✅ WebSocket connected to notification hub");
            } catch (err) {
                  setConnectionState("disconnected");
                  connectionRef.current = null;
                  isConnectingRef.current = false;
                  console.warn(LOG_PREFIX, "❌ WebSocket connection failed:", err);
            }
      }, [hubUrl]);

      // Auto-connect on auth, disconnect on logout/unmount
      useEffect(() => {
            if (isAuthenticated) {
                  connect();
            } else {
                  // User logged out — tear down
                  connectionRef.current?.stop();
                  connectionRef.current = null;
                  setConnectionState("disconnected");
                  setUnreadCount(0);
                  setLatestNotification(null);
            }

            return () => {
                  connectionRef.current?.stop();
                  connectionRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isAuthenticated]);

      // Memoize context value to prevent unnecessary child re-renders
      const contextValue = useMemo(
            () => ({
                  unreadCount,
                  latestNotification,
                  connectionState,
                  setUnreadCount,
            }),
            [unreadCount, latestNotification, connectionState]
      );

      return (
            <NotificationContext.Provider value={contextValue}>
                  {children}
            </NotificationContext.Provider>
      );
}
