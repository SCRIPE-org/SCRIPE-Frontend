// FILE-EXCEPTION: file length
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  BarChart3,
  Calendar,
} from "lucide-react";
import { useReportViewModel } from "../viewmodels/useReportViewModel";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Label } from "@core/ui/label";
import { DatePicker } from "@core/ui/date-picker";
import { toast } from "@core/ui/use-toast";
import { GenericModal } from "@core/crud/components/generic-modal";
import { GenericSelect } from "@core/crud/components/generic-select";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { useAppStore } from "@/core/store/useAppStore";

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

const STATUS_META: Record<
  string,
  {
    labelKey: string;
    variant: "default" | "secondary" | "outline" | "destructive";
    icon: React.ReactNode;
  }
> = {
  Ready: {
    labelKey: "compliance.status.ready",
    variant: "default",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  Generating: {
    labelKey: "compliance.status.generating",
    variant: "secondary",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  Pending: {
    labelKey: "compliance.status.pending",
    variant: "outline",
    icon: <Clock className="h-3 w-3" />,
  },
  Failed: {
    labelKey: "compliance.status.failed",
    variant: "destructive",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
};

// ── Report type options for GenericSelect ──────────────────────────────────────

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
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-600 dark:text-blue-400">
            {t("compliance.reportQueuedInfo")}
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button id="report-generate-confirm" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                {t("common.loading")}
              </>
            ) : (
              <>
                <Plus className="me-2 h-4 w-4" />
                {t("compliance.generateReport")}
              </>
            )}
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
  const typeLabelKey = REPORT_TYPES.find((r) => r.value === report.reportType)?.labelKey;
  const typeLabel = typeLabelKey ? t(typeLabelKey) : report.reportType;

  return (
    <Card
      className={`cursor-pointer border transition-all hover:shadow-md ${report.isReady ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-green-500/5" : "border-border/50"}`}
      onClick={() => router.push(`/compliance/reports/${report.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${report.isReady ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border-border/50 bg-muted/50 text-muted-foreground"}`}
            >
              {report.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{typeLabel}</p>
              <div className="mt-1 flex items-center gap-2">
                {report.regulationCode && (
                  <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
                    {report.regulationCode}
                  </Badge>
                )}
                <Badge variant={meta.variant} className="h-5 gap-1 px-1.5 text-[10px]">
                  {meta.icon}
                  {t(meta.labelKey)}
                </Badge>
              </div>
              {(report.periodStart || report.periodEnd) && (
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {report.periodStart?.toLocaleDateString()} –{" "}
                  {report.periodEnd?.toLocaleDateString()}
                </div>
              )}
              {report.generatedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("compliance.period")}:{" "}
                  <span className="font-medium text-foreground">
                    {report.generatedAt.toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {report.isReady && report.downloadUrl && (
              <Button
                id={`report-download-${report.id}`}
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => window.open(report.downloadUrl!, "_blank")}
              >
                <Download className="me-1.5 h-3 w-3" />
                {t("compliance.downloadReport")}
              </Button>
            )}
            <Button
              id={`report-view-${report.id}`}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => router.push(`/compliance/reports/${report.id}`)}
            >
              {t("common.view")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

/**
 * React presentation component representing the reports view UI element.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => router.push("/compliance")}
          >
            <BackIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/15 to-blue-500/10 p-2.5 shadow-sm">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{t("compliance.reportsTitle")}</h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{readyCount}</span>{" "}
                {t("compliance.reportReady")}
                {pendingCount > 0 && (
                  <>
                    {" · "}
                    <span className="font-medium text-amber-500">{pendingCount}</span>{" "}
                    <span className="text-amber-500">{t("compliance.reportPending")}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="compliance-reports-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className={`me-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("common.refresh")}
          </Button>
          {canGenerate && (
            <Button
              id="compliance-reports-generate"
              size="sm"
              onClick={() => setGenerateOpen(true)}
            >
              <Plus className="me-2 h-4 w-4" />
              {t("compliance.generateReport")}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
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
      ) : reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <BarChart3 className="h-8 w-8 text-indigo-500" />
            </div>
            <p className="font-semibold">{t("compliance.noReports")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("compliance.noReportsDesc")}</p>
            {canGenerate && (
              <Button className="mt-4" size="sm" onClick={() => setGenerateOpen(true)}>
                <Plus className="me-2 h-4 w-4" />
                {t("compliance.generateReport")}
              </Button>
            )}
          </CardContent>
        </Card>
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
