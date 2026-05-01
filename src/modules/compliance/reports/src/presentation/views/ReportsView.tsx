"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  ChevronLeft,
  Download,
  Plus,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useReportViewModel } from "../viewmodels/useReportViewModel";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { Separator } from "@core/ui/separator";

function ReportCard({ report, t }: { report: ComplianceReport; t: (k: string) => string }) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2">
              <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-sm">{report.reportType}</CardTitle>
              <CardDescription className="mt-0.5 text-xs">{report.regulationCode}</CardDescription>
            </div>
          </div>
          <Badge variant={report.isReady ? "default" : "secondary"} className="flex-shrink-0">
            {report.isReady ? t("compliance.reportReady") : t("compliance.reportPending")}
          </Badge>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">{t("compliance.periodStart")}</p>
            <p className="mt-0.5 font-semibold">
              {report.periodStart?.toLocaleDateString() ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t("compliance.periodEnd")}</p>
            <p className="mt-0.5 font-semibold">{report.periodEnd?.toLocaleDateString() ?? "—"}</p>
          </div>
        </div>
        {report.isReady && report.downloadUrl ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => window.open(report.downloadUrl!, "_blank")}
          >
            <Download className="h-3.5 w-3.5" />
            {t("compliance.downloadReport")}
          </Button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t("compliance.reportPending")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ReportsView() {
  useModuleLocales(() => import("../../../locales"), "compliance-reports");
  const { t } = useI18n();
  const router = useRouter();
  const { reports, isLoading, refetch, generateReport, isGenerating } = useReportViewModel();
  const reportTypes = [
    "GDPR_Overview",
    "CCPA_Overview",
    "DSR_Summary",
    "Consent_Audit",
    "Retention_Audit",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push("/compliance")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.reportsTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("compliance.subtitle")}</p>
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
          <Button
            id="compliance-generate-report"
            size="sm"
            disabled={isGenerating}
            onClick={() => {}}
          >
            <Plus className="me-2 h-4 w-4" />
            {t("compliance.generateReport")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("compliance.generateReport")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {reportTypes.map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              onClick={() => generateReport({ reportType: type })}
            >
              {type.replace("_", " ")}
            </Button>
          ))}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[200px] rounded-xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t("compliance.noReports")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("compliance.generateReport")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r: ComplianceReport) => (
            <ReportCard key={r.id} report={r} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}
