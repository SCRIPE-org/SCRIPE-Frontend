/**
 * Tenant Permissions Dialog ViewModel
 *
 * Encapsulates all logic for managing tenant permissions.
 * COPIED FROM working useRolePermissionsDialog pattern with tenant-specific adaptations.
 *
 * Key features:
 * - Fetches tenant's current permissions and available permissions from parent
 * - Uses `code` for matching (IDs change due to encryption)
 * - Auto-selects currently assigned permissions
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/hooks/use-toast";
import { getCoreContainer } from "@core/di";
import { systemContainer } from "@modules/system/di";

// Types matching actual API responses
export interface AvailablePermission {
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
      [resource: string]: AvailablePermission[];
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
      getName: (p: AvailablePermission) => string;
      isChecked: (code: string) => boolean;
      getGroupStats: (codes: string[]) => { count: number; total: number; allChecked: boolean; someChecked: boolean };
}

export function useTenantPermissionsDialog({
      open,
      onOpenChange,
      tenantId,
      tenantName,
      parentTenantId,
}: UseTenantPermissionsDialogProps): UseTenantPermissionsDialogResult {
      const { t, language } = useI18n();
      const { toast } = useToast();
      const queryClient = useQueryClient();

      const [search, setSearch] = useState("");
      const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
      const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

      // Track if we've initialized for this tenant to prevent infinite loops
      const initializedTenantRef = useRef<string | null>(null);

      // Reset when dialog opens with a different tenant
      useEffect(() => {
            if (open && tenantId !== initializedTenantRef.current) {
                  setSearch("");
                  setSelectedCodes(new Set());
                  setExpandedGroups([]);
                  initializedTenantRef.current = null; // Mark as not initialized
            }
            if (!open) {
                  initializedTenantRef.current = null; // Reset when dialog closes
            }
      }, [open, tenantId]);

      // Fetch AVAILABLE permissions (from parent or all for root tenants)
      const { data: availablePermissions = [], isLoading: loadingAvailable } = useQuery({
            queryKey: ["tenant-available-permissions", tenantId, parentTenantId],
            queryFn: async (): Promise<AvailablePermission[]> => {
                  console.log("[ViewModel] Fetching available permissions - tenantId:", tenantId, "parentId:", parentTenantId);
                  if (parentTenantId) {
                        // Child tenant: get PARENT's permissions as available
                        const result = await getCoreContainer().apiService.get<AvailablePermission[]>(
                              `/Tenants/${parentTenantId}/permissions`
                        );
                        console.log("[ViewModel] Parent permissions:", result?.length);
                        return result;
                  } else {
                        // Root tenant: get all creation permissions
                        const result = await getCoreContainer().apiService.get<AvailablePermission[]>(
                              `/Tenants/creation-permissions`
                        );
                        console.log("[ViewModel] Creation permissions:", result?.length);
                        return result;
                  }
            },
            enabled: open && !!tenantId,
      });

      // Fetch CURRENT tenant's assigned permissions
      const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-current-permissions", tenantId],
            queryFn: async (): Promise<TenantCurrentPermission[]> => {
                  console.log("[ViewModel] Fetching tenant's current permissions:", tenantId);
                  const result = await getCoreContainer().apiService.get<TenantCurrentPermission[]>(
                        `/Tenants/${tenantId}/permissions`
                  );
                  console.log("[ViewModel] Tenant's current permissions:", result?.length, result?.map(p => p.code));
                  return result;
            },
            enabled: open && !!tenantId,
      });

      // Initialize selection from tenant's permissions (only once per tenant)
      useEffect(() => {
            if (
                  open &&
                  tenantId &&
                  availablePermissions.length > 0 &&
                  !loadingTenant &&
                  initializedTenantRef.current !== tenantId
            ) {
                  // Get codes that are valid (exist in available)
                  const validCodes = new Set(availablePermissions.map(p => p.code));
                  // Get codes that are currently assigned to this tenant
                  const tenantCodes = tenantPermissions.map(p => p.code);
                  // Filter to only include valid codes
                  const selectedFromTenant = tenantCodes.filter(code => validCodes.has(code));

                  console.log("[ViewModel] Valid codes:", Array.from(validCodes));
                  console.log("[ViewModel] Tenant codes:", tenantCodes);
                  console.log("[ViewModel] Selected (filtered):", selectedFromTenant);

                  setSelectedCodes(new Set(selectedFromTenant));

                  // Auto-expand groups with selected permissions
                  const groupsWithSelection = new Set<string>();
                  availablePermissions.forEach(p => {
                        if (selectedFromTenant.includes(p.code)) {
                              groupsWithSelection.add(p.resource);
                        }
                  });
                  setExpandedGroups(Array.from(groupsWithSelection));

                  // Mark as initialized for this tenant
                  initializedTenantRef.current = tenantId;
            }
      }, [open, tenantId, availablePermissions, tenantPermissions, loadingTenant]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  const selectedIds = availablePermissions
                        .filter(p => selectedCodes.has(p.code))
                        .map(p => p.id);

                  console.log("[ViewModel] Saving permissions - codes:", Array.from(selectedCodes));
                  console.log("[ViewModel] Mapped to IDs:", selectedIds);

                  await systemContainer.tenantRepository.updateTenantPermissions(tenantId, selectedIds);
            },
            onSuccess: () => {
                  toast({ title: t("tenant.permissionsSaved") || "Permissions saved successfully" });
                  queryClient.invalidateQueries({ queryKey: ["tenant-current-permissions", tenantId] });
                  queryClient.invalidateQueries({ queryKey: ["tenant-permissions", tenantId] });
                  onOpenChange(false);
            },
            onError: (error: Error) => {
                  toast({
                        title: t("tenant.permissionsSaveError") || "Failed to save",
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
            const filtered = availablePermissions.filter(p => {
                  if (!search) return true;
                  const name = (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;
                  return name.toLowerCase().includes(searchLower) || p.code.toLowerCase().includes(searchLower);
            });

            return filtered.reduce((acc, p) => {
                  const key = p.resource || "other";
                  (acc[key] = acc[key] || []).push(p);
                  return acc;
            }, {} as GroupedPermissions);
      }, [availablePermissions, search, language]);

      // Helpers
      const getName = (p: AvailablePermission) =>
            (language === "ar" ? p.nameAr : p.nameEn) || p.description || p.code;

      const isChecked = (code: string) => selectedCodes.has(code);

      const getGroupStats = (codes: string[]) => {
            const count = codes.filter(c => selectedCodes.has(c)).length;
            return {
                  count,
                  total: codes.length,
                  allChecked: count === codes.length && codes.length > 0,
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
            totalCount: availablePermissions.length,
            selectedCount: selectedCodes.size,
            groupCount: Object.keys(grouped).length,
            isLoading: loadingAvailable || loadingTenant,
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
