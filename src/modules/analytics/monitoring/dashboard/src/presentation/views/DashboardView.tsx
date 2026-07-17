"use client";

/**
 * Dashboard View — Hub with Tab Navigation
 *
 * The central dashboarding hub with tabs:
 *  - Overview: KPIs, charts, recent changes (inline)
 *  - Audit: Embedded AuditView
 *  - Security: Embedded SecurityDashboardView
 *  - Analytics: Embedded TenantAnalyticsView
 *
 * Each tab lazy-loads its content.
 * Individual route pages (/audit, /security, /analytics) still work standalone.
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
import { DASHBOARD_ENDPOINTS } from "../../data/services/dashboard.endpoints";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  Radio,
  FileDown,
  Settings2,
  Shield,
  BarChart3,
  ScrollText,
  LayoutDashboard,
} from "lucide-react";
import { CurrencyDisplayToggle } from "@core/ui/currency-display-toggle";
import { useAppStore } from "@core/store/useAppStore";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// Lazy-load heavy chart/section components (not above-the-fold)
const LoginActivityChart = dynamic(
  () => import("../components/LoginActivityChart").then((m) => ({ default: m.LoginActivityChart })),
  { ssr: false }
);
const EventDistributionChart = dynamic(
  () =>
    import("../components/EventDistributionChart").then((m) => ({
      default: m.EventDistributionChart,
    })),
  { ssr: false }
);
const RecentChangesSection = dynamic(
  () =>
    import("../components/RecentChangesSection").then((m) => ({ default: m.RecentChangesSection })),
  { ssr: false }
);
const ReportExportDialog = dynamic(
  () => import("@core/ui/report-export-dialog").then((m) => ({ default: m.ReportExportDialog })),
  { ssr: false }
);

// Lazy-load embedded sub-views
const AuditView = dynamic(
  () => import("@modules/monitoring/audit").then((m) => ({ default: m.AuditView })),
  { ssr: false }
);
const SecurityDashboardView = dynamic(
  () => import("@modules/monitoring/security").then((m) => ({ default: m.SecurityDashboardView })),
  { ssr: false }
);
const TenantAnalyticsView = dynamic(
  () => import("@modules/monitoring/analytics").then((m) => ({ default: m.TenantAnalyticsView })),
  { ssr: false }
);

const connectionColors = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-500 animate-pulse",
  reconnecting: "bg-amber-500 animate-pulse",
  disconnected: "bg-red-500",
} as const;

/**
 * Presentation UI component rendering the dashboard view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DashboardView() {
  useModuleLocales(() => import("../../../locales"), "dashboard");

  const hasSecurityPerm = usePermission(SYSTEM_PERMISSIONS.SECURITY_VIEW);
  const hasAuditPerm = usePermission(SYSTEM_PERMISSIONS.AUDIT_VIEW);
  const vm = useDashboardViewModel();
  const { connectionState } = useDashboardRealtime();
  const { t, direction } = useI18n();
  const [exportOpen, setExportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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
    const subtitle =
      config.greeting.subtitle ||
      t("dashboard.greetingSubtitle") ||
      "Here's what's happening today";
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

      {/* ── Tab Navigation ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:inline-grid lg:w-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard.tabs.overview") || "Overview"}
          </TabsTrigger>
          {hasAuditPerm && (
            <TabsTrigger value="audit" className="gap-1.5">
              <ScrollText className="h-4 w-4" />
              {t("dashboard.tabs.audit") || "Audit"}
            </TabsTrigger>
          )}
          {hasSecurityPerm && (
            <TabsTrigger value="security" className="gap-1.5">
              <Shield className="h-4 w-4" />
              {t("dashboard.tabs.security") || "Security"}
            </TabsTrigger>
          )}
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            {t("dashboard.tabs.analytics") || "Analytics"}
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="mt-6 space-y-6">
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

          {/* Recent Changes */}
          {config.sections.recentChanges && (
            <RecentChangesSection
              data={vm.recentChanges.data ?? []}
              isLoading={vm.recentChanges.isLoading}
              error={vm.recentChanges.error}
              onRetry={() => vm.recentChanges.refetch()}
            />
          )}
        </TabsContent>

        {/* ── Audit Tab ── */}
        {hasAuditPerm && (
          <TabsContent value="audit" className="mt-6">
            <AuditView />
          </TabsContent>
        )}

        {/* ── Security Tab ── */}
        {hasSecurityPerm && (
          <TabsContent value="security" className="mt-6">
            <SecurityDashboardView />
          </TabsContent>
        )}

        {/* ── Analytics Tab ── */}
        <TabsContent value="analytics" className="mt-6">
          <TenantAnalyticsView />
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <ReportExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        endpoint={DASHBOARD_ENDPOINTS.EXPORT_OVERVIEW}
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
        onBuilderCanvasChange={(canvas) => theme.updateDraft("builderCanvas", canvas)}
      />
    </div>
  );
}
