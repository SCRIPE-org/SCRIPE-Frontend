"use client";

import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolveBilingualLabel } from "@core/common/utils";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { usePermissions } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";

interface CurrentGroupRoleRef {
  roleId: string;
  code: string;
}

interface UseSetRolesViewModelProps {
  tenantId?: string;
  open: boolean;
  currentRoles?: ReadonlyArray<CurrentGroupRoleRef>;
}

const EMPTY_RESOLVED_ROLES: never[] = [];

/**
 * React hook/ViewModel orchestrating state and data flows for set roles view model.
 * Manages TanStack Query hooks, platform/tenant role scoping, >100 role resolution, and server search.
 */
export function useSetRolesViewModel({
  tenantId,
  open,
  currentRoles,
}: UseSetRolesViewModelProps) {
  const { t, language } = useI18n();
  const { user, isPlatformSuperAdmin } = usePermissions();
  const userTenantId = user?.tenantId ?? null;
  const usePlatformScope = !tenantId && (isPlatformSuperAdmin || !userTenantId);

  const fetchRolePage = useCallback(
    ({ pageSize, search }: { pageSize: number; search?: string }) => {
      if (tenantId) {
        return identityContainer.roleRepository.getAll({
          page: 1,
          pageSize,
          search,
          tenantId,
          strict: true,
        });
      }
      // Platform groups (no tenantId) route through getAll(strict: true) for platform principals
      // rather than getCurrentTenantRoles; tenant-scoped users still fall back to current tenant.
      if (usePlatformScope) {
        return identityContainer.roleRepository.getAll({
          page: 1,
          pageSize,
          search,
          strict: true,
        });
      }
      return identityContainer.roleRepository.getCurrentTenantRoles({
        page: 1,
        pageSize,
        search,
      });
    },
    [tenantId, usePlatformScope]
  );

  // Fetch initial page of available roles
  const scopeCacheKey = tenantId ?? (usePlatformScope ? "platform" : "current-tenant");
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles-for-group-assign", scopeCacheKey],
    queryFn: () => fetchRolePage({ pageSize: 100 }),
    enabled: open,
  });

  // Resolve any assigned group roles sitting past page 1 so nuke-and-pave SetRoles preserves them
  const missingRoleCodes = useMemo(() => {
    if (!rolesData?.items || !currentRoles?.length) return [];
    const fetchedCodes = new Set(rolesData.items.map((r) => r.code));
    return Array.from(new Set(currentRoles.filter((r) => !fetchedCodes.has(r.code)).map((r) => r.code)));
  }, [rolesData, currentRoles]);

  const { data: resolvedExtraRoles = EMPTY_RESOLVED_ROLES, isLoading: isResolvingExtraRoles } =
    useQuery({
      queryKey: ["roles-for-group-assign-resolve", scopeCacheKey, missingRoleCodes],
      queryFn: async () => {
        const found = await Promise.all(
          missingRoleCodes.map(async (code) => {
            const page = await fetchRolePage({ pageSize: 10, search: code });
            return page.items.find((r) => r.code === code) ?? null;
          })
        );
        return found.filter((r): r is NonNullable<typeof r> => Boolean(r));
      },
      enabled: open && missingRoleCodes.length > 0,
    });

  const sortedRolesData = useMemo(() => {
    if (!rolesData) return rolesData;
    const byId = new Map<string, (typeof rolesData.items)[number]>();
    for (const role of rolesData.items ?? []) {
      byId.set(role.id, role);
    }
    for (const role of resolvedExtraRoles) {
      if (!byId.has(role.id)) {
        byId.set(role.id, role);
      }
    }
    const sortedItems = Array.from(byId.values()).sort((a, b) => {
      const priorityDiff =
        (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER);
      if (priorityDiff !== 0) return priorityDiff;
      const labelA = resolveBilingualLabel(a.nameEn, a.nameAr, language);
      const labelB = resolveBilingualLabel(b.nameEn, b.nameAr, language);
      return labelA.localeCompare(labelB) || a.code.localeCompare(b.code);
    });
    return {
      ...rolesData,
      items: sortedItems,
    };
  }, [rolesData, resolvedExtraRoles, language]);

  const searchRoles = useCallback(
    async (query: string): Promise<GenericSelectOption[]> => {
      const trimmed = query.trim();
      const sourceItems = trimmed
        ? (await fetchRolePage({ pageSize: 50, search: trimmed })).items ?? []
        : sortedRolesData?.items ?? [];
      return sourceItems.map((role) => ({
        value: role.id,
        label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
        description: role.code,
      }));
    },
    [fetchRolePage, sortedRolesData, language]
  );

  return {
    t,
    language,
    rolesData: sortedRolesData,
    isLoading: isLoading || (missingRoleCodes.length > 0 && isResolvingExtraRoles),
    searchRoles,
  };
}
