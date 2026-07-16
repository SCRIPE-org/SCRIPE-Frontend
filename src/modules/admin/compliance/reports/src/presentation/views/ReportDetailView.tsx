"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  FileText,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
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
 * error states, and aggregates subcomponents for status and metadata display.
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => router.push("/compliance/reports")}
        >
          <BackIcon className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.reportsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("compliance.reportDetail")}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[120px] rounded-xl" />
        </div>
      ) : isError ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <AlertTriangle className="mb-4 h-10 w-10 text-destructive" />
            <p className="font-semibold">{t("common.error")}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {t("common.refresh")}
            </Button>
          </CardContent>
        </Card>
      ) : report ? (
        <div className="space-y-4">
          {/* Status card */}
          <ReportStatusCard
            report={report}
            typeLabel={typeLabel}
            downloadFormat={downloadFormat}
            setDownloadFormat={setDownloadFormat}
            isDownloadingPending={isDownloadingPending}
            downloadExport={downloadExport}
          />

          {/* MVP Info banner */}
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400">
                  {t("compliance.mvpExportTitle")}
                </p>
                <p className="text-sm text-muted-foreground">{t("compliance.mvpExportDesc")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata grid */}
          <ReportMetadataGrid report={report} />

          {/* Pending info banner */}
          {report.isPending && (
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="flex items-start gap-3 p-4">
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-blue-500" />
                <div>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {t("compliance.reportQueuedInfo")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("compliance.reportQueuedDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
