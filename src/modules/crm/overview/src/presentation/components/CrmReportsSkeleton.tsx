"use client";

import { Card } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";

export function CrmReportsSkeleton() {
  return (
    <div className="space-y-4" data-testid="crm-reports-skeleton">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-nx-lg border border-nx-line bg-nx-surface p-4 space-y-2.5">
            <Skeleton className="h-3.5 w-32 rounded" />
            <Skeleton className="h-7 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </Card>
        ))}
      </div>
      <Card className="rounded-nx-lg border border-nx-line bg-nx-surface p-5 space-y-3">
        <Skeleton className="h-4 w-48 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded" />
        ))}
      </Card>
    </div>
  );
}
