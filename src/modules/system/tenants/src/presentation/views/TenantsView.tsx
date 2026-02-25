/**
 * Tenants View (Refactored)
 *
 * Uses GenericTreeView for tenant hierarchy management.
 * Clicking "Enter Tenant" navigates to the full detail page.
 * Supports permission assignment during tenant creation via repository.
 * Delete uses TenantDeleteDialog with cascade support.
 *
 * Clean Architecture: View calls ViewModel, ViewModel calls Repository
 *
 * @module tenants
 */
"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GenericTreeView } from "@core/crud/components/generic-tree-view";
import { useTreeViewModel } from "@core/hooks/use-tree-view-model";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { systemContainer } from "@modules/system/di";
import {
  createTenantTreeService,
  createMyChildrenTreeService,
} from "../../data/services/TenantTreeService";
import { TenantDeleteDialog } from "../components/TenantDeleteDialog";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import { Badge } from "@core/ui/badge";
import { LogIn, Eye, Trash2 } from "lucide-react";
import type { FieldConfig, FieldOption } from "@core/ui/forms/generic-form";
import { appLogger } from "@core/common/logger";

// ============================================
// TenantsView Component
// ============================================

export function TenantsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language } = useI18n();
  const { canEnterTenantWorld, enterTenantWorld } = useTenantContext();
  const { hasPermission } = usePermissions();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const user = useAppStore((state) => state.user);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // System admins (with 'super' or 'system' in adminTypeName) see full tree
  // Tenant admins see only their children
  const isSystemAdmin = useMemo(() => {
    const adminType = user?.adminTypeName?.toLowerCase() || "";
    return adminType.includes("super") || adminType.includes("system");
  }, [user]);

  // Create tree service based on user type:
  // - System admin: Full tree (getTree)
  // - Tenant admin: My children only (getMyChildren)
  const treeService = useMemo(
    () =>
      isSystemAdmin
        ? createTenantTreeService(systemContainer.tenantRepository)
        : createMyChildrenTreeService(systemContainer.tenantRepository),
    [isSystemAdmin]
  );

  // Fetch available editions for the dropdown
  const { data: availableEditionsData } = useQuery({
    queryKey: ["editions", "available"],
    queryFn: () => systemContainer.tenantRepository.getAvailableEditions(),
  });

  const availableEditions = useMemo(
    () => availableEditionsData?.items ?? [],
    [availableEditionsData]
  );

  // Server search for permissions - needs parentId to filter by parent's permissions
  const createPermissionSearch = useCallback(
    (parentId?: string) =>
      async (query: string): Promise<FieldOption[]> => {
        try {
          const permissions = await systemContainer.tenantRepository.getCreationPermissions(
            parentId,
            query
          );
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

      if (editing) {
        fields.push({
          name: "isActive",
          label: t("tenant.activeStatus"),
          type: "switch",
          placeholder: "",
          required: false,
        });
      }

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

      if (!editing) {
        fields.push({
          name: "editionId",
          label: t("tenant.editionLabel") || "Subscription Plan",
          type: "select",
          placeholder: t("tenant.editionPlaceholder") || "Select a Plan",
          required: false,
          options: availableEditions.map((e) => ({ value: e.id, label: e.name })),
        });

        fields.push({
          name: "subscriptionType",
          label: t("tenant.subscriptionType") || "Subscription Type",
          type: "select",
          placeholder: "Select Type",
          required: false,
          options: [
            { value: "Lifetime", label: t("subscription.lifetime") || "Lifetime (Permanent)" },
            { value: "Monthly", label: t("subscription.monthly") || "Monthly" },
            { value: "Yearly", label: t("subscription.yearly") || "Yearly" },
            { value: "Trial", label: t("subscription.trial") || "Trial (Limited)" },
          ],
          defaultValue: "Lifetime"
        });

        // Only explicitly ask for End Date if Trial is selected
        fields.push({
          name: "subscriptionEndDate",
          label: t("tenant.trialEndDate") || "Trial End Date",
          type: "date",
          required: true,
          isVisible: (formData) => formData.subscriptionType === "Trial"
        });
      }

      return fields;
    },
    [t, createPermissionSearch, availableEditions]
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
      editionId: "",
    }),
    createFormData: (values) =>
      ({
        name: values.name,
        code: values.code,
        description: values.description || undefined,
        parentId: values.parentId,
        editionId: values.editionId || undefined,
        subscriptionType: values.subscriptionType || undefined,
        subscriptionEndDate: values.subscriptionEndDate || undefined,
      }) as CreateTenantRequest,
    updateFormData: (values) =>
      ({
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
      }) as UpdateTenantRequest,
  });

  // Handler for entering tenant world
  const handleEnterTenantWorld = useCallback(
    (node: TenantTreeNode) => {
      enterTenantWorld({
        id: node.id,
        name: node.name,
        parentId: node.parentId,
      });
      router.push("/");
    },
    [enterTenantWorld, router]
  );

  // Custom delete handler using TenantDeleteDialog
  const handleOpenDeleteDialog = useCallback((node: TenantTreeNode) => {
    setTenantToDelete({
      id: node.id,
      name: node.name,
    } as Tenant);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (cascadeChildren: boolean) => {
      if (!tenantToDelete) return;
      setIsDeleting(true);
      try {
        await systemContainer.tenantRepository.delete(tenantToDelete.id, { cascadeChildren });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        toastSuccess({
          title: t("tenant.deleteSuccess") || "Tenant deleted successfully",
        });
        setDeleteDialogOpen(false);
        setTenantToDelete(null);
      } catch (err) {
        appLogger.error("Failed to delete tenant:", err);
        toastError({
          title: t("common.error") || "Error",
          description: err instanceof Error ? err.message : "Failed to delete tenant.",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [tenantToDelete, queryClient, t, toastSuccess, toastError]
  );

  // Custom actions for tenant nodes
  const customActions = useMemo(() => {
    const hasDrillDown = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DRILL_DOWN);
    const canViewDetails = hasPermission(SYSTEM_PERMISSIONS.TENANTS_VIEW_DETAILS);
    const canDelete = hasPermission(SYSTEM_PERMISSIONS.TENANTS_DELETE);
    return (node: TenantTreeNode) => {
      const actions: Array<{
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
        show?: () => boolean;
        variant?: "default" | "destructive";
      }> = [
          {
            label: t("common.view") || "View",
            onClick: () => router.push(`/tenants/${node.id}`),
            icon: <Eye className="h-4 w-4" />,
            show: () => canViewDetails,
          },
          {
            label: t("tenant.enterTenantWorld"),
            onClick: () => handleEnterTenantWorld(node),
            icon: <LogIn className="h-4 w-4" />,
            show: () => canEnterTenantWorld && hasDrillDown,
          },
        ];

      // Add delete action (uses TenantDeleteDialog instead of built-in)
      if (canDelete) {
        actions.push({
          label: t("common.delete") || "Delete",
          onClick: () => handleOpenDeleteDialog(node),
          icon: <Trash2 className="h-4 w-4" />,
          show: () => true,
          variant: "destructive",
        });
      }

      return actions;
    };
  }, [
    canEnterTenantWorld,
    hasPermission,
    t,
    handleEnterTenantWorld,
    handleOpenDeleteDialog,
    router,
  ]);

  return (
    <>
      <GenericTreeView<TenantTreeNode, CreateTenantRequest, UpdateTenantRequest>
        viewModel={viewModel}
        expandOnCardClick={true}
        title={t("tenant.title")}
        subtitle={t("tenant.description")}
        getId={(node) => node.id}
        getLabel={(node) => (
          <>
            {node.name}
            <span className="ms-2 text-xs text-muted-foreground">({node.code})</span>
            <Badge variant={node.isActive ? "success" : "secondary"} className="ms-2">
              {node.isActive ? t("tenant.active") : t("tenant.inactive")}
            </Badge>
            {node.editionName && (
              <Badge variant="outline" className="ms-2">
                {node.editionName}
                {node.editionEndDate && new Date(node.editionEndDate) < new Date() ? ' (Expired)' : ''}
              </Badge>
            )}
          </>
        )}
        getChildren={(node) => node.children}
        renderFormFields={getFormFields}
        resource="tenants"
        permissions={{ canDelete: false }}
        customActions={customActions}
      />

      {/* Custom delete dialog with cascade support */}
      <TenantDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tenant={tenantToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}
