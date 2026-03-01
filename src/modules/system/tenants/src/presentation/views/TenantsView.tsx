/**
 * TenantsView — Expandable Accordion Design
 *
 * Premium tenant management page with:
 * - Stats pills header with search
 * - Expandable accordion cards with color-coded status borders
 * - Recursive nested children hierarchy
 * - On-demand stats fetching when expanded
 * - Full RTL/LTR support
 * - Create/Edit/Delete dialogs with edition selection
 *
 * Clean Architecture: View → ViewModel → Repository
 *
 * @module tenants
 */
"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@core/store/useAppStore";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { cn } from "@core/common/utils";
import { Skeleton } from "@core/ui/skeleton";
import { Building2, Inbox } from "lucide-react";

// Module imports
import { systemContainer } from "@modules/system/di";
import { TenantNodeCard } from "../components/TenantNodeCard";
import { TenantListHeader } from "../components/TenantListHeader";
import { TenantDeleteDialog } from "../components/TenantDeleteDialog";
import {
  CreateTenantDialog,
  EditTenantDialog,
  type CreateFormState,
  type EditFormState,
  initialCreateForm,
  initialEditForm,
} from "../components/TenantDialogs";

import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import type { EditionThinModel } from "../../data/models/TenantSubscription";
import { appLogger } from "@core/common/logger";

// ============================================
// Helpers
// ============================================

/** Recursively filter tree nodes by search query */
function filterTree(
  nodes: TenantTreeNode[],
  query: string
): TenantTreeNode[] {
  if (!query.trim()) return nodes;
  const lowerQuery = query.toLowerCase();

  return nodes.reduce<TenantTreeNode[]>((acc, node) => {
    const matchesSelf =
      node.name.toLowerCase().includes(lowerQuery) ||
      node.code.toLowerCase().includes(lowerQuery);

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

// ============================================
// Component
// ============================================

export function TenantsView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t, language, direction } = useI18n();
  const { hasPermission } = usePermissions();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const user = useAppStore((state) => state.user);

  // State
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm);
  const [parentForCreate, setParentForCreate] = useState<TenantTreeNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);
  const [editingNode, setEditingNode] = useState<TenantTreeNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // System admin check
  const isSystemAdmin = useMemo(() => {
    const adminType = user?.adminTypeName?.toLowerCase() || "";
    return adminType.includes("super") || adminType.includes("system");
  }, [user]);

  // Fetch tree data
  const {
    data: treeData,
    isLoading,
  } = useQuery({
    queryKey: ["tenants", "tree"],
    queryFn: () =>
      isSystemAdmin
        ? systemContainer.tenantRepository.getTree()
        : systemContainer.tenantRepository
          .getMyChildren()
          .then((res) => res.items),
  });

  // ── Handlers ──
  const handleSearchEditions = useCallback(async (query: string) => {
    try {
      // Fetch specifically page 1, size 10, with the search query
      const res = await systemContainer.tenantRepository.getAvailableEditions(1, 10, query);
      return res.items.map((ed) => ({ value: ed.id, label: ed.name }));
    } catch (err) {
      appLogger.error("Failed to search editions:", err);
      return [];
    }
  }, []);

  const tree = useMemo(() => treeData ?? [], [treeData]);

  // Filtered tree for search
  const filteredTree = useMemo(
    () => filterTree(tree, search),
    [tree, search]
  );

  // Permission checks
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // ── Handlers ──

  const handleOpenCreate = useCallback(
    (parent?: TenantTreeNode) => {
      setCreateForm(initialCreateForm);
      setParentForCreate(parent ?? null);
      setCreateDialogOpen(true);
    },
    []
  );

  const handleCreateSubmit = useCallback(async () => {
    // The GenericForm passes data to onSubmit, but we also save it to createForm state
    // inside the Dialog component. So we just use createForm here.
    if (!createForm.name || !createForm.code) return;
    setIsCreating(true);
    try {
      // Create tenant
      const newId = await systemContainer.tenantRepository.create({
        name: createForm.name,
        code: createForm.code,
        description: createForm.description || undefined,
        parentId: parentForCreate?.id,
      });

      // Assign edition if selected
      if (createForm.editionId) {
        await systemContainer.tenantRepository.assignEdition(
          newId,
          createForm.editionId
        );
      }

      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toastSuccess({
        title: t("tenant.created"),
        description: t("tenant.createdDescription"),
      });
      setCreateDialogOpen(false);
    } catch (err) {
      appLogger.error("Failed to create tenant:", err);
      toastError({
        title: t("common.error"),
        description:
          err instanceof Error ? err.message : "Failed to create tenant.",
      });
    } finally {
      setIsCreating(false);
    }
  }, [createForm, parentForCreate, queryClient, t, toastSuccess, toastError]);

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
    // Same as create, the Dialog component updates editForm before calling this
    if (!editingNode || !editForm.name) return;
    setIsSaving(true);
    try {
      await systemContainer.tenantRepository.update(editingNode.id, {
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
        description:
          err instanceof Error ? err.message : "Failed to update tenant.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editingNode, editForm, queryClient, t, toastSuccess, toastError]);

  const handleOpenDelete = useCallback((node: TenantTreeNode) => {
    setTenantToDelete({ id: node.id, name: node.name } as Tenant);
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(
    async (cascadeChildren: boolean) => {
      if (!tenantToDelete) return;
      setIsDeleting(true);
      try {
        await systemContainer.tenantRepository.delete(tenantToDelete.id, {
          cascadeChildren,
        });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        toastSuccess({
          title: t("tenant.deleteSuccess"),
        });
        setDeleteDialogOpen(false);
        setTenantToDelete(null);
      } catch (err) {
        appLogger.error("Failed to delete tenant:", err);
        toastError({
          title: t("common.error"),
          description:
            err instanceof Error ? err.message : "Failed to delete tenant.",
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [tenantToDelete, queryClient, t, toastSuccess, toastError]
  );

  // ── Render ──

  if (isLoading) {
    return (
      <div className="space-y-4" dir={direction}>
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Header with stats + search */}
      <TenantListHeader
        tree={tree}
        search={search}
        onSearchChange={setSearch}
        onAdd={() => handleOpenCreate()}
        canCreate={canCreate}
      />

      {/* Tenant cards */}
      {filteredTree.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted/50 p-4 mb-4">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {search
              ? t("tenant.noTenantsFound")
              : t("tenant.noTenantsFound")}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {search
              ? t("tenant.searchPlaceholder")
              : t("tenant.noTenantsDescription")}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {filteredTree.map((node) => (
            <TenantNodeCard
              key={node.id}
              node={node}
              level={0}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onCreateChild={handleOpenCreate}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateTenantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentTenant={parentForCreate}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
        onSearchEditions={handleSearchEditions}
      />

      {/* Edit Dialog */}
      <EditTenantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tenantName={editingNode?.name || ""}
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditSubmit}
        isLoading={isSaving}
      />

      {/* Delete Dialog */}
      <TenantDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tenant={tenantToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
