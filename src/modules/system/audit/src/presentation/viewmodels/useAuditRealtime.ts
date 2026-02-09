'use client';

/**
 * useAuditRealtime — SignalR hook for live audit event updates.
 *
 * Listens for "AuditEvent" messages from the backend AuditHub.
 * On each event:
 *   1. Invalidates TanStack Query caches (auto-refresh)
 *   2. Shows a throttled toast notification
 *
 * All authenticated admin users join the "global" group.
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR, type SignalRConnectionState } from '@core/hooks/useSignalR';
import { useEnhancedToast } from '@core/hooks/use-enhanced-toast';
import { auditKeys } from './useAuditViewModel';

/** Lightweight audit event DTO matching backend AuditEventDto */
export interface AuditEventMessage {
      id: string;
      eventType: string;
      entityType?: string;
      entityId?: string;
      username?: string;
      isSuccess: boolean;
      timestamp: string;
      tenantId?: string;
}

interface UseAuditRealtimeResult {
      /** Current SignalR connection state */
      connectionState: SignalRConnectionState;
      /** Number of real-time events received in this session */
      realtimeEventCount: number;
      /** The most recent real-time event */
      lastEvent: AuditEventMessage | null;
}

/** Throttle interval for toast notifications (ms) */
const TOAST_THROTTLE_MS = 3000;

export function useAuditRealtime(): UseAuditRealtimeResult {
      const queryClient = useQueryClient();
      const { connection, connectionState } = useSignalR();
      const { info } = useEnhancedToast();

      const [realtimeEventCount, setRealtimeEventCount] = useState(0);
      const [lastEvent, setLastEvent] = useState<AuditEventMessage | null>(null);
      const lastToastTime = useRef(0);

      // Handle incoming audit events
      const handleAuditEvent = useCallback(
            (event: AuditEventMessage) => {
                  setRealtimeEventCount((c) => c + 1);
                  setLastEvent(event);

                  // Invalidate audit list query cache (triggers refetch)
                  queryClient.invalidateQueries({ queryKey: auditKeys.all });

                  // Also invalidate dashboard queries so KPIs/charts refresh
                  queryClient.invalidateQueries({ queryKey: ['dashboard'] });

                  // Throttled toast notification
                  const now = Date.now();
                  if (now - lastToastTime.current >= TOAST_THROTTLE_MS) {
                        lastToastTime.current = now;
                        const icon = event.isSuccess ? '✅' : '❌';
                        info({
                              title: `${icon} ${event.eventType}`,
                              description: [event.username, event.entityType]
                                    .filter(Boolean)
                                    .join(' · ') || undefined,
                              duration: 4000,
                        });
                  }
            },
            [queryClient, info]
      );

      // Register/unregister SignalR event handler + join global group
      useEffect(() => {
            if (!connection || connectionState !== 'connected') return;

            // Listen for audit events
            connection.on('AuditEvent', handleAuditEvent);

            // Join global group (admin panel — all admins see all events)
            connection.invoke('JoinGlobalGroup').catch(() => { });

            return () => {
                  connection.off('AuditEvent', handleAuditEvent);
                  connection.invoke('LeaveGlobalGroup').catch(() => { });
            };
      }, [connection, connectionState, handleAuditEvent]);

      return { connectionState, realtimeEventCount, lastEvent };
}
