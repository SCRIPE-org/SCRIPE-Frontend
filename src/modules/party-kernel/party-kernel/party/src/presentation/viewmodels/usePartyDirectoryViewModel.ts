"use client";

import { useState, useMemo, useTransition } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPartyKernelContainer } from "../../../../di";
import { PARTY_KERNEL_PERMISSIONS } from "../../../../permission-constants";
import { usePermission } from "@core/hooks/use-permission";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { Party } from "../../domain/entities/Party";
import type {
  CreatePersonParams,
  CreateOrganizationParams,
} from "../../domain/interfaces/IPartyRepository";

export type PartyDirectoryTypeFilter = "all" | "Person" | "Organization";
export type PartyDirectoryViewMode = "table" | "grid";
export type PartyDirectorySort = "name_asc" | "name_desc" | "newest";

export function usePartyDirectoryViewModel() {
  const { partyRepository } = getPartyKernelContainer();
  const queryClient = useQueryClient();
  const { success, error: showError } = useEnhancedToast();
  const { t } = useI18n();
  const [, startTransition] = useTransition();

  // Permissions (authoritative checks enforced on server, UX guards in client)
  // Backend requires BOTH parties.create AND party-people.create / party-organizations.create
  const canPartiesCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_CREATE);
  const canPersonCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_PERSON_CREATE);
  const canOrgCreate = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_ORGANIZATION_CREATE);

  const canCreatePerson = canPartiesCreate && canPersonCreate;
  const canCreateOrg = canPartiesCreate && canOrgCreate;
  const canEdit = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_UPDATE);
  const canDelete = usePermission(PARTY_KERNEL_PERMISSIONS.PARTY_DELETE);

  // Filter and Layout States
  const [selectedType, setSelectedType] = useState<PartyDirectoryTypeFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<PartyDirectoryViewMode>("table");
  const [sortBy, setSortBy] = useState<PartyDirectorySort>("name_asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Dialog & Sheet States
  const [isCreatePersonOpen, setIsCreatePersonOpen] = useState(false);
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [deletingParty, setDeletingParty] = useState<Party | null>(null);
  const [previewParty, setPreviewParty] = useState<Party | null>(null);

  // Data Query
  const query = useQuery({
    queryKey: ["parties-directory", selectedType, searchTerm, page, pageSize],
    queryFn: async () => {
      return partyRepository.getAll({
        page,
        pageSize,
        search: searchTerm.trim() || undefined,
        type: selectedType === "all" ? undefined : selectedType,
      });
    },
    staleTime: 30_000,
  });

  // Client-side Sort ordering
  const sortedItems = useMemo(() => {
    const raw = query.data?.items ?? [];
    const cloned = [...raw];

    switch (sortBy) {
      case "name_asc":
        return cloned.sort((a, b) => a.displayName.localeCompare(b.displayName));
      case "name_desc":
        return cloned.sort((a, b) => b.displayName.localeCompare(a.displayName));
      case "newest":
        return cloned.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return cloned;
    }
  }, [query.data?.items, sortBy]);

  // Global counts query for stats chips
  const statsQuery = useQuery({
    queryKey: ["parties-stats-summary"],
    queryFn: async () => {
      const res = await partyRepository.getAll({ page: 1, pageSize: 100 });
      const items = res.items || [];
      return {
        total: res.totalCount,
        people: items.filter((p) => p.isPerson).length,
        organizations: items.filter((p) => p.isOrganization).length,
      };
    },
    staleTime: 60_000,
  });

  // Mutations
  const createPersonMutation = useMutation({
    mutationFn: (params: CreatePersonParams) => partyRepository.createPerson(params),
    onSuccess: (newPartyId) => {
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      queryClient.invalidateQueries({ queryKey: ["parties-stats-summary"] });
      setIsCreatePersonOpen(false);
      success({
        title: t("party.toast.personCreated") || "Person created successfully",
        description: t("party.toast.personCreatedDesc") || "Navigating to profile workspace",
      });
      return newPartyId;
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorCreating") || "Failed to create person",
      });
    },
  });

  const createOrgMutation = useMutation({
    mutationFn: (params: CreateOrganizationParams) =>
      partyRepository.createOrganization(params),
    onSuccess: (newPartyId) => {
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      queryClient.invalidateQueries({ queryKey: ["parties-stats-summary"] });
      setIsCreateOrgOpen(false);
      success({
        title: t("party.toast.orgCreated") || "Organization created successfully",
        description: t("party.toast.orgCreatedDesc") || "Navigating to profile workspace",
      });
      return newPartyId;
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorCreating") || "Failed to create organization",
      });
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: ({ id, displayName }: { id: string; displayName: string }) =>
      partyRepository.updatePartyName(id, displayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      queryClient.invalidateQueries({ queryKey: ["party-profile"] });
      setEditingParty(null);
      success({
        title: t("party.toast.updated") || "Party updated successfully",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorUpdating") || "Failed to update party",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => partyRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties-directory"] });
      queryClient.invalidateQueries({ queryKey: ["parties-stats-summary"] });
      setDeletingParty(null);
      success({
        title: t("party.toast.deleted") || "Party removed successfully",
      });
    },
    onError: (err: Error) => {
      showError({
        title: t("common.error") || "Error",
        description: err.message || t("party.toast.errorDeleting") || "Failed to delete party",
      });
    },
  });

  const handleSearchChange = (term: string) => {
    startTransition(() => {
      setSearchTerm(term);
      setPage(1);
    });
  };

  const handleTypeSelect = (type: PartyDirectoryTypeFilter) => {
    startTransition(() => {
      setSelectedType(type);
      setPage(1);
    });
  };

  return {
    // Data & Slicing
    parties: sortedItems,
    rawCount: query.data?.totalCount ?? 0,
    totalCount: query.data?.totalCount ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    page,
    pageSize,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: query.refetch,

    // Stats
    stats: {
      total: statsQuery.data?.total ?? query.data?.totalCount ?? 0,
      people: statsQuery.data?.people ?? 0,
      organizations: statsQuery.data?.organizations ?? 0,
    },

    // Filter & Presentation controls
    selectedType,
    setSelectedType: handleTypeSelect,
    searchTerm,
    setSearchTerm: handleSearchChange,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    setPage,
    setPageSize,

    // Dialog state
    isCreatePersonOpen,
    setIsCreatePersonOpen,
    isCreateOrgOpen,
    setIsCreateOrgOpen,
    editingParty,
    setEditingParty,
    deletingParty,
    setDeletingParty,
    previewParty,
    setPreviewParty,

    // Actions & Handlers
    handleCreatePerson: (params: CreatePersonParams) =>
      createPersonMutation.mutateAsync(params),
    isCreatingPerson: createPersonMutation.isPending,

    handleCreateOrganization: (params: CreateOrganizationParams) =>
      createOrgMutation.mutateAsync(params),
    isCreatingOrg: createOrgMutation.isPending,

    handleUpdateName: (id: string, displayName: string) =>
      updateNameMutation.mutateAsync({ id, displayName }),
    isUpdatingName: updateNameMutation.isPending,

    handleDelete: (id: string) => deleteMutation.mutateAsync(id),
    isDeleting: deleteMutation.isPending,

    // Permissions
    permissions: {
      canCreatePerson,
      canCreateOrg,
      canEdit,
      canDelete,
    },
  };
}
