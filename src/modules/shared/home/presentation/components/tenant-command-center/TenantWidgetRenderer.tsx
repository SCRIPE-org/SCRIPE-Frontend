"use client";

import React, { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantOverviewWidgetItem } from "./tenantCustomizationTypes";
import type { TenantOverviewData, TenantLoginActivityItem } from "./tenantTypes";
import {
  TenantHeroBanner,
  TenantKpiCards,
  TenantGetStartedSteps,
  TenantProductsSection,
  TenantUsageGrid,
  TenantActivityCharts,
  TenantNeedsAttention,
  TenantQuickActions,
  TenantRecentActivityFeed,
  TenantSystemNotices,
  TenantSuccessPartnerCard,
} from "./index";

/**
 * Isolated Widget Error Boundary
 * Ensures a single failing widget never crashes the surrounding dashboard.
 */
interface WidgetErrorBoundaryProps {
  widgetTitle: string;
  children: ReactNode;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class WidgetErrorBoundary extends Component<WidgetErrorBoundaryProps, WidgetErrorBoundaryState> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[SCRIPE Widget Error] ${this.props.widgetTitle}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="flex min-h-[140px] flex-col items-center justify-center gap-2 border-destructive/20 bg-destructive/5 p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <p className="text-xs font-semibold text-destructive">{this.props.widgetTitle}</p>
          <p className="text-[11px] text-muted-foreground">
            This widget encountered an error while rendering.
          </p>
        </Card>
      );
    }
    return this.props.children;
  }
}

interface TenantWidgetRendererProps {
  item: TenantOverviewWidgetItem;
  data: TenantOverviewData;
  loginActivity?: TenantLoginActivityItem[];
  isPresentationMode?: boolean;
}

export function TenantWidgetRenderer({
  item,
  data,
  loginActivity,
  isPresentationMode,
}: TenantWidgetRendererProps) {
  const { t } = useI18n();
  const title = item.customTitle || item.widgetId;

  return (
    <WidgetErrorBoundary widgetTitle={title}>
      {(() => {
        switch (item.widgetId) {
          case "heroBanner":
            return (
              <TenantHeroBanner
                tenantName={data.tenantName}
                readinessPercent={data.readinessPercent}
                setupStepsCompleted={data.setupStepsCompleted}
                setupStepsTotal={data.setupStepsTotal}
                metaPills={data.metaPills}
                readinessChecks={data.readinessChecks}
              />
            );

          case "kpiCards":
            return <TenantKpiCards kpis={data.kpis} />;

          case "getStarted":
            return (
              <TenantGetStartedSteps
                steps={data.steps}
                completedCount={data.setupStepsCompleted}
                totalCount={data.setupStepsTotal}
              />
            );

          case "needsAttention":
            return <TenantNeedsAttention alerts={data.alerts} />;

          case "products":
            return <TenantProductsSection products={data.products} />;

          case "quickActions":
            return <TenantQuickActions actions={data.quickActions} />;

          case "usageGrid":
            return <TenantUsageGrid quotas={data.quotas} />;

          case "recentActivity":
            return <TenantRecentActivityFeed activityFeed={data.activityFeed} />;

          case "activityCharts":
            return (
              <TenantActivityCharts
                loginActivity={loginActivity}
                isPresentationMode={isPresentationMode}
              />
            );

          case "systemNotices":
            return <TenantSystemNotices notices={data.systemNotices} />;

          case "successPartner":
            return <TenantSuccessPartnerCard />;

          default:
            return (
              <Card className="flex min-h-[100px] items-center justify-center p-4 text-xs text-muted-foreground">
                {t("tenantCommandCenter.widgets.unknown") || "Unknown widget component"}
              </Card>
            );
        }
      })()}
    </WidgetErrorBoundary>
  );
}
