"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { ActivityTimelineSkeleton } from "@modules/crm";

export function LeadDetailSkeleton() {
  return (
    <div className="space-y-6" data-testid="lead-detail-skeleton">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-8 w-36 rounded-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* 5-Stage Lifecycle Progression Bar Skeleton */}
      <Card className="p-4 border-nx-line bg-nx-surface space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-64 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-lg" />
          ))}
        </div>
      </Card>

      {/* 2:1 Profile & Qualification Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 border-nx-line bg-nx-surface space-y-4">
          <Skeleton className="h-4 w-44 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </Card>
        <Card className="p-5 border-nx-line bg-nx-surface space-y-4">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-20 w-full rounded" />
          <Skeleton className="h-16 w-full rounded" />
        </Card>
      </div>

      {/* Activity Timeline Section */}
      <Card className="p-5 border-nx-line bg-nx-surface">
        <ActivityTimelineSkeleton />
      </Card>
    </div>
  );
}
