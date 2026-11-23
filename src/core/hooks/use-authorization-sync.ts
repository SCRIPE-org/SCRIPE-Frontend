/**
 * Authorization & Session Sync Utilities
 *
 * Centralizes TanStack Query cache invalidation and session principal + navigation
 * synchronization across RBAC mutations (roles, role permissions, admin roles,
 * user group restrictions/roles/members), entitlement mutations (features,
 * overrides, editions, subscriptions), and periodic/context refreshes.
 */
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { appLogger } from "@core/common/logger";
import type { User } from "@modules/auth/core/domain/entities/User";

export interface AuthorizationInvalidationOptions {
  /** Target tenant affected by the mutation, if tenant-scoped. */
  tenantId?: string | null;
  /** Whether to remove cached entitlements/navigation queries rather than just marking stale. */
  purgeSensitiveCaches?: boolean;
}

/**
 * Clears/invalidates all client caches that encode navigation, tenant feature entitlements,
 * user subscription features, permission catalogs, or account security context.
 */
export function invalidateAuthorizationCaches(
  queryClient: QueryClient | null | undefined,
  options?: AuthorizationInvalidationOptions
): void {
  if (!queryClient) return;

  const tenantId = options?.tenantId;
  const purge = Boolean(options?.purgeSensitiveCaches);

  const keys: unknown[][] = [
    ["navigation"],
    ["tenant-entitlements"],
    ["user-subscription", "me"],
    ["permissions"],
    ["account", "context"],
    ["account", "dossier"],
    ["tenant-subscriptions"],
  ];

  if (tenantId) {
    keys.push(["tenant-entitlements", tenantId]);
    keys.push(["tenant-subscriptions", tenantId]);
    keys.push(["tenant", tenantId]);
  }

  for (const queryKey of keys) {
    if (purge) {
      queryClient.removeQueries({ queryKey });
    } else {
      void queryClient.invalidateQueries({ queryKey });
    }
  }
}

/** Minimal auth repository contract required for live principal refresh. */
export interface PrincipalRefreshRepository {
  getCurrentPrincipal: () => Promise<User>;
}

/**
 * Applies a freshly fetched principal to Zustand auth state while safely preserving
 * strict deny-by-default semantics (empty arrays overwrite revoked privileges).
 *
 * @returns `true` if effective permissions, roles, tenant, or restricted fields changed.
 */
export function applyRefreshedPrincipal(user: User): boolean {
  if (!user || !user.id) {
    return false;
  }

  const prev = useAppStore.getState();
  const resolvedRoles = Array.isArray(user.roles) ? user.roles : prev.roles;
  const resolvedPermissions = Array.isArray(user.permissions)
    ? (user.permissions as typeof prev.permissions)
    : prev.permissions;

  const permissionsChanged =
    JSON.stringify(prev.permissions ?? []) !== JSON.stringify(resolvedPermissions ?? []);
  const rolesChanged = JSON.stringify(prev.roles ?? []) !== JSON.stringify(resolvedRoles ?? []);
  const restrictedFieldsChanged =
    JSON.stringify(prev.restrictedFields ?? {}) !== JSON.stringify(user.restrictedFields ?? {});
  const tenantChanged = (prev.user?.tenantId ?? null) !== (user.tenantId ?? null);

  prev.setAuth(user, resolvedPermissions, resolvedRoles);

  return permissionsChanged || rolesChanged || restrictedFieldsChanged || tenantChanged;
}

/**
 * Checks whether an API error represents an expired or revoked authorization session (401/403).
 */
export function isAuthRevocationError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; statusCode?: unknown; response?: { status?: unknown } };
  const status = candidate.status ?? candidate.statusCode ?? candidate.response?.status;
  return status === 401 || status === 403;
}

/**
 * Refreshes the current user's principal, authorization caches, and workspace navigation
 * immediately after a permission, role, group, feature, or subscription mutation.
 */
export async function syncCurrentSessionAuthorization(params: {
  queryClient?: QueryClient | null;
  authRepository?: PrincipalRefreshRepository | null;
  refreshNavigation?: (() => void) | null;
  targetTenantId?: string | null;
  skipPrincipalFetch?: boolean;
}): Promise<void> {
  const { queryClient, authRepository, refreshNavigation, targetTenantId, skipPrincipalFetch } = params;

  invalidateAuthorizationCaches(queryClient, { tenantId: targetTenantId });

  const state = useAppStore.getState();
  const activeTenantId = state.user?.tenantId ?? null;
  const affectsActiveTenant =
    !targetTenantId || !activeTenantId || targetTenantId === activeTenantId;

  if (!skipPrincipalFetch && affectsActiveTenant && state.isAuthenticated && authRepository) {
    try {
      const freshPrincipal = await authRepository.getCurrentPrincipal();
      if (freshPrincipal && freshPrincipal.id) {
        applyRefreshedPrincipal(freshPrincipal);
      }
    } catch (error) {
      if (isAuthRevocationError(error)) {
        useAppStore.getState().logout();
        useNavigationStore.getState().reset();
        queryClient?.clear();
        return;
      }
      appLogger.debug("[AuthorizationSync] Non-fatal principal refresh skipped:", error);
    }
  }

  refreshNavigation?.();
}
