'use client';

/**
 * useDashboardRealtime — Lightweight SignalR consumer for the dashboard.
 *
 * Shares the same connection as useAuditRealtime (via SignalRProvider).
 * Only invalidates dashboard query keys — no toasts, no counters.
 *
 * This hook is intentionally thin. It just bridges "AuditEvent"
 * to queryClient.invalidateQueries(['dashboard']).
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '@core/hooks/useSignalR';

export function useDashboardRealtime() {
      const queryClient = useQueryClient();
      const { connection, connectionState } = useSignalR();

      const handleAuditEvent = useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }, [queryClient]);

      useEffect(() => {
            if (!connection || connectionState !== 'connected') return;

            connection.on('AuditEvent', handleAuditEvent);
            connection.invoke('JoinGlobalGroup').catch(() => { });

            return () => {
                  connection.off('AuditEvent', handleAuditEvent);
                  connection.invoke('LeaveGlobalGroup').catch(() => { });
            };
      }, [connection, connectionState, handleAuditEvent]);

      return { connectionState };
}
