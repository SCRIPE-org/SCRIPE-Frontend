/**
 * Tenants ViewModel
 *
 * Single source of truth for the tenants management view.
 * Encapsulates all data fetching, mutations, dialog state, and CRUD operations.
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
import { useAppStore } from "@core/store/useAppStore";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { systemContainer } from "@modules/identity/di";
import { appLogger } from "@core/common/logger";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import { type EditFormState, initialEditForm } from "../components/TenantDialogs";

// ─────────────────────────────────────────
// Tree filtering helper
// ─────────────────────────────────────────

function filterTree(nodes: TenantTreeNode[], query: string): TenantTreeNode[] {
  if (!query.trim()) return nodes;
  const lowerQuery = query.toLowerCase();

  return nodes.reduce<TenantTreeNode[]>((acc, node) => {
    const matchesSelf =
      node.name.toLowerCase().includes(lowerQuery) || node.code.toLowerCase().includes(lowerQuery);

    const filteredChildren = filterTree(node.children || [], query);

    if (matchesSelf || filteredChildren.length > 0) {
      acc.push({
        ...node,
        children: matchesSelf ? node.children : filteredChildren,
      });
    }

    return acc;
  }, []);
}

// ─────────────────────────────────────────
// ViewModel
// ─────────────────────────────────────────

export function useTenantsViewModel() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { hasPermission } = usePermissions();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const user = useAppStore((state) => state.user);
  const { tenantRepository } = systemContainer;

  // ── Permissions ──
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // ── System admin check ──
  const isSystemAdmin = useMemo(() => {
    const adminType = user?.adminTypeName?.toLowerCase() || "";
    return adminType.includes("super") || adminType.includes("system");
  }, [user]);

  // ── Search ──
  const [search, setSearch] = useState("");

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
  const { data: treeData, isLoading } = useQuery({
    queryKey: ["tenants", "tree"],
    queryFn: () =>
      isSystemAdmin
        ? tenantRepository.getTree()
        : tenantRepository.getMyChildren().then((res) => res.items),
  });

  const tree = useMemo(() => treeData ?? [], [treeData]);
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  // ── Handlers ──

  /** Navigate to the stepper page instead of opening a dialog */
  const handleOpenCreate = useCallback(
    (parent?: TenantTreeNode) => {
      const url = parent
        ? `/tenants/create?parentId=${encodeURIComponent(parent.id)}`
        : "/tenants/create";
      router.push(url);
    },
    [router]
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
    tree,
    filteredTree,
    isLoading,
    canCreate,

    // Search
    search,
    setSearch,

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
