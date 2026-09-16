// FILE-EXCEPTION: file length
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
import {
  useCustomFieldsFormFields,
  getCustomFieldsExtension,
  decodeCustomFieldName,
} from "@core/crud/customFieldsExtension";
import {
  assertSelectCustomFieldValuesValid,
  CustomFieldValidationError,
} from "@modules/custom-fields/custom-field";
import type {
  DataSubjectRequest,
  DsrStatus,
  DsrRequestType,
} from "../../domain/entities/DataSubjectRequest";
import type { SubmitDsrRequest, ReviewDsrRequest } from "../../domain/entities/DsrRequests";
import { DsrSlaCell } from "../components/DsrSlaCell";
import { DsrTypeCell } from "../components/DsrTypeCell";
import { DsrDeadlineCell } from "../components/DsrDeadlineCell";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DsrFilterBar } from "../components/DsrFilterBar";

// ── Status badge variant mapping ──────────────────────────────────────────────
// Mirrors the tone the detail page gives the same status (STATUS_META in
// DsrDetailView) so a request reads with the same weight in the list and the
// drawer rather than drifting between an accent chip here and a status hue
// there.

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  Pending: "warning",
  InReview: "info",
  Approved: "success",
  Processing: "info",
  PartiallyCompleted: "success",
  Completed: "success",
  Rejected: "error",
  Cancelled: "secondary",
};

/**
 * Registered in the backend's ComplianceEntityTypeCatalog -- must match
 * exactly. DSR has no generic edit form (see `editFields: undefined` below),
 * so this is only ever fetched/saved in create mode -- SubmitDsrModal is the
 * real integration point, the same way MESSAGE_TEMPLATE_ENTITY_TYPE_KEY's
 * real integration point is a full-page form, not GenericCrudView's modal.
 */
export const DSR_ENTITY_TYPE_KEY = "compliance.dsr";

// ── ViewModel ─────────────────────────────────────────────────────────────────

/**
 * React hook/ViewModel orchestrating state and data flows for dsr view model.
 * Coordinates query synchronization (TanStack Query) with application client store indicators (Zustand) and returns validation fields.
 */
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
      create: async () => ({}) as DataSubjectRequest,
    }
  );

  // ── Custom Fields ─────────────────────────────────────────────────────────────
  // No ownerId — DSR has no edit form, so this is always the create-form
  // (definitions-only) shape. See DSR_ENTITY_TYPE_KEY's own comment above.
  const customFieldsQuery = useCustomFieldsFormFields(DSR_ENTITY_TYPE_KEY, undefined);

  // Keyed by the field's namespaced name (e.g. "__cf__nationality"), holding
  // only values the user has actively edited this session — mirrors
  // useTemplateFormViewModel's identical pattern (the other bespoke-form
  // integration point for this same extension).
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({});

  const updateCustomFieldValue = useCallback((name: string, value: unknown) => {
    setCustomFieldValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const saveCustomFieldValues = useCallback(
    async (ownerId: string) => {
      // D5 (final whole-branch review, I3 follow-up): reject a stale/invalid
      // Select value client-side, with the real localized reason, BEFORE it
      // ever reaches saveValues and comes back as a 422 -- see
      // assertSelectCustomFieldValuesValid's own doc comment
      // (renderCustomFieldControl.tsx) for why this is the right integration
      // point. Throws CustomFieldValidationError, which handleSubmit's own
      // catch block below distinguishes from a genuine API failure so it can
      // show the specific reason, not the generic fallback.
      assertSelectCustomFieldValuesValid(customFieldsQuery.fieldConfigs, customFieldValues, t);

      const decoded: Record<string, unknown> = {};
      for (const fc of customFieldsQuery.fieldConfigs) {
        const key = decodeCustomFieldName(fc.name);
        if (key === null) continue;
        const raw = customFieldValues[fc.name] ?? fc.defaultValue ?? "";
        decoded[key] = raw === "" ? null : raw;
      }
      if (Object.keys(decoded).length === 0) return;
      await getCustomFieldsExtension()?.saveValues(DSR_ENTITY_TYPE_KEY, ownerId, decoded);
    },
    [customFieldsQuery.fieldConfigs, customFieldValues, t]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["compliance", "dsr"] }),
    [queryClient]
  );

  // No onSuccess here — success side effects (invalidate, toast) only fire
  // from handleSubmit once saveCustomFieldValues has also settled, so a
  // custom-field save failure can never be masked by an immediate "submitted"
  // toast the user has no reason to doubt. Same reasoning as
  // useTemplateFormViewModel's createMutation.
  const submitMutation = useMutation({
    mutationFn: (data: SubmitDsrRequest) => dsrRepository.submit(data),
    onError: () => toastError({ title: t("common.error") }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewDsrRequest }) =>
      dsrRepository.review(id, data),
    onSuccess: (_data, { data }) => {
      invalidate();
      success({
        title: data.isApproved ? t("compliance.dsrApproved") : t("compliance.dsrRejected"),
      });
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
    async (data: {
      requestType: string;
      regulationCode: string;
      subjectEmail: string;
      requesterNotes?: string;
    }) => {
      // Rejects (and skips the rest) if the create itself fails — submitMutation's
      // own onError has already toasted, so SubmitDsrModal's catch just needs to
      // know not to close/reset the form.
      const newId = await submitMutation.mutateAsync({
        requestType: data.requestType,
        regulationCode: data.regulationCode,
        subjectEmail: data.subjectEmail,
        requesterNotes: data.requesterNotes,
      });
      try {
        await saveCustomFieldValues(newId);
      } catch (err) {
        toastError({
          title:
            err instanceof CustomFieldValidationError
              ? err.message
              : t("compliance.customFieldsSaveError"),
        });
        // The DSR itself WAS created — re-throw only so the modal knows to
        // stay open with what the user typed, not to pretend nothing happened.
        throw err;
      }
      invalidate();
      success({ title: t("compliance.dsrSubmitted") });
      setCustomFieldValues({});
    },
    [submitMutation, saveCustomFieldValues, invalidate, success, t, toastError]
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
          onClear={() => {
            setStatusFilter("");
            setTypeFilter("");
          }}
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
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-nx-md bg-info/10 text-sm font-semibold text-info"
                aria-hidden="true"
              >
                {dsr.subjectEmail.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-nx-ink">{dsr.subjectEmail}</p>
                <p className="text-xs text-nx-ink-3">{dsr.regulationCode}</p>
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
          icon: <Eye className="h-4 w-4" aria-hidden="true" />,
          onClick: (dsr) => router.push(`/compliance/dsr/${dsr.id}`),
        },
        ...(canReview
          ? [
              {
                label: `${t("compliance.approveDsr")} / ${t("compliance.rejectDsr")}`,
                icon: <ThumbsUp className="h-4 w-4" aria-hidden="true" />,
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
                icon: <XCircle className="h-4 w-4" aria-hidden="true" />,
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
    [
      t,
      router,
      statusFilter,
      typeFilter,
      canCreate,
      canReview,
      canCancel,
      handleCancel,
      setSubmitOpen,
    ]
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
    // Custom fields (Submit modal only — DSR has no edit form)
    customFieldConfigs: customFieldsQuery.fieldConfigs,
    customFieldsLoading: customFieldsQuery.isLoading,
    customFieldValues,
    updateCustomFieldValue,
    refetchCustomFields: customFieldsQuery.refetch,
    // Review modal
    reviewDsr,
    setReviewDsr,
    handleReview,
    isReviewing: reviewMutation.isPending,
  };
}
