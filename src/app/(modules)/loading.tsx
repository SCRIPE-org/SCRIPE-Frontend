"use client";

import { ModulesLoadingSkeleton } from "@core/ui/layout/modules-loading-skeleton";

// Route-level Suspense fallback for every (modules) segment. Renders a shared
// DashboardLayout-compatible skeleton (header, KPI card strip, and table slab)
// inside NexusLayout's persistent chrome so unprefetched navigations never
// flash an empty canvas.
export default function ModulesLoading() {
  return <ModulesLoadingSkeleton />;
}
