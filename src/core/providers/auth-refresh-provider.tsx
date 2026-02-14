/**
 * Auth Refresh Provider
 *
 * A lightweight provider component that enables automatic refresh of
 * user authentication data (permissions, roles) in the background.
 *
 * This ensures that if permissions are changed on the backend,
 * the frontend will eventually sync without requiring a logout/login.
 */

"use client";

import React from "react";
import { useAuthRefresh } from "@core/hooks/use-auth-refresh";

interface AuthRefreshProviderProps {
  children: React.ReactNode;
  /**
   * Refresh interval in milliseconds.
   * Default: 5 minutes (300000ms)
   */
  intervalMs?: number;
  /**
   * Whether to enable auto-refresh.
   * Default: true
   */
  enabled?: boolean;
}

/**
 * AuthRefreshProvider
 *
 * Place this component inside your app providers to enable automatic
 * background refresh of user permissions and roles.
 *
 * @example
 * <AuthRefreshProvider intervalMs={5 * 60 * 1000}>
 *   {children}
 * </AuthRefreshProvider>
 */
export function AuthRefreshProvider({
  children,
  intervalMs = 1000 * 60 * 5, // 5 minutes
  enabled = true,
}: AuthRefreshProviderProps) {
  // This hook handles all the refresh logic
  useAuthRefresh({ intervalMs, enabled });

  // Just render children - this is a "behavior" provider, not a context provider
  return <>{children}</>;
}
