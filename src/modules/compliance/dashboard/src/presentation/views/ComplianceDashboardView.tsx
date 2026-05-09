"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Globe,
} from "lucide-react";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Skeleton } from "@core/ui/skeleton";
import { Separator } from "@core/ui/separator";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

// ── Stat Card ─────────────────────────────────────────────────────────────────

const VARIANT_CARD: Record<string, string> = {
  default: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  success: "from-emerald-500/10 to-green-500/10 border-emerald-500/20",
  warning: "from-amber-500/10 to-yellow-500/10 border-amber-500/20",
  danger: "from-red-500/10 to-rose-500/10 border-red-500/20",
};
const VARIANT_ICON: Record<string, string> = {
  default: "text-blue-600 dark:text-blue-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-red-600 dark:text-red-400",
};

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
}

function StatCard({ title, subtitle, value, icon, variant = "default", onClick }: StatCardProps) {
  const content = (
    <Card
      className={`bg-gradient-to-br ${VARIANT_CARD[variant]} border transition-all hover:shadow-md ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`rounded-xl bg-background/80 p-3 shadow-sm ${VARIANT_ICON[variant]}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="mt-1 text-2xl font-bold tracking-tight">{value}</CardTitle>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {onClick && <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />}
      </CardContent>
    </Card>
  );
  return content;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      <Separator />
      <Skeleton className="h-[120px] rounded-xl" />
      <Skeleton className="h-[200px] rounded-xl" />
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function ComplianceDashboardView() {
  useModuleLocales(() => import("../../../locales"), "compliance-dashboard");
  const { t } = useI18n();
  const router = useRouter();
  const { dashboard, isLoading, refetch } = useDashboardViewModel();
  const { hasPermission } = usePermissions();

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("compliance.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("compliance.subtitle")}</p>
          </div>
        </div>
        <Button
          id="compliance-dashboard-refresh"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
        >
          <RefreshCw className="me-2 h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title={t("compliance.openDsrs")}
          subtitle={t("compliance.openDsrsSubtitle")}
          value={dashboard?.openDsrCount ?? "—"}
          icon={<Users className="h-5 w-5" />}
          variant="default"
          onClick={() => router.push("/compliance/dsr")}
        />
        <StatCard
          title={t("compliance.slaCompliance")}
          subtitle={t("compliance.slaComplianceSubtitle")}
          value={dashboard?.slaComplianceDisplay ?? "—"}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title={t("compliance.overdueDsrs")}
          subtitle={t("compliance.overdueDsrsSubtitle")}
          value={dashboard?.overdueDsrCount ?? "—"}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="danger"
          onClick={() => router.push("/compliance/dsr")}
        />
        <StatCard
          title={t("compliance.consentOptIn")}
          subtitle={t("compliance.consentOptInSubtitle")}
          value={dashboard?.consentOptInDisplay ?? "—"}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
          onClick={() => router.push("/compliance/consent")}
        />
        <StatCard
          title={t("compliance.pendingDsrs")}
          subtitle={t("compliance.pendingDsrsSubtitle")}
          value={dashboard?.pendingDsrCount ?? "—"}
          icon={<Clock className="h-5 w-5" />}
          variant="warning"
          onClick={() => router.push("/compliance/dsr")}
        />
        <StatCard
          title={t("compliance.reConsentNeeded")}
          subtitle={t("compliance.reConsentNeededSubtitle")}
          value={dashboard?.subjectsRequiringReConsent ?? "—"}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="warning"
          onClick={() => router.push("/compliance/consent")}
        />
      </div>

      <Separator />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("compliance.quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: t("compliance.manageDsr"),
              href: "/compliance/dsr",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_DSR_VIEW,
            },
            {
              label: t("compliance.manageConsent"),
              href: "/compliance/consent",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_CONSENT_VIEW,
            },
            {
              label: t("compliance.manageRetention"),
              href: "/compliance/retention",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_RETENTION_VIEW,
            },
            {
              label: t("compliance.viewInventory"),
              href: "/compliance/inventory",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_DATA_INVENTORY_VIEW,
            },
            {
              label: t("compliance.regulations"),
              href: "/compliance/regulations",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_REGULATIONS_VIEW,
            },
            {
              label: t("compliance.viewReports"),
              href: "/compliance/reports",
              permission: SYSTEM_PERMISSIONS.COMPLIANCE_REPORTS_VIEW,
            },
          ]
            .filter((action) => hasPermission(action.permission))
            .map((action) => (
              <Button
                key={action.href}
                variant="outline"
                className="h-auto justify-between px-4 py-3"
                onClick={() => router.push(action.href)}
              >
                {action.label}
                <ChevronRight className="ms-2 h-4 w-4 flex-shrink-0" />
              </Button>
            ))}
        </CardContent>
      </Card>

      {/* Regulation Coverage */}
      {(dashboard?.regulationCoverage?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("compliance.regulationCoverage")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {dashboard!.regulationCoverage.map((r) => (
              <div
                key={r.code}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-1.5">
                    <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.code}</p>
                    <p className="text-xs text-muted-foreground">{r.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {r.tenantsUsingCount} {t("compliance.tenants")}
                  </span>
                  <Badge variant={r.isActive ? "default" : "secondary"}>
                    {r.isActive ? t("compliance.active") : t("compliance.inactive")}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
