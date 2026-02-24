/**
 * Tenants ViewModel
 *
 * Provides data and operations for the tenants management view.
 */
"use client";

import { useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemContainer } from "@modules/system/di";
import type { Tenant, TenantTreeNode } from "../../domain/entities/Tenant";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import type { EditionThinModel } from "../../data/models/TenantSubscription";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

interface UseTenantsViewModelParams {
  page?: number;
  pageSize?: number;
  search?: string;
  viewMode?: "list" | "tree";
}

export function useTenantsViewModel(params: UseTenantsViewModelParams = {}) {
  const { page = 1, pageSize = 20, search, viewMode = "tree" } = params;
  const queryClient = useQueryClient();
  const { success, error: toastError } = useEnhancedToast();
  const { tenantRepository } = systemContainer;

  // Query key for list view
  const listQueryKey = useMemo(
    () => ["tenants", "list", { page, pageSize, search }],
    [page, pageSize, search]
  );

  // Fetch tenants (list view)
  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => tenantRepository.getAll({ page, pageSize, search }),
    enabled: viewMode === "list",
  });

  // Fetch tenant tree
  const {
    data: treeData,
    isLoading: isTreeLoading,
    isError: isTreeError,
    error: treeError,
    refetch: refetchTree,
  } = useQuery({
    queryKey: ["tenants", "tree"],
    queryFn: () => tenantRepository.getTree(),
    enabled: viewMode === "tree",
  });

  // Fetch available editions for the dropdown
  const {
    data: availableEditionsData,
    isLoading: isEditionsLoading,
  } = useQuery({
    queryKey: ["editions", "available"],
    queryFn: () => tenantRepository.getAvailableEditions(),
  });

  const availableEditions = useMemo(() => availableEditionsData?.items ?? [], [availableEditionsData]);

  // Create tenant mutation
  const createMutation = useMutation({
    mutationFn: async ({ request, editionId }: { request: CreateTenantRequest; editionId: string }) => {
      // 1. Create the tenant
      const newTenantId = await tenantRepository.create(request);

      // 2. Assign the selected edition
      if (editionId) {
        await tenantRepository.assignEdition(newTenantId, editionId);
      }

      return newTenantId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      success({
        title: "Tenant Created",
        description: "The tenant and subscription have been created successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Create Failed",
        description: err.message || "Failed to create tenant.",
      });
    },
  });

  // Update tenant mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateTenantRequest }) =>
      tenantRepository.update(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      success({
        title: "Tenant Updated",
        description: "The tenant has been updated successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Update Failed",
        description: err.message || "Failed to update tenant.",
      });
    },
  });

  // Delete tenant mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tenantRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      success({
        title: "Tenant Deleted",
        description: "The tenant has been deleted successfully.",
      });
    },
    onError: (err: Error) => {
      toastError({
        title: "Delete Failed",
        description: err.message || "Failed to delete tenant.",
      });
    },
  });

  // Handlers
  const handleCreate = useCallback(
    (request: CreateTenantRequest, editionId: string) => createMutation.mutateAsync({ request, editionId }),
    [createMutation]
  );

  const handleUpdate = useCallback(
    (id: string, request: UpdateTenantRequest) => updateMutation.mutateAsync({ id, request }),
    [updateMutation]
  );

  const handleDelete = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation]
  );

  const refetch = useCallback(() => {
    if (viewMode === "tree") {
      refetchTree();
    } else {
      refetchList();
    }
  }, [viewMode, refetchTree, refetchList]);

  return {
    // Data
    tenants: listData?.items ?? [],
    tree: treeData ?? [],
    availableEditions,
    totalCount: listData?.totalCount ?? 0,
    totalPages: listData?.totalPages ?? 0,
    hasNextPage: listData?.hasNextPage ?? false,
    hasPreviousPage: listData?.hasPreviousPage ?? false,

    // State
    isLoading: viewMode === "tree" ? isTreeLoading : isListLoading,
    isError: viewMode === "tree" ? isTreeError : isListError,
    error: viewMode === "tree" ? treeError : listError,

    // Handlers
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
