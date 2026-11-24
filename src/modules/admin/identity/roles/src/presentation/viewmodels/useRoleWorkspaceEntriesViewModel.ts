"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import type {
  LandingTargetCatalog,
  LandingTargetScopeMode,
} from "@core/navigation";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { identityContainer } from "@modules/identity/di";
import type { PermissionModuleGroup } from "@modules/identity/permissions";
import type { Role } from "../../domain/entities/Role";
import type { RoleWorkspaceEntryPolicy } from "../../domain/entities/RoleWorkspaceEntryPolicy";
import {
  findFirstAuthorizedTargetForWorkspace,
  getEligibleWorkspacesForRole,
  type DraftRoleWorkspaceEntryRule,
} from "../../domain/utils/role-workspace-eligibility";
import { useRoleLandingCatalogViewModel } from "./useRoleLandingCatalogViewModel";

/** Arguments passed from `useRoleDetailViewModel` into the workspace start-page policy VM. */
export interface UseRoleWorkspaceEntriesArgs {
  roleId: string;
  role: Role | undefined;
  roleLoading: boolean;
  moduleGroups: PermissionModuleGroup[];
  selectedPermissionCodes: Set<string>;
}

/**
 * Manages lazy catalog hydration, sparse workspace start-page drafts, and save state
 * for `/roles/[id]` without bloating `useRoleDetailViewModel`.
 */
export function useRoleWorkspaceEntriesViewModel({
  roleId,
  role,
  roleLoading,
  moduleGroups,
  selectedPermissionCodes,
}: UseRoleWorkspaceEntriesArgs) {
  const queryClient = useQueryClient();
  const { roleRepository } = identityContainer;
  const storeContextKey = useNavigationStore((s) => s.contextKey);

  const [draftRules, setDraftRules] = useState<DraftRoleWorkspaceEntryRule[]>(
    [],
  );
  const [isEntriesDirty, setIsEntriesDirty] = useState(false);
  const [initializedForRoleId, setInitializedForRoleId] = useState<
    string | null
  >(null);

  const roleTenantId = role?.tenantId ?? "";
  const isSystemRole = Boolean(role?.isSystem);
  const roleRowVersion = role?.rowVersion ?? null;
  const scopeMode: LandingTargetScopeMode = roleTenantId
    ? "tenant_role"
    : "platform_role";
  const resolvedContextKey =
    storeContextKey || (roleTenantId ? `tenant:${roleTenantId}` : "platform");

  const { catalog, isLoading: isCatalogLoading } =
    useRoleLandingCatalogViewModel(
      scopeMode,
      resolvedContextKey,
      Boolean(roleId) && !roleLoading,
    );

  const { data: persistedPolicies, isLoading: entriesLoading } = useQuery<
    RoleWorkspaceEntryPolicy[]
  >({
    queryKey: qk.roles.workspaceEntries(roleId),
    queryFn: () => roleRepository.getRoleWorkspaceEntries(roleId),
    enabled: Boolean(roleId),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    if (!roleId || entriesLoading || initializedForRoleId === roleId) return;
    if (!persistedPolicies) return;

    const initialDrafts: DraftRoleWorkspaceEntryRule[] = persistedPolicies.map(
      (policy) => ({
        workspaceKey: policy.workspaceKey,
        target: policy.target,
        isEnforced: policy.isEnforced,
        persistedIsStale: policy.isStale,
      }),
    );

    queueMicrotask(() => {
      setDraftRules(initialDrafts);
      setIsEntriesDirty(false);
      setInitializedForRoleId(roleId);
    });
  }, [roleId, entriesLoading, initializedForRoleId, persistedPolicies]);

  const eligibleWorkspaces = getEligibleWorkspacesForRole(
    catalog,
    selectedPermissionCodes,
    scopeMode,
    moduleGroups,
  );

  const usedWorkspaceKeys = new Set(
    draftRules.map((rule) => rule.workspaceKey.toLowerCase()),
  );
  const availableWorkspacesForNewRule = eligibleWorkspaces.filter(
    (ws) => !usedWorkspaceKeys.has(ws.workspaceKey.trim().toLowerCase()),
  );

  const addRule = useCallback(() => {
    if (isSystemRole || availableWorkspacesForNewRule.length === 0) return;
    const firstWs = availableWorkspacesForNewRule[0];
    const wsKey = firstWs.workspaceKey.trim().toLowerCase();
    const defaultTarget = findFirstAuthorizedTargetForWorkspace(
      wsKey,
      catalog,
      selectedPermissionCodes,
      scopeMode,
    );

    setDraftRules((prev) => [
      ...prev,
      {
        workspaceKey: wsKey,
        target: defaultTarget,
        isEnforced: false,
        persistedIsStale: false,
      },
    ]);
    setIsEntriesDirty(true);
  }, [
    isSystemRole,
    availableWorkspacesForNewRule,
    catalog,
    selectedPermissionCodes,
    scopeMode,
  ]);

  const updateRuleWorkspace = useCallback(
    (index: number, nextWorkspaceKey: string) => {
      if (isSystemRole) return;
      const normalizedWs = nextWorkspaceKey.trim().toLowerCase();
      const nextDefaultTarget = findFirstAuthorizedTargetForWorkspace(
        normalizedWs,
        catalog,
        selectedPermissionCodes,
        scopeMode,
      );

      setDraftRules((prev) =>
        prev.map((rule, idx) =>
          idx === index
            ? {
                ...rule,
                workspaceKey: normalizedWs,
                target: nextDefaultTarget,
                persistedIsStale: false,
              }
            : rule,
        ),
      );
      setIsEntriesDirty(true);
    },
    [isSystemRole, catalog, selectedPermissionCodes, scopeMode],
  );

  const updateRuleTarget = useCallback(
    (index: number, nextTarget: string) => {
      if (isSystemRole) return;
      setDraftRules((prev) =>
        prev.map((rule, idx) =>
          idx === index
            ? { ...rule, target: nextTarget, persistedIsStale: false }
            : rule,
        ),
      );
      setIsEntriesDirty(true);
    },
    [isSystemRole],
  );

  const toggleRuleEnforced = useCallback(
    (index: number, nextEnforced: boolean) => {
      if (isSystemRole) return;
      setDraftRules((prev) =>
        prev.map((rule, idx) =>
          idx === index ? { ...rule, isEnforced: nextEnforced } : rule,
        ),
      );
      setIsEntriesDirty(true);
    },
    [isSystemRole],
  );

  const removeRule = useCallback(
    (index: number) => {
      if (isSystemRole) return;
      setDraftRules((prev) => prev.filter((_, idx) => idx !== index));
      setIsEntriesDirty(true);
    },
    [isSystemRole],
  );

  const hasIncompleteDraftRule = draftRules.some(
    (rule) =>
      !rule.workspaceKey.trim() ||
      !rule.target.trim().toLowerCase().startsWith("menu:"),
  );

  const saveWorkspaceEntries = useCallback(
    async (rowVersionOverride?: string | null) => {
      if (!roleId || !isEntriesDirty || isSystemRole) return;
      const effectiveRowVersion =
        rowVersionOverride !== undefined ? rowVersionOverride : roleRowVersion;
      const saved = await roleRepository.upsertRoleWorkspaceEntries(
        roleId,
        draftRules.map((rule) => ({
          workspaceKey: rule.workspaceKey,
          target: rule.target,
          isEnforced: rule.isEnforced,
        })),
        effectiveRowVersion
      );
    setDraftRules(
      saved.map((policy) => ({
        workspaceKey: policy.workspaceKey,
        target: policy.target,
        isEnforced: policy.isEnforced,
        persistedIsStale: policy.isStale,
      })),
    );
    setIsEntriesDirty(false);
    await queryClient.invalidateQueries({
      queryKey: qk.roles.workspaceEntries(roleId),
    });
    await queryClient.invalidateQueries({ queryKey: qk.navigation.all });
  }, [
    roleId,
    isEntriesDirty,
    isSystemRole,
    roleRepository,
    draftRules,
    roleRowVersion,
    queryClient,
  ]);

  return {
    rules: draftRules,
    persistedPolicies: persistedPolicies ?? [],
    eligibleWorkspaces,
    availableWorkspacesForNewRule,
    catalog: catalog as LandingTargetCatalog | null | undefined,
    scopeMode,
    selectedPermissionCodes,
    isSystemRole,
    isLoading: entriesLoading || isCatalogLoading,
    isEntriesDirty,
    hasIncompleteDraftRule,
    addRule,
    updateRuleWorkspace,
    updateRuleTarget,
    toggleRuleEnforced,
    removeRule,
    saveWorkspaceEntries,
  };
}
