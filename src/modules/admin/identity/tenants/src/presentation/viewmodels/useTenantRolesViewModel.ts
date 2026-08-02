// FILE-EXCEPTION: file length
/**
 * Tenant Roles ViewModel
 *
 * Orchestrator ViewModel for managing roles within a tenant.
 * Follows SOLID principles: composes existing ViewModels and provides
 * all data/operations for the TenantRolesTab View.
 *
 * Architecture: View → ViewModel → Repository → Service → API
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveBilingualLabel } from "@core/common/utils";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";

// Role module imports (cross-module boundary via public API)
import { Role, useRolesViewModel } from "@modules/identity/core";

// DI Container
import { identityContainer } from "@modules/identity/di";

interface UseTenantRolesViewModelParams {
  tenantId: string;
  tenantName: string;
}

/**
 * Result interface for the ViewModel
 * Defines exactly what the View receives - Interface Segregation Principle
 */
export interface TenantRolesViewModelResult {
  // Core CRUD ViewModel (delegated)
  rolesVm: ReturnType<typeof useRolesViewModel>;

  // Permissions Dialog State
  selectedRoleForPermissions: Role | null;
  permissionsDialogOpen: boolean;
  openPermissionsDialog: (role: Role) => void;
  closePermissionsDialog: () => void;

  // Form Fields (Dynamic based on create/edit)
  createFields: FieldConfig[];
  editFields: FieldConfig[];

  // Initial Values
  createInitialValues: Record<string, unknown>;
  getEditInitialValues: (item: Role) => Record<string, unknown>;

  // Table Columns Config
  columns: Array<{
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, item?: Role) => React.ReactNode;
  }>;

  // Resync permissions
  resyncPermissions: () => void;
  isResyncing: boolean;

  // Labels & Metadata
  title: string;
  subtitle: string;
  tenantId: string;
}

/**
 * React hook/ViewModel orchestrating state and data flows for tenant roles view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantRolesViewModel({
  tenantId,
  tenantName,
}: UseTenantRolesViewModelParams): TenantRolesViewModelResult {
  const { t, language } = useI18n();

  // Delegate to core roles ViewModel - Dependency Inversion Principle
  const rolesVm = useRolesViewModel({ tenantId });

  // ─────────────────────────────────────────────────────────────────
  // Permissions Dialog State - Single Responsibility (dialog management)
  // ─────────────────────────────────────────────────────────────────
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);

  const openPermissionsDialog = useCallback((role: Role) => {
    setSelectedRoleForPermissions(role);
    setPermissionsDialogOpen(true);
  }, []);

  const closePermissionsDialog = useCallback(() => {
    setPermissionsDialogOpen(false);
    setSelectedRoleForPermissions(null);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  // Permission Search - Fetches tenant's available permissions
  // ─────────────────────────────────────────────────────────────────
  const createPermissionSearch = useCallback(
    () =>
      async (query: string): Promise<FieldOption[]> => {
        try {
          // Use tenantService to get tenant's available permissions
          const permissions = await identityContainer.tenantService.getTenantPermissions(tenantId);

          // Client-side filter if there's a search query
          let filtered = permissions;
          if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = permissions.filter((p) => {
              const name = resolveBilingualLabel(p.nameEn ?? "", p.nameAr || p.nameEn || "", language);
              return (
                name?.toLowerCase().includes(lowerQuery) ||
                p.permissionCode?.toLowerCase().includes(lowerQuery)
              );
            });
          }

          return filtered.map((p) => {
            const name = resolveBilingualLabel(p.nameEn ?? "", p.nameAr || p.nameEn || "", language);
            const code = p.permissionCode || `${p.resource}.${p.action}`;
            return {
              value: p.id,
              label: `${name} (${code})`,
              uniqueKey: code,
            };
          });
        } catch {
          return [];
        }
      },
    [tenantId, language]
  );

  // ─────────────────────────────────────────────────────────────────
  // Create Form Fields - includes permission picker
  // ─────────────────────────────────────────────────────────────────
  const createFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "nameEn",
        label: t("roles.nameEn"),
        type: "text",
        placeholder: t("role.namePlaceholder"),
        required: true,
      },
      {
        name: "nameAr",
        label: t("roles.nameAr"),
        type: "text",
        placeholder: t("roles.nameArPlaceholder"),
        required: true,
      },
      {
        name: "code",
        label: t("role.code"),
        type: "text",
        placeholder: t("role.codePlaceholder"),
        required: true,
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn"),
        type: "textarea",
        placeholder: t("role.descriptionPlaceholder"),
        required: false,
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr"),
        type: "textarea",
        placeholder: t("roles.descriptionArPlaceholder"),
        required: false,
      },
      {
        name: "priority",
        label: t("role.priority"),
        type: "number",
        placeholder: "100",
        required: false,
      },
      {
        name: "permissionIds",
        label: t("role.selectPermissions"),
        type: "multi-select",
        placeholder: t("role.selectPermissionsPlaceholder"),
        searchPlaceholder: t("permission.searchPlaceholder"),
        required: false,
        searchType: "server",
        onServerSearch: createPermissionSearch(),
        debounceMs: 300,
        allowClear: true,
        noResultsText: t("permission.noPermissionsFound"),
      },
    ],
    [t, createPermissionSearch]
  );

  // ─────────────────────────────────────────────────────────────────
  // Edit Form Fields - basic fields (permissions via dialog)
  // ─────────────────────────────────────────────────────────────────
  const editFields: FieldConfig[] = useMemo(
    () => [
      {
        name: "nameEn",
        label: t("roles.nameEn"),
        type: "text",
        placeholder: t("role.namePlaceholder"),
        required: true,
      },
      {
        name: "nameAr",
        label: t("roles.nameAr"),
        type: "text",
        placeholder: t("roles.nameArPlaceholder"),
        required: true,
      },
      {
        name: "descriptionEn",
        label: t("roles.descriptionEn"),
        type: "textarea",
        placeholder: t("role.descriptionPlaceholder"),
        required: false,
      },
      {
        name: "descriptionAr",
        label: t("roles.descriptionAr"),
        type: "textarea",
        placeholder: t("roles.descriptionArPlaceholder"),
        required: false,
      },
      {
        name: "priority",
        label: t("role.priority"),
        type: "number",
        placeholder: "100",
        required: false,
      },
    ],
    [t]
  );

  // ─────────────────────────────────────────────────────────────────
  // Table Columns Configuration
  // ─────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        key: "name",
        label: t("role.name"),
        sortable: true,
      },
      {
        key: "code",
        label: t("role.code"),
      },
      {
        key: "description",
        label: t("role.description"),
      },
      {
        key: "priority",
        label: t("role.priority"),
        sortable: true,
      },
      {
        key: "groups",
        label: t("roles.groups"),
      },
      {
        key: "createdAt",
        label: t("role.createdAt"),
      },
    ],
    [t]
  );

  // ─────────────────────────────────────────────────────────────────
  // Initial Values
  // ─────────────────────────────────────────────────────────────────
  const createInitialValues = useMemo(
    () => ({
      name: "",
      code: "",
      description: "",
      priority: 100,
      permissionIds: [] as string[],
    }),
    []
  );

  const getEditInitialValues = useCallback(
    (item: Role) => ({
      name: resolveBilingualLabel(item.nameEn, item.nameAr, language),
      description: resolveBilingualLabel(item.descriptionEn ?? "", item.descriptionAr ?? "", language),
      priority: item.priority,
    }),
    [language]
  );

  // ─────────────────────────────────────────────────────────────────
  // Labels
  // ─────────────────────────────────────────────────────────────────
  const title = t("tenant.manageRoles");
  const subtitle = t("tenant.rolesDescription").replace("{tenant}", tenantName);

  // ─────────────────────────────────────────────────────────────────
  // Resync permissions mutation
  // ─────────────────────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const resyncMutation = useMutation({
    mutationFn: () => identityContainer.tenantService.resyncPermissions(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-permissions-raw", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenant-current-permissions-service", tenantId] });
      toastSuccess({
        title: t("tenant.permissionsResynced"),
      });
    },
    onError: (err: Error) => {
      toastError({ title: t("common.error"), description: err.message });
    },
  });

  return {
    // Core ViewModel
    rolesVm,

    // Dialog State
    selectedRoleForPermissions,
    permissionsDialogOpen,
    openPermissionsDialog,
    closePermissionsDialog,

    // Form Configuration
    createFields,
    editFields,
    createInitialValues,
    getEditInitialValues,

    // Table Configuration
    columns,

    // Resync
    resyncPermissions: () => resyncMutation.mutate(),
    isResyncing: resyncMutation.isPending,

    // Metadata
    title,
    subtitle,
    tenantId,
  };
}
