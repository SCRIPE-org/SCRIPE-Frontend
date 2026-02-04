/**
 * Sub-Tenants Tab Component
 *
 * Manages child tenants using GenericTreeView.
 *
 * @module tenants
 */
"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";

// Generic CRUD imports
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";

// Tenant imports
import { systemContainer } from "@modules/system/di";
import { createChildrenTreeService } from "../../../data/services/TenantTreeService";

interface SubTenantsTabProps {
      parentId: string;
      parentName: string;
}

export function SubTenantsTab({ parentId, parentName }: SubTenantsTabProps) {
      const { t } = useI18n();

      // Create tree service filtered by parent - shows only children of this tenant
      const treeService = useMemo(
            () => createChildrenTreeService(systemContainer.tenantRepository, parentId),
            [parentId]
      );

      // Tree view model
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
            }),
            createFormData: (values) => ({
                  name: values.name,
                  code: values.code,
                  description: values.description || undefined,
                  parentTenantId: values.parentId || parentId,
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
                              renderFormFields={(formValues, setFormValues, editing) => [
                                    {
                                          name: "name",
                                          label: t("tenant.name"),
                                          type: "text",
                                          placeholder: t("tenant.namePlaceholder"),
                                          required: true,
                                    },
                                    ...(!editing
                                          ? [
                                                {
                                                      name: "code",
                                                      label: t("tenant.code"),
                                                      type: "text",
                                                      placeholder: t("tenant.codePlaceholder"),
                                                      required: true,
                                                },
                                          ]
                                          : []),
                                    {
                                          name: "description",
                                          label: t("tenant.descriptionLabel"),
                                          type: "textarea",
                                          placeholder: t("tenant.descriptionPlaceholder"),
                                          required: false,
                                    },
                              ]}
                              resource="tenants"
                        />
                  </div>
            </div>
      );
}
