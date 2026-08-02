"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, BarChart3, Clock, FileText, Info } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { PageHeader } from "@core/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { useReportDetailViewModel } from "../viewmodels/useReportDetailViewModel";
import { ReportStatusCard } from "../components/ReportStatusCard";
import { ReportMetadataGrid } from "../components/ReportMetadataGrid";

// ── Report type label keys ─────────────────────────────────────────────────────

const REPORT_TYPE_KEYS: Record<string, string> = {
  GDPR_Overview: "compliance.reportTypes.gdprOverview",
  DSR_Summary: "compliance.reportTypes.dsrSummary",
  Consent_Audit: "compliance.reportTypes.consentAudit",
  Retention_Analysis: "compliance.reportTypes.retentionAnalysis",
  Data_Inventory: "compliance.reportTypes.dataInventory",
};

// ── Report Detail View ─────────────────────────────────────────────────────────

/**
 * ReportDetailView Component
 *
 * Renders the detail view for a specific compliance report. Handles loading,
 * error and not-found states, and aggregates subcomponents for status and
 * metadata display.
 */
export function ReportDetailView({ id }: { id: string }) {
  useModuleLocales(() => import("../../../locales"), "compliance-reports");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ArrowRight : ArrowLeft;
  const {
    report,
    isLoading,
    isError,
    refetch,
    downloadFormat,
    setDownloadFormat,
    isDownloadingPending,
    downloadExport,
  } = useReportDetailViewModel(id);

  const typeKey = report ? (REPORT_TYPE_KEYS[report.reportType] ?? null) : null;
  const typeLabel = report ? (typeKey ? t(typeKey) : report.reportType) : "";

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={BarChart3}
        title={typeLabel || t("compliance.reportsTitle")}
        description={t("compliance.reportDetail")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance/reports")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
      />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4" role="status" aria-busy="true" aria-label={t("common.loading")}>
          <Skeleton className="h-40 w-full rounded-nx-lg" />
          <Skeleton className="h-56 w-full rounded-nx-lg" />
        </div>
      ) : isError ? (
        <ErrorMessage message={t("common.error")} onRetry={() => refetch()} />
      ) : report ? (
        <div className="space-y-4">
          <ReportStatusCard
            report={report}
            typeLabel={typeLabel}
            downloadFormat={downloadFormat}
            setDownloadFormat={setDownloadFormat}
            isDownloadingPending={isDownloadingPending}
            downloadExport={downloadExport}
          />

          <Alert variant="info">
            <Info className="h-4 w-4" aria-hidden="true" />
            <AlertTitle>{t("compliance.mvpExportTitle")}</AlertTitle>
            <AlertDescription>{t("compliance.mvpExportDesc")}</AlertDescription>
          </Alert>

          <ReportMetadataGrid report={report} />

          {report.isPending && (
            <Alert variant="info">
              {/* Static: the in-flight signal belongs on the status card, which
                  is where the work is actually being reported. A banner glyph
                  that spins is decoration. */}
              <Clock className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>{t("compliance.reportQueuedInfo")}</AlertTitle>
              <AlertDescription>{t("compliance.reportQueuedDesc")}</AlertDescription>
            </Alert>
          )}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={t("compliance.reportNotFound")}
          description={t("compliance.reportNotFoundDesc")}
          action={
            <Button variant="outline" onClick={() => router.push("/compliance/reports")}>
              <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.back")}
            </Button>
          }
        />
      )}
    </div>
  );
}
