"use client";

import { useCallback, useState } from "react";
import { getAuthContainer } from "@modules/auth/di";
import type { WorkspaceInfo } from "@modules/auth/core/domain/entities/WorkspaceInfo";

/**
 * Exported type in the auth/signin module.
 */
export type { WorkspaceInfo };

/**
 * React hook/ViewModel managing logic, state, and repository queries for workspace discovery.
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
      const data = await getAuthContainer().authRepository.discoverWorkspaces(email);
      setWorkspaces(data.workspaces);
      setHasPlatformAccess(data.hasPlatformAccess);
      return data.workspaces;
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
