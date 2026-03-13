"use client";

/**
 * NotificationSignalRProvider — Dedicated SignalR connection for /hubs/notifications.
 *
 * Separate hub, separate context. EXACT same connection pattern as SignalRProvider.
 * Subscribes to UnreadCountUpdated + ReceiveNotification server events.
 *
 * On connect, the backend's NotificationHub.OnConnectedAsync() automatically:
 * 1. Adds the connection to user_{userId} group
 * 2. Pushes current unread count via UnreadCountUpdated
 */

import React, {
      createContext,
      useContext,
      useEffect,
      useMemo,
      useRef,
      useState,
      useCallback,
} from "react";
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
      connectionState:
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting";
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

// ─── Hub URL ─────────────────────────────────────────────────────────
function getHubUrl(): string {
      const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const origin = apiUrl.replace(/\/api\/?$/, "");
      return `${origin}${HUB_PATHS.NOTIFICATIONS}`;
}

// ─── Provider ────────────────────────────────────────────────────────
export function NotificationSignalRProvider({
      children,
}: {
      children: React.ReactNode;
}) {
      const [connection, setConnection] = useState<HubConnection | null>(null);
      const [connectionState, setConnectionState] = useState<
            "disconnected" | "connecting" | "connected" | "reconnecting"
      >("disconnected");
      const [unreadCount, setUnreadCount] = useState(0);
      const [latestNotification, setLatestNotification] =
            useState<NotificationPushPayload | null>(null);

      const isAuthenticated = useAppStore((s) => s.isAuthenticated);
      const pathname = usePathname();
      const isDocsRoute = pathname?.startsWith("/docs") || pathname?.startsWith("/commercial");

      const connectionRef = useRef<HubConnection | null>(null);
      const isConnectingRef = useRef(false);

      const hubUrl = getHubUrl();

      // ── Connect (mirrors SignalRProvider.connect exactly) ────────────

      const connect = useCallback(async () => {
            if (
                  isConnectingRef.current ||
                  connectionRef.current?.state === HubConnectionState.Connected ||
                  connectionRef.current?.state === HubConnectionState.Connecting ||
                  connectionRef.current?.state === HubConnectionState.Reconnecting
            ) {
                  console.log("[NotifHub] Skipped — already connected or connecting");
                  return;
            }

            const token = secureTokenService.getAccessToken();
            if (!token) {
                  console.warn("[NotifHub] No access token — cannot connect");
                  return;
            }

            try {
                  isConnectingRef.current = true;
                  setConnectionState("connecting");

                  console.log("[NotifHub] Connecting to", hubUrl, "...");

                  const conn = new HubConnectionBuilder()
                        .withUrl(hubUrl, {
                              accessTokenFactory: () =>
                                    secureTokenService.getAccessToken() ?? "",
                        })
                        .withAutomaticReconnect({
                              nextRetryDelayInMilliseconds: (ctx) =>
                                    Math.min(Math.pow(2, ctx.previousRetryCount) * 1000, 30_000),
                        })
                        .configureLogging(
                              process.env.NODE_ENV === "development"
                                    ? LogLevel.Information
                                    : LogLevel.Warning
                        )
                        .build();

                  // Register event handlers BEFORE start()
                  conn.on(HUB_EVENTS.UNREAD_COUNT_UPDATED, (count: number) => {
                        console.log("[NotifHub] ⚡ UnreadCountUpdated →", count);
                        setUnreadCount(count);
                  });

                  conn.on(
                        HUB_EVENTS.RECEIVE_NOTIFICATION,
                        (dto: NotificationPushPayload) => {
                              console.log("[NotifHub] 📬 ReceiveNotification →", dto.title);
                              setLatestNotification(dto);
                        }
                  );

                  conn.onreconnecting(() => {
                        console.log("[NotifHub] 🔄 Reconnecting...");
                        setConnectionState("reconnecting");
                  });
                  conn.onreconnected(() => {
                        console.log("[NotifHub] ✅ Reconnected");
                        setConnectionState("connected");
                  });
                  conn.onclose((err) => {
                        console.log("[NotifHub] 🔌 Closed", err?.message ?? "");
                        setConnectionState("disconnected");
                        setConnection(null);
                        connectionRef.current = null;
                  });

                  await conn.start();

                  connectionRef.current = conn;
                  setConnection(conn);
                  setConnectionState("connected");
                  isConnectingRef.current = false;

                  console.log("[NotifHub] ✅ Connected to", hubUrl);
            } catch (err) {
                  console.error("[NotifHub] ❌ Connection FAILED:", err);
                  setConnectionState("disconnected");
                  setConnection(null);
                  connectionRef.current = null;
                  isConnectingRef.current = false;
            }
      }, [hubUrl]);

      // ── Auto-connect on auth (mirrors SignalRProvider exactly) ──────

      useEffect(() => {
            if (isDocsRoute) return;

            if (isAuthenticated && secureTokenService.hasToken()) {
                  console.log("[NotifHub] isAuthenticated=true, calling connect()");
                  connect();
            } else {
                  console.log("[NotifHub] isAuthenticated=false, tearing down");
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

      const contextValue = useMemo(
            () => ({
                  connection,
                  connectionState,
                  unreadCount,
                  latestNotification,
                  setUnreadCount,
            }),
            [connection, connectionState, unreadCount, latestNotification]
      );

      return (
            <NotificationHubContext.Provider value={contextValue}>
                  {children}
            </NotificationHubContext.Provider>
      );
}
