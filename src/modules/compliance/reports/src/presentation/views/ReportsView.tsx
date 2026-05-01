"use client";

import { useRouter } from "next/navigation";
import { FileText, ChevronLeft, Download, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useReportViewModel } from "../viewmodels/useReportViewModel";
import type { ComplianceReport } from "../../domain/entities/ComplianceReport";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";

function ReportCard({ report }: { report: ComplianceReport }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/[0.15] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-white font-semibold">{report.reportType}</p>
            <p className="text-xs text-slate-500 mt-0.5">{report.regulationCode}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 border ${report.isReady ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30"}`}>
          {report.isReady ? t("compliance.reportReady") : t("compliance.reportPending")}
        </span>
      </div>
      <div className="mt-4 pt-4 border-t border-white/[0.05] grid grid-cols-2 gap-3 text-xs">
        <div><p className="text-slate-500">{t("compliance.periodStart")}</p><p className="text-white mt-0.5">{report.periodStart?.toLocaleDateString() ?? "—"}</p></div>
        <div><p className="text-slate-500">{t("compliance.periodEnd")}</p><p className="text-white mt-0.5">{report.periodEnd?.toLocaleDateString() ?? "—"}</p></div>
      </div>
      {report.isReady && report.downloadUrl ? (
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex justify-end">
          <Button variant="outline" size="sm" className="h-7 text-xs border-white/[0.08] text-amber-400 hover:text-white gap-1.5" onClick={() => window.open(report.downloadUrl!, "_blank")}>
            <Download className="w-3.5 h-3.5" />{t("compliance.downloadReport")}
          </Button>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-white/[0.05] flex items-center gap-2 text-xs text-amber-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />{t("compliance.reportPending")}
        </div>
      )}
    </div>
  );
}

export function ReportsView() {
  const { t } = useI18n();
  const router = useRouter();
  const { reports, isLoading, refetch, generateReport, isGenerating } = useReportViewModel();
  const reportTypes = ["GDPR_Overview", "CCPA_Overview", "DSR_Summary", "Consent_Audit", "Retention_Audit"];

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/compliance")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors" aria-label="Back">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.reports")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t("compliance.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button id="compliance-reports-refresh" variant="outline" size="sm" onClick={() => refetch()} className="border-white/[0.08] text-slate-400 hover:text-white">
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button id="compliance-generate-report" size="sm" disabled={isGenerating} className="bg-amber-600 hover:bg-amber-500 text-white">
              <Plus className="w-4 h-4 me-2" />{t("compliance.generateReport")}
            </Button>
          </div>
        </div>
      </div>
      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">{t("compliance.generateReport")}</h2>
          <div className="flex flex-wrap gap-2">
            {reportTypes.map(type => (
              <button key={type} onClick={() => generateReport({ reportType: type })} className="text-xs px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-200">
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin" /></div>
        ) : reports.length === 0 ? (
          <div className="flex items-center justify-center h-48 rounded-2xl border border-white/[0.08] bg-white/[0.03]"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 text-slate-700" /><p className="text-sm text-slate-400">{t("compliance.noReports")}</p></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{reports.map(r => <ReportCard key={r.id} report={r} />)}</div>
        )}
      </div>
    </div>
  );
}
