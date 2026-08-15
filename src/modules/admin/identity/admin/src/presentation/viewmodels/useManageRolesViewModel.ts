"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import { resolveBilingualLabel } from "@core/common/utils";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import type { SyncRoleAssignment } from "../../domain/interfaces/IAdminRepository";

interface UseManageRolesViewModelProps {
  adminId?: string;
  scopeTenantId: string;
  open: boolean;
}

// Stable empty-array reference. `useQuery`'s `data` is `undefined` whenever the
// query is disabled (the common case — most admins have no roles outside the
// first fetched page, so `missingRoleCodes` stays empty and this query never
// runs). A `= []` default in the destructuring below would mint a NEW array
// every render, and ManageRolesDialog's render-phase state sync compares this
// value by reference (`resolvedExtraRoles !== prevResolvedExtraRoles`) — a
// fresh reference every render makes that comparison never settle, which is
// an infinite render loop ("Too many re-renders").
const EMPTY_RESOLVED_ROLES: never[] = [];

/**
 * React hook/ViewModel orchestrating state and data flows for manage roles view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useManageRolesViewModel({
  adminId,
  scopeTenantId,
  open,
}: UseManageRolesViewModelProps) {
  const { t, language } = useI18n();
  const toast = useEnhancedToast();
  const queryClient = useQueryClient();
  const { roleRepository, adminRepository } = identityContainer;

  const mapRoleOption = (role: {
    id: string;
    nameEn: string;
    nameAr: string;
    descriptionEn?: string;
    descriptionAr?: string;
  }): GenericSelectOption => ({
    value: role.id,
    label: resolveBilingualLabel(role.nameEn, role.nameAr, language),
    description: resolveBilingualLabel(role.descriptionEn ?? "", role.descriptionAr ?? "", language),
  });

  // Fetch available roles (first page — default browse list before the admin
  // types a search query)
  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles-for-manage", scopeTenantId],
    queryFn: () =>
      scopeTenantId
        ? roleRepository.getAll({
            page: 1,
            pageSize: 100,
            tenantId: scopeTenantId,
            strict: true,
          })
        : roleRepository.getMyTenantRoles({
            page: 1,
            pageSize: 100,
          }),
    enabled: open && !!adminId,
  });

  // Fetch current roles
  const { data: currentRoles, isLoading: isLoadingCurrentRoles } = useQuery({
    queryKey: ["admin-roles", adminId],
    queryFn: async () => {
      if (!adminId) return [];
      return adminRepository.getRoles(adminId);
    },
    enabled: open && !!adminId,
  });

  // ── F-68 fix ────────────────────────────────────────────────────────────
  // Roles are matched by CODE (see ManageRolesDialog header comment — the
  // admin-roles endpoint's roleId doesn't line up with Role.id), against
  // whatever page of roles happened to be fetched above. For a tenant with
  // more than 100 roles, an admin's currently-assigned role can sit outside
  // that page: it goes both invisible in the picker AND silently dropped by
  // the "nuke & pave" syncRoles call on Save, because it was never in
  // `selectedRoleIds` to begin with.
  //
  // Resolve those specific codes individually (cheap — there are normally
  // zero or a handful) so they can be shown with a real label and folded
  // back into the sync payload, instead of just vanishing.
  const scopedCurrentRoles = useMemo(
    () => (currentRoles ?? []).filter((r) => (r.tenantId || "") === scopeTenantId),
    [currentRoles, scopeTenantId]
  );
  const missingRoleCodes = useMemo(() => {
    const fetchedCodes = new Set((rolesData?.items ?? []).map((r) => r.code));
    return Array.from(
      new Set(
        scopedCurrentRoles.filter((r) => !fetchedCodes.has(r.roleCode)).map((r) => r.roleCode)
      )
    );
  }, [scopedCurrentRoles, rolesData]);

  const { data: resolvedExtraRoles = EMPTY_RESOLVED_ROLES, isLoading: isResolvingExtraRoles } = useQuery({
    queryKey: ["roles-for-manage-resolve", scopeTenantId, missingRoleCodes],
    queryFn: async () => {
      const found = await Promise.all(
        missingRoleCodes.map(async (code) => {
          const page = scopeTenantId
            ? await roleRepository.getAll({
                page: 1,
                pageSize: 5,
                tenantId: scopeTenantId,
                search: code,
                strict: true,
              })
            : await roleRepository.getMyTenantRoles({ page: 1, pageSize: 5, search: code });
          return page.items.find((r) => r.code === code) ?? null;
        })
      );
      return found.filter((r): r is NonNullable<typeof r> => !!r);
    },
    enabled: open && !!adminId && missingRoleCodes.length > 0,
  });

  // Sync roles mutation
  const syncMutation = useMutation({
    mutationFn: async ({
      selectedRoleIds,
      inheritToChildren,
    }: {
      selectedRoleIds: string[];
      inheritToChildren: boolean;
    }) => {
      if (!adminId) throw new Error("No admin selected");

      const assignments: SyncRoleAssignment[] = selectedRoleIds.map((roleId) => ({
        roleId,
        tenantId: scopeTenantId || undefined,
        inheritToChildren: scopeTenantId ? inheritToChildren : undefined,
      }));

      await adminRepository.syncRoles(adminId, assignments, scopeTenantId || undefined);
    },
  });

  return {
    t,
    language,
    rolesData,
    currentRoles,
    // Currently-assigned roles resolved by code because they fell outside the
    // first fetched page — merge into both the picker's options and the
    // initial selection so Save can't silently drop them (F-68).
    resolvedExtraRoles,
    mapRoleOption,
    isLoading: isLoadingRoles || isLoadingCurrentRoles || isResolvingExtraRoles,
    // Real server-side search so the picker can find (and the admin can
    // deliberately keep or remove) any role, not just the first 100.
    searchRoles: async (query: string): Promise<GenericSelectOption[]> => {
      try {
        const page = scopeTenantId
          ? await roleRepository.getAll({
              page: 1,
              pageSize: 50,
              tenantId: scopeTenantId,
              search: query,
              strict: true,
            })
          : await roleRepository.getMyTenantRoles({ page: 1, pageSize: 50, search: query });
        return page.items.map(mapRoleOption);
      } catch {
        return [];
      }
    },
    syncRoles: async (
      selectedRoleIds: string[],
      inheritToChildren: boolean,
      onOpenChange: (open: boolean) => void
    ) => {
      try {
        await syncMutation.mutateAsync({ selectedRoleIds, inheritToChildren });
        toast.success({ title: t("admin.role.syncSuccess") });
        queryClient.invalidateQueries({ queryKey: ["admin-roles", adminId] });
        queryClient.invalidateQueries({ queryKey: ["admins"] });
        onOpenChange(false);
      } catch (error: any) {
        toast.error({ title: error?.message || t("common.error") });
      }
    },
    isSubmitting: syncMutation.isPending,
  };
}
