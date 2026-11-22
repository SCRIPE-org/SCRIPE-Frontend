/**
 * useTenantIdentityProvidersViewModel — Platform-Admin Tenant-Scoped Identity Providers ViewModel
 *
 * Strictly follows SOLID MVVM:
 *   View -> ViewModel -> identityContainer.tenantRepository -> TenantService -> IApiService -> HTTP
 *
 * Manages CRUD, optimistic IsActive toggling with rollback, Test Connection diagnostics,
 * and deletion for `/api/v1/tenants/{tenantId}/identity-providers`.
 *
 * @module tenants/presentation/viewmodels
 */
"use client";

import { useState, useCallback } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { identityContainer } from "@modules/identity/di";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type {
  CreateTenantIdentityProviderPayload,
  TenantIdentityProviderDetail,
  TenantIdentityProviderListItem,
  TenantIdpTestConnectionResult,
  UpdateTenantIdentityProviderPayload,
} from "../../domain/entities/TenantIdentityProvider";
import { buildTenantIdpToggleUpdatePayload } from "../utils/tenantIdentityProvider.helpers";

/** TanStack Query key factory for tenant-scoped identity providers. */
export const tenantIdpKeys = {
  all: (tenantId: string) => ["tenant-identity-providers", tenantId] as const,
  list: (tenantId: string, search: string) =>
    ["tenant-identity-providers", tenantId, "list", search] as const,
};

/** Public state and action contract returned by {@link useTenantIdentityProvidersViewModel}. */
export interface UseTenantIdentityProvidersViewModelReturn {
  providers: TenantIdentityProviderListItem[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  refresh: () => void;
  dialogOpen: boolean;
  editingProvider: TenantIdentityProviderDetail | null;
  isLoadingDetail: boolean;
  openCreateDialog: () => void;
  openEditDialog: (id: string) => Promise<void>;
  closeDialog: () => void;
  saveProvider: (
    payload: CreateTenantIdentityProviderPayload | UpdateTenantIdentityProviderPayload
  ) => Promise<void>;
  isSaving: boolean;
  toggleActive: (provider: TenantIdentityProviderListItem, nextActive: boolean) => Promise<void>;
  togglingId: string | null;
  testConnection: (id: string) => Promise<void>;
  testingId: string | null;
  testResults: Record<string, TenantIdpTestConnectionResult>;
  deleteTarget: TenantIdentityProviderListItem | null;
  setDeleteTarget: (provider: TenantIdentityProviderListItem | null) => void;
  confirmDelete: () => Promise<void>;
  isDeleting: boolean;
}

/**
 * ViewModel hook coordinating Platform-Admin CRUD, optimistic active toggle,
 * and connectivity testing for a tenant's scoped identity providers.
 */
export function useTenantIdentityProvidersViewModel(
  tenantId: string
): UseTenantIdentityProvidersViewModelReturn {
  const { t } = useI18n();
  const { toast } = useEnhancedToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<TenantIdentityProviderDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TenantIdpTestConnectionResult>>({});
  const [deleteTarget, setDeleteTarget] = useState<TenantIdentityProviderListItem | null>(null);

  const listQueryKey = tenantIdpKeys.list(tenantId, searchQuery.trim());

  const { data, isLoading, error, refetch } = useQuery<
    PagedResult<TenantIdentityProviderListItem>,
    Error
  >({
    queryKey: listQueryKey,
    queryFn: () =>
      identityContainer.tenantRepository.getIdentityProviders(tenantId, {
        page: 1,
        pageSize: 100,
        search: searchQuery.trim() || undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: Boolean(tenantId),
  });

  const invalidateList = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: tenantIdpKeys.all(tenantId) });
  }, [queryClient, tenantId]);

  const openCreateDialog = useCallback(() => {
    setEditingProvider(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback(
    async (id: string) => {
      setIsLoadingDetail(true);
      try {
        const detail = await identityContainer.tenantRepository.getIdentityProviderById(
          tenantId,
          id
        );
        setEditingProvider(detail);
        setDialogOpen(true);
      } catch (err) {
        toast({
          title: t("common.error"),
          description: err instanceof Error ? err.message : t("tenant.idpLoadError"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [tenantId, toast, t]
  );

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setEditingProvider(null);
  }, []);

  const createMutation = useMutation({
    mutationFn: (payload: CreateTenantIdentityProviderPayload) =>
      identityContainer.tenantRepository.createIdentityProvider(tenantId, payload),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("tenant.idpCreatedSuccess") });
      invalidateList();
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTenantIdentityProviderPayload }) =>
      identityContainer.tenantRepository.updateIdentityProvider(tenantId, id, payload),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("tenant.idpUpdatedSuccess") });
      invalidateList();
      closeDialog();
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const saveProvider = useCallback(
    async (payload: CreateTenantIdentityProviderPayload | UpdateTenantIdentityProviderPayload) => {
      if (editingProvider) {
        await updateMutation.mutateAsync({
          id: editingProvider.id,
          payload: { ...payload, rowVersion: editingProvider.rowVersion },
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
    },
    [editingProvider, createMutation, updateMutation]
  );

  const toggleActive = useCallback(
    async (provider: TenantIdentityProviderListItem, nextActive: boolean) => {
      setTogglingId(provider.id);
      const previous =
        queryClient.getQueryData<PagedResult<TenantIdentityProviderListItem>>(listQueryKey);

      if (previous) {
        queryClient.setQueryData<PagedResult<TenantIdentityProviderListItem>>(listQueryKey, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === provider.id ? { ...item, isActive: nextActive } : item
          ),
        });
      }

      try {
        const detail = await identityContainer.tenantRepository.getIdentityProviderById(
          tenantId,
          provider.id
        );
        await identityContainer.tenantRepository.updateIdentityProvider(
          tenantId,
          provider.id,
          buildTenantIdpToggleUpdatePayload(detail, nextActive)
        );
        toast({
          title: t("common.success"),
          description: nextActive
            ? t("tenant.idpActivatedSuccess")
            : t("tenant.idpDeactivatedSuccess"),
        });
        invalidateList();
      } catch (err) {
        if (previous) queryClient.setQueryData(listQueryKey, previous);
        toast({
          title: t("common.error"),
          description: err instanceof Error ? err.message : t("tenant.idpToggleFailed"),
          variant: "destructive",
        });
      } finally {
        setTogglingId(null);
      }
    },
    [queryClient, listQueryKey, tenantId, toast, t, invalidateList]
  );

  const testConnection = useCallback(
    async (id: string) => {
      setTestingId(id);
      try {
        const result = await identityContainer.tenantRepository.testIdentityProviderConnection(
          tenantId,
          id
        );
        setTestResults((prev) => ({ ...prev, [id]: result }));
        toast({
          title: result.isSuccess ? t("tenant.idpTestSuccessTitle") : t("tenant.idpTestFailedTitle"),
          description: result.message,
          variant: result.isSuccess ? "default" : "destructive",
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : t("tenant.idpTestFailedTitle");
        setTestResults((prev) => ({
          ...prev,
          [id]: { isSuccess: false, message, discoveredIssuer: null, discoveredEndpoints: [] },
        }));
        toast({ title: t("tenant.idpTestFailedTitle"), description: message, variant: "destructive" });
      } finally {
        setTestingId(null);
      }
    },
    [tenantId, toast, t]
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      identityContainer.tenantRepository.deleteIdentityProvider(tenantId, id),
    onSuccess: () => {
      toast({ title: t("common.success"), description: t("tenant.idpDeletedSuccess") });
      setDeleteTarget(null);
      invalidateList();
    },
    onError: (err: Error) => {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    },
  });

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
  }, [deleteTarget, deleteMutation]);

  return {
    providers: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading,
    error: error ? error.message : null,
    searchQuery,
    setSearchQuery,
    refresh: () => void refetch(),
    dialogOpen,
    editingProvider,
    isLoadingDetail,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    saveProvider,
    isSaving: createMutation.isPending || updateMutation.isPending,
    toggleActive,
    togglingId,
    testConnection,
    testingId,
    testResults,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
