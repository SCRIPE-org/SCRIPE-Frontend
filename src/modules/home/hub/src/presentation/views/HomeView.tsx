"use client";

/**
 * HomeView (Overview Page)
 *
 * Pure UI composition for the "/" route.
 * Displays welcome greeting and quick actions for ALL authenticated users.
 * KPI cards + recent activity only shown if user has `dashboard.view`.
 * Users without that permission see a MinimalWelcome card instead.
 */
import { useOverviewViewModel } from "../viewmodels/useOverviewViewModel";
import { useOverviewRealtime } from "../viewmodels/useOverviewRealtime";
import { WelcomeHeader } from "../components/WelcomeHeader";
import { QuickActionsGrid } from "../components/QuickActionsGrid";
import { MinimalWelcome } from "../components/MinimalWelcome";
import { usePermission } from "@core/hooks/use-permission";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import dynamic from "next/dynamic";

// Lazy-load below-fold components
const QuickStatsStrip = dynamic(
  () => import("../components/QuickStatsStrip").then((m) => ({ default: m.QuickStatsStrip })),
  { ssr: false }
);
const RecentActivityFeed = dynamic(
  () => import("../components/RecentActivityFeed").then((m) => ({ default: m.RecentActivityFeed })),
  { ssr: false }
);

/**
 * Presentation UI component rendering the home view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function HomeView() {
  const hasDashboardPerm = usePermission(SYSTEM_PERMISSIONS.DASHBOARD_VIEW);
  const vm = useOverviewViewModel(hasDashboardPerm);
  useOverviewRealtime(); // Silent real-time cache invalidation

  return (
    <div className="space-y-6">
      {/* Greeting — always shown */}
      <WelcomeHeader greeting={vm.greeting} displayName={vm.displayName} />

      {/* Quick Actions — always shown */}
      <QuickActionsGrid />

      {/* Dashboard data — only if user has permission */}
      {vm.hasDashboardPermission ? (
        <>
          <QuickStatsStrip
            data={vm.summary.data}
            isLoading={vm.summary.isLoading}
            error={vm.summary.error}
            onRetry={() => vm.summary.refetch()}
          />
          <RecentActivityFeed
            data={vm.recentActivity.data ?? []}
            isLoading={vm.recentActivity.isLoading}
            error={vm.recentActivity.error}
            onRetry={() => vm.recentActivity.refetch()}
          />
        </>
      ) : (
        <MinimalWelcome />
      )}
    </div>
  );
}
