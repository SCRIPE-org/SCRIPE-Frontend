"use client";

import { usePlatformCommandCenterViewModel } from "../viewmodels/usePlatformCommandCenterViewModel";
import { MinimalWelcome } from "../components/MinimalWelcome";
import { MonitoringOverview } from "../components/MonitoringOverview";

/**
 * Platform overview for a super admin.
 * Live data comes from the existing command-center view model.
 * Presentation mode and mock telemetry are not rendered here.
 */
export function PlatformOverviewView() {
  const vm = usePlatformCommandCenterViewModel();

  if (!vm.hasDashboardPermission) {
    return <MinimalWelcome />;
  }

  return <MonitoringOverview vm={vm} />;
}
