// FILE-EXCEPTION: file length
/**
 * Tenant Permissions Dialog ViewModel
 *
 * BACKEND-GROUPED: Uses tenantRepository.getTenantPermissionsGrouped which returns
 * PermissionModuleGroup[] (Module → Category → Permissions).
 * Zero client-side reduce/useMemo groupBy in this viewmodel.
 * Client-side only: search FILTER (structure-preserving, not grouping).
 *
 * Clean Architecture: ViewModel → Repository (via DI) → Service → API
 * No direct API calls. No data-layer mapper imports.
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";
import { identityContainer } from "@modules/identity/di";
import type { Permission, PermissionModuleGroup } from "@modules/identity/core";

/**
 * Interface defining property specifications, keys types, and structural contract rules for use tenant permissions dialog props.
 */
export interface UseTenantPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  parentTenantId?: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for use tenant permissions dialog result.
 */
export interface UseTenantPermissionsDialogResult {
  // State
  search: string;
  setSearch: (value: string) => void;
  selectedCodes: Set<string>;
  /** Check if a module card is expanded. */
  isModuleExpanded: (moduleKey: string) => boolean;
  /** Toggle a single module open/closed without affecting others. */
  toggleModule: (moduleKey: string) => void;
  /** Per-module expanded category keys. */
  expandedGroups: Record<string, string[]>;
  setModuleExpanded: (moduleKey: string, openKeys: string[]) => void;

  // Data — backend-grouped, client-search-filtered (NO client-side groupBy)
  groupedModules: PermissionModuleGroup[];
  totalCount: number;
  selectedCount: number;
  isLoading: boolean;
  hasParent: boolean;

  // Actions
  toggle: (code: string) => void;
  toggleGroup: (codes: string[]) => void;
  expandAll: () => void;
  collapseAll: () => void;
  save: () => void;
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
 * React hook/ViewModel orchestrating state and data flows for tenant permissions dialog.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantPermissionsDialog({
  open,
  onOpenChange,
  tenantId,
  tenantName,
  parentTenantId,
}: UseTenantPermissionsDialogProps): UseTenantPermissionsDialogResult {
  const { t, language } = useI18n();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, string[]>>({});

  // Track which tenant we have already initialized selections for
  const [initializedTenantId, setInitializedTenantId] = useState<string | null>(null);

  // ── Reset state when dialog closes ──
  // useEffect prevents the React render-body setState anti-pattern.
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedCodes(new Set());
      setExpandedModules(new Set());
      setExpandedGroups({});
      setInitializedTenantId(null);
    }
  }, [open]);

  // ── Reset when the target tenant changes while dialog is open ──
  useEffect(() => {
    if (open && tenantId) {
      setSearch("");
      setSelectedCodes(new Set());
      setExpandedModules(new Set());
      setExpandedGroups({});
      setInitializedTenantId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  // ── Fetch PARENT's available permissions GROUPED from backend ──
  // Uses Repository (Clean Architecture), NOT direct service calls.
  // Returns PermissionModuleGroup[] (Module → Category → Permissions)
  const { data: parentPermissionGroups = [], isLoading: loadingParent } = useQuery({
    queryKey: ["parent-permissions-grouped", parentTenantId],
    queryFn: async () => {
      try {
        appLogger.debug(
          "[ViewModel] Fetching grouped permissions via Repository, parentTenantId:",
          parentTenantId
        );

        if (parentTenantId) {
          // Child tenant: get parent's permissions grouped from repository
          return identityContainer.tenantRepository.getTenantPermissionsGrouped(parentTenantId);
        } else {
          // Root tenant fallback: get creation permissions (flat), wrap as grouped
          const flatPermissions = await identityContainer.tenantRepository.getCreationPermissions();
          return groupFlatPermissions(flatPermissions);
        }
      } catch (error) {
        appLogger.error("Failed to fetch available permissions", error);
        return [];
      }
    },
    enabled: open && !!tenantId,
  });

  // ── Fetch TENANT's current permissions (flat, for selection init) ──
  // Uses Repository (Clean Architecture) — mapper is in the repo layer.
  const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-current-permissions-service", tenantId],
    queryFn: async () => {
      try {
        appLogger.debug(
          "[ViewModel] Fetching tenant's current permissions via Repository:",
          tenantId
        );
        return identityContainer.tenantRepository.getTenantPermissions(tenantId);
      } catch (error) {
        appLogger.error("Failed to fetch tenant permissions", error);
        return [];
      }
    },
    enabled: open && !!tenantId,
  });

  // Flat permission list derived from groups (for toggle/lookup logic only)
  const allPermissions = useMemo((): Permission[] => {
    return parentPermissionGroups.flatMap((m) => m.categories.flatMap((c) => c.permissions));
  }, [parentPermissionGroups]);

  // ── Initialize selected codes from tenant's permissions (once per tenant) ──
  // useEffect is the correct place for derived state initialization.
  useEffect(() => {
    if (
      !open ||
      !tenantId ||
      allPermissions.length === 0 ||
      loadingTenant ||
      initializedTenantId === tenantId
    ) {
      return;
    }

    const validCodes = new Set(allPermissions.map((p) => p.code));
    const tenantCodes = tenantPermissions.map((p) => p.code);
    const selectedFromTenant = tenantCodes.filter((code: string) => validCodes.has(code));

    setSelectedCodes(new Set(selectedFromTenant));

    // Auto-expand accordion categories that have selected permissions.
    // Key format matches AccordionItem value: `${module}-${category}`.
    const groupsWithSelection = new Set<string>();
    allPermissions.forEach((p) => {
      if (selectedFromTenant.includes(p.code)) {
        const mod = p.module || "General";
        const cat = p.category || p.resource || "General";
        groupsWithSelection.add(`${mod}-${cat}`);
      }
    });
    // Build per-module record: { [moduleKey]: categoryKey[] }
    const perModuleExpanded: Record<string, string[]> = {};
    const modulesWithSelection = new Set<string>();
    groupsWithSelection.forEach((key) => {
      const dashIdx = key.indexOf("-");
      const mod = dashIdx !== -1 ? key.slice(0, dashIdx) : key;
      perModuleExpanded[mod] = [...(perModuleExpanded[mod] ?? []), key];
      modulesWithSelection.add(mod);
    });
    setExpandedModules(new Set(modulesWithSelection));
    setExpandedGroups(perModuleExpanded);
    setInitializedTenantId(tenantId);
  }, [open, tenantId, allPermissions, tenantPermissions, loadingTenant, initializedTenantId]);

  // Save mutation — uses repository for write operations
  const saveMutation = useMutation({
    mutationFn: async () => {
      const selectedIds = allPermissions.filter((p) => selectedCodes.has(p.code)).map((p) => p.id);
      await identityContainer.tenantRepository.updateTenantPermissions(tenantId, selectedIds);
    },
    onSuccess: () => {
      toastSuccess({ title: t("tenant.permissionsSaved") });
      queryClient.invalidateQueries({ queryKey: ["tenant-current-permissions-service", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["parent-permissions-grouped"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenant.permissionsSaveError"),
        description: error.message,
      });
    },
  });

  // Toggle handlers
  const toggle = (code: string) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const toggleGroup = (codes: string[]) => {
    const allSelected = codes.every((c) => selectedCodes.has(c));
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((c) => (allSelected ? next.delete(c) : next.add(c)));
      return next;
    });
  };

  // ── Per-module expand state updater ──
  // Only touches one module's slice — all other modules remain unchanged.
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
    const allModuleKeys = new Set(parentPermissionGroups.map((m) => m.module));
    const perModule: Record<string, string[]> = {};
    parentPermissionGroups.forEach((m) => {
      perModule[m.module] = m.categories.map((c) => `${m.module}-${c.category}`);
    });
    setExpandedModules(allModuleKeys);
    setExpandedGroups(perModule);
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
    setExpandedGroups({});
  };

  // ── Client-side SEARCH FILTER only — preserves group structure from backend ──
  const groupedModules = useMemo((): PermissionModuleGroup[] => {
    if (!search.trim()) return parentPermissionGroups;

    const q = search.toLowerCase();
    return parentPermissionGroups
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
  }, [parentPermissionGroups, search, language]);

  // Helpers
  const getName = (p: Permission) => p.getLocalizedName(language);
  const isChecked = (code: string) => selectedCodes.has(code);

  const getGroupStats = (codes: string[]) => {
    const count = codes.filter((c) => selectedCodes.has(c)).length;
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
    isModuleExpanded,
    toggleModule,
    expandedGroups,
    setModuleExpanded,

    // Data — backend-grouped, client-search-filtered
    groupedModules,
    totalCount: allPermissions.length,
    selectedCount: selectedCodes.size,
    isLoading: loadingParent || loadingTenant,
    hasParent: !!parentTenantId,

    // Actions
    toggle,
    toggleGroup,
    expandAll,
    collapseAll,
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,

    // Helpers
    getName,
    isChecked,
    getGroupStats,
  };
}

/**
 * Utility: group a flat Permission[] by module → category.
 * Used ONLY as a fallback when the backend doesn't provide a grouped endpoint
 * (e.g., creation permissions for root tenants).
 */
function groupFlatPermissions(permissions: Permission[]): PermissionModuleGroup[] {
  const moduleMap = new Map<string, Map<string, Permission[]>>();

  for (const p of permissions) {
    const mod = p.module || "General";
    const cat = p.category || p.resource || "General";

    if (!moduleMap.has(mod)) moduleMap.set(mod, new Map());
    const catMap = moduleMap.get(mod)!;
    if (!catMap.has(cat)) catMap.set(cat, []);
    catMap.get(cat)!.push(p);
  }

  return Array.from(moduleMap.entries()).map(([module, catMap]) => ({
    module,
    categories: Array.from(catMap.entries()).map(([category, perms]) => ({
      category,
      permissions: perms,
    })),
  }));
}
