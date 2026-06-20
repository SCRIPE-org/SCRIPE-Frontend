"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { entitlementsContainer } from "@modules/entitlements/di";
import type {
  LeadActivity,
  LeadCommunicationLog,
  LeadStatus,
  PlatformLead,
  PlatformLeadListItem,
} from "../../domain/entities/PlatformLead";
import type {
  CreateLeadParams,
  ConvertLeadParams,
  AssignLeadParams,
  AssignableAdmin,
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

  const convertLeadQuery = useQuery({
    queryKey: QUERY_KEYS.detail(convertLeadId ?? ""),
    queryFn: () => leadsRepository.getById(convertLeadId!),
    enabled: !!convertLeadId,
    staleTime: 60 * 1000,
  });

  const assignLeadQuery = useQuery({
    queryKey: QUERY_KEYS.detail(assignLeadId ?? ""),
    queryFn: () => leadsRepository.getById(assignLeadId!),
    enabled: !!assignLeadId,
    staleTime: 60 * 1000,
  });

  // ── Activity Query ────────────────────────────────────────────────────────
  const activityQuery = useQuery({
    queryKey: QUERY_KEYS.activity(selectedLeadId ?? ""),
    queryFn: () => leadsRepository.getActivity(selectedLeadId!),
    enabled: !!selectedLeadId,
    staleTime: 60 * 1000,
  });

  // ── Communication Logs Query ──────────────────────────────────────────────
  const { data: communicationLogs = [], isLoading: isLoadingComms } = useQuery({
    queryKey: ["lead-communications", selectedLeadId],
    queryFn: () =>
      selectedLeadId
        ? leadsRepository.getCommunicationLogs(selectedLeadId)
        : Promise.resolve([] as LeadCommunicationLog[]),
    enabled: !!selectedLeadId,
    staleTime: 30_000,
  });

  // ── Editions Query (for CreateLeadDialog and wizard) ─────────────────────
  const editionsQuery = useQuery({
    queryKey: ["leads", "editions-for-conversion"],
    queryFn: () => leadsRepository.getEditionsForConversion(),
    staleTime: 5 * 60 * 1000, // 5 min — editions change rarely
  });
  const availableEditions = (editionsQuery.data ?? []).map((e) => ({
    key: e.id,
    displayName: e.name,
  }));

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
    mutationFn: ({
      id,
      status,
      notes,
      sendNotification,
      emailSubjectOverride,
      emailBodyOverride,
    }: {
      id: string;
      status: LeadStatus;
      notes?: string;
      sendNotification?: boolean;
      emailSubjectOverride?: string;
      emailBodyOverride?: string;
    }) =>
      leadsRepository.updateStatus({
        id,
        status,
        notes,
        sendNotification,
        emailSubjectOverride,
        emailBodyOverride,
      }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["leads", "list"] });
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.detail(id) });

      const previousLists = queryClient.getQueriesData<{ items: PlatformLeadListItem[] }>({
        queryKey: ["leads", "list"],
      });
      const previousDetail = queryClient.getQueryData<PlatformLead>(QUERY_KEYS.detail(id));

      queryClient.setQueriesData<{ items: PlatformLeadListItem[] }>(
        { queryKey: ["leads", "list"] },
        (old) =>
          old
            ? {
                ...old,
                items: old.items.map((lead) => (lead.id === id ? lead.copyWith({ status }) : lead)),
              }
            : old
      );

      if (previousDetail) {
        queryClient.setQueryData(QUERY_KEYS.detail(id), previousDetail.copyWith({ status }));
      }

      return { previousLists, previousDetail, id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (_error, _variables, context) => {
      context?.previousLists.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      if (context?.previousDetail) {
        queryClient.setQueryData(QUERY_KEYS.detail(context.id), context.previousDetail);
      }
      toast({ title: t("leads.actions.statusUpdateError"), variant: "destructive" });
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

  // ── Add Note Mutation ─────────────────────────────────────────────────────
  const addNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => leadsRepository.addNote(id, note),
    onMutate: async ({ id, note }) => {
      const activityKey = QUERY_KEYS.activity(id);
      await queryClient.cancelQueries({ queryKey: activityKey });
      const previousActivity = queryClient.getQueryData<LeadActivity[]>(activityKey);
      const optimisticActivity: LeadActivity = {
        id: `optimistic-${Date.now()}`,
        leadId: id,
        type: "NoteAdded",
        summary: "Note added",
        note,
        actorName: t("leads.activity.system"),
        occurredAt: new Date().toISOString(),
      };

      queryClient.setQueryData<LeadActivity[]>(activityKey, (old = []) => [
        optimisticActivity,
        ...old,
      ]);

      return { previousActivity, id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads", "activity"] });
      if (selectedLeadId) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activity(selectedLeadId) });
      }
      toast({ title: t("leads.note.added") });
    },
    onError: (_error, _variables, context) => {
      if (context) {
        queryClient.setQueryData(QUERY_KEYS.activity(context.id), context.previousActivity);
      }
      toast({ title: t("leads.note.error"), variant: "destructive" });
    },
  });

  // ── Send Email Mutation ───────────────────────────────────────────────────
  const sendLeadEmailMutation = useMutation({
    mutationFn: ({
      leadId,
      subject,
      bodyHtml,
      templateKey,
    }: {
      leadId: string;
      subject: string;
      bodyHtml: string;
      templateKey?: string;
    }) => leadsRepository.sendEmail(leadId, subject, bodyHtml, templateKey),
    onSuccess: (_data, variables) => {
      toast({ title: t("leads.email.sentSuccess") });
      void queryClient.invalidateQueries({
        queryKey: ["lead-communications", variables.leadId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["lead-activity", variables.leadId],
      });
    },
    onError: () => {
      toast({ title: t("leads.email.sendError"), variant: "destructive" });
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
    async (
      id: string,
      status: LeadStatus,
      notes?: string,
      sendNotification?: boolean,
      emailSubjectOverride?: string,
      emailBodyOverride?: string
    ) => {
      await updateStatusMutation.mutateAsync({
        id,
        status,
        notes,
        sendNotification,
        emailSubjectOverride,
        emailBodyOverride,
      });
    },
    [updateStatusMutation]
  );

  const handleGetEmailPreview = useCallback(
    async (leadId: string, targetStatus: string) => {
      return leadsRepository.getStatusEmailPreview(leadId, targetStatus);
    },
    [leadsRepository]
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

  const searchAssignableAdmins = useCallback(
    async (query: string): Promise<AssignableAdmin[]> => {
      return leadsRepository.searchAssignableAdmins(query);
    },
    [leadsRepository]
  );

  const handleAddNote = useCallback(
    async (id: string, note: string) => {
      await addNoteMutation.mutateAsync({ id, note });
    },
    [addNoteMutation]
  );

  const handleDeleteLead = useCallback(
    async (id: string) => {
      await deleteLeadMutation.mutateAsync(id);
    },
    [deleteLeadMutation]
  );

  /** Alias for the drawer "Close Lead" action — same mutation as deleteLead (soft-close). */
  const handleCloseLead = useCallback(
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

  const handleSelectionChange = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

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
    availableEditions,

    // Filters
    statusFilter,
    search,

    // Drawer
    isDrawerOpen,
    selectedLeadId,
    selectedLead: detailQuery.data ?? null,
    isLoadingDetail: detailQuery.isLoading,
    convertLead: convertLeadQuery.data ?? null,
    assignLead: assignLeadQuery.data ?? null,
    isLoadingConvertLead: convertLeadQuery.isLoading,
    isLoadingAssignLead: assignLeadQuery.isLoading,

    // Activity
    activity: activityQuery.data ?? [],
    isLoadingActivity: activityQuery.isLoading,

    // Communication logs
    communicationLogs,
    isLoadingComms,

    // Mutation state
    isUpdatingStatus: updateStatusMutation.isPending,
    isCreatingLead: createLeadMutation.isPending,
    isConvertingLead: convertToTenantMutation.isPending,
    isAssigningLead: assignLeadMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
    isDeletingLead: deleteLeadMutation.isPending,
    isBulkClosing: bulkCloseMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending,
    isSendingEmail: sendLeadEmailMutation.isPending,

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
    setSelectedLeadId,
    sendLeadEmail: sendLeadEmailMutation.mutateAsync,
    handleUpdateStatus,
    handleGetEmailPreview,
    handleOpenCreateDialog,
    handleCloseCreateDialog,
    handleCreateLead,
    handleOpenConvertDialog,
    handleCloseConvertDialog,
    handleConvertToTenant,
    handleOpenAssignDialog,
    handleCloseAssignDialog,
    handleAssignLead,
    searchAssignableAdmins,
    handleAddNote,
    handleDeleteLead,
    handleCloseLead,
    // Bulk
    handleToggleSelect,
    handleSelectAll,
    handleClearSelection,
    handleSelectionChange,
    handleOpenBulkClose,
    handleOpenBulkDelete,
    handleCancelBulkConfirm,
    handleConfirmBulkAction,
  };
}
