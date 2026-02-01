/**
 * Tenants View (Refactored)
 *
 * Uses GenericTreeView for tenant hierarchy management.
 * Clicking "Enter Tenant" navigates to the full detail page.
 *
 * @module tenants
 */
"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { systemContainer } from "@modules/system/di";
import { createTenantTreeService } from "../../data/services/TenantTreeService";
import type { TenantTreeNode } from "../../domain/entities/Tenant";
import type { CreateTenantRequest, UpdateTenantRequest } from "../../domain/entities/TenantRequests";
import { Badge } from "@core/ui/badge";
import { LogIn } from "lucide-react";

// ============================================
// Form Field Configuration
// ============================================

const getTenantFormFields = (
      t: (key: string) => string,
      formValues: any,
      setFormValues: (values: any) => void,
      editing: TenantTreeNode | null,
      parentForNew: TenantTreeNode | null
): Array<{
      name: string;
      label: string;
      type: string;
      placeholder: string;
      required: boolean;
}> => {
      const fields: Array<{
            name: string;
            label: string;
            type: string;
            placeholder: string;
            required: boolean;
      }> = [
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

      return fields;
};

// ============================================
// TenantsView Component
// ============================================

export function TenantsView() {
      const router = useRouter();
      const { t } = useI18n();
      const { canEnterTenantWorld } = useTenantContext();

      // Create tree service from repository
      const treeService = useMemo(
            () => createTenantTreeService(systemContainer.tenantRepository),
            []
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
            }),
            createFormData: (values) =>
            ({
                  name: values.name,
                  code: values.code,
                  description: values.description || undefined,
                  parentId: values.parentId,
            } as CreateTenantRequest),
            updateFormData: (values) =>
            ({
                  name: values.name,
                  description: values.description || undefined,
                  isActive: values.isActive,
            } as UpdateTenantRequest),
      });

      // Handler for entering tenant world - now navigates to detail page
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
                  renderFormFields={(formValues, setFormValues, editing, parentForNew) =>
                        getTenantFormFields(t, formValues, setFormValues, editing, parentForNew)
                  }
                  resource="tenants"
                  customActions={customActions}
            />
      );
}
