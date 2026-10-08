/* eslint-disable unused-imports/no-unused-vars */
/**
 * Sub-Tenants ViewModel
 *
 * Dedicated viewmodel for the SubTenantsTab component.
 * Scoped to a parent tenant — fetches children, manages CRUD dialogs.
 *
 * Architecture: View → ViewModel → Repository (via DI)
 *
 * @module tenants
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import { appLogger } from "@core/common/logger";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import { type EditFormState, initialEditForm } from "../components/TenantDialogs";

interface UseSubTenantsViewModelParams {
  parentId: string;
  parentName: string;
  parentCode: string;
}

/**
 * React hook/ViewModel orchestrating state and data flows for sub tenants view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useSubTenantsViewModel({
  parentId,
  parentName,
  parentCode,
}: UseSubTenantsViewModelParams) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { hasPermission } = usePermissions();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const { tenantRepository } = identityContainer;

  // ── Permissions ──
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // ── Dialog state ──
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);
  const [editingNode, setEditingNode] = useState<TenantTreeNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // ── Mutation loading states ──
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Data queries ──
  const { data: children, isLoading } = useQuery({
    queryKey: ["tenants", "children", parentId],
    queryFn: () => tenantRepository.getChildren(parentId),
    enabled: !!parentId,
  });

  const childNodes = useMemo(() => children ?? [], [children]);

  // ── Handlers ──

  /** Navigate to the stepper page instead of opening a dialog */
  const handleOpenCreate = useCallback(
    (parent?: TenantTreeNode) => {
      const targetParentId = parent?.id || parentId;
      const url = `/tenants/create?parentId=${encodeURIComponent(targetParentId)}`;
      router.push(url);
    },
    [parentId, router]
  );

  const handleOpenEdit = useCallback((node: TenantTreeNode) => {
    setEditForm({
      name: node.name,
      description: node.description || "",
      isActive: node.isActive,
    });
    setEditingNode(node);
    setEditDialogOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editingNode || !editForm.name) return;
    setIsSaving(true);
    try {
      await tenantRepository.update(editingNode.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        isActive: editForm.isActive,
      });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toastSuccess({
        title: t("tenant.updated"),
        description: t("tenant.updatedDescription"),
      });
      setEditDialogOpen(false);
    } catch (err) {
      appLogger.error("Failed to update tenant:", err);
      toastError({
        title: t("common.error"),
        description: err instanceof Error ? err.message : "Failed to update tenant.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editingNode, editForm, tenantRepository, queryClient, t, toastSuccess, toastError]);

  const handleOpenDelete = useCallback((node: TenantTreeNode) => {
    setTenantToDelete({ id: node.id, name: node.name } as Tenant);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (cascadeChildren: boolean) => {
      if (!tenantToDelete) return;
      setIsDeleting(true);
      try {
        await tenantRepository.delete(tenantToDelete.id, { cascadeChildren });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        toastSuccess({ title: t("tenant.deleteSuccess") });
        setDeleteDialogOpen(false);
        setTenantToDelete(null);
      } catch (err) {
        appLogger.error("Failed to delete tenant:", err);
        toastError({
          title: t("common.error"),
          description: err instanceof Error ? err.message : "Failed to delete tenant.",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [tenantToDelete, tenantRepository, queryClient, t, toastSuccess, toastError]
  );

  return {
    // Data
    childNodes,
    isLoading,
    canCreate,

    // Create — navigates to stepper
    handleOpenCreate,

    // Edit dialog
    editDialogOpen,
    setEditDialogOpen,
    editForm,
    setEditForm,
    editingNode,
    handleOpenEdit,
    handleEditSubmit,
    isSaving,

    // Delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    tenantToDelete,
    handleOpenDelete,
    handleDeleteConfirm,
    isDeleting,
  };
}
