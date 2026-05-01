/**
 * Tenant Permissions Dialog ViewModel
 *
 * FOLLOWS PATTERN from useTenantRolesViewModel.ts as requested.
 * - Uses systemContainer.tenantService (not direct API)
 * - Robust permission mapping logic with fallback
 * - Merges tenantAssignedPermissions into available pool to ensure visibility
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "@core/common/logger";
import { systemContainer } from "@modules/identity/di";

// Types matching actual API responses (EXACT same as role dialog)
export interface ParentPermission {
  id: string;
  resource: string;
  action: string;
  code: string;
  defaultScope: string;
  description?: string;
  nameEn?: string;
  nameAr?: string;
}

export interface TenantCurrentPermission {
  id: string;
  resource: string;
  action: string;
  code: string;
  defaultScope: string;
  description?: string;
  nameEn?: string;
  nameAr?: string;
}

export interface GroupedPermissions {
  [resource: string]: ParentPermission[];
}

export interface UseTenantPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  tenantName: string;
  parentTenantId?: string | null;
}

export interface UseTenantPermissionsDialogResult {
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
  hasParent: boolean;

  // Actions
  toggle: (code: string) => void;
  toggleGroup: (codes: string[]) => void;
  save: () => void;
  isSaving: boolean;

  // Helpers
  getName: (p: ParentPermission) => string;
  isChecked: (code: string) => boolean;
  getGroupStats: (codes: string[]) => {
    count: number;
    total: number;
    allChecked: boolean;
    someChecked: boolean;
  };
}

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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Track if we've initialized for this tenant to prevent infinite loops
  const [initializedTenantId, setInitializedTenantId] = useState<string | null>(null);

  // Reset when dialog opens with a different tenant
  const [prevOpen, setPrevOpen] = useState(open);
  const [prevTenantId, setPrevTenantId] = useState(tenantId);
  const [prevInitializedTenantId, setPrevInitializedTenantId] = useState(initializedTenantId);

  if (
    open !== prevOpen ||
    tenantId !== prevTenantId ||
    initializedTenantId !== prevInitializedTenantId
  ) {
    setPrevOpen(open);
    setPrevTenantId(tenantId);
    setPrevInitializedTenantId(initializedTenantId);

    if (open && tenantId && tenantId !== initializedTenantId) {
      setSearch("");
      setSelectedCodes(new Set());
      setExpandedGroups([]);
      setInitializedTenantId(null);
    }
    if (!open) {
      setInitializedTenantId(null);
    }
  }

  // Fetch PARENT's available permissions
  const { data: parentPermissions = [], isLoading: loadingParent } = useQuery({
    queryKey: ["parent-permissions-service", parentTenantId],
    queryFn: async () => {
      try {
        appLogger.debug(
          "[ViewModel] Fetching available permissions via Service, parentTenantId:",
          parentTenantId
        );

        let permissions;
        if (parentTenantId) {
          permissions = await systemContainer.tenantService.getTenantPermissions(parentTenantId);
        } else {
          // Fallback for root - creation permissions
          permissions = await systemContainer.tenantService.getCreationPermissions();
        }

        // Robust mapping logic
        return permissions.map((p: any) => ({
          id: p.id,
          resource: p.resource,
          action: p.action,
          code: p.code || p.permissionCode || `${p.resource}.${p.action}`,
          defaultScope: p.defaultScope || "own_tenant",
          description: p.description,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
        }));
      } catch (error) {
        appLogger.error("Failed to fetch available permissions", error);
        return [];
      }
    },
    enabled: open && !!tenantId,
  });

  // Fetch TENANT's current permissions
  const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
    queryKey: ["tenant-current-permissions-service", tenantId],
    queryFn: async () => {
      try {
        appLogger.debug("[ViewModel] Fetching tenant's current permissions via Service:", tenantId);

        const permissions = await systemContainer.tenantService.getTenantPermissions(tenantId);

        // Robust mapping logic
        return permissions.map((p: any) => ({
          id: p.id,
          resource: p.resource,
          action: p.action,
          code: p.code || p.permissionCode || `${p.resource}.${p.action}`,
          defaultScope: p.defaultScope || "own_tenant",
          description: p.description,
          nameEn: p.nameEn,
          nameAr: p.nameAr,
        }));
      } catch (error) {
        appLogger.error("Failed to fetch tenant permissions", error);
        return [];
      }
    },
    enabled: open && !!tenantId,
  });

  // Merge parent and tenant permissions to ensure we show what the tenant HAS,
  // even if the parent no longer has it (or data mismatch).
  const allPermissions = useMemo(() => {
    const combined = [...parentPermissions];
    const codeSet = new Set(combined.map((p) => p.code));

    tenantPermissions.forEach((p) => {
      if (!codeSet.has(p.code)) {
        combined.push(p);
        codeSet.add(p.code);
      }
    });
    return combined;
  }, [parentPermissions, tenantPermissions]);

  // Initialize selection from tenant's permissions
  const isReadyToInit =
    open &&
    !!tenantId &&
    allPermissions.length > 0 &&
    !loadingTenant &&
    initializedTenantId !== tenantId;
  const [prevIsReadyToInit, setPrevIsReadyToInit] = useState(isReadyToInit);

  if (isReadyToInit && isReadyToInit !== prevIsReadyToInit) {
    setPrevIsReadyToInit(isReadyToInit);
    // Get valid codes from ALL known permissions (parent + current)
    const validCodes = new Set(allPermissions.map((p) => p.code));

    // Get tenant's current permission codes
    const tenantCodes = tenantPermissions.map((p) => p.code);

    // Filter to only valid codes (should be all of them now)
    const selectedFromTenant = tenantCodes.filter((code) => validCodes.has(code));

    setSelectedCodes(new Set(selectedFromTenant));

    // Auto-expand groups with selected permissions
    const groupsWithSelection = new Set<string>();
    allPermissions.forEach((p) => {
      if (selectedFromTenant.includes(p.code)) {
        groupsWithSelection.add(p.resource);
      }
    });
    setExpandedGroups(Array.from(groupsWithSelection));

    // Mark as initialized for this tenant
    setInitializedTenantId(tenantId);
  } else if (!isReadyToInit && prevIsReadyToInit) {
    setPrevIsReadyToInit(isReadyToInit);
  }

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Map selected codes to IDs from all available permissions
      const selectedIds = allPermissions.filter((p) => selectedCodes.has(p.code)).map((p) => p.id);

      await systemContainer.tenantService.updateTenantPermissions(tenantId, selectedIds);
    },
    onSuccess: () => {
      toastSuccess({ title: t("tenant.permissionsSaved") || "Permissions saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["tenant-current-permissions-service", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-stats", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toastError({
        title: t("tenant.permissionsSaveError") || "Failed to save",
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

  // Filter and group permissions
  const grouped = useMemo(() => {
    const searchLower = search.toLowerCase();
    const filtered = allPermissions.filter((p) => {
      if (!search) return true;
      const name = (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;
      return name.toLowerCase().includes(searchLower) || p.code.toLowerCase().includes(searchLower);
    });

    return filtered.reduce((acc, p) => {
      const key = p.resource || "other";
      (acc[key] = acc[key] || []).push(p);
      return acc;
    }, {} as GroupedPermissions);
  }, [allPermissions, search, language]);

  // Helpers
  const getName = (p: ParentPermission) =>
    (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;

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
    expandedGroups,
    setExpandedGroups,

    // Data
    grouped,
    totalCount: allPermissions.length,
    selectedCount: selectedCodes.size,
    groupCount: Object.keys(grouped).length,
    isLoading: loadingParent || loadingTenant,
    hasParent: !!parentTenantId,

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
