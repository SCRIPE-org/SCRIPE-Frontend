/**
 * Role Permissions Dialog ViewModel
 *
 * Encapsulates all logic for managing role permissions.
 * Following SOLID pattern - single responsibility for permissions logic.
 *
 * @module roles/presentation/viewmodels
 */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  restrictedFields?: string; // JSON string from backend
}

export interface GroupedPermissions {
  [resource: string]: TenantPermission[];
}

import type { PermissionAssignmentJson } from "../../data/models/RoleModel";
import { PermissionScopes } from "../../data/models/RoleModel";

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
  assignments: Map<string, PermissionAssignmentJson>;
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
  updateAssignment: (code: string, assignment: PermissionAssignmentJson) => void;
  toggleGroup: (codes: string[]) => void;
  save: () => void;
  bulkUpdateScope: (scope: string) => void;
  bulkScopeValue: string;
  setBulkScopeValue: (scope: string) => void;
  isSaving: boolean;

  // Helpers
  getName: (p: TenantPermission) => string;
  isChecked: (code: string) => boolean;
  getGroupStats: (codes: string[]) => {
    count: number;
    total: number;
    allChecked: boolean;
    someChecked: boolean;
  };
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
  const [assignments, setAssignments] = useState<Map<string, PermissionAssignmentJson>>(new Map());
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [bulkScopeValue, setBulkScopeValue] = useState<string>("");

  // Track if we've initialized for this role to prevent infinite loops
  const initializedRoleRef = useRef<string | null>(null);

  // Reset when dialog opens with a different role
  useEffect(() => {
    if (open && role?.id !== initializedRoleRef.current) {
      setSearch("");
      setAssignments(new Map());
      setExpandedGroups([]);
      initializedRoleRef.current = null; // Mark as not initialized
    }
    if (!open) {
      initializedRoleRef.current = null; // Reset when dialog closes
    }
  }, [open, role?.id]);

  // Fetch tenant's available permissions (with fallback for empty results)
  const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-permissions-raw", tenantId],
    queryFn: async () => {
      const api = getCoreContainer().apiService;
      // First, try to get tenant's assigned permissions
      const permissions = await api.get<TenantPermission[]>(`/Tenants/${tenantId}/permissions`);

      // If the tenant has no permissions assigned (e.g. not synced from edition),
      // fall back to creation permissions which lists ALL available permissions
      if (!permissions || permissions.length === 0) {
        try {
          const creationPerms = await systemContainer.tenantService.getCreationPermissions();
          return creationPerms.map((p: any) => ({
            id: p.id,
            resource: p.resource,
            action: p.action,
            code: p.code || p.permissionCode || `${p.resource}.${p.action}`,
            defaultScope: p.defaultScope || "own_tenant",
            description: p.description,
            nameEn: p.nameEn,
            nameAr: p.nameAr,
          }));
        } catch {
          return [];
        }
      }

      return permissions;
    },
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

  // Initialize selection from role's permissions (only once per role)
  useEffect(() => {
    if (
      open &&
      role?.id &&
      tenantPermissions.length > 0 &&
      !loadingRole &&
      initializedRoleRef.current !== role.id
    ) {
      const validCodes = new Map<string, string>(); // code -> id
      tenantPermissions.forEach((p) => validCodes.set(p.code, p.id));

      const newAssignments = new Map<string, PermissionAssignmentJson>();
      const groupsWithSelection = new Set<string>();

      rolePermissions.forEach((rp) => {
        if (validCodes.has(rp.permissionCode)) {
          newAssignments.set(rp.permissionCode, {
            permissionId: rp.permissionId,
            scopeOverride: rp.scope,
            restrictedFields:
              rp.restrictedFields && rp.restrictedFields !== "null" && rp.restrictedFields !== ""
                ? JSON.parse(rp.restrictedFields)
                : [],
          });

          // Find generic resource group
          const permissionDef = tenantPermissions.find((p) => p.code === rp.permissionCode);
          if (permissionDef?.resource) {
            groupsWithSelection.add(permissionDef.resource);
          }
        }
      });

      setAssignments(newAssignments);
      setExpandedGroups(Array.from(groupsWithSelection));

      // Mark as initialized for this role
      initializedRoleRef.current = role.id;
    }
  }, [open, role?.id, tenantPermissions, rolePermissions, loadingRole]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!role) throw new Error("No role selected");

      // Assignments map already contains corect JSON objects including config
      // Force structure to ensure keys are present (map undefined to null)
      const permissions = Array.from(assignments.values()).map((a) => ({
        permissionId: a.permissionId,
        scopeOverride: a.scopeOverride ?? null,
        restrictedFields: a.restrictedFields ?? [],
      }));

      await systemContainer.roleRepository.assignPermissions(role.id, {
        permissions: permissions,
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
        variant: "destructive",
      });
    },
  });

  // Toggle handlers
  const toggle = (code: string) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        // Find permission ID
        const permission = tenantPermissions.find((p) => p.code === code);
        if (permission) {
          next.set(code, {
            permissionId: permission.id,
            // Use explicit constant for Tenant scope
            scopeOverride: PermissionScopes.OwnTenant,
            restrictedFields: [],
          });
        }
      }
      return next;
    });
  };

  const updateAssignment = (code: string, assignment: PermissionAssignmentJson) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(code, assignment);
      return next;
    });
  };

  const toggleGroup = (codes: string[]) => {
    const allSelected = codes.every((c) => assignments.has(c));
    setAssignments((prev) => {
      const next = new Map(prev);
      codes.forEach((c) => {
        if (allSelected) {
          next.delete(c);
        } else {
          if (!next.has(c)) {
            const permission = tenantPermissions.find((p) => p.code === c);
            if (permission) {
              next.set(c, {
                permissionId: permission.id,
                scopeOverride: PermissionScopes.OwnTenant,
                restrictedFields: [],
              });
            }
          }
        }
      });
      return next;
    });
  };

  const bulkUpdateScope = (scope: string) => {
    // "default" maps to undefined/null to remove override
    const scopeValue = scope === PermissionScopes.Default ? undefined : scope;

    setAssignments((prev) => {
      const next = new Map(prev);
      // Update all SELECTED permissions
      Array.from(next.keys()).forEach((key) => {
        const current = next.get(key)!;
        next.set(key, { ...current, scopeOverride: scopeValue });
      });
      return next;
    });
  };

  // Filter and group permissions
  const grouped = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = tenantPermissions.filter((p) => {
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

  const isChecked = (code: string) => assignments.has(code);

  const getGroupStats = (codes: string[]) => {
    const count = codes.filter((c) => assignments.has(c)).length;
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
    assignments,
    expandedGroups,
    setExpandedGroups,

    // Data
    grouped,
    totalCount: tenantPermissions.length,
    selectedCount: assignments.size,
    groupCount: Object.keys(grouped).length,
    isLoading: loadingTenant || loadingRole,

    // Actions
    toggle,
    updateAssignment,
    toggleGroup,
    bulkUpdateScope,
    bulkScopeValue,
    setBulkScopeValue,
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,

    // Helpers
    getName,
    isChecked,
    getGroupStats,
  };
}
