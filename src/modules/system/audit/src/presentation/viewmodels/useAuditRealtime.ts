'use client';

/**
 * useAuditRealtime — SignalR hook for live audit event updates.
 *
 * Listens for "AuditEvent" messages from the backend AuditHub.
 * On each event, invalidates TanStack Query caches so the UI
 * auto-refreshes without manual polling.
 *
 * All authenticated admin users join the "global" group to receive
 * every audit event. Tenant-scoped groups can be added when the
 * User entity gains a tenantId field.
 */

import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR, type SignalRConnectionState } from '@core/hooks/useSignalR';
import { useAppStore } from '@core/store/useAppStore';
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

export function useAuditRealtime(): UseAuditRealtimeResult {
      const queryClient = useQueryClient();
      const isAuthenticated = useAppStore((s) => s.isAuthenticated);
      const { connection, connectionState } = useSignalR({
            hubPath: '/hubs/audit',
            enabled: isAuthenticated,
      });

      const [realtimeEventCount, setRealtimeEventCount] = useState(0);
      const [lastEvent, setLastEvent] = useState<AuditEventMessage | null>(null);

      // Handle incoming audit events
      const handleAuditEvent = useCallback(
            (event: AuditEventMessage) => {
                  setRealtimeEventCount((c) => c + 1);
                  setLastEvent(event);

                  // Invalidate audit list query cache (triggers refetch)
                  queryClient.invalidateQueries({ queryKey: auditKeys.all });

                  // Also invalidate dashboard queries so KPIs/charts refresh
                  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            },
            [queryClient]
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
