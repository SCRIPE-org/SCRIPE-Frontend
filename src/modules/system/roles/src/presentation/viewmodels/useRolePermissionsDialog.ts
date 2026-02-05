/**
 * Role Permissions Dialog ViewModel
 * 
 * Encapsulates all logic for managing role permissions.
 * Following SOLID pattern - single responsibility for permissions logic.
 *
 * @module roles/presentation/viewmodels
 */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { getCoreContainer } from "@core/di";
import { systemContainer } from "@modules/system/di";
import type { Role } from "../../domain/entities/Role";

// Types matching actual API responses
export interface TenantPermission {
      id: string;
      resource: string;
      action: string;
      code: string;
      defaultScope: string;
      description?: string;
      nameEn?: string;
      nameAr?: string;
}

export interface RolePermission {
      permissionId: string;
      permissionCode: string;
      description?: string;
      scope?: string;
}

export interface GroupedPermissions {
      [resource: string]: TenantPermission[];
}

export interface UseRolePermissionsDialogProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      role: Role | null;
      tenantId: string;
}

export interface UseRolePermissionsDialogResult {
      // State
      search: string;
      setSearch: (value: string) => void;
      selectedCodes: Set<string>;
      expandedGroups: string[];
      setExpandedGroups: (groups: string[]) => void;

      // Data
      grouped: GroupedPermissions;
      totalCount: number;
      selectedCount: number;
      groupCount: number;
      isLoading: boolean;

      // Actions
      toggle: (code: string) => void;
      toggleGroup: (codes: string[]) => void;
      save: () => void;
      isSaving: boolean;

      // Helpers
      getName: (p: TenantPermission) => string;
      isChecked: (code: string) => boolean;
      getGroupStats: (codes: string[]) => { count: number; total: number; allChecked: boolean; someChecked: boolean };
}

export function useRolePermissionsDialog({
      open,
      onOpenChange,
      role,
      tenantId,
}: UseRolePermissionsDialogProps): UseRolePermissionsDialogResult {
      const { t, language } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const [search, setSearch] = useState("");
      const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
      const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

      // Reset when dialog opens
      useEffect(() => {
            if (open) setSearch("");
      }, [open]);

      // Fetch tenant's available permissions
      const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-permissions-raw", tenantId],
            queryFn: () => getCoreContainer().apiService.get<TenantPermission[]>(
                  `/Tenants/${tenantId}/permissions`
            ),
            enabled: open && !!tenantId,
      });

      // Fetch role's current permissions
      const { data: rolePermissions = [], isLoading: loadingRole } = useQuery({
            queryKey: ["role-permissions", role?.id],
            queryFn: async (): Promise<RolePermission[]> => {
                  if (!role) return [];
                  return systemContainer.roleRepository.getRolePermissions(role.id);
            },
            enabled: open && !!role?.id,
      });

      // Initialize selection when data loads
      useEffect(() => {
            if (rolePermissions.length > 0 && tenantPermissions.length > 0) {
                  const validCodes = new Set(tenantPermissions.map(p => p.code));
                  const roleCodes = rolePermissions.map(p => p.permissionCode);
                  const selectedFromRole = roleCodes.filter(code => validCodes.has(code));

                  setSelectedCodes(new Set(selectedFromRole));

                  // Auto-expand groups with selected permissions
                  const groupsWithSelection = new Set<string>();
                  tenantPermissions.forEach(p => {
                        if (selectedFromRole.includes(p.code)) {
                              groupsWithSelection.add(p.resource);
                        }
                  });
                  setExpandedGroups(Array.from(groupsWithSelection));
            }
      }, [rolePermissions, tenantPermissions]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  if (!role) throw new Error("No role selected");

                  const selectedIds = tenantPermissions
                        .filter(p => selectedCodes.has(p.code))
                        .map(p => p.id);

                  await systemContainer.roleRepository.assignPermissions(role.id, {
                        permissions: selectedIds.map(id => ({ permissionId: id })),
                  });
            },
            onSuccess: () => {
                  toast({ title: t("role.permissionsSaved") || "Permissions saved successfully" });
                  queryClient.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
                  queryClient.invalidateQueries({ queryKey: ["roles"] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({
                        title: t("role.permissionsSaveError") || "Failed to save",
                        description: error.message,
                        variant: "destructive"
                  });
            },
      });

      // Toggle handlers
      const toggle = (code: string) => {
            setSelectedCodes(prev => {
                  const next = new Set(prev);
                  next.has(code) ? next.delete(code) : next.add(code);
                  return next;
            });
      };

      const toggleGroup = (codes: string[]) => {
            const allSelected = codes.every(c => selectedCodes.has(c));
            setSelectedCodes(prev => {
                  const next = new Set(prev);
                  codes.forEach(c => allSelected ? next.delete(c) : next.add(c));
                  return next;
            });
      };

      // Filter and group permissions
      const grouped = useMemo(() => {
            const searchLower = search.toLowerCase();
            const filtered = tenantPermissions.filter(p => {
                  if (!search) return true;
                  const name = (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;
                  return name.toLowerCase().includes(searchLower) || p.code.toLowerCase().includes(searchLower);
            });

            return filtered.reduce((acc, p) => {
                  const key = p.resource || "other";
                  (acc[key] = acc[key] || []).push(p);
                  return acc;
            }, {} as GroupedPermissions);
      }, [tenantPermissions, search, language]);

      // Helpers
      const getName = (p: TenantPermission) =>
            (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;

      const isChecked = (code: string) => selectedCodes.has(code);

      const getGroupStats = (codes: string[]) => {
            const count = codes.filter(c => selectedCodes.has(c)).length;
            return {
                  count,
                  total: codes.length,
                  allChecked: count === codes.length,
                  someChecked: count > 0 && count < codes.length,
            };
      };

      return {
            // State
            search,
            setSearch,
            selectedCodes,
            expandedGroups,
            setExpandedGroups,

            // Data
            grouped,
            totalCount: tenantPermissions.length,
            selectedCount: selectedCodes.size,
            groupCount: Object.keys(grouped).length,
            isLoading: loadingTenant || loadingRole,

            // Actions
            toggle,
            toggleGroup,
            save: () => saveMutation.mutate(),
            isSaving: saveMutation.isPending,

            // Helpers
            getName,
            isChecked,
            getGroupStats,
      };
}
