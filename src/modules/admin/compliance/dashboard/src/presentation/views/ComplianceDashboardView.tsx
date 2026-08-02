"use client";

import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Globe,
} from "lucide-react";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { PageHeader } from "@core/ui/page-header";
import { StatCard } from "@core/ui/stat-card";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { usePermissions } from "@core/hooks/use-permissions";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";

// A figure that has not arrived yet, rather than a zero the reader would trust.
const NO_FIGURE = "—";

// The KPI grid keeps its column count across loading and loaded so the page
// never resettles when the figures land.
const KPI_GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Presentation UI component rendering the compliance dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ComplianceDashboardView() {
  useModuleLocales(() => import("../../../locales"), "compliance-dashboard");
  const { t, direction } = useI18n();
  const router = useRouter();
  const { dashboard, isLoading, isError, refetch } = useDashboardViewModel();
  const { hasPermission } = usePermissions();

  // "Go to this section" — a forward chevron, so it mirrors in Arabic.
  const ForwardIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  const kpis = [
    {
      label: t("compliance.openDsrs"),
      subtitle: t("compliance.openDsrsSubtitle"),
      value: dashboard ? dashboard.openDsrCount.toLocaleString() : NO_FIGURE,
      icon: Users,
      tone: "info" as const,
      href: "/compliance/dsr",
    },
    {
      label: t("compliance.slaCompliance"),
      subtitle: t("compliance.slaComplianceSubtitle"),
      value: dashboard?.slaComplianceDisplay ?? NO_FIGURE,
      icon: CheckCircle2,
      tone: "success" as const,
    },
    {
      label: t("compliance.overdueDsrs"),
      subtitle: t("compliance.overdueDsrsSubtitle"),
      value: dashboard ? dashboard.overdueDsrCount.toLocaleString() : NO_FIGURE,
      icon: AlertTriangle,
      tone: "danger" as const,
      href: "/compliance/dsr",
    },
    {
      label: t("compliance.consentOptIn"),
      subtitle: t("compliance.consentOptInSubtitle"),
      value: dashboard?.consentOptInDisplay ?? NO_FIGURE,
      icon: CheckCircle2,
      tone: "success" as const,
      href: "/compliance/consent",
    },
    {
      label: t("compliance.pendingDsrs"),
      subtitle: t("compliance.pendingDsrsSubtitle"),
      value: dashboard ? dashboard.pendingDsrCount.toLocaleString() : NO_FIGURE,
      icon: Clock,
      tone: "warning" as const,
      href: "/compliance/dsr",
    },
    {
      label: t("compliance.reConsentNeeded"),
      subtitle: t("compliance.reConsentNeededSubtitle"),
      value: dashboard ? dashboard.subjectsRequiringReConsent.toLocaleString() : NO_FIGURE,
      icon: AlertTriangle,
      tone: "warning" as const,
      href: "/compliance/consent",
    },
  ];

  const quickActions = [
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
  ].filter((action) => hasPermission(action.permission));

  const coverage = dashboard?.regulationCoverage ?? [];

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      <PageHeader
        className="mb-0"
        icon={Shield}
        title={t("compliance.title")}
        description={t("compliance.subtitle")}
        actions={
          <Button
            id="compliance-dashboard-refresh"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            loading={isLoading}
          >
            {!isLoading && <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />}
            {t("common.refresh")}
          </Button>
        }
      />

      {/* The figures have three states; the shortcuts below them have none —
          they are navigation and stay usable whatever the query did. */}
      {isError ? (
        <ErrorMessage message={t("common.error")} onRetry={() => refetch()} />
      ) : !isLoading && !dashboard ? (
        <EmptyState
          icon={Shield}
          title={t("common.noData")}
          description={t("compliance.subtitle")}
          action={
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="me-2 h-4 w-4 shrink-0" aria-hidden="true" />
              {t("common.refresh")}
            </Button>
          }
        />
      ) : (
        <div className={KPI_GRID}>
          {kpis.map((kpi) => (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              subtitle={kpi.subtitle}
              value={kpi.value}
              icon={kpi.icon}
              tone={kpi.tone}
              isLoading={isLoading}
              onClick={kpi.href ? () => router.push(kpi.href) : undefined}
            />
          ))}
        </div>
      )}

      {quickActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("compliance.quickActions")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {quickActions.map((action) => (
              <Button
                key={action.href}
                variant="outline"
                className="h-auto justify-between px-4 py-3"
                onClick={() => router.push(action.href)}
              >
                {action.label}
                <ForwardIcon className="ms-2 h-4 w-4 shrink-0" aria-hidden="true" />
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {coverage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("compliance.regulationCoverage")}</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-nx-line">
            {coverage.map((regulation) => (
              <div
                key={regulation.code}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-nx-md border border-info/30 bg-info/10 text-info"
                    aria-hidden="true"
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-nx-ink">{regulation.code}</p>
                    <p className="truncate text-xs text-nx-ink-2">{regulation.name}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs tabular-nums text-nx-ink-3">
                    {regulation.tenantsUsingCount.toLocaleString()} {t("compliance.tenants")}
                  </span>
                  <Badge variant={regulation.isActive ? "active" : "inactive"}>
                    {regulation.isActive ? t("compliance.active") : t("compliance.inactive")}
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
