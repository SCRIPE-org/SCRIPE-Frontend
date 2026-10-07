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

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@core/common/logger";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import type {
  Permission,
  PermissionModuleGroup,
  PermissionCategoryGroup,
} from "@modules/identity/permissions";
import type { Role } from "../../domain/entities/Role";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

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
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for role info card props.
 */
export interface RoleInfoCardProps {
  role: Role | undefined;
  isLoading: boolean;
  selectedCount: number;
  totalCount: number;
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
}

// === ViewModel ===
/**
 * React hook/ViewModel orchestrating state and data flows for role detail view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useRoleDetailViewModel(roleIdOverride?: string) {
  const { t } = useI18n();
  const params = useParams();
  // The route passes the id explicitly where it can; reading the dynamic
  // segment stays the fallback so a bare `<RoleDetailView/>` under `roles/[id]`
  // keeps working. Both resolve to the same value on that route.
  const roleId = roleIdOverride ?? (params.id as string);
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { roleRepository } = identityContainer;

  // === STATE ===
  const [assignments, setAssignments] = useState<Map<string, PermissionAssignmentJson>>(new Map());
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkScopeValue, setBulkScopeValue] = useState<string>("");
  // Tracks unsaved edits so the header's Save button and "unsaved changes"
  // banner reflect real state instead of just the in-flight save request —
  // mirrors useOAuthAppDetailViewModel's isDirty flag.
  const [isDirty, setIsDirty] = useState(false);
  // Tracks which role we've already initialized `assignments` for — mirrors
  // useRolePermissionsDialog's initializedRoleId guard. Without it, the
  // staleTime: 0 query below refetches on every refocus/reconnect and hands
  // back a new array reference for the SAME role, which would silently
  // overwrite any in-progress unsaved permission edits.
  const [initializedRoleId, setInitializedRoleId] = useState<string | null>(null);

  // === QUERIES ===
  const { data: role, isLoading: roleLoading } = useQuery<Role>({
    queryKey: ["role", roleId],
    queryFn: () => roleRepository.getById(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 0,
  });

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<any[]>({
    queryKey: ["rolePermissions", roleId],
    queryFn: () => roleRepository.getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 0,
  });

  // ── Backend-driven grouped permissions (Module → Category → Permissions) ──
  // ZERO client-side grouping: backend sends the tree, frontend renders it.
  const { data: moduleGroups = [], isLoading: permissionsLoading } = useQuery<
    PermissionModuleGroup[]
  >({
    queryKey: ["myTenantAvailablePermissionsGrouped", searchQuery],
    queryFn: () => roleRepository.getMyTenantAvailablePermissionsGrouped(searchQuery || undefined),
  });

  // ── Auto-expand all modules when data first loads ──
  // This replaces the broken `expandedKeys.size === 0 ? true` fallback.
  // When moduleGroups loads, populate expandedKeys with all module keys
  // so every module starts expanded. Users can then collapse individually.
  const hasInitializedExpand = useRef(false);
  useEffect(() => {
    if (moduleGroups.length > 0 && !hasInitializedExpand.current) {
      hasInitializedExpand.current = true;
      const keys = new Set<string>();
      moduleGroups.forEach((mg) => {
        keys.add(`module:${mg.module}`);
      });
      queueMicrotask(() => {
        setExpandedKeys(keys);
      });
    }
  }, [moduleGroups]);

  // === INITIALIZE ASSIGNMENTS WHEN DATA LOADS (once per role) ===
  // Guarded on roleId, not on rolePermissions' array reference: staleTime: 0
  // means a window refocus can refetch and hand back a new (content-identical
  // or server-normalized) array for the SAME role at any time, including
  // mid-edit. Only a genuine role switch — or the first load — should reset
  // the editor; a background refetch of the role you're already editing must
  // not. The post-save refetch doesn't need to re-sync either: local
  // `assignments` already holds exactly what was just saved, and
  // saveMutation's onSuccess already clears isDirty directly.
  useEffect(() => {
    if (!roleId || rolePermissionsLoading || initializedRoleId === roleId) return;
    if (!rolePermissions || rolePermissions.length === 0) return;

    appLogger.debug("rolePermissions raw:", rolePermissions);

    const newAssignments = new Map<string, PermissionAssignmentJson>();

    rolePermissions.forEach((rp: any) => {
      const code = rp.permissionCode || rp.PermissionCode || rp.code || rp.Code;

      if (code) {
        newAssignments.set(code, {
          permissionId: rp.permissionId || rp.PermissionId || rp.id || rp.Id,
          scopeOverride: rp.scope || rp.ScopeOverride,
          restrictedFields: Array.isArray(rp.restrictedFields) ? rp.restrictedFields : undefined,
        });
      }
    });

    appLogger.debug("Initialized assignments map size:", newAssignments.size);
    queueMicrotask(() => {
      setAssignments(newAssignments);
      setIsDirty(false);
      setInitializedRoleId(roleId);
    });
  }, [roleId, rolePermissions, rolePermissionsLoading, initializedRoleId]);

  // Helper: flatten all permissions from module groups (for save payload)
  const getAllPermissionsFlat = (): Permission[] => {
    return moduleGroups.flatMap((mg) => mg.categories.flatMap((cat) => cat.permissions));
  };

  // === MUTATION ===
  const saveMutation = useMutation({
    mutationFn: async () => {
      const allPermissions = getAllPermissionsFlat();
      const codeToIdMap = new Map<string, string>();
      allPermissions.forEach((p) => {
        codeToIdMap.set(p.code, p.id);
      });

      const permissionsPayload = Array.from(assignments.entries())
        .map(([code, assignment]) => {
          let id = assignment.permissionId;
          if (!id) {
            id = codeToIdMap.get(code) || "";
          }
          return {
            permissionId: id,
            scopeOverride: assignment.scopeOverride ?? null,
            restrictedFields: assignment.restrictedFields ?? [],
          };
        })
        .filter((p) => !!p.permissionId);

      appLogger.debug("Saving permissions payload:", permissionsPayload);

      await roleRepository.assignPermissions(roleId, {
        permissions: permissionsPayload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      // Reset immediately rather than waiting on the invalidated refetch, so
      // the Save button/banner clear the instant the save resolves.
      setIsDirty(false);
      success({
        title: t("common.success"),
        description: t("roleDetail.permissionsSaved"),
      });
    },
    onError: (err: Error) => {
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
      setIsDirty(true);
      setAssignments((prev) => {
        const next = new Map(prev);
        if (next.has(permissionCode)) {
          next.delete(permissionCode);
        } else {
          // Find permission ID from module groups
          const allPerms = moduleGroups.flatMap((mg) =>
            mg.categories.flatMap((cat) => cat.permissions)
          );
          const permission = allPerms.find((p) => p.code === permissionCode);
          next.set(permissionCode, {
            permissionId: permission?.id || "",
            scopeOverride: "Tenant",
            restrictedFields: [],
          });
        }
        return next;
      });
    },
    [moduleGroups]
  );

  const updateAssignment = useCallback((code: string, assignment: PermissionAssignmentJson) => {
    setIsDirty(true);
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(code, assignment);
      return next;
    });
  }, []);

  const toggleCategoryPermissions = useCallback(
    (permissions: Permission[]) => {
      const categoryCodes = permissions.map((p) => p.code);
      const allSelected = categoryCodes.every((code) => assignments.has(code));

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
                permissionId: permission?.id || "",
                scopeOverride: "Tenant",
                restrictedFields: [],
              });
            }
          }
        });
        return next;
      });
    },
    [assignments]
  );

  const expandAll = useCallback(() => {
    // Expand both module and category keys
    const keys = new Set<string>();
    moduleGroups.forEach((mg) => {
      keys.add(`module:${mg.module}`);
      mg.categories.forEach((cat) => {
        keys.add(`cat:${mg.module}:${cat.category}`);
      });
    });
    setExpandedKeys(keys);
  }, [moduleGroups]);

  const collapseAll = useCallback(() => {
    setExpandedKeys(new Set());
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  const bulkUpdateScope = useCallback((scope: string) => {
    const scopeValue = scope === "own_tenant" ? undefined : scope;

    setIsDirty(true);
    setAssignments((prev) => {
      const next = new Map(prev);
      Array.from(next.keys()).forEach((key) => {
        const current = next.get(key)!;
        next.set(key, { ...current, scopeOverride: scopeValue });
      });
      return next;
    });
  }, []);

  // === DERIVED STATE ===
  const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;
  const selectedPermissionCodes = new Set(assignments.keys());
  const totalPermCount = moduleGroups.reduce(
    (sum, mg) => sum + mg.categories.reduce((s, cat) => s + cat.permissions.length, 0),
    0
  );

  // === RETURN PROPS FOR VIEW ===
  return {
    header: {
      role,
      isLoading: roleLoading,
      isSaving: saveMutation.isPending,
      onSave: handleSave,
      isDirty,
    } as RoleDetailHeaderProps,

    info: {
      role,
      isLoading: roleLoading,
      selectedCount: assignments.size,
      totalCount: totalPermCount,
    } as RoleInfoCardProps,

    permissions: {
      moduleGroups,
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
    } as PermissionTreeProps,
  };
}
