"use client";

import { useState } from "react";
import { Shield, FileSearch, Users, Clock, AlertTriangle, CheckCircle2, TrendingUp, BookOpen, Settings2, FileText, ChevronRight, Scale, Gavel } from "lucide-react";
import { useComplianceDashboard, useDsrList } from "../viewmodels/useComplianceViewModel";
import type { DsrData } from "../../domain/entities/ComplianceEntities";
import { DataSubjectRequest } from "../../domain/entities/ComplianceEntities";

// ── SLA Color helper ────────────────────────────────────────────────────────

function getSlaColor(pct: number) {
  if (pct >= 90) return "text-red-400";
  if (pct >= 75) return "text-orange-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-emerald-400";
}

function getSlaBarColor(pct: number) {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 75) return "bg-orange-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-emerald-500";
}

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  Pending: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
  InReview: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  Approved: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  Processing: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  PartiallyCompleted: "bg-orange-500/20 text-orange-300 border border-orange-500/30",
  Completed: "bg-emerald-600/30 text-emerald-200 border border-emerald-600/30",
  Rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
  Cancelled: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
};

const TYPE_BADGE: Record<string, string> = {
  Export: "bg-sky-500/20 text-sky-300",
  Erasure: "bg-rose-500/20 text-rose-300",
  Rectification: "bg-violet-500/20 text-violet-300",
  Restriction: "bg-amber-500/20 text-amber-300",
};

// ── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  accent: string;
}

function KpiCard({ icon, label, value, sub, accent }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-6 flex flex-col gap-3 hover:border-white/[0.15] transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-3xl font-bold text-white mt-0.5 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 ${accent.includes("emerald") ? "bg-emerald-500/5" : accent.includes("red") ? "bg-red-500/5" : accent.includes("blue") ? "bg-blue-500/5" : "bg-amber-500/5"}`} />
    </div>
  );
}

// ── DSR Row ───────────────────────────────────────────────────────────────────

function DsrRow({ dsr: rawDsr }: { dsr: DsrData }) {
  const dsr = new DataSubjectRequest(rawDsr);

  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.04] transition-colors duration-150 rounded-xl group cursor-pointer">
      {/* Subject */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate">{dsr.subjectEmail}</p>
        <p className="text-xs text-slate-500 mt-0.5">{dsr.regulationCode} • {dsr.subjectType}</p>
      </div>

      {/* Type */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_BADGE[dsr.requestType] ?? "bg-slate-500/20 text-slate-300"}`}>
        {dsr.requestType}
      </span>

      {/* Status */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[dsr.status] ?? ""}`}>
        {dsr.status}
      </span>

      {/* SLA */}
      <div className="w-28 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold tabular-nums ${getSlaColor(dsr.slaPercent)}`}>{dsr.slaPercent}%</span>
          <span className="text-xs text-slate-500">{dsr.daysRemaining}d</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getSlaBarColor(dsr.slaPercent)}`}
            style={{ width: `${dsr.slaPercent}%` }}
          />
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </div>
  );
}

// ── Regulation Coverage Card ──────────────────────────────────────────────────

function RegulationCard({ code, name, isActive }: { code: string; name: string; isActive: boolean }) {
  const Icon = code === "GDPR" ? Scale : code === "CCPA" ? Gavel : Shield;
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-white font-semibold">{code}</p>
        <p className="text-xs text-slate-500">{name}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ComplianceDashboardView() {
  const { dashboard, isLoading } = useComplianceDashboard();
  const { data: dsrResult, isLoading: dsrsLoading } = useDsrList({ pageSize: 8 });

  // Placeholder data during loading
  const kpiData = {
    openDsrs: dashboard?.openDsrCount ?? "—",
    pendingDsrs: dashboard?.pendingDsrCount ?? "—",
    overdueDsrs: dashboard?.overdueDsrCount ?? "—",
    slaCompliance: dashboard?.slaCompliancePercent != null ? `${dashboard.slaCompliancePercent.toFixed(0)}%` : "—",
    consentOptIn: dashboard?.consentOptInRate != null ? `${dashboard.consentOptInRate}%` : "—",
    requiresReConsent: dashboard?.subjectsRequiringReConsent ?? "—",
  };

  const dsrs = dsrResult?.items ?? [];
  const regulations = dashboard?.regulationCoverage ?? [
    { code: "GDPR", name: "General Data Protection Regulation", isActive: true, tenantsUsingCount: 0 },
    { code: "CCPA", name: "California Consumer Privacy Act", isActive: true, tenantsUsingCount: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* ── Header ── */}
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Compliance Center</h1>
              <p className="text-xs text-slate-500 mt-0.5">GDPR · CCPA · Multi-Regulation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="compliance-generate-report"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-slate-300 hover:text-white transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
            <button
              id="compliance-submit-dsr"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              <FileSearch className="w-4 h-4" />
              New DSR
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-w-[1600px] mx-auto space-y-8">

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            icon={<FileSearch className="w-5 h-5 text-blue-400" />}
            label="Open DSRs"
            value={kpiData.openDsrs}
            sub="Active requests"
            accent="bg-blue-500/20"
          />
          <KpiCard
            icon={<Clock className="w-5 h-5 text-yellow-400" />}
            label="Pending Review"
            value={kpiData.pendingDsrs}
            sub="Awaiting decision"
            accent="bg-yellow-500/20"
          />
          <KpiCard
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            label="Overdue"
            value={kpiData.overdueDsrs}
            sub="SLA breached"
            accent="bg-red-500/20"
          />
          <KpiCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            label="SLA Compliance"
            value={kpiData.slaCompliance}
            sub="On-time completion"
            accent="bg-emerald-500/20"
          />
          <KpiCard
            icon={<CheckCircle2 className="w-5 h-5 text-teal-400" />}
            label="Consent Opt-In"
            value={kpiData.consentOptIn}
            sub="Across all purposes"
            accent="bg-teal-500/20"
          />
          <KpiCard
            icon={<Users className="w-5 h-5 text-amber-400" />}
            label="Re-Consent Needed"
            value={kpiData.requiresReConsent}
            sub="Subjects to notify"
            accent="bg-amber-500/20"
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ── DSR Queue (2/3 width) ── */}
          <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="text-base font-semibold text-white">DSR Queue</h2>
              </div>
              <button
                id="compliance-view-all-dsrs"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                View All →
              </button>
            </div>

            {dsrsLoading ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                  <p className="text-sm">Loading requests...</p>
                </div>
              </div>
            ) : dsrs.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-slate-500">
                <div className="text-center">
                  <FileSearch className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <p className="text-sm font-medium">No data subject requests</p>
                  <p className="text-xs mt-1 text-slate-600">DSR submissions will appear here</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] px-2">
                {dsrs.map((dsr) => (
                  <DsrRow key={dsr.id} dsr={dsr} />
                ))}
              </div>
            )}
          </div>

          {/* ── Right Panel (1/3) ── */}
          <div className="flex flex-col gap-6">

            {/* Regulation Coverage */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-semibold text-white">Regulation Coverage</h2>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {regulations.map((reg) => (
                  <RegulationCard
                    key={reg.code}
                    code={reg.code}
                    name={reg.name}
                    isActive={reg.isActive}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
                <Settings2 className="w-5 h-5 text-slate-400" />
                <h2 className="text-base font-semibold text-white">Quick Actions</h2>
              </div>
              <div className="p-4 flex flex-col gap-2">
                {[
                  { id: "compliance-nav-consent", label: "Consent Management", icon: CheckCircle2, accent: "text-teal-400" },
                  { id: "compliance-nav-retention", label: "Retention Policies", icon: Clock, accent: "text-blue-400" },
                  { id: "compliance-nav-inventory", label: "Data Inventory", icon: FileSearch, accent: "text-violet-400" },
                  { id: "compliance-nav-reports", label: "Reports", icon: FileText, accent: "text-amber-400" },
                ].map(({ id, label, icon: Icon, accent }) => (
                  <button
                    key={id}
                    id={id}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] text-left transition-all duration-200 group"
                  >
                    <Icon className={`w-4 h-4 ${accent}`} />
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
