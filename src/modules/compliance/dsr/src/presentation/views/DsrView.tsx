"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, ChevronLeft, RefreshCw, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useDsrViewModel } from "../viewmodels/useDsrViewModel";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";

// ── SLA Bar ───────────────────────────────────────────────────────────────────

function SlaBar({ percent, color }: { percent: number; color: string }) {
  const colorClass = {
    green: "bg-emerald-500",
    yellow: "bg-amber-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
  }[color] ?? "bg-slate-500";

  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
      <span className={`text-xs font-medium ${colorClass.replace("bg-", "text-")}`}>{percent}%</span>
    </div>
  );
}

// ── DSR Row ───────────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  Pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  InReview: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Approved: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Processing: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Completed: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
  Cancelled: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  PartiallyCompleted: "bg-teal-500/20 text-teal-300 border-teal-500/30",
};

function DsrRow({ dsr }: { dsr: DataSubjectRequest }) {
  const { t } = useI18n();
  const color = dsr.slaColor;

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-white truncate">{dsr.subjectEmail}</p>
        <p className="text-xs text-slate-500 mt-0.5">{dsr.regulationCode} · {dsr.requestType}</p>
      </div>
      <div>
        <Badge className={`text-xs border ${statusColors[dsr.status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
          {dsr.status}
        </Badge>
      </div>
      <SlaBar percent={dsr.slaPercent} color={color} />
      <div className="text-xs text-slate-400 whitespace-nowrap">
        {dsr.daysRemaining > 0
          ? `${dsr.daysRemaining}d ${t("compliance.remaining")}`
          : dsr.isCompleted ? t("compliance.completed") : t("compliance.overdue")}
      </div>
      <div>
        {dsr.isOverdue && <AlertTriangle className="w-4 h-4 text-red-400" />}
        {dsr.isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function DsrView() {
  const { t } = useI18n();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { dsrs, totalCount, isLoading, refetch } = useDsrViewModel({
    page: 1,
    pageSize: 50,
    status: statusFilter || undefined,
    requestType: typeFilter || undefined,
  });

  const statuses = ["", "Pending", "InReview", "Approved", "Processing", "Completed", "Rejected", "Cancelled"];
  const types = ["", "Export", "Erasure", "Rectification", "Restriction"];

  const overdue = dsrs.filter(d => d.isOverdue).length;
  const completed = dsrs.filter(d => d.isCompleted).length;

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/compliance")}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
              aria-label={t("common.back") ?? "Back"}
            >
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-indigo-600/30 border border-blue-500/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.dsrTitle")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalCount} {t("compliance.total") ?? "total"} · {overdue} {t("compliance.overdue")} · {completed} {t("compliance.completed")}
              </p>
            </div>
          </div>
          <Button
            id="compliance-dsr-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-white/[0.08] text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-5">

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(s => (
              <button
                key={s || "all"}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? "border-blue-500/50 bg-blue-500/20 text-blue-300" : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"}`}
              >
                {s || t("common.all") || "All"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {types.map(type => (
              <button
                key={type || "all-types"}
                onClick={() => setTypeFilter(type)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${typeFilter === type ? "border-violet-500/50 bg-violet-500/20 text-violet-300" : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white"}`}
              >
                {type || t("compliance.allTypes") || "All Types"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.subject")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.status")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.sla")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{t("compliance.deadline")}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider"></span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm text-slate-500">{t("common.loading")}</p>
              </div>
            </div>
          ) : dsrs.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-500">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-700" />
                <p className="text-sm font-medium text-slate-400">{t("compliance.noDsrs")}</p>
              </div>
            </div>
          ) : (
            dsrs.map(dsr => <DsrRow key={dsr.id} dsr={dsr} />)
          )}
        </div>
      </div>
    </div>
  );
}
