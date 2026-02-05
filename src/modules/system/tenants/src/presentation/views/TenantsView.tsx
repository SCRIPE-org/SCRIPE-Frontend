/**
 * Tenants View (Refactored)
 *
 * Uses GenericTreeView for tenant hierarchy management.
 * Clicking "Enter Tenant" navigates to the full detail page.
 * Supports permission assignment during tenant creation via repository.
 *
 * Clean Architecture: View calls ViewModel, ViewModel calls Repository
 *
 * @module tenants
 */
"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { useAppStore } from "@core/store/useAppStore";
import { systemContainer } from "@modules/system/di";
import { createTenantTreeService, createMyChildrenTreeService } from "../../data/services/TenantTreeService";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import type {
      CreateTenantRequest,
      UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import { Badge } from "@core/ui/badge";
import { LogIn } from "lucide-react";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";

// ============================================
// TenantsView Component
// ============================================

export function TenantsView() {
      const router = useRouter();
      const { t, language } = useI18n();
      const { canEnterTenantWorld } = useTenantContext();
      const user = useAppStore((state) => state.user);

      // System admins (with 'super' or 'system' in adminTypeName) see full tree
      // Tenant admins see only their children
      const isSystemAdmin = useMemo(() => {
            const adminType = user?.adminTypeName?.toLowerCase() || '';
            return adminType.includes('super') || adminType.includes('system');
      }, [user]);

      // Create tree service based on user type:
      // - System admin: Full tree (getTree)
      // - Tenant admin: My children only (getMyChildren)
      const treeService = useMemo(
            () => isSystemAdmin
                  ? createTenantTreeService(systemContainer.tenantRepository)
                  : createMyChildrenTreeService(systemContainer.tenantRepository),
            [isSystemAdmin]
      );

      // Server search for permissions - needs parentId to filter by parent's permissions
      // Returns a function factory that creates a search callback with the parent context
      const createPermissionSearch = useCallback(
            (parentId?: string) => async (query: string): Promise<FieldOption[]> => {
                  try {
                        // Use tenantRepository.getCreationPermissions with search query
                        // This leverages the server-side filtering we implemented
                        const permissions = await systemContainer.tenantRepository.getCreationPermissions(parentId, query);


                        return permissions.map((p) => {
                              // Use stable code for deduplication (uniqueKey)
                              // because ID changes between requests due to encryption/rotation
                              const stableCode = p.code || `${p.resource}.${p.action}`;
                              return {
                                    value: p.id,          // ID is sent to backend (for decryption)
                                    label: `${p.getLocalizedName(language)} (${stableCode})`,
                                    uniqueKey: stableCode, // Code is used for deduplication
                              };
                        });
                  } catch {
                        return [];
                  }
            },
            [language]
      );

      // Form fields configuration function
      const getFormFields = useCallback(
            (
                  formValues: Record<string, unknown>,
                  setFormValues: (values: Record<string, unknown>) => void,
                  editing: TenantTreeNode | null,
                  parentForNew: TenantTreeNode | null
            ): FieldConfig[] => {
                  const fields: FieldConfig[] = [
                        {
                              name: "name",
                              label: t("tenant.name"),
                              type: "text",
                              placeholder: t("tenant.namePlaceholder"),
                              required: true,
                        },
                  ];

                  // Only show code field for new tenants
                  if (!editing) {
                        fields.push({
                              name: "code",
                              label: t("tenant.code"),
                              type: "text",
                              placeholder: t("tenant.codePlaceholder"),
                              required: true,
                        });
                  }

                  fields.push({
                        name: "description",
                        label: t("tenant.descriptionLabel"),
                        type: "textarea",
                        placeholder: t("tenant.descriptionPlaceholder"),
                        required: false,
                  });

                  // Show active toggle only when editing
                  if (editing) {
                        fields.push({
                              name: "isActive",
                              label: t("tenant.activeStatus"),
                              type: "switch",
                              placeholder: "",
                              required: false,
                        });
                  }

                  // Show parent tenant info when creating under a parent (read-only display)
                  if (!editing && parentForNew) {
                        fields.push({
                              name: "parentDisplay",
                              label: t("tenant.parentTenant") || "Parent Tenant",
                              type: "text",
                              placeholder: "",
                              required: false,
                              disabled: true,
                              defaultValue: `${parentForNew.name} (${parentForNew.code})`,
                        });
                  }

                  // Show permissions multi-select only when creating
                  if (!editing) {
                        fields.push({
                              name: "availablePermissionIds",
                              label: t("tenant.selectPermissions"),
                              type: "multi-select",
                              placeholder: t("tenant.selectPermissionsDesc"),
                              searchPlaceholder: t("permission.searchPlaceholder") || "Search permissions...",
                              required: false,
                              searchType: "server",
                              // Pass parentId to filter permissions by parent tenant's available permissions
                              onServerSearch: createPermissionSearch(parentForNew?.id),
                              debounceMs: 300,
                              allowClear: true,
                              noResultsText: t("tenant.noPermissionsAvailable"),
                        });
                  }

                  return fields;
            },
            [t, createPermissionSearch]
      );

      // Tree view model
      const viewModel = useTreeViewModel(treeService, {
            queryKey: ["tenants", "tree"],
            itemTypeName: t("tenant.title"),
            itemTypeNamePlural: "tenants",
            getItemDisplayName: (node) => node.name,
            getFormFieldName: (node) => node.name,
            getInitialFormValues: (item, parent) => ({
                  name: item?.name || "",
                  code: item?.code || "",
                  description: item?.description || "",
                  isActive: item?.isActive ?? true,
                  parentId: parent?.id || item?.parentId,
                  availablePermissionIds: [] as string[],
            }),
            createFormData: (values) =>
                  ({
                        name: values.name,
                        code: values.code,
                        description: values.description || undefined,
                        parentId: values.parentId,
                        availablePermissionIds: values.availablePermissionIds || [],
                  }) as CreateTenantRequest,
            updateFormData: (values) =>
                  ({
                        name: values.name,
                        description: values.description || undefined,
                        isActive: values.isActive,
                  }) as UpdateTenantRequest,
      });

      // Handler for entering tenant world - navigates to detail page
      const handleEnterTenantWorld = useCallback(
            (node: TenantTreeNode) => {
                  router.push(`/tenants/${node.id}`);
            },
            [router]
      );

      // Custom actions for tenant nodes
      const customActions = useMemo(() => {
            if (!canEnterTenantWorld) return undefined;

            return (node: TenantTreeNode) => [
                  {
                        label: t("tenant.enterTenantWorld"),
                        onClick: () => handleEnterTenantWorld(node),
                        icon: <LogIn className="h-4 w-4" />,
                  },
            ];
      }, [canEnterTenantWorld, t, handleEnterTenantWorld]);

      return (
            <GenericTreeView
                  viewModel={viewModel}
                  title={t("tenant.title")}
                  subtitle={t("tenant.description")}
                  getId={(node) => node.id}
                  getLabel={(node) => (
                        <>
                              {node.name}
                              <span className="text-muted-foreground text-xs ms-2">
                                    ({node.code})
                              </span>
                              <Badge
                                    variant={node.isActive ? "success" : "secondary"}
                                    className="ms-2"
                              >
                                    {node.isActive ? t("tenant.active") : t("tenant.inactive")}
                              </Badge>
                        </>
                  )}
                  getChildren={(node) => node.children}
                  renderFormFields={getFormFields}
                  resource="tenants"
                  customActions={customActions}
            />
      );
}
