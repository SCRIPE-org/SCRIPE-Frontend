"use client";

import { Card, CardContent } from "@core/ui/card";
import { SectionState } from "@core/ui/section-state";
import { Skeleton } from "@core/ui/skeleton";

// Route-level Suspense fallback for every (modules) segment. The real page
// varies (a list, a dashboard, a record) so this can only guess at the shared
// anatomy — a header, a card grid, a list — never the specific content.
// Composed entirely from the shared placeholder primitives (Skeleton /
// SectionState) so it carries the same static, non-pulsing fill steps as
// every other loading state in the product, and never drifts from what the
// loaded page will actually look like once the data lands.
export default function ModulesLoading() {
  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between gap-4 border-b border-nx-line pb-4">
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-12 w-12" />
          <div className="space-y-2">
            <Skeleton shape="title" />
            <Skeleton shape="text" className="w-72" />
          </div>
        </div>
        <Skeleton shape="control" className="w-28" />
      </div>

      {/* KPI / card grid skeleton */}
      <SectionState isLoading skeletonType="cards">
        {null}
      </SectionState>

      {/* Table / list skeleton */}
      <Card>
        <CardContent className="space-y-4">
          <Skeleton shape="title" className="w-36" />
          <SectionState isLoading skeletonType="rows" skeletonRows={5}>
            {null}
          </SectionState>
        </CardContent>
      </Card>
    </div>
  );
}
