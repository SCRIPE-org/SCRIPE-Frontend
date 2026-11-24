"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useServices } from "@core/providers/service-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { useOptionalTenantContext, type TenantInfo } from "@core/providers/tenant-context-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { TENANTS_ENDPOINTS } from "@core/config/api-endpoints/tenants.endpoints";
import { IDENTITY_ENDPOINTS } from "@core/config/api-endpoints/identity.endpoints";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { broadcastTenantContext } from "@core/services/api-factory";
import { clearAllDataExchangeCaches } from "@core/data-exchange/data/repositories/DataExchangeRepository";
import { useDataExchangeJobsStore } from "@core/data-exchange/presentation/store/useDataExchangeJobsStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { invalidateAuthorizationCaches, syncCurrentSessionAuthorization } from "@core/hooks/use-authorization-sync";
import { clearNavigationCaches } from "@modules/auth/core/data/utils/auth-storage-cleanup";
import { appLogger } from "@core/common/logger";

export type SwitchCandidateSource = "drill_down" | "membership";

export interface SwitchableTenantCandidate {
  id: string;
  name: string;
  nameEn?: string | null;
  nameAr?: string | null;
  code?: string | null;
  slug?: string | null;
  status?: string | null;
  hierarchyLevel?: number | null;
  parentId?: string | null;
  source: SwitchCandidateSource;
  effectiveRoleCode?: string | null;
}

interface RawSwitchableTenantDto {
  id?: string;
  tenantId?: string;
  name?: string;
  nameEn?: string | null;
  nameAr?: string | null;
  code?: string | null;
  slug?: string | null;
  status?: string | null;
  hierarchyLevel?: number | null;
  parentId?: string | null;
  isActive?: boolean | null;
  isSuspended?: boolean | null;
}

interface RawMembershipDto {
  id?: string;
  memberTenantId?: string;
  tenantId?: string;
  memberTenantName?: string | null;
  tenantName?: string | null;
  name?: string | null;
  nameEn?: string | null;
  nameAr?: string | null;
  memberTenantNameEn?: string | null;
  memberTenantNameAr?: string | null;
  memberTenantCode?: string | null;
  tenantCode?: string | null;
  code?: string | null;
  effectiveRoleCode?: string | null;
  grantedAt?: string | null;
  expiresAt?: string | null;
}

export interface UseTenantContextSwitcherOptions {
  /** Controls whether candidate lists are fetched eagerly (default: true). */
  enabled?: boolean;
}

export interface SwitchExecutionOptions {
  /** Override destination path after switch (defaults to current pathname+search, never "/tenants"). Pass null for in-memory only. */
  redirectTo?: string | null;
}

function extractArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (obj.data && typeof obj.data === "object") {
      const nested = obj.data as Record<string, unknown>;
      if (Array.isArray(nested.items)) return nested.items as T[];
    }
  }
  return [];
}

function getCurrentPathWithQuery(fallbackPathname: string): string {
  if (typeof window !== "undefined") {
    const path = window.location.pathname || fallbackPathname || "/";
    const search = window.location.search || "";
    return `${path}${search}`;
  }
  return fallbackPathname || "/";
}

function isHttpStatus(err: unknown, statuses: number[]): boolean {
  if (!err || typeof err !== "object") return false;
  const record = err as Record<string, unknown>;
  const status =
    (typeof record.status === "number" ? record.status : undefined) ??
    (typeof record.statusCode === "number" ? record.statusCode : undefined) ??
    (record.response && typeof record.response === "object"
      ? ((record.response as Record<string, unknown>).status as number | undefined)
      : undefined);
  return typeof status === "number" && statuses.includes(status);
}

/**
 * Shared hook unifying hierarchical tenant drill-down (`tenants.drill_down`)
 * and cross-tenant membership switching (`identity_context.switch`).
 *
 * Updates `sessionStorage`, `TenantContextProvider`, `ApiFactory.broadcastTenantContext`,
 * clears navigation/query caches, and re-navigates cleanly to the active route
 * without redirecting through `/tenants`.
 */
export function useTenantContextSwitcher(options?: UseTenantContextSwitcherOptions) {
  const { enabled = true } = options ?? {};
  const { apiService, authRepository } = useServices();
  const { hasPermission } = usePermissions();
  const tenantContext = useOptionalTenantContext();
  const { activeTenantId, activeTenantName, isImpersonating } = useAdminContext();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const userId = useAppStore((s) => s.user?.id ?? s.user?.username ?? "");
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const [isSwitching, setIsSwitching] = useState(false);
  const [switchingTenantId, setSwitchingTenantId] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const canDrillDown = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);
  const canSwitchMembership = hasPermission(SYSTEM_PERMISSIONS.IDENTITY_CONTEXT_SWITCH);
  const canSwitchContext = canDrillDown || canSwitchMembership;

  const queriesEnabled = Boolean(isAuthenticated && hasHydrated && enabled && canSwitchContext);

  const switchableQuery = useQuery<SwitchableTenantCandidate[]>({
    queryKey: ["tenant-context", "switchable", userId],
    enabled: queriesEnabled && canDrillDown,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const raw = await apiService.get<unknown>(TENANTS_ENDPOINTS.TENANTS.SWITCHABLE, {
          page: 1,
          pageSize: 50,
        });
        const items = extractArray<RawSwitchableTenantDto>(raw);
        return items
          .filter(
            (item): item is RawSwitchableTenantDto & { id: string } =>
              Boolean(item && (item.id || item.tenantId)) &&
              item.isActive !== false &&
              item.isSuspended !== true
          )
          .map((item) => {
            const id = (item.id ?? item.tenantId)!;
            const name = item.name || item.nameEn || item.nameAr || item.code || item.slug || id;
            return {
              id,
              name,
              nameEn: item.nameEn ?? item.name ?? null,
              nameAr: item.nameAr ?? null,
              code: item.code ?? null,
              slug: item.slug ?? null,
              status: item.status ?? null,
              hierarchyLevel: item.hierarchyLevel ?? null,
              parentId: item.parentId ?? null,
              source: "drill_down" as const,
            };
          });
      } catch (error) {
        if (isHttpStatus(error, [401, 403, 404])) {
          appLogger.debug("[useTenantContextSwitcher] Drill-down switchable tenants unavailable");
          return [];
        }
        throw error;
      }
    },
  });

  const membershipsQuery = useQuery<SwitchableTenantCandidate[]>({
    queryKey: ["tenant-context", "memberships", userId],
    enabled: queriesEnabled && canSwitchMembership,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        const raw = await apiService.get<unknown>(IDENTITY_ENDPOINTS.IDENTITY_CONTEXT.MEMBERSHIPS);
        const items = extractArray<RawMembershipDto>(raw);
        const now = Date.now();
        return items
          .filter((item) => {
            if (!item || !(item.memberTenantId || item.tenantId || item.id)) return false;
            if (item.expiresAt) {
              const expiresMs = Date.parse(item.expiresAt);
              if (!Number.isNaN(expiresMs) && expiresMs <= now) return false;
            }
            return true;
          })
          .map((item) => {
            const id = (item.memberTenantId ?? item.tenantId ?? item.id)!;
            const name =
              item.memberTenantName ||
              item.tenantName ||
              item.name ||
              item.memberTenantNameEn ||
              item.nameEn ||
              item.memberTenantCode ||
              item.tenantCode ||
              item.code ||
              id;
            return {
              id,
              name,
              nameEn: item.memberTenantNameEn ?? item.nameEn ?? item.memberTenantName ?? item.tenantName ?? null,
              nameAr: item.memberTenantNameAr ?? item.nameAr ?? null,
              code: item.memberTenantCode ?? item.tenantCode ?? item.code ?? null,
              effectiveRoleCode: item.effectiveRoleCode ?? null,
              source: "membership" as const,
            };
          });
      } catch (error) {
        if (isHttpStatus(error, [401, 403, 404])) {
          appLogger.debug("[useTenantContextSwitcher] Membership context targets unavailable");
          return [];
        }
        throw error;
      }
    },
  });

  const candidates = useMemo<SwitchableTenantCandidate[]>(() => {
    const merged = new Map<string, SwitchableTenantCandidate>();
    for (const item of switchableQuery.data ?? []) {
      merged.set(item.id, item);
    }
    for (const item of membershipsQuery.data ?? []) {
      if (!merged.has(item.id)) {
        merged.set(item.id, item);
      }
    }
    return Array.from(merged.values());
  }, [switchableQuery.data, membershipsQuery.data]);

  const isLoading =
    (canDrillDown && switchableQuery.isLoading) ||
    (canSwitchMembership && membershipsQuery.isLoading);

  const loadError = useMemo(() => {
    const firstError = switchableQuery.error ?? membershipsQuery.error;
    if (!firstError) return null;
    return firstError instanceof Error ? firstError.message : "Failed to load tenants";
  }, [switchableQuery.error, membershipsQuery.error]);

  const refetchCandidates = useCallback(async () => {
    await Promise.all([
      canDrillDown ? switchableQuery.refetch() : Promise.resolve(),
      canSwitchMembership ? membershipsQuery.refetch() : Promise.resolve(),
    ]);
  }, [canDrillDown, canSwitchMembership, switchableQuery, membershipsQuery]);

  const switchToTenant = useCallback(
    async (
      candidate: Pick<SwitchableTenantCandidate, "id" | "name"> &
        Partial<Pick<SwitchableTenantCandidate, "code" | "slug" | "parentId" | "source">>,
      switchOptions?: SwitchExecutionOptions
    ): Promise<boolean> => {
      if (!canSwitchContext) {
        return false;
      }

      const mode: SwitchCandidateSource =
        candidate.source ?? (canDrillDown ? "drill_down" : "membership");

      setIsSwitching(true);
      setSwitchingTenantId(candidate.id);
      setSwitchError(null);

      try {
        if (mode === "membership" || (!canDrillDown && canSwitchMembership)) {
          await apiService.post<void>(IDENTITY_ENDPOINTS.IDENTITY_CONTEXT.SWITCH, {
            targetTenantId: candidate.id,
          });
        }

        const redirectTo =
          switchOptions?.redirectTo !== undefined
            ? switchOptions.redirectTo
            : getCurrentPathWithQuery(pathname);

        const tenantInfo: TenantInfo = {
          id: candidate.id,
          name: candidate.name,
          code: candidate.code ?? undefined,
          slug: candidate.slug ?? undefined,
          parentId: candidate.parentId ?? undefined,
          switchMode: mode,
        };

        if (tenantContext) {
          tenantContext.enterTenantWorld(tenantInfo, { mode, redirectTo });
        } else {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(STORAGE_KEYS.tenant_context, JSON.stringify(tenantInfo));
          }
          apiService.setTenantContext(tenantInfo.id);
          broadcastTenantContext(tenantInfo.id);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(STORAGE_KEYS.lastAuthRefresh);
          }
          clearNavigationCaches();
          useNavigationStore.getState().reset();
          clearAllDataExchangeCaches();
          useDataExchangeJobsStore.getState().reset();
          invalidateAuthorizationCaches(queryClient, {
            tenantId: tenantInfo.id,
            purgeSensitiveCaches: true,
          });
          queryClient.invalidateQueries();
          if (
            switchOptions?.redirectTo === null &&
            typeof (authRepository as { getCurrentPrincipal?: unknown } | undefined)
              ?.getCurrentPrincipal === "function"
          ) {
            void syncCurrentSessionAuthorization({
              queryClient,
              authRepository: authRepository as { getCurrentPrincipal: () => Promise<any> },
              targetTenantId: tenantInfo.id,
              forcePrincipalFetch: true,
            });
          }
          if (redirectTo !== null && typeof window !== "undefined") {
            try {
              window.location.href = redirectTo;
            } catch {
              /* ignore jsdom navigation errors */
            }
          }
        }

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to switch tenant context";
        setSwitchError(message);
        appLogger.error("[useTenantContextSwitcher] Context switch failed:", error);
        return false;
      } finally {
        setIsSwitching(false);
        setSwitchingTenantId(null);
      }
    },
    [
      canSwitchContext,
      canDrillDown,
      canSwitchMembership,
      apiService,
      authRepository,
      pathname,
      tenantContext,
      queryClient,
    ]
  );

  const exitToPlatform = useCallback(
    (exitOptions?: SwitchExecutionOptions) => {
      const redirectTo =
        exitOptions?.redirectTo !== undefined
          ? exitOptions.redirectTo
          : getCurrentPathWithQuery(pathname);

      if (tenantContext) {
        tenantContext.exitTenantWorld({ redirectTo });
      } else {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(STORAGE_KEYS.tenant_context);
        }
        apiService.setTenantContext(null);
        broadcastTenantContext(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(STORAGE_KEYS.lastAuthRefresh);
        }
        clearNavigationCaches();
        useNavigationStore.getState().reset();
        clearAllDataExchangeCaches();
        useDataExchangeJobsStore.getState().reset();
        invalidateAuthorizationCaches(queryClient, {
          tenantId: null,
          purgeSensitiveCaches: true,
        });
        queryClient.invalidateQueries();
        if (
          exitOptions?.redirectTo === null &&
          typeof (authRepository as { getCurrentPrincipal?: unknown } | undefined)
            ?.getCurrentPrincipal === "function"
        ) {
          void syncCurrentSessionAuthorization({
            queryClient,
            authRepository: authRepository as { getCurrentPrincipal: () => Promise<any> },
            targetTenantId: null,
            forcePrincipalFetch: true,
          });
        }
        if (redirectTo !== null && typeof window !== "undefined") {
          try {
            window.location.href = redirectTo;
          } catch {
            /* ignore jsdom navigation errors */
          }
        }
      }
    },
    [pathname, tenantContext, apiService, authRepository, queryClient]
  );

  return {
    canDrillDown,
    canSwitchMembership,
    canSwitchContext,
    candidates,
    hasCandidates: candidates.length > 0,
    activeTenantId,
    activeTenantName,
    isInTenantWorld: Boolean(tenantContext?.isInTenantWorld ?? isImpersonating),
    isLoading,
    loadError,
    isSwitching,
    switchingTenantId,
    switchError,
    switchToTenant,
    exitToPlatform,
    refetchCandidates,
  };
}
