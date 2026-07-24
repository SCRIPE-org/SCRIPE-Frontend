"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Info,
  User,
  UserX,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Input } from "@core/ui/input";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import type { BadgeProps } from "@core/ui/badge";
import { useDsrDetailViewModel } from "../viewmodels/useDsrDetailViewModel";

import { DsrDetailMetadata } from "../components/DsrDetailMetadata";
import { DsrDetailInfo } from "../components/DsrDetailInfo";
import { DsrModuleExecutions } from "../components/DsrModuleExecutions";
import { DsrDetailTimeline } from "../components/DsrDetailTimeline";
import { DsrErasureState } from "../components/DsrErasureState";

// A status icon that accepts the same shape a lucide glyph does, so the meta
// map below can mix real icons with the one synthetic entry ("Processing")
// that renders the shared LoadingSpinner instead of a static glyph.
type StatusIcon = React.ComponentType<{
  className?: string;
  "aria-hidden"?: React.AriaAttributes["aria-hidden"];
}>;

// "Processing" is a genuinely in-flight backend job, not idle decoration, so
// it earns the one real loader rather than a raw lucide icon with
// `animate-spin` bolted on — that stays governed by the shared motion rule.
function ProcessingIcon({ className }: { className?: string }) {
  return <LoadingSpinner size="inline" showText={false} className={className} />;
}

// ── Status meta ────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  string,
  { labelKey: string; icon: StatusIcon; variant: BadgeProps["variant"] }
> = {
  Pending: { labelKey: "compliance.statusLabels.pending", icon: Clock, variant: "warning" },
  InReview: { labelKey: "compliance.statusLabels.inReview", icon: Info, variant: "info" },
  Approved: { labelKey: "compliance.statusLabels.approved", icon: CheckCircle2, variant: "success" },
  Processing: { labelKey: "compliance.statusLabels.processing", icon: ProcessingIcon, variant: "info" },
  PartiallyCompleted: {
    labelKey: "compliance.statusLabels.partiallyCompleted",
    icon: CheckCircle2,
    variant: "success",
  },
  Completed: { labelKey: "compliance.statusLabels.completed", icon: CheckCircle2, variant: "success" },
  Rejected: { labelKey: "compliance.statusLabels.rejected", icon: AlertTriangle, variant: "error" },
  Cancelled: { labelKey: "compliance.statusLabels.cancelled", icon: AlertTriangle, variant: "secondary" },
};

// ── Type Meta ────────────────────────────────────────────────────────────────
const TYPE_META: Record<string, { labelKey: string; color: string }> = {
  Export: { labelKey: "compliance.requestTypes.export", color: "text-info" },
  Erasure: { labelKey: "compliance.requestTypes.erasure", color: "text-destructive" },
  Rectification: { labelKey: "compliance.requestTypes.rectification", color: "text-nx-accent" },
  Restriction: { labelKey: "compliance.requestTypes.restriction", color: "text-warning" },
};

/**
 * Presentation UI component rendering the dsr detail view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DsrDetailView({ id }: { id: string }) {
  useModuleLocales(() => import("../../../locales"), "compliance-dsr");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const {
    dsr,
    isLoading,
    isError,
    refetch,
    isConfirmingErasure,
    setIsConfirmingErasure,
    erasureInput,
    setErasureInput,
    tenantCode,
    isConfirmingPending,
    isDownloadingPending,
    confirmErasure,
    downloadExport,
  } = useDsrDetailViewModel(id);
  const statusMeta = dsr ? (STATUS_META[dsr.status] ?? STATUS_META.Pending) : null;
  const typeMeta = dsr
    ? (TYPE_META[dsr.requestType] ?? { labelKey: dsr.requestType, color: "" })
    : null;

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={User}
        title={t("compliance.dsrDetailTitle")}
        description={dsr?.subjectEmail ?? t("common.loading")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance/dsr")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        actions={
          dsr && (
            <>
              {dsr.canConfirmErasure && !!tenantCode && (
                <Button variant="destructive" onClick={() => setIsConfirmingErasure(true)}>
                  <ShieldAlert className="me-2 h-4 w-4" aria-hidden="true" />
                  {t("compliance.confirmErasureBtn")}
                </Button>
              )}
              {dsr.canDownloadExport && !!tenantCode && (
                <Button onClick={downloadExport} disabled={isDownloadingPending} loading={isDownloadingPending}>
                  {!isDownloadingPending && <Download className="me-2 h-4 w-4" aria-hidden="true" />}
                  {t("compliance.downloadExportBtn")}
                </Button>
              )}
            </>
          )
        }
      />

      {isLoading ? (
        <div className="space-y-6" role="status" aria-busy="true" aria-label={t("common.loading")}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-nx-lg" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-[300px] rounded-nx-lg" />
            <Skeleton className="h-[300px] rounded-nx-lg" />
          </div>
        </div>
      ) : isError ? (
        <ErrorMessage message={t("common.error")} onRetry={() => refetch()} />
      ) : dsr && statusMeta && typeMeta ? (
        <>
          <DsrDetailMetadata dsr={dsr} t={t} statusMeta={statusMeta} typeMeta={typeMeta} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <DsrDetailInfo dsr={dsr} t={t} />
              <DsrModuleExecutions dsr={dsr} t={t} />
            </div>

            <div className="space-y-6">
              <DsrDetailTimeline dsr={dsr} t={t} statusMetaMap={STATUS_META} />
              <DsrErasureState dsr={dsr} t={t} />
            </div>
          </div>
        </>
      ) : (
        <EmptyState
          icon={UserX}
          title={t("compliance.dsrNotFound")}
          description={t("compliance.dsrNotFoundDesc")}
          action={
            <Button variant="outline" onClick={() => router.push("/compliance/dsr")}>
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          }
        />
      )}

      {/* R5 — the typed-erasure guard. Comparing against the literal word
          CONFIRM is the safeguard itself and is frozen: it is deliberately
          NOT localized. Translating it would let an admin type the Arabic
          word shown on screen and silently fail a check written against the
          English literal — or, if the check were translated too, defeat the
          point of a fixed token an operator must consciously reproduce. */}
      <ConfirmationDialog
        open={isConfirmingErasure}
        onOpenChange={setIsConfirmingErasure}
        variant="destructive"
        title={t("compliance.confirmErasureDialogTitle")}
        description={t("compliance.confirmErasureDialogDesc")}
        confirmText={t("compliance.executeErasureBtn")}
        cancelText={t("common.cancel")}
        onConfirm={confirmErasure}
        isLoading={isConfirmingPending}
        disableConfirm={erasureInput !== "CONFIRM"}
      >
        <div className="space-y-3">
          <p className="text-sm font-medium text-nx-ink">{t("compliance.typeConfirmToContinue")}</p>
          <Input
            value={erasureInput}
            onChange={(e) => setErasureInput(e.target.value)}
            placeholder="CONFIRM"
            autoComplete="off"
            aria-label={t("compliance.typeConfirmToContinue")}
          />
        </div>
      </ConfirmationDialog>
    </div>
  );
}
