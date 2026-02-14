"use client";

/**
 * useDashboardRealtime — Lightweight SignalR consumer for the dashboard.
 *
 * Shares the same connection as useAuditRealtime (via SignalRProvider).
 * Only invalidates dashboard query keys — no toasts, no counters.
 */

import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSignalR } from "@core/hooks/useSignalR";
import { HUB_EVENTS, HUB_METHODS } from "@core/common/constants/signalr";

export function useDashboardRealtime() {
  const queryClient = useQueryClient();
  const { connection, connectionState } = useSignalR();

  const handleAuditEvent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }, [queryClient]);

  useEffect(() => {
    if (!connection || connectionState !== "connected") return;

    connection.on(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
    connection.invoke(HUB_METHODS.JOIN_GLOBAL_GROUP).catch(() => {});

    return () => {
      connection.off(HUB_EVENTS.AUDIT_EVENT, handleAuditEvent);
      connection.invoke(HUB_METHODS.LEAVE_GLOBAL_GROUP).catch(() => {});
    };
  }, [connection, connectionState, handleAuditEvent]);

  return { connectionState };
}
