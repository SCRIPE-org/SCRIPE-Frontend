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
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { systemContainer } from "@modules/identity/di";
import { appLogger } from "@core/common/logger";
import type { TenantTreeNode, Tenant } from "../../domain/entities/Tenant";
import type { EditionThinModel } from "../../domain/types/SubscriptionTypes";
import {
  type CreateFormState,
  type EditFormState,
  type PromotionOption,
  initialCreateForm,
  initialEditForm,
} from "../components/TenantDialogs";

interface UseSubTenantsViewModelParams {
  parentId: string;
  parentName: string;
  parentCode: string;
}

export function useSubTenantsViewModel({
  parentId,
  parentName,
  parentCode,
}: UseSubTenantsViewModelParams) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { hasPermission } = usePermissions();
  const { success: toastSuccess, error: toastError } = useEnhancedToast();
  const { tenantRepository } = systemContainer;

  // ── Permissions ──
  const canCreate = hasPermission(SYSTEM_PERMISSIONS.TENANTS_CREATE);

  // ── Dialog state ──
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm);
  const [parentForCreate, setParentForCreate] = useState<TenantTreeNode | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>(initialEditForm);
  const [editingNode, setEditingNode] = useState<TenantTreeNode | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // ── Mutation loading states ──
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Edition & promotion state ──
  const [cachedEditions, setCachedEditions] = useState<EditionThinModel[]>([]);
  const [promoEditionId, setPromoEditionId] = useState("");
  const [promoSubType, setPromoSubType] = useState("");

  // ── Data queries ──
  const { data: children, isLoading } = useQuery({
    queryKey: ["tenants", "children", parentId],
    queryFn: () => tenantRepository.getChildren(parentId),
    enabled: !!parentId,
  });

  const childNodes = useMemo(() => children ?? [], [children]);

  // ── Promotion query ──
  const { data: promotionsRaw = [], isLoading: isLoadingPromotions } = useQuery({
    queryKey: ["entitlements", "editions", promoEditionId, "promotions"],
    queryFn: () => tenantRepository.getEditionPromotions(promoEditionId),
    enabled: !!promoEditionId && createDialogOpen,
  });

  const availablePromotions = useMemo((): PromotionOption[] => {
    return (promotionsRaw as any[])
      .filter((p) => {
        if (!p.isActive) return false;
        if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
        if (p.validFrom && new Date(p.validFrom) > new Date()) return false;
        if (p.maxRedemptions != null && p.currentRedemptions >= p.maxRedemptions) return false;
        if (p.applicableCycle && promoSubType) {
          const cycleMap: Record<string, string> = { Monthly: "Monthly", Yearly: "Yearly", Lifetime: "Lifetime" };
          if (p.applicableCycle !== cycleMap[promoSubType]) return false;
        }
        return true;
      })
      .map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        discountValue: p.discountValue,
        requiresCode: p.requiresCode,
      }));
  }, [promotionsRaw, promoSubType]);

  // ── Handlers ──

  const handleSearchEditions = useCallback(
    async (query: string) => {
      try {
        const res = await tenantRepository.getAvailableEditions(1, 10, query);
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
    },
    [tenantRepository]
  );

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

  const handleCreateSubmit = useCallback(
    async (formData?: any) => {
      const data = formData || createForm;
      if (!data.name || !data.code || !data.adminEmail) return;
      setIsCreating(true);
      try {
        // Pre-validate promo code
        if (data.editionId && data.promoCode) {
          const validation = await tenantRepository.validatePromoCode(
            data.editionId,
            data.promoCode
          );
          if (!validation.isValid) {
            const errorCode = validation.errorCode || "UNKNOWN";
            const localizedMessage =
              t(`tenant.promoCodeError.${errorCode}`) ||
              validation.errorMessage ||
              t("tenant.promoCodeError.UNKNOWN");
            toastError({
              title: t("tenant.invalidPromoCode") || "Invalid Promo Code",
              description: localizedMessage,
            });
            setIsCreating(false);
            return;
          }
        }

        // Unified API call
        await tenantRepository.create({
          name: data.name,
          code: data.code,
          description: data.description || undefined,
          parentId: parentForCreate?.id || parentId,
          adminEmail: data.adminEmail,
          adminUsername: data.adminUsername || undefined,
          editionId: data.editionId || undefined,
          subscriptionType: data.subscriptionType || "Lifetime",
          currency: data.currency || "USD",
          promotionId: data.promotionId || undefined,
          promoCode: data.promoCode || undefined,
        });

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
          description: err instanceof Error ? err.message : "Failed to create tenant.",
        });
      } finally {
        setIsCreating(false);
      }
    },
    [createForm, parentForCreate, parentId, tenantRepository, queryClient, t, toastSuccess, toastError]
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

    // Create dialog
    createDialogOpen,
    setCreateDialogOpen,
    createForm,
    setCreateForm,
    parentForCreate,
    handleOpenCreate,
    handleCreateSubmit,
    isCreating,

    // Edition & promotions
    handleSearchEditions,
    cachedEditions,
    availablePromotions,
    isLoadingPromotions,
    setPromoEditionId,
    setPromoSubType,

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
