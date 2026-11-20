import type { QueryClient } from "@tanstack/react-query";
import { useSudoStore } from "@core/store/useSudoStore";
import { useAppStore } from "@core/store/useAppStore";

/** Minimal authentication repository contract required to complete client lockdown teardown. */
export interface LockdownLogoutTarget {
  logout: () => Promise<unknown>;
}

/**
 * Shared client teardown invoked after a backend-confirmed Emergency Lockdown
 * from either the Security Vault or Sessions Fleet ViewModels.
 */
export async function finalizeEmergencyLockdownCleanup(
  queryClient: QueryClient,
  authRepository: LockdownLogoutTarget,
  markLocked: () => void
): Promise<void> {
  markLocked();
  try {
    await authRepository.logout();
  } catch {
    // Emergency lockdown already revoked tokens server-side; continue client teardown
  }
  useSudoStore.getState().reset();
  useAppStore.getState().logout();
  queryClient.clear();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
