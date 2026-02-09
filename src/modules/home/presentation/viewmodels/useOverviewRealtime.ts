'use client';

/**
 * useOverviewRealtime — Lightweight SignalR consumer for the Overview page.
 *
 * Shares the same connection as audit/dashboard (via SignalRProvider).
 * Invalidates overview query keys on any audit event so KPI cards
 * and recent activity refresh automatically.
 */

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '@core/hooks/useSignalR';

export function useOverviewRealtime() {
      const queryClient = useQueryClient();
      const { connection, connectionState } = useSignalR();

      const handleAuditEvent = useCallback(() => {
            queryClient.invalidateQueries({ queryKey: ['overview'] });
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
