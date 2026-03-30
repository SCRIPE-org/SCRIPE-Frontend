/**
 * Role Detail ViewModel
 *
 * Handles all business logic for the Role Detail page.
 * SOLID: All state, queries, mutations, and handlers live here.
 * View is pure UI (~60 lines).
 *
 * NOTE: Permission matching uses `code` instead of `id` because
 * the backend returns different encrypted IDs for rolePermissions vs allPermissions.
 */
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appLogger } from "@core/common/logger";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { systemContainer } from "@modules/system/di";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import type { Role } from "../../domain/entities/Role";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";

// === Types ===
export interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

export interface RoleDetailHeaderProps {
  role: Role | undefined;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export interface RoleInfoCardProps {
  role: Role | undefined;
  isLoading: boolean;
  selectedCount: number;
  totalCount: number;
}

export interface PermissionTreeProps {
  categories: PermissionCategory[];
  isLoading: boolean;
  expandedCategories: Set<string>;
  selectedPermissionCodes: Set<string>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onToggleCategory: (category: string) => void;
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
export function useRoleDetailViewModel() {
  const { t, language } = useI18n();
  const params = useParams();
  const roleId = params.id as string;
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { roleRepository, permissionRepository } = systemContainer;

  // === STATE ===
  // Changed from Set<string> to Map to hold config (scope, restrictions)
  const [assignments, setAssignments] = useState<Map<string, PermissionAssignmentJson>>(new Map());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkScopeValue, setBulkScopeValue] = useState<string>("");

  // === QUERIES ===
  const { data: role, isLoading: roleLoading } = useQuery<Role>({
    queryKey: ["role", roleId],
    queryFn: () => roleRepository.getById(roleId),
    enabled: !!roleId,
    staleTime: 0, // Always refetch on mount to avoid stale data after saves
    gcTime: 0,
  });

  const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<any[]>({
    queryKey: ["rolePermissions", roleId],
    queryFn: () => roleRepository.getRolePermissions(roleId),
    enabled: !!roleId,
    staleTime: 0,
    gcTime: 0,
  });

  // Use roleRepository's available permissions (tenant-scoped)
  const { data: allPermissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
    queryKey: ["myTenantAvailablePermissions"],
    queryFn: () => roleRepository.getMyTenantAvailablePermissions(),
  });

  // === INITIALIZE ASSIGNMENTS WHEN DATA LOADS ===
  useEffect(() => {
    if (rolePermissions && rolePermissions.length > 0) {
      appLogger.debug("rolePermissions raw:", rolePermissions);

      const newAssignments = new Map<string, PermissionAssignmentJson>();

      rolePermissions.forEach((rp: any) => {
        // Handle various casing from backend
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
      setAssignments(newAssignments);
    }
  }, [rolePermissions]);

  // === MUTATION ===
  const saveMutation = useMutation({
    mutationFn: async () => {
      const codeToIdMap = new Map<string, string>();
      allPermissions?.forEach((p) => {
        codeToIdMap.set(p.code, p.id);
      });

      // Convert map values to array for payload
      // Ensure permissionId is set (if missing in map, try to lookup from code)
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
      // Invalidate both role and permissions queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
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

  // === COMPUTED: Group permissions by category ===
  const categories = useMemo((): PermissionCategory[] => {
    if (!allPermissions) return [];

    const filtered = searchQuery
      ? allPermissions.filter((p) => {
        const name = p.getLocalizedName(language);
        const code = p.code.toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.toLowerCase().includes(query) || code.includes(query);
      })
      : allPermissions;

    const grouped = filtered.reduce(
      (acc, permission) => {
        const category = permission.category || t("roleDetail.otherCategory");
        if (!acc[category]) acc[category] = [];
        acc[category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>
    );

    return Object.entries(grouped)
      .map(([category, permissions]) => ({
        category,
        permissions: permissions.sort((a, b) => a.displayOrder - b.displayOrder),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [allPermissions, searchQuery, language, t]);

  // === HANDLERS ===
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }, []);

  const togglePermission = useCallback(
    (permissionCode: string) => {
      setAssignments((prev) => {
        const next = new Map(prev);
        if (next.has(permissionCode)) {
          next.delete(permissionCode);
        } else {
          // Find permission ID from allPermissions if possible
          const permission = allPermissions?.find((p) => p.code === permissionCode);
          next.set(permissionCode, {
            permissionId: permission?.id || "",
            scopeOverride: "Tenant", // Default to Tenant scope
            restrictedFields: [],
          });
        }
        return next;
      });
    },
    [allPermissions]
  );

  const updateAssignment = useCallback((code: string, assignment: PermissionAssignmentJson) => {
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
    setExpandedCategories(new Set(categories.map((c) => c.category)));
  }, [categories]);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  const handleSave = useCallback(() => {
    saveMutation.mutate();
  }, [saveMutation]);

  const bulkUpdateScope = useCallback((scope: string) => {
    // "own_tenant" means default/no override (undefined)
    const scopeValue = scope === "own_tenant" ? undefined : scope;

    setAssignments((prev) => {
      const next = new Map(prev);
      // Update all SELECTED permissions
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

  // === RETURN PROPS FOR VIEW ===
  return {
    // Header section props
    header: {
      role,
      isLoading: roleLoading,
      isSaving: saveMutation.isPending,
      onSave: handleSave,
    } as RoleDetailHeaderProps,

    // Info card props
    info: {
      role,
      isLoading: roleLoading,
      selectedCount: assignments.size,
      totalCount: allPermissions?.length || 0,
    } as RoleInfoCardProps,

    // Permission tree props
    permissions: {
      categories,
      isLoading,
      expandedCategories,
      selectedPermissionCodes,
      searchQuery,
      onSearchChange: setSearchQuery,
      onToggleCategory: toggleCategory,
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
