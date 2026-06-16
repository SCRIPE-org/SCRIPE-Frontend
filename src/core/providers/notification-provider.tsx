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
import { appLogger } from "../common/logger";

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
  setUnreadCount: () => {},
});

export function useNotificationHub(): NotificationHubContextValue {
  return useContext(NotificationHubContext);
}

// ─── Hub URL ─────────────────────────────────────────────────────────
function getHubUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const origin = apiUrl.replace(/\/api\/?$/, "");
  return `${origin}${HUB_PATHS.NOTIFICATIONS}`;
}

// ─── Provider ────────────────────────────────────────────────────────
export function NotificationSignalRProvider({ children }: { children: React.ReactNode }) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected" | "reconnecting"
  >("disconnected");
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState<NotificationPushPayload | null>(
    null
  );

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
      appLogger.debug("[NotifHub] Skipped — already connected or connecting");
      return;
    }

    const token = secureTokenService.getAccessToken();
    if (!token) {
      appLogger.warn("[NotifHub] No access token — cannot connect");
      return;
    }

    try {
      isConnectingRef.current = true;
      setConnectionState("connecting");

      appLogger.debug("[NotifHub] Connecting to", hubUrl, "...");

      const conn = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => secureTokenService.getAccessToken() ?? "",
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (ctx) =>
            Math.min(Math.pow(2, ctx.previousRetryCount) * 1000, 30_000),
        })
        .configureLogging(
          process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning
        )
        .build();

      // Register event handlers BEFORE start()
      conn.on(HUB_EVENTS.UNREAD_COUNT_UPDATED, (count: number) => {
        appLogger.debug("[NotifHub] ⚡ UnreadCountUpdated →", count);
        setUnreadCount(count);
      });

      conn.on(HUB_EVENTS.RECEIVE_NOTIFICATION, (dto: NotificationPushPayload) => {
        appLogger.debug("[NotifHub] 📬 ReceiveNotification →", dto.title);
        setLatestNotification(dto);
      });

      conn.onreconnecting(() => {
        appLogger.debug("[NotifHub] 🔄 Reconnecting...");
        setConnectionState("reconnecting");
      });
      conn.onreconnected(() => {
        appLogger.debug("[NotifHub] ✅ Reconnected");
        setConnectionState("connected");
      });
      conn.onclose((err) => {
        appLogger.debug("[NotifHub] 🔌 Closed", err?.message ?? "");
        setConnectionState("disconnected");
        setConnection(null);
        connectionRef.current = null;
      });

      await conn.start();

      connectionRef.current = conn;
      setConnection(conn);
      setConnectionState("connected");
      isConnectingRef.current = false;

      appLogger.debug("[NotifHub] ✅ Connected to", hubUrl);
    } catch (err) {
      appLogger.error("[NotifHub] ❌ Connection FAILED:", err);
      setConnectionState("disconnected");
      setConnection(null);
      connectionRef.current = null;
      isConnectingRef.current = false;
    }
  }, [hubUrl]);

  // ── Auto-connect on auth or token change (mirrors SignalRProvider exactly) ──────

  useEffect(() => {
    if (isDocsRoute) return;

    const checkAndConnect = () => {
      if (isAuthenticated && secureTokenService.hasToken()) {
        appLogger.debug("[NotifHub] isAuthenticated=true, calling connect()");
        setTimeout(() => connect(), 0);
      } else if (!isAuthenticated) {
        appLogger.debug("[NotifHub] isAuthenticated=false, tearing down");
        connectionRef.current?.stop();
        connectionRef.current = null;
        setTimeout(() => {
          setConnection(null);
          setConnectionState("disconnected");
        }, 0);
      }
    };

    // Run check initially
    checkAndConnect();

    // Subscribe to access token updates to connect immediately when token is resolved
    const unsubscribe = secureTokenService.subscribe(() => {
      checkAndConnect();
    });

    return () => {
      unsubscribe();
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [isAuthenticated, isDocsRoute, connect]);

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
