"use client";

import { useState, useCallback } from "react";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
// ARCH-EXCEPTION: pre-auth hook — cannot use DI container (no auth context yet).
// Uses getModuleApiService directly for CSRF/replay headers on a public endpoint.
import { getModuleApiService } from "@core/services/api-factory";

// ── Inline DTOs (raw backend shape) ────────────────────────────────────────
interface WorkspaceInfoDto {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
}

interface DiscoverWorkspacesResponseDto {
  workspaces: WorkspaceInfoDto[];
  hasPlatformAccess: boolean;
}

/**
 * Workspace info for display — domain-level type used in the presentation layer.
 */
export interface WorkspaceInfo {
  tenantCode: string;
  tenantName: string;
  logoUrl: string | null;
  isPlatformAdmin: boolean;
  isActivated: boolean;
  /** Pre-built login URL for this workspace */
  loginUrl: string;
}

/**
 * Hook to discover all admin workspaces for a given email.
 *
 * Uses the /auth/admin/discover-workspaces endpoint (public, no auth needed).
 * Always returns 200 to prevent email enumeration — empty list = not found.
 *
 * Usage:
 *   const { discover, workspaces, isLoading } = useWorkspaceDiscovery();
 *   await discover("user@example.com");
 */
export function useWorkspaceDiscovery() {
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [hasPlatformAccess, setHasPlatformAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const discover = useCallback(async (email: string): Promise<WorkspaceInfo[]> => {
    if (!email.trim()) return [];

    setIsLoading(true);
    setHasSearched(false);

    try {
      // ARCH-EXCEPTION: pre-auth hook — getModuleApiService used directly (no DI container).
      const api = getModuleApiService("IDENTITY");
      const data = await api.postPublic<DiscoverWorkspacesResponseDto>(
        API_ENDPOINTS.AUTH.DISCOVER_WORKSPACES,
        { email: email.trim() }
      );

      const mapped: WorkspaceInfo[] = (data.workspaces ?? []).map(
        (w: WorkspaceInfoDto) => ({
          tenantCode: w.tenantCode,
          tenantName: w.tenantName,
          logoUrl: w.logoUrl,
          isPlatformAdmin: w.isPlatformAdmin,
          isActivated: w.isActivated,
          // Platform admin → /login, tenant admin → /login?_tenant=code
          loginUrl: w.isPlatformAdmin
            ? "/login"
            : `/login?_tenant=${encodeURIComponent(w.tenantCode)}`,
        })
      );

      setWorkspaces(mapped);
      setHasPlatformAccess(data.hasPlatformAccess ?? false);
      return mapped;
    } catch {
      setWorkspaces([]);
      setHasPlatformAccess(false);
      return [];
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  const reset = useCallback(() => {
    setWorkspaces([]);
    setHasPlatformAccess(false);
    setHasSearched(false);
  }, []);

  return {
    discover,
    reset,
    workspaces,
    hasPlatformAccess,
    isLoading,
    hasSearched,
    hasWorkspaces: workspaces.length > 0,
  };
}
