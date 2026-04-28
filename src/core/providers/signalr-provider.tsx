"use client";

/**
 * SignalR Provider — Shared connection context.
 *
 * Maintains a SINGLE SignalR connection shared across all pages.
 * Auto-connects when authenticated, disconnects on logout.
 *
 * Place inside AppProvider after auth-related providers.
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
import { HUB_PATHS } from "@core/common/constants/signalr";

// ─── Types ───────────────────────────────────────────────────────────
export type SignalRConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";

interface SignalRContextValue {
  /** The shared HubConnection instance (null until first connect) */
  connection: HubConnection | null;
  /** Current connection state */
  connectionState: SignalRConnectionState;
}

// ─── Context ─────────────────────────────────────────────────────────
const SignalRContext = createContext<SignalRContextValue>({
  connection: null,
  connectionState: "disconnected",
});

/** Access the shared SignalR connection from any component */
export function useSignalRContext(): SignalRContextValue {
  return useContext(SignalRContext);
}

// ─── Hub URL helper ──────────────────────────────────────────────────
function getHubUrl(hubPath: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const origin = apiUrl.replace(/\/api\/?$/, "");
  return `${origin}${hubPath}`;
}

// ─── Provider Component ──────────────────────────────────────────────
interface SignalRProviderProps {
  /** Hub path relative to API origin (default: HUB_PATHS.AUDIT) */
  hubPath?: string;
  children: React.ReactNode;
}

export function SignalRProvider({ hubPath = HUB_PATHS.AUDIT, children }: SignalRProviderProps) {
  // Use STATE (not ref) for the connection so context consumers re-render
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>("disconnected");
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const pathname = usePathname();
  const isDocsRoute = pathname?.startsWith("/docs") || pathname?.startsWith("/commercial");

  // Ref to track the latest connection for cleanup (avoids stale closures)
  const connectionRef = useRef<HubConnection | null>(null);
  // Mutex flag — prevents double-negotiate in React Strict Mode (dev only)
  const isConnectingRef = useRef(false);

  const hubUrl = getHubUrl(hubPath);

  const connect = useCallback(async () => {
    // Guard: skip if already connected, connecting, or a connect() call is in-flight
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

      const conn = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => secureTokenService.getAccessToken() ?? "",
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            // Exponential backoff: 1s, 2s, 4s, 8s, 16s, cap at 30s
            return Math.min(Math.pow(2, retryContext.previousRetryCount) * 1000, 30_000);
          },
        })
        .configureLogging(
          process.env.NODE_ENV === "development" ? LogLevel.Information : LogLevel.Warning
        )
        .build();

      // Lifecycle handlers
      conn.onreconnecting(() => setConnectionState("reconnecting"));
      conn.onreconnected(() => setConnectionState("connected"));
      conn.onclose(() => {
        setConnectionState("disconnected");
        setConnection(null);
        connectionRef.current = null;
      });

      await conn.start();

      // Update BOTH ref (for guards) and state (for context consumers)
      connectionRef.current = conn;
      setConnection(conn);
      setConnectionState("connected");
      isConnectingRef.current = false;
    } catch {
      setConnectionState("disconnected");
      setConnection(null);
      connectionRef.current = null;
      isConnectingRef.current = false;
    }
  }, [hubUrl]);

  // Auto-connect on auth, disconnect on logout/unmount
  useEffect(() => {
    if (isDocsRoute) return; // Skip SignalR on docs routes
    if (isAuthenticated) {
      setTimeout(() => connect(), 0);
    } else {
      // User logged out — tear down connection
      connectionRef.current?.stop();
      connectionRef.current = null;
      setTimeout(() => {
        setConnection(null);
        setConnectionState("disconnected");
      }, 0);
    }

    return () => {
      connectionRef.current?.stop();
      connectionRef.current = null;
    };

  }, [isAuthenticated, isDocsRoute]);

  // Memoize context value to prevent unnecessary child re-renders
  const contextValue = useMemo(() => ({
    connection,
    connectionState,
  }), [connection, connectionState]);

  return (
    <SignalRContext.Provider value={contextValue}>
      {children}
    </SignalRContext.Provider>
  );
}
