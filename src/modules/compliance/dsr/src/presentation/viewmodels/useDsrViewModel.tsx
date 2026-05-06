"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ThumbsUp, XCircle } from "lucide-react";
import { complianceContainer } from "@modules/compliance/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { usePermissions } from "@core/hooks/use-permissions";
import { useAppStore } from "@core/store/useAppStore";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { DataSubjectRequest, DsrStatus, DsrRequestType } from "../../domain/entities/DataSubjectRequest";
import type { SubmitDsrRequest, ReviewDsrRequest } from "../../domain/entities/DsrRequests";
import { DsrSlaCell } from "../components/DsrSlaCell";
import { DsrTypeCell } from "../components/DsrTypeCell";
import { DsrDeadlineCell } from "../components/DsrDeadlineCell";
import { Badge } from "@core/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DsrFilterBar } from "../components/DsrFilterBar";

// ── Status badge variant mapping ──────────────────────────────────────────────

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Completed: "default",
  Approved: "default",
  InReview: "secondary",
  Processing: "secondary",
  Pending: "outline",
  PartiallyCompleted: "outline",
  Rejected: "destructive",
  Cancelled: "destructive",
};

// ── ViewModel ─────────────────────────────────────────────────────────────────

export function useDsrViewModel() {
  const { dsrRepository } = complianceContainer;
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const { hasPermission } = usePermissions();
  const tenantCode = useAppStore((state) => state.tenantCode);
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Permissions ───────────────────────────────────────────────────────────────
  // Super Admin (no tenantCode): read-only — can see all DSRs across tenants but cannot
  // submit, approve, or cancel any request. All write actions are tenant-scoped.
  const canCreate = !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_CREATE);
  const canReview = !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_REVIEW);
  const canCancel = !!tenantCode && hasPermission(SYSTEM_PERMISSIONS.COMPLIANCE_DSR_CANCEL);

  // ── Filter state ──────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<DsrStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<DsrRequestType | "">("");

  // ── Modal state ───────────────────────────────────────────────────────────────
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewDsr, setReviewDsr] = useState<DataSubjectRequest | null>(null);

  // ── CRUD ViewModel ────────────────────────────────────────────────────────────
  const vm = useCrudViewModel<DataSubjectRequest, SubmitDsrRequest, never>(
    ["compliance", "dsr", tenantCode, statusFilter, typeFilter],
    {
      getAll: async (params) => {
        const res = await dsrRepository.getAll({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          status: statusFilter || undefined,
          requestType: typeFilter || undefined,
        });
        return {
          items: res.items ?? [],
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: Math.ceil((res.totalCount ?? 0) / params.pageSize),
          },
        };
      },
      // "create" is intercepted by onCreateClick — this stub is never called
      create: async () => ({} as DataSubjectRequest),
    }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
    [queryClient]
  );

  const submitMutation = useMutation({
    mutationFn: (data: SubmitDsrRequest) => dsrRepository.submit(data),
    onSuccess: () => {
      invalidate();
      success({ title: t("compliance.dsrSubmitted") });
    },
    onError: () => toastError({ title: t("common.error") }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewDsrRequest }) =>
      dsrRepository.review(id, data),
    onSuccess: (_data, { data }) => {
      invalidate();
      success({ title: data.isApproved ? t("compliance.dsrApproved") : t("compliance.dsrRejected") });
    },
    onError: () => toastError({ title: t("common.error") }),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => dsrRepository.cancel(id),
    onSuccess: () => {
      invalidate();
      success({ title: t("compliance.dsrCancelled") });
    },
    onError: () => toastError({ title: t("common.error") }),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (data: { requestType: string; regulationCode: string; subjectEmail: string; requesterNotes?: string }) => {
      await submitMutation.mutateAsync({
        requestType: data.requestType,
        regulationCode: data.regulationCode,
        subjectEmail: data.subjectEmail,
        requesterNotes: data.requesterNotes,
      });
    },
    [submitMutation]
  );

  const handleReview = useCallback(
    async (id: string, approved: boolean, resolution?: string) => {
      await reviewMutation.mutateAsync({ id, data: { isApproved: approved, resolution } });
      setReviewDsr(null);
    },
    [reviewMutation]
  );

  const handleCancel = useCallback(
    async (dsr: DataSubjectRequest) => {
      await cancelMutation.mutateAsync(dsr.id);
    },
    [cancelMutation]
  );

  // ── GenericCrudView config ────────────────────────────────────────────────────
  const getConfigBase = useCallback(
    (): Partial<CrudConfig<DataSubjectRequest>> => ({
      // ── Filter bar above the table ──────────────────────────────────────────
      customHeaderContent: (
        <DsrFilterBar
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          onStatusChange={(v: DsrStatus | "") => setStatusFilter(v)}
          onTypeChange={(v: DsrRequestType | "") => setTypeFilter(v)}
          onClear={() => { setStatusFilter(""); setTypeFilter(""); }}
          t={t}
        />
      ),

      // ── Columns ─────────────────────────────────────────────────────────────
      columns: [
        {
          key: "subjectEmail",
          label: t("compliance.columns.subjectEmail"),
          sortable: true,
          render: (_val, dsr) => (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {dsr.subjectEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{dsr.subjectEmail}</p>
                <p className="text-xs text-muted-foreground">{dsr.regulationCode}</p>
              </div>
            </div>
          ),
        },
        {
          key: "requestType",
          label: t("compliance.columns.requestType"),
          render: (_val, dsr) => (
            <DsrTypeCell
              requestType={dsr.requestType}
              label={t(`compliance.${dsr.requestType.toLowerCase()}`)}
            />
          ),
        },
        {
          key: "status",
          label: t("compliance.columns.status"),
          render: (_val, dsr) => (
            <Badge variant={STATUS_VARIANT[dsr.status] ?? "outline"}>
              {t(`compliance.${dsr.status.charAt(0).toLowerCase() + dsr.status.slice(1)}`)}
            </Badge>
          ),
        },
        {
          key: "slaPercent",
          label: t("compliance.sla"),
          render: (_val, dsr) => <DsrSlaCell percent={dsr.slaPercent} color={dsr.slaColor} />,
        },
        {
          key: "daysRemaining",
          label: t("compliance.columns.deadline"),
          render: (_val, dsr) => (
            <DsrDeadlineCell
              dsr={dsr}
              remainingLabel={t("compliance.remaining")}
              completedLabel={t("compliance.completed")}
              overdueLabel={t("compliance.overdue")}
            />
          ),
        },
      ],

      // ── Row actions ──────────────────────────────────────────────────────────
      getActions: () => [
        {
          label: t("compliance.viewDetail"),
          icon: <Eye className="h-4 w-4" />,
          onClick: (dsr) => router.push(`/compliance/dsr/${dsr.id}`),
        },
        ...(canReview
          ? [
              {
                label: `${t("compliance.approveDsr")} / ${t("compliance.rejectDsr")}`,
                icon: <ThumbsUp className="h-4 w-4" />,
                show: (dsr: DataSubjectRequest) =>
                  dsr.status === "Pending" || dsr.status === "InReview",
                onClick: (dsr: DataSubjectRequest) => setReviewDsr(dsr),
              },
            ]
          : []),
        ...(canCancel
          ? [
              {
                label: t("compliance.cancelDsr"),
                icon: <XCircle className="h-4 w-4" />,
                variant: "destructive" as const,
                show: (dsr: DataSubjectRequest) =>
                  dsr.status === "Pending" || dsr.status === "Approved",
                onClick: handleCancel,
                confirmTitle: t("compliance.cancelDsr"),
                confirmVariant: "warning" as const,
              },
            ]
          : []),
      ],

      // Intercept the built-in Add button → open SubmitDsrModal
      onCreateClick: () => setSubmitOpen(true),

      // No generic form — DSR create uses custom modal
      createFields: undefined,
      editFields: undefined,

      permissions: {
        canCreate,
        canUpdate: false,
        canDelete: false,
      },

      getItemDisplayName: (dsr) => dsr.subjectEmail,
    }),
    [t, router, statusFilter, typeFilter, canCreate, canReview, canCancel, handleCancel, setSubmitOpen]
  );

  return {
    vm,
    getConfigBase,
    t,
    // Filters
    statusFilter,
    typeFilter,
    // Submit modal
    submitOpen,
    setSubmitOpen,
    canCreate,
    handleSubmit,
    isSubmitting: submitMutation.isPending,
    // Review modal
    reviewDsr,
    setReviewDsr,
    handleReview,
    isReviewing: reviewMutation.isPending,
  };
}
