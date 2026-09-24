"use client";

import React, { useState } from "react";
import { usePlatformCommandCenterViewModel } from "../viewmodels/usePlatformCommandCenterViewModel";
import { usePresentationMode } from "../viewmodels/usePresentationMode";
import { PLATFORM_MOCK_DATA } from "../components/platform-command-center/data/platformMockData";
import { MinimalWelcome } from "../components/MinimalWelcome";
import {
  PlatformCommandHeader,
  PlatformKpiCards,
  PlatformActivityMap,
  PlatformNeedsAttention,
  PlatformServiceHealth,
  PlatformRecommendedActions,
  PlatformOperationalActivity,
  PlatformCustomizeDrawer,
  PlatformCommandFooter,
} from "../components/platform-command-center";

/**
 * PlatformOverviewView
 *
 * Grounded Platform Command Center V4 for global Platform SuperAdmins.
 * Built with strict SCRIPE design tokens, comprehensive EN/AR localization,
 * and live telemetry orchestration via usePlatformCommandCenterViewModel.
 */
export function PlatformOverviewView() {
  const vm = usePlatformCommandCenterViewModel();
  const { isPresentationMode } = usePresentationMode();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!vm.hasDashboardPermission) {
    return <MinimalWelcome />;
  }

  const effectiveSummary = isPresentationMode ? PLATFORM_MOCK_DATA.summary : vm.summary;
  const effectiveLoginActivity = isPresentationMode ? PLATFORM_MOCK_DATA.loginActivity : vm.loginActivity;
  const effectiveRecentChanges = isPresentationMode ? PLATFORM_MOCK_DATA.recentChanges : vm.recentChanges;
  const effectiveRegionNodes = isPresentationMode ? PLATFORM_MOCK_DATA.regionNodes : vm.regionNodes;

  const showMiddleRow = vm.visibleSections.activity || vm.visibleSections.attention;
  const showBottomRow =
    vm.visibleSections.serviceHealth ||
    vm.visibleSections.recommendedActions ||
    vm.visibleSections.operationalActivity;

  return (
    <div className="space-y-4 max-w-[1520px] mx-auto pb-6">
      {/* 1. Header with Controls, Live Toggle, & Customization Drawer */}
      <PlatformCommandHeader
        onRefresh={vm.refetchAll}
        isRefreshing={vm.isRefreshing}
        onOpenCustomize={() => setIsDrawerOpen(true)}
        isLive={vm.isLive}
        onToggleLive={vm.toggleLive}
        timeRangeKey={vm.timeRangeKey}
        onChangeTimeRange={vm.setTimeRangeKey}
      />

      {/* 2. Top 4 Pulse KPI Cards with SVG Sparklines */}
      <PlatformKpiCards
        summary={effectiveSummary}
        healthVm={vm.healthVm}
        isLoading={vm.isLoading}
        kpis={vm.kpis}
      />

      {/* 3. Middle Section: Global Operations Map + Needs Attention */}
      {showMiddleRow && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.92fr)_minmax(350px,0.86fr)] gap-3 items-stretch">
          {vm.visibleSections.activity && (
            <div className={vm.visibleSections.attention ? "" : "lg:col-span-2"}>
              <PlatformActivityMap
                summary={effectiveSummary}
                loginActivity={effectiveLoginActivity}
                recentActivity={effectiveRecentChanges}
                healthVm={vm.healthVm}
                regionNodes={effectiveRegionNodes}
                isLoading={vm.isLoading}
              />
            </div>
          )}

          {vm.visibleSections.attention && (
            <div className={vm.visibleSections.activity ? "" : "lg:col-span-2"}>
              <PlatformNeedsAttention
                summary={vm.summary}
                healthVm={vm.healthVm}
                isLoading={vm.isLoading}
                alerts={vm.attentionAlerts}
              />
            </div>
          )}
        </div>
      )}

      {/* 4. Bottom Section: Service Health + Recommended Actions + Operational Activity */}
      {showBottomRow && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[0.92fr_1.1fr_0.98fr] gap-3 items-stretch">
          {vm.visibleSections.serviceHealth && (
            <div>
              <PlatformServiceHealth
                healthVm={vm.healthVm}
                services={vm.services}
                overallScore={vm.kpis.overallHealthScore}
              />
            </div>
          )}

          {vm.visibleSections.recommendedActions && (
            <div>
              <PlatformRecommendedActions actions={vm.recommendedActions} />
            </div>
          )}

          {vm.visibleSections.operationalActivity && (
            <div className="md:col-span-2 lg:col-span-1">
              <PlatformOperationalActivity
                activities={vm.operationalActivity}
                isLoading={vm.isLoading}
              />
            </div>
          )}
        </div>
      )}

      {/* 5. Customization Slide-Out Drawer */}
      <PlatformCustomizeDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        visibleSections={vm.visibleSections}
        onToggleSection={vm.toggleSection}
        onReset={vm.resetSections}
      />

      {/* 6. Footer */}
      <PlatformCommandFooter />
    </div>
  );
}
