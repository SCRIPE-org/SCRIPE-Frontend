'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import {
      HubConnectionBuilder,
      HubConnection,
      HubConnectionState,
      LogLevel,
} from '@microsoft/signalr';
import { secureTokenService } from '@core/common/secure-token-service';

/**
 * SignalR connection states exposed to consumers.
 */
export type SignalRConnectionState =
      | 'disconnected'
      | 'connecting'
      | 'connected'
      | 'reconnecting';

interface UseSignalROptions {
      /** Hub path relative to API base (e.g. "/hubs/audit") */
      hubPath: string;
      /** Whether to auto-connect on mount. Default: true */
      autoConnect?: boolean;
      /** Whether the connection should be active. Default: true */
      enabled?: boolean;
}

interface UseSignalRResult {
      /** The underlying SignalR HubConnection (null until first connect) */
      connection: HubConnection | null;
      /** Current connection state */
      connectionState: SignalRConnectionState;
      /** Manually start the connection */
      connect: () => Promise<void>;
      /** Manually stop the connection */
      disconnect: () => Promise<void>;
}

/**
 * Core SignalR hook — manages connection lifecycle, JWT auth, and auto-reconnect.
 *
 * Usage:
 * ```ts
 * const { connection, connectionState } = useSignalR({ hubPath: '/hubs/audit' });
 * ```
 */
export function useSignalR({
      hubPath,
      autoConnect = true,
      enabled = true,
}: UseSignalROptions): UseSignalRResult {
      const connectionRef = useRef<HubConnection | null>(null);
      const [connectionState, setConnectionState] =
            useState<SignalRConnectionState>('disconnected');

      // Derive hub URL from API base
      const hubUrl = getHubUrl(hubPath);

      const connect = useCallback(async () => {
            // Skip if already connected/connecting, or no token
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
                                    // Exponential backoff: 0s, 2s, 4s, 8s, 16s, then cap at 30s
                                    const delay = Math.min(
                                          Math.pow(2, retryContext.previousRetryCount) * 1000,
                                          30000
                                    );
                                    return delay;
                              },
                        })
                        .configureLogging(
                              process.env.NODE_ENV === 'development'
                                    ? LogLevel.Information
                                    : LogLevel.Warning
                        )
                        .build();

                  // Wire up lifecycle events
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

      const disconnect = useCallback(async () => {
            if (connectionRef.current) {
                  await connectionRef.current.stop();
                  connectionRef.current = null;
                  setConnectionState('disconnected');
            }
      }, []);

      // Auto-connect on mount, disconnect on unmount
      useEffect(() => {
            if (autoConnect && enabled) {
                  connect();
            }

            return () => {
                  connectionRef.current?.stop();
                  connectionRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [enabled]);

      return {
            connection: connectionRef.current,
            connectionState,
            connect,
            disconnect,
      };
}

/**
 * Derive the full hub URL from the API base URL.
 * NEXT_PUBLIC_API_URL = "http://localhost:3001/api"
 * Hub URL = "http://localhost:3001/hubs/audit"
 */
function getHubUrl(hubPath: string): string {
      const apiUrl =
            process.env.NEXT_PUBLIC_SOKET_URL!;

      // Strip trailing /api or /api/ to get server origin
      const origin = apiUrl.replace(/\/api\/?$/, '');
      return `${origin}${hubPath}`;
}
