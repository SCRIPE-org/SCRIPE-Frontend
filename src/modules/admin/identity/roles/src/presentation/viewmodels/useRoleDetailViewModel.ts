/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-expressions */
// FILE-EXCEPTION: file length
/**
 * Role Detail ViewModel
 *
 * Handles all business logic for the Role Detail page.
 * SOLID: All state, queries, mutations, and handlers live here.
 * View is pure UI (~60 lines).
 *
 * NOTE: Permission grouping is done 100% by the backend.
 * The frontend receives PermissionModuleGroup[] directly — no reduce/groupBy.
 */
"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { appLogger } from "@core/common/logger";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermission } from "@core/hooks/use-permission";
import { useAppStore } from "@core/store/useAppStore";
import { isSudoCancelledError } from "@core/store/useSudoStore";
import { useOptionalNavigation } from "@core/providers/navigation-provider";
import { syncCurrentSessionAuthorization } from "@core/hooks/use-authorization-sync";
import { SYSTEM_PERMISSIONS, isPlatformSuperAdminUser } from "@core/common/types/permissions";
import { identityContainer } from "@modules/identity/di";
import type {
  Permission,
  PermissionModuleGroup,
  PermissionCategoryGroup,
} from "@modules/identity/permissions";
import type { Role } from "../../domain/entities/Role";
import {
  PermissionScopes,
  type PermissionAssignmentJson,
} from "../../domain/types/PermissionTypes";
import type { RoleWorkspaceStartPagesCardProps } from "../components/RoleWorkspaceStartPagesCard";
import { useRoleWorkspaceEntriesViewModel } from "./useRoleWorkspaceEntriesViewModel";
import {
  extractRolePermissionAssignment,
  normalizeRolePermissionScope,
} from "../../domain/utils/permission-assignment-utils";

// === Types ===
/**
 * Exported type in the identity/roles module.
 */
export type { PermissionModuleGroup, PermissionCategoryGroup };

/**
 * Interface defining property specifications, keys types, and structural contract rules for role detail header props.
 */
export interface RoleDetailHeaderProps {
  role: Role | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
  /** Whether the permission matrix has unsaved edits since the last load/save. */
  isDirty: boolean;
  /** Whether the role's permissions are locked by edition synchronization. */
  isPermissionLocked?: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for role info card props.
 */
export interface RoleInfoCardProps {
  role: Role | undefined;
  isLoading: boolean;
  selectedCount: number;
  totalCount: number;
  adminCount?: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for permission tree props.
 */
export interface PermissionTreeProps {
  moduleGroups: PermissionModuleGroup[];
  isLoading: boolean;
  expandedKeys: Set<string>;
  selectedPermissionCodes: Set<string>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleExpand: (key: string) => void;
  onToggleAllInCategory: (permissions: Permission[]) => void;
  onTogglePermission: (code: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  assignments: Map<string, PermissionAssignmentJson>;
  onUpdateConfig: (code: string, assignment: PermissionAssignmentJson) => void;
  onBulkScopeUpdate: (scope: string) => void;
  bulkScopeValue: string;
  setBulkScopeValue: (scope: string) => void;
  allowAllTenants?: boolean;
  isPermissionLocked?: boolean;
  isReadOnly?: boolean;
  lockReason?: string;
}

// === ViewModel ===
/**
 * React hook/ViewModel orchestrating state and data flows for role detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useRoleDetailViewModel(roleIdOverride?: string) {
  const { t, language } = useI18n();
  const params = useParams();
  // The route passes the id explicitly where it can; reading the dynamic
  // segment stays the fallback so a bare `<RoleDetailView/>` under `roles/[id]`
  // keeps working. Both resolve to the same value on that route.
  const roleId = roleIdOverride ?? (params.id as string);
  const queryClient = useQueryClient();
  const nav = useOptionalNavigation();
  const { success, error: toastError, info: toastInfo } = useEnhancedToast();
  const { roleRepository } = identityContainer;

  const user = useAppStore((s) => s.user);
  const userTenantId = user?.tenantId ?? null;
  const isPlatformSuperAdmin = isPlatformSuperAdminUser(user);
  const canViewTenants = usePermission(SYSTEM_PERMISSIONS.TENANTS_VIEW);
  const canManagePermissions = usePermission(SYSTEM_PERMISSIONS.ROLES_MANAGE_PERMISSIONS);

  // === STATE ===
  const [assignments, setAssignments] = useState<Map<string, PermissionAssignmentJson>>(new Map());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkScopeValue, setBulkScopeValue] = useState<string>("");
  // Tracks unsaved edits so the header's Save button and "unsaved changes"
  // banner reflect real state instead of just the in-flight save request —
  // mirrors useOAuthAppDetailViewModel's isDirty flag.
  const [isDirty, setIsDirty] = useState(false);
  // Tracks which role and save revision we've hydrated `assignments` for.
  // Background/refocus refetches of `rolePermissions` do not clobber unsaved edits;
  // explicit post-save invalidation bumps `saveRevision` so assignments re-sync once.
  const [initializedRoleId, setInitializedRoleId] = useState<string | null>(null);
  const [saveRevision, setSaveRevision] = useState(0);
  const hydratedRevisionRef = useRef<number>(0);
  const permissionIdByCodeRef = useRef<Map<string, string>>(new Map());
  const activeRoleIdRef = useRef<string>(roleId);
  const editEpochRef = useRef<number>(0);
  const rolePermissionsUpdatedAtRef = useRef<number>(0);
  const postSaveSyncRef = useRef<{
    roleId: string;
    floorUpdatedAt: number;
    refetchSettled: boolean;
  } | null>(null);

  // === QUERIES ===
  const { data: role, isLoading: roleLoading } = useQuery<Role>({
    queryKey: ["role", roleId],
    queryFn: () => roleRepository.getById(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 0,
  });

  const {
    data: rolePermissions,
    isLoading: rolePermissionsLoading,
    isFetching: rolePermissionsFetching,
    isError: rolePermissionsError,
    dataUpdatedAt: rolePermissionsUpdatedAt,
  } = useQuery<any[]>({
    queryKey: ["rolePermissions", roleId],
    queryFn: () => roleRepository.getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    activeRoleIdRef.current = roleId;
    rolePermissionsUpdatedAtRef.current = rolePermissionsUpdatedAt;
  }, [roleId, rolePermissionsUpdatedAt]);

  // ── Backend-driven grouped permissions (Module → Category → Permissions) ──
  // ZERO client-side grouping: backend sends the tree, frontend renders it.
  const targetTenantId = role?.tenantId ?? null;
  const isTenantRole = Boolean(targetTenantId || userTenantId);
  const allowAllTenants = !isTenantRole;
  const isPermissionLocked = Boolean(role?.isPermissionLocked);
  const permissionsReadOnly = isPermissionLocked || !canManagePermissions;
  const useCrossTenantEndpoint = Boolean(
    targetTenantId &&
      (isPlatformSuperAdmin || (targetTenantId !== userTenantId && canViewTenants))
  );

  const { data: rawModuleGroups = [], isLoading: permissionsLoading } = useQuery<
    PermissionModuleGroup[]
  >({
    queryKey: [
      "roleAvailablePermissionsGrouped",
      useCrossTenantEndpoint ? targetTenantId : (userTenantId ?? "platform"),
    ],
    queryFn: () => {
      if (useCrossTenantEndpoint && targetTenantId) {
        return roleRepository.getTenantAvailablePermissionsGrouped(targetTenantId);
      }
      return roleRepository.getCurrentTenantAvailablePermissionsGrouped();
    },
    enabled: !roleLoading,
  });

  // Defensive tenant guard over the full unfiltered catalog (used for totals, ID resolution, and workspace eligibility)
  const allModuleGroups = useMemo(() => {
    if (!isTenantRole) return rawModuleGroups;
    return rawModuleGroups
      .map((mg) => ({
        ...mg,
        categories: mg.categories
          .map((cat) => ({
            ...cat,
            permissions: cat.permissions.filter(
              (p) => (p as { platformOnly?: boolean }).platformOnly !== true
            ),
          }))
          .filter((cat) => cat.permissions.length > 0),
      }))
      .filter((mg) => mg.categories.length > 0);
  }, [isTenantRole, rawModuleGroups]);

  useEffect(() => {
    const map = new Map<string, string>();
    allModuleGroups.forEach((mg) =>
      mg.categories.forEach((cat) =>
        cat.permissions.forEach((p) => {
          map.set(p.code, p.id);
        })
      )
    );
    permissionIdByCodeRef.current = map;
  }, [allModuleGroups]);

  // Client-side search filter for PermissionTreeCard so search never shrinks totalPermCount or drops hidden IDs on save
  const filteredModuleGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allModuleGroups;
    return allModuleGroups
      .map((mg) => ({
        ...mg,
        categories: mg.categories
          .map((cat) => ({
            ...cat,
            permissions: cat.permissions.filter((p) => {
              const localized = p.getLocalizedName(language);
              return (
                localized.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
                (p.nameAr && p.nameAr.toLowerCase().includes(q))
              );
            }),
          }))
          .filter((cat) => cat.permissions.length > 0),
      }))
      .filter((mg) => mg.categories.length > 0);
  }, [allModuleGroups, searchQuery, language]);

  // ── Blast Radius: Count of Admins holding this role ──
  const { data: adminCount = 0 } = useQuery({
    queryKey: ["role-admin-count", roleId],
    queryFn: () => (roleId ? roleRepository.getAdminCount(roleId) : 0),
    enabled: !!roleId,
  });

  const selectedPermissionCodes = new Set(assignments.keys());
  const workspaceEntriesVm = useRoleWorkspaceEntriesViewModel({
    roleId,
    role,
    roleLoading,
    moduleGroups: allModuleGroups,
    selectedPermissionCodes,
  });

  // ── Auto-expand all modules when data first loads ──
  const hasInitializedExpand = useRef<string | null>(null);
  useEffect(() => {
    const expandScopeKey = roleId ?? "__loaded__";
    if (allModuleGroups.length > 0 && hasInitializedExpand.current !== expandScopeKey) {
      hasInitializedExpand.current = expandScopeKey;
      const keys = new Set<string>();
      allModuleGroups.forEach((mg) => {
        keys.add(`module:${mg.module}`);
      });
      queueMicrotask(() => {
        setExpandedKeys(keys);
      });
    }
  }, [allModuleGroups, roleId]);

  // === INITIALIZE ASSIGNMENTS WHEN DATA LOADS (once per role or settled post-save refetch) ===
  useEffect(() => {
    if (!roleId) return;
    if (initializedRoleId !== roleId) {
      postSaveSyncRef.current = null;
    }
    if (rolePermissionsLoading || rolePermissionsFetching || rolePermissionsError) return;
    const pendingSync = postSaveSyncRef.current;
    if (
      pendingSync &&
      pendingSync.roleId === roleId &&
      !pendingSync.refetchSettled &&
      rolePermissionsUpdatedAt <= pendingSync.floorUpdatedAt
    ) {
      return;
    }
    if (initializedRoleId === roleId && hydratedRevisionRef.current === saveRevision) return;
    if (!rolePermissions) return;

    appLogger.debug("rolePermissions raw:", rolePermissions);

    const newAssignments = new Map<string, PermissionAssignmentJson>();

    rolePermissions.forEach((rp: any) => {
      const parsed = extractRolePermissionAssignment(rp);
      if (parsed) {
        newAssignments.set(parsed.code, parsed.assignment);
      }
    });

    appLogger.debug("Initialized assignments map size:", newAssignments.size);
    postSaveSyncRef.current = null;
    hydratedRevisionRef.current = saveRevision;
    queueMicrotask(() => {
      setAssignments(newAssignments);
      setIsDirty(false);
      setInitializedRoleId(roleId);
    });
  }, [
    roleId,
    rolePermissions,
    rolePermissionsLoading,
    rolePermissionsFetching,
    rolePermissionsError,
    rolePermissionsUpdatedAt,
    initializedRoleId,
    saveRevision,
  ]);

  // === MUTATION ===
  const saveMutation = useMutation({
    mutationFn: async () => {
      const savedRoleId = roleId;
      const mutationEpoch = editEpochRef.current;

      if (workspaceEntriesVm.isEntriesDirty && workspaceEntriesVm.hasIncompleteDraftRule) {
        throw new Error(t("roleDetail.workspaceEntriesMissingTargetError"));
      }

      let latestRowVersion = role?.rowVersion ?? null;

      if (isDirty && !permissionsReadOnly) {
        const missingCodes: string[] = [];
        const permissionsPayload: Array<{
          permissionId: string;
          scopeOverride: string | null;
          restrictedFields: string[];
        }> = [];

        for (const [code, assignment] of assignments.entries()) {
          const id = assignment.permissionId || permissionIdByCodeRef.current.get(code) || "";
          if (!id) {
            missingCodes.push(code);
            continue;
          }
          const normalizedScope =
            normalizeRolePermissionScope(assignment.scopeOverride, allowAllTenants) ?? null;
          permissionsPayload.push({
            permissionId: id,
            scopeOverride: normalizedScope,
            restrictedFields: assignment.restrictedFields ?? [],
          });
        }

        if (missingCodes.length > 0) {
          throw new Error(
            t("roles.permissionsMissingIdsError", { codes: missingCodes.join(", ") })
          );
        }

        appLogger.debug("Saving permissions payload:", permissionsPayload);

        await roleRepository.assignPermissions(savedRoleId, {
          permissions: permissionsPayload,
        });

        // Assigning permissions bumps Role.RowVersion server-side; refresh before saving workspace entries.
        if (workspaceEntriesVm.isEntriesDirty) {
          const refreshedRole = await roleRepository.getById(savedRoleId);
          latestRowVersion = refreshedRole.rowVersion ?? latestRowVersion;
        }
      }

      if (workspaceEntriesVm.isEntriesDirty) {
        await workspaceEntriesVm.saveWorkspaceEntries(latestRowVersion);
      }

      return { savedRoleId, mutationEpoch };
    },
    onSuccess: async (result) => {
      const savedRoleId = result?.savedRoleId ?? roleId;
      const mutationEpoch = result?.mutationEpoch ?? editEpochRef.current;
      const syncToken = {
        roleId: savedRoleId,
        floorUpdatedAt: rolePermissionsUpdatedAtRef.current,
        refetchSettled: false,
      };
      postSaveSyncRef.current = syncToken;

      // Only bump saveRevision after rolePermissions finishes refetching fresh server data;
      // bumping earlier causes useEffect to briefly revert assignments to stale cache.
      const refetchPromise = Promise.resolve(
        queryClient.invalidateQueries({ queryKey: ["rolePermissions", savedRoleId] })
      );
      queryClient.invalidateQueries({ queryKey: ["role-permissions", savedRoleId] });
      queryClient.invalidateQueries({ queryKey: ["role", savedRoleId] });
      queryClient.invalidateQueries({ queryKey: qk.roles.all });
      queryClient.invalidateQueries({ queryKey: qk.roles.workspaceEntries(savedRoleId) });

      void refetchPromise.then(() => {
        if (postSaveSyncRef.current === syncToken) {
          syncToken.refetchSettled = true;
        }
        if (
          activeRoleIdRef.current === savedRoleId &&
          editEpochRef.current === mutationEpoch
        ) {
          setSaveRevision((prev) => prev + 1);
        }
      });

      if (editEpochRef.current === mutationEpoch) {
        setIsDirty(false);
      }

      try {
        await syncCurrentSessionAuthorization({
          queryClient,
          refreshNavigation: nav?.refreshNavigation,
          targetTenantId,
        });
      } catch {
        // Non-fatal: role permission save succeeded even if background auth sync fails
      }
      success({
        title: t("common.success"),
        description: t("roleDetail.permissionsSaved"),
      });
    },
    onError: (err: Error) => {
      if (isSudoCancelledError(err)) {
        toastInfo?.({
          title: t("profile.sudo.cancelledTitle"),
          description: t("profile.sudo.cancelledDescription"),
        });
        return;
      }
      toastError({
        title: t("common.error"),
        description: err.message,
      });
    },
  });

  // === HANDLERS ===
  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const togglePermission = useCallback(
    (permissionCode: string) => {
      if (permissionsReadOnly) return;
      editEpochRef.current += 1;
      setIsDirty(true);
      setAssignments((prev) => {
        const next = new Map(prev);
        if (next.has(permissionCode)) {
          next.delete(permissionCode);
        } else {
          const id = permissionIdByCodeRef.current.get(permissionCode) || "";
          next.set(permissionCode, {
            permissionId: id,
            scopeOverride: undefined,
            restrictedFields: [],
          });
        }
        return next;
      });
    },
    [permissionsReadOnly]
  );

  const updateAssignment = useCallback(
    (code: string, assignment: PermissionAssignmentJson) => {
      if (permissionsReadOnly) return;
      editEpochRef.current += 1;
      setIsDirty(true);
      setAssignments((prev) => {
        const next = new Map(prev);
        next.set(code, {
          ...assignment,
          scopeOverride: normalizeRolePermissionScope(assignment.scopeOverride, allowAllTenants),
        });
        return next;
      });
    },
    [permissionsReadOnly, allowAllTenants]
  );

  const toggleCategoryPermissions = useCallback(
    (permissions: Permission[]) => {
      if (permissionsReadOnly) return;
      const categoryCodes = permissions.map((p) => p.code);
      const allSelected = categoryCodes.every((code) => assignments.has(code));

      editEpochRef.current += 1;
      setIsDirty(true);
      setAssignments((prev) => {
        const next = new Map(prev);
        categoryCodes.forEach((code) => {
          if (allSelected) {
            next.delete(code);
          } else {
            if (!next.has(code)) {
              const permission = permissions.find((p) => p.code === code);
              next.set(code, {
                permissionId: permission?.id || permissionIdByCodeRef.current.get(code) || "",
                scopeOverride: undefined,
                restrictedFields: [],
              });
            }
          }
        });
        return next;
      });
    },
    [assignments, permissionsReadOnly]
  );

  const expandAll = useCallback(() => {
    // Expand both module and category keys
    const keys = new Set<string>();
    allModuleGroups.forEach((mg) => {
      keys.add(`module:${mg.module}`);
      mg.categories.forEach((cat) => {
        keys.add(`cat:${mg.module}:${cat.category}`);
      });
    });
    setExpandedKeys(keys);
  }, [allModuleGroups]);

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  const bulkUpdateScope = useCallback(
    (scope: string) => {
      if (permissionsReadOnly) return;
      if (!allowAllTenants && scope.toLowerCase() === PermissionScopes.AllTenants) {
        return;
      }
      const scopeValue = normalizeRolePermissionScope(scope, allowAllTenants);

      editEpochRef.current += 1;
      setIsDirty(true);
      setAssignments((prev) => {
        const next = new Map(prev);
        Array.from(next.keys()).forEach((key) => {
          const current = next.get(key)!;
          next.set(key, { ...current, scopeOverride: scopeValue });
        });
        return next;
      });
    },
    [permissionsReadOnly, allowAllTenants]
  );

  // === DERIVED STATE ===
  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const totalPermCount = allModuleGroups.reduce(
    (sum, mg) => sum + mg.categories.reduce((s, cat) => s + cat.permissions.length, 0),
    0
  );
  const lockReason = isPermissionLocked
    ? t("roles.permissionLockedDescription")
    : !canManagePermissions
      ? t("roles.readOnlyPermissionsHint")
      : undefined;

  // === RETURN PROPS FOR VIEW ===
  return {
    header: {
      role,
      isLoading: roleLoading,
      isSaving: saveMutation.isPending,
      onSave: handleSave,
      isDirty: isDirty || workspaceEntriesVm.isEntriesDirty,
      isPermissionLocked,
    } as RoleDetailHeaderProps,

    info: {
      role,
      isLoading: roleLoading,
      selectedCount: assignments.size,
      totalCount: totalPermCount,
      adminCount,
    } as RoleInfoCardProps,

    permissions: {
      moduleGroups: filteredModuleGroups,
      isLoading,
      expandedKeys,
      selectedPermissionCodes,
      searchQuery,
      onSearchChange: setSearchQuery,
      onToggleExpand: toggleExpand,
      onToggleAllInCategory: toggleCategoryPermissions,
      onTogglePermission: togglePermission,
      onExpandAll: expandAll,
      onCollapseAll: collapseAll,
      assignments: assignments,
      onUpdateConfig: updateAssignment,
      onBulkScopeUpdate: bulkUpdateScope,
      bulkScopeValue,
      setBulkScopeValue,
      allowAllTenants,
      isPermissionLocked,
      isReadOnly: permissionsReadOnly,
      lockReason,
    } as PermissionTreeProps,

    workspaceEntries: {
      rules: workspaceEntriesVm.rules,
      eligibleWorkspaces: workspaceEntriesVm.eligibleWorkspaces,
      availableWorkspacesForNewRule: workspaceEntriesVm.availableWorkspacesForNewRule,
      catalog: workspaceEntriesVm.catalog,
      scopeMode: workspaceEntriesVm.scopeMode,
      selectedPermissionCodes,
      isSystemRole: workspaceEntriesVm.isSystemRole,
      isLoading: workspaceEntriesVm.isLoading,
      onAddRule: workspaceEntriesVm.addRule,
      onUpdateRuleWorkspace: workspaceEntriesVm.updateRuleWorkspace,
      onUpdateRuleTarget: workspaceEntriesVm.updateRuleTarget,
      onToggleRuleEnforced: workspaceEntriesVm.toggleRuleEnforced,
      onRemoveRule: workspaceEntriesVm.removeRule,
    } as RoleWorkspaceStartPagesCardProps,
  };
}
