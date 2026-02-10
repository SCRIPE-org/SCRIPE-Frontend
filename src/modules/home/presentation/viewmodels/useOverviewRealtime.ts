'use client';

/**
 * useOverviewRealtime — Lightweight SignalR consumer for the Overview page.
 *
 * Shares the same connection as audit/dashboard (via SignalRProvider).
 * Invalidates overview query keys on any audit event so KPI cards
 * and recent activity refresh automatically.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '@core/hooks/useSignalR';
import { HUB_EVENTS, HUB_METHODS } from '@core/common/constants/signalr';

export function useOverviewRealtime() {
      const queryClient = useQueryClient();
      const { connection, connectionState } = useSignalR();
      const debounceRef = useRef(false);

      const handleAuditEvent = useCallback(() => {
            // Debounce: max 1 invalidation per 5 seconds
            if (debounceRef.current) return;
            debounceRef.current = true;
            queryClient.invalidateQueries({ queryKey: ['overview'] });
            setTimeout(() => { debounceRef.current = false; }, 5000);
      }, [queryClient]);

      useEffect(() => {
            if (!connection || connectionState !== 'connected') return;

            connection.on(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
            connection.invoke(HUB_METHODS.JOIN_GLOBAL_GROUP).catch(() => { });

            return () => {
                  connection.off(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
                  connection.invoke(HUB_METHODS.LEAVE_GLOBAL_GROUP).catch(() => { });
            };
      }, [connection, connectionState, handleAuditEvent]);

      return { connectionState };
}
