/**
 * Role Permissions Dialog ViewModel
 *
 * Encapsulates all logic for managing role permissions.
 * Following SOLID pattern - single responsibility for permissions logic.
 *
 * Clean Architecture: ViewModel → Repository → Service → API
 * No direct API calls or inline DTOs.
 *
 * @module roles/presentation/viewmodels
 */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@core/hooks/use-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { systemContainer } from "@modules/identity/di";
import type { Role } from "../../domain/entities/Role";
import type { Permission } from "@modules/identity/permissions/src/domain/entities/Permission";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";
import { PermissionScopes } from "../../domain/types/PermissionTypes";

// ── Grouped permissions by resource ──

export interface GroupedPermissions {
  [resource: string]: Permission[];
}

// ── Props & Result interfaces ──

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
  getName: (p: Permission) => string;
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

  // ── Fetch tenant's available permissions via Repository (clean architecture) ──
  const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-permissions", tenantId],
    queryFn: () => systemContainer.roleRepository.getTenantAvailablePermissions(tenantId),
    enabled: open && !!tenantId,
  });

  // ── Fetch role's current permissions via Repository ──
  const { data: rolePermissions = [], isLoading: loadingRole } = useQuery({
    queryKey: ["role-permissions", role?.id],
    queryFn: async () => {
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

      rolePermissions.forEach((rp: any) => {
        if (validCodes.has(rp.permissionCode)) {
          newAssignments.set(rp.permissionCode, {
            permissionId: rp.permissionId,
            scopeOverride: rp.scope,
            restrictedFields: (() => {
              if (!rp.restrictedFields || rp.restrictedFields === "null" || rp.restrictedFields === "") return [];
              try { return JSON.parse(rp.restrictedFields); } catch { return []; }
            })(),
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
    const scopeValue = scope === PermissionScopes.Default ? undefined : scope;

    setAssignments((prev) => {
      const next = new Map(prev);
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
      const name = p.getLocalizedName(language);
      return name.toLowerCase().includes(searchLower) || p.code.toLowerCase().includes(searchLower);
    });

    return filtered.reduce((acc, p) => {
      const key = p.resource || "other";
      (acc[key] = acc[key] || []).push(p);
      return acc;
    }, {} as GroupedPermissions);
  }, [tenantPermissions, search, language]);

  // Helpers
  const getName = (p: Permission) => p.getLocalizedName(language);

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
