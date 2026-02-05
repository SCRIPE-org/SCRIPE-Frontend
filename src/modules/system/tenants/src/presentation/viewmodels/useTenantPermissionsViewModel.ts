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
import { appLogger } from "@core/common/logger";
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

      const [debouncedSearch, setDebouncedSearch] = useState("");

      // Debounce search
      useEffect(() => {
            const timer = setTimeout(() => {
                  setDebouncedSearch(search);
            }, 300);
            return () => clearTimeout(timer);
      }, [search]);



      // Fetch AVAILABLE permissions (from parent or all for root tenants)
      // Fetch AVAILABLE permissions (via Repository which handles Parent vs Root logic + Search)
      const { data: availablePermissions = [], isLoading: loadingAvailable } = useQuery({
            queryKey: ["tenant-available-permissions", tenantId, parentTenantId, debouncedSearch],
            queryFn: async (): Promise<AvailablePermission[]> => {
                  appLogger.debug("[ViewModel] Fetching available permissions - tenantId:", tenantId, "search:", debouncedSearch);

                  // Repository handles the logic: if parentId -> getTenantPermissions(parent), else getCreationPermissions
                  // ... (comments removed for brevity)

                  const permissions = await systemContainer.tenantRepository.getAvailablePermissions(tenantId, parentTenantId || undefined, debouncedSearch);
                  return permissions as any as AvailablePermission[];
            },
            enabled: open && !!tenantId,
      });

      // Fetch CURRENT tenant's assigned permissions
      // We do NOT filter this by search so we always know what is currently assigned for initialization
      const { data: tenantPermissions = [], isLoading: loadingTenant } = useQuery({
            queryKey: ["tenant-current-permissions", tenantId],
            queryFn: async (): Promise<TenantCurrentPermission[]> => {
                  appLogger.debug("[ViewModel] Fetching tenant's current permissions:", tenantId);
                  const permissions = await systemContainer.tenantRepository.getTenantPermissions(tenantId);
                  return permissions as any as TenantCurrentPermission[];
            },
            enabled: open && !!tenantId,
      });

      // Map to track Code -> ID for saving (accumulates as we browse/search)
      const codeToIdRef = useRef<Map<string, string>>(new Map());

      // Update mapping when data changes
      useEffect(() => {
            [...availablePermissions, ...tenantPermissions].forEach(p => {
                  if (p.code && p.id) {
                        codeToIdRef.current.set(p.code, p.id);
                  }
            });
      }, [availablePermissions, tenantPermissions]);

      // Initialize selection from tenant's permissions (only once per tenant)
      useEffect(() => {
            if (
                  open &&
                  tenantId &&
                  // We wait for tenantPermissions to be loaded to know what is assigned
                  // We don't necessarily need availablePermissions to be fully loaded if we trust tenantPermissions codes
                  // But to be safe and ensure we only select valid codes, we might check available.
                  // HOWEVER, if available is now filtered by search, checking against it is WRONG for initialization 
                  // if we assume "Select All" or similar logic. 
                  // But for "Initial Selection", we just want to select what the tenant HAS.
                  // We should select ALL tenantPermissions codes that appear, regardless of whether they are in the current filtered available list.
                  // The Checkbox will only render if it's in available (visible).
                  // But 'selectedCodes' should hold ALL.
                  !loadingTenant &&
                  initializedTenantRef.current !== tenantId
            ) {
                  const tenantCodes = tenantPermissions.map(p => p.code);

                  appLogger.debug("[ViewModel] Initializing selection from tenant codes:", tenantCodes);

                  setSelectedCodes(new Set(tenantCodes));

                  // Update Groups to Expand based on Tenant Permissions (initial view)
                  const groupsWithSelection = new Set<string>();
                  tenantPermissions.forEach(p => {
                        groupsWithSelection.add(p.resource);
                  });
                  setExpandedGroups(Array.from(groupsWithSelection));

                  // Mark as initialized for this tenant
                  initializedTenantRef.current = tenantId;
            }
      }, [open, tenantId, tenantPermissions, loadingTenant]);

      // Save mutation
      const saveMutation = useMutation({
            mutationFn: async () => {
                  // Map selected codes to IDs using our validation map
                  const selectedIds: string[] = [];
                  const missingCodes: string[] = [];

                  selectedCodes.forEach(code => {
                        const id = codeToIdRef.current.get(code);
                        if (id) {
                              selectedIds.push(id);
                        } else {
                              missingCodes.push(code);
                        }
                  });

                  if (missingCodes.length > 0) {
                        appLogger.warn("[ViewModel] Warning: Some selected codes missing IDs:", missingCodes);
                  }

                  appLogger.debug("[ViewModel] Saving permissions - codes:", Array.from(selectedCodes));
                  appLogger.debug("[ViewModel] Mapped to IDs:", selectedIds);

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

      // Group permissions (No client-side filtering needed as backend handles it)
      const grouped = useMemo(() => {
            return availablePermissions.reduce((acc, p) => {
                  const key = p.resource || "other";
                  (acc[key] = acc[key] || []).push(p);
                  return acc;
            }, {} as GroupedPermissions);
      }, [availablePermissions]);

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
