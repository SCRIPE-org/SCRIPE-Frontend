'use client';

/**
 * HomeView (Overview Page)
 *
 * Pure UI composition for the "/" route.
 * Displays welcome greeting, quick KPIs, navigation actions, and recent activity.
 * All logic lives in useOverviewViewModel.
 */
import { useOverviewViewModel } from '../viewmodels/useOverviewViewModel';
import { useOverviewRealtime } from '../viewmodels/useOverviewRealtime';
import { WelcomeHeader } from '../components/WelcomeHeader';
import { QuickStatsStrip } from '../components/QuickStatsStrip';
import { QuickActionsGrid } from '../components/QuickActionsGrid';
import { RecentActivityFeed } from '../components/RecentActivityFeed';

export function HomeView() {
  const vm = useOverviewViewModel();
  useOverviewRealtime(); // Silent real-time cache invalidation

  return (
    <div className="space-y-8 p-6">
      {/* Greeting */}
      <WelcomeHeader greeting={vm.greeting} displayName={vm.displayName} />

      {/* KPI Strip */}
      <QuickStatsStrip
        data={vm.summary.data}
        isLoading={vm.summary.isLoading}
        error={vm.summary.error}
        onRetry={() => vm.summary.refetch()}
      />

      {/* Quick Actions */}
      <QuickActionsGrid />

      {/* Recent Activity */}
      <RecentActivityFeed
        data={vm.recentActivity.data ?? []}
        isLoading={vm.recentActivity.isLoading}
        error={vm.recentActivity.error}
        onRetry={() => vm.recentActivity.refetch()}
      />
    </div>
  );
}
