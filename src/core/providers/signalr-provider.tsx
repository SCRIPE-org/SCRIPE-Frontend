'use client';

/**
 * SignalR Provider — Shared connection context.
 *
 * Maintains a SINGLE SignalR connection shared across all pages.
 * Auto-connects when authenticated, disconnects on logout.
 *
 * Place inside AppProvider after auth-related providers.
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import {
      HubConnectionBuilder,
      HubConnection,
      HubConnectionState,
      LogLevel,
} from '@microsoft/signalr';
import { secureTokenService } from '@core/common/secure-token-service';
import { useAppStore } from '@core/store/useAppStore';
import { HUB_PATHS } from '@core/common/constants/signalr';

// ─── Types ───────────────────────────────────────────────────────────
export type SignalRConnectionState =
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'reconnecting';

interface SignalRContextValue {
      /** The shared HubConnection instance (null until first connect) */
      connection: HubConnection | null;
      /** Current connection state */
      connectionState: SignalRConnectionState;
}

// ─── Context ─────────────────────────────────────────────────────────
const SignalRContext = createContext<SignalRContextValue>({
      connection: null,
      connectionState: 'disconnected',
});

/** Access the shared SignalR connection from any component */
export function useSignalRContext(): SignalRContextValue {
      return useContext(SignalRContext);
}

// ─── Hub URL helper ──────────────────────────────────────────────────
function getHubUrl(hubPath: string): string {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const origin = apiUrl.replace(/\/api\/?$/, '');
      return `${origin}${hubPath}`;
}

// ─── Provider Component ──────────────────────────────────────────────
interface SignalRProviderProps {
      /** Hub path relative to API origin (default: HUB_PATHS.AUDIT) */
      hubPath?: string;
      children: React.ReactNode;
}

export function SignalRProvider({
      hubPath = HUB_PATHS.AUDIT,
      children,
}: SignalRProviderProps) {
      const connectionRef = useRef<HubConnection | null>(null);
      const [connectionState, setConnectionState] =
            useState<SignalRConnectionState>('disconnected');
      const isAuthenticated = useAppStore((s) => s.isAuthenticated);

      const hubUrl = getHubUrl(hubPath);

      const connect = useCallback(async () => {
            // Guard: skip if already connected or connecting
            if (
                  connectionRef.current?.state === HubConnectionState.Connected ||
                  connectionRef.current?.state === HubConnectionState.Connecting ||
                  connectionRef.current?.state === HubConnectionState.Reconnecting
            ) {
                  return;
            }

            const token = secureTokenService.getAccessToken();
            if (!token) return;

            try {
                  setConnectionState('connecting');

                  const connection = new HubConnectionBuilder()
                        .withUrl(hubUrl, {
                              accessTokenFactory: () =>
                                    secureTokenService.getAccessToken() ?? '',
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
                              process.env.NODE_ENV === 'development'
                                    ? LogLevel.Information
                                    : LogLevel.Warning
                        )
                        .build();

                  // Lifecycle handlers
                  connection.onreconnecting(() => setConnectionState('reconnecting'));
                  connection.onreconnected(() => setConnectionState('connected'));
                  connection.onclose(() => setConnectionState('disconnected'));

                  await connection.start();
                  connectionRef.current = connection;
                  setConnectionState('connected');
            } catch {
                  setConnectionState('disconnected');
            }
      }, [hubUrl]);

      // Auto-connect on auth, disconnect on logout/unmount
      useEffect(() => {
            if (isAuthenticated) {
                  connect();
            } else {
                  // User logged out — tear down connection
                  connectionRef.current?.stop();
                  connectionRef.current = null;
                  setConnectionState('disconnected');
            }

            return () => {
                  connectionRef.current?.stop();
                  connectionRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [isAuthenticated]);

      return (
            <SignalRContext.Provider
                  value={{
                        connection: connectionRef.current,
                        connectionState,
                  }}
            >
                  {children}
            </SignalRContext.Provider>
      );
}
