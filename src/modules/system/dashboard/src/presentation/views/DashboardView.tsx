"use client";

/**
 * Dashboard View — M9: Dashboard Theming
 *
 * Pure UI composition with:
 *  - Permission-gated sections
 *  - Real-time updates via SignalR
 *  - Themed via DashboardThemeConfig (greeting, KPI, charts, layout)
 *  - Dashboard Studio panel for customization
 *
 * Route-level guard: PAGE_PERMISSIONS["/dashboard"] = [DASHBOARD_VIEW]
 * Section-level guard: Security sections require SECURITY_VIEW
 */
import { useState } from "react";
import dynamic from "next/dynamic";
import { useDashboardViewModel } from "../viewmodels/useDashboardViewModel";
import { useDashboardRealtime } from "../viewmodels/useDashboardRealtime";
import { useDashboardTheme } from "../hooks/useDashboardTheme";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { KPICardsSection } from "../components/KPICardsSection";
import { DashboardStudioPanel } from "../components/DashboardStudioPanel";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Radio, FileDown, Settings2 } from "lucide-react";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { useAppStore } from "@core/store/useAppStore";

// Lazy-load heavy chart/section components (not above-the-fold)
const LoginActivityChart = dynamic(() => import("../components/LoginActivityChart").then(m => ({ default: m.LoginActivityChart })), { ssr: false });
const EventDistributionChart = dynamic(() => import("../components/EventDistributionChart").then(m => ({ default: m.EventDistributionChart })), { ssr: false });
const RecentChangesSection = dynamic(() => import("../components/RecentChangesSection").then(m => ({ default: m.RecentChangesSection })), { ssr: false });
const SecurityEventsSection = dynamic(() => import("../components/SecurityEventsSection").then(m => ({ default: m.SecurityEventsSection })), { ssr: false });
const BlockedIPsSection = dynamic(() => import("../components/BlockedIPsSection").then(m => ({ default: m.BlockedIPsSection })), { ssr: false });
const ReportExportDialog = dynamic(() => import("@core/ui/report-export-dialog").then(m => ({ default: m.ReportExportDialog })), { ssr: false });

const connectionColors = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-500 animate-pulse",
  reconnecting: "bg-amber-500 animate-pulse",
  disconnected: "bg-red-500",
} as const;

export function DashboardView() {
  const hasSecurityPerm = usePermission(SYSTEM_PERMISSIONS.SECURITY_VIEW);
  const vm = useDashboardViewModel(hasSecurityPerm);
  const { connectionState } = useDashboardRealtime();
  const { t, direction } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);

  // ── Dashboard Theming (M9) ──
  const theme = useDashboardTheme();
  const { config, layoutClasses, cardClasses } = theme;
  const admin = useAppStore((s) => s.user);

  // ── Greeting Resolution ──
  const resolvedGreeting = (() => {
    if (!config.greeting.enabled) return null;
    const name = admin?.firstName || admin?.username || "";
    const text = config.greeting.text
      ? config.greeting.text.replace("{name}", name)
      : `${t("dashboard.greeting") || "Welcome back"}, ${name}`;
    const subtitle = config.greeting.subtitle || t("dashboard.greetingSubtitle") || "Here's what's happening today";
    return { text, subtitle };
  })();

  return (
    <div className={layoutClasses.pageSpacing} dir={direction}>
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          {resolvedGreeting ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{resolvedGreeting.text}</h1>
              <p className="text-muted-foreground">{resolvedGreeting.subtitle}</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <CurrencyDisplayToggle />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            className="gap-1.5"
          >
            <FileDown className="h-4 w-4" />
            {t("export.button")}
          </Button>
          {/* Dashboard Studio Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => theme.setIsStudioOpen(true)}
            className="gap-1.5"
          >
            <Settings2 className="h-4 w-4" />
            {t("dashboard.studio.openButton") || "Customize"}
          </Button>
          <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
            <span className={`h-2 w-2 rounded-full ${connectionColors[connectionState]}`} />
            <Radio className="h-3 w-3" aria-hidden="true" />
            {t(`audit.realtime.${connectionState}`)}
          </Badge>
        </div>
      </div>

      {/* KPI Cards Row — themed */}
      <KPICardsSection
        data={vm.summary.data}
        isLoading={vm.summary.isLoading}
        error={vm.summary.error}
        onRetry={() => vm.summary.refetch()}
        cardClasses={cardClasses}
        gridClasses={layoutClasses.kpiGrid}
        chartPalette={config.charts.colorPalette}
      />

      {/* Charts Row: Login Activity + Event Distribution */}
      {(config.sections.loginActivity || config.sections.eventDistribution) && (
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${layoutClasses.sectionGap}`}>
          {config.sections.loginActivity && (
            <div className="lg:col-span-2">
              <LoginActivityChart
                data={vm.loginActivity.data ?? []}
                isLoading={vm.loginActivity.isLoading}
                error={vm.loginActivity.error}
                onRetry={() => vm.loginActivity.refetch()}
                chartPalette={config.charts.colorPalette}
              />
            </div>
          )}
          {config.sections.eventDistribution && (
            <div>
              <EventDistributionChart
                data={vm.eventDistribution.data ?? []}
                isLoading={vm.eventDistribution.isLoading}
                error={vm.eventDistribution.error}
                onRetry={() => vm.eventDistribution.refetch()}
                chartPalette={config.charts.colorPalette}
              />
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Recent Changes + Security (permission-gated) */}
      {(config.sections.recentChanges || (vm.hasSecurityPermission && config.sections.securityEvents)) && (
        <div className={`grid grid-cols-1 ${vm.hasSecurityPermission && config.sections.securityEvents ? "lg:grid-cols-2" : ""} ${layoutClasses.sectionGap}`}>
          {config.sections.recentChanges && (
            <RecentChangesSection
              data={vm.recentChanges.data ?? []}
              isLoading={vm.recentChanges.isLoading}
              error={vm.recentChanges.error}
              onRetry={() => vm.recentChanges.refetch()}
            />
          )}
          {vm.hasSecurityPermission && config.sections.securityEvents && (
            <SecurityEventsSection
              data={vm.securityEvents.data ?? []}
              isLoading={vm.securityEvents.isLoading}
              error={vm.securityEvents.error}
              onRetry={() => vm.securityEvents.refetch()}
            />
          )}
        </div>
      )}

      {/* Blocked IPs — security.view required + section toggle */}
      {vm.hasSecurityPermission && config.sections.blockedIPs && (
        <BlockedIPsSection
          data={vm.topBlockedIPs.data ?? []}
          isLoading={vm.topBlockedIPs.isLoading}
          error={vm.topBlockedIPs.error}
          onRetry={() => vm.topBlockedIPs.refetch()}
        />
      )}

      {/* Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={API_ENDPOINTS.DASHBOARD.EXPORT_OVERVIEW}
        titleKey="export.overview.title"
        descriptionKey="export.overview.description"
      />

      {/* Dashboard Studio Panel */}
      <DashboardStudioPanel
        open={theme.isStudioOpen}
        onClose={() => theme.setIsStudioOpen(false)}
        draft={theme.draft}
        onUpdateNested={theme.updateNested}
        onSave={theme.saveDraft}
        onDiscard={theme.discardDraft}
        onReset={theme.resetToDefault}
        isSaving={theme.isSaving}
        t={t}
      />
    </div>
  );
}
