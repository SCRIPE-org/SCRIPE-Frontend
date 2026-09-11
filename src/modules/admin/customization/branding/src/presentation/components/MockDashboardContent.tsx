/**
 * MockDashboardContent Component
 *
 * Stitches together the mock widgets (title header, KPI stats grid, analytical charts,
 * and recent user activities table) to populate the customizer dashboard preview.
 */
// UI-EXCEPTION: compact studio layout - mock dashboard canvas preview controls
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { MockStatsGrid } from "./MockStatsGrid";
import { MockChartsRow } from "./MockChartsRow";
import { MockRecentUsersTable } from "./MockRecentUsersTable";

/**
 * Properties for the MockDashboardContent component.
 */
export interface MockDashboardContentProps {
  /** Optional custom CSS class name. */
  className?: string;
}

/**
 * Renders complete mockup dashboard content for appearance testing.
 */
export function MockDashboardContent({ className }: MockDashboardContentProps) {
  const { t } = useI18n();

  return (
    <div className={className ?? "space-y-6"}>
      {/* Page Title & Mock Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nx-ink">{t("studio.dashboardPreview.title")}</h1>
          <p className="mt-1 text-sm text-nx-ink-3">{t("studio.dashboardPreview.welcomeBack")}</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-nx-control border border-nx-line bg-nx-ground px-3 py-1.5 text-sm text-nx-ink">
            {t("studio.dashboardPreview.export")}
          </button>
          <button className="rounded-nx-control bg-nx-accent-fill px-3 py-1.5 text-sm text-nx-on-fill">
            {t("studio.dashboardPreview.newReport")}
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <MockStatsGrid />

      {/* Charts Row */}
      <MockChartsRow />

      {/* Recent Users Table */}
      <MockRecentUsersTable />
    </div>
  );
}
