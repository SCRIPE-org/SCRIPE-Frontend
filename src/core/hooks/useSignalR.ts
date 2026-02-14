"use client";

/**
 * useSignalR — Convenience hook to access the shared SignalR connection.
 *
 * Simply re-exports the provider context. All connection lifecycle
 * is managed by `SignalRProvider` in `@core/providers/signalr-provider`.
 *
 * Usage:
 * ```ts
 * const { connection, connectionState } = useSignalR();
 * ```
 */

export { useSignalRContext as useSignalR } from "@core/providers/signalr-provider";
export type { SignalRConnectionState } from "@core/providers/signalr-provider";
