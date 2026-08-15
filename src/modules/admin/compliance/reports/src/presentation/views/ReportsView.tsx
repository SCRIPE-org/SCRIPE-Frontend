// FILE-EXCEPTION: file length
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
  BarChart3,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { useReportViewModel } from "../viewmodels/useReportViewModel";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardHeader } from "@core/ui/card";
import { PageHeader } from "@core/ui/page-header";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Label } from "@core/ui/label";
import { DatePicker } from "@core/ui/date-picker";
import { toast } from "@core/hooks/use-enhanced-toast";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { overlayFooterClasses } from "@core/ui/dialog";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";
import { formatUtc } from "@core/common/utils";

// ── Report type metadata ───────────────────────────────────────────────────────

const REPORT_TYPES = [
  { value: "GDPR_Overview", labelKey: "compliance.reportTypes.gdprOverview", regulation: "GDPR" },
  { value: "DSR_Summary", labelKey: "compliance.reportTypes.dsrSummary", regulation: "GDPR" },
  { value: "Consent_Audit", labelKey: "compliance.reportTypes.consentAudit", regulation: "CCPA" },
  {
    value: "Retention_Analysis",
    labelKey: "compliance.reportTypes.retentionAnalysis",
    regulation: "GDPR",
  },
  { value: "Data_Inventory", labelKey: "compliance.reportTypes.dataInventory", regulation: "CCPA" },
];

// Status speaks through the measured semantic badge tones; "Generating" is the
// only one that moves, and it moves through the shared loader rather than a
// hand-spun glyph.
const STATUS_META: Record<
  string,
  {
    labelKey: string;
    variant: "success" | "info" | "pending" | "error";
    icon: LucideIcon | null;
  }
> = {
  Ready: { labelKey: "compliance.status.ready", variant: "success", icon: CheckCircle2 },
  Generating: { labelKey: "compliance.status.generating", variant: "info", icon: null },
  Pending: { labelKey: "compliance.status.pending", variant: "pending", icon: Clock },
  Failed: { labelKey: "compliance.status.failed", variant: "error", icon: AlertTriangle },
};

const DATE_PATTERN = "MMM d, yyyy";

// ── Generate Dialog ─────────────────────────────────────────────────────────

function GenerateReportDialog({
  open,
  onOpenChange,
  onGenerate,
  isGenerating,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onGenerate: (data: {
    reportType: string;
    regulationCode?: string;
    periodStart?: string;
    periodEnd?: string;
  }) => Promise<void>;
  isGenerating: boolean;
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    reportType: REPORT_TYPES[0].value,
    periodStart: "",
    periodEnd: "",
  });

  const selectedType = REPORT_TYPES.find((r) => r.value === form.reportType);

  const handleGenerate = async () => {
    await onGenerate({
      reportType: form.reportType,
      regulationCode: selectedType?.regulation,
      periodStart: form.periodStart || undefined,
      periodEnd: form.periodEnd || undefined,
    });
    onOpenChange(false);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("compliance.generateReport")}
      description={t("compliance.generateReportDesc")}
      size="md"
      formKey={open ? "report-generate" : undefined}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5">
          <Label>{t("compliance.reportType")}</Label>
          <GenericSelect
            options={REPORT_TYPES.map((r) => ({
              value: r.value,
              label: `${t(r.labelKey)} — ${r.regulation}`,
              description: r.regulation,
            }))}
            value={form.reportType}
            onValueChange={(v: string | string[]) =>
              setForm((f) => ({ ...f, reportType: v as string }))
            }
            placeholder={t("compliance.reportType")}
            type="single"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="report-period-start">{t("compliance.periodStart")}</Label>
            <DatePicker
              id="report-period-start"
              value={form.periodStart}
              onChange={(v) => setForm((f) => ({ ...f, periodStart: v }))}
              placeholder={t("compliance.periodStart")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-period-end">{t("compliance.periodEnd")}</Label>
            <DatePicker
              id="report-period-end"
              value={form.periodEnd}
              onChange={(v) => setForm((f) => ({ ...f, periodEnd: v }))}
              placeholder={t("compliance.periodEnd")}
            />
          </div>
        </div>
        <Alert variant="info">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{t("compliance.reportQueuedInfo")}</AlertDescription>
        </Alert>
        {/* Cancel first in DOM, primary last — the shared overlay footer law. */}
        <div className={`${overlayFooterClasses} border-t border-nx-line pt-4`}>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button id="report-generate-confirm" onClick={handleGenerate} loading={isGenerating}>
            {!isGenerating && <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />}
            {isGenerating ? t("common.loading") : t("compliance.generateReport")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}

// ── Report Card ────────────────────────────────────────────────────────────────

function ReportCard({ report }: { report: ComplianceReport }) {
  const { t } = useI18n();
  const router = useRouter();
  const meta = STATUS_META[report.status] ?? STATUS_META.Pending;
  const StatusIcon = meta.icon;
  const typeLabelKey = REPORT_TYPES.find((r) => r.value === report.reportType)?.labelKey;
  const typeLabel = typeLabelKey ? t(typeLabelKey) : report.reportType;
  const openDetail = () => router.push(`/compliance/reports/${report.id}`);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={openDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDetail();
        }
      }}
      className="cursor-pointer focus-visible:shadow-nx-focus focus-visible:outline-none active:shadow-[inset_0_0_0_1px_var(--nx-accent)]"
    >
      {/* One block, so the card's padded header slot IS the body — CardContent
          is pt-0 by contract and would sit flush against the card's top edge. */}
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border ${
                report.isReady
                  ? "border-success/30 bg-success/10 text-success"
                  : "border-nx-line bg-nx-raised text-nx-ink-3"
              }`}
              aria-hidden="true"
            >
              {report.isPending ? (
                <LoadingSpinner size="inline" showText={false} />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-nx-ink">{typeLabel}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {report.regulationCode && (
                  <Badge variant="outline" className="font-mono">
                    {report.regulationCode}
                  </Badge>
                )}
                <Badge variant={meta.variant}>
                  {StatusIcon ? (
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    <LoadingSpinner size="inline" showText={false} />
                  )}
                  {t(meta.labelKey)}
                </Badge>
              </div>
              {(report.periodStart || report.periodEnd) && (
                <p className="mt-1.5 flex items-center gap-1 text-xs tabular-nums text-nx-ink-2">
                  <Calendar className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {formatUtc(report.periodStart, DATE_PATTERN)} –{" "}
                  {formatUtc(report.periodEnd, DATE_PATTERN)}
                </p>
              )}
              {report.generatedAt && (
                <p className="mt-1 text-xs text-nx-ink-2">
                  {t("compliance.generatedAt")}:{" "}
                  <span className="font-medium tabular-nums text-nx-ink">
                    {formatUtc(report.generatedAt, DATE_PATTERN)}
                  </span>
                </p>
              )}
            </div>
          </div>
          {/* The row is activatable, so the controls inside it must not bubble. */}
          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {report.isReady && report.downloadUrl && (
              <Button
                id={`report-download-${report.id}`}
                variant="outline"
                size="sm"
                onClick={() => window.open(report.downloadUrl!, "_blank")}
              >
                <Download className="me-1.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {t("compliance.downloadReport")}
              </Button>
            )}
            <Button id={`report-view-${report.id}`} variant="ghost" size="sm" onClick={openDetail}>
              {t("common.view")}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the reports view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ReportsView() {
  useModuleLocales(() => import("../../../locales"), "compliance-reports");
  const { t, direction } = useI18n();
  const router = useRouter();
  const BackIcon = direction === "rtl" ? ChevronRight : ChevronLeft;
  const { tenantCode } = useAppStore();
  const canGenerate = usePermission(SYSTEM_PERMISSIONS.COMPLIANCE_REPORTS_GENERATE) && !!tenantCode;

  const [generateOpen, setGenerateOpen] = useState(false);
  const { reports, totalCount, isLoading, isError, refetch, generateReport, isGenerating } =
    useReportViewModel();

  const readyCount = reports.filter((r) => r.isReady).length;
  const pendingCount = reports.filter((r) => r.isPending).length;

  const handleGenerate = async (data: {
    reportType: string;
    regulationCode?: string;
    periodStart?: string;
    periodEnd?: string;
  }) => {
    try {
      await generateReport(data);
      toast({
        title: t("compliance.reportQueued"),
        description: t("compliance.reportQueuedDesc"),
      });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  const generateButton = (
    <Button id="compliance-reports-generate" size="sm" onClick={() => setGenerateOpen(true)}>
      <Plus className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
      {t("compliance.generateReport")}
    </Button>
  );

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={BarChart3}
        title={t("compliance.reportsTitle")}
        description={t("compliance.reportsDescription")}
        eyebrow={
          <Button variant="ghost" size="sm" onClick={() => router.push("/compliance")}>
            <BackIcon className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("common.back")}
          </Button>
        }
        meta={[
          { label: t("compliance.status.ready"), value: readyCount.toLocaleString() },
          { label: t("compliance.status.pending"), value: pendingCount.toLocaleString() },
          { label: t("common.total"), value: totalCount.toLocaleString() },
        ]}
        actions={
          <>
            <Button
              id="compliance-reports-refresh"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              loading={isLoading}
            >
              {!isLoading && <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />}
              {t("common.refresh")}
            </Button>
            {canGenerate && generateButton}
          </>
        }
      />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3" role="status" aria-busy="true" aria-label={t("common.loading")}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-nx-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorMessage message={t("common.error")} onRetry={() => refetch()} />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title={t("compliance.noReports")}
          description={t("compliance.noReportsDesc")}
          action={canGenerate ? generateButton : undefined}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report: ComplianceReport) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}

      <GenerateReportDialog
        open={generateOpen}
        onOpenChange={setGenerateOpen}
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
      />
    </div>
  );
}
