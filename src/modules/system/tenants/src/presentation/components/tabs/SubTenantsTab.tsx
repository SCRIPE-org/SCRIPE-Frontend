/**
 * Sub-Tenants Tab Component
 *
 * Uses the TenantNodeCard accordion design for child tenants.
 * Compact mode: no View Details/Enter World actions.
 *
 * @module tenants
 */
"use client";

import React, { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { Building2, Plus, Inbox } from "lucide-react";

import { systemContainer } from "@modules/system/di";
import { TenantNodeCard } from "../TenantNodeCard";
import { TenantDeleteDialog } from "../TenantDeleteDialog";
import {
  CreateTenantDialog,
  EditTenantDialog,
  type CreateFormState,
  type EditFormState,
  type PromotionOption,
  initialCreateForm,
  initialEditForm,
} from "../TenantDialogs";

import type { TenantTreeNode, Tenant } from "../../../domain/entities/Tenant";
import type { EditionThinModel } from "../../../data/models/TenantSubscription";
import { appLogger } from "@core/common/logger";

interface SubTenantsTabProps {
  parentId: string;
  parentName: string;
  parentCode: string;
}

export function SubTenantsTab({
  parentId,
  parentName,
  parentCode,
}: SubTenantsTabProps) {
  const { t, direction } = useI18n();
  const queryClient = useQueryClient();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // State
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
  const [cachedEditions, setCachedEditions] = useState<EditionThinModel[]>([]);

  // ── Promotion picker state (View owns the data) ──
  const [promoEditionId, setPromoEditionId] = useState("");
  const [promoSubType, setPromoSubType] = useState("");

  // Fetch children
  const {
    data: children,
    isLoading,
  } = useQuery({
    queryKey: ["tenants", "children", parentId],
    queryFn: () => systemContainer.tenantRepository.getChildren(parentId),
    enabled: !!parentId,
  });

  const handleSearchEditions = useCallback(async (query: string) => {
    try {
      const res = await systemContainer.tenantRepository.getAvailableEditions(1, 10, query);
      setCachedEditions((prev) => {
        const merged = [...prev];
        for (const ed of res.items) {
          if (!merged.find((e) => e.id === ed.id)) merged.push(ed);
        }
        return merged;
      });
      return res.items.map((ed) => ({ value: ed.id, label: ed.name }));
    } catch (err) {
      appLogger.error("Failed to search editions:", err);
      return [];
    }
  }, []);

  const childNodes = useMemo(() => children ?? [], [children]);

  // ── Fetch promotions for selected edition (View owns the data) ──
  const { data: promotionsRaw = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ["entitlements", "editions", promoEditionId, "promotions"],
    queryFn: () => systemContainer.tenantRepository.getEditionPromotions(promoEditionId),
    enabled: !!promoEditionId && createDialogOpen,
  });

  const availablePromotions = useMemo((): PromotionOption[] => {
    return (promotionsRaw as any[]).filter((p) => {
      if (!p.isActive) return false;
      if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
      if (p.validFrom && new Date(p.validFrom) > new Date()) return false;
      if (p.maxRedemptions != null && p.currentRedemptions >= p.maxRedemptions) return false;
      if (p.applicableCycle && promoSubType) {
        const cycleMap: Record<string, string> = { Monthly: "Monthly", Yearly: "Yearly", Lifetime: "Lifetime" };
        if (p.applicableCycle !== cycleMap[promoSubType]) return false;
      }
      return true;
    }).map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      discountValue: p.discountValue,
      requiresCode: p.requiresCode,
    }));
  }, [promotionsRaw, promoSubType]);

  // Handlers
  const handleOpenCreate = useCallback(
    (parent?: TenantTreeNode) => {
      setCreateForm(initialCreateForm);
      setParentForCreate(
        parent ?? ({ id: parentId, name: parentName, code: parentCode } as TenantTreeNode)
      );
      setPromoEditionId("");
      setPromoSubType("");
      setCreateDialogOpen(true);
    },
    [parentId, parentName, parentCode]
  );

  const handleCreateSubmit = useCallback(async () => {
    if (!createForm.name || !createForm.code) return;
    setIsCreating(true);
    try {
      const newId = await systemContainer.tenantRepository.create({
        name: createForm.name,
        code: createForm.code,
        description: createForm.description || undefined,
        parentId: parentForCreate?.id || parentId,
      });

      if (createForm.editionId) {
        await systemContainer.tenantRepository.assignEdition(
          newId,
          createForm.editionId,
          createForm.subscriptionType || "Lifetime",
          undefined,
          createForm.currency || "USD",
          createForm.promotionId && createForm.promoCode ? createForm.promoCode : undefined,
          createForm.promotionId || undefined
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
  }, [
    createForm,
    parentForCreate,
    parentId,
    queryClient,
    t,
    toastSuccess,
    toastError,
  ]);

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
        toastSuccess({ title: t("tenant.deleteSuccess") });
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t("tenant.manageSubTenants")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t("tenant.subTenantsDescription")}
          </p>
        </div>
        {canCreate && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenCreate()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("tenant.addChild")}
          </Button>
        )}
      </div>

      {/* Children cards */}
      {childNodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-border/50">
          <div className="rounded-full bg-muted/50 p-3 mb-3">
            <Inbox className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {t("tenant.noTenantsFound")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t("tenant.noTenantsDescription")}
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {childNodes.map((node) => (
            <TenantNodeCard
              key={node.id}
              node={node}
              level={0}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onCreateChild={handleOpenCreate}
              compact
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateTenantDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        parentTenant={parentForCreate}
        form={createForm}
        setForm={setCreateForm}
        onSubmit={handleCreateSubmit}
        isLoading={isCreating}
        onSearchEditions={handleSearchEditions}
        cachedEditions={cachedEditions}
        availablePromotions={availablePromotions}
        isLoadingPromotions={isLoadingPromotions}
        onEditionChange={setPromoEditionId}
        onSubscriptionTypeChange={setPromoSubType}
      />

      <EditTenantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tenantName={editingNode?.name || ""}
        form={editForm}
        setForm={setEditForm}
        onSubmit={handleEditSubmit}
        isLoading={isSaving}
      />

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
