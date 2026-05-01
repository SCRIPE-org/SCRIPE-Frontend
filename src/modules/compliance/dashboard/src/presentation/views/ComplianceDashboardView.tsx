"use client";

import { useRouter } from "next/navigation";
import {
  Shield, Users, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, RefreshCw, Globe,
} from "lucide-react";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function KpiCard({ label, subtitle, value, icon, color, onClick }: KpiCardProps) {
  return (
    <button
      onClick={onClick}
      className="text-start w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {onClick && <ChevronRight className="w-4 h-4 text-slate-600 mt-1" />}
      </div>
      <p className="text-2xl font-bold text-white mt-4">{value}</p>
      <p className="text-sm text-white font-medium mt-1">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </button>
  );
}

// ── Regulation Badge ──────────────────────────────────────────────────────────

function RegulationBadge({ code, name, isActive, tenantsUsingCount }: {
  code: string; name: string; isActive: boolean; tenantsUsingCount: number;
}) {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{code}</p>
          <p className="text-xs text-slate-500">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">{tenantsUsingCount} {t("compliance.tenants")}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-500/20 text-emerald-300" : "bg-slate-500/20 text-slate-400"}`}>
          {isActive ? t("compliance.active") : t("compliance.inactive")}
        </span>
      </div>
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ComplianceDashboardView() {
  const { t } = useI18n();
  const router = useRouter();
  const { dashboard, isLoading, refetch } = useDashboardViewModel();

  return (
    <div className="min-h-screen bg-[#0d0f14] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.08] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">{t("compliance.title")}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{t("compliance.subtitle")}</p>
            </div>
          </div>
          <Button
            id="compliance-dashboard-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-white/[0.08] text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="px-8 py-6 max-w-[1600px] mx-auto space-y-8">

        {/* KPI Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard
            label={t("compliance.openDsrs")}
            subtitle={t("compliance.openDsrsSubtitle")}
            value={dashboard?.openDsrCount ?? "—"}
            icon={<Users className="w-5 h-5 text-blue-400" />}
            color="bg-blue-500/20"
            onClick={() => router.push("/compliance/dsr")}
          />
          <KpiCard
            label={t("compliance.slaCompliance")}
            subtitle={t("compliance.slaComplianceSubtitle")}
            value={dashboard?.slaComplianceDisplay ?? "—"}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            color="bg-emerald-500/20"
          />
          <KpiCard
            label={t("compliance.overdueDsrs")}
            subtitle={t("compliance.overdueDsrsSubtitle")}
            value={dashboard?.overdueDsrCount ?? "—"}
            icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
            color="bg-red-500/20"
            onClick={() => router.push("/compliance/dsr")}
          />
          <KpiCard
            label={t("compliance.consentOptIn")}
            subtitle={t("compliance.consentOptInSubtitle")}
            value={dashboard?.consentOptInDisplay ?? "—"}
            icon={<CheckCircle2 className="w-5 h-5 text-teal-400" />}
            color="bg-teal-500/20"
            onClick={() => router.push("/compliance/consent")}
          />
          <KpiCard
            label={t("compliance.pendingDsrs")}
            subtitle={t("compliance.pendingDsrsSubtitle")}
            value={dashboard?.pendingDsrCount ?? "—"}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            color="bg-amber-500/20"
            onClick={() => router.push("/compliance/dsr")}
          />
          <KpiCard
            label={t("compliance.reConsentNeeded")}
            subtitle={t("compliance.reConsentNeededSubtitle")}
            value={dashboard?.subjectsRequiringReConsent ?? "—"}
            icon={<AlertTriangle className="w-5 h-5 text-orange-400" />}
            color="bg-orange-500/20"
            onClick={() => router.push("/compliance/consent")}
          />
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">{t("compliance.quickActions")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t("compliance.manageDsr"), href: "/compliance/dsr" },
              { label: t("compliance.manageConsent"), href: "/compliance/consent" },
              { label: t("compliance.manageRetention"), href: "/compliance/retention" },
              { label: t("compliance.viewInventory"), href: "/compliance/inventory" },
            ].map((action) => (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-200"
              >
                {action.label}
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Regulation Coverage */}
        {(dashboard?.regulationCoverage?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold text-white mb-4">{t("compliance.regulationCoverage")}</h2>
            <div>
              {dashboard!.regulationCoverage.map((r) => (
                <RegulationBadge key={r.code} {...r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
