/* eslint-disable @typescript-eslint/no-explicit-any */
// FILE-EXCEPTION: file length
/**
 * Role Permissions Dialog ViewModel
 *
 * Encapsulates all logic for managing role permissions.
 * Following SOLID pattern - single responsibility for permissions logic.
 *
 * Clean Architecture: ViewModel → Repository → Service → API
 * No direct API calls or inline DTOs.
 *
 * GROUPING IS 100% BACKEND-DRIVEN:
 * - getTenantAvailablePermissionsGrouped returns PermissionModuleGroup[] (Module → Category → Permissions)
 * - Zero client-side reduce / useMemo groupBy in this viewmodel
 * - Client-side only: search FILTER (structure-preserving, not grouping)
 *
 * @module roles/presentation/viewmodels
 */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { identityContainer } from "@modules/identity/di";
import type { Role } from "../../domain/entities/Role";
import type { Permission, PermissionModuleGroup } from "@modules/identity/core";
import type { PermissionAssignmentJson } from "../../domain/types/PermissionTypes";
import { PermissionScopes } from "../../domain/types/PermissionTypes";

// ── Props & Result interfaces ──

/**
 * Interface defining property specifications, keys types, and structural contract rules for use role permissions dialog props.
 */
export interface UseRolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  tenantId?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for use role permissions dialog result.
 */
export interface UseRolePermissionsDialogResult {
  // State
  search: string;
  setSearch: (value: string) => void;
  assignments: Map<string, PermissionAssignmentJson>;
  /** Check if a module card is expanded. */
  isModuleExpanded: (moduleKey: string) => boolean;
  /** Toggle a single module open/closed without affecting others. */
  toggleModule: (moduleKey: string) => void;
  /** Per-module expanded category keys. Record<moduleKey, categoryKey[]>.
   *  Each module's inner accordion reads only its own slice. */
  expandedGroups: Record<string, string[]>;
  /** Update one module's open categories without touching any other module. */
  setModuleExpanded: (moduleKey: string, openKeys: string[]) => void;

  // Data — backend-grouped, client-search-filtered (NO client-side groupBy)
  groupedModules: PermissionModuleGroup[];
  totalCount: number;
  selectedCount: number;
  isLoading: boolean;
  adminCount: number;
  changesCount: { added: number; removed: number };
  isDirty: boolean;

  // Actions
  toggle: (code: string) => void;
  updateAssignment: (code: string, assignment: PermissionAssignmentJson) => void;
  toggleGroup: (codes: string[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
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

/**
 * React hook/ViewModel orchestrating state and data flows for role permissions dialog.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useRolePermissionsDialog({
  open,
  onOpenChange,
  role,
  tenantId,
}: UseRolePermissionsDialogProps): UseRolePermissionsDialogResult {
  const { t, language } = useI18n();
  const { toast } = useEnhancedToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [assignments, setAssignments] = useState<Map<string, PermissionAssignmentJson>>(new Map());
  const [initialKeys, setInitialKeys] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, string[]>>({});
  const [bulkScopeValue, setBulkScopeValue] = useState<string>("");

  // Track which role we have already initialized assignments for
  const [initializedRoleId, setInitializedRoleId] = useState<string | null>(null);

  // ── Reset state when dialog closes ──
  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setSearch("");
        setAssignments(new Map());
        setInitialKeys(new Set());
        setExpandedModules(new Set());
        setExpandedGroups({});
        setBulkScopeValue("");
        setInitializedRoleId(null);
      });
    }
  }, [open]);

  // ── Effective Tenant Scope Resolution ──
  // If tenantId was explicitly passed, use it; otherwise fall back to role's tenantId.
  const effectiveTenantId = tenantId || role?.tenantId;

  // ── Fetch available permissions GROUPED from backend ──
  // If a tenant scope exists, fetch tenant's active licensed permissions.
  // Otherwise, fetch system-wide / myTenant available permissions.
  const { data: tenantPermissionGroups = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-permissions-grouped", effectiveTenantId ?? "platform"],
    queryFn: () => {
      if (effectiveTenantId) {
        return identityContainer.roleRepository.getTenantAvailablePermissionsGrouped(
          effectiveTenantId
        );
      }
      return identityContainer.roleRepository.getMyTenantAvailablePermissionsGrouped();
    },
    enabled: open,
  });

  // Flat permission list derived from groups (for toggle/lookup logic only)
  const allPermissions = useMemo((): Permission[] => {
    return tenantPermissionGroups.flatMap((m) => m.categories.flatMap((c) => c.permissions));
  }, [tenantPermissionGroups]);

  // ── Fetch role's current permissions ──
  const { data: rolePermissions = [], isLoading: loadingRole } = useQuery({
    queryKey: ["role-permissions", role?.id],
    queryFn: async () => {
      if (!role) return [];
      return identityContainer.roleRepository.getRolePermissions(role.id);
    },
    enabled: open && !!role?.id,
  });

  // ── Blast Radius: Count of Admins holding this role ──
  const { data: adminCount = 0 } = useQuery({
    queryKey: ["role-admin-count", role?.id],
    queryFn: () => (role?.id ? identityContainer.roleRepository.getAdminCount(role.id) : 0),
    enabled: open && !!role?.id,
  });

  // ── Initialize assignments from role's permissions (once per role) ──
  useEffect(() => {
    if (!open || !role?.id) return;
    if (loadingRole || loadingTenant) return;
    if (initializedRoleId === role.id) return;

    const validCodes = new Map<string, string>(); // code → id
    allPermissions.forEach((p) => validCodes.set(p.code, p.id));

    const newAssignments = new Map<string, PermissionAssignmentJson>();
    const groupsWithSelection = new Set<string>();

    rolePermissions.forEach((rp: any) => {
      const code = rp.permissionCode || rp.PermissionCode || rp.code || rp.Code;
      const permId = rp.permissionId || rp.PermissionId || rp.id || rp.Id;
      if (!code) return;

      newAssignments.set(code, {
        permissionId: permId || validCodes.get(code) || "",
        scopeOverride: rp.scope ?? rp.scopeOverride ?? rp.ScopeOverride,
        restrictedFields: (() => {
          if (!rp.restrictedFields || rp.restrictedFields === "null" || rp.restrictedFields === "")
            return [];
          if (Array.isArray(rp.restrictedFields)) return rp.restrictedFields;
          try {
            return JSON.parse(rp.restrictedFields);
          } catch {
            return [];
          }
        })(),
      });

      const permissionDef = allPermissions.find((p) => p.code === code);
      if (permissionDef) {
        const mod = permissionDef.module || "General";
        const cat = permissionDef.category || permissionDef.resource || "General";
        groupsWithSelection.add(`${mod}-${cat}`);
      }
    });

    const perModuleExpanded: Record<string, string[]> = {};
    const modulesWithSelection = new Set<string>();
    groupsWithSelection.forEach((key) => {
      const dashIdx = key.indexOf("-");
      const mod = dashIdx !== -1 ? key.slice(0, dashIdx) : key;
      perModuleExpanded[mod] = [...(perModuleExpanded[mod] ?? []), key];
      modulesWithSelection.add(mod);
    });

    queueMicrotask(() => {
      setAssignments(newAssignments);
      setInitialKeys(new Set(newAssignments.keys()));
      setExpandedModules(new Set(modulesWithSelection));
      setExpandedGroups(perModuleExpanded);
      setInitializedRoleId(role.id);
    });
  }, [
    open,
    role?.id,
    allPermissions,
    rolePermissions,
    loadingRole,
    loadingTenant,
    initializedRoleId,
  ]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!role) throw new Error("No role selected");

      const permissions = Array.from(assignments.entries())
        .map(([code, a]) => {
          const permId = a.permissionId || allPermissions.find((p) => p.code === code)?.id;
          return {
            permissionId: permId,
            scopeOverride: a.scopeOverride ?? null,
            restrictedFields: a.restrictedFields ?? [],
          };
        })
        .filter(
          (
            a
          ): a is {
            permissionId: string;
            scopeOverride: string | null;
            restrictedFields: string[];
          } => !!a.permissionId
        );

      await identityContainer.roleRepository.assignPermissions(role.id, {
        permissions: permissions,
      });
    },
    onSuccess: () => {
      toast({ title: t("role.permissionsSaved") });
      queryClient.invalidateQueries({ queryKey: ["role-permissions", role?.id] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t("role.permissionsSaveError"),
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
        const permission = allPermissions.find((p) => p.code === code);
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
            const permission = allPermissions.find((p) => p.code === c);
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

  // ── Per-module expand state updater ──
  const setModuleExpanded = (moduleKey: string, openKeys: string[]) => {
    setExpandedGroups((prev) => ({ ...prev, [moduleKey]: openKeys }));
  };

  // ── Toggle a single module open/closed (manual — no Radix interference) ──
  const toggleModule = (moduleKey: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return next;
    });
  };

  const isModuleExpanded = (moduleKey: string) => expandedModules.has(moduleKey);

  // Expand / Collapse ALL — controls both module-level AND category-level
  const expandAll = () => {
    const allModuleKeys = new Set(tenantPermissionGroups.map((m) => m.module));
    const perModule: Record<string, string[]> = {};
    tenantPermissionGroups.forEach((m) => {
      perModule[m.module] = m.categories.map((c) => `${m.module}-${c.category}`);
    });
    setExpandedModules(allModuleKeys);
    setExpandedGroups(perModule);
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
    setExpandedGroups({});
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

  // ── Client-side SEARCH FILTER only — preserves group structure from backend ──
  // This is NOT a grouping operation. It's a UI filter that keeps the Module→Category→Permission
  // tree intact while hiding non-matching items. The hierarchy itself comes from the backend.
  const groupedModules = useMemo((): PermissionModuleGroup[] => {
    if (!search.trim()) return tenantPermissionGroups;

    const q = search.toLowerCase();
    return tenantPermissionGroups
      .map((moduleGroup) => ({
        ...moduleGroup,
        categories: moduleGroup.categories
          .map((categoryGroup) => ({
            ...categoryGroup,
            permissions: categoryGroup.permissions.filter((p) => {
              const name = p.getLocalizedName(language);
              return name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
            }),
          }))
          .filter((c) => c.permissions.length > 0),
      }))
      .filter((m) => m.categories.length > 0);
  }, [tenantPermissionGroups, search, language]);

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

  const changesCount = useMemo(() => {
    let added = 0;
    let removed = 0;
    for (const key of assignments.keys()) {
      if (!initialKeys.has(key)) added++;
    }
    for (const key of initialKeys) {
      if (!assignments.has(key)) removed++;
    }
    return { added, removed };
  }, [assignments, initialKeys]);

  const isDirty = changesCount.added > 0 || changesCount.removed > 0;

  return {
    // State
    search,
    setSearch,
    assignments,
    isModuleExpanded,
    toggleModule,
    expandedGroups,
    setModuleExpanded,

    // Data — backend-grouped, client-search-filtered
    groupedModules,
    totalCount: allPermissions.length,
    selectedCount: assignments.size,
    isLoading: loadingTenant || loadingRole,
    adminCount,
    changesCount,
    isDirty,

    // Actions
    toggle,
    updateAssignment,
    toggleGroup,
    expandAll,
    collapseAll,
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
