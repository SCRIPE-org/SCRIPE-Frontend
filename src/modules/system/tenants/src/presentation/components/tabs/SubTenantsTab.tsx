/**
 * Sub-Tenants Tab Component
 *
 * Manages child tenants using GenericTreeView.
 * Features:
 * - Permission picker filtered by parent tenant's available permissions
 * - Parent tenant display when creating branches
 * - "Enter Tenant Details" navigation for infinite nesting
 *
 * @module tenants
 */
"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { Badge } from "@core/ui/badge";
import { LogIn, Eye } from "lucide-react";

// Generic CRUD imports
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";

// Tenant imports
import { systemContainer } from "@modules/system/di";
import { createChildrenTreeService } from "../../../data/services/TenantTreeService";
import type { TenantTreeNode } from "../../../domain/entities/Tenant";

interface SubTenantsTabProps {
      parentId: string;
      parentName: string;
      parentCode: string;
}

export function SubTenantsTab({ parentId, parentName, parentCode }: SubTenantsTabProps) {
      const { t, language } = useI18n();
      const router = useRouter();

      // Create tree service filtered by parent - shows only children of this tenant
      const treeService = useMemo(
            () => createChildrenTreeService(systemContainer.tenantRepository, parentId),
            [parentId]
      );

      // Server search for permissions - needs parentId to filter by parent's permissions
      // Returns a function factory that creates a search callback with the parent context
      const createPermissionSearch = useCallback(
            (forParentId?: string) => async (query: string): Promise<FieldOption[]> => {
                  try {
                        // Use tenantRepository.getCreationPermissions to get ONLY parent's permissions
                        // This ensures child can only have subset of parent's permissions
                        let permissions = await systemContainer.tenantRepository.getCreationPermissions(forParentId);

                        // Client-side filter if there's a search query
                        if (query) {
                              const lowerQuery = query.toLowerCase();
                              permissions = permissions.filter((p) =>
                                    p.getLocalizedName(language).toLowerCase().includes(lowerQuery) ||
                                    p.code.toLowerCase().includes(lowerQuery)
                              );
                        }

                        return permissions.map((p) => {
                              const stableCode = p.code || `${p.resource}.${p.action}`;
                              return {
                                    value: p.id,
                                    label: `${p.getLocalizedName(language)} (${stableCode})`,
                                    uniqueKey: stableCode,
                              };
                        });
                  } catch {
                        return [];
                  }
            },
            [language]
      );

      // Handler for entering tenant world - navigates to detail page
      const handleEnterTenantWorld = useCallback(
            (node: TenantTreeNode) => {
                  router.push(`/tenants/${node.id}`);
            },
            [router]
      );

      // Custom actions for tenant nodes
      const customActions = useMemo(() => {
            return (node: TenantTreeNode) => [
                  {
                        label: t("common.view") || "View",
                        onClick: () => router.push(`/tenants/${node.id}`),
                        icon: <Eye className="h-4 w-4" />,
                  },
                  {
                        label: t("tenant.enterTenantWorld") || "Enter Tenant Details",
                        onClick: () => handleEnterTenantWorld(node),
                        icon: <LogIn className="h-4 w-4" />,
                        requiredPermission: SYSTEM_PERMISSIONS.TENANTS_VIEW_DETAILS,
                  },
            ];
      }, [t, handleEnterTenantWorld]);

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

                  // Show parent tenant info when creating (read-only display)
                  if (!editing) {
                        // Determine the actual parent: either a node in the tree or the detail page's tenant
                        const actualParentName = parentForNew?.name || parentName;
                        const actualParentCode = parentForNew?.code || parentCode;
                        const actualParentId = parentForNew?.id || parentId;

                        fields.push({
                              name: "parentDisplay",
                              label: t("tenant.parentTenant") || "Parent Tenant",
                              type: "text",
                              placeholder: "",
                              required: false,
                              disabled: true,
                              defaultValue: `${actualParentName} (${actualParentCode})`,
                        });

                        // Permissions multi-select - filtered by direct parent's permissions
                        fields.push({
                              name: "availablePermissionIds",
                              label: t("tenant.selectPermissions"),
                              type: "multi-select",
                              placeholder: t("tenant.selectPermissionsDesc"),
                              searchPlaceholder: t("permission.searchPlaceholder") || "Search permissions...",
                              required: false,
                              searchType: "server",
                              // Pass the actual parent's ID to filter permissions correctly
                              onServerSearch: createPermissionSearch(actualParentId),
                              debounceMs: 300,
                              allowClear: true,
                              noResultsText: t("tenant.noPermissionsAvailable"),
                        });
                  }

                  return fields;
            },
            [t, createPermissionSearch, parentId, parentName, parentCode]
      );

      // Tree view model with full form support
      const viewModel = useTreeViewModel(treeService, {
            queryKey: ["tenants", "tree", parentId],
            itemTypeName: t("tenant.title"),
            itemTypeNamePlural: "tenants",
            getItemDisplayName: (node) => node.name,
            getFormFieldName: (node) => node.name,
            getInitialFormValues: (item, parent) => ({
                  name: item?.name || "",
                  code: item?.code || "",
                  description: item?.description || "",
                  isActive: item?.isActive ?? true,
                  parentId: parent?.id || item?.parentId || parentId,
                  availablePermissionIds: [] as string[],
            }),
            createFormData: (values) => ({
                  name: values.name,
                  code: values.code,
                  description: values.description || undefined,
                  parentId: values.parentId || parentId,
                  availablePermissionIds: values.availablePermissionIds || [],
            }),
            updateFormData: (values) => ({
                  name: values.name,
                  description: values.description || undefined,
                  isActive: values.isActive,
            }),
      });

      return (
            <div className="space-y-4">
                  <div className="flex items-center justify-between">
                        <div>
                              <h3 className="text-lg font-semibold">
                                    {t("tenant.manageSubTenants")}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                    {t("tenant.subTenantsDescription") ||
                                          `Child tenants under ${parentName}`}
                              </p>
                        </div>
                  </div>
                  <div className="border rounded-lg p-4">
                        <GenericTreeView
                              viewModel={viewModel}
                              title=""
                              subtitle=""
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
                  </div>
            </div>
      );
}
