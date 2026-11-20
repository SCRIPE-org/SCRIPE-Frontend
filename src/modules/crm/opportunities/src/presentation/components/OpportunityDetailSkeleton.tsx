"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { ActivityTimelineSkeleton } from "@modules/crm";

/** Loading skeleton placeholder for the Opportunity detail workspace. */
export function OpportunityDetailSkeleton() {
  return (
    <div className="space-y-4" data-testid="deal-detail-skeleton">
      <div className="flex items-center justify-between">
        <Skeleton shape="title" className="w-64 h-8" />
        <div className="flex gap-2">
          <Skeleton shape="control" className="w-28 h-8" />
          <Skeleton shape="control" className="w-28 h-8" />
        </div>
      </div>

      {/* 5-Stage Progression Bar Skeleton */}
      <Card className="p-4 border-nx-line bg-nx-surface space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </Card>

      {/* Deal Overview & Commercial Committee Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 border-nx-line bg-nx-surface space-y-3">
          <Skeleton className="h-4 w-44 rounded" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </Card>
        <Card className="p-5 border-nx-line bg-nx-surface space-y-3">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </Card>
      </div>

      {/* Activity Timeline Section */}
      <Card className="p-5 border-nx-line bg-nx-surface">
        <ActivityTimelineSkeleton />
      </Card>
    </div>
  );
}
