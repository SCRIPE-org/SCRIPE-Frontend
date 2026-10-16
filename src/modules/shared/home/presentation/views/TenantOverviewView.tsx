"use client";

import React from "react";
import { useTenantOverviewViewModel } from "../viewmodels/useTenantOverviewViewModel";
import { MinimalWelcome } from "../components/MinimalWelcome";
import {
  TenantCommandHeader,
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
} from "../components/tenant-command-center";

/**
 * TenantOverviewView
 *
 * Dedicated Tenant Organization Control Center.
 * Faithful implementation of the approved SCRIPE Tenant Command Center V1 prototype.
 * Seamlessly integrates live backend telemetry with presentation showcase mode.
 * Adheres strictly to Clean Architecture (View -> ViewModel -> Repository -> Service -> IApiService).
 */
export function TenantOverviewView() {
  const vm = useTenantOverviewViewModel();

  if (!vm.hasDashboardPermission) {
    return <MinimalWelcome />;
  }

  const { data } = vm;

  return (
    <div className="mx-auto max-w-[1560px] space-y-4 pb-8">
      {/* 1. Header Bar */}
      <TenantCommandHeader
        tenantName={data.tenantName}
        isImpersonating={vm.isImpersonating}
        onRefresh={vm.refetchAll}
        isRefreshing={vm.isRefreshing}
      />

      {/* 2. Hero Pitch Banner with Readiness Ring */}
      <TenantHeroBanner
        tenantName={data.tenantName}
        readinessPercent={data.readinessPercent}
        setupStepsCompleted={data.setupStepsCompleted}
        setupStepsTotal={data.setupStepsTotal}
        metaPills={data.metaPills}
        readinessChecks={data.readinessChecks}
      />

      {/* 3. 4 Top KPI Cards */}
      <TenantKpiCards kpis={data.kpis} />

      {/* 4. Main 2-Column Dashboard Grid */}
      <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-[minmax(0,2fr)_minmax(310px,0.9fr)]">
        {/* Left Column (Main Operational Core) */}
        <div className="min-w-0 space-y-3.5">
          {/* Step 1: Get Started */}
          <TenantGetStartedSteps
            steps={data.steps}
            completedCount={data.setupStepsCompleted}
            totalCount={data.setupStepsTotal}
          />

          {/* Step 2: Your SCRIPE Products */}
          <TenantProductsSection products={data.products} />

          {/* Step 3: Organization Usage */}
          <TenantUsageGrid quotas={data.quotas} />

          {/* Step 4: Split Charts (Growth & Login Activity) */}
          <TenantActivityCharts
            loginActivity={vm.overviewVm.loginActivity.data}
            isPresentationMode={vm.isPresentationMode}
          />
        </div>

        {/* Right Column (Administrative Sidebar) */}
        <aside className="min-w-0 space-y-3.5">
          {/* Needs Attention */}
          <TenantNeedsAttention alerts={data.alerts} />

          {/* Quick Actions 2x2 Grid */}
          <TenantQuickActions actions={data.quickActions} />

          {/* Activity Feed */}
          <TenantRecentActivityFeed activityFeed={data.activityFeed} />

          {/* System Notices */}
          <TenantSystemNotices notices={data.systemNotices} />

          {/* Success Partner */}
          <TenantSuccessPartnerCard />
        </aside>
      </div>
    </div>
  );
}
