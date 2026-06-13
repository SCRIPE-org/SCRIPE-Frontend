"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { LeadStatus } from "../../domain/entities/PlatformLead";
import type {
  CreateLeadParams,
  ConvertLeadParams,
  AssignLeadParams,
} from "../../domain/interfaces/ILeadsRepository";
import { useI18n } from "@core/providers/i18n-provider";
import { useToast } from "@core/ui/use-toast";

// ── Query key factory (stable, typed) ─────────────────────────────────────────

const QUERY_KEYS = {
  list: (page: number, pageSize: number, status?: LeadStatus, search?: string) =>
    ["leads", "list", page, pageSize, status, search] as const,
  detail: (id: string) => ["leads", "detail", id] as const,
  activity: (id: string) => ["leads", "activity", id] as const,
};

// ── ViewModel ─────────────────────────────────────────────────────────────────

export function useLeadsViewModel() {
  const { leadsRepository } = entitlementsContainer;
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const { toast } = useToast();

  // ── Filters & Pagination ──────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | undefined>(undefined);
  const [search, setSearch] = useState("");

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const isDrawerOpen = selectedLeadId !== null;

  // ── Create dialog state ───────────────────────────────────────────────────
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // ── Convert dialog state ──────────────────────────────────────────────────
  const [convertLeadId, setConvertLeadId] = useState<string | null>(null);
  const isConvertDialogOpen = convertLeadId !== null;

  // ── Assign dialog state ───────────────────────────────────────────────────
  const [assignLeadId, setAssignLeadId] = useState<string | null>(null);
  const isAssignDialogOpen = assignLeadId !== null;

  // ── Bulk selection state ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirmAction, setBulkConfirmAction] = useState<"close" | "delete" | null>(null);
  const isBulkConfirmOpen = bulkConfirmAction !== null;

  // ── List Query ────────────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: QUERY_KEYS.list(page, pageSize, statusFilter, search || undefined),
    queryFn: () =>
      leadsRepository.getAll({
        page,
        pageSize,
        status: statusFilter,
        search: search || undefined,
      }),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ── Detail Query (fires only when a row is selected) ─────────────────────
  const detailQuery = useQuery({
    queryKey: QUERY_KEYS.detail(selectedLeadId ?? ""),
    queryFn: () => leadsRepository.getById(selectedLeadId!),
    enabled: !!selectedLeadId,
    staleTime: 60 * 1000,
  });

  // ── Activity Query ────────────────────────────────────────────────────────
  const activityQuery = useQuery({
    queryKey: QUERY_KEYS.activity(selectedLeadId ?? ""),
    queryFn: () => leadsRepository.getActivity(selectedLeadId!),
    enabled: !!selectedLeadId,
    staleTime: 60 * 1000,
  });

  // ── Computed stats from list data ─────────────────────────────────────────
  const allLeads = listQuery.data?.items ?? [];
  const stats = {
    total: listQuery.data?.totalCount ?? 0,
    new: allLeads.filter((l) => l.status === "New").length,
    qualified: allLeads.filter((l) => l.status === "Qualified").length,
    converted: allLeads.filter((l) => l.status === "Converted").length,
  };

  // ── Update Status Mutation ────────────────────────────────────────────────
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: LeadStatus; notes?: string }) =>
      leadsRepository.updateStatus({ id, status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  // ── Create Lead Mutation ──────────────────────────────────────────────────
  const createLeadMutation = useMutation({
    mutationFn: (params: CreateLeadParams) => leadsRepository.createLead(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setIsCreateDialogOpen(false);
    },
  });

  // ── Convert to Tenant Mutation ────────────────────────────────────────────
  const convertToTenantMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params: ConvertLeadParams }) =>
      leadsRepository.convertToTenant(id, params),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setConvertLeadId(null);
      if (result.editionAssignmentError) {
        toast({
          title: t("leads.convertDialog.warning.title"),
          description: t("leads.convertDialog.warning.message").replace(
            "{error}",
            result.editionAssignmentError
          ),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("leads.convertDialog.successTitle"),
          description: t("leads.convertDialog.successMessage").replace(
            "{email}",
            result.adminEmail
          ),
        });
      }
    },
    onError: () => {
      toast({
        title: t("leads.convertDialog.errorTitle"),
        variant: "destructive",
      });
    },
  });

  // ── Assign Lead Mutation ──────────────────────────────────────────────────
  const assignLeadMutation = useMutation({
    mutationFn: ({ id, params }: { id: string; params: AssignLeadParams }) =>
      leadsRepository.assignLead(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setAssignLeadId(null);
      toast({ title: t("leads.assignDialog.success") });
    },
  });

  // ── Delete Lead Mutation ──────────────────────────────────────────────────
  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => leadsRepository.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({ title: t("leads.actions.deleteSuccess") });
      if (selectedLeadId) setSelectedLeadId(null);
    },
  });

  // ── Bulk Close Mutation ────────────────────────────────────────────────────────────────────────────
  const bulkCloseMutation = useMutation({
    mutationFn: (ids: string[]) =>
      leadsRepository.bulkUpdateStatus(ids, "Closed", t("leads.bulk.closedNote")),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSelectedIds(new Set());
      setBulkConfirmAction(null);
      const parts: string[] = [];
      if (result.updated > 0)
        parts.push(t("leads.bulk.toastUpdated", { count: String(result.updated) }));
      if (result.skipped > 0)
        parts.push(t("leads.bulk.toastSkipped", { count: String(result.skipped) }));
      if (result.notFound > 0)
        parts.push(t("leads.bulk.toastNotFound", { count: String(result.notFound) }));
      toast({ title: t("leads.bulk.closeSuccess"), description: parts.join(" · ") });
    },
    onError: () => {
      toast({ title: t("leads.bulk.closeError"), variant: "destructive" });
    },
  });

  // ── Bulk Delete Mutation ──────────────────────────────────────────────────────────────────────────
  // Uses Promise.allSettled so partial failures don't abort the batch.
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map((id) => leadsRepository.deleteLead(id)));
      const deleted = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      return { deleted, failed };
    },
    onSuccess: ({ deleted, failed }) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setSelectedIds(new Set());
      setBulkConfirmAction(null);
      const desc =
        failed > 0 ? t("leads.bulk.toastNotFound", { count: String(failed) }) : undefined;
      toast({
        title: t("leads.bulk.deleteSuccess", { count: String(deleted) }),
        description: desc,
      });
    },
    onError: () => {
      toast({ title: t("leads.bulk.deleteError"), variant: "destructive" });
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleStatusFilterChange = useCallback((status: LeadStatus | undefined) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    setSearch(q);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleOpenDrawer = useCallback((id: string) => {
    setSelectedLeadId(id);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedLeadId(null);
  }, []);

  const handleUpdateStatus = useCallback(
    async (id: string, status: LeadStatus, notes?: string) => {
      await updateStatusMutation.mutateAsync({ id, status, notes });
    },
    [updateStatusMutation]
  );

  const handleOpenCreateDialog = useCallback(() => setIsCreateDialogOpen(true), []);
  const handleCloseCreateDialog = useCallback(() => setIsCreateDialogOpen(false), []);
  const handleCreateLead = useCallback(
    async (params: CreateLeadParams) => {
      await createLeadMutation.mutateAsync(params);
    },
    [createLeadMutation]
  );

  const handleOpenConvertDialog = useCallback((id: string) => setConvertLeadId(id), []);
  const handleCloseConvertDialog = useCallback(() => setConvertLeadId(null), []);
  const handleConvertToTenant = useCallback(
    async (params: ConvertLeadParams) => {
      if (!convertLeadId) return;
      await convertToTenantMutation.mutateAsync({ id: convertLeadId, params });
    },
    [convertLeadId, convertToTenantMutation]
  );

  const handleOpenAssignDialog = useCallback((id: string) => setAssignLeadId(id), []);
  const handleCloseAssignDialog = useCallback(() => setAssignLeadId(null), []);
  const handleAssignLead = useCallback(
    async (params: AssignLeadParams) => {
      if (!assignLeadId) return;
      await assignLeadMutation.mutateAsync({ id: assignLeadId, params });
    },
    [assignLeadId, assignLeadMutation]
  );

  const handleDeleteLead = useCallback(
    async (id: string) => {
      await deleteLeadMutation.mutateAsync(id);
    },
    [deleteLeadMutation]
  );

  // ── Bulk selection handlers ──────────────────────────────────────────────────────────────────────────

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((leads: { id: string }[]) => {
    setSelectedIds((prev) =>
      prev.size === leads.length ? new Set() : new Set(leads.map((l) => l.id))
    );
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleOpenBulkClose = useCallback(() => setBulkConfirmAction("close"), []);
  const handleOpenBulkDelete = useCallback(() => setBulkConfirmAction("delete"), []);
  const handleCancelBulkConfirm = useCallback(() => setBulkConfirmAction(null), []);

  const handleConfirmBulkAction = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (bulkConfirmAction === "close") {
      await bulkCloseMutation.mutateAsync(ids);
    } else if (bulkConfirmAction === "delete") {
      await bulkDeleteMutation.mutateAsync(ids);
    }
  }, [selectedIds, bulkConfirmAction, bulkCloseMutation, bulkDeleteMutation]);

  // ── Exposed surface ───────────────────────────────────────────────────────
  return {
    // List
    leads: listQuery.data?.items ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    page,
    pageSize,
    totalPages: Math.ceil((listQuery.data?.totalCount ?? 0) / pageSize),
    stats,

    // Filters
    statusFilter,
    search,

    // Drawer
    isDrawerOpen,
    selectedLeadId,
    selectedLead: detailQuery.data ?? null,
    isLoadingDetail: detailQuery.isLoading,

    // Activity
    activity: activityQuery.data ?? [],
    isLoadingActivity: activityQuery.isLoading,

    // Mutation state
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreatingLead: createLeadMutation.isPending,
    isConvertingLead: convertToTenantMutation.isPending,
    isAssigningLead: assignLeadMutation.isPending,
    isDeletingLead: deleteLeadMutation.isPending,
    isBulkClosing: bulkCloseMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,

    // Dialog state
    isCreateDialogOpen,
    isConvertDialogOpen,
    convertLeadId,
    isAssignDialogOpen,
    assignLeadId,

    // Bulk selection
    selectedIds,
    isBulkConfirmOpen,
    bulkConfirmAction,
    selectedCount: selectedIds.size,

    // Handlers
    handleStatusFilterChange,
    handleSearchChange,
    handlePageChange,
    handleOpenDrawer,
    handleCloseDrawer,
    handleUpdateStatus,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateLead,
    handleOpenConvertDialog,
    handleCloseConvertDialog,
    handleConvertToTenant,
    handleOpenAssignDialog,
    handleCloseAssignDialog,
    handleAssignLead,
    handleDeleteLead,
    // Bulk
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
    handleOpenBulkClose,
    handleOpenBulkDelete,
    handleCancelBulkConfirm,
    handleConfirmBulkAction,
  };
}
