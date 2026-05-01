"use client";

import { useRouter } from "next/navigation";
import { Clock, ChevronLeft, Trash2, Layers, RefreshCw } from "lucide-react";
import { useRetentionViewModel } from "../viewmodels/useRetentionViewModel";
import type { RetentionPolicy } from "../../domain/entities/RetentionPolicy";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";

function RetentionCard({ policy }: { policy: RetentionPolicy }) {
  const { t } = useI18n();
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/[0.15] transition-all duration-200 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${policy.isAnonymize ? "bg-teal-500/20" : "bg-rose-500/20"}`}>
            {policy.isAnonymize ? <Layers className="w-4 h-4 text-teal-400" /> : <Trash2 className="w-4 h-4 text-rose-400" />}
          </div>
          <div>
            <p className="text-sm text-white font-semibold">{policy.category}</p>
            <p className="text-xs text-slate-500 mt-0.5">{policy.legalBasis || "—"}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 border ${policy.isActive ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
          {policy.isActive ? t("compliance.active") : t("compliance.inactive")}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.05]">
        <div><p className="text-xs text-slate-500">{t("compliance.minRetention")}</p><p className="text-sm text-white font-medium mt-0.5">{policy.minRetentionDays}d</p></div>
        <div><p className="text-xs text-slate-500">{t("compliance.maxRetention")}</p><p className="text-sm text-white font-medium mt-0.5">{policy.maxRetentionDays}d</p></div>
        <div><p className="text-xs text-slate-500">{t("compliance.expiryAction")}</p><p className={`text-sm font-medium mt-0.5 ${policy.isAnonymize ? "text-teal-400" : "text-rose-400"}`}>{policy.isAnonymize ? t("compliance.anonymize") : t("compliance.delete")}</p></div>
        <div><p className="text-xs text-slate-500">{t("compliance.nextEvaluation")}</p><p className="text-sm text-white font-medium mt-0.5">{policy.nextEvaluationAt?.toLocaleDateString() ?? "—"}</p></div>
      </div>
      {policy.lastExecutionAt && (
        <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs text-slate-500">
          <span>{t("compliance.executionHistory")}: {policy.lastExecutionAt.toLocaleDateString()}</span>
          {policy.recordsProcessedLast != null && <span>{policy.recordsProcessedLast} {t("compliance.recordsProcessed")}</span>}
        </div>
      )}
    </div>
  );
}

export function RetentionView() {
  const { t } = useI18n();
  const router = useRouter();
  const { policies, activeCount, totalCount, isLoading, refetch } = useRetentionViewModel();

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/compliance")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors" aria-label="Back">
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.retentionPolicies")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{activeCount} {t("compliance.active")} · {totalCount} total</p>
            </div>
          </div>
          <Button id="compliance-retention-refresh" variant="outline" size="sm" onClick={() => refetch()} className="border-white/[0.08] text-slate-400 hover:text-white">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>
      <div className="px-8 py-6 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><div className="flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" /><p className="text-sm text-slate-500">{t("common.loading")}</p></div></div>
        ) : policies.length === 0 ? (
          <div className="flex items-center justify-center h-64 rounded-2xl border border-white/[0.08] bg-white/[0.03]"><div className="text-center"><Clock className="w-12 h-12 mx-auto mb-3 text-slate-700" /><p className="text-sm font-medium text-slate-400">{t("compliance.noPolicies")}</p></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{policies.map(p => <RetentionCard key={p.id} policy={p} />)}</div>
        )}
      </div>
    </div>
  );
}
