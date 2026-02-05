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
      const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<Set<string>>(new Set());
      const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
      const [searchQuery, setSearchQuery] = useState("");

      // === QUERIES ===
      const { data: role, isLoading: roleLoading } = useQuery<Role>({
            queryKey: ["role", roleId],
            queryFn: () => roleRepository.getById(roleId),
            enabled: !!roleId,
      });

      const { data: rolePermissions, isLoading: rolePermissionsLoading } = useQuery<any[]>({
            queryKey: ["rolePermissions", roleId],
            queryFn: () => roleRepository.getRolePermissions(roleId),
            enabled: !!roleId,
      });

      // Use roleRepository's available permissions (tenant-scoped)
      const { data: allPermissions, isLoading: permissionsLoading } = useQuery<Permission[]>({
            queryKey: ["myTenantAvailablePermissions"],
            queryFn: () => roleRepository.getMyTenantAvailablePermissions(),
      });

      // === INITIALIZE SELECTED PERMISSIONS WHEN DATA LOADS ===
      useEffect(() => {
            if (rolePermissions && rolePermissions.length > 0) {
                  appLogger.debug("rolePermissions raw:", rolePermissions);

                  const permCodes = new Set(
                        rolePermissions.map((rp: any) =>
                              rp.permissionCode || rp.PermissionCode || rp.code || rp.Code
                        ).filter(Boolean)
                  );

                  appLogger.debug("Extracted permission CODES:", Array.from(permCodes));
                  setSelectedPermissionCodes(permCodes as Set<string>);
            }
      }, [rolePermissions]);

      // === MUTATION ===
      const saveMutation = useMutation({
            mutationFn: async (permissionCodes: string[]) => {
                  const codeToIdMap = new Map<string, string>();
                  allPermissions?.forEach(p => {
                        codeToIdMap.set(p.code, p.id);
                  });

                  const permissionIds = permissionCodes
                        .map(code => codeToIdMap.get(code))
                        .filter(Boolean) as string[];

                  appLogger.debug("Saving permissions - codes:", permissionCodes);
                  appLogger.debug("Saving permissions - ids:", permissionIds);

                  await roleRepository.assignPermissions(roleId, {
                        permissions: permissionIds.map((id) => ({
                              permissionId: id,
                              scopeOverride: "own_tenant",
                        })),
                  });
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["rolePermissions", roleId] });
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

            const grouped = filtered.reduce((acc, permission) => {
                  const category = permission.category || t("roleDetail.otherCategory");
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(permission);
                  return acc;
            }, {} as Record<string, Permission[]>);

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

      const togglePermission = useCallback((permissionCode: string) => {
            setSelectedPermissionCodes((prev) => {
                  const next = new Set(prev);
                  next.has(permissionCode) ? next.delete(permissionCode) : next.add(permissionCode);
                  return next;
            });
      }, []);

      const toggleCategoryPermissions = useCallback(
            (permissions: Permission[]) => {
                  const categoryCodes = permissions.map((p) => p.code);
                  const allSelected = categoryCodes.every((code) => selectedPermissionCodes.has(code));

                  setSelectedPermissionCodes((prev) => {
                        const next = new Set(prev);
                        categoryCodes.forEach((code) => (allSelected ? next.delete(code) : next.add(code)));
                        return next;
                  });
            },
            [selectedPermissionCodes]
      );

      const expandAll = useCallback(() => {
            setExpandedCategories(new Set(categories.map((c) => c.category)));
      }, [categories]);

      const collapseAll = useCallback(() => {
            setExpandedCategories(new Set());
      }, []);

      const handleSave = useCallback(() => {
            saveMutation.mutate(Array.from(selectedPermissionCodes));
      }, [selectedPermissionCodes, saveMutation]);

      // === DERIVED STATE ===
      const isLoading = roleLoading || permissionsLoading || rolePermissionsLoading;

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
                  selectedCount: selectedPermissionCodes.size,
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
            } as PermissionTreeProps,
      };
}
